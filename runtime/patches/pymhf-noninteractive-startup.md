# pyMHF 0.2.4 non-interactive startup patch

## Scope

This patch applies only to the staged `pymhf/__init__.py` file whose upstream SHA-256 is `6e0f58ebdc98acf91685b7176d927e9865d0b62a78b2fef3d5d49b7520118a50`.

## Reason

pyMHF 0.2.4 creates Questionary prompts while the package is imported. That behavior prevents a windowless, configuration-driven desktop launcher from importing the framework even when the launcher has already prepared all settings.

## Change

The patch adds an explicit `PYMHF_INTERACTIVE_CONFIGURATION=1` opt-in to the existing prompt condition. Without this opt-in, importing pyMHF does not create Questionary prompt objects. It does not change injection, process selection, mod loading, logging, networking, HTTP, or GUI behavior.

## Compatibility gate

The staging script fails if the upstream file hash or exact source condition differs. Updating pyMHF requires a fresh review and a revised patch. The package retains pyMHF's MIT notice in the generated license inventory.
