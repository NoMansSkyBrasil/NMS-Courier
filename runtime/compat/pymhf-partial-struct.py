"""Compatibility exports expected by the pinned NMSpy 147803.1 package."""

from pymhf.core.structs import Field, partial_struct
from pymhf.extensions.ctypes import c_enum32

__all__ = ["Field", "c_enum32", "partial_struct"]
