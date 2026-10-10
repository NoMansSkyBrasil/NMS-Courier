"""List the missions of the game's mission tables, as one Markdown data table.

Reads the converted mission tables (metadata/simulation/missions/tables) and the language files of
the existing corpus, read-only. A mission is a sequence of stages; what a player calls a quest is
a title of the log, which one mission or several carry (ACT1_STEP10 and ACT1_STEP11 are both
"Ghosts in the Machine"), sometimes with untitled missions beside them. One row per mission: its
identifier, its table, its class, the quest it is filed under, the number of its stages and its
title in the 14 interface languages (empty when the mission has no title text).

The quest of a mission is this project's reading, not something the tables state: the mission
itself when it has a title, otherwise the titled mission of the same table whose identifier is the
longest beginning of this one's, otherwise none. Tables that are not play content are left out
(debug, deprecated, mod and the disabling conditions).
"""
import argparse
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ElementTree

sys.path.insert(0, str(Path(__file__).resolve().parent))
import markdown_data  # noqa: E402

TABLES = 'metadata/simulation/missions/tables'
LEFT_OUT = ('debugmissiontable', 'deprecatedmissiontable', 'modmissiontable', 'disablingconditionstable')
# Interface language and the name of the game's language files for it.
LANGUAGES = {'pt-BR': 'brazilianportuguese', 'pt-PT': 'portuguese', 'ja-JP': 'japanese', 'en-US': 'english',
             'fr-FR': 'french', 'it-IT': 'italian', 'de-DE': 'german', 'es-ES': 'spanish', 'nl-NL': 'dutch',
             'ko-KR': 'korean', 'pl-PL': 'polish', 'ru-RU': 'russian', 'zh-CN': 'simplifiedchinese',
             'zh-TW': 'traditionalchinese'}
ENTRY = re.compile(r'<Property name="Id" value="([^"]+)" />(.*?)</Property>', re.S)
VALUE = re.compile(r'<Property name="\w+" value="([^"]+)" />')
IDENTIFIER = re.compile(r'^[A-Z0-9_]{1,15}$')
TAGS = re.compile(r'<[^>]*>')


def field(node, name):
    return next((child for child in node if child.get('name') == name), None)


def strings(corpus, language, wanted):
    folder = next((corpus / 'archives').glob('NMSARC.MetadataEtc-*/language'))
    found = {}
    for path in sorted(folder.glob('nms_*_%s.MXML' % language)):
        for identifier, body in ENTRY.findall(path.read_text(encoding='utf-8')):
            if identifier in wanted and identifier not in found:
                value = VALUE.search(body)
                if value:
                    text = (value.group(1).replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"')
                            .replace('&apos;', "'").replace('&amp;', '&').replace('&#xA;', ' '))
                    text = ' '.join(TAGS.sub('', text).replace('|', '/').split())
                    if text:
                        found[identifier] = text
    return found


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    folder = sorted(args.corpus.glob('archives/*/' + TABLES))
    if not folder:
        raise SystemExit('missing ' + TABLES)
    missions, skipped, seen = [], 0, set()
    for path in sorted(folder[0].glob('*.MXML')):
        table = path.stem
        if table in LEFT_OUT:
            continue
        listed = field(ElementTree.parse(path).getroot(), 'Missions')
        for mission in listed if listed is not None else []:
            identifier = field(mission, 'MissionID').get('value')
            if not IDENTIFIER.match(identifier) or identifier in seen:
                skipped += 1
                continue
            seen.add(identifier)
            stages = field(mission, 'Stages')
            # Missions that must be complete before this one starts, from its starting conditions.
            after = []
            starting = field(mission, 'StartingConditions')
            for node in starting.iter('Property') if starting is not None else []:
                if node.get('name') == 'GcMissionConditionMissionCompleted':
                    needed = field(node, 'MissionID').get('value')
                    if IDENTIFIER.match(needed) and needed not in after:
                        after.append(needed)
            rewards = []
            for node in mission.iter('Property'):
                if node.get('name') == 'GcMissionSequenceReward':
                    reward = field(node, 'Reward').get('value')
                    if IDENTIFIER.match(reward) and reward not in rewards:
                        rewards.append(reward)
            missions.append([identifier, table, field(mission, 'MissionClass').get('value'),
                             field(field(mission, 'MissionTitles'), 'Format').get('value'),
                             field(field(mission, 'MissionSubtitles'), 'Format').get('value'),
                             len(stages) if stages is not None else 0, rewards, after,
                             field(mission, 'NextMissionHint').get('value'), field(mission, 'AutoStart').get('value'),
                             field(mission, 'MessageComplete').get('value')])
    wanted = {mission[3] for mission in missions if mission[3]} | {mission[4] for mission in missions if mission[4]}
    texts = {locale: strings(args.corpus, language, wanted) for locale, language in LANGUAGES.items()}
    titled = {mission[0] for mission in missions if mission[3] in texts['en-US']}
    rows = []
    for identifier, table, kind, title, subtitle, stages, rewards, after, following, auto, message in missions:
        quest = identifier if identifier in titled else ''
        if not quest:
            heads = [other[0] for other in missions
                     if other[1] == table and other[0] in titled and identifier.startswith(other[0] + '_')]
            quest = max(heads, key=len) if heads else ''
        rows.append([identifier, table, kind, quest, str(stages), ' '.join(rewards), ' '.join(after),
                     following if IDENTIFIER.match(following) else '', auto, message]
                    + [texts[locale].get(title, texts['en-US'].get(title, '')) for locale in LANGUAGES]
                    + [texts[locale].get(subtitle, texts['en-US'].get(subtitle, '')) for locale in LANGUAGES])
    markdown_data.write_table(
        args.output, 'Missions',
        'The missions of the game\'s mission tables: the mission, its table, its class, the quest it is filed '
        'under (a titled mission; this project\'s reading by identifier, empty when none), the number of its '
        'stages, the reward table entries its stages hand over (`GcMissionSequenceReward`, in order, each once), '
        'the missions its starting conditions require complete (`GcMissionConditionMissionCompleted`), the '
        'mission its `NextMissionHint` names, when the game starts it by itself (`AutoStart`), whether the '
        'game announces its completion (`MessageComplete`) '
        'and its title and then its subtitle in the 14 interface languages, from the game\'s language files (empty when the '
        'mission has no title text). %d missions, %d with a title, %d filed under another mission\'s quest. '
        'Left out: the tables %s and %d entries whose identifier is not 1 to 15 capitals, digits and '
        'underscores or is repeated. Generated by `list-missions.py`; do not edit by hand.'
        % (len(rows), len(titled), sum(1 for row in rows if row[3] and row[3] != row[0]), ', '.join(LEFT_OUT), skipped),
        ['Mission', 'Table', 'Class', 'Quest', 'Stages', 'Rewards', 'After', 'Next', 'Auto', 'Message']
        + list(LANGUAGES)
        + ['Subtitle ' + locale for locale in LANGUAGES], rows)
    print(len(rows), 'missions', len(titled), 'titled', 'skipped', skipped)


if __name__ == '__main__':
    main()
