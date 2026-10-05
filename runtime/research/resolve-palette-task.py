"""Explicit-input decision port for the pinned build-180383 palette task.

This models the initial generation decision, not the complete asynchronous worker.
Precomputed colors bypass seed generation; mode 5 supplies no generated colors.
"""


def resolve(context):
    if not isinstance(context, dict) or set(context) != {'alternate_flag', 'global_mode', 'precomputed'}:
        raise ValueError('Palette task requires alternate_flag, global_mode and precomputed')
    flag, mode, precomputed = (context[k] for k in ('alternate_flag', 'global_mode', 'precomputed'))
    if type(flag) is not int or not 0 <= flag <= 255 or type(mode) is not int or not 0 <= mode <= 0xffffffff:
        raise ValueError('Palette task requires uint8 flag and uint32 mode')
    if type(precomputed) is not bool:
        raise ValueError('Precomputed presence must be boolean')
    if precomputed:
        return {'route': 'precomputed', 'generator_rva': None, 'bank_offset': None, 'initial_state': 1}
    if mode == 5:
        return {'route': 'generation_skipped', 'generator_rva': None, 'bank_offset': None, 'initial_state': 0}
    return {'route': 'alternate' if flag else 'base',
            'generator_rva': '0x62e4e0' if flag else '0x62c480',
            'bank_offset': 0x520ff0 if flag else 0x520ac0, 'initial_state': 0}
