"""Experimental offline integer primitives recovered from build 180383 assembly.

This is not a complete appearance evaluator, seed searcher, or delivery adapter.
Caller filters, resource resolution, recursion order, textures and palettes remain
outside this module. No native code, game process or save is accessed.
"""
import argparse
import json

MASK32 = (1 << 32) - 1
MASK64 = (1 << 64) - 1
MULTIPLIER = 0x5A76F899


def seed_state(seed, enabled=True):
    """Initialize two uint32 words as observed at RVA 2d63c22..2d63c46."""
    if not 0 <= seed <= MASK64:
        raise ValueError('Seed must fit an unsigned 64-bit integer')
    if not enabled:
        return 1, 0
    low = seed & MASK32
    rotated = ((low >> 16) | (low << 16)) & MASK32
    return low or 1, rotated ^ (seed >> 32) ^ low


def advance(state):
    """Return updated state and low-word draw; RVA 2d67c4f..2d67c79."""
    low, carry = state
    if not 0 <= low <= MASK32 or not 0 <= carry <= MASK32:
        raise ValueError('State words must fit uint32')
    product = low * MULTIPLIER + carry
    next_state = product & MASK32, product >> 32
    return next_state, next_state[0]


def child_seed(state):
    """Advance twice and mix both draws; reference branch 2d63f7a..2d63ff1."""
    state, first = advance(state)
    state, second = advance(state)
    mixed = (second << 32) | first
    mixed = ((mixed ^ (mixed >> 33)) * 0x64DD81482CBD31D7) & MASK64
    mixed = ((mixed ^ (mixed >> 33)) * 0xE36AA5C613612997) & MASK64
    return state, mixed ^ (mixed >> 33)


def option_weight(name):
    """Native Name markers, not XML Chance; order matters if markers coexist."""
    if 'xRARE' in name:
        return 1
    if 'xNEVER' in name:
        return 0
    return 20


def choose_unfiltered(state, names):
    """Isolated group choice only; does not reproduce caller filtering/overrides."""
    if not 1 <= len(names) <= 4096:
        raise ValueError('Provide 1..4096 option names')
    weights = [option_weight(name) for name in names]
    total = sum(weights)
    if not total:
        return state, None
    state, draw = advance(state)
    position = (draw * total) >> 32
    for index, weight in enumerate(weights):
        if position < weight:
            return state, index
        position -= weight
    raise AssertionError('Weighted position escaped its range')


def palette_index_from_draws(first, second, mode):
    """Isolated candidate from 62cbb0; RGBA/retries/category state are not included."""
    if not 0 <= first <= MASK32 or not 0 <= second <= MASK32:
        raise ValueError('Palette draws must fit uint32')
    row, column = first >> 29, second >> 29
    if mode == '_1':
        return 0
    if mode == '_4':
        return ((row >> 2) * 8 + (second >> 31)) * 4
    if mode == '_8':
        return column
    if mode == '_16':
        return ((second >> 30) + (row >> 1) * 8) * 2
    if mode == 'All':
        return column + row * 8
    raise ValueError('Inactive/unknown palette mode requires upstream resolution')


def palette_draw(state, mode):
    state, first = advance(state)
    state, second = advance(state)
    return state, palette_index_from_draws(first, second, mode)


def palette_lookup_index(index, mode):
    """Candidate 2277f0 remap, restricted to valid 64-entry palette indices."""
    if not 0 <= index < 64:
        raise ValueError('Palette index must be 0..63')
    if mode == '_1':
        return 0
    if mode == '_4':
        return ((index % 8 // 4) + (index // 32) * 8) * 4
    if mode == '_8':
        return index % 8
    if mode == '_16':
        return ((index % 8 // 2) + (index // 16) * 8) * 2
    if mode == 'All':
        return index
    raise ValueError('Inactive/unknown palette mode requires upstream resolution')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--seed', required=True, type=lambda value: int(value, 0))
    parser.add_argument('--draws', type=int, default=8)
    parser.add_argument('--disabled-seed', action='store_true')
    parser.add_argument('--palette-mode', choices=('_1', '_4', '_8', '_16', 'All'),
                        help='Experimental isolated palette-index draws, without RGBA/retry logic')
    args = parser.parse_args()
    if not 1 <= args.draws <= 256:
        parser.error('Draw budget must be 1..256')
    state = seed_state(args.seed, not args.disabled_seed)
    records = []
    for _ in range(args.draws):
        if args.palette_mode:
            state, index = palette_draw(state, args.palette_mode)
            records.append({'palette_index': index, 'state': [hex(word) for word in state]})
        else:
            state, draw = advance(state)
            records.append({'draw': hex(draw), 'state': [hex(word) for word in state]})
    print(json.dumps({'mode': 'experimental_integer_trace', 'runtime_verified': False,
                      'appearance_evaluator_implemented': False, 'seed': hex(args.seed),
                      'initial_state': [hex(word) for word in seed_state(args.seed, not args.disabled_seed)],
                      'draws': records}, indent=2))


if __name__ == '__main__':
    main()
