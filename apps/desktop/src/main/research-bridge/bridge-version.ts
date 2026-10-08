// Versions of the bridge (the research profile DLL) this application knows, by the SHA-256 of the
// built file. The version itself is compiled into the DLL from
// runtime/native/asi/profile_180836/bridge_version.h; a new build adds a line here in the same change.

// The bridge this version of the application was built and tested with.
export const bridgeVersion = '1.2.0'

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
  e28e6279c17da7d65d7bd96a14eec0bf266998818a7941ff001fd3fc567bff0c: '1.2.0'
}
