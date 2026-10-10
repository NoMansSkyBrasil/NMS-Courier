import type { Messages } from '../messages'

export const jaJP: Messages = {
  app: { name: 'NMS Courier', tagline: 'No Man’s Sky 向けローカル配送' },
  sections: { obtain: '新しく入手', upgrade: 'アップグレード' },
  corvette: {
    title: 'ファイルからコルベットを作る',
    hint: '共有されたコルベットファイル（.nmsship）を選びます。ゲームはその船を組み立て済みの状態でコルベット建造を開きます。選んだあとゲームを再起動してください。',
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
    inventory: 'アイテムと通貨',
    travel: '移動',
    equipment: '装備',
    knowledge: '知識',
    progress: '進行状況',
    style: '外見',
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
    teleport: {
      title: 'テレポート',
      summary: '銀河とポータルアドレスを指定して、ポータルなしで星系へ移動します。'
    },
    planets: {
      title: '惑星検索',
      summary: 'バイオーム、天候、センチネルで惑星を探し、ポータルアドレスを表示します。'
    },
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
    pendingTech: {
      title: '待機中のテクノロジー',
      summary: 'まだ部品を必要としているテクノロジーを、すべてのインベントリで完成させます。'
    },
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
    words: {
      title: '単語',
      summary:
        'ゲック、ヴァイキーン、コーバックス、アトラス、オートファジーの言語の単語を、1つ、複数、またはすべて。'
    },
    glyphs: { title: 'ポータルグリフ', summary: 'ポータルを開く16個のグリフ。' },
    missions: {
      title: 'ミッション',
      summary: 'ゲームにミッションの完了を依頼します。すべて、クエストとその手順、または手順1つ。'
    },
    guide: { title: 'ガイド', summary: '通常はプレイに応じて開く、ゲーム内ガイドのトピック。' },
    nexus: {
      title: 'スペースアノマリー',
      summary: '通常はストーリーで開放されるスペースアノマリーへのアクセス。'
    },
    standings: {
      title: '評価',
      summary: 'すべての種族、3つのギルド、無法者との評価をレベル単位で上げます。'
    },
    milestones: {
      title: 'マイルストーン',
      summary: '旅のマイルストーンと勢力のメダルをレベル単位で上げます。'
    },
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
      summary: 'シード値の見た目を確認したり、欲しいパーツのシード値を探したりできます。'
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
  status: { verified: '確認済み', experimental: 'テスト中', planned: '予定' },
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
    errorTitle: 'このページは動作を停止しました',
    errorReload: '再読み込み',
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
    connection: '接続',
    heroBody:
      '実行中の自分のゲームに、アイテム、通貨、アンロックを送ります。すべてゲーム自身が行い、セーブデータは編集されません。',
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
  savesPage: {
    slotsTitle: 'セーブスロット',
    slotsHint:
      'ゲームが各スロットを最後に保存した日時です。Courierが変更するのは、ゲームで読み込んでいるスロットだけです。',
    slot: 'スロット {number}',
    lastSaved: '最終保存：{when}',
    noSlots: 'セーブデータはまだ見つかりません。',
    backupsTitle: 'バックアップ',
    backupsHint:
      '変更のたびに、Courierはセーブフォルダー全体をコピーします。元に戻すには、ゲームを閉じて、コピーのファイルをセーブフォルダーに戻します。',
    backupCount: '{count}件のコピーを保管中',
    noBackups: 'コピーはまだありません。最初の変更の前に作成されます。',
    openFolder: 'コピーのフォルダーを開く',
    before: '変更前：{feature}'
  },
  setup: {
    chooseTitle: 'ゲームのフォルダーを選択',
    chooseBody: "CourierはNo Man's Skyのインストール先を知る必要があります。",
    chooseButton: 'フォルダーを選択',
    installTitle: 'Courierをゲームにインストール',
    updateTitle: 'ゲーム内のCourierを更新',
    installBody:
      '小さなファイル2つをゲームのフォルダーにコピーします。ゲームのファイルは置き換えず、セーブデータにも触れません。その後ゲームを起動してください。',
    installButton: 'インストール',
    updateButton: '更新',
    closeGameTitle: '完了するにはゲームを閉じてください',
    closeGameBody:
      'ゲームの実行中はファイルを置き換えられません。ゲームを閉じてからここに戻ってください。',
    foreignTitle: '別のModが同じファイルを使っています',
    foreignBody:
      'ゲームのフォルダーに、Courierのものではないxinput9_1_0.dllがあります。Courierはこれを置き換えません。Courierを使うには先にそのModを外してください。',
    unavailableTitle: 'Courierのファイルがありません',
    unavailableBody:
      'このアプリにはインストール用のファイルが含まれていません。アプリをもう一度ダウンロードしてください。',
    openGameTitle: 'ゲームを起動してセーブを読み込む',
    openGameBody: 'ゲームが起動すると、Courierは自動で接続します。',
    readyTitle: 'ゲームに接続しました',
    readyBody: '準備完了です。送るものを選んでください。'
  },
  settings: {
    internalNames: '内部名を表示',
    internalNamesHint:
      'ゲームの識別子と各リクエストの技術的な応答を表示します。問題を報告するときに役立ちます。',
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
    actionOne: 'ゲームに送る',
    expeditionGroup: '遠征 {number}',
    groupNames: {
      Weapon: 'マルチツール',
      Suit: 'エクソスーツ',
      AllShipsExceptAlien: '宇宙船（生ける船を除く）',
      AllShips: 'すべての宇宙船',
      Mech: 'ミノタウロス',
      Exocraft: 'エクソクラフト',
      Freighter: '貨物船',
      Ship: '宇宙船',
      AlienShip: '生ける宇宙船',
      RobotShip: 'センチネル迎撃機',
      Submarine: 'ノーティロン',
      AllVehicles: 'すべてのエクソクラフト',
      Colossus: 'エクソクラフト',
      catalogue_item: 'アイテム',
      catalogue_technology: 'テクノロジー',
      catalogue_construction: '建設メニュー',
      research_tree: '研究',
      cooking: '調理',
      refiner: '精製機',
      stat: 'マイルストーン',
      product: 'アイテム',
      mission: 'ミッション',
      interaction: '遭遇',
      none: 'その他',
      trophy: 'トロフィー',
      Common: 'コモン',
      Rare: 'レア',
      Epic: 'エピック',
      Legendary: 'レジェンダリー',
      Junk: 'ジャンク',
      shop: 'ショップ',
      customisation: '外見'
    },
    shipModel: {
      fighter: '戦艦',
      hauler: '輸送船',
      explorer: '探査船',
      shuttle: 'シャトル',
      solar: 'ソーラー',
      exotic: '外来種',
      living: '生ける宇宙船',
      interceptor: '迎撃機'
    },
    toolModel: {
      pistol: 'ピストル',
      rifle: 'ライフル',
      experimental: '実験型',
      alien: 'エイリアン',
      staff: 'スタッフ'
    },
    equipSeedHint: '空欄の場合はランダムなシードになります。',
    obtainAction: 'オファーを送信',
    obtainShipHint:
      'この種類・シード・クラスの新しい宇宙船を、ゲームが自身の画面で提示します。コレクションに追加するか、現在の船と交換するか、辞退できます。',
    obtainToolHint:
      'この種類・シード・クラスの新しいマルチツールを、ゲームが自身の画面で提示します。コレクションに追加するか、現在のものと交換するか、辞退できます。',
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
    equipSceneHint: '任意。空欄ならゲームが選びます。',
    equipModelSeed: 'モデルのシード',
    equipLegacyColours: '旧カラーを使用',
    equipLegacyColoursHint:
      'ゲームが配るツールと同じ旧カラーをマルチツールに与えます。オファーを受け取った直後に適用されます。',
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
    equipToolSlots: 'すべてのテクノロジースロット',
    equipToolSlotsHint:
      'オファーの時点で、マルチツールのテクノロジーグリッドの全マスを使用可能にします。',
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
    hint: '実行中のゲーム自身が、通常の渡し方で行います。',
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
    bridgeTitle: 'ゲームとの接続',
    bridgeHint: 'ゲーム内にあるCourierの小さなファイルが、ここから送った内容を実行します。',
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
  words: {
    hint: '行は言葉、列は言語です。覚えたいものにチェックを入れます。言葉をチェックすると、その別の形（abandon、abandoned）もチェックされます。',
    id: 'ID',
    marked: '{total}件中{count}件をチェック',
    word: '単語',
    raceAll: '表示中の{race}の単語すべて',
    race: {
      Traders: 'ゲック',
      Warriors: 'ヴァイキーン',
      Explorers: 'コーバックス',
      Atlas: 'アトラス',
      Builders: 'オートファジー'
    }
  },
  pendingTech: {
    exocraft: {
      0: 'エクソクラフト (Roamer)',
      1: 'エクソクラフト (Nomad)',
      2: 'エクソクラフト (Colossus)',
      3: 'ピルグリム',
      4: 'ドラゴンフライ',
      5: 'ノーティロン',
      6: 'ミノタウロス'
    },
    title: '取り付け待ちのテクノロジー',
    hint: '隅に歯車が付いたテクノロジーは、まだ部品を必要としています。待機中のものを確認し、ここで完成させます。部品は消費されません。',
    check: 'インベントリを確認',
    notChecked:
      'エクソスーツ、手持ちのマルチツール、すべての宇宙船、貨物船、すべてのエクソクラフトを調べます。',
    none: '待機中のものはありません。すべてのテクノロジーが取り付け済みです。',
    finishAll: 'すべて完成（{count}）',
    finishGroup: 'これらを完成',
    finishOne: '完成',
    confirm:
      'ゲームが待機中のテクノロジー{count}個を完成させます。必要な部品は消費されず、ゲームがメッセージを表示しない場合があります。',
    blockedHint: '破損スロット用と内部用の項目は、ここでは完成させません。',
    truncated: '256個を超えて待機中です。最初の256個のみ表示しています。',
    groups: {
      exosuit: 'エクソスーツ',
      multitool: '手持ちのマルチツール',
      ship: '宇宙船 {number}',
      freighter: '貨物船',
      exocraft: 'エクソクラフト {number}'
    },
    states: {
      waiting: '待機中',
      finished: '取り付け済み',
      still_waiting: 'まだ待機中',
      blocked: '許可されていません',
      unknown_id: 'ゲームに存在しません'
    }
  },
  planets: {
    sourceMine: '自分の惑星',
    mineHint:
      'これまでの検索で見つけたすべてを、銀河ごとにこのコンピューターに保存しています。リストを書き出して共有したり、友人のリストを取り込んだりできます。',
    galaxy: '銀河',
    exportList: 'リストを書き出す',
    importList: 'リストを取り込む',
    exported: '{count}個の惑星をファイルに書き出しました',
    imported: '新しい惑星を{count}個追加しました',
    importFailed: 'そのファイルは惑星リストではありません。',
    durationHint: '分（最大1,440分＝24時間）',
    wealth: '星系の豊かさ',
    wealthNames: { Poor: '貧困', Average: '平均的', Wealthy: '裕福' },
    presetDissonant: 'ディソナンス',
    flora: '植物',
    fauna: '動物',
    life: { Dead: 'なし', Low: '少ない', Mid: '普通', Full: '豊富' },
    purple: '紫の星',
    purpleHint: '水の惑星と巨大ガス惑星は、紫の星の周りにしかありません。',
    portalOnly: 'ポータル専用',
    portalOnlyHint: '銀河マップにない星系です。ポータルか、このページの移動でのみ行けます。',
    sourceSurvey: '用意済みリスト（ユークリッド）',
    sourceLive: '自分の周囲（どの銀河でも）',
    liveHint:
      'ゲーム自身が、近い順に周囲の星系を調べます。時間をかけるほど遠くまで届きます。その間も遊び続けられます。星系を離れると検索は止まります。',
    duration: '検索時間',
    minutes: '{count}分',
    start: '検索を開始',
    stop: '停止',
    progress: '{systems}星系を確認、{distance}リージョン先まで',
    liveEmpty: 'まだ見つかっていません。検索を開始するか、条件をゆるめてください。',
    grass: '草の色',
    liveState: {
      running: '検索中…',
      done: '検索完了',
      stopped: '停止しました',
      travelled: '停止：星系を離れました',
      failed: 'ゲームから応答がなく、それ以上は何も行っていません',
      not_ready: '星系がまだ読み込まれていません'
    },
    grassHues: {
      green: '緑',
      teal: '青緑',
      blue: '青',
      purple: '紫',
      pink: 'ピンク',
      red: '赤',
      orange: 'オレンジ',
      yellow: '黄',
      pale: '淡色'
    },
    title: '惑星を探す',
    hint: 'どんな惑星がよいかを選び、結果へ移動するかポータルアドレスをコピーします。',
    scopeTitle: '今のところユークリッド銀河のみ',
    scope:
      'ユークリッドの一地域にある{count}個の惑星を、ゲーム自体のルールで算出しました。いくつかはゲーム内で確認し、一致しました。',
    presetEarth: '地球に似た惑星',
    presetAll: 'すべて',
    presetHint:
      '地球に似た惑星：緑豊か、嵐なし、極端な天候なし、センチネル少なめ、感染・湿地ではない。',
    biome: 'バイオーム',
    variant: 'バリエーション',
    variantEarth: '地球に似たバリエーション',
    storms: '嵐',
    sentinels: 'センチネル',
    race: '星系の種族',
    raceNone: '無人',
    perSystem: '同じ星系内の該当数',
    perSystemOption: '{count}個以上',
    perSystemOne: '1つで十分',
    system: '星系',
    systemLawful: '海賊星系を除く',
    systemPirate: '海賊星系のみ',
    pirate: '海賊星系',
    economy: {
      Mining: '採掘',
      HighTech: 'テクノロジー',
      Trading: '交易',
      Manufacturing: '製造',
      Fusion: '先端素材',
      Scientific: '科学',
      PowerGeneration: '発電'
    },
    extreme: '極端な天候を許可',
    extremeHint: '極端な惑星は嵐や危険がより激しくなります。',
    extremeYes: '極端な天候',
    any: '指定なし',
    search: 'ポータルアドレスで検索',
    found: '{systems}星系に{planets}個の惑星',
    inSystem: 'この星系に{count}個',
    copy: 'ポータルアドレスをコピー',
    copied: 'コピーしました',
    save: 'テレポートページ用に保存',
    saved: '保存しました',
    travel: '移動',
    confirm:
      '現在地を離れ、ゲームが{planet}（{portal}）の星系を読み込み、その惑星に降ろします。この場所に戻りたい場合は先にセーブしてください。',
    empty: '惑星の調査データを読み込めませんでした。',
    biomes: {
      Lush: '緑豊か',
      Toxic: '有毒',
      Scorched: '灼熱',
      Radioactive: '放射能',
      Frozen: '凍結',
      Barren: '不毛',
      Dead: '死の星',
      Weird: 'エキゾチック',
      Swamp: '湿地',
      Lava: '火山',
      Red: '赤（クロマティック）',
      Green: '緑（クロマティック）',
      Blue: '青（クロマティック）',
      Waterworld: '水の惑星',
      GasGiant: 'ガス巨星'
    },
    variants: {
      standard: '標準',
      highQuality: '高品質',
      jungle: 'ジャングル',
      worlds: 'リニューアル（Worlds）',
      floral: '花畑',
      rocky: '岩場',
      tentacles: '触手',
      bubbles: '泡',
      giant: '巨大植物',
      variant: 'その他のバリエーション',
      swamp: '湿地風',
      lava: '火山風',
      ruins: '遺跡',
      infested: '感染',
      shapes: 'エキゾチック形状',
      remix: 'リミックス',
      none: '名称なし'
    },
    stormLimit: { None: '嵐なし', Low: '少ない嵐まで', High: '多い嵐まで', Always: '指定なし' },
    stormLevels: { None: 'なし', Low: '少ない', High: '多い', Always: '常時' },
    sentinelLimit: {
      Low: '低のみ',
      Default: '標準まで',
      Aggressive: '攻撃的まで',
      Corrupt: '指定なし（汚染も含む）'
    },
    sentinelLevels: { Low: '低', Default: '標準', Aggressive: '攻撃的', Corrupt: '汚染' }
  },
  missions: {
    warningTitle: '実験的：テスト用セーブを使用してください',
    warning:
      'チェックしたミッションをゲームが完了させます。飛ばした段階の報酬がもらえるかはまだ分かっていません。先にセーブをバックアップします。',
    search: 'クエスト、ミッション、IDで検索',
    untitled: 'ゲーム内でタイトルのないミッションを表示',
    untitledHint: 'ゲームがログに名前を出さない補助ミッションです。識別子で表示されます。',
    untitledGroup: 'ゲーム内タイトルなし',
    section: {
      story: 'メインストーリー',
      atlas: 'アトラスの道',
      secondary: 'サブミッション',
      guide: 'ガイドとマイルストーン',
      seasonal: '探検'
    },
    part: 'パート{number}',
    after: '開始条件：{quest}の完了',
    silent: 'ゲーム内の完了メッセージなし',
    quests: 'クエスト {total}件中{shown}件',
    count: 'ミッション {count}件',
    stages: '{count}段階',
    rewards: '報酬 {count}件',
    chosen: '{count}件をチェック',
    action: 'すべて完了',
    actionChosen: 'チェックしたものを完了（{count}）'
  },
  levels: {
    hint: {
      standings:
        '種族、ギルド、派閥との評価をレベル単位で上げます。ゲーム自身が行い、ゲームのメッセージが表示されます。下がることはありません。',
      milestones:
        '旅のマイルストーンをレベル単位で上げます。上がるのは数値だけです。「集めた言葉」を上げても言葉は覚えません。下がることはありません。'
    },
    mode: 'どこまで',
    modeOne: '1レベル',
    modeSome: '複数レベル',
    modeAll: '最後のレベルまで',
    modeHint: 'それぞれの現在のレベルから数えます。',
    messageHint: 'ゲームがメッセージを表示するかどうかは各行に示されています。',
    message: {
      full: '通常のメッセージ',
      quick: '短いメッセージ',
      silent: 'ゲーム内メッセージなし'
    },
    announce: '通知のない項目にもマイルストーン画面を表示する',
    announceHint:
      'ゲームは一部の項目でのみマイルストーンの全画面を表示します。オン：ほかの項目でも表示します。',
    count: 'レベル数',
    countHint: '上げるレベル数（1～{max}）。',
    action: 'すべて上げる',
    actionChosen: '選択したものを上げる（{count}）'
  },
  glyphs: {
    hint: 'グリフはゲーム自身が通知付きで渡します。下に示すゲームの順番で届き、特定のグリフは選べません。',
    order: 'ゲーム内のグリフの順番',
    all: '16個すべて',
    allHint: 'すべてのグリフを一度に。',
    count: '個数',
    countHint: 'まだ持っていない次のグリフ、1～{max}個。',
    action: 'グリフを習得'
  },
  teleport: {
    hint: 'ゲーム自身のテレポーターと同じ方法で移動します。到着先は星系の宇宙ステーション、または最初のグリフが示す惑星です。',
    galaxy: '銀河',
    galaxyHint: 'ゲーム内のすべての銀河を番号と名前で表示します。入力して検索できます。',
    galaxyEmpty: '銀河が見つかりません。',
    galaxyNumber: '銀河 {number}',
    address: 'ポータルアドレス',
    addressHint:
      '0～Fの数字で表した12個のグリフ：惑星、星系、3つの座標の順。クリックするかコードを貼り付けてください。',
    erase: '最後のグリフを消す',
    destination: '到着先',
    destinationHint: '宇宙ステーションが安全な選択です。惑星はアドレスの最初のグリフを使います。',
    toStation: '星系の宇宙ステーション',
    toPlanet: 'アドレスの惑星',
    action: 'テレポート',
    confirmBody:
      '現在地を離れ、ゲームが別の星系を読み込みます。この場所に正確に戻りたい場合は先にセーブしてください。',
    favourites: '保存した目的地',
    favouritesHint: 'このアプリがこのパソコンに保存します。ゲームからは見えません。',
    favouriteName: '目的地の名前',
    addFavourite: 'このアドレスを保存',
    useFavourite: '使う',
    removeFavourite: '削除',
    noFavourites: 'まだ何も保存されていません。'
  },
  workshop: {
    title: 'モデル工房',
    description:
      '見たいものを選び、シード値を入力するか、ランダムに生成するか、パーツを選んでその組み合わせを持つシード値をアプリに探させます。',
    tabBuild: '組み立て',
    tabView: 'シード値を表示',
    buildDescription:
      '種類、パーツ、色、テクスチャを選びます。その組み合わせを持つシード値をアプリが探して表示します。',
    viewDescription: '種類を選び、シード値を入力するかランダムに生成して、見た目を確認します。',
    colorTitle: '色',
    roles: {
      primary: 'メインカラー',
      secondary: 'サブカラー',
      decal1: 'デカールカラー 1',
      decal2: 'デカールカラー 2'
    },
    texturesTitle: 'テクスチャとデカール',
    baseTexture: { COATING: 'コーティング', PAINTED: '塗装', PANELS: 'メタル' },
    seedTexturesTitle: 'このシード値のテクスチャとデカール',
    colorHint:
      'モデルがゲームのパレットから取る各色です。色の枠を選んでから色を選びます。「指定なし」はシード値に任せます。',
    seedColorsTitle: 'このシード値の色',
    paintLabel: '塗装',
    undercoatLabel: '下地',
    tabSystem: '現在の星系',
    systemDescription:
      '実行中のゲームから読み取った、今いる星系の情報です。星系のシード値と、ゲームがその星系用に生成した宇宙船を表示します。ゲーム内のものは何も変更しません。',
    systemNone:
      '表示するものがありません。ブリッジ 1.8.0 以降でゲームを起動し、セーブを読み込んでいる必要があります。一覧は数秒ごとに更新されます。',
    systemSeed: '星系のシード値',
    systemShips: 'この星系の宇宙船',
    systemClass: 'クラス',
    systemRole: '役割',
    systemShipSeed: 'シード値',
    systemView: '表示',
    systemRefresh: '更新',
    systemClassNumber: 'クラス {number}',
    systemStream:
      '確認済み: 宇宙船のシード値は星系シード値の数列上にあり、最初のものは {steps} ステップ後に引かれます。',
    systemStreamUnknown: '宇宙船のシード値は星系シード値の数列上に見つかりませんでした。',
    tabFile: 'モデルファイル',
    categoryLabel: 'カテゴリ',
    category: { starship: '宇宙船', multitool: 'マルチツール', freighter: '貨物船' },
    kindLabel: '種類',
    toolKind: {
      standard: '標準',
      royal: 'ロイヤル',
      sentinel: 'センチネル',
      sentinelB: 'センチネル B',
      atlasSceptre: 'アトラスの笏',
      atlas: 'アトランティド',
      staff: '杖',
      staffRuin: 'タイタンの柱',
      staffBone: 'バジリスククラウン',
      switch: 'インフィニットネオン マークXXII',
      retro: 'Starbound v0.27',
      swarm: 'ダイアーワスプディスインテグレーター',
      staffNpc: 'NPCの杖'
    },
    seedLabel: 'シード値',
    homeSeedHint:
      '貨物船の色は母星系で決まります。その星系のシードを入力するか、抽選するか、下にポータルアドレスを入力します。空欄なら色なしで表示します。',
    homeAddress: 'このシード値は、銀河 {galaxy} のポータルアドレス {glyphs} の星系です。',
    glyphsLabel: 'ポータルアドレス（12 グリフ、0–9・A–F）',
    galaxyLabel: '銀河番号',
    useAddress: 'この星系を使う',
    legacyColours: '旧カラーを使用',
    legacyColoursHint:
      'ゲームにはシード値から色を決める方法が2つあります。ゲームが渡すマルチツールは旧方式を使い、宇宙船はセーブ内で1隻ずつ指定されます（旧カラーを使用）。',
    seedOrigin:
      'ゲームはこのシード値を、銀河 {galaxy} のポータルアドレス {glyphs} の星系で（その数列の {steps} ステップ後に）引きます。手がかりであり、確証ではありません。',
    seedHint: '0x に続く 16 桁の 16 進数。Enter キーまたは「表示」で確認できます。',
    show: '表示',
    generate: 'シード値を生成',
    generateWithParts: 'このパーツで生成',
    clearParts: 'パーツ指定を解除',
    getInGame: 'これをゲームで入手',
    found: '{tries} 回の試行でシード値が見つかりました',
    building: 'モデルを組み立て中…',
    empty: '表示するものはまだありません',
    partsTitle: 'パーツ',
    partsHint:
      '欲しいパーツを選び、残りは「指定なし」のままにします。固有のパーツを持つパーツの下には、さらにリストが表示されます。',
    anyPart: '指定なし',
    rare: 'レア',
    detailsTitle: 'シード値が決めた細部',
    note: 'モデルは自分のゲームファイルから読み込みます。形と色はシードに従います。照明は簡略化されているため、ゲームとは少し見え方が異なります。',
    errors: {
      INSTALLATION_NOT_SELECTED: '先に「ブリッジ」でゲームフォルダを選択してください。',
      UNKNOWN_KIND: 'この種類は利用できません。',
      INVALID_SEED: 'シード値は 0x に続く最大 16 桁の 16 進数で入力してください。',
      GAME_FILES_UNREADABLE: 'このモデルのゲームファイルを読み込めませんでした。',
      MODEL_TOO_LARGE: 'このモデルは大きすぎて表示できません。',
      SEED_NOT_FOUND:
        '時間内にこのパーツを持つシード値が見つかりませんでした。もう一度試すか、パーツを 1 つ「指定なし」にしてください。'
    }
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
