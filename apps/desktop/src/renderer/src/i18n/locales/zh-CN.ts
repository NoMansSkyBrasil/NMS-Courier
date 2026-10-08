import type { Messages } from '../messages'

export const zhCN: Messages = {
  app: { name: 'NMS Courier', tagline: 'No Man’s Sky 本地投递工具' },
  groups: {
    overview: '概览',
    deliver: '投递',
    unlock: '解锁',
    rewards: '奖励',
    library: '资料库',
    system: '系统'
  },
  features: {
    dashboard: { title: '仪表板', summary: '当前能否投递，以及原因。' },
    activity: { title: '活动', summary: '发送给游戏的每个请求及其结果。' },
    items: {
      title: '物品',
      summary: '放入已加载存档的库存中的物质和产品。'
    },
    currencies: { title: '货币', summary: '单位、纳米机械和水银。' },
    exosuit: {
      title: '外骨骼套装',
      summary: '外骨骼套装的等级、货物与科技栏位以及超充能栏位。'
    },
    starships: {
      title: '星际飞船',
      summary: '你拥有的星际飞船的等级、库存大小和超充能栏位。'
    },
    multitools: {
      title: '多功能工具',
      summary: '已装备多功能工具的等级、栏位和超充能栏位。'
    },
    freighters: {
      title: '货船',
      summary: '按所选等级、型号和种子生成的货船报价。'
    },
    frigates: { title: '护卫舰', summary: '为舰队招募护卫舰。' },
    corvettes: { title: '轻型护卫舰', summary: '根据共享的布局建造的轻型护卫舰。' },
    companions: { title: '同伴', summary: '同伴蛋和生物。' },
    technologies: {
      title: '科技',
      summary: '角色已掌握安装方法的蓝图。'
    },
    productRecipes: {
      title: '制作配方',
      summary: '可制作物品和可制作科技的配方。'
    },
    buildParts: {
      title: '建造部件',
      summary: '建造菜单中的基地、货船和装饰部件。'
    },
    refinerRecipes: {
      title: '精炼与烹饪',
      summary: '目录中的精炼机和营养处理器配方。'
    },
    customisation: {
      title: '外观',
      summary: '头盔、护甲、披风、旗帜、喷气背包尾迹和表情动作。'
    },
    titles: { title: '称号', summary: '用于旗帜的玩家称号。' },
    fishing: { title: '钓鱼记录', summary: '每种鱼的捕获记录。' },
    expeditions: {
      title: '远征',
      summary: '往期远征的奖励，可在水银合成同伴处领取。'
    },
    twitch: {
      title: 'Twitch 掉宝',
      summary: 'Twitch 活动奖励，可在水银合成同伴处领取。'
    },
    platform: {
      title: '平台与预购',
      summary: '与平台、预购或活动绑定的奖励。'
    },
    quicksilver: {
      title: '水银商店',
      summary: '水银合成同伴出售的物品。'
    },
    catalog: { title: '游戏目录', summary: '搜索已安装游戏中的物品。' },
    models: {
      title: '模型工坊',
      summary: '预览导入的模型和调色板。'
    },
    bridge: {
      title: '游戏与桥接',
      summary: '安装位置、游戏版本以及与运行中游戏的连接。'
    },
    saves: {
      title: '存档与账号',
      summary: '当前加载的是哪个存档栏位，以及整个账号共享哪些内容。'
    },
    settings: { title: '设置', summary: '语言、外观和应用详情。' }
  },
  status: { verified: '已验证', experimental: '实验性', planned: '计划中' },
  statusHint: {
    verified: '已在研究版本的运行中游戏里成功。',
    experimental: '仅部分可用，或只在已知条件下可用。',
    planned: '尚未构建。'
  },
  scope: { slot: '存档栏位', account: '账号', both: '存档栏位和账号', none: '无更改' },
  scopeHint: {
    slot: '只更改当前加载的存档栏位。',
    account: '更改所有存档栏位共享的账号。',
    both: '更改当前加载的存档栏位和账号。',
    none: '只读；游戏中不会有任何变化。'
  },
  rows: {
    deliverable: '可投递',
    blockedDamaged: '损坏栏位条目，绝不投递',
    blockedMaintenance: '维护条目，绝不投递',
    blockedTemplates: '程序化模板，绝不投递',
    blockedById: '被永久规则屏蔽',
    catalogueItems: '可制作物品',
    craftableTechnology: '可制作科技',
    buildParts: '建造部件',
    researchTree: '在研究终端出售',
    repeatableNever: '可重复购买，绝不解锁',
    missionBound: '与任务绑定，已跳过',
    redeemedInSave: '已记录在存档中',
    itemRewards: '需在商店领取的物品',
    total: '游戏内总数'
  },
  rules: {
    gameRoutines: '一切都由运行中的游戏自身完成。绝不编辑存档文件。',
    defectiveNever: '有缺陷的条目和内部条目在任何模式下都绝不投递。',
    repeatableNever: '烟花、神话信标和虚空蛋绝不解锁：否则商店将不再出售它们。',
    claimItems: '飞船、多功能工具、蛋和礼包在账号上解锁；请在商店领取以获得物品。',
    keepList: 'Twitch 掉宝仅在桥接已安装时可领取。请领取你想保留的内容。',
    backup: '每次更改前都会复制存档文件夹。',
    slotIdentified: '每次投递前都会识别当前加载的存档栏位。',
    accountShared: '账号更改会作用于所有存档栏位，并由游戏同步。'
  },
  page: {
    availabilityTitle: '暂时无法从此窗口使用',
    availabilityBody:
      '这是通过研究用桥接完成的。本应用与游戏的连接仍在构建中，因此无法从这里发送任何内容。',
    includes: '涵盖内容',
    includesHint: '研究版本的数据。',
    rulesTitle: '行为方式',
    rulesHint: '始终适用的规则。',
    entries: '条目',
    kind: '类别',
    status: '状态',
    scope: '更改对象',
    researchBuild: '研究版本 {build}',
    plannedTitle: '尚未构建',
    plannedBody: '此区域已列入计划。当它能在运行中的游戏里工作时，会显示在这里。',
    open: '打开'
  },
  dashboard: {
    heroBody:
      '把物品、货币和解锁内容发送到你自己正在运行的游戏。一切都通过游戏本身完成，绝不编辑你的存档；这里显示的名称和图标都来自你的游戏安装。',
    game: '游戏',
    build: '游戏版本',
    bridge: '桥接',
    catalog: '目录',
    capabilities: 'Courier 能做什么',
    capabilitiesHint: '每个区域会更改什么，以及已验证到何种程度。',
    feature: '区域',
    area: '分组',
    running: '运行中',
    notRunning: '未运行',
    notSelected: '未选择安装位置',
    unknown: '未知',
    supported: '支持',
    unsupported: '不支持',
    connected: '已连接',
    notConnected: '未连接',
    available: '可用',
    unavailable: '未生成',
    entriesCount: '{count} 个条目',
    processId: '进程 {id}'
  },
  settings: {
    notifications: '游戏通知',
    notificationsHint:
      '对于交付的内容，如果游戏有自己的通知，则让它显示。关闭后将静默交付。物品栏升级从不要求确认。',
    general: '常规',
    appearance: '外观',
    about: '关于',
    language: '语言',
    languageHint: 'No Man’s Sky 的十四种语言。',
    theme: '主题',
    themeHint: '默认跟随系统。',
    experimental: '实验性软件',
    experimentalBody: 'NMS Courier 是一款开发中的非官方工具。它一次只支持一个确切的游戏版本。'
  },
  delivery: {
    equipScene: '模型',
    equipSceneHint: '可选。货船模型的游戏场景；留空则保留游戏自己的选择。',
    equipModelSeed: '模型种子',
    equipHomeSeed: '母星系种子',
    currencyAmountHint: '1 到 {max}（游戏能保存的最大余额）之间的任意数额。',
    itemsStack: '每堆 {count}',
    equipActionLabel: '操作',
    equipTarget: '飞船',
    equipTargetCurrent: '当前飞船',
    equipTargetSlot: '栏位 {number} 的飞船',
    equipClass: '等级',
    equipSlots: '全部物品栏格子',
    equipSlotsHint: '让货舱和科技网格的每个位置都可用。',
    equipSupercharge: '超载格子',
    equipSuperchargeHint: '把每个可用的科技格子变为超载格子。',
    equipExtended: '额外科技行',
    equipExtendedHint: '把科技网格扩展到十二行。需要启用全部物品栏格子。',
    currencyHint: '由游戏自身的奖励增加数额并显示通知。余额不会超过游戏的上限。',
    currencyLabel: '货币',
    equipAction: {
      slotReward: '增加一个物品栏格子',
      grid: '应用到物品栏',
      classStep: '等级提升一级',
      offer: '发送货船报价',
      build: '开始建造护卫舰'
    },
    equipActionHint: {
      slotReward: '向游戏请求其自身的格子奖励。游戏会打开窗口，由你选择新格子的位置。',
      grid: '就地修改你已拥有的物品栏。游戏内不会打开任何界面。',
      classStep: '向游戏请求其自身的升级奖励：每次请求提升一级，最高到 S。',
      offer: '游戏会按下方选项向你提供一艘货船。在游戏中接受后，它会替换你当前的货船。',
      build: '游戏会按下方选项打开护卫舰建造。'
    },
    currencyName: { units: '单位', nanites: '纳米星团', quicksilver: '水银' },
    itemsTitle: '向游戏发送物品',
    itemsHint:
      '物质和产品会放入已加载存档的外骨骼服货舱，按游戏允许的堆叠数量存放。放不下的部分不会发送。',
    itemsAdd: '添加',
    itemsAmount: '数量',
    itemsRemove: '移除',
    itemsEmpty: '在目录中搜索并添加要发送的物品。',
    itemsAction: '发送物品（{count}）',
    itemsConfirm:
      '物品会放入当前已加载存档的外骨骼服货舱。发送前会先备份存档文件夹。游戏保存时更改才会写入存档。',
    selectTitle: '选择要发送的内容',
    selectHint: '可以勾选一个、多个或全部条目。只会发送所选条目。',
    selectSearch: '按名称或 ID 搜索',
    selectAllShown: '全选当前显示的条目',
    selectClear: '清除选择',
    selectCount: '已选择 {count} 项',
    selectShowing: '正在显示 {total} 项中的 {shown} 项。请使用搜索缩小列表。',
    selectAction: '发送所选（{count}）',
    selectNoCatalog: '从游戏读取目录后会显示名称（资料库 → 游戏目录）。',
    selectNone: '没有与搜索匹配的条目。',
    title: '发送到游戏',
    hint: '使用此开发版本的研究用桥接。',
    action: '全部投递',
    sending: '正在发送…',
    confirmTitle: '要发送到运行中的游戏吗？',
    confirmSlot: '这会更改游戏当前加载的存档栏位。发送前会先复制存档文件夹。',
    confirmAccount:
      '这会更改所有存档栏位共享的账号，并由游戏同步。发送前会先复制存档文件夹和设置文件。',
    confirm: '发送',
    cancel: '取消',
    result: '结果',
    backup: '备份：{path}',
    time: '时间',
    activityEmptyTitle: '尚未发送任何内容',
    activityEmptyBody: '本次会话的投递会显示在这里。',
    state: {
      currency_data_missing: '货币数据文件不在游戏的模组文件夹中，或版本不同。未发送任何内容。',
      selection_invalid: '所选内容包含此区域不提供的条目。未发送任何内容。',
      unavailable: '仅在开发版本中可用。',
      installation_not_selected: '请先选择游戏安装位置。',
      game_not_running: '请启动游戏并加载存档。',
      bridge_missing: '游戏文件夹中未安装桥接。',
      bridge_untested: '已安装的桥接不是经过测试的版本。',
      ready: '就绪：游戏运行中，进程 {id}。',
      busy: '另一项投递正在进行。',
      backup_failed: '无法创建备份；未发送任何内容。'
    },
    outcome: {
      completed: '完成',
      unknown: '结果未知',
      failed: '失败',
      refused: '未发送'
    },
    outcomeHint: {
      completed: '游戏已响应所有请求。请在游戏中保存以保留结果。',
      unknown: '游戏未及时响应。请勿再次发送；请在游戏中确认。',
      failed: '请求在到达游戏之前被拒绝。',
      refused: '未发送任何内容。'
    }
  },
  bridgePage: {
    versionApp: '应用版本',
    versionBridge: '已安装的桥接版本',
    versionNone: '未安装',
    versionOld: '旧版，无版本号',
    versionCurrent: '桥接已是最新版本。',
    versionOutdated: '桥接版本已过期。此应用附带的桥接版本为 {version}。',
    detect: '自动检测',
    detecting: '正在查找…',
    detectNone: '未找到安装位置。请手动选择文件夹。',
    detectSeveral: '找到多个安装位置。请选择你用来游玩的那一个。',
    installationTitle: '游戏安装位置',
    installationSelected: '已选择 {name}。',
    installationNone: '请选择 No Man’s Sky 的安装文件夹。',
    installationInvalid: '所选文件夹不是有效的 No Man’s Sky 安装位置。',
    select: '选择安装位置',
    verifying: '正在验证…',
    bridgeTitle: '研究用桥接',
    bridgeHint: '游戏内部负责执行投递的组件。',
    diagnosticsTitle: '只读诊断',
    diagnosticsHint: '连接没有任何投递命令的私有运行时主机。在关闭游戏之前，请保持此窗口打开。',
    connect: '连接只读运行时',
    starting: '正在启动…',
    diagNotConnected: '未连接诊断运行时。',
    diagHostReady: '运行时主机已就绪，正在等待游戏。',
    diagAuthenticated: '握手完成；正在等待游戏的回调。',
    diagCallbackReady: '只读回调已在游戏中启用。',
    diagFailed: '诊断失败（{reason}）。',
    diagEnded: '诊断会话已随游戏结束。'
  },
  catalogPage: {
    generate: '从游戏读取',
    refresh: '重新读取',
    generating: '正在读取游戏文件…',
    generateHint:
      '目录从你自己的游戏安装中读取。不会更改游戏文件夹中的任何内容，也不会打开任何存档。',
    imported: '已从游戏读取 {count} 个条目。',
    failInstallation: '请先选择游戏安装位置。',
    failArchives: '在所选安装位置中未找到游戏数据文件。',
    failStructure: '游戏已更新，数据表发生了变化。此版本的应用暂时无法读取。',
    failUnreadable: '无法读取游戏数据文件。',
    unavailableTitle: '本地目录不可用',
    unavailableBody: '此应用配置文件中尚未生成目录。',
    title: '本地目录',
    description: '从所选游戏安装位置提取的只读定义。有结果并不代表该物品可以投递。',
    buildBadge: '版本 {build}',
    searchLabel: '搜索本地目录',
    searchPlaceholder: '按名称或游戏 ID 搜索',
    all: '全部',
    substance: '物质',
    product: '产品',
    technology: '科技',
    matching: '{count} 个匹配的定义',
    loading: '正在加载定义…',
    languages: '{count} 种游戏语言'
  },
  preview: {
    title: '模型工坊',
    description: '查看本地静态 GLB 模型，并组合其可见部件。',
    stage: '实验性预览',
    import: '打开 GLB 模型',
    loading: '正在加载模型…',
    empty: '选择一个本地模型以开始',
    hint: '拖动可旋转，滚动可缩放，右键拖动可平移。',
    limits:
      '此版本支持不超过 64 MiB 的静态 GLB 文件，仅限内嵌 PNG 纹理且不含外部资源。NMS 资源的原生转换尚未接入。',
    warning: '部件选择和色调只影响此预览，不会计算种子，也不会投递飞船。',
    parts: '可见部件',
    all: '全部显示',
    none: '全部隐藏',
    filter: '按名称筛选部件',
    tint: '预览色调',
    original: '恢复模型颜色',
    reset: '重置相机',
    palettes: '游戏调色板',
    paletteHelp: '请打开从受支持的数据集中提取的 BASECOLOURPALETTES.MBIN。',
    importPalette: '打开调色板 MBIN',
    seed: '实验性颜色种子',
    calculatePalette: '计算颜色样本',
    calculatedSeed: '计算出的种子',
    family: '调色板系列',
    samples: '五个颜色样本',
    sample: '颜色样本',
    paletteIndex: '来源颜色',
    colorTarget: '应用于',
    visibleTarget: '所有可见部件',
    applyColor: '应用所选颜色',
    paletteWarning:
      '基础调色板的实验性计算。RGB 样本只为部件重新着色，不能预测原生纹理遮罩、飞船外观或反推的种子。',
    INVALID_PALETTE: '此文件与受支持的基础调色板指纹不匹配。',
    INVALID_SEED: '请输入 0x，后跟 1 到 16 位十六进制数字。',
    PALETTE_UNAVAILABLE: '计算颜色前，请先打开受支持的调色板文件。',
    failed: '无法渲染该模型。',
    INVALID_MODEL: '该文件不是预览限制范围内的有效模型。',
    UNSUPPORTED_MODEL: '此模型使用了受支持范围之外的纹理、动画、扩展或几何体。',
    FILE_UNAVAILABLE: '无法读取所选文件。'
  },
  appearance: {
    title: '按种子的外观配方',
    open: '打开外观配方',
    apply: '将配方应用到预览',
    help: '导入带有明确网格绑定的配方或种子搜索报告。',
    warning: '候选预览：仅包含明确指定的部件和 RGB 样本。不会还原原生 DDS 纹理、遮罩和着色器。',
    mismatch: '模型指纹或网格名称不匹配。未应用任何更改。',
    failed: '无法将该文件读取为受支持的外观配方。',
    seed: '候选种子',
    applied: '配方已应用到预览',
    candidate: '部分评估器候选'
  },
  controls: {
    changeLanguage: '更改语言',
    changeTheme: '更改主题',
    light: '浅色',
    dark: '深色',
    system: '系统'
  }
}
