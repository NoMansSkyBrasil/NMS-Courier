import type { Messages } from '../messages'

export const jaJP: Messages = {
  app: { name: 'NMS Courier', tagline: 'No Man’s Sky 向けローカル配送' },
  sections: { obtain: '新しく入手', upgrade: 'アップグレード' },
  corvette: {
    title: 'ファイルからコルベットを作る',
    hint: '共有されたコルベットファイル（.nmsship）を選択します。コルベットの建造がその船を組み立て済みの状態で始まるよう、アプリがゲームを準備します。仕上げはゲーム内で行います。ファイルの準備後はゲームの再起動が必要です。',
    none: 'コルベットファイルはまだ準備されていません。',
    current: '準備済み: {name}、パーツ {count} 個。',
    parts: 'パーツ {count} 個',
    hullParts: '船体パーツ {count} 個',
    missing: '次のパーツがありません: {parts}。ゲームは警告を表示しますが、建造はできます。',
    partCockpit: 'コックピット',
    partLandingGear: 'ランディングギア',
    partHabitation: '居住モジュール',
    partReactor: 'リアクター',
    rejectedTitle: 'このファイルは使用できません',
    rejectedShip:
      'これは通常の宇宙船で、コルベットではありません。ファイルからの宇宙船にはまだ対応していません。',
    rejectedInvalid: '有効なコルベットファイルではありません。',
    installedTitle: 'コルベットを準備しました',
    installedBody:
      'ゲームが起動中なら終了し、もう一度起動してください。その後、下の「コルベットの建造を開始」を使います。',
    installFailedTitle: 'コルベットを準備できませんでした',
    installFailed: 'ゲームのフォルダーにファイルを書き込めませんでした。',
    choose: 'ファイルを選択',
    install: 'ゲームに準備'
  },
  groups: {
    overview: '概要',
    deliver: '配送',
    unlock: 'アンロック',
    rewards: '報酬',
    library: 'ライブラリ',
    system: 'システム'
  },
  features: {
    dashboard: { title: 'ダッシュボード', summary: '今すぐ配送できるかどうかと、その理由。' },
    activity: { title: 'アクティビティ', summary: 'ゲームに送信した各リクエストとその結果。' },
    items: {
      title: 'アイテム',
      summary: '読み込み中のセーブのインベントリに入れる物質と製品。'
    },
    currencies: { title: '通貨', summary: 'ユニット、ナノマシン、水銀。' },
    exosuit: {
      title: 'エクソスーツ',
      summary: 'エクソスーツのクラス、貨物・テクノロジースロット、強化スロット。'
    },
    starships: {
      title: '宇宙船',
      summary: '所有している宇宙船のクラス、インベントリサイズ、強化スロット。'
    },
    multitools: {
      title: 'マルチツール',
      summary: '装備中のマルチツールのクラス、スロット、強化スロット。'
    },
    freighters: {
      title: '貨物船',
      summary: '選んだクラス、モデル、シードによる貨物船のオファー。'
    },
    frigates: { title: 'フリゲート', summary: '艦隊へのフリゲートの雇用。' },
    corvettes: { title: 'コルベット', summary: '共有された設計から組み立てるコルベット。' },
    companions: { title: 'コンパニオン', summary: 'コンパニオンの卵と生物。' },
    technologies: {
      title: 'テクノロジー',
      summary: 'キャラクターが取り付け方を知っている設計図。'
    },
    productRecipes: {
      title: 'クラフトレシピ',
      summary: 'クラフト可能なアイテムとテクノロジーのレシピ。'
    },
    buildParts: {
      title: '建築パーツ',
      summary: '建築メニューの基地、貨物船、装飾パーツ。'
    },
    refinerRecipes: {
      title: '精製と料理',
      summary: 'カタログにある精製機と栄養プロセッサーのレシピ。'
    },
    customisation: {
      title: '外見',
      summary: 'ヘルメット、アーマー、ケープ、バナー、ジェットパックの軌跡、ジェスチャー。'
    },
    titles: { title: '称号', summary: 'バナーに表示するプレイヤーの称号。' },
    fishing: { title: '釣りの記録', summary: 'すべての魚の釣果記録。' },
    expeditions: {
      title: '探検',
      summary: '過去の探検の報酬。水銀合成コンパニオンで受け取れます。'
    },
    twitch: {
      title: 'Twitch ドロップ',
      summary: 'Twitch キャンペーンの報酬。水銀合成コンパニオンで受け取れます。'
    },
    platform: {
      title: 'プラットフォームと予約特典',
      summary: 'プラットフォーム、予約購入、イベントに紐づく報酬。'
    },
    quicksilver: {
      title: '水銀ショップ',
      summary: '水銀合成コンパニオンが販売するアイテム。'
    },
    catalog: { title: 'ゲームカタログ', summary: 'インストール済みのゲームのアイテムを検索。' },
    models: {
      title: 'モデル工房',
      summary: 'インポートしたモデルとカラーパレットのプレビュー。'
    },
    bridge: {
      title: 'ゲームとブリッジ',
      summary: 'インストール、ゲームのビルド、実行中のゲームとの接続。'
    },
    saves: {
      title: 'セーブとアカウント',
      summary: 'どのセーブスロットが読み込まれているか、アカウント全体で何が共有されるか。'
    },
    settings: { title: '設定', summary: '言語、外観、アプリケーションの詳細。' }
  },
  status: { verified: '確認済み', experimental: '実験的', planned: '予定' },
  statusHint: {
    verified: '調査用ビルドの実行中のゲームで動作しました。',
    experimental: '一部のみ、または既知の条件でのみ動作します。',
    planned: 'まだ作られていません。'
  },
  scope: {
    slot: 'セーブスロット',
    account: 'アカウント',
    both: 'セーブスロットとアカウント',
    none: '変更なし'
  },
  scopeHint: {
    slot: '読み込み中のセーブスロットのみを変更します。',
    account: 'すべてのセーブスロットで共有されるアカウントを変更します。',
    both: '読み込み中のセーブスロットとアカウントを変更します。',
    none: '読み取りのみ。ゲーム内は何も変わりません。'
  },
  rows: {
    deliverable: '配送対象',
    blockedDamaged: '破損スロットの項目（配送しません）',
    blockedMaintenance: 'メンテナンス項目（配送しません）',
    blockedTemplates: 'プロシージャルのテンプレート（配送しません）',
    blockedById: '恒久ルールによりブロック',
    catalogueItems: 'クラフト可能なアイテム',
    craftableTechnology: 'クラフト可能なテクノロジー',
    buildParts: '建築パーツ',
    researchTree: '研究端末で販売',
    repeatableNever: '繰り返し購入できるもの（アンロックしません）',
    missionBound: 'ミッションに紐づくため除外',
    redeemedInSave: 'セーブに記録済み',
    itemRewards: 'ショップで受け取るアイテム',
    total: 'ゲーム内の総数'
  },
  rules: {
    gameRoutines: 'すべて実行中のゲーム自身が行います。セーブファイルは決して編集しません。',
    defectiveNever: '不良な項目や内部用の項目は、どのモードでも配送しません。',
    repeatableNever:
      '花火、神話のビーコン、ヴォイドエッグはアンロックしません。ショップで買えなくなるためです。',
    claimItems:
      '宇宙船、マルチツール、卵、パックはアカウントでアンロックされます。アイテムはショップで受け取ってください。',
    keepList:
      'Twitch ドロップは、ブリッジがインストールされている間だけ受け取れます。残したいものは受け取ってください。',
    backup: '変更のたびに、事前にセーブフォルダーをコピーします。',
    slotIdentified: '配送のたびに、読み込み中のセーブスロットを特定します。',
    accountShared: 'アカウントの変更はすべてのセーブスロットに反映され、ゲームが同期します。'
  },
  page: {
    availabilityTitle: 'このウィンドウからはまだ利用できません',
    availabilityBody:
      'これは調査用ブリッジで実行したものです。このアプリケーションとゲームの接続はまだ開発中のため、ここからは何も送信できません。',
    includes: '対象範囲',
    includesHint: '調査用ビルドでの数値です。',
    rulesTitle: '動作のしかた',
    rulesHint: '常に適用されるルール。',
    entries: '件数',
    kind: '種類',
    status: '状態',
    scope: '変更対象',
    researchBuild: '調査用ビルド {build}',
    plannedTitle: 'まだ作られていません',
    plannedBody:
      'この領域は予定されています。実行中のゲームで動作するようになると、ここに表示されます。',
    open: '開く'
  },
  dashboard: {
    heroBody:
      'アイテム、通貨、アンロックを、起動中の自分のゲームに送信します。すべてゲーム自身を通して行われ、セーブデータが編集されることはありません。ここに表示される名前とアイコンは、お使いのインストール先から読み込まれます。',
    game: 'ゲーム',
    build: 'ゲームのビルド',
    bridge: 'ブリッジ',
    catalog: 'カタログ',
    capabilities: 'Courier にできること',
    capabilitiesHint: '各領域が何を変更し、どこまで実証されているか。',
    feature: '領域',
    area: 'グループ',
    running: '実行中',
    notRunning: '停止中',
    notSelected: 'インストール先が未選択',
    unknown: '不明',
    supported: '対応',
    unsupported: '非対応',
    connected: '接続済み',
    notConnected: '未接続',
    available: '利用可能',
    unavailable: '未生成',
    entriesCount: '{count} 件',
    processId: 'プロセス {id}'
  },
  settings: {
    notifications: 'ゲームの通知',
    notificationsHint:
      '配信内容について、ゲーム自身の通知がある場合は表示します。オフにすると通知なしで配信します。インベントリの拡張で確認を求められることはありません。',
    general: '一般',
    appearance: '外観',
    about: '情報',
    language: '言語',
    languageHint: 'No Man’s Sky の 14 言語。',
    theme: 'テーマ',
    themeHint: '既定ではシステムに従います。',
    experimental: '実験的なソフトウェア',
    experimentalBody:
      'NMS Courier は開発中の非公式ツールです。一度に対応するのは、ゲームの特定の 1 ビルドだけです。'
  },
  delivery: {
    obtainPlanned: 'ここではまだ新しく入手できません。',
    equipSceneEmpty: 'モデルが見つかりません。',
    freighterModel: {
      default: 'ゲームに任せる',
      regular: '貨物船',
      small: '小型貨物船',
      tiny: '超小型貨物船',
      capital: '大型貨物船',
      pirate: '海賊ドレッドノート'
    },
    equipScene: 'モデル',
    equipSceneHint: '任意。貨物船モデルのゲームシーン。空欄の場合はゲームの選択のままです。',
    equipModelSeed: 'モデルのシード',
    equipHomeSeed: '母星系のシード',
    currencyAmountHint: '1 から {max}（ゲームが保持できる最大残高）までの任意の金額。',
    itemsStack: 'スタック {count}',
    equipActionLabel: '操作',
    equipTarget: '宇宙船',
    equipTargetCurrent: '現在の宇宙船',
    equipTargetSlot: 'スロット {number} の宇宙船',
    equipClass: 'クラス',
    equipSlots: 'すべてのインベントリスロット',
    equipSlotsHint: '貨物とテクノロジーのグリッドのすべての位置を使用可能にします。',
    equipSupercharge: 'スーパーチャージスロット',
    equipSuperchargeHint:
      '使用可能なテクノロジースロットをすべてスーパーチャージスロットにします。',
    equipExtended: 'テクノロジーの追加行',
    equipExtendedHint:
      'テクノロジーのグリッドを 12 行に拡張します。すべてのインベントリスロットが必要です。',
    currencyHint:
      'ゲーム自身の報酬が金額を追加し、通知を表示します。残高がゲームの上限を超えることはありません。',
    currencyLabel: '通貨',
    equipAction: {
      slotReward: 'インベントリスロットを 1 つ追加',
      grid: 'インベントリに適用',
      classStep: 'クラスを 1 段階上げる',
      offer: '貨物船のオファーを送信',
      build: 'コルベットの建造を開始'
    },
    equipActionHint: {
      slotReward:
        'ゲーム自身のスロット報酬を要求します。ゲームのウィンドウが開き、新しいスロットの位置を選べます。',
      grid: 'すでに所有しているインベントリをその場で変更します。ゲーム内では何も開きません。',
      classStep:
        'ゲーム自身のアップグレード報酬を要求します。1 回の要求でクラスが 1 段階、S まで上がります。',
      offer:
        'ゲームが下記のオプションで貨物船を提示します。ゲーム内で受け取ると、現在の貨物船と入れ替わります。',
      build: 'ゲームが下記のオプションでコルベットの建造を開きます。'
    },
    currencyName: { units: 'ユニット', nanites: 'ナノマシン', quicksilver: '水銀' },
    itemsTitle: 'アイテムをゲームに送信',
    itemsHint:
      '物質と製品は、読み込み中のセーブのエクソスーツの貨物に、ゲームが許可するスタックサイズで入ります。入りきらない分は送信されません。',
    itemsAdd: '追加',
    itemsAmount: '数量',
    itemsRemove: '削除',
    itemsEmpty: 'カタログを検索して、送信するアイテムを追加してください。',
    itemsAction: 'アイテムを送信（{count}）',
    itemsConfirm:
      'アイテムは、現在読み込まれているセーブのエクソスーツの貨物に入ります。先にセーブフォルダーがバックアップされます。変更はゲームがセーブしたときに書き込まれます。',
    selectTitle: '送信する項目を選択',
    selectHint: '1 件、複数、またはすべてを選択できます。選択した項目だけが送信されます。',
    selectSearch: '名前または ID で検索',
    selectAllShown: '表示中をすべて選択',
    selectClear: '選択を解除',
    selectCount: '{count} 件選択中',
    selectShowing: '{total} 件中 {shown} 件を表示しています。検索で絞り込んでください。',
    selectAction: '選択した項目を送信（{count}）',
    selectNoCatalog:
      '名前は、ゲームからカタログを読み込むと表示されます（ライブラリ → ゲームカタログ）。',
    selectNone: '検索に一致する項目はありません。',
    title: 'ゲームに送信',
    hint: 'この開発用ビルドの調査用ブリッジを使用します。',
    action: 'すべて配送',
    sending: '送信中…',
    confirmTitle: '実行中のゲームに送信しますか？',
    confirmSlot:
      '現在ゲームで読み込まれているセーブスロットを変更します。事前にセーブフォルダーをコピーします。',
    confirmAccount:
      'すべてのセーブスロットで共有されるアカウントを変更し、ゲームが同期します。事前にセーブフォルダーと設定ファイルをコピーします。',
    confirm: '送信',
    cancel: 'キャンセル',
    result: '結果',
    backup: 'バックアップ: {path}',
    time: '時刻',
    activityEmptyTitle: 'まだ何も送信していません',
    activityEmptyBody: 'このセッションの配送がここに表示されます。',
    state: {
      currency_data_missing:
        '通貨データファイルがゲームの MOD フォルダーにないか、バージョンが異なります。何も送信されませんでした。',
      selection_invalid:
        '選択内容に、この項目では提供されていないものが含まれています。何も送信されませんでした。',
      unavailable: '開発用ビルドでのみ利用できます。',
      installation_not_selected: '先にゲームのインストール先を選択してください。',
      game_not_running: 'ゲームを起動してセーブを読み込んでください。',
      bridge_missing: 'ブリッジがゲームフォルダーにインストールされていません。',
      bridge_untested: 'インストールされているブリッジは検証済みのビルドではありません。',
      ready: '準備完了: ゲーム実行中、プロセス {id}。',
      busy: '別の配送が進行中です。',
      backup_failed: 'バックアップを作成できなかったため、何も送信していません。'
    },
    outcome: {
      completed: '完了',
      unknown: '結果不明',
      failed: '失敗',
      refused: '未送信'
    },
    outcomeHint: {
      completed:
        'ゲームがすべてのリクエストに応答しました。保持するにはゲーム内でセーブしてください。',
      unknown: 'ゲームが時間内に応答しませんでした。再送信せず、ゲーム内で確認してください。',
      failed: 'リクエストはゲームに届く前に拒否されました。',
      refused: '何も送信していません。'
    }
  },
  bridgePage: {
    versionApp: 'アプリのバージョン',
    versionBridge: 'インストール済みブリッジのバージョン',
    versionNone: '未インストール',
    versionOld: '旧版（バージョンなし）',
    versionCurrent: 'ブリッジは最新です。',
    versionOutdated:
      'ブリッジが古くなっています。このアプリにはブリッジ {version} が付属しています。',
    detect: '自動で検出',
    detecting: '検索中…',
    detectNone: 'インストール先が見つかりませんでした。フォルダーを手動で選択してください。',
    detectSeveral:
      '複数のインストール先が見つかりました。プレイに使っているものを選択してください。',
    installationTitle: 'ゲームのインストール先',
    installationSelected: '{name} を選択中です。',
    installationNone: 'No Man’s Sky のインストールフォルダーを選択してください。',
    installationInvalid: '選択したフォルダーは有効な No Man’s Sky のインストール先ではありません。',
    select: 'インストール先を選択',
    verifying: '確認中…',
    bridgeTitle: '調査用ブリッジ',
    bridgeHint: '配送を実行する、ゲーム内のコンポーネント。',
    diagnosticsTitle: '読み取り専用の診断',
    diagnosticsHint:
      '配送コマンドを持たないプライベートのランタイムホストに接続します。ゲームを閉じるまで、このウィンドウは開いたままにしてください。',
    connect: '読み取り専用ランタイムに接続',
    starting: '開始中…',
    diagNotConnected: '診断用ランタイムは接続されていません。',
    diagHostReady: 'ランタイムホストの準備ができ、ゲームを待機しています。',
    diagAuthenticated: 'ハンドシェイクが完了しました。ゲームのコールバックを待機しています。',
    diagCallbackReady: '読み取り専用のコールバックがゲーム内で有効です。',
    diagFailed: '診断に失敗しました（{reason}）。',
    diagEnded: '診断セッションはゲームとともに終了しました。'
  },
  catalogPage: {
    generate: 'ゲームから読み込む',
    refresh: '再読み込み',
    generating: 'ゲームのファイルを読み込み中…',
    generateHint:
      'カタログはお使いのインストール先から読み込まれます。ゲームのフォルダーは変更されず、セーブデータも開かれません。',
    imported: 'ゲームから {count} 件を読み込みました。',
    failInstallation: '先にゲームのインストール先を選択してください。',
    failArchives: '選択したインストール先にゲームのデータファイルが見つかりませんでした。',
    failStructure:
      'ゲームが更新され、テーブルが変更されました。このバージョンのアプリではまだ読み込めません。',
    failUnreadable: 'ゲームのデータファイルを読み込めませんでした。',
    unavailableTitle: 'ローカルカタログは利用できません',
    unavailableBody: 'このアプリケーションプロファイルでは、まだカタログが生成されていません。',
    title: 'ローカルカタログ',
    description:
      '選択したゲームのインストール先から抽出した読み取り専用の定義です。結果が表示されても、そのアイテムを配送できるとは限りません。',
    buildBadge: 'ビルド {build}',
    searchLabel: 'ローカルカタログを検索',
    searchPlaceholder: '名前またはゲーム ID で検索',
    all: 'すべて',
    substance: '物質',
    product: '製品',
    technology: 'テクノロジー',
    matching: '一致する定義: {count} 件',
    loading: '定義を読み込み中…',
    languages: 'ゲームの言語: {count}'
  },
  preview: {
    title: 'モデル工房',
    description: 'ローカルの静的 GLB モデルを確認し、表示するパーツを組み合わせます。',
    stage: '実験的なプレビュー',
    import: 'GLB モデルを開く',
    loading: 'モデルを読み込み中…',
    empty: 'ローカルのモデルを選んで開始してください',
    hint: 'ドラッグで回転、スクロールでズーム、右ドラッグで移動します。',
    limits:
      'このバージョンは、埋め込み PNG テクスチャのみで外部リソースを持たない 64 MiB までの静的 GLB ファイルに対応しています。NMS アセットのネイティブ変換はまだ接続されていません。',
    warning:
      'パーツの選択と色合いは、このプレビューにのみ反映されます。シードの計算や宇宙船の配送は行いません。',
    parts: '表示中のパーツ',
    all: 'すべて表示',
    none: 'すべて非表示',
    filter: '名前でパーツを絞り込む',
    tint: 'プレビューの色合い',
    original: 'モデルの色に戻す',
    reset: 'カメラをリセット',
    palettes: 'ゲームのパレット',
    paletteHelp: '対応するデータセットから抽出した BASECOLOURPALETTES.MBIN を開いてください。',
    importPalette: 'パレット MBIN を開く',
    seed: '実験的なカラーシード',
    calculatePalette: '色サンプルを計算',
    calculatedSeed: '計算されたシード',
    family: 'パレットファミリー',
    samples: '5 つの色サンプル',
    sample: '色サンプル',
    paletteIndex: '元の色',
    colorTarget: '適用先',
    visibleTarget: '表示中のすべてのパーツ',
    applyColor: '選択した色を適用',
    paletteWarning:
      '基本パレットの実験的な計算です。RGB サンプルはパーツを塗り替えるだけで、ネイティブのテクスチャマスク、宇宙船の外見、逆算したシードを予測するものではありません。',
    INVALID_PALETTE: 'このファイルは、対応する基本パレットのフィンガープリントと一致しません。',
    INVALID_SEED: '0x に続けて 1～16 桁の 16 進数を入力してください。',
    PALETTE_UNAVAILABLE: '色を計算する前に、対応するパレットファイルを開いてください。',
    failed: 'モデルを表示できませんでした。',
    INVALID_MODEL: 'このファイルは、プレビューの制限内の有効なモデルではありません。',
    UNSUPPORTED_MODEL:
      'このモデルは、対応範囲外のテクスチャ、アニメーション、拡張機能、またはジオメトリを使用しています。',
    FILE_UNAVAILABLE: '選択したファイルを読み込めませんでした。'
  },
  appearance: {
    title: 'シードによる外見レシピ',
    open: '外見レシピを開く',
    apply: 'レシピをプレビューに適用',
    help: 'メッシュの対応が明示されたレシピまたはシード検索レポートをインポートします。',
    warning:
      '候補のプレビュー: 明示されたパーツと RGB サンプルのみ。ネイティブの DDS テクスチャ、マスク、シェーダーは再現されません。',
    mismatch:
      'モデルのフィンガープリントまたはメッシュ名が一致しません。変更は適用されていません。',
    failed: 'このファイルは、対応する外見レシピとして読み込めませんでした。',
    seed: '候補シード',
    applied: 'レシピをプレビューに適用しました',
    candidate: '部分評価器の候補'
  },
  controls: {
    changeLanguage: '言語を変更',
    changeTheme: 'テーマを変更',
    light: 'ライト',
    dark: 'ダーク',
    system: 'システム'
  }
}
