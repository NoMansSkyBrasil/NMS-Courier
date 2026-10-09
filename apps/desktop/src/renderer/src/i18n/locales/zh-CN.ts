import type { Messages } from '../messages'

export const zhCN: Messages = {
  app: { name: 'NMS Courier', tagline: 'No Man’s Sky 本地投递工具' },
  sections: { obtain: '获取新的', upgrade: '升级' },
  corvette: {
    title: '从文件创建护卫舰',
    hint: '选择一个共享的护卫舰文件（.nmsship）。应用会让游戏的护卫舰建造从这艘已组装好的飞船开始；你在游戏中完成建造。准备好文件后需要重新启动游戏。',
    none: '尚未准备任何护卫舰文件。',
    current: '已准备：{name}，{count} 个部件。',
    parts: '{count} 个部件',
    hullParts: '{count} 个船体部件',
    missing: '缺少：{parts}。游戏会显示警告，但仍会建造。',
    partCockpit: '驾驶舱',
    partLandingGear: '起落架',
    partHabitation: '居住模块',
    partReactor: '反应堆',
    rejectedTitle: '无法使用此文件',
    rejectedShip: '这是一艘普通飞船，不是护卫舰。暂不支持从文件创建飞船。',
    rejectedInvalid: '这不是有效的护卫舰文件。',
    installedTitle: '护卫舰已准备好',
    installedBody: '如果游戏正在运行，请关闭后重新启动。然后使用下方的“开始建造护卫舰”。',
    installFailedTitle: '无法准备护卫舰',
    installFailed: '无法将文件写入游戏文件夹。',
    choose: '选择文件',
    install: '在游戏中准备'
  },
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
      summary: '查看种子的外观，或为想要的部件寻找种子。'
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
    errorTitle: '此页面已停止工作',
    errorReload: '重新加载',
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
    shipModel: {
      fighter: '战士',
      hauler: '拖运船',
      explorer: '探险家',
      shuttle: '飞艇',
      solar: '太阳能',
      exotic: '异星',
      living: '活体飞船',
      interceptor: 'Interceptor'
    },
    toolModel: {
      pistol: '手枪',
      rifle: '步枪',
      experimental: '实验型',
      alien: '外星',
      staff: '法杖'
    },
    equipSeedHint: '留空则随机抽取种子。',
    obtainAction: '发送报价',
    obtainShipHint:
      '游戏会在自己的界面中向你提供一艘该类型、种子和等级的新飞船：加入收藏、与当前飞船交换，或拒绝。',
    obtainToolHint:
      '游戏会在自己的界面中向你提供一把该类型、种子和等级的新多功能工具：加入收藏、与当前的交换，或拒绝。',
    obtainPlanned: '这里暂时无法获取新的。',
    equipSceneEmpty: '未找到模型。',
    freighterModel: {
      default: '由游戏决定',
      regular: '货船',
      small: '小型货船',
      tiny: '微型货船',
      capital: '主力货船',
      pirate: '海盗无畏舰'
    },
    equipScene: '模型',
    equipSceneHint: '可选。货船模型的游戏场景；留空则保留游戏自己的选择。',
    equipModelSeed: '模型种子',
    equipLegacyColours: '使用旧版颜色',
    equipLegacyColoursHint:
      '将多功能工具标记为使用旧版颜色，与游戏发放的工具一样。游戏的报价中没有这个设置，因此桥接会让游戏用旧版颜色绘制报价，并在你接受后立即把标记写到工具上。',
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
    equipToolSlots: '全部科技栏位',
    equipToolSlotsHint: '在你接受报价后，立即让多功能工具科技网格的每个位置都可用。',
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
  workshop: {
    title: '模型工坊',
    description:
      '先选择要查看的内容，然后输入种子、随机生成一个，或者选好部件，让应用找出带有这些部件的种子。',
    tabBuild: '组装',
    tabView: '查看种子',
    buildDescription: '选择类型、部件、颜色和纹理。应用会寻找带有它们的种子并显示出来。',
    viewDescription: '选择类型并输入种子，或随机生成一个，查看它的外观。',
    colorTitle: '颜色',
    roles: { primary: '主色', secondary: '副色', decal1: '贴花颜色 1', decal2: '贴花颜色 2' },
    texturesTitle: '纹理和贴花',
    baseTexture: { COATING: '涂层', PAINTED: '喷漆', PANELS: '金属' },
    seedTexturesTitle: '此种子的纹理和贴花',
    colorHint: '模型从游戏调色板取用的每种颜色。先选一种，再为它选颜色；“任意”表示交给种子决定。',
    seedColorsTitle: '此种子的颜色',
    paintLabel: '涂装',
    undercoatLabel: '底漆',
    tabSystem: '当前星系',
    systemDescription:
      '你所在的星系，读取自运行中的游戏：它的种子以及游戏为它生成的飞船。不会更改游戏中的任何内容。',
    systemNone:
      '暂无可显示的内容。游戏需要使用 1.8.0 或更新的桥接运行并已载入存档；列表每隔几秒刷新一次。',
    systemSeed: '星系种子',
    systemShips: '此星系的飞船',
    systemClass: '类别',
    systemRole: '角色',
    systemShipSeed: '种子',
    systemView: '查看',
    systemRefresh: '刷新',
    systemClassNumber: '类别 {number}',
    systemStream: '已核对：飞船种子位于星系种子的数列上，第一个在 {steps} 步之后抽出。',
    systemStreamUnknown: '未在星系种子的数列上找到飞船种子。',
    tabFile: '模型文件',
    categoryLabel: '类别',
    category: { starship: '星际飞船', multitool: '多功能工具', freighter: '货船' },
    kindLabel: '类型',
    toolKind: {
      standard: '标准',
      royal: '皇家',
      sentinel: '哨兵',
      sentinelB: '哨兵 B',
      atlasSceptre: '阿特拉斯权杖',
      atlas: '亚特兰蒂德',
      staff: '法杖'
    },
    seedLabel: '种子',
    homeSeedHint:
      '货船的颜色来自其母星系，而星系的种子就是它在星系中的地址。输入种子、随机生成一个，或在下方填写该星系的传送门地址；留空则货船不带颜色显示。',
    homeAddress: '此种子是星系 {galaxy} 中传送门地址为 {glyphs} 的星系。',
    glyphsLabel: '传送门地址（12 个符文，0–9、A–F）',
    galaxyLabel: '星系编号',
    useAddress: '使用此星系',
    legacyColours: '使用旧版颜色',
    legacyColoursHint:
      '游戏有两种为种子抽取颜色的方式。游戏发放的多功能工具使用旧版方式；飞船在存档中逐艘标记（使用旧版颜色）。',
    seedOrigin:
      '游戏在星系 {galaxy} 中传送门地址为 {glyphs} 的星系里抽出这个种子（在其数列的第 {steps} 步之后）。这只是线索，不是证明。',
    seedHint: '0x 后接十六位十六进制数字。按回车或“显示”查看。',
    show: '显示',
    generate: '生成种子',
    generateWithParts: '用这些部件生成',
    clearParts: '清除部件',
    getInGame: '在游戏中获取这一个',
    found: '尝试 {tries} 次后找到种子',
    building: '正在组装模型…',
    empty: '暂无可显示的内容',
    partsTitle: '部件',
    partsHint: '选择想要的部件，其余保持“任意”。带有自身部件的部件下方会出现更多列表。',
    anyPart: '任意',
    rare: '稀有',
    detailsTitle: '由种子决定的细节',
    note: '模型读取自你自己的游戏文件。部件、纹理层、贴花和颜色由种子决定；光照和材质效果经过简化，因此金属和明暗与游戏中不同。部件已与独立工具以及在运行的游戏中购买的一把多功能工具核对；颜色接近，但并不完全一致。',
    errors: {
      INSTALLATION_NOT_SELECTED: '请先在“桥接”中选择游戏文件夹。',
      UNKNOWN_KIND: '此类型不可用。',
      INVALID_SEED: '种子必须是 0x 后接最多十六位十六进制数字。',
      GAME_FILES_UNREADABLE: '无法读取此模型的游戏文件。',
      MODEL_TOO_LARGE: '此模型过大，无法显示。',
      SEED_NOT_FOUND: '未能及时找到带有这些部件的种子。请重试，或放开其中一个部件。'
    }
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
