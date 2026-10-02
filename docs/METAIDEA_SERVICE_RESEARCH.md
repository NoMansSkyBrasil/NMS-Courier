# MetaIdea service and public tooling assessment

Status: static source/reference research on 2026-10-02. No remote delivery was
requested, no third-party script or binary was executed, and no game file,
process, inventory or save was changed. This is not a reproduced service backend.

## Source provenance and limits

The user supplied a saved NoMansApp HTML client, 6,553,830 bytes, SHA-256
`cc289ebd09f65a3cd88b856e8c9a32949f0e6e516c6e80f1d62869cf9f0b4340`.
Its `SendCommandToServer` declares clientVersion 1.77. The snapshot includes
inline JavaScript and catalogs; it does not include the server-side bot or DLL
implementation. Its visible platform restrictions are snapshot evidence, not a
claim that restrictions will remain unchanged.

The [Transcender page](https://nomansapp.com/transcender) was fetched read-only,
8,427,932 bytes, SHA-256
`ed3f6c59dd58394d6f4e54c22fa188b628b3fe36525c4d5c3aad0779d6067cfb`.
The guide request redirected to `/guide`, 4,297,535 bytes, SHA-256
`8d5ef5b1934d74b6c89aeea619304e43007ff0c676dd32e82aac218da9b3d844`.
Web-reader access failed on the large pages; bounded HTTPS GETs preserved external
copies instead. These pages and their scripts were never opened for execution.

Public repository metadata and selected files were captured outside Courier with
commit IDs, file hashes and non-truncated Git trees. No full clone, installer,
build batch, Lua evaluation, authentication or service POST was used.

| Repository | Inspected commit | Actual contribution |
| --- | --- | --- |
| [nms-auto-hex-mod-builder](https://github.com/MetaIdea/nms-auto-hex-mod-builder/tree/54c7ad1f6b86739d15bdb65c73dfc1be4d15ec48) | 54c7ad1f6b86739d15bdb65c73dfc1be4d15ec48 | Offline MBIN float-value replacement and PAK building |
| [nms-ship-creator](https://github.com/MetaIdea/nms-ship-creator/tree/15e962c767f8dad66a336b8dcbb3ded7a287239e) | 15e962c767f8dad66a336b8dcbb3ded7a287239e | Browser model/descriptor selection, Three.js and Lua/Fengari; not the service backend |
| [nms-system-info-export](https://github.com/MetaIdea/nms-system-info-export/tree/837d02f540f3d35cddf9c4e8d48b07804d5e2967) | 837d02f540f3d35cddf9c4e8d48b07804d5e2967 | Example exported system/planet data and filtering; no fetch/WebSocket found in this snapshot |
| [AMUMSS-GUI](https://github.com/MetaIdea/AMUMSS-GUI/tree/df42bdff8afe96144db04b9ba9034a04e2116ff1) | df42bdff8afe96144db04b9ba9034a04e2116ff1 | ImGui frontend, Lua-script inspection and BuildMod.bat invocation |
| [AMUMSS fork](https://github.com/MetaIdea/AMUMSS-nms-auto-modbuilder-updater-modscript-system/tree/4e3c7583f6ce36d52d8018ddae90b00412f83d73) | 4e3c7583f6ce36d52d8018ddae90b00412f83d73 | Data-mod extraction, compiler conversion, scripted edits and optional installation |

The hex builder searches four bytes produced by `string.pack("f", value)` and
replaces a selected occurrence. Its example changes PlayerTransferRange and
PlayerSpaceTransferRange. This is file patching, not live memory injection,
not a game-thread bridge and not a discovered freighter class setter. Occurrence
selection is build-sensitive and cannot replace schema/fingerprint validation.
AMUMSS-GUI calls the build batch; it supplies no demonstrated runtime hook.

## What the client actually requests

| Client function | Command | Observed fields or behavior |
| --- | --- | --- |
| ShipDelivery | SHIP_DELIVERY | Type, seed, delivery mode/location; assignments include sclass, connectedScSlots, optional shipClassOverride/color |
| FreighterDelivery | FREIGHTER_DELIVERY | Type, model/home/NPC seeds, NPC type, colors, reward/useReward; no class field in this function |
| ServiceBotExtenderDelivery | SERVICE_BOT_EXTENDER_DELIVERY | procType and procSeed |
| MultitoolDelivery | MULTITOOL_DELIVERY | rewardID; its ordinary button listener is commented out in the supplied client |
| RewardDelivery | REWARD_DELIVERY | One or multiple selected reward IDs |
| CurrencyDelivery | CURRENCY_DELIVERY | Currency type and amount |
| ShipUpgrader | SHIP_UPGRADER | Class upgrade, slot unlock and repair options |
| EggDelivery | EGG_DELIVERY | Creature seed/type/size, petclass, affinity and moveset; advanced appearance fields |
| LoadMissionList | MISSION | Selected mission ID; nested start action |
| LoadSharingCenterItemListDisplay | SHARING_CENTER_DELIVERY_ plus category | Category, catalog ID and sharing code; creature-specific options |

`SendCommandToServer` serializes commands into a Base64 JSON Data header and
performs a POST to the service API, with optional JSON body. This exposes the
request contract, not the game-side execution. No request was replayed. Local
Courier commands should use its own authenticated narrow transport and local
target, rather than depend on this hosted API, its account state or friend code.

The HTML labels the legacy multitool/currency/season paths as Xbox/Switch 2 and
time-limited through version 7.05. This does not prove that PC cannot perform the
operation: the same client describes a PC-only extender for custom delivery.
Do not infer the private server's compatibility or failure reason from labels.

## Different acquisition paths

The ship UI separates NPC delivery, free reskin/reseed, and exchange popup.
Reskin/reseed changes an existing selected entity; it must not be represented
as adding another owned ship. NPC purchase is not our required free acquisition.

The freighter instructions describe system spawning, entering a landing bay,
the bot leaving, then visiting the bridge to purchase. They separately state
that frigates and the default freighter option use a popup. Absence of a class
input is consistent with a different generation route, but does not establish
the cause of Courier's C result or an engine-wide inability to configure class.

The Sharing Center's multitool delivery text explicitly requires Service Bot
Extender and describes a popup claim screen. Its ordinary MultitoolDelivery
function instead sends a reward ID. These are distinct paths. Several Sharing
Center categories, including Freighters, explicitly return unavailable in
SwitchSharingCategory; a visible category button is not working delivery proof.

The Transcender page describes a single `dinput8.dll` in Binaries and says the
extender opens the game's standard exchange screens for custom entities. It also
describes a patch enabling claim/buy so an existing ship/tool need not be traded.
This is the author's documented mechanism, not verified disassembly or runtime
compatibility. The DLL was not downloaded, installed, inspected or executed.
The page also advertises unrelated features outside Courier's delivery scope.

## Consequences for Courier

The user's clarification explicitly excludes obtaining or implementing MetaIdea's
Service Bot Extender for now. The objective is independently implemented, fully
localhost functionality through Courier's bridge, optionally combined with our
own data mods. The private bot backend is not a research dependency or target.
Public references inform mechanisms and feature contracts; third-party code is
not copied into the application.

Keep the current native DLL bridge and allow operation-specific helpers. Data
mods can provide validated reward definitions; the DLL can invoke native
reward/acquisition handlers on a verified callback. An independently written
C# controller could send typed commands or perform read-only diagnostics, but
external memory writes do not automatically load a model, rebuild stats, select
an inventory, finalize ownership, show native notifications or run on the game
thread. Do not replace the integration problem with a class-byte write.

Priorities supported by these findings:

1. Migrate the exact-build native reward dispatcher, then independently configured
   ship and weapon reward payloads using the class-copy branches already mapped.
2. Investigate freighter acquisition followed by request-scoped configuration as
   a separate alternative. Preserve fleet/base state and distinguish partial
   ownership from completed class/slot/model configuration.
3. Trace claim versus swap and fee handling before any popup acceptance. A Buy
   label, zero reward cost or service success message is not proof of no debit.
4. Reuse native upgrade/slot/recipe/install handlers only after proving target,
   cost, valid-index and persistence postconditions. Keep 120 technology slots
   and all-supercharged layouts experimental.
5. Research mission start as a separate native operation: selecting an ID in a
   web client does not reveal start conditions, cancellation or multiplayer state.
6. Treat petclass as a companion payload field; ship/weapon inventory class
   layouts cannot be reused for creature eggs without schema/handler evidence.

This supports a broader hybrid implementation, while leaving the server's
multiplayer replication technique unknown. Local DLL delivery remains independent
of future delivery to players who do not install Courier.

## Reproducible bounded inspection

`runtime/research/inspect-service-client.py` reads at most 32 MiB of supplied HTML,
selects up to 32 named functions, and emits hashes, command-type literals, field
name candidates and DOM identifiers to an external JSON report. It never runs
scripts, contacts the service or exports account/token values. Its quote/comment
brace handling is lexical, not a complete JavaScript parser; regex literals and
template interpolation remain explicit limitations. Use named function inspection
to confirm candidates rather than dumping large embedded images/catalogs.

External snapshot location: `%LOCALAPPDATA%\NMSCourier\research-references\metaidea-20261002`.
Only Courier research tooling and this assessment belong in Git.
