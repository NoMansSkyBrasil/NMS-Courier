import type { Messages } from '../messages'

export const koKR: Messages = {
  app: { name: 'NMS Courier', tagline: 'No Man’s Sky 로컬 전달 도구' },
  sections: { obtain: '새로 얻기', upgrade: '업그레이드' },
  corvette: {
    title: '파일로 코르벳 만들기',
    hint: '공유된 코르벳 파일(.nmsship)을 선택하세요. 코르벳 건조가 그 함선이 조립된 상태로 시작되도록 앱이 게임을 준비합니다. 마무리는 게임에서 합니다. 파일을 준비한 뒤에는 게임을 다시 시작해야 합니다.',
    none: '아직 준비된 코르벳 파일이 없습니다.',
    current: '준비됨: {name}, 부품 {count}개.',
    parts: '부품 {count}개',
    hullParts: '선체 부품 {count}개',
    missing: '없음: {parts}. 게임이 경고를 표시하지만 건조는 됩니다.',
    partCockpit: '조종석',
    partLandingGear: '착륙 장치',
    partHabitation: '거주 모듈',
    partReactor: '반응로',
    rejectedTitle: '이 파일은 사용할 수 없습니다',
    rejectedShip: '일반 우주선이며 코르벳이 아닙니다. 파일로 우주선을 만드는 기능은 아직 없습니다.',
    rejectedInvalid: '올바른 코르벳 파일이 아닙니다.',
    installedTitle: '코르벳 준비 완료',
    installedBody:
      '게임이 열려 있으면 닫고 다시 시작하세요. 그런 다음 아래의 "코르벳 건조 시작"을 사용하세요.',
    installFailedTitle: '코르벳을 준비하지 못했습니다',
    installFailed: '게임 폴더에 파일을 쓸 수 없습니다.',
    choose: '파일 선택',
    install: '게임에 준비'
  },
  groups: {
    overview: '개요',
    deliver: '전달',
    unlock: '잠금 해제',
    rewards: '보상',
    library: '라이브러리',
    system: '시스템'
  },
  features: {
    dashboard: { title: '대시보드', summary: '지금 전달할 수 있는지와 그 이유.' },
    activity: { title: '활동', summary: '게임에 보낸 모든 요청과 그 결과.' },
    items: {
      title: '아이템',
      summary: '불러온 세이브의 인벤토리에 넣는 물질과 제품.'
    },
    currencies: { title: '통화', summary: '유닛, 나노 머신, 수은.' },
    exosuit: {
      title: '엑소슈트',
      summary: '엑소슈트의 등급, 화물·기술 슬롯, 과충전 슬롯.'
    },
    starships: {
      title: '우주선',
      summary: '보유한 우주선의 등급, 인벤토리 크기, 과충전 슬롯.'
    },
    multitools: {
      title: '멀티툴',
      summary: '장착한 멀티툴의 등급, 슬롯, 과충전 슬롯.'
    },
    freighters: {
      title: '화물선',
      summary: '선택한 등급, 모델, 시드로 제시되는 화물선.'
    },
    frigates: { title: '호위함', summary: '함대에 호위함 영입.' },
    corvettes: { title: '코르벳', summary: '공유된 설계로 건조하는 코르벳.' },
    companions: { title: '동료', summary: '동료 알과 생물.' },
    technologies: {
      title: '기술',
      summary: '캐릭터가 설치 방법을 아는 설계도.'
    },
    productRecipes: {
      title: '제작법',
      summary: '제작 가능한 아이템과 기술의 제작법.'
    },
    buildParts: {
      title: '건설 부품',
      summary: '건설 메뉴의 기지, 화물선, 장식 부품.'
    },
    refinerRecipes: {
      title: '정제와 요리',
      summary: '카탈로그의 정제기와 영양 처리기 조합법.'
    },
    customisation: {
      title: '외형',
      summary: '헬멧, 갑옷, 망토, 배너, 제트팩 궤적, 감정 표현.'
    },
    titles: { title: '칭호', summary: '배너에 표시되는 플레이어 칭호.' },
    fishing: { title: '낚시 기록', summary: '모든 물고기의 포획 기록.' },
    expeditions: {
      title: '탐험',
      summary: '지난 탐험의 보상. 수은 합성 동료에게서 수령할 수 있습니다.'
    },
    twitch: {
      title: 'Twitch 드롭',
      summary: 'Twitch 캠페인 보상. 수은 합성 동료에게서 수령할 수 있습니다.'
    },
    platform: {
      title: '플랫폼 및 예약 구매',
      summary: '플랫폼, 예약 구매 또는 이벤트에 연결된 보상.'
    },
    quicksilver: {
      title: '수은 상점',
      summary: '수은 합성 동료가 판매하는 아이템.'
    },
    catalog: { title: '게임 카탈로그', summary: '설치된 게임의 아이템을 검색합니다.' },
    models: {
      title: '모델 작업실',
      summary: '시드의 모습을 보거나 원하는 부품의 시드를 찾으세요.'
    },
    bridge: {
      title: '게임과 브리지',
      summary: '설치 위치, 게임 빌드, 실행 중인 게임과의 연결.'
    },
    saves: {
      title: '세이브와 계정',
      summary: '어떤 세이브 슬롯이 불러와졌는지, 계정 전체가 무엇을 공유하는지.'
    },
    settings: { title: '설정', summary: '언어, 화면 모양, 애플리케이션 정보.' }
  },
  status: { verified: '검증됨', experimental: '실험적', planned: '계획됨' },
  statusHint: {
    verified: '연구용 빌드의 실행 중인 게임에서 동작했습니다.',
    experimental: '일부만, 또는 알려진 조건에서만 동작합니다.',
    planned: '아직 만들어지지 않았습니다.'
  },
  scope: { slot: '세이브 슬롯', account: '계정', both: '세이브 슬롯과 계정', none: '변경 없음' },
  scopeHint: {
    slot: '불러온 세이브 슬롯만 변경합니다.',
    account: '모든 세이브 슬롯이 공유하는 계정을 변경합니다.',
    both: '불러온 세이브 슬롯과 계정을 변경합니다.',
    none: '읽기 전용이며 게임에서 아무것도 바뀌지 않습니다.'
  },
  rows: {
    deliverable: '전달 대상',
    blockedDamaged: '손상된 슬롯 항목(전달하지 않음)',
    blockedMaintenance: '유지 보수 항목(전달하지 않음)',
    blockedTemplates: '절차적 템플릿(전달하지 않음)',
    blockedById: '영구 규칙으로 차단됨',
    catalogueItems: '제작 가능한 아이템',
    craftableTechnology: '제작 가능한 기술',
    buildParts: '건설 부품',
    researchTree: '연구 단말기에서 판매',
    repeatableNever: '반복 구매 항목(잠금 해제하지 않음)',
    missionBound: '임무에 연결되어 제외됨',
    redeemedInSave: '세이브에 기록됨',
    itemRewards: '상점에서 수령할 아이템',
    total: '게임 내 전체'
  },
  rules: {
    gameRoutines:
      '모든 작업은 실행 중인 게임이 직접 수행합니다. 세이브 파일은 절대 편집하지 않습니다.',
    defectiveNever: '결함이 있거나 내부용인 항목은 어떤 모드에서도 전달하지 않습니다.',
    repeatableNever:
      '폭죽, 신화 비컨, 공허의 알은 잠금 해제하지 않습니다. 상점에서 더 이상 판매하지 않게 되기 때문입니다.',
    claimItems:
      '우주선, 멀티툴, 알, 꾸러미는 계정에서 잠금 해제됩니다. 아이템을 받으려면 상점에서 수령하세요.',
    keepList:
      'Twitch 드롭은 브리지가 설치되어 있는 동안에만 수령할 수 있습니다. 보관하려는 것은 수령해 두세요.',
    backup: '변경할 때마다 먼저 세이브 폴더를 복사합니다.',
    slotIdentified: '전달할 때마다 먼저 불러온 세이브 슬롯을 확인합니다.',
    accountShared: '계정 변경은 모든 세이브 슬롯에 적용되며 게임이 동기화합니다.'
  },
  page: {
    errorTitle: '이 페이지가 작동을 멈췄습니다',
    errorReload: '새로 고침',
    availabilityTitle: '이 창에서는 아직 사용할 수 없습니다',
    availabilityBody:
      '이 작업은 연구용 브리지로 수행했습니다. 이 애플리케이션과 게임의 연결은 아직 개발 중이므로 여기서는 아무것도 보낼 수 없습니다.',
    includes: '포함 범위',
    includesHint: '연구용 빌드 기준 수치입니다.',
    rulesTitle: '동작 방식',
    rulesHint: '항상 적용되는 규칙.',
    entries: '항목 수',
    kind: '종류',
    status: '상태',
    scope: '변경 대상',
    researchBuild: '연구용 빌드 {build}',
    plannedTitle: '아직 만들어지지 않았습니다',
    plannedBody: '이 영역은 계획되어 있습니다. 실행 중인 게임에서 동작하면 여기에 표시됩니다.',
    open: '열기'
  },
  dashboard: {
    heroBody:
      '아이템, 화폐, 잠금 해제를 실행 중인 내 게임으로 보냅니다. 모든 것은 게임 자체를 통해 이루어지고 저장 데이터는 절대 편집되지 않으며, 여기에 보이는 이름과 아이콘은 내 설치 위치에서 가져옵니다.',
    game: '게임',
    build: '게임 빌드',
    bridge: '브리지',
    catalog: '카탈로그',
    capabilities: 'Courier가 할 수 있는 일',
    capabilitiesHint: '각 영역이 무엇을 변경하고 어디까지 검증되었는지.',
    feature: '영역',
    area: '그룹',
    running: '실행 중',
    notRunning: '종료됨',
    notSelected: '설치 위치가 선택되지 않음',
    unknown: '알 수 없음',
    supported: '지원됨',
    unsupported: '지원되지 않음',
    connected: '연결됨',
    notConnected: '연결되지 않음',
    available: '사용 가능',
    unavailable: '생성되지 않음',
    entriesCount: '항목 {count}개',
    processId: '프로세스 {id}'
  },
  settings: {
    notifications: '게임 알림',
    notificationsHint:
      '전달된 항목에 대해 게임 자체 알림이 있으면 표시합니다. 끄면 알림 없이 전달합니다. 인벤토리 업그레이드는 확인을 요구하지 않습니다.',
    general: '일반',
    appearance: '화면 모양',
    about: '정보',
    language: '언어',
    languageHint: 'No Man’s Sky의 14개 언어.',
    theme: '테마',
    themeHint: '기본적으로 시스템 설정을 따릅니다.',
    experimental: '실험적 소프트웨어',
    experimentalBody:
      'NMS Courier는 개발 중인 비공식 도구입니다. 한 번에 정확히 하나의 게임 빌드에서만 동작합니다.'
  },
  delivery: {
    shipModel: {
      fighter: '투사',
      hauler: '화물운송인',
      explorer: '탐험가',
      shuttle: '셔틀',
      solar: '태양열',
      exotic: '이국적',
      living: 'Living Ship',
      interceptor: 'Interceptor'
    },
    toolModel: {
      pistol: '피스톨',
      rifle: '라이플',
      experimental: '실험형',
      alien: '외계',
      staff: '스태프'
    },
    equipSeedHint: '비워 두면 무작위 시드를 뽑습니다.',
    obtainAction: '제안 보내기',
    obtainShipHint:
      '게임이 자체 화면에서 이 종류, 시드, 등급의 새 우주선을 제안합니다. 컬렉션에 추가하거나 현재 우주선과 교환하거나 거절할 수 있습니다.',
    obtainToolHint:
      '게임이 자체 화면에서 이 종류, 시드, 등급의 새 멀티툴을 제안합니다. 컬렉션에 추가하거나 현재 것과 교환하거나 거절할 수 있습니다.',
    obtainPlanned: '여기서는 아직 새로 얻을 수 없습니다.',
    equipSceneEmpty: '모델을 찾을 수 없습니다.',
    freighterModel: {
      default: '게임이 선택',
      regular: '화물선',
      small: '소형 화물선',
      tiny: '초소형 화물선',
      capital: '대형 화물선',
      pirate: '해적 드레드노트'
    },
    equipScene: '모델',
    equipSceneHint: '선택 사항. 화물선 모델의 게임 장면이며, 비워 두면 게임의 선택을 따릅니다.',
    equipModelSeed: '모델 시드',
    equipHomeSeed: '모항 성계 시드',
    currencyAmountHint: '1부터 {max}(게임이 보관하는 최대 잔액)까지 원하는 금액.',
    itemsStack: '{count}개 묶음',
    equipActionLabel: '동작',
    equipTarget: '우주선',
    equipTargetCurrent: '현재 우주선',
    equipTargetSlot: '슬롯 {number}의 우주선',
    equipClass: '등급',
    equipSlots: '모든 인벤토리 슬롯',
    equipSlotsHint: '화물 및 기술 격자의 모든 위치를 사용할 수 있게 합니다.',
    equipSupercharge: '과충전 슬롯',
    equipSuperchargeHint: '사용 가능한 모든 기술 슬롯을 과충전 슬롯으로 만듭니다.',
    equipExtended: '추가 기술 줄',
    equipExtendedHint: '기술 격자를 12줄로 늘립니다. 모든 인벤토리 슬롯이 필요합니다.',
    currencyHint:
      '게임 자체 보상이 금액을 추가하고 알림을 표시합니다. 잔액은 게임의 최대치를 넘지 않습니다.',
    currencyLabel: '화폐',
    equipAction: {
      slotReward: '인벤토리 슬롯 하나 추가',
      grid: '인벤토리에 적용',
      classStep: '등급 한 단계 올리기',
      offer: '화물선 제안 보내기',
      build: '코르벳 건조 시작'
    },
    equipActionHint: {
      slotReward:
        '게임 자체의 슬롯 보상을 요청합니다. 게임 창이 열려 새 슬롯의 위치를 고를 수 있습니다.',
      grid: '이미 보유한 인벤토리를 그 자리에서 변경합니다. 게임에서 아무 창도 열리지 않습니다.',
      classStep:
        '게임 자체의 업그레이드 보상을 요청합니다. 요청 한 번에 등급이 한 단계씩, S까지 올라갑니다.',
      offer:
        '게임이 아래 옵션으로 화물선을 제안합니다. 게임에서 수락하면 현재 화물선을 대체합니다.',
      build: '게임이 아래 옵션으로 코르벳 건조를 엽니다.'
    },
    currencyName: { units: '유닛', nanites: '나나이트', quicksilver: '퀵실버' },
    itemsTitle: '게임으로 아이템 보내기',
    itemsHint:
      '물질과 제품은 불러온 저장 데이터의 엑소슈트 화물칸에, 게임이 허용하는 묶음 크기로 들어갑니다. 들어가지 않는 것은 전송되지 않습니다.',
    itemsAdd: '추가',
    itemsAmount: '수량',
    itemsRemove: '제거',
    itemsEmpty: '카탈로그에서 검색하여 보낼 아이템을 추가하세요.',
    itemsAction: '아이템 보내기 ({count})',
    itemsConfirm:
      '아이템은 지금 불러온 저장 데이터의 엑소슈트 화물칸에 들어갑니다. 먼저 저장 폴더가 백업됩니다. 변경 사항은 게임이 저장할 때 기록됩니다.',
    selectTitle: '보낼 항목 선택',
    selectHint: '하나, 여러 개 또는 전체를 선택하세요. 선택한 항목만 전송됩니다.',
    selectSearch: '이름 또는 ID로 검색',
    selectAllShown: '표시된 항목 모두 선택',
    selectClear: '선택 해제',
    selectCount: '{count}개 선택됨',
    selectShowing: '{total}개 중 {shown}개 표시 중입니다. 검색으로 목록을 좁히세요.',
    selectAction: '선택 항목 보내기 ({count})',
    selectNoCatalog: '이름은 게임에서 카탈로그를 읽은 뒤에 표시됩니다(라이브러리, 게임 카탈로그).',
    selectNone: '검색과 일치하는 항목이 없습니다.',
    title: '게임으로 보내기',
    hint: '이 개발 빌드의 연구용 브리지를 사용합니다.',
    action: '모두 전달',
    sending: '보내는 중…',
    confirmTitle: '실행 중인 게임으로 보낼까요?',
    confirmSlot: '지금 게임에서 불러온 세이브 슬롯을 변경합니다. 먼저 세이브 폴더를 복사합니다.',
    confirmAccount:
      '모든 세이브 슬롯이 공유하는 계정을 변경하며 게임이 이를 동기화합니다. 먼저 세이브 폴더와 설정 파일을 복사합니다.',
    confirm: '보내기',
    cancel: '취소',
    result: '결과',
    backup: '백업: {path}',
    time: '시간',
    activityEmptyTitle: '아직 보낸 것이 없습니다',
    activityEmptyBody: '이번 세션의 전달 내역이 여기에 표시됩니다.',
    state: {
      currency_data_missing:
        '화폐 데이터 파일이 게임의 모드 폴더에 없거나 버전이 다릅니다. 아무것도 전송되지 않았습니다.',
      selection_invalid:
        '선택 항목에 이 영역에서 제공하지 않는 항목이 있습니다. 아무것도 전송되지 않았습니다.',
      unavailable: '개발 빌드에서만 사용할 수 있습니다.',
      installation_not_selected: '먼저 게임 설치 위치를 선택하세요.',
      game_not_running: '게임을 실행하고 세이브를 불러오세요.',
      bridge_missing: '브리지가 게임 폴더에 설치되어 있지 않습니다.',
      bridge_untested: '설치된 브리지는 검증된 빌드가 아닙니다.',
      ready: '준비됨: 게임 실행 중, 프로세스 {id}.',
      busy: '다른 전달이 진행 중입니다.',
      backup_failed: '백업을 만들 수 없어 아무것도 보내지 않았습니다.'
    },
    outcome: {
      completed: '완료',
      unknown: '결과를 알 수 없음',
      failed: '실패',
      refused: '보내지 않음'
    },
    outcomeHint: {
      completed: '게임이 모든 요청에 응답했습니다. 유지하려면 게임에서 저장하세요.',
      unknown: '게임이 제때 응답하지 않았습니다. 다시 보내지 말고 게임에서 확인하세요.',
      failed: '요청이 게임에 도달하기 전에 거부되었습니다.',
      refused: '아무것도 보내지 않았습니다.'
    }
  },
  bridgePage: {
    versionApp: '앱 버전',
    versionBridge: '설치된 브리지 버전',
    versionNone: '설치되지 않음',
    versionOld: '이전 버전(버전 없음)',
    versionCurrent: '브리지가 최신 상태입니다.',
    versionOutdated: '브리지가 오래되었습니다. 이 앱에는 브리지 {version}이(가) 포함되어 있습니다.',
    detect: '자동으로 찾기',
    detecting: '찾는 중…',
    detectNone: '설치 위치를 찾지 못했습니다. 폴더를 직접 선택하세요.',
    detectSeveral: '설치 위치가 둘 이상 발견되었습니다. 플레이하는 설치 위치를 선택하세요.',
    installationTitle: '게임 설치 위치',
    installationSelected: '{name}이(가) 선택되었습니다.',
    installationNone: 'No Man’s Sky 설치 폴더를 선택하세요.',
    installationInvalid: '선택한 폴더는 올바른 No Man’s Sky 설치 위치가 아닙니다.',
    select: '설치 위치 선택',
    verifying: '확인 중…',
    bridgeTitle: '연구용 브리지',
    bridgeHint: '전달을 수행하는 게임 내부 구성 요소.',
    diagnosticsTitle: '읽기 전용 진단',
    diagnosticsHint:
      '전달 명령이 없는 비공개 런타임 호스트에 연결합니다. 게임을 닫을 때까지 이 창을 열어 두세요.',
    connect: '읽기 전용 런타임 연결',
    starting: '시작 중…',
    diagNotConnected: '연결된 진단 런타임이 없습니다.',
    diagHostReady: '런타임 호스트가 준비되어 게임을 기다리고 있습니다.',
    diagAuthenticated: '핸드셰이크 완료. 게임의 콜백을 기다리는 중입니다.',
    diagCallbackReady: '읽기 전용 콜백이 게임에서 활성화되었습니다.',
    diagFailed: '진단에 실패했습니다({reason}).',
    diagEnded: '진단 세션이 게임과 함께 종료되었습니다.'
  },
  catalogPage: {
    generate: '게임에서 읽기',
    refresh: '다시 읽기',
    generating: '게임 파일을 읽는 중…',
    generateHint:
      '카탈로그는 사용자의 설치 위치에서 읽습니다. 게임 폴더는 변경되지 않으며 저장 데이터도 열지 않습니다.',
    imported: '게임에서 {count}개 항목을 읽었습니다.',
    failInstallation: '먼저 게임 설치 위치를 선택하세요.',
    failArchives: '선택한 설치 위치에서 게임 데이터 파일을 찾지 못했습니다.',
    failStructure:
      '게임이 업데이트되어 테이블이 변경되었습니다. 이 버전의 앱은 아직 읽을 수 없습니다.',
    failUnreadable: '게임 데이터 파일을 읽을 수 없습니다.',
    unavailableTitle: '로컬 카탈로그를 사용할 수 없습니다',
    unavailableBody: '이 애플리케이션 프로필에는 아직 생성된 카탈로그가 없습니다.',
    title: '로컬 카탈로그',
    description:
      '선택한 게임 설치 위치에서 추출한 읽기 전용 정의입니다. 결과가 표시되어도 해당 아이템을 전달할 수 있다는 뜻은 아닙니다.',
    buildBadge: '빌드 {build}',
    searchLabel: '로컬 카탈로그 검색',
    searchPlaceholder: '이름 또는 게임 ID로 검색',
    all: '전체',
    substance: '물질',
    product: '제품',
    technology: '기술',
    matching: '일치하는 정의 {count}개',
    loading: '정의를 불러오는 중…',
    languages: '게임 언어 {count}개'
  },
  workshop: {
    title: '모델 작업실',
    description:
      '보고 싶은 것을 고른 뒤 시드를 입력하거나, 무작위로 뽑거나, 부품을 골라 그 부품을 가진 시드를 앱이 찾게 하세요.',
    tabBuild: '조립',
    tabView: '시드 보기',
    buildDescription:
      '종류, 부품, 주 색상을 고르세요. 앱이 그 조합을 가진 시드를 찾아 보여 줍니다.',
    viewDescription: '종류를 고르고 시드를 입력하거나 무작위로 뽑아 모습을 확인하세요.',
    colorTitle: '색상',
    roles: {
      primary: '주 색상',
      secondary: '보조 색상',
      decal1: '데칼 색상 1',
      decal2: '데칼 색상 2'
    },
    baseTextureTitle: '기본 텍스처',
    baseTexture: { COATING: '코팅', PAINTED: '도장', PANELS: '금속' },
    seedTexturesTitle: '이 시드의 텍스처와 데칼',
    colorHint: '게임의 도장 팔레트 색상입니다. 아무거나는 시드에 맡깁니다.',
    seedColorsTitle: '이 시드의 색상',
    paintLabel: '도장',
    undercoatLabel: '밑칠',
    tabFile: '모델 파일',
    categoryLabel: '분류',
    category: { starship: '우주선', multitool: '멀티툴', freighter: '화물선' },
    kindLabel: '종류',
    toolKind: {
      standard: '표준',
      royal: '로열',
      sentinel: '센티넬',
      sentinelB: '센티넬 B',
      atlasSceptre: '아틀라스 홀',
      atlas: '아틀라스',
      staff: '지팡이'
    },
    seedLabel: '시드',
    seedHint: '0x 뒤에 16자리 16진수. Enter 키나 표시를 눌러 확인하세요.',
    show: '표시',
    generate: '시드 생성',
    generateWithParts: '이 부품으로 생성',
    clearParts: '부품 선택 지우기',
    getInGame: '게임에서 이것 얻기',
    found: '{tries}번 시도 끝에 시드를 찾았습니다',
    building: '모델을 조립하는 중…',
    empty: '아직 표시할 것이 없습니다',
    partsTitle: '부품',
    partsHint:
      '원하는 부품을 고르고 나머지는 아무거나로 두세요. 자체 부품이 있는 부품 아래에는 목록이 더 나타납니다.',
    anyPart: '아무거나',
    rare: '희귀',
    detailsTitle: '시드가 정한 세부 사항',
    note: '모델은 사용자의 게임 파일에서 읽습니다. 부품, 텍스처 레이어, 데칼, 색상은 시드를 따르며 조명과 재질 효과는 단순화되어 있습니다. 알려진 시드 하나에 대해서는 이 모든 것이 독립적인 도구의 결과와 같지만, 실행 중인 게임과는 아직 비교하지 않았습니다. 화물선은 색상 없이 표시됩니다. 화물선의 색상은 항성계에서 정해집니다.',
    errors: {
      INSTALLATION_NOT_SELECTED: '먼저 브리지에서 게임 폴더를 선택하세요.',
      UNKNOWN_KIND: '이 종류는 사용할 수 없습니다.',
      INVALID_SEED: '시드는 0x 뒤에 최대 16자리 16진수여야 합니다.',
      GAME_FILES_UNREADABLE: '이 모델의 게임 파일을 읽을 수 없습니다.',
      MODEL_TOO_LARGE: '이 모델은 너무 커서 표시할 수 없습니다.',
      SEED_NOT_FOUND:
        '제한 시간 안에 이 부품을 가진 시드를 찾지 못했습니다. 다시 시도하거나 부품 하나를 자유롭게 두세요.'
    }
  },
  preview: {
    title: '모델 작업실',
    description: '로컬의 정적 GLB 모델을 살펴보고 표시할 부품을 조합합니다.',
    stage: '실험적 미리 보기',
    import: 'GLB 모델 열기',
    loading: '모델을 불러오는 중…',
    empty: '시작하려면 로컬 모델을 선택하세요',
    hint: '드래그하여 회전하고, 스크롤하여 확대/축소하고, 오른쪽 버튼으로 드래그하여 이동합니다.',
    limits:
      '이 버전은 내장 PNG 텍스처만 사용하고 외부 리소스가 없는 64MiB 이하의 정적 GLB 파일을 지원합니다. NMS 에셋의 네이티브 변환은 아직 연결되지 않았습니다.',
    warning:
      '부품 선택과 색조는 이 미리 보기에만 적용됩니다. 시드를 계산하거나 우주선을 전달하지 않습니다.',
    parts: '표시 중인 부품',
    all: '모두 표시',
    none: '모두 숨기기',
    filter: '이름으로 부품 필터링',
    tint: '미리 보기 색조',
    original: '모델 색상 복원',
    reset: '카메라 초기화',
    palettes: '게임 팔레트',
    paletteHelp: '지원되는 데이터 세트에서 추출한 BASECOLOURPALETTES.MBIN을 여세요.',
    importPalette: '팔레트 MBIN 열기',
    seed: '실험적 색상 시드',
    calculatePalette: '색상 샘플 계산',
    calculatedSeed: '계산된 시드',
    family: '팔레트 계열',
    samples: '색상 샘플 5개',
    sample: '색상 샘플',
    paletteIndex: '원본 색상',
    colorTarget: '적용 대상',
    visibleTarget: '표시 중인 모든 부품',
    applyColor: '선택한 색상 적용',
    paletteWarning:
      '기본 팔레트의 실험적 계산입니다. RGB 샘플은 부품의 색만 바꾸며, 네이티브 텍스처 마스크나 우주선 외형, 역산한 시드를 예측하지 않습니다.',
    INVALID_PALETTE: '이 파일은 지원되는 기본 팔레트의 지문과 일치하지 않습니다.',
    INVALID_SEED: '0x 뒤에 16진수 1~16자리를 입력하세요.',
    PALETTE_UNAVAILABLE: '색상을 계산하기 전에 지원되는 팔레트 파일을 여세요.',
    failed: '모델을 표시할 수 없습니다.',
    INVALID_MODEL: '이 파일은 미리 보기 한도 내의 올바른 모델이 아닙니다.',
    UNSUPPORTED_MODEL:
      '이 모델은 지원 범위를 벗어난 텍스처, 애니메이션, 확장 또는 지오메트리를 사용합니다.',
    FILE_UNAVAILABLE: '선택한 파일을 읽을 수 없습니다.'
  },
  appearance: {
    title: '시드 기반 외형 레시피',
    open: '외형 레시피 열기',
    apply: '레시피를 미리 보기에 적용',
    help: '메시 연결이 명시된 레시피나 시드 검색 보고서를 가져옵니다.',
    warning:
      '후보 미리 보기: 명시된 부품과 RGB 샘플만 포함합니다. 네이티브 DDS 텍스처, 마스크, 셰이더는 재현되지 않습니다.',
    mismatch: '모델 지문 또는 메시 이름이 일치하지 않습니다. 변경 사항이 적용되지 않았습니다.',
    failed: '파일을 지원되는 외형 레시피로 읽을 수 없습니다.',
    seed: '후보 시드',
    applied: '레시피가 미리 보기에 적용됨',
    candidate: '부분 평가기 후보'
  },
  controls: {
    changeLanguage: '언어 변경',
    changeTheme: '테마 변경',
    light: '라이트',
    dark: '다크',
    system: '시스템'
  }
}
