# Alien words and portal glyphs

Status on 2026-10-09: **built in bridge 1.22.0 and application 1.27.0, not
exercised against the running game.** Build 180836 only. Both change the
loaded slot.

Owner request: a page to deliver the words of every race, choosing which and
how many, shown as if the game gave them, with the game's notifications; a
separate page to learn the portal glyphs; and, as a standing rule, **nothing
is ever written into a save: things are only delivered through the running
game**.

## What the game has (read in the executable and the tables)

Words. The alien speech table (`nms_dialog_gcalienspeechtable`) has 4,833
entries: a word identifier, a race and a group named
`<race prefix>_<suffix>`. Five races have words: Traders (Gek, `TRA`),
Warriors (Vy'keen, `WAR`), Explorers (Korvax, `EXP`), Atlas (`ATLAS`) and
Builders (Autophage, `BUI`); 3,830 groups in all
([table](../runtime/research/word-delivery.md), made by
`runtime/research/list-alien-words.py`). The save keeps known words by word
identifier with a flag per race (`GcWordKnowledge`: `Word`, `Races[9]`).

Two rewards teach words:

- `GcRewardTeachSpecificWords` (class hash `0xafc59db0`, `0x40` bytes):
  `CustomOSDMessage` `+0x00`, `SpecificWordGroups` `+0x20` (pointer, count at
  `+0x28`, each group `0x20` bytes), `OSDMessageTime` `+0x30`, `Race`
  `+0x34`, `SuppressOSDMessage` `+0x38`. Its handler (`f35d30`) skips the
  race `None` (7), builds `"<prefix>_<group>"` for every entry with a prefix
  table indexed by race (`TRA`, `WAR`, `EXP`, empty, `ATLAS`, `DIP`, `DIP`,
  empty, `BUI`) and hands it with the race to the learn routine of the
  player state (`5ac740`). The reward table uses it five times, each time
  with the message suppressed.
- `GcRewardTeachWord` (class hash `0x9ed38e36`, `0x14` bytes): `AmountMax`
  `+0x00`, `AmountMin` `+0x04`, `Category` `+0x08`, `Race` `+0x0c`,
  `UseCategory` `+0x10`; the game picks words the player lacks. Seventy uses
  in the reward table.

So the races are numbered Traders 0, Warriors 1, Explorers 2, Robots 3,
Atlas 4, Diplomats 5, Exotics 6, None 7, Builders 8.

Glyphs. `GcRewardDiscoverRune` (class hash `0x0cf21824`) is one byte,
`AllRunes`; forty uses in the reward table, all with `false`. Its handler
(`f3a200`) keeps the known glyphs as sixteen bits at manager `+0x26968`: with
`AllRunes` it sets every bit, without it the next one the player lacks. There
is no reward for a chosen glyph.

## How the bridge asks (bridge 1.22.0)

Carriers of the data file, as for currencies
([currency notes](CURRENCY_DELIVERY_NOTES.md)): `COURIER_WORDS` (specific
words, race Traders, 64 placeholder groups `COURIER00` to `COURIER63`,
message not suppressed), `COURIER_WORD` (one word, race Traders) and
`COURIER_RUNE` (`AllRunes` false).

Words, `runtime/native/asi/profile_180836/word_teach.h`, request
`native-word-request-180836-<PID>.txt`, event `words`:

```text
race=traders|warriors|explorers|atlas|builders
silent=0|1
group=<suffix>        one a line, up to 4096
```

or `count=<1..500>` in place of the groups, for words the game chooses. The
bridge checks the carrier, writes the race, the message switch and up to 64
groups at a time with their count, calls the game's reward routine (a
**native call** per 64 groups, or per word with `count`), and writes the data
file's content back. The carrier is the only thing written; the words are
added by the game. Result `native-word-result-…`: `result=given`,
`unknown_reward`, `bad_layout` or `not_ready`, and the number of calls.

Glyphs, `runtime/native/asi/profile_180836/rune_discover.h`, request
`native-rune-request-180836-<PID>.txt`, event `runes`: `silent=0|1` and
`all=1` or `count=<1..16>`. For all, the carrier's byte is set for one call
and cleared; for a count the reward routine is called that many times.
Result `native-rune-result-…`: `result=`, the calls, and the sixteen bits
before and after (`known_before=`, `known_after=`), which the bridge only
reads.

## The application (1.27.0)

"Words" under "Unlock" uses the shared selection list: every group, named by
the words it teaches, with its race; "Deliver all" sends five requests, one a
race. "Portal glyphs" has its own page: the game's sixteen glyph pictures in
the game's order, a switch for all of them, or how many of the next ones.

## Not proven, and open

- Everything live: that the game teaches the words and discovers the glyphs
  from these carriers, and that it shows its messages.
- Whether a request of several thousand groups with messages on is bearable;
  the handler waits `OSDMessageTime` (3 seconds in the carrier) per message.
- Whether the glyph reward works outside the interaction it normally comes
  from.
- The application does not offer "a number of words chosen by the game" yet
  (the bridge request exists), and lists a group by its word identifiers,
  not by the alien word or its translation.
- Standing and milestones are the next areas the owner asked for; nothing is
  built for them.
