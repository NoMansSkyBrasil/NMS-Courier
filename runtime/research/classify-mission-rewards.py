"""Classify the reward table entries the game's missions hand over.

A mission stage names reward entries (`missions.md`, column Rewards), defined in the game's reward
table or in the mission table itself. An entry is a
list of rewards, each of one reward class. Some classes hand the player something (a product, a
substance, money, a blueprint); others steer the game (start a mission, open a screen, set a
state) and must never be given outside the mission that owns them. This lists every entry the
missions use with the classes inside it and says whether every one of them only hands something
over.

Usage:
    python classify-mission-rewards.py <extracted archive holding metadata/reality/tables> <output.md>
"""
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import markdown_data  # noqa: E402

# Classes that only put something in the player's hands or knowledge. Anything else makes the whole
# entry "internal". Adding a class here is a decision to let the application give it; keep it short.
HANDS_OVER = {
    'GcRewardSpecificProduct', 'GcRewardSpecificSubstance', 'GcRewardMoney', 'GcRewardMultiSpecificItems',
    'GcRewardSpecificProductRecipe', 'GcRewardSpecificTech', 'GcRewardSpecificTechRecipe',
    'GcRewardSpecificSpecial', 'GcRewardProduct', 'GcRewardSubstance', 'GcRewardProceduralProduct',
    'GcRewardProcTechProduct', 'GcRewardSpecificTechFromList', 'GcRewardProductRecipeFromList',
    'GcRewardSpecificProductFromList', 'GcRewardTeachWord', 'GcRewardTeachSpecificWords',
    'GcRewardMultiSpecificProductRecipes', 'GcRewardMultiSpecificTechRecipes', 'GcRewardMultiSpecificProducts',
    'GcRewardSpecificProductRecipeFromList',
}


def entries(path):
    """Reward identifier -> the reward classes of its list, in order."""
    found = {}
    for entry in ET.parse(path).getroot().iter('Property'):
        if entry.get('value') != 'GcGenericRewardTableEntry':
            continue
        identifier = next((c.get('value') for c in entry if c.get('name') == 'Id'), None)
        if not identifier:
            continue
        classes = [node.get('value') for node in entry.iter('Property')
                   if node.get('name') == 'Reward' and (node.get('value') or '').startswith('GcReward')]
        found[identifier] = classes
    return found


def main():
    corpus, output = Path(sys.argv[1]), Path(sys.argv[2])
    table = entries(corpus / 'metadata' / 'reality' / 'tables' / 'rewardtable.MXML')
    # A mission table carries reward entries of its own, beside the game's reward table.
    for path in sorted((corpus / 'metadata' / 'simulation' / 'missions' / 'tables').glob('*.MXML')):
        for identifier, classes in entries(path).items():
            table.setdefault(identifier, classes)
    header, rows = markdown_data.read_table(Path(__file__).resolve().parent / 'missions.md')
    used = {}
    for row in rows:
        for identifier in row[header.index('Rewards')].split():
            used.setdefault(identifier, []).append(row[0])
    out = []
    for identifier in sorted(used):
        classes = table.get(identifier)
        if classes is None:
            verdict = 'missing'
        elif not classes:
            verdict = 'empty'
        elif all(name in HANDS_OVER for name in classes):
            verdict = 'hands_over'
        else:
            verdict = 'internal'
        out.append([identifier, verdict, ' '.join(sorted(set(classes or []))), str(len(used[identifier])),
                    ' '.join(used[identifier][:6])])
    markdown_data.write_table(
        output, 'Mission rewards',
        'Every reward table entry a mission stage of build 180836 hands over: the entry, whether every reward in '
        'it only hands the player something (`hands_over`), steers the game (`internal`), is empty or is missing '
        'from the reward table, the reward classes inside it, how many missions use it and up to six of them. '
        'Made by `classify-mission-rewards.py`; the list of classes that count as handing something over is in '
        'that script.',
        ['Reward', 'Verdict', 'Classes', 'Missions', 'Used by'], out)
    tally = {}
    for row in out:
        tally[row[1]] = tally.get(row[1], 0) + 1
    print(len(out), 'entries', tally)
    classes = {}
    for row in out:
        for name in row[2].split():
            classes[name] = classes.get(name, 0) + 1
    for name, count in sorted(classes.items(), key=lambda item: -item[1]):
        print('%4d %s%s' % (count, name, '' if name in HANDS_OVER else '   (internal)'))


if __name__ == '__main__':
    main()
