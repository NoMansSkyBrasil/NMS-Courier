# Pirate model reward research

This isolated, uninstalled variant changes only the independently authored explicit
reward's `ShipResource.Filename` to
`MODELS/COMMON/SPACECRAFT/INDUSTRIAL/PIRATEFREIGHTER.SCENE.MBIN`. It retains the
requested seed `0x1AD0003900054` / `471690548084820`, requested class S, 120 cargo
dimensions, 60 requested technology slots, and zero reward cost.

The scene path is grounded in the build 180383 extracted
`METADATA/SIMULATION/SPACE/AISPACESHIPMANAGER.MBIN`: model ID
`FREIGHTER_CAPITAL_PIRATE`, ship class `Freighter`, AI role `CapitalFreighter`.
That table's decompiled MXML SHA-256 is
`0bfb109aff5b1bd06dfc6c0b4859385e3784528fe0368a3b2a25eaf803557795`;
its source PAK is `NMSARC.Precache.pak`, SHA-256
`a6371a8b2f065eca33fd306a16cbe2baca9d4ce75806c71e42f74e1ab9295032`.
This establishes a real model reference, not a functioning reward-offer path.

Do not install or dispatch this variant using the old build 179666 runtime bridge.
The current executable is build 180383, whose runtime functions and layouts still
need independent validation. There is no live evidence that this path produces a
Pirate offer, honors the seed, sets S class, unlocks technology, or supercharges
slots. Offline serialization and scene existence are separate evidence gates.

MBINCompiler 7.04.1-pre3 compiled and decompiled this source successfully. Assertions
on the resulting MXML retained the Pirate scene, requested seed, S inventory class,
10 × 12 cargo dimensions, `NumSlotsFromTech=60`, and zero `CostAmount`. No game was
launched to test the variant. The scene was independently found in the installed
EntitySceneMBIN PAK manifest with an uncompressed size of 821,912 bytes.
