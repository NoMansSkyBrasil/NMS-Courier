# Category input linkage for bounded appearance research

Checkpoint: 2026-10-04. Owning algorithm evidence:
[packed scene context](PACKED_SCENE_SEED_CONTEXT.md) and
[owned appearance sources](SEED_RECURSION_AND_OWNED_INPUTS.md).
Pinned offline build 180383, executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.

## Implemented connection

`runtime/research/evaluate-entity-inputs.py` connects explicit category input
records to descriptor recursion, packed scene traversal, ordered material
requests and optional experimental base-palette colors. Previously the scene
trace accepted one enabled seed for every root and disabled its second context
pair. The new path keeps enabled flags, category source precedence and the
preserved second context pair explicit. It uses the existing corpus read-only.

This is an offline integration, not a frontend command or a live memory reader.
Input records are supplied research values, never personal save files. The
committed fixture manifest contains synthetic values and the user's requested
Pirate model seed; it is not an exported player snapshot.

| Supported profile | Model input | Default palette input | Evidence source |
| --- | --- | --- | --- |
| Owned ship | Supplied Resource model pair | Same default pair | `55cb20` resource/custom working source |
| Owned multitool | Supplied selected Resource pair | Same default pair | `553600` selected Resource/custom working source |
| Owned freighter | Supplied CurrentFreighter.Resource pair | Separate CurrentFreighterHomeSystemSeed pair | `542910` source-to-cache association |
| Ship purchase | Enabled loaded-resource pair; otherwise purchase-object pair | Same selected default pair | `183cd20` accessor and `8e8830` precedence |

The inputs select an already associated source route; this program does not read
those addresses. Their source association does not prove every downstream
customisation/task override. No IsGift-to-S-rank assumption is made.

## Input contract

The input JSON is a list of 1–32 records, at most 32 KiB. Each record requires:

- `category`: `ship`, `multitool` or `freighter`.
- `route`: `owned_default`, or `ship_purchase` for ships only.
- `descriptor`: one of the nineteen category-matched roots in
  `appearance-recursion-models-180383.json`.
- `model_seed`: `{ "value": "0x7", "enabled": true }`. Values must be decimal
  or hexadecimal strings representing uint64; booleans are actual JSON booleans.
- `material_second_seed`: another explicit pair. It is preserved independently;
  it is **not inferred from the palette seed**.
- `engine_context_index`: explicit integer 0–31, not an inferred universal PC enum.
- `resource_flags`: integer zero or `67108864` for the compared strict context mode.
- `selection`: `{ "mode": "seeded" }` or
  `{ "mode": "explicit", "ids": ["_PART"] }`.

Freighters additionally require `home_system_seed`. Ship purchase additionally
requires `loaded_resource_seed`; an enabled zero is valid and has priority.
Disabled loaded seeds use `model_seed` as the supplied purchase-object fallback.
Optional `inclusion`, `exclusion` and `prefix` supply bounded caller context.
Explicit selection rejects seeded prefix/exclusion rather than ignoring them.
These fields are explicit inputs, not an automatic FILTER.MBIN caller resolver.

Explicit IDs exercise the independently compared explicit helper. They do not
claim that all category-specific customisation callers are recovered. Missing,
unknown or mismatched fields/routes fail rather than silently falling back.
NPCs, frigates, gift/preset/update variants and arbitrary user color overrides
are not currently supported input profiles.

## Output and limits

Each result records input source labels, selected IDs, material acquisition
requests, material order, asset archive/XML hashes and any unsupported result.
`--base-palettes` connects the resolved palette pair to the existing 66-family,
five-color base-only evaluator. It emits 330 candidate samples per successful
record. It does not assign those samples to materials, implement texture masks,
override palettes or establish final appearance/rendering. Freighter model and
palette seeds can vary independently without overwriting the material pair.

All outputs retain `runtime_verified: false` and
`natural_resource_io_proven: false`. Geometry/async acquisition success and
nonvariant handle resolution remain controlled assumptions. This closes an
input-to-evaluator connection; it does not close unrestricted gates 1–3 or
implement gates 4–5. No seed inversion or delivery success is claimed.

## Reproduce and verify

Use the existing private Python interpreter, not a newly installed runtime:

```powershell
python runtime/research/evaluate-entity-inputs.py `
  --corpus E:\NMS-Courier-Research\corpus `
  --inputs runtime/research/entity-input-fixtures-180383.json `
  --base-palettes `
  --output E:\NMS-Courier-Research\seed-analysis-180383\new-entity-inputs.json
python -m unittest discover -s runtime/research -p test_entity_inputs.py
```

The six committed cases exercise owned ship/tool/freighter, enabled loaded
purchase seed, disabled loaded seed fallback and explicit tool pieces.
External `entity-inputs-linked-20261004.json` completed 6/6 with zero unsupported
records. Ten boundary tests passed: independent channels, zero/max seeds,
purchase precedence, required context, unknown routes, category mismatch,
explicit mode and overflow. Existing nine scene and fifteen descriptor tests
also passed after integration. No new native comparison is implied by these six
joined traces; native algorithm comparisons remain in their owning notes.

Bounds: 32 input records, 256 ID records per field, 31 bytes per ASCII ID,
64 MiB XML/256 assets/32,768 visits/depth 64 per root, source metadata indexed
once. Output must be new and outside corpus/repository. No game, bridge, patch,
save, archive or corpus mutation; no extraction or disk operations.
