"""Check arithmetic boundaries and optionally replay audited assembly instructions."""
import argparse
import json
from pathlib import Path
import random
import runpy
import unittest

core = runpy.run_path(str(Path(__file__).with_name('procedural-seed-primitives.py')))


class PrimitiveTests(unittest.TestCase):
    def test_palette_lookup_preserves_valid_cells_and_bounds_retry_indices(self):
        lookup = core['palette_lookup_index']
        expected = {'_1': {0}, '_4': {0, 4, 32, 36}, '_8': set(range(8)),
                    '_16': set(range(0, 8, 2)) | set(range(16, 24, 2)) |
                           set(range(32, 40, 2)) | set(range(48, 56, 2)),
                    'All': set(range(64))}
        for mode, cells in expected.items():
            self.assertEqual({lookup(i, mode) for i in range(64)}, cells)
            self.assertTrue(all(lookup(cell, mode) == cell for cell in cells))
        for invalid in (-1, 64):
            with self.assertRaises(ValueError):
                lookup(invalid, 'All')

    def test_palette_modes_select_the_expected_grid_cells(self):
        draw = core['palette_index_from_draws']
        for mode, maximum in (('_1', 0), ('_4', 36), ('_8', 7), ('_16', 54), ('All', 63)):
            self.assertEqual(draw(0, 0, mode), 0)
            self.assertEqual(draw(0xffffffff, 0xffffffff, mode), maximum)
        self.assertEqual(draw(0xe0000000, 0x20000000, 'All'), 57)
        self.assertEqual(draw(0xe0000000, 0x20000000, '_8'), 1)
        with self.assertRaises(ValueError):
            draw(0, 0, 'Inactive')
        with self.assertRaises(ValueError):
            draw(-1, 0, 'All')

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
            if args[1] == '[rbx + r8*8]':
                self.write(args[0], self.read('rbx') + self.read('r8') * 8)
            elif args[1] == '[rax + rax]':
                self.write(args[0], self.read('rax') * 2)
            elif args[0] != 'rsi':
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


def replay_palette(path):
    if path.stat().st_size > 8 * 1024 * 1024:
        raise ValueError('Palette assembly report exceeds size budget')
    report = json.loads(path.read_text(encoding='utf-8'))
    if report['exe_sha256'] != '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4':
        raise ValueError('Palette assembly fingerprint mismatch')
    instructions = {int(i['rva'], 16): i for fragment in report['fragments'] for i in fragment['instructions']}

    def window(begin, end):
        selected = [instructions[address] for address in sorted(instructions) if begin <= address <= end]
        if not selected or int(selected[0]['rva'], 16) != begin or int(selected[-1]['rva'], 16) != end:
            raise ValueError('Incomplete palette assembly window')
        for left, right in zip(selected, selected[1:]):
            if int(left['rva'], 16) + len(bytes.fromhex(left['bytes'])) != int(right['rva'], 16):
                raise ValueError('Discontinuous palette assembly window')
        return selected

    draw = window(0x62cc84, 0x62ccbb)
    modes = {'_1': window(0x62ccdb, 0x62ccdb), '_4': window(0x62cce4, 0x62ccef),
             '_8': [], '_16': window(0x62ccfe, 0x62cd07), 'All': window(0x62cd0c, 0x62cd0c)}
    rng = random.Random(180383)
    for _ in range(1000):
        state = rng.getrandbits(32), rng.getrandbits(32)
        machine = InstructionReplay(memory={'dword ptr [rdx]': state[0], 'dword ptr [rdx + 4]': state[1],
                                           'qword ptr [rsp + 0x118]': 0})
        for instruction in draw:
            machine.execute(instruction)
        next_state, _ = core['advance'](state)
        next_state, second = core['advance'](next_state)
        assert (machine.memory['dword ptr [rcx]'], machine.memory['dword ptr [rcx + 4]']) == next_state
        assert machine.registers['rbx'] & 0xffffffff == second
    for row in range(8):
        for column in range(8):
            for mode, selected in modes.items():
                machine = InstructionReplay(registers={'r8': row, 'rbx': column})
                for instruction in selected:
                    machine.execute(instruction)
                assert machine.registers['rbx'] == core['palette_index_from_draws'](row << 29, column << 29, mode)
    print(json.dumps({'palette_draw_replays': 1000, 'palette_index_replays': 320,
                      'rgba_replayed': False, 'runtime_verified': False}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--assembly', type=Path, action='append', default=[])
    parser.add_argument('--palette-assembly', type=Path)
    args = parser.parse_args()
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(PrimitiveTests)
    if not unittest.TextTestRunner().run(suite).wasSuccessful():
        raise SystemExit(1)
    if args.assembly:
        replay(args.assembly)
    if args.palette_assembly:
        replay_palette(args.palette_assembly)
