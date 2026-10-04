"""Invert one isolated descriptor child-seed branch, not an appearance.

The derivation is specific to the integer windows identified in build 180383.
No executable, game process, save, asset or runtime adapter is accessed.
"""
import argparse
import json
from pathlib import Path
import runpy

P = runpy.run_path(str(Path(__file__).with_name('procedural-seed-primitives.py')))
MASK32, MASK64, MULTIPLIER = P['MASK32'], P['MASK64'], P['MULTIPLIER']
A_INVERSE = 0xFAA6B01EC53551E7
B_INVERSE = 0x9BB5680ABE73E627


def undo_mix(child):
    """Recover two low-word draws by undoing both odd modular multipliers."""
    if not 0 <= child <= MASK64:
        raise ValueError('Child seed must fit uint64')
    value = child ^ (child >> 33)
    value = (value * B_INVERSE) & MASK64
    value ^= value >> 33
    value = (value * A_INVERSE) & MASK64
    value ^= value >> 33
    return value & MASK32, value >> 32


def invert(child):
    """Enumerate all enabled seed-initializer preimages for this one branch.

    An initialized carry can be any uint32, unlike a steady-state MWC carry.
    Dividing by the multiplier alone therefore loses valid alternatives.
    """
    first, second = undo_mix(child)
    carry_after_first = (second - first * MULTIPLIER) & MASK32
    packed_first = (carry_after_first << 32) | first
    lower = max(1, (packed_first - MASK32 + MULTIPLIER - 1) // MULTIPLIER)
    upper = min(MASK32, packed_first // MULTIPLIER)
    candidates = []
    for low in range(lower, upper + 1):
        carry = packed_first - low * MULTIPLIER
        # Initializer substitutes 1 for zero; both original low words matter.
        for original_low in ((0, 1) if low == 1 else (low,)):
            rotated = ((original_low >> 16) | (original_low << 16)) & MASK32
            high = carry ^ rotated ^ original_low
            seed = (high << 32) | original_low
            state = P['seed_state'](seed)
            resulting_state, resulting_child = P['child_seed'](state)
            if resulting_child != child:
                raise AssertionError('Inverse escaped its exact branch')
            candidates.append({'seed': f'0x{seed:016X}',
                               'state': list(state),
                               'state_after_two_draws': list(resulting_state)})
    if len(candidates) > 4:
        raise AssertionError('Inverse candidate bound exceeded')
    return {'child_seed': f'0x{child:016X}', 'draws': [first, second],
            'carry_after_first': carry_after_first,
            'enabled_seed_candidates': candidates,
            'disabled_initializer_matches': P['child_seed']((1, 0))[1] == child,
            'scope': 'One unfiltered child branch immediately after initialization',
            'runtime_verified': False,
            'appearance_inverse': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--child', type=lambda value: int(value, 0), required=True)
    args = parser.parse_args()
    print(json.dumps(invert(args.child), indent=2))


if __name__ == '__main__':
    main()
