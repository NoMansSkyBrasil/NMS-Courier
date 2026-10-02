"""Check arithmetic boundaries and optionally replay audited assembly instructions."""
import argparse
import json
from pathlib import Path
import random
import runpy
import unittest

core = runpy.run_path(str(Path(__file__).with_name('procedural-seed-primitives.py')))


class PrimitiveTests(unittest.TestCase):
    def test_seed_boundaries_and_high_word(self):
        self.assertEqual(core['seed_state'](0), (1, 0))
        self.assertEqual(core['seed_state'](1), (1, 0x10001))
        self.assertEqual(core['seed_state'](1 << 32), (1, 1))
        self.assertEqual(core['seed_state']((1 << 64) - 1), (0xffffffff, 0xffffffff))
        self.assertEqual(core['seed_state'](0x123456789abcdef0, False), (1, 0))
        for value in (-1, 1 << 64):
            with self.assertRaises(ValueError):
                core['seed_state'](value)

    def test_multiply_carry_boundaries(self):
        self.assertEqual(core['advance']((1, 0)), ((0x5a76f899, 0), 0x5a76f899))
        self.assertEqual(core['advance']((0xffffffff, 0xffffffff)),
                         ((0xa5890766, 0x5a76f899), 0xa5890766))
        with self.assertRaises(ValueError):
            core['advance']((1 << 32, 0))

    def test_distinct_seeds_can_initialize_the_same_descriptor_state(self):
        left = core['seed_state'](0)
        right = core['seed_state'](0x1000100000001)
        self.assertEqual(left, right)
        for _ in range(100):
            left, draw_left = core['advance'](left)
            right, draw_right = core['advance'](right)
            self.assertEqual(draw_left, draw_right)
        # This is a collision in this descriptor initializer, not a claim that
        # other appearance inputs/palette paths necessarily collide as well.

    def test_zero_weight_and_single_choice_draw_consumption(self):
        state = (1, 0)
        self.assertEqual(core['choose_unfiltered'](state, ['xNEVER']), (state, None))
        self.assertEqual(core['choose_unfiltered'](state, ['normal']), ((0x5a76f899, 0), 0))
        self.assertEqual(core['option_weight']('xRARE xNEVER'), 1)
        self.assertEqual(core['option_weight']('xWEIRD'), 20)
        self.assertEqual(core['choose_unfiltered'](state, ['xNEVER', 'normal'])[1], 1)


class InstructionReplay:
    """Small fail-closed interpreter; never executes native machine code."""
    def __init__(self, registers=None, memory=None):
        self.registers = registers or {}
        self.memory = memory or {}
        self.zero = False

    def register(self, name):
        if name == 'al':
            return 'rax', 8
        if name.startswith('e'):
            return 'r' + name[1:], 32
        if name.startswith('r') and name.endswith('d'):
            return name[:-1], 32
        return name, 64

    def read(self, operand):
        if ' ptr ' in operand:
            if operand not in self.memory:
                raise ValueError('Uninitialized replay memory: ' + operand)
            return self.memory[operand]
        try:
            return int(operand, 0)
        except ValueError:
            register, width = self.register(operand)
            return self.registers.get(register, 0) & ((1 << width) - 1)

    def write(self, operand, value):
        if ' ptr ' in operand:
            width = {'byte': 8, 'dword': 32, 'qword': 64}[operand.split()[0]]
            self.memory[operand] = value & ((1 << width) - 1)
        else:
            register, width = self.register(operand)
            value &= (1 << width) - 1
            if width == 8:
                value |= self.registers.get(register, 0) & ~255
            self.registers[register] = value

    def execute(self, instruction):
        op = instruction['mnemonic']
        args = instruction['operands'].split(', ')
        if op in ('mov', 'movabs', 'movsxd'):
            value = self.read(args[1])
            if op == 'movsxd' and value & (1 << 31):
                value -= 1 << 32
            self.write(args[0], value)
        elif op == 'lea':
            # In the selected arithmetic window, RSI receives a resource literal
            # but is not consumed by any arithmetic/output under test.
            if args[0] != 'rsi':
                raise ValueError('Unexpected LEA in arithmetic window')
        elif op == 'test':
            self.zero = self.read(args[0]) & self.read(args[1]) == 0
        elif op == 'sete':
            self.write(args[0], int(self.zero))
        elif op in ('add', 'xor', 'or', 'shr', 'shl', 'ror', 'imul'):
            a = self.read(args[1] if len(args) == 3 else args[0])
            b = self.read(args[2] if len(args) == 3 else args[1])
            if op == 'add': value = a + b
            elif op == 'xor': value = a ^ b
            elif op == 'or': value = a | b
            elif op == 'shr': value = a >> b
            elif op == 'shl': value = a << b
            elif op == 'ror':
                _, width = self.register(args[0])
                value = (a >> b) | (a << (width - b))
            else: value = a * b
            self.write(args[0], value)
        else:
            raise ValueError('Unsupported replay instruction: ' + op)


def replay(files):
    if len(files) > 4 or any(path.stat().st_size > 8 * 1024 * 1024 for path in files):
        raise ValueError('Assembly report count/size budget exceeded')
    reports = [json.loads(path.read_text(encoding='utf-8')) for path in files]
    expected_hash = '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4'
    if any(report['exe_sha256'] != expected_hash for report in reports):
        raise ValueError('Assembly report fingerprint mismatch')
    instructions = {int(i['rva'], 16): i for report in reports for f in report['fragments'] for i in f['instructions']}

    def window(begin, end):
        selected = [instructions[address] for address in sorted(instructions) if begin <= address <= end]
        if not selected or int(selected[0]['rva'], 16) != begin or int(selected[-1]['rva'], 16) != end:
            raise ValueError('Incomplete assembly replay window')
        for left, right in zip(selected, selected[1:]):
            if int(left['rva'], 16) + len(bytes.fromhex(left['bytes'])) != int(right['rva'], 16):
                raise ValueError('Discontinuous assembly replay window')
        return selected

    initial = window(0x2d63c22, 0x2d63c46)
    draw = window(0x2d67c4f, 0x2d67c79)
    child = window(0x2d63f70, 0x2d63ff1)
    rng = random.Random(180383)
    seeds = [0, 1, 1 << 32, (1 << 64) - 1, 0x1ad0003900054] + [rng.getrandbits(64) for _ in range(1000)]
    for seed in seeds:
        machine = InstructionReplay(memory={'qword ptr [r9]': seed})
        for instruction in initial: machine.execute(instruction)
        state = machine.memory['dword ptr [rsp + 0x70]'], machine.memory['dword ptr [rsp + 0x74]']
        assert state == core['seed_state'](seed), hex(seed)
        machine = InstructionReplay(registers={'r10': 41, 'r11': 3}, memory={'dword ptr [r8]': state[0], 'dword ptr [r8 + 4]': state[1]})
        for instruction in draw: machine.execute(instruction)
        expected, value = core['advance'](state)
        assert (machine.memory['dword ptr [r8]'], machine.memory['dword ptr [r8 + 4]']) == expected
        assert machine.registers['r12'] == value * 41 >> 32
        machine = InstructionReplay(registers={'r15': state[0], 'r12': state[1]})
        for instruction in child: machine.execute(instruction)
        expected, value = core['child_seed'](state)
        assert (machine.memory['dword ptr [rsp + 0x70]'], machine.memory['dword ptr [rsp + 0x74]']) == expected
        assert machine.registers['rax'] == value, hex(seed)
    print(json.dumps({'assembly_replay_cases': len(seeds), 'windows_per_case': 3, 'runtime_verified': False}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--assembly', type=Path, action='append', default=[])
    args = parser.parse_args()
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(PrimitiveTests)
    if not unittest.TextTestRunner().run(suite).wasSuccessful():
        raise SystemExit(1)
    if args.assembly:
        replay(args.assembly)
