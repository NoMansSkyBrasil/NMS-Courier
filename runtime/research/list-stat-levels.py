"""List the levelled stats of the game (journey milestones and standings), as Markdown data tables.

Reads the converted levelled stats table, stat definitions and language files of the existing
corpus, read-only. A levelled stat has eleven levels, each reached at a value; the journey pages of
the game show them as medals, and the standing with a race or guild is one of them. Two tables:

  stat-levels.md    one row per levelled stat: the page of the desktop application that offers it
                    (standings or milestones), its section, its type, whether a request may raise
                    it, the eleven values and its title in the 14 interface languages;
  stat-sections.md  one row per section: its name in the 14 interface languages.

The titles and section names are the game's own texts. Which text names which stat is this
project's reading of the game's medal texts (TITLES and SECTIONS below), not something the tables
state; the stat table itself leaves most titles empty.

A stat of type Float keeps a fractional value; its levels are listed as the values themselves (all
whole in the game's table) and the application sends their 32-bit patterns. Not offered: stats
whose levels do not rise (the Nexus pair, which the game leaves at zero) and the tutorial stat.
"""
import argparse
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ElementTree

sys.path.insert(0, str(Path(__file__).resolve().parent))
import markdown_data  # noqa: E402

STATS = 'metadata/gamestate/stats/'
# Interface language and the name of the game's language files for it.
LANGUAGES = {'pt-BR': 'brazilianportuguese', 'pt-PT': 'portuguese', 'ja-JP': 'japanese', 'en-US': 'english',
             'fr-FR': 'french', 'it-IT': 'italian', 'de-DE': 'german', 'es-ES': 'spanish', 'nl-NL': 'dutch',
             'ko-KR': 'korean', 'pl-PL': 'polish', 'ru-RU': 'russian', 'zh-CN': 'simplifiedchinese',
             'zh-TW': 'traditionalchinese'}
# Section of the application's pages and the game text that names it.
SECTIONS = {'explore': 'UI_JM_TITLE_EXPLORE', 'survive': 'UI_JM_TITLE_SURVIVE', 'gek': 'UI_GUIDE_TRA_NAME',
            'vykeen': 'UI_GUIDE_WAR_NAME', 'korvax': 'UI_GUIDE_EXP_NAME', 'autophage': 'UI_GUIDE_BUI_NAME',
            'merchants': 'TRA_GUILD_NAME_L', 'mercenaries': 'WAR_GUILD_NAME_L', 'explorers': 'EXP_GUILD_NAME_L',
            'arena': 'PET_GUILD_NAME_L', 'outlaws': 'PIRATE_GUILD_NAME_L'}
# Stat: (section, game text of its title, or None to take the stat table's own title).
TITLES = {
    'ALIENS_MET': ('explore', None), 'WORDS_LEARNT': ('explore', None),
    'DIST_WARP': ('explore', None), 'DISC_ALL_CREATU': ('explore', None),
    'DISC_FLORA': ('explore', 'UI_MEDAL_PLANTS'), 'PROC_PRODS': ('explore', 'UI_MEDAL_PROC_PRODS'),
    'NANITES_EVER': ('explore', 'UI_MEDAL_NANITES'),
    'DIST_WALKED': ('survive', None), 'MONEY': ('survive', None), 'ENEMIES_KILLED': ('survive', None), 'SENTINEL_KILLS': ('survive', None),
    'LONGEST_LIFE_EX': ('survive', None), 'WALKERS_KILLED': ('survive', 'UI_MEDAL_WALKERS'),
    'FIENDS_KILLED': ('survive', 'UI_MEDAL_FIENDS'),
    'TRA_STANDING': ('gek', 'UI_MEDAL_STANDING'), 'TWORDS_LEARNT': ('gek', 'UI_MEDAL_WORDS'),
    'TSEEN_SYSTEMS': ('gek', 'UI_MEDAL_SYSTEMS'), 'TDONE_MISSIONS': ('gek', 'UI_MEDAL_MISSIONS'),
    'WAR_STANDING': ('vykeen', 'UI_MEDAL_STANDING'), 'WWORDS_LEARNT': ('vykeen', 'UI_MEDAL_WORDS'),
    'WSEEN_SYSTEMS': ('vykeen', 'UI_MEDAL_SYSTEMS'), 'WDONE_MISSIONS': ('vykeen', 'UI_MEDAL_MISSIONS'),
    'EXP_STANDING': ('korvax', 'UI_MEDAL_STANDING'), 'EWORDS_LEARNT': ('korvax', 'UI_MEDAL_WORDS'),
    'ESEEN_SYSTEMS': ('korvax', 'UI_MEDAL_SYSTEMS'), 'EDONE_MISSIONS': ('korvax', 'UI_MEDAL_MISSIONS'),
    'BUI_STANDING': ('autophage', 'UI_MEDAL_STANDING'), 'BWORDS_LEARNT': ('autophage', 'UI_MEDAL_WORDS'),
    'BDONE_MISSIONS': ('autophage', 'UI_MEDAL_MISSIONS'), 'DRONE_SHARDS': ('autophage', 'UI_MEDAL_DRONE_SHARDS'),
    'HEAD_REPAIRS': ('autophage', 'UI_MEDAL_HEAD_REPAIRS'),
    'TGUILD_STAND': ('merchants', 'UI_MEDAL_STANDING'), 'TGDONE_MISSIONS': ('merchants', 'UI_MEDAL_MISSIONS'),
    'PLANTS_PLANTED': ('merchants', 'UI_MEDAL_FARMING'),
    'WGUILD_STAND': ('mercenaries', 'UI_MEDAL_STANDING'), 'WGDONE_MISSIONS': ('mercenaries', 'UI_MEDAL_MISSIONS'),
    'PIRATES_KILLED': ('mercenaries', 'UI_MEDAL_PIRATES'),
    'EGUILD_STAND': ('explorers', 'UI_MEDAL_STANDING'), 'EGDONE_MISSIONS': ('explorers', 'UI_MEDAL_MISSIONS'),
    'RARE_SCANNED': ('explorers', 'UI_MEDAL_SCANNING'),
    'PIRATE_STAND': ('outlaws', 'UI_MEDAL_STANDING'), 'PIRATE_MISSIONS': ('outlaws', 'UI_MEDAL_MISSIONS'),
    'SMUGGLE_VALUE': ('outlaws', 'UI_MEDAL_SMUGGLE'), 'BOUNTIES': ('outlaws', 'UI_MEDAL_BOUNTIES'),
    'TRADERS_KILLED': ('outlaws', 'UI_MEDAL_SHIPKILL'), 'FPODS_BROKEN': ('outlaws', 'UI_MEDAL_FREIKILL'),
    'PB_WINS': ('arena', None), 'PB_BOSS_WINS': ('arena', None), 'PB_PETS_MAXED': ('arena', None),
    'PB_D_NEXUS': ('arena', None), 'EGGS_HATCHED': ('arena', None),
}
STANDINGS = ('TRA_STANDING', 'WAR_STANDING', 'EXP_STANDING', 'BUI_STANDING', 'TGUILD_STAND', 'WGUILD_STAND',
             'EGUILD_STAND', 'PIRATE_STAND')
LEVELS = 11
ENTRY = re.compile(r'<Property name="Id" value="([^"]+)" />(.*?)</Property>', re.S)
VALUE = re.compile(r'<Property name="\w+" value="([^"]+)" />')


def field(node, *names):
    for name in names:
        node = next(child for child in node if child.get('name') == name)
    return node


def strings(corpus, language, wanted):
    folder = next((corpus / 'archives').glob('NMSARC.MetadataEtc-*/language'))
    found = {}
    for path in sorted(folder.glob('nms_*_%s.MXML' % language)):
        for identifier, body in ENTRY.findall(path.read_text(encoding='utf-8')):
            if identifier in wanted and identifier not in found:
                value = VALUE.search(body)
                if value:
                    found[identifier] = (value.group(1).replace('&quot;', '"').replace('&apos;', "'")
                                         .replace('&amp;', '&').replace('|', '/').strip())
    return found


def source(corpus, name):
    found = sorted(corpus.glob('archives/*/' + STATS + name))
    if not found:
        raise SystemExit('missing ' + name)
    return ElementTree.parse(found[0]).getroot()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True, help='stat-levels.md')
    parser.add_argument('--sections', type=Path, required=True, help='stat-sections.md')
    args = parser.parse_args()
    types = {field(entry, 'Id').get('value'): field(entry, 'Type', 'StatType').get('value')
             for entry in field(source(args.corpus, 'statdefinitionstable.MXML'), 'StatDefinitionTable')}
    stats = []
    for entry in field(source(args.corpus, 'leveledstatstable.MXML'), 'LeveledStatTable'):
        stat = field(entry, 'StatId').get('value')
        values = [field(level, 'Value') for level in field(entry, 'StatLevels')]
        stats.append((stat, field(entry, 'StatTitle').get('value'), field(entry, 'StatMessageType').get('value'),
                      [int(field(value, 'IntValue').get('value')) for value in values],
                      [float(field(value, 'FloatValue').get('value')) for value in values]))
    wanted = set(SECTIONS.values())
    for stat, own_title, _, _, _ in stats:
        if stat in TITLES:
            wanted.add(TITLES[stat][1] or own_title)
    texts = {locale: strings(args.corpus, language, wanted) for locale, language in LANGUAGES.items()}
    for locale, found in texts.items():
        if wanted - set(found):
            raise SystemExit('%s lacks %s' % (locale, sorted(wanted - set(found))))
    rows, left_out = [], []
    for stat, own_title, message, levels, fractions in stats:
        if stat not in TITLES:
            left_out.append(stat)
            continue
        section, title = TITLES[stat]
        kind = types.get(stat, 'unknown')
        if kind == 'Float':
            whole = all(value == int(value) and value >= 0 for value in fractions)
            levels = [int(value) for value in fractions] if whole else levels
        else:
            whole = not any(fractions)
        rising = len(levels) == LEVELS and all(b >= a for a, b in zip(levels, levels[1:])) and levels[-1] > levels[0]
        reason = ('yes' if kind in ('Int', 'Float') and whole and rising
                  else 'fractional' if not whole or kind not in ('Int', 'Float') else 'no levels')
        rows.append([stat, 'standings' if stat in STANDINGS else 'milestones', section, kind, reason,
                     ' '.join(str(level) for level in levels), message, title or own_title]
                    + [texts[locale][title or own_title] for locale in LANGUAGES])
    markdown_data.write_table(
        args.output, 'Stat levels',
        'The levelled stats of the game table `leveledstatstable` that the desktop application offers: the stat, '
        'the page that offers it, its section (named in `stat-sections.md`), its type, whether a request may '
        'raise it (`yes`, or the reason it is not offered), the values of its eleven levels (level 0 first), how '
        'the game announces a new level (`StatMessageType`: `Full`, `Quick` or `Silent`, which shows nothing), the game text identifier of its title and '
        'its title in the 14 interface languages, from the game\'s language files. Generated by '
        '`list-stat-levels.py`, which also holds the reading that gives each stat its title and section; do not '
        'edit by hand. Levelled stats left out: %s.' % ', '.join(left_out),
        ['Stat', 'Page', 'Section', 'Type', 'Deliverable', 'Levels', 'Message', 'Text'] + list(LANGUAGES), rows)
    markdown_data.write_table(
        args.sections, 'Stat sections',
        'The sections of the standings and milestones pages of the desktop application and their names in the '
        '14 interface languages, from the game\'s language files. Generated by `list-stat-levels.py`; do not '
        'edit by hand.',
        ['Section'] + list(LANGUAGES),
        [[section] + [texts[locale][text] for locale in LANGUAGES] for section, text in SECTIONS.items()])
    print(len(rows), 'stats', sum(1 for row in rows if row[4] == 'yes'), 'deliverable; left out', left_out)


if __name__ == '__main__':
    main()
