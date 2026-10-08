import type { Messages } from '../messages'

export const jaJP: Messages = {
  app: { name: 'NMS Courier', tagline: 'No Man’s Sky 向けローカル配送' },
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
  controls: {
    changeLanguage: '言語を変更',
    changeTheme: 'テーマを変更',
    light: 'ライト',
    dark: 'ダーク',
    system: 'システム'
  }
}
