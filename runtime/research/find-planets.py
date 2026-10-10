"""Find planets by what they are like, by running the game's own generators in an emulator.

Research tool for build 180836. It does not start or touch the game. It uses the emulator harness
of NMS Shipwright (https://github.com/S-T-0-7/NMS-Shipwright, MIT licence, by Shikhar Tiwari),
which is not part of this repository, to run the star system generator for an address, and then
runs the game's full planet routine (16a7880) for each planet up to the end of its weather part,
with the game's real creature, biome and weather files loaded where the routine expects them.

    find-planets.py --shipwright <clone> --game <game folder> --corpus <archive folder> \
        tally 0x0001DB00F769C14E 3000
    find-planets.py ... find 0x0001DB00F769C14E 3000 --output planets.md

`--corpus` is the folder of the extracted game archive that holds `metadata/simulation`
(`NMSARC.Precache-…` of the research corpus). `tally` counts what the lush planets of the walked
systems are like; `find` lists the planets that pass the "Earth-like" test below, with their portal
addresses, as a Markdown data table.

What the harness alone does not do, and this tool adds (docs/PLANET_FINDER_NOTES.md):
  - the routine asks the system again for the planet's biome subtype (16a3a50), which does not work
    in the emulator; the subtype is taken from the generated system record instead;
  - the fauna chances (GcCreatureGenerationData at planet generator +0x50), the biome files of each
    biome (+0x90 onwards) and the weather files with their count (+0x508, +0x504) are loaded;
  - the scrap chance table read through the generator's first pointer is a blank block; it only
    feeds HasScrap.

Earth-like here: biome Lush; subtype Standard, HighQuality, Worlds or HugeLush; no storms; not
extreme; sentinel level Low at the normal difficulty preset. Not compared with the game yet.
"""
import argparse
import os
import struct
import sys
import time
import xml.etree.ElementTree as ElementTree
from collections import Counter
from pathlib import Path

BASE = 0x140000000
PLANET_ROUTINE, AFTER_WEATHER, SUBTYPE_ROUTINE = BASE + 0x16A7880, BASE + 0x16A7AD4, BASE + 0x16A3A50
# GcSolarSystemData: planet counts and the planet input records (0x58 bytes, Seed at +0x20).
PLANETS, PRIME_PLANETS, INPUTS, INPUT_SIZE = 0x2544, 0x2548, 0x2180, 0x58
# GcPlanetData as the routine fills it.
BIOME, SUBTYPE, WEATHER_TYPE, STORMS, EXTREME = 0x32B8, 0x32BC, 0x1E54, 0x1E48, 0x1E50
SENTINEL_NORMAL, LIFE, CREATURE_LIFE = 0x34B8 + 2 * 0x18 + 0x14, 0x3538, 0x352C
# Enum names read from the executable's metadata.
BIOMES = ('Lush Toxic Scorched Radioactive Frozen Barren Dead Weird Red Green Blue Test Swamp Lava Waterworld '
          'GasGiant All').split()
SUBTYPES = ('None Standard HighQuality Structure Beam Hexagon FractCube Bubble Shards Contour Shell BoneSpire '
            'WireCell HydroGarden HugePlant HugeLush HugeRing HugeRock HugeScorch HugeToxic Variant_A Variant_B '
            'Variant_C Variant_D Infested Swamp Lava Worlds Remix_A Remix_B Remix_C Remix_D').split()
WEATHER = ('Clear Dust Humid Snow Toxic Scorched Radioactive RedWeather GreenWeather BlueWeather Swamp Lava '
           'Bubble Weird Fire ClearCold GasGiant').split()
SENTINELS = 'Low Default Aggressive Corrupt'.split()
# The storm field has no enum in the metadata; the routine writes 0 to 3, taken as these.
STORM_NAMES = 'None Low High Always'.split()
GOOD_SUBTYPES = ('Standard', 'HighQuality', 'Worlds', 'HugeLush')


def name(names, value):
    return names[value] if 0 <= value < len(names) else str(value)


class Planets:
    def __init__(self, corpus):
        from nms_procgen.systemgen import SystemGen
        self.generator = generator = SystemGen()
        e = generator.e
        solar = corpus / 'metadata' / 'simulation' / 'solarsystem'

        def game_file(listed):
            return corpus.joinpath(*listed.lower().replace('.mxml', '.mbin').split('/'))

        self.creature = e.load_mbin(str(corpus / 'metadata' / 'simulation' / 'ecosystem' / 'creaturegenerationdata.mbin'))
        self.biome_files = []
        for biome in next(iter(ElementTree.parse(solar / 'biomes' / 'biomefilenames.MXML').getroot())):
            options = [o for o in biome.iter('Property') if o.get('value') == 'GcBiomeFileListOption']
            array = e.alloc(8 * max(64, len(options)))
            for index, option in enumerate(options):
                path = game_file(next(c.get('value') for c in option if c.get('name') == 'Filename'))
                e.wq(array + 8 * index, e.load_mbin(str(path)) if path.exists() else 0)
            self.biome_files.append((array, len(options)))
        listed = [c.get('value') for c in next(iter(ElementTree.parse(solar / 'weather' / 'weatherlist.MXML').getroot()))]
        self.weather = e.alloc(8 * 32)
        self.weather_count = len(listed)
        for index, entry in enumerate(listed):
            e.wq(self.weather + 8 * index, e.load_mbin(str(game_file(entry))))
        self.blank = e.alloc(0x4000)
        e.mu.mem_write(self.blank, bytes(0x4000))
        # The subtype routine is replaced once by "mov rax, [cell]; ret".
        self.cell = e.alloc(16)
        e.mu.mem_write(SUBTYPE_ROUTINE, bytes([0x48, 0xA1]) + struct.pack('<Q', self.cell) + bytes([0xC3]))
        generator.mark = e.heap  # keep these tables across the harness's reset for each system

    def of_system(self, address):
        """One dictionary a planet of the system, or None when the address has no system."""
        generator = self.generator
        e, owner, pg = generator.e, generator.owner, generator.pg
        try:
            info = generator.system(address)
        except RuntimeError:
            return None
        if not info.get('region_valid'):
            return None
        e.wq(pg + 0x50, self.creature)
        for biome, (array, length) in enumerate(self.biome_files):
            e.wq(pg + (biome + 9) * 16, array)
            e.wi(pg + (biome + 9) * 16 + 8, length)
        e.wi(pg + 0x504, self.weather_count)
        e.wq(pg + 0x508, self.weather)
        if e.rq(pg) == 0:
            e.wq(pg, self.blank)
        planets = []
        for index in range(e.ri(owner + PLANETS) + e.ri(owner + PRIME_PLANETS)):
            record = owner + INPUTS + INPUT_SIZE * index
            e.wq(self.cell, e.ri(record + 0x34))
            given = e.alloc(0x100)
            e.wq(given, address | (index + 1) << 52)
            e.wq(given + 8, e.rq(record + 0x20))
            e.wq(given + 0x10, e.ri(record + 0x30) | e.ri(record + 0x38) << 16)
            e.wi(given + 0x30, 2)
            out = e.alloc(0x4000, 0x100)
            e.mu.mem_write(out, bytes(0x4000))
            if not e.call(PLANET_ROUTINE, pg, out, given, until=AFTER_WEATHER)['ok']:
                planets.append(None)
                continue
            planets.append({'planet': index + 1, 'biome': name(BIOMES, e.ri(out + BIOME)),
                            'subtype': name(SUBTYPES, e.ri(out + SUBTYPE)),
                            'weather': name(WEATHER, e.ri(out + WEATHER_TYPE)),
                            'storms': name(STORM_NAMES, e.ri(out + STORMS)), 'extreme': e.ri(out + EXTREME) != 0,
                            'sentinels': name(SENTINELS, e.ri(out + SENTINEL_NORMAL)),
                            'flora': e.ri(out + LIFE), 'fauna': e.ri(out + CREATURE_LIFE), 'race': info['race']})
        return planets


def walk(address, count):
    """Addresses of `count` systems: the systems of the address's region, then of the next regions along X."""
    for step in range(count):
        system = (step % 0x2FF) + 1
        x = ((address & 0xFFF) + step // 0x2FF) & 0xFFF
        yield (address & ~(0xFFF << 40) & ~0xFFF) | (system << 40) | x


def earth_like(planet):
    return (planet['biome'] == 'Lush' and planet['subtype'] in GOOD_SUBTYPES and planet['storms'] == 'None'
            and not planet['extreme'] and planet['sentinels'] == 'Low')


def glyphs(address, planet):
    return '%X%03X%02X%03X%03X' % (planet, (address >> 40) & 0xFFF, (address >> 24) & 0xFF,
                                   (address >> 12) & 0xFFF, address & 0xFFF)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--shipwright', required=True, help='folder of a clone of NMS Shipwright')
    parser.add_argument('--game', required=True, help="the game's folder")
    parser.add_argument('--corpus', required=True, type=Path, help='extracted archive holding metadata/simulation')
    parser.add_argument('--libraries', help='folder holding unicorn, pefile and hgpaktool, if not installed')
    parser.add_argument('--cache', help='folder for the files the harness extracts from the game')
    parser.add_argument('--output', type=Path, help='find: Markdown data table to write')
    parser.add_argument('command', choices=('tally', 'find'))
    parser.add_argument('address', help='universe address to start from, hexadecimal')
    parser.add_argument('count', type=int, help='number of systems to walk')
    args = parser.parse_args()
    if args.libraries:
        sys.path.insert(0, args.libraries)
    sys.path.insert(0, args.shipwright)
    os.environ['NMS_DIR'] = args.game
    if args.cache:
        os.environ['NMS_TOOL_CACHE'] = args.cache
    planets = Planets(args.corpus)
    start, started = int(args.address, 16), time.time()
    systems = failed = total = 0
    tally, found = Counter(), []
    for address in walk(start, args.count):
        listed = planets.of_system(address)
        if listed is None:
            continue
        systems += 1
        good_here = sum(1 for planet in listed if planet and earth_like(planet))
        for planet in listed:
            if planet is None:
                failed += 1
                continue
            total += 1
            tally['biome', planet['biome']] += 1
            if planet['biome'] != 'Lush':
                continue
            for key in ('subtype', 'weather', 'storms', 'extreme', 'sentinels', 'flora', 'fauna'):
                tally[key, planet[key]] += 1
            if earth_like(planet):
                found.append([glyphs(address, planet['planet']), '0x%016X' % address, str(planet['planet']),
                              str(len(listed)), planet['subtype'], planet['weather'], planet['race'], str(good_here)])
    print('%d systems, %d planets, %d failed, %d Earth-like, %.0f s' % (systems, total, failed, len(found), time.time() - started))
    if args.command == 'tally':
        for (key, value), number in sorted(tally.items(), key=lambda item: (item[0][0], -item[1])):
            print('%-10s %-14s %d' % (key, value, number))
        return
    if args.output:
        sys.path.insert(0, str(Path(__file__).resolve().parent))
        import markdown_data
        markdown_data.write_table(
            args.output, 'Planet candidates',
            'Earth-like planets found by `find-planets.py` (the game\'s generators run in an emulator, build '
            '180836) in %d systems walked from `0x%016X`: portal address (planet, system, Y, Z, X), system '
            'address, planet number, planets in the system, biome subtype, weather, the system\'s race and the '
            'number of Earth-like planets in that system. Earth-like: Lush; subtype %s; no storms; not extreme; '
            'sentinel level Low. NOT compared with the game yet; do not edit by hand.'
            % (systems, start, ', '.join(GOOD_SUBTYPES)),
            ['Portal', 'System', 'Planet', 'Planets', 'Subtype', 'Weather', 'Race', 'Earth-like in system'], found)
    for row in found[:20]:
        print('  '.join(row))


if __name__ == '__main__':
    main()
