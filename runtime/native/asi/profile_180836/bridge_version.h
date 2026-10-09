// Version of the bridge (the research profile DLL), shown to the user and written to the status
// file. Raise it in every change that alters what the DLL does, in the same commit as the matching
// entry of bridgeReleases in apps/desktop/src/main/research-bridge/bridge-version.ts and of
// CHANGELOG.md. Major: a request or file format changed incompatibly. Minor: a new request or
// option. Patch: a fix. Included once by profile_core.c.

#define BRIDGE_VERSION "1.17.0"
