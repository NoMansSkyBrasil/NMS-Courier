"""Verify the private pyMHF compatibility exports used by pinned NMSpy."""

from __future__ import annotations

import unittest

from pymhf.core.structs import Field as CoreField
from pymhf.core.structs import partial_struct as core_partial_struct
from pymhf.extensions.ctypes import c_enum32 as extension_c_enum32
from pymhf.utils.partial_struct import Field, c_enum32, partial_struct


class NmspyCompatibilityTests(unittest.TestCase):
    def test_compatibility_module_reexports_the_pinned_framework_api(self) -> None:
        self.assertIs(Field, CoreField)
        self.assertIs(partial_struct, core_partial_struct)
        self.assertIs(c_enum32, extension_c_enum32)

    def test_nmspy_game_binding_modules_import(self) -> None:
        import nmspy._internal_mods.singletons  # noqa: F401
        import nmspy.data.types  # noqa: F401
        import nmspy.data.exported_types  # noqa: F401


if __name__ == "__main__":
    unittest.main()
