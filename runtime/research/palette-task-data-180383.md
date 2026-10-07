# Palette task data 180383

<!-- data-table: parsed by runtime/research/markdown_data.py; keep one table, one row per entry -->

Table with named columns. Listed in [the data file catalog](../../docs/DATA_FILE_CATALOG.md).

| label | rva | purpose |
| --- | --- | --- |
| PALETTE_TASK_CTOR | 0x6377e0 | Constructor arg7 low byte stored at task+1c9; entry stack offset 38 becomes 90 after frame adjustment 58 |
| PALETTE_TASK_SUBMIT | 0x637db0 | Arg13 low byte at entry stack+68 becomes stack+400; passed at caller stack+30 to constructor arg7 |
| PALETTE_TASK_SOURCE | 0x1149fe0 | Object+70 supplied at caller stack+60 (arg13); object+71 gates precomputed object+1d70 pointer (arg6) |
| PALETTE_TASK_DISPATCH | 0x638a8a | Initial state-zero branch; mode5 bypasses both generators |
| BASE_BANK_CALL | 0x638adc | Calls 62c480 with bank+520ac0 when task+1c9 is zero |
| ALTERNATE_BANK_CALL | 0x638aea | Calls 62e4e0 with bank+520ff0 when task+1c9 is nonzero |
| PRECOMPUTED_COPY | 0x6380f2 | Copies 1ce0 bytes from supplied palette then sets task state27c to1 at6380ff |
| FALLBACK_RGBA | 0x4b2f8d0 | File-backed rdata 16bytes; little-endian float32 magenta(1,0,1,1) |
| SIMD_PADDING | 0x4b26778 | File-backed rdata first float32=1; equal padding on both distance operands cancels |
| SIMILARITY_THRESHOLD | 0x525d910 | Data zero-filled virtual tail; runtime initialization/writer not recovered |
