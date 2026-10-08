import type { Messages } from '../messages'

export const koKR: Messages = {
  app: { name: 'NMS Courier', tagline: 'No Man’s Sky 로컬 전달 도구' },
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
      summary: '가져온 모델과 색상 팔레트를 미리 봅니다.'
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
  controls: {
    changeLanguage: '언어 변경',
    changeTheme: '테마 변경',
    light: '라이트',
    dark: '다크',
    system: '시스템'
  }
}
