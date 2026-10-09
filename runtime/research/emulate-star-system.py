"""Generate a star system from its address by running the game's own generator in an emulator.

Research tool. It does not start or touch the game: it maps NMS.exe into the Unicorn emulator and
calls the star system generator, using the emulator harness of NMS Shipwright
(https://github.com/S-T-0-7/NMS-Shipwright, MIT licence, by Shikhar Tiwari), which is not part of
this repository. Clone it next to the research tools and pass its folder:

    emulate-star-system.py --shipwright <clone> --game <game folder> system 0x0001DB00F769C14E
    emulate-star-system.py --shipwright <clone> --game <game folder> draws 0x0001DB00F769C14E
    emulate-star-system.py --shipwright <clone> --game <game folder> survey 0x0001DB00F769C14E 200

`system` prints the ships the game generates for the address. `draws` lists every instruction
that advances the system's number stream and the stream position it reaches. `survey` walks the
star systems of the address's region and prints one line per system with the layout of its draws,
which is what a hand port of the generator is checked against.

Needs the Python packages unicorn, pefile and hgpaktool (see docs/SEED_ORIGINS.md for the folder
they are kept in). Checked against two live readings of build 180836 on 2026-10-09.
"""
import argparse
import os
import sys

MULTIPLIER = 0x5A76F899
MASK32 = (1 << 32) - 1
IMAGE_BASE = 0x140000000
STREAM_WORD = 0x510  # low word of the generator's stream state, in the generator object


def stream_positions(seed, count):
    """Low word after each step -> number of steps taken."""
    low = seed & MASK32
    carry = (((low >> 16) | (low << 16)) & MASK32) ^ (seed >> 32) ^ low
    low = low or 1
    table = {}
    for position in range(1, count + 1):
        product = low * MULTIPLIER + carry
        low, carry = product & MASK32, product >> 32
        table.setdefault(low, position)
    return table


class Tracer:
    def __init__(self, generator):
        from unicorn import UC_HOOK_MEM_WRITE
        from unicorn import x86_const

        self.generator = generator
        self.events = []
        self.register = x86_const.UC_X86_REG_RIP
        word = generator.gen + STREAM_WORD
        generator.e.mu.hook_add(UC_HOOK_MEM_WRITE, self.on_write, begin=word, end=word + 3)

    def on_write(self, emulator, access, address, size, value, _):
        self.events.append((emulator.reg_read(self.register) - IMAGE_BASE, value & MASK32))

    def system(self, address):
        """The generated system and the runs of consecutive stream writes by one instruction:
        (instruction, [positions]); a position is None for a value that is not on the stream
        (the state being set, not stepped)."""
        self.events.clear()
        result = self.generator.system(address)
        table = stream_positions(address, 20000)
        runs = []
        for instruction, value in self.events:
            position = table.get(value)
            if runs and runs[-1][0] == instruction:
                runs[-1][1].append(position)
            else:
                runs.append((instruction, [position]))
        return result, runs


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--shipwright', required=True, help='folder of a clone of NMS Shipwright')
    parser.add_argument('--game', required=True, help="the game's folder")
    parser.add_argument('--libraries', help='folder holding unicorn, pefile and hgpaktool, if not installed')
    parser.add_argument('--cache', help='folder for the files the harness extracts from the game')
    parser.add_argument('command', choices=('system', 'draws', 'survey'))
    parser.add_argument('address', help='universe address of the system (its seed), hexadecimal')
    parser.add_argument('count', nargs='?', type=int, default=50, help='survey: number of systems')
    args = parser.parse_args()
    if args.libraries:
        sys.path.insert(0, args.libraries)
    sys.path.insert(0, args.shipwright)
    os.environ['NMS_DIR'] = args.game
    if args.cache:
        os.environ['NMS_TOOL_CACHE'] = args.cache
    from nms_procgen.systemgen import SystemGen

    address = int(args.address, 16)
    generator = SystemGen()
    if args.command == 'system':
        result = generator.system(address)
        print('system 0x%016X: planets %s, moons %s, race %s' % (address, result['planets'], result['moons'], result['race']))
        for index, ship in enumerate(result['ships']):
            print('%2d class %2d role %d seed 0x%016X %s' % (index + 1, ship['class'], ship['role'], ship['seed'], ship['type']))
        return
    tracer = Tracer(generator)
    if args.command == 'draws':
        result, runs = tracer.system(address)
        for instruction, positions in runs:
            known = [p for p in positions if p is not None]
            print('%7x x%-3d %s' % (instruction, len(positions), '%d..%d' % (known[0], known[-1]) if known else 'state set'))
        return
    # survey: the systems of the region, by system index
    region = address & 0xFFFFFFFFFF
    print('| System | Planets | Moons | Ships | Stream writes before the ships: instruction x count @ last position |')
    print('| --- | --- | --- | --- | --- |')
    for index in range(1, args.count + 1):
        system = region | (index << 40)
        try:
            result, runs = tracer.system(system)
        except RuntimeError as error:
            print('| `0x%016X` | failed: %s |' % (system, error))
            continue
        if not result['ships']:
            continue
        # after the last state set, up to the first ship
        start = max((i for i, (_, positions) in enumerate(runs) if positions[0] is None), default=-1) + 1
        cells = []
        for instruction, positions in runs[start:]:
            cells.append('%x x%d @%s' % (instruction, len(positions), positions[-1]))
        print('| `0x%016X` | %s | %s | %d | %s |' % (system, result['planets'], result['moons'], len(result['ships']), '; '.join(cells)))


if __name__ == '__main__':
    main()
