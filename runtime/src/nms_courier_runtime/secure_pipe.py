"""Windows Named Pipe primitives for the restricted Courier bridge."""

from __future__ import annotations

import win32api
import win32con
import win32file
import win32pipe
import win32security
import pywintypes


def _current_user_sid() -> object:
    token = win32security.OpenProcessToken(win32api.GetCurrentProcess(), win32con.TOKEN_QUERY)
    return win32security.GetTokenInformation(token, win32security.TokenUser)[0]


def create_current_user_security_attributes() -> pywintypes.SECURITY_ATTRIBUTES:
    """Allow only the current Windows user to read or write the pipe."""
    dacl = win32security.ACL()
    dacl.AddAccessAllowedAce(
        win32security.ACL_REVISION,
        win32file.GENERIC_READ | win32file.GENERIC_WRITE,
        _current_user_sid(),
    )
    descriptor = win32security.SECURITY_DESCRIPTOR()
    descriptor.SetSecurityDescriptorDacl(1, dacl, 0)
    attributes = pywintypes.SECURITY_ATTRIBUTES()
    attributes.SECURITY_DESCRIPTOR = descriptor
    return attributes


def create_user_only_pipe(name: str) -> pywintypes.HANDLE:
    """Create one byte-mode local pipe with an explicit current-user ACL."""
    if not name or "\\" in name or "/" in name:
        raise ValueError("The pipe name must be a single non-empty segment.")
    reject_remote = getattr(win32pipe, "PIPE_REJECT_REMOTE_CLIENTS", None)
    if reject_remote is None:
        raise RuntimeError("This Windows runtime cannot reject remote Named Pipe clients.")
    return win32pipe.CreateNamedPipe(
        rf"\\.\pipe\{name}",
        win32pipe.PIPE_ACCESS_DUPLEX,
        win32pipe.PIPE_TYPE_BYTE
        | win32pipe.PIPE_READMODE_BYTE
        | win32pipe.PIPE_WAIT
        | reject_remote,
        1,
        65536,
        65536,
        0,
        create_current_user_security_attributes(),
    )
