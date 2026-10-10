// Versions of the bridge (the research profile DLL) this application knows, by the SHA-256 of the
// built file. The version itself is compiled into the DLL from
// runtime/native/asi/profile_180836/bridge_version.h; a new build adds a line here in the same change.

// The bridge this version of the application was built and tested with.
export const bridgeVersion = '1.35.0'

// Versions this application can talk to. 1.3.0 takes requests from a file but rejects the item
// request this application writes and cannot give currencies, so only 1.4.0 onwards is accepted.
// An older bridge is recognised and named, and the application asks for it to be updated.
// 1.5.0 looks for the reward entries under their new names (COURIER_*), which is what the data
// file this application checks contains.
export const compatibleBridgeVersions: readonly string[] = [
  '1.5.0',
  '1.6.0',
  '1.7.0',
  '1.8.0',
  '1.9.0',
  '1.10.0',
  '1.11.0',
  '1.12.0',
  '1.13.0',
  '1.14.0',
  '1.15.0',
  '1.16.0',
  '1.17.0',
  '1.18.0',
  '1.19.0',
  '1.20.0',
  '1.21.0',
  '1.22.0',
  '1.23.0',
  '1.24.0',
  '1.25.0',
  '1.26.0',
  '1.27.0',
  '1.28.0',
  '1.29.0',
  '1.30.0',
  '1.31.0',
  '1.32.0',
  '1.33.0',
  '1.34.0',
  '1.35.0'
]

// null: a build from before versions existed. It still works for the requests it has.
export const bridgeReleases: Readonly<Record<string, string | null>> = {
  '6ad12b1caa2bfa94f6b4ca1bdcce0628b8d1b383cd03afa5e4056fe8324027fc': null,
  '22f1637a46b8842bb9400b6594729a20a86a1ace4b18c73fd202d153fd48ac2f': null,
  // 1.0.0 (2026-10-08): first versioned bridge. Same requests as the build above (items, and the
  // notification option of product recipes; the item request is not exercised live yet).
  '70bbe51466c5bf31441f0af07d8740c5f1a479ea835eb4e866f387f2b30aba79': '1.0.0',
  // 1.1.0 (2026-10-08): currency rewards may be requested (CR_UNITS_*, CR_NANITE_*, CR_QS_*).
  '0a51fbd01bbafb5f4fe921ab5dcdc8f47e5423a9589384aaa4d45e600607a03d': '1.1.0',
  // 1.2.0 (2026-10-08): currencies of any amount (request "currency"), stack sizes reported.
  e28e6279c17da7d65d7bd96a14eec0bf266998818a7941ff001fd3fc567bff0c: '1.2.0',
  // 1.3.0 (2026-10-08): takes requests from a file, so the application needs no helper program;
  // listens for as long as the game runs instead of thirty minutes.
  dc735e762740b7c32c79ce9d5b86112dbe046ff40ce90ed83e235effaa5002f0: '1.3.0',
  // 1.4.0 (2026-10-08): items through the game's reward routine when a notification is wanted;
  // the reward table entry is read where the game's own routine reads it (currencies were refused
  // with bad_layout by 1.3.0).
  '520fd043a67c0bb42ae456f912a95c84564c292b31b84cc48a8b180adf035300': '1.4.0',
  // 1.5.0 (2026-10-08): the carrier entries are named COURIER_UNITS, COURIER_NANITES, COURIER_QS,
  // COURIER_SUBST and COURIER_PRODUCT, each of amount 1.
  eb3c8b3785bfd87d88869fc70302a7fdb499592a795cc9ba04f03cd0b0c84cec: '1.5.0',
  // 1.6.0 (2026-10-08): a new starship or multi-tool of a kind, seed and class (requests "ship"
  // and "weapon").
  '4bc6f7ca46d67538b5b5d4e32449dcedb018f01e7e9c39466bb4289614733935': '1.6.0',
  // 1.7.0 (2026-10-08): three more starship kinds: exotic, living and interceptor.
  '7b8a83be1228e415acce726c11f7424526c961af3aee9c0182f63073505e0509': '1.7.0',
  // 1.8.0 (2026-10-08): reports the seed of the current star system and its ships (read only).
  b4950c6eb5ca14b38d5f49f3605c83d301908561b2f60529c1fb2a4f317041f8: '1.8.0',
  // 1.9.0 (2026-10-09): a multi-tool request may ask for the legacy colours; the flag is written
  // on the owned record once the offered tool is accepted (a direct write, not a native call).
  bb10946339433539a290eee8518cf6f458e3a737346161d7bd557f05857b3794: '1.9.0',
  // 1.10.0 (2026-10-09): with the legacy colours asked, the offered multi-tool itself is built
  // with them (two instructions of the game are replaced for the length of the reward call).
  d0a7e555320fe90621b355d779d151d1a5cb5b7dacb517f2b5f82e86d18d1bee: '1.10.0',
  // 1.11.0 (2026-10-09): a starship or multi-tool offer waits until the game's window is in front.
  '083774d1898fbe3a4ffff969a9e8dc7e5183d2f6e65566545d8db8e17aa460da': '1.11.0',
  // 1.12.0 (2026-10-09): the legacy colours change of the offer stays until the offered tool is
  // accepted or the watch ends; the game builds the offered model again after the reward call.
  '50e0f9e487f5c730ebd59650dd1bf382f2fa0a9a6aa89c245c2793727ba5eca0': '1.12.0',
  // 1.13.0 (2026-10-09): the legacy colours change also covers the scene loader call the reward
  // really takes; an offer also waits until the game holds the mouse (system arrow hidden).
  cfbc42f859566959b67d029eeb56959c7976b1f910436712642045b0fdee9ab2: '1.13.0',
  // 1.14.0 (2026-10-09): a multi-tool request may ask for all technology slots and supercharged
  // slots; they are applied to the accepted tool in place (direct writes, as the owned request).
  '8a7a1e018f44009cee1061aeac6649a3bb46a3939383e62783d3bb9577515444': '1.14.0',
  // 1.15.0 (2026-10-09): eleven more multi-tool models, one per scene of the game.
  '3ab0e7f06195dccb0e18218d65c2cc2de399a5de45dbd7d2375a0d2720757090': '1.15.0',
  // 1.16.0 (2026-10-09): the slots of a new multi-tool are set while the game builds the offer.
  d801c260b062cfed9da6f2ad2925af1dc7a6931ed31865801319efe8cd5ea1c2: '1.16.0',
  // 1.17.0 (2026-10-09): a new multi-tool may get twelve rows (120 slots) on the offer.
  '163f59b7254d13c95167c82f8b5d0c081b0a7763d206b92b6064d1ea50694eed': '1.17.0',
  // 1.18.0 (2026-10-09): twelve rows of a new multi-tool asked through the game's table bound,
  // as for a freighter; the direct write stays as a fallback.
  d7effc8e037eb2b73bf584f936719344a16f85807e6d39c253d3bb750fa1a41e: '1.18.0',
  // 1.19.0 (2026-10-09): a new starship may be offered with all slots, supercharged slots and
  // twelve technology rows.
  '238495a51ad06190d492bc47d5ff9913837b62df9593d0ef8c436cc7805cd4d2': '1.19.0',
  // 1.20.0 (2026-10-09): the fishing request may name the fish to record.
  '1730dc597a5737657a828407740c7eacb6914274271afc59c75e0d1c8f6fb15b': '1.20.0',
  // 1.21.0 (2026-10-09): the teleport request, a journey to a system by galaxy and address.
  '9a9312fb8713e4adced72c53e00f84c559ccfcb44b0b61899b534c372e8a41de': '1.21.0',
  // 1.22.0 (2026-10-09): alien words of a race and portal glyphs through the game's rewards.
  '160a95338d10f9307ec40dbf9ff83e7eb1cf2f249a0d0e3d24d0c2a79488e996': '1.22.0',
  // 1.23.0 (2026-10-09): levels of journey milestones and standings through the game's stat
  // reward.
  a355d9a69b242d24ac9e721a03ed66feb590ed600ad84711ed562bdc0f61438b: '1.23.0',
  // 1.24.0 (2026-10-09): the stat request may ask for the game's full level message on stats the
  // game keeps silent.
  '7e0264c064071f603e59ed106dd6b1087189ae03c30713c81d725d6ca10068d7': '1.24.0',
  // 1.25.0 (2026-10-09): level values of the stat request may be the 32-bit patterns of
  // fractional values.
  '130fc869eef55f8cb6a3adfdcea9d304fee77b757699952d24b3b9becb34d8a8': '1.25.0',
  // 1.26.0 (2026-10-09): topics of the game's guide and access to the Space Anomaly through the
  // game's rewards.
  '73227b43dad8d96f63d5d3765598e135082b6a6bc606798a9d8bd40bcdf76458': '1.26.0',
  // 1.27.0 (2026-10-09): named missions for the game to complete through its reward
  // (experimental).
  '39b0c754639cadd57f656d3396ad49377f4dc21da0af03528656528d9b136277': '1.27.0',
  // 1.28.0 (2026-10-10): the mission request takes the notification choice (silent=0|1).
  '4322b6bf1b6dadd6bb8ab88232bf1efdab742ff684416fef7a3e5b1834589d5f': '1.28.0',
  // 1.29.0 (2026-10-10): lists the technologies waiting for components in every inventory and
  // finishes them through the game's install routine (request "install").
  '77f4876da12d74168150e32dfdbd84857dcf3aed9b218983959acfc77cfc46e3': '1.29.0',
  // 1.30.0 (2026-10-10): searches the star systems around the player for planets, with the
  // game's own system and planet generators (request "planets"). Reads only.
  fcc396a542bd77ec51fcf8f2be527bb82484db779eb5389d735a22d4485be0cb: '1.30.0',
  // 1.31.0 (2026-10-10): the planet search also walks the 65 purple stars of each region and
  // says which systems can be reached by portal only.
  '19dd435ca6877383ff82ac42ad3fe785b5ac71484cfc2d41f5633d0a4e7e4103': '1.31.0',
  // 1.32.0 (2026-10-10): a planet search may run for up to 24 hours and also reports each
  // planet's flora, fauna and three resources.
  '82d610f7117e3a3cfec304b17c68fd5bdf67d5545a34dc5f1251e22f80cb2206': '1.32.0',
  // 1.33.0 (2026-10-10): repair of a whole inventory, recharge of low technologies and purple
  // stars on the galaxy map, each through the game's own reward. Needs the data file of the
  // same day.
  fea4a9633156b010e7e788e9fa9ce74d2ae036fd4715b95138275d816e541dab: '1.33.0',
  // 1.34.0 (2026-10-10): a diagnostic that writes down the rewards the game gives, with the seed
  // and the calling code (request "rewardtrace"). Reads only.
  c73ce1a1b3bf4af056426242aee1d4c7ed49efb7889d0cd3efa9da579a796cde: '1.34.0',
  // 1.35.0 (2026-10-10): items for another player of the session through the game's remote item
  // transaction (request "gift").
  '2d84c3aca63cb4ed31c97f9e933181a121d9761598abfbe0615dcec899f930dd': '1.35.0'
}
