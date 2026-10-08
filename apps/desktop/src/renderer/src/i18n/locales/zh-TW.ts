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
    heroBody:
      '把物品、貨幣和解鎖內容傳送到你自己正在執行的遊戲。一切都透過遊戲本身完成，絕不編輯你的存檔；這裡顯示的名稱和圖示都來自你的遊戲安裝。',
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
    notifications: '遊戲通知',
    notificationsHint:
      '對於交付的內容，如果遊戲有自己的通知，就讓它顯示。關閉後將靜默交付。物品欄升級從不要求確認。',
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
  delivery: {
    currencyAmountHint: '1 到 {max}（遊戲能保存的最大餘額）之間的任意數額。',
    itemsStack: '每疊 {count}',
    equipActionLabel: '操作',
    equipTarget: '星艦',
    equipTargetCurrent: '目前的星艦',
    equipTargetSlot: '欄位 {number} 的星艦',
    equipClass: '等級',
    equipSlots: '全部物品欄格子',
    equipSlotsHint: '讓貨艙和科技網格的每個位置都可使用。',
    equipSupercharge: '超載格子',
    equipSuperchargeHint: '將每個可用的科技格子變為超載格子。',
    equipExtended: '額外科技列',
    equipExtendedHint: '將科技網格擴充到十二列。需要啟用全部物品欄格子。',
    currencyHint: '由遊戲自身的獎勵增加數額並顯示通知。餘額不會超過遊戲的上限。',
    currencyLabel: '貨幣',
    equipAction: {
      grid: '套用到物品欄',
      classStep: '等級提升一級',
      offer: '傳送貨船報價',
      build: '開始建造護衛艦'
    },
    equipActionHint: {
      grid: '就地修改你已擁有的物品欄。遊戲內不會開啟任何介面。',
      classStep: '向遊戲要求其自身的升級獎勵：每次要求提升一級，最高到 S。',
      offer: '遊戲會依下方選項向你提供一艘貨船。在遊戲中接受後，它會取代你目前的貨船。',
      build: '遊戲會依下方選項開啟護衛艦建造。'
    },
    currencyName: { units: '單位', nanites: '奈米機械', quicksilver: '水銀' },
    itemsTitle: '向遊戲傳送物品',
    itemsHint:
      '物質和產品會放入已載入存檔的外骨骼裝貨艙，依遊戲允許的堆疊數量存放。放不下的部分不會傳送。',
    itemsAdd: '新增',
    itemsAmount: '數量',
    itemsRemove: '移除',
    itemsEmpty: '在目錄中搜尋並新增要傳送的物品。',
    itemsAction: '傳送物品（{count}）',
    itemsConfirm:
      '物品會放入目前已載入存檔的外骨骼裝貨艙。傳送前會先備份存檔資料夾。遊戲儲存時變更才會寫入存檔。',
    selectTitle: '選擇要傳送的內容',
    selectHint: '可以勾選一個、多個或全部項目。只會傳送所選項目。',
    selectSearch: '依名稱或 ID 搜尋',
    selectAllShown: '全選目前顯示的項目',
    selectClear: '清除選取',
    selectCount: '已選取 {count} 項',
    selectShowing: '正在顯示 {total} 項中的 {shown} 項。請使用搜尋縮小清單。',
    selectAction: '傳送所選（{count}）',
    selectNoCatalog: '從遊戲讀取目錄後會顯示名稱（資料庫 → 遊戲目錄）。',
    selectNone: '沒有符合搜尋的項目。',
    title: '傳送到遊戲',
    hint: '使用此開發版本的研究用橋接。',
    action: '全部遞送',
    sending: '正在傳送…',
    confirmTitle: '要傳送到執行中的遊戲嗎？',
    confirmSlot: '這會變更遊戲目前載入的存檔欄位。傳送前會先複製存檔資料夾。',
    confirmAccount:
      '這會變更所有存檔欄位共用的帳號，並由遊戲同步。傳送前會先複製存檔資料夾和設定檔。',
    confirm: '傳送',
    cancel: '取消',
    result: '結果',
    backup: '備份：{path}',
    time: '時間',
    activityEmptyTitle: '尚未傳送任何內容',
    activityEmptyBody: '本次工作階段的遞送會顯示在這裡。',
    state: {
      currency_data_missing: '貨幣資料檔案不在遊戲的模組資料夾中，或版本不同。未傳送任何內容。',
      selection_invalid: '所選內容包含此區域未提供的項目。未傳送任何內容。',
      unavailable: '僅在開發版本中可用。',
      installation_not_selected: '請先選擇遊戲安裝位置。',
      game_not_running: '請啟動遊戲並載入存檔。',
      bridge_missing: '遊戲資料夾中未安裝橋接。',
      bridge_untested: '已安裝的橋接不是經過測試的版本。',
      ready: '就緒：遊戲執行中，處理程序 {id}。',
      busy: '另一項遞送正在進行。',
      backup_failed: '無法建立備份；未傳送任何內容。'
    },
    outcome: {
      completed: '完成',
      unknown: '結果未知',
      failed: '失敗',
      refused: '未傳送'
    },
    outcomeHint: {
      completed: '遊戲已回應所有要求。請在遊戲中存檔以保留結果。',
      unknown: '遊戲未及時回應。請勿再次傳送；請在遊戲中確認。',
      failed: '要求在到達遊戲之前遭到拒絕。',
      refused: '未傳送任何內容。'
    }
  },
  bridgePage: {
    versionApp: '應用程式版本',
    versionBridge: '已安裝的橋接版本',
    versionNone: '未安裝',
    versionOld: '舊版，無版本號',
    versionCurrent: '橋接已是最新版本。',
    versionOutdated: '橋接版本已過期。此應用程式附帶的橋接版本為 {version}。',
    detect: '自動偵測',
    detecting: '正在尋找…',
    detectNone: '找不到安裝位置。請手動選擇資料夾。',
    detectSeveral: '找到多個安裝位置。請選擇你用來遊玩的那一個。',
    installationTitle: '遊戲安裝位置',
    installationSelected: '已選擇 {name}。',
    installationNone: '請選擇 No Man’s Sky 的安裝資料夾。',
    installationInvalid: '所選資料夾不是有效的 No Man’s Sky 安裝位置。',
    select: '選擇安裝位置',
    verifying: '正在驗證…',
    bridgeTitle: '研究用橋接',
    bridgeHint: '遊戲內部負責執行遞送的元件。',
    diagnosticsTitle: '唯讀診斷',
    diagnosticsHint: '連線到沒有任何遞送命令的私有執行階段主機。在關閉遊戲之前，請保持此視窗開啟。',
    connect: '連線唯讀執行階段',
    starting: '正在啟動…',
    diagNotConnected: '未連線診斷執行階段。',
    diagHostReady: '執行階段主機已就緒，正在等待遊戲。',
    diagAuthenticated: '交握完成；正在等待遊戲的回呼。',
    diagCallbackReady: '唯讀回呼已在遊戲中啟用。',
    diagFailed: '診斷失敗（{reason}）。',
    diagEnded: '診斷工作階段已隨遊戲結束。'
  },
  catalogPage: {
    generate: '從遊戲讀取',
    refresh: '重新讀取',
    generating: '正在讀取遊戲檔案…',
    generateHint:
      '目錄會從你自己的遊戲安裝中讀取。不會變更遊戲資料夾中的任何內容，也不會開啟任何存檔。',
    imported: '已從遊戲讀取 {count} 個項目。',
    failInstallation: '請先選擇遊戲安裝位置。',
    failArchives: '在所選的安裝位置中找不到遊戲資料檔案。',
    failStructure: '遊戲已更新，資料表有所變動。此版本的應用程式暫時無法讀取。',
    failUnreadable: '無法讀取遊戲資料檔案。',
    unavailableTitle: '本機目錄無法使用',
    unavailableBody: '此應用程式設定檔中尚未產生目錄。',
    title: '本機目錄',
    description: '從所選遊戲安裝位置擷取的唯讀定義。有結果並不代表該物品可以遞送。',
    buildBadge: '版本 {build}',
    searchLabel: '搜尋本機目錄',
    searchPlaceholder: '依名稱或遊戲 ID 搜尋',
    all: '全部',
    substance: '物質',
    product: '產品',
    technology: '科技',
    matching: '{count} 個相符的定義',
    loading: '正在載入定義…',
    languages: '{count} 種遊戲語言'
  },
  preview: {
    title: '模型工坊',
    description: '檢視本機靜態 GLB 模型，並組合其可見部件。',
    stage: '實驗性預覽',
    import: '開啟 GLB 模型',
    loading: '正在載入模型…',
    empty: '選擇一個本機模型以開始',
    hint: '拖曳可旋轉，捲動可縮放，按右鍵拖曳可平移。',
    limits:
      '此版本支援不超過 64 MiB 的靜態 GLB 檔案，僅限內嵌 PNG 材質且不含外部資源。NMS 資源的原生轉換尚未接入。',
    warning: '部件選擇和色調只影響此預覽，不會計算種子，也不會遞送飛船。',
    parts: '可見部件',
    all: '全部顯示',
    none: '全部隱藏',
    filter: '依名稱篩選部件',
    tint: '預覽色調',
    original: '還原模型顏色',
    reset: '重設攝影機',
    palettes: '遊戲調色盤',
    paletteHelp: '請開啟從支援的資料集中擷取的 BASECOLOURPALETTES.MBIN。',
    importPalette: '開啟調色盤 MBIN',
    seed: '實驗性顏色種子',
    calculatePalette: '計算顏色樣本',
    calculatedSeed: '計算出的種子',
    family: '調色盤系列',
    samples: '五個顏色樣本',
    sample: '顏色樣本',
    paletteIndex: '來源顏色',
    colorTarget: '套用至',
    visibleTarget: '所有可見部件',
    applyColor: '套用所選顏色',
    paletteWarning:
      '基礎調色盤的實驗性計算。RGB 樣本只為部件重新上色，無法預測原生材質遮罩、飛船外觀或反推的種子。',
    INVALID_PALETTE: '此檔案與支援的基礎調色盤指紋不符。',
    INVALID_SEED: '請輸入 0x，後接 1 到 16 位十六進位數字。',
    PALETTE_UNAVAILABLE: '計算顏色前，請先開啟支援的調色盤檔案。',
    failed: '無法算繪該模型。',
    INVALID_MODEL: '該檔案不是預覽限制範圍內的有效模型。',
    UNSUPPORTED_MODEL: '此模型使用了支援範圍以外的材質、動畫、擴充功能或幾何體。',
    FILE_UNAVAILABLE: '無法讀取所選檔案。'
  },
  appearance: {
    title: '依種子的外觀配方',
    open: '開啟外觀配方',
    apply: '將配方套用到預覽',
    help: '匯入帶有明確網格繫結的配方或種子搜尋報告。',
    warning: '候選預覽：僅包含明確指定的部件和 RGB 樣本。不會還原原生 DDS 材質、遮罩和著色器。',
    mismatch: '模型指紋或網格名稱不符。未套用任何變更。',
    failed: '無法將該檔案讀取為支援的外觀配方。',
    seed: '候選種子',
    applied: '配方已套用到預覽',
    candidate: '部分評估器候選'
  },
  controls: {
    changeLanguage: '變更語言',
    changeTheme: '變更主題',
    light: '淺色',
    dark: '深色',
    system: '系統'
  }
}
