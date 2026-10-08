import type { Messages } from '../messages'

export const zhTW: Messages = {
  app: { name: 'NMS Courier', tagline: 'No Man’s Sky 本機遞送工具' },
  groups: {
    overview: '總覽',
    deliver: '遞送',
    unlock: '解鎖',
    rewards: '獎勵',
    library: '資料庫',
    system: '系統'
  },
  features: {
    dashboard: { title: '儀表板', summary: '目前能否遞送，以及原因。' },
    activity: { title: '活動', summary: '傳送給遊戲的每個要求及其結果。' },
    items: {
      title: '物品',
      summary: '放入已載入存檔的物品欄中的物質和產品。'
    },
    currencies: { title: '貨幣', summary: '單位、奈米機械和水銀。' },
    exosuit: {
      title: '外骨骼裝甲',
      summary: '外骨骼裝甲的等級、貨物與科技欄位以及超充能欄位。'
    },
    starships: {
      title: '星際飛船',
      summary: '你擁有的星際飛船的等級、物品欄大小和超充能欄位。'
    },
    multitools: {
      title: '多功能工具',
      summary: '已裝備多功能工具的等級、欄位和超充能欄位。'
    },
    freighters: {
      title: '貨船',
      summary: '依所選等級、型號和種子產生的貨船報價。'
    },
    frigates: { title: '護衛艦', summary: '為艦隊招募護衛艦。' },
    corvettes: { title: '輕型護衛艦', summary: '依據共享的配置建造的輕型護衛艦。' },
    companions: { title: '夥伴', summary: '夥伴蛋和生物。' },
    technologies: {
      title: '科技',
      summary: '角色已掌握安裝方法的藍圖。'
    },
    productRecipes: {
      title: '製作配方',
      summary: '可製作物品和可製作科技的配方。'
    },
    buildParts: {
      title: '建造部件',
      summary: '建造選單中的基地、貨船和裝飾部件。'
    },
    refinerRecipes: {
      title: '精煉與烹飪',
      summary: '目錄中的精煉機和營養處理器配方。'
    },
    customisation: {
      title: '外觀',
      summary: '頭盔、護甲、披風、旗幟、噴射背包尾跡和表情動作。'
    },
    titles: { title: '稱號', summary: '用於旗幟的玩家稱號。' },
    fishing: { title: '釣魚紀錄', summary: '每種魚的捕獲紀錄。' },
    expeditions: {
      title: '遠征',
      summary: '過往遠征的獎勵，可在水銀合成夥伴處領取。'
    },
    twitch: {
      title: 'Twitch 掉寶',
      summary: 'Twitch 活動獎勵，可在水銀合成夥伴處領取。'
    },
    platform: {
      title: '平台與預購',
      summary: '與平台、預購或活動綁定的獎勵。'
    },
    quicksilver: {
      title: '水銀商店',
      summary: '水銀合成夥伴販售的物品。'
    },
    catalog: { title: '遊戲目錄', summary: '搜尋已安裝遊戲中的物品。' },
    models: {
      title: '模型工坊',
      summary: '預覽匯入的模型和調色盤。'
    },
    bridge: {
      title: '遊戲與橋接',
      summary: '安裝位置、遊戲版本以及與執行中遊戲的連線。'
    },
    saves: {
      title: '存檔與帳號',
      summary: '目前載入的是哪個存檔欄位，以及整個帳號共用哪些內容。'
    },
    settings: { title: '設定', summary: '語言、外觀和應用程式詳細資訊。' }
  },
  status: { verified: '已驗證', experimental: '實驗性', planned: '規劃中' },
  statusHint: {
    verified: '已在研究版本的執行中遊戲裡成功。',
    experimental: '僅部分可用，或只在已知條件下可用。',
    planned: '尚未建置。'
  },
  scope: { slot: '存檔欄位', account: '帳號', both: '存檔欄位和帳號', none: '無變更' },
  scopeHint: {
    slot: '只變更目前載入的存檔欄位。',
    account: '變更所有存檔欄位共用的帳號。',
    both: '變更目前載入的存檔欄位和帳號。',
    none: '唯讀；遊戲中不會有任何變化。'
  },
  rows: {
    deliverable: '可遞送',
    blockedDamaged: '損壞欄位項目，絕不遞送',
    blockedMaintenance: '維護項目，絕不遞送',
    blockedTemplates: '程序化範本，絕不遞送',
    blockedById: '被永久規則封鎖',
    catalogueItems: '可製作物品',
    craftableTechnology: '可製作科技',
    buildParts: '建造部件',
    researchTree: '在研究終端販售',
    repeatableNever: '可重複購買，絕不解鎖',
    missionBound: '與任務綁定，已略過',
    redeemedInSave: '已記錄在存檔中',
    itemRewards: '需在商店領取的物品',
    total: '遊戲內總數'
  },
  rules: {
    gameRoutines: '一切都由執行中的遊戲自行完成。絕不編輯存檔檔案。',
    defectiveNever: '有缺陷的項目和內部項目在任何模式下都絕不遞送。',
    repeatableNever: '煙火、神話信標和虛空蛋絕不解鎖：否則商店將不再販售它們。',
    claimItems: '飛船、多功能工具、蛋和禮包在帳號上解鎖；請在商店領取以獲得物品。',
    keepList: 'Twitch 掉寶僅在橋接已安裝時可領取。請領取你想保留的內容。',
    backup: '每次變更前都會複製存檔資料夾。',
    slotIdentified: '每次遞送前都會辨識目前載入的存檔欄位。',
    accountShared: '帳號變更會套用到所有存檔欄位，並由遊戲同步。'
  },
  page: {
    availabilityTitle: '暫時無法從此視窗使用',
    availabilityBody:
      '這是透過研究用橋接完成的。本應用程式與遊戲的連線仍在建置中，因此無法從這裡傳送任何內容。',
    includes: '涵蓋內容',
    includesHint: '研究版本的數據。',
    rulesTitle: '運作方式',
    rulesHint: '一律適用的規則。',
    entries: '項目',
    kind: '類別',
    status: '狀態',
    scope: '變更對象',
    researchBuild: '研究版本 {build}',
    plannedTitle: '尚未建置',
    plannedBody: '此區域已列入規劃。當它能在執行中的遊戲裡運作時，會顯示在這裡。',
    open: '開啟'
  },
  dashboard: {
    game: '遊戲',
    build: '遊戲版本',
    bridge: '橋接',
    catalog: '目錄',
    capabilities: 'Courier 能做什麼',
    capabilitiesHint: '每個區域會變更什麼，以及已驗證到何種程度。',
    feature: '區域',
    area: '群組',
    running: '執行中',
    notRunning: '未執行',
    notSelected: '未選擇安裝位置',
    unknown: '未知',
    supported: '支援',
    unsupported: '不支援',
    connected: '已連線',
    notConnected: '未連線',
    available: '可用',
    unavailable: '未產生',
    entriesCount: '{count} 個項目',
    processId: '處理程序 {id}'
  },
  settings: {
    general: '一般',
    appearance: '外觀',
    about: '關於',
    language: '語言',
    languageHint: 'No Man’s Sky 的十四種語言。',
    theme: '主題',
    themeHint: '預設跟隨系統。',
    experimental: '實驗性軟體',
    experimentalBody: 'NMS Courier 是一款開發中的非官方工具。它一次只支援一個確切的遊戲版本。'
  },
  controls: {
    changeLanguage: '變更語言',
    changeTheme: '變更主題',
    light: '淺色',
    dark: '深色',
    system: '系統'
  }
}
