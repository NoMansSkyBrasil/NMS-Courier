# NMSpy 147803.1 pyMHF struct import compatibility

## Scope

The staging build adds one project-owned compatibility module at `pymhf/utils/partial_struct.py` only for the pinned NMSpy 147803.1 and pyMHF 0.2.4 packages. The module re-exports `Field` and `partial_struct` from `pymhf.core.structs`, and `c_enum32` from `pymhf.extensions.ctypes`.

## Reason

The live diagnostic attempt authenticated the Courier mod, but pyMHF logged that NMSpy's `singletons.py` and `textChatManager.py` could not import `pymhf.utils.partial_struct`. It then reported one loaded mod and zero hooks. The pinned pyMHF package provides the required struct and enum symbols under `pymhf.core.structs` and `pymhf.extensions.ctypes`, while the pinned NMSpy package still imports the earlier module path.

## Compatibility gate

The staging script checks both exact package versions and the expected upstream symbol definitions before adding the shim. Runtime tests import NMSpy's internal singleton and game type modules and assert that the shim exports the same objects as the reviewed pyMHF modules. Changes to either package version or export location fail staging and require a new review.

This shim restores the imports only. It does not establish that any hook signature matches a game build. A live callback remains required before M1 is accepted.
