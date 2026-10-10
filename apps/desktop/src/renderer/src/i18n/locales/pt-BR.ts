import type { Messages } from '../messages'

export const ptBR: Messages = {
  app: { name: 'NMS Courier', tagline: 'Entrega local para No Man’s Sky' },
  sections: { obtain: 'Obter', upgrade: 'Melhorar' },
  corvette: {
    title: 'Corveta a partir de arquivo',
    hint: 'Escolha um arquivo de corveta compartilhado (.nmsship). O jogo passa a abrir a construção de corvetas com essa nave já montada. Reinicie o jogo depois de escolher.',
    none: 'Nenhum arquivo de corveta foi preparado ainda.',
    current: 'Preparado: {name}, {count} peças.',
    parts: '{count} peças',
    hullParts: '{count} peças de casco',
    missing: 'Sem: {parts}. O jogo mostra um aviso e constrói mesmo assim.',
    partCockpit: 'cabine',
    partLandingGear: 'trem de pouso',
    partHabitation: 'módulo de habitação',
    partReactor: 'reator',
    rejectedTitle: 'Este arquivo não pode ser usado',
    rejectedShip:
      'Esta é uma nave comum, não uma corveta. Naves a partir de arquivo ainda não estão disponíveis.',
    rejectedInvalid: 'Este não é um arquivo de corveta válido.',
    installedTitle: 'Corveta preparada',
    installedBody:
      'Feche o jogo, se estiver aberto, e abra de novo. Depois use "Iniciar construção de corveta" abaixo.',
    installFailedTitle: 'Não foi possível preparar a corveta',
    installFailed: 'Os arquivos não puderam ser gravados na pasta do jogo.',
    choose: 'Escolher arquivo',
    install: 'Preparar no jogo'
  },
  groups: {
    overview: 'Visão geral',
    inventory: 'Itens e moedas',
    travel: 'Viagem',
    equipment: 'Equipamento',
    knowledge: 'Conhecimento',
    progress: 'Progresso',
    style: 'Visual',
    rewards: 'Recompensas',
    library: 'Biblioteca',
    system: 'Sistema'
  },
  features: {
    dashboard: { title: 'Painel', summary: 'Se a entrega está disponível agora, e por quê.' },
    activity: { title: 'Atividade', summary: 'Cada pedido enviado ao jogo e o resultado.' },
    items: {
      title: 'Itens',
      summary: 'Substâncias e produtos colocados em um inventário do save carregado.'
    },
    currencies: { title: 'Moedas', summary: 'Unidades, nanitos e mercúrio.' },
    teleport: {
      title: 'Teleporte',
      summary:
        'Viaje para um sistema estelar por galáxia e endereço de portal, sem precisar de um portal.'
    },
    planets: {
      title: 'Localizar planetas',
      summary: 'Encontre planetas por bioma, clima e sentinelas, com o endereço de portal.'
    },
    exosuit: {
      title: 'Exotraje',
      summary: 'Classe, espaços de carga e de tecnologia e espaços sobrecarregados do exotraje.'
    },
    starships: {
      title: 'Naves',
      summary: 'Classe, tamanho do inventário e espaços sobrecarregados da nave que você possui.'
    },
    multitools: {
      title: 'Multiferramentas',
      summary: 'Classe, espaços e espaços sobrecarregados da multiferramenta equipada.'
    },
    freighters: {
      title: 'Cargueiros',
      summary: 'Uma oferta de cargueiro com a classe, o modelo e as sementes escolhidos.'
    },
    frigates: { title: 'Fragatas', summary: 'Recrutamento de fragatas para a frota.' },
    pendingTech: {
      title: 'Tecnologias pendentes',
      summary: 'Conclua tecnologias que ainda pedem componentes, em todos os inventários.'
    },
    upkeep: {
      title: 'Consertar e recarregar',
      summary: 'Conserte tecnologias danificadas e recarregue o que acabou.'
    },
    purpleStars: {
      title: 'Estrelas roxas no mapa',
      summary:
        'Mostra no mapa da galáxia os sistemas de estrela roxa, que a história normalmente libera.'
    },
    corvettes: {
      title: 'Corvetas',
      summary: 'Uma corveta construída a partir de um projeto compartilhado.'
    },
    companions: { title: 'Companheiros', summary: 'Ovos de companheiro e criaturas.' },
    technologies: {
      title: 'Tecnologias',
      summary: 'Plantas que o personagem sabe instalar.'
    },
    productRecipes: {
      title: 'Receitas de fabricação',
      summary: 'Receitas de itens fabricáveis e de tecnologia fabricável.'
    },
    buildParts: {
      title: 'Peças de construção',
      summary: 'Peças de base, de cargueiro e de decoração no menu de construção.'
    },
    refinerRecipes: {
      title: 'Refino e culinária',
      summary: 'Receitas do refinador e do processador de nutrientes no catálogo.'
    },
    customisation: {
      title: 'Aparência',
      summary: 'Capacetes, armaduras, capas, estandartes, rastros de jetpack e gestos.'
    },
    titles: { title: 'Títulos', summary: 'Títulos de jogador para o estandarte.' },
    words: {
      title: 'Palavras',
      summary: 'Palavras das línguas Gek, Vy’keen, Korvax, Atlas e Autófago: uma, várias ou todas.'
    },
    glyphs: { title: 'Glifos de portal', summary: 'Os dezesseis glifos que abrem portais.' },
    missions: {
      title: 'Missões',
      summary:
        'Pede ao jogo para concluir missões: todas, uma quest com suas etapas ou uma etapa só.'
    },
    guide: {
      title: 'Guia',
      summary: 'Tópicos do guia do jogo que normalmente abrem conforme você joga.'
    },
    nexus: {
      title: 'Anomalia espacial',
      summary: 'Acesso à Anomalia espacial, que a história normalmente libera.'
    },
    standings: {
      title: 'Reputação',
      summary:
        'Reputação com todas as raças, as três guildas e os criminosos, aumentada por níveis.'
    },
    milestones: {
      title: 'Marcos',
      summary: 'Marcos da jornada e medalhas das facções, aumentados por níveis.'
    },
    fishing: { title: 'Registro de pesca', summary: 'O registro de captura de cada peixe.' },
    expeditions: {
      title: 'Expedições',
      summary: 'Recompensas de expedições passadas, resgatáveis no companheiro de mercúrio.'
    },
    twitch: {
      title: 'Drops da Twitch',
      summary: 'Recompensas de campanhas da Twitch, resgatáveis no companheiro de mercúrio.'
    },
    platform: {
      title: 'Plataforma e pré-venda',
      summary: 'Recompensas ligadas a uma plataforma, a uma pré-venda ou a um evento.'
    },
    quicksilver: {
      title: 'Loja de mercúrio',
      summary: 'Itens vendidos pelo companheiro de mercúrio.'
    },
    catalog: { title: 'Catálogo do jogo', summary: 'Pesquise os itens do seu jogo instalado.' },
    models: {
      title: 'Oficina de modelos',
      summary: 'Veja como é uma seed ou encontre uma seed para as peças que você quer.'
    },
    bridge: {
      title: 'Jogo e ponte',
      summary: 'Instalação, versão do jogo e a conexão com o jogo em execução.'
    },
    saves: {
      title: 'Saves e conta',
      summary: 'Qual slot de save está carregado e o que é compartilhado pela conta inteira.'
    },
    settings: { title: 'Configurações', summary: 'Idioma, aparência e detalhes do aplicativo.' }
  },
  status: { verified: 'Verificado', experimental: 'Em teste', planned: 'Planejado' },
  statusHint: {
    verified: 'Funcionou no jogo em execução, na versão de pesquisa.',
    experimental: 'Funciona em parte ou só em condições conhecidas.',
    planned: 'Ainda não foi construído.'
  },
  scope: {
    slot: 'Slot de save',
    account: 'Conta',
    both: 'Slot de save e conta',
    none: 'Sem alteração'
  },
  scopeHint: {
    slot: 'Altera apenas o slot de save carregado.',
    account: 'Altera a conta, compartilhada por todos os slots de save.',
    both: 'Altera o slot de save carregado e a conta.',
    none: 'Somente leitura; nada muda no jogo.'
  },
  rows: {
    deliverable: 'Entregues',
    blockedDamaged: 'Entradas de espaço danificado, nunca entregues',
    blockedMaintenance: 'Entradas de manutenção, nunca entregues',
    blockedTemplates: 'Modelos procedurais, nunca entregues',
    blockedById: 'Bloqueadas por uma regra permanente',
    catalogueItems: 'Itens fabricáveis',
    craftableTechnology: 'Tecnologia fabricável',
    buildParts: 'Peças de construção',
    researchTree: 'Vendidas nos terminais de pesquisa',
    repeatableNever: 'Compras repetíveis, nunca desbloqueadas',
    missionBound: 'Ligados a uma missão, ignorados',
    redeemedInSave: 'Registrados no save',
    itemRewards: 'Itens para resgatar na loja',
    total: 'No jogo'
  },
  rules: {
    gameRoutines:
      'Tudo é feito pelo próprio jogo em execução. Arquivos de save nunca são editados.',
    defectiveNever: 'Entradas defeituosas e internas nunca são entregues, em nenhum modo.',
    repeatableNever:
      'Fogos de artifício, o Sinalizador Mítico e o Ovo do Vazio nunca são desbloqueados: a loja deixaria de vendê-los.',
    claimItems:
      'Naves, multiferramentas, ovos e pacotes são desbloqueados na conta; resgate-os na loja para receber o item.',
    keepList:
      'Os drops da Twitch só continuam resgatáveis enquanto a ponte estiver instalada. Resgate o que quiser manter.',
    backup: 'A pasta de saves é copiada antes de cada alteração.',
    slotIdentified: 'O slot de save carregado é identificado antes de cada entrega.',
    accountShared:
      'Alterações na conta chegam a todos os slots de save e são sincronizadas pelo jogo.'
  },
  page: {
    errorTitle: 'Esta página parou de funcionar',
    errorReload: 'Recarregar',
    availabilityTitle: 'Ainda não disponível nesta janela',
    availabilityBody:
      'Isto foi feito pela ponte de pesquisa. A conexão deste aplicativo com o jogo ainda está em construção, então nada pode ser enviado daqui.',
    includes: 'O que abrange',
    includesHint: 'Números da versão de pesquisa.',
    rulesTitle: 'Como se comporta',
    rulesHint: 'Regras que sempre valem.',
    entries: 'Entradas',
    kind: 'Tipo',
    status: 'Situação',
    scope: 'Altera',
    researchBuild: 'Versão de pesquisa {build}',
    plannedTitle: 'Ainda não construído',
    plannedBody:
      'Esta área está planejada. Ela aparecerá aqui quando funcionar no jogo em execução.',
    open: 'Abrir'
  },
  dashboard: {
    connection: 'Conexão',
    heroBody:
      'Envie itens, moedas e desbloqueios para o seu próprio jogo enquanto ele roda. O jogo faz tudo sozinho; seus saves nunca são editados.',
    game: 'Jogo',
    build: 'Versão do jogo',
    bridge: 'Ponte',
    catalog: 'Catálogo',
    capabilities: 'O que o Courier faz',
    capabilitiesHint: 'Cada área, o que ela altera e até onde foi comprovada.',
    feature: 'Área',
    area: 'Grupo',
    running: 'Em execução',
    notRunning: 'Fechado',
    notSelected: 'Nenhuma instalação selecionada',
    unknown: 'Desconhecido',
    supported: 'Compatível',
    unsupported: 'Não compatível',
    connected: 'Conectada',
    notConnected: 'Não conectada',
    available: 'Disponível',
    unavailable: 'Não gerado',
    entriesCount: '{count} entradas',
    processId: 'Processo {id}'
  },
  savesPage: {
    slotsTitle: 'Seus slots de save',
    slotsHint:
      'Quando o jogo salvou cada slot pela última vez. O Courier só altera o slot que está carregado no jogo.',
    slot: 'Slot {number}',
    lastSaved: 'Salvo por último em {when}',
    noSlots: 'Nenhum save foi encontrado ainda.',
    backupsTitle: 'Cópias de segurança',
    backupsHint:
      'Antes de cada alteração o Courier copia toda a sua pasta de saves. Para voltar atrás, feche o jogo e devolva os arquivos de uma cópia à pasta de saves.',
    backupCount: '{count} cópias guardadas',
    noBackups: 'Nenhuma cópia ainda. Uma é feita antes da primeira alteração.',
    openFolder: 'Abrir a pasta das cópias',
    before: 'Antes de: {feature}'
  },
  setup: {
    chooseTitle: 'Escolha a pasta do jogo',
    chooseBody: "O Courier precisa saber onde o No Man's Sky está instalado.",
    chooseButton: 'Escolher pasta',
    installTitle: 'Instalar o Courier no jogo',
    updateTitle: 'Atualizar o Courier no jogo',
    installBody:
      'Dois arquivos pequenos são copiados para a pasta do jogo. Nada do jogo é substituído e seus saves não são tocados. Depois, abra o jogo.',
    installButton: 'Instalar',
    updateButton: 'Atualizar',
    closeGameTitle: 'Feche o jogo para concluir',
    closeGameBody:
      'Os arquivos não podem ser trocados com o jogo aberto. Feche o jogo e volte aqui.',
    foreignTitle: 'Outro mod usa o mesmo arquivo',
    foreignBody:
      'A pasta do jogo já tem um arquivo xinput9_1_0.dll que não é do Courier. O Courier não vai substituí-lo; remova esse mod antes para usar o Courier.',
    unavailableTitle: 'Os arquivos do Courier estão faltando',
    unavailableBody:
      'Esta cópia do aplicativo não traz os arquivos que ele instala. Baixe o aplicativo de novo.',
    openGameTitle: 'Abra o jogo e carregue um save',
    openGameBody: 'O Courier se conecta sozinho assim que o jogo estiver aberto.',
    readyTitle: 'Conectado ao jogo',
    readyBody: 'Tudo pronto. Escolha o que enviar.'
  },
  settings: {
    internalNames: 'Mostrar nomes internos',
    internalNamesHint:
      'Mostra os identificadores do jogo e a resposta técnica de cada envio. Útil para relatar um problema.',
    notifications: 'Notificações do jogo',
    notificationsHint:
      'Deixa o jogo mostrar a própria notificação do que for entregue, quando existir. Desative para entregar em silêncio. Melhorias de inventário nunca pedem confirmação.',
    general: 'Geral',
    appearance: 'Aparência',
    about: 'Sobre',
    language: 'Idioma',
    languageHint: 'Os catorze idiomas de No Man’s Sky.',
    theme: 'Tema',
    themeHint: 'Segue o sistema por padrão.',
    experimental: 'Software experimental',
    experimentalBody:
      'O NMS Courier é uma ferramenta não oficial em desenvolvimento. Ele funciona com uma versão exata do jogo por vez.'
  },
  delivery: {
    actionOne: 'Enviar ao jogo',
    expeditionGroup: 'Expedição {number}',
    groupNames: {
      Weapon: 'Multiferramenta',
      Suit: 'Exotraje',
      AllShipsExceptAlien: 'Naves, exceto vivas',
      AllShips: 'Todas as naves',
      Mech: 'Minotauro',
      Exocraft: 'Exoveículo',
      Freighter: 'Nave cargueira',
      Ship: 'Nave',
      AlienShip: 'Nave viva',
      RobotShip: 'Interceptador sentinela',
      Submarine: 'Nautilon',
      AllVehicles: 'Todos os exoveículos',
      Colossus: 'Colossus',
      catalogue_item: 'Itens',
      catalogue_technology: 'Tecnologia',
      catalogue_construction: 'Menu de construção',
      research_tree: 'Pesquisa',
      cooking: 'Culinária',
      refiner: 'Refinador',
      stat: 'Marco',
      product: 'Item',
      mission: 'Missão',
      interaction: 'Encontro',
      none: 'Outro',
      trophy: 'Troféu',
      Common: 'Comum',
      Rare: 'Raro',
      Epic: 'Épico',
      Legendary: 'Lendário',
      Junk: 'Lixo',
      shop: 'Loja',
      customisation: 'Aparência'
    },
    shipModel: {
      fighter: 'Nave de combate',
      hauler: 'Carregador',
      explorer: 'Explorador',
      shuttle: 'Transporte',
      solar: 'Solar',
      exotic: 'Exótico',
      living: 'Nave viva',
      interceptor: 'Interceptador'
    },
    toolModel: {
      pistol: 'Pistola',
      rifle: 'Rifle',
      experimental: 'Experimental',
      alien: 'Alienígena',
      staff: 'Cajado'
    },
    equipSeedHint: 'Vazio sorteia uma semente aleatória.',
    obtainAction: 'Enviar oferta',
    obtainShipHint:
      'O jogo oferece uma nave nova desse tipo, semente e classe na tela dele: adicione à coleção, troque pela atual ou recuse.',
    obtainToolHint:
      'O jogo oferece uma multiferramenta nova desse tipo, semente e classe na tela dele: adicione à coleção, troque pela atual ou recuse.',
    obtainPlanned: 'Ainda não é possível obter um novo por aqui.',
    equipSceneEmpty: 'Nenhum modelo encontrado.',
    freighterModel: {
      default: 'Escolhido pelo jogo',
      regular: 'Cargueiro',
      small: 'Cargueiro pequeno',
      tiny: 'Cargueiro minúsculo',
      capital: 'Cargueiro capital',
      pirate: 'Encouraçado pirata'
    },
    equipScene: 'Modelo',
    equipSceneHint: 'Opcional. Deixe vazio para o jogo escolher.',
    equipModelSeed: 'Semente do modelo',
    equipLegacyColours: 'Usar cores legadas',
    equipLegacyColoursHint:
      'Dá à multiferramenta as cores antigas, como as das ferramentas que o jogo entrega. Aplicado logo depois que você aceita a oferta.',
    equipHomeSeed: 'Semente do sistema de origem',
    currencyAmountHint: 'Qualquer valor de 1 a {max}, o maior saldo que o jogo mantém.',
    itemsStack: 'Pilha de {count}',
    equipActionLabel: 'Ação',
    equipTarget: 'Nave',
    equipTargetCurrent: 'Nave atual',
    equipTargetSlot: 'Nave do espaço {number}',
    equipClass: 'Classe',
    equipSlots: 'Todos os espaços do inventário',
    equipSlotsHint: 'Torna utilizáveis todas as posições das grades de carga e de tecnologia.',
    equipToolSlots: 'Todos os slots de tecnologia',
    equipToolSlotsHint:
      'Libera todas as posições da grade de tecnologia da multiferramenta, já na oferta.',
    equipSupercharge: 'Espaços supercarregados',
    equipSuperchargeHint:
      'Transforma todo espaço de tecnologia utilizável em espaço supercarregado.',
    equipExtended: 'Linhas extras de tecnologia',
    equipExtendedHint:
      'Aumenta a grade de tecnologia para doze linhas. Exige todos os espaços do inventário.',
    currencyHint:
      'A recompensa do próprio jogo adiciona o valor e mostra a notificação dele. O saldo nunca passa do máximo do jogo.',
    currencyLabel: 'Moeda',
    equipAction: {
      slotReward: 'Adicionar um espaço de inventário',
      grid: 'Aplicar ao inventário',
      classStep: 'Subir um nível de classe',
      offer: 'Enviar oferta de cargueiro',
      build: 'Iniciar construção de corveta'
    },
    equipActionHint: {
      slotReward:
        'Pede ao jogo a recompensa de espaço dele. O jogo abre a janela para você escolher onde o novo espaço fica.',
      grid: 'Altera o inventário que você já tem, no lugar. Nada é aberto no jogo.',
      classStep:
        'Pede ao jogo a recompensa de melhoria dele: um nível de classe por pedido, até S.',
      offer:
        'O jogo oferece um cargueiro com as opções abaixo. Aceite no jogo; ele substitui o seu cargueiro atual.',
      build: 'O jogo abre a construção de corveta com as opções abaixo.'
    },
    currencyName: { units: 'Unidades', nanites: 'Nanitas', quicksilver: 'Mercúrio' },
    itemsTitle: 'Enviar itens ao jogo',
    itemsHint:
      'Substâncias e produtos vão para a carga do exotraje do save carregado, em pilhas do tamanho que o jogo permite. O que não couber não é enviado.',
    itemsAdd: 'Adicionar',
    itemsAmount: 'Quantidade',
    itemsRemove: 'Remover',
    itemsEmpty: 'Busque no catálogo e adicione os itens a enviar.',
    itemsAction: 'Enviar itens ({count})',
    itemsConfirm:
      'Os itens são colocados na carga do exotraje do save carregado agora. Antes é feito um backup da pasta de saves. A mudança é gravada no save quando o jogo salvar.',
    selectTitle: 'Escolha o que enviar',
    selectHint: 'Marque uma entrada, várias ou todas. Somente as entradas escolhidas são enviadas.',
    selectSearch: 'Buscar por nome ou ID',
    selectAllShown: 'Selecionar todos os exibidos',
    selectClear: 'Limpar seleção',
    selectCount: '{count} selecionados',
    selectShowing: 'Exibindo {shown} de {total}. Use a busca para reduzir a lista.',
    selectAction: 'Enviar selecionados ({count})',
    selectNoCatalog:
      'Os nomes aparecem depois que o catálogo é lido do jogo (Biblioteca, Catálogo do jogo).',
    selectNone: 'Nada corresponde à busca.',
    title: 'Enviar ao jogo',
    hint: 'O próprio jogo, em execução, faz isso do jeito que ele mesmo entregaria.',
    action: 'Entregar tudo',
    sending: 'Enviando…',
    confirmTitle: 'Enviar isto ao jogo em execução?',
    confirmSlot:
      'Altera o slot de save carregado no jogo neste momento. A pasta de saves é copiada antes.',
    confirmAccount:
      'Altera a sua conta, compartilhada por todos os slots de save, e o jogo a sincroniza. A pasta de saves e o arquivo de configurações são copiados antes.',
    confirm: 'Enviar',
    cancel: 'Cancelar',
    result: 'Resultado',
    backup: 'Backup: {path}',
    time: 'Hora',
    activityEmptyTitle: 'Nada enviado ainda',
    activityEmptyBody: 'As entregas desta sessão aparecem aqui.',
    state: {
      currency_data_missing:
        'O arquivo de dados das moedas não está na pasta de mods do jogo ou é de outra versão. Nada foi enviado.',
      selection_invalid:
        'A seleção contém uma entrada que esta área não oferece. Nada foi enviado.',
      unavailable: 'Disponível apenas em uma versão de desenvolvimento.',
      installation_not_selected: 'Selecione primeiro a instalação do jogo.',
      game_not_running: 'Abra o jogo e carregue um save.',
      bridge_missing: 'A ponte não está instalada na pasta do jogo.',
      bridge_untested: 'A ponte instalada não é uma versão testada.',
      ready: 'Pronto: jogo em execução, processo {id}.',
      busy: 'Outra entrega está em andamento.',
      backup_failed: 'Não foi possível fazer o backup; nada foi enviado.'
    },
    outcome: {
      completed: 'Concluído',
      unknown: 'Resultado desconhecido',
      failed: 'Falhou',
      refused: 'Não enviado'
    },
    outcomeHint: {
      completed: 'O jogo respondeu a todos os pedidos. Salve no jogo para manter.',
      unknown: 'O jogo não respondeu a tempo. Não envie de novo; confira no jogo.',
      failed: 'Um pedido foi recusado antes de chegar ao jogo.',
      refused: 'Nada foi enviado.'
    }
  },
  bridgePage: {
    versionApp: 'Versão do aplicativo',
    versionBridge: 'Versão da ponte instalada',
    versionNone: 'Não instalada',
    versionOld: 'Antiga, sem versão',
    versionCurrent: 'A ponte está atualizada.',
    versionOutdated: 'A ponte está desatualizada. Este aplicativo acompanha a ponte {version}.',
    detect: 'Detectar automaticamente',
    detecting: 'Procurando…',
    detectNone: 'Nenhuma instalação foi encontrada. Selecione a pasta manualmente.',
    detectSeveral: 'Mais de uma instalação foi encontrada. Selecione a que você joga.',
    installationTitle: 'Instalação do jogo',
    installationSelected: '{name} está selecionada.',
    installationNone: 'Escolha a pasta de instalação do No Man’s Sky.',
    installationInvalid: 'A pasta selecionada não é uma instalação válida do No Man’s Sky.',
    select: 'Selecionar instalação',
    verifying: 'Verificando…',
    bridgeTitle: 'Conexão com o jogo',
    bridgeHint: 'Um pequeno arquivo do Courier dentro do jogo faz o que você envia daqui.',
    diagnosticsTitle: 'Diagnóstico somente leitura',
    diagnosticsHint:
      'Conecta o host de runtime privado, que não tem comando de entrega. Mantenha esta janela aberta até fechar o jogo.',
    connect: 'Conectar runtime somente leitura',
    starting: 'Iniciando…',
    diagNotConnected: 'Nenhum runtime de diagnóstico conectado.',
    diagHostReady: 'O host de runtime está pronto, aguardando o jogo.',
    diagAuthenticated: 'Handshake concluído; aguardando o callback do jogo.',
    diagCallbackReady: 'O callback somente leitura está ativo no jogo.',
    diagFailed: 'O diagnóstico falhou ({reason}).',
    diagEnded: 'A sessão de diagnóstico terminou junto com o jogo.'
  },
  catalogPage: {
    generate: 'Ler do jogo',
    refresh: 'Ler novamente',
    generating: 'Lendo os arquivos do jogo…',
    generateHint:
      'O catálogo é lido da sua própria instalação. Nada é alterado na pasta do jogo e nenhum save é aberto.',
    imported: '{count} entradas lidas do jogo.',
    failInstallation: 'Selecione primeiro a instalação do jogo.',
    failArchives: 'Os arquivos de dados do jogo não foram encontrados na instalação selecionada.',
    failStructure:
      'O jogo foi atualizado e as tabelas mudaram. Esta versão do aplicativo ainda não consegue lê-las.',
    failUnreadable: 'Não foi possível ler os arquivos de dados do jogo.',
    unavailableTitle: 'O catálogo local não está disponível',
    unavailableBody: 'Nenhum catálogo foi gerado neste perfil do aplicativo ainda.',
    title: 'Catálogo local',
    description:
      'Definições somente leitura extraídas da instalação selecionada do jogo. Um resultado não significa que o item pode ser entregue.',
    buildBadge: 'Versão {build}',
    searchLabel: 'Pesquisar no catálogo local',
    searchPlaceholder: 'Pesquise por nome ou ID do jogo',
    all: 'Tudo',
    substance: 'Substâncias',
    product: 'Produtos',
    technology: 'Tecnologias',
    matching: '{count} definições encontradas',
    loading: 'Carregando definições…',
    languages: '{count} idiomas do jogo'
  },
  words: {
    hint: 'Linhas são palavras, colunas são idiomas. Marque o que quer aprender. Marcar uma palavra marca também as outras formas dela (abandonar, abandonado).',
    id: 'ID',
    marked: '{count} de {total} marcadas',
    word: 'Palavra',
    raceAll: 'Todas as palavras de {race} exibidas',
    race: {
      Traders: 'Gek',
      Warriors: 'Vy’keen',
      Explorers: 'Korvax',
      Atlas: 'Atlas',
      Builders: 'Autófago'
    }
  },
  upkeep: {
    repairTitle: 'Consertar tecnologias danificadas',
    repairHint:
      'O jogo conserta todas as tecnologias danificadas do inventário escolhido, como faz depois de uma queda na história. Nada é gasto.',
    repairAll: 'Consertar tudo',
    inventories: {
      exosuit: 'Exotraje',
      ship: 'Nave',
      multitool: 'Multiferramenta',
      freighter: 'Cargueiro',
      exocraft: 'Exoveículo'
    },
    rechargeTitle: 'Recarregar',
    rechargeHint:
      'O jogo recarrega toda tecnologia que não está cheia: proteção contra perigos, suporte de vida, propulsores de decolagem e as demais. Nada é gasto.',
    rechargeNow: 'Recarregar tudo agora',
    autoTitle: 'Recarregar sozinho',
    autoHint:
      'Enquanto este aplicativo estiver aberto e o jogo rodando. Nenhuma mensagem aparece no jogo.',
    autoOn: 'Ligado',
    autoEvery: 'Recarregar tudo a cada (minutos)',
    autoLow: 'Também na hora, quando uma carga cair abaixo de 20%'
  },
  pendingTech: {
    exocraft: {
      0: 'Andarilho',
      1: 'Nômade',
      2: 'Colossus',
      3: 'Peregrino',
      4: 'Libélula',
      5: 'Nautilon',
      6: 'Minotauro'
    },
    title: 'Tecnologias aguardando instalação',
    hint: 'Uma tecnologia com engrenagem no canto ainda pede componentes. Veja o que está pendente e conclua aqui: os componentes não são gastos.',
    check: 'Verificar meus inventários',
    notChecked:
      'A verificação percorre o exotraje, a multiferramenta em uso, todas as naves, o cargueiro e todos os exoveículos.',
    none: 'Nada pendente. Todas as tecnologias estão instaladas.',
    finishAll: 'Concluir todas ({count})',
    finishGroup: 'Concluir estas',
    finishOne: 'Concluir',
    confirm:
      'O jogo conclui {count} tecnologias pendentes. Os componentes que elas pedem não são gastos, e o jogo pode não mostrar mensagem.',
    blockedHint: 'Entradas de slot danificado e internas nunca são concluídas aqui.',
    truncated: 'Há mais de 256 pendentes; só as primeiras 256 aparecem.',
    groups: {
      exosuit: 'Exotraje',
      multitool: 'Multiferramenta em uso',
      ship: 'Nave {number}',
      freighter: 'Cargueiro',
      exocraft: 'Exoveículo {number}'
    },
    states: {
      waiting: 'Pendente',
      finished: 'Instalada',
      still_waiting: 'Continua pendente',
      blocked: 'Não permitida',
      unknown_id: 'Desconhecida pelo jogo'
    }
  },
  planets: {
    sourceMine: 'Meus planetas',
    mineHint:
      'Tudo o que suas buscas acharam, guardado por galáxia neste computador. Exporte a lista para compartilhar; importe uma que um amigo mandou.',
    galaxy: 'Galáxia',
    exportList: 'Exportar minha lista',
    importList: 'Importar uma lista',
    exported: '{count} planetas gravados no arquivo',
    imported: '{count} planetas novos adicionados',
    importFailed: 'Esse arquivo não é uma lista de planetas.',
    durationHint: 'minutos, até 1.440 (24 horas)',
    wealth: 'Riqueza do sistema',
    wealthNames: { Poor: 'Pobre', Average: 'Médio', Wealthy: 'Rico' },
    presetDissonant: 'Dissonante',
    flora: 'Flora',
    fauna: 'Fauna',
    life: { Dead: 'nenhuma', Low: 'escassa', Mid: 'regular', Full: 'abundante' },
    purple: 'Estrela roxa',
    purpleHint: 'Mundos aquáticos e gigantes gasosos só existem em torno de estrelas roxas.',
    portalOnly: 'Só por portal',
    portalOnlyHint:
      'Não é uma estrela do mapa da galáxia: só um portal ou o Viajar desta página chega lá.',
    sourceSurvey: 'Lista pronta (Euclid)',
    sourceLive: 'Ao meu redor (qualquer galáxia)',
    liveHint:
      'O próprio jogo percorre os sistemas ao seu redor, dos mais próximos aos mais distantes. Quanto mais tempo, mais longe ele chega. Continue jogando; a busca para se você sair do sistema.',
    duration: 'Buscar por',
    minutes: '{count} min',
    start: 'Iniciar busca',
    stop: 'Parar',
    progress: '{systems} sistemas vistos, até {distance} regiões de distância',
    liveEmpty: 'Nada encontrado ainda. Inicie uma busca ou peça menos.',
    grass: 'Cor da grama',
    liveState: {
      running: 'Buscando…',
      done: 'Busca concluída',
      stopped: 'Parada',
      travelled: 'Parada: você saiu do sistema',
      failed: 'O jogo não respondeu; nada mais foi tentado',
      not_ready: 'Nenhum sistema estelar carregado ainda'
    },
    grassHues: {
      green: 'Verde',
      teal: 'Verde-azulado',
      blue: 'Azul',
      purple: 'Roxo',
      pink: 'Rosa',
      red: 'Vermelho',
      orange: 'Laranja',
      yellow: 'Amarelo',
      pale: 'Pálido'
    },
    title: 'Encontrar um planeta',
    hint: 'Escolha como o planeta deve ser e viaje até um resultado ou copie o endereço de portal.',
    scopeTitle: 'Só a galáxia Euclid, por enquanto',
    scope:
      '{count} planetas de uma região de Euclid, calculados com as regras do próprio jogo. Alguns foram conferidos no jogo e bateram.',
    presetEarth: 'Parecido com a Terra',
    presetAll: 'Tudo',
    presetHint:
      'Parecido com a Terra: exuberante, sem tempestades, sem clima extremo, poucas sentinelas, nem infestado nem pantanoso.',
    biome: 'Bioma',
    variant: 'Variante',
    variantEarth: 'Variantes parecidas com a Terra',
    storms: 'Tempestades',
    sentinels: 'Sentinelas',
    race: 'Raça do sistema',
    raceNone: 'Desabitado',
    perSystem: 'Resultados no mesmo sistema',
    perSystemOption: 'Pelo menos {count}',
    perSystemOne: 'Um já basta',
    system: 'Sistema',
    systemLawful: 'Sem sistemas piratas',
    systemPirate: 'Só sistemas piratas',
    pirate: 'Sistema pirata',
    economy: {
      Mining: 'Mineração',
      HighTech: 'Tecnologia',
      Trading: 'Comércio',
      Manufacturing: 'Manufatura',
      Fusion: 'Materiais avançados',
      Scientific: 'Científica',
      PowerGeneration: 'Geração de energia'
    },
    extreme: 'Permitir clima extremo',
    extremeHint: 'Planetas extremos têm tempestades e perigos mais fortes.',
    extremeYes: 'clima extremo',
    any: 'Qualquer',
    search: 'Buscar por endereço de portal',
    found: '{planets} planetas em {systems} sistemas',
    inSystem: '{count} neste sistema',
    copy: 'Copiar o endereço de portal',
    copied: 'Copiado',
    save: 'Salvar na página de Teleporte',
    saved: 'Salvo',
    travel: 'Viajar',
    confirm:
      'Você sai de onde está e o jogo carrega o sistema de {planet} ({portal}), deixando você nesse planeta. Salve antes se quiser voltar a este ponto exato.',
    empty: 'Não foi possível ler o levantamento de planetas.',
    biomes: {
      Lush: 'Exuberante',
      Toxic: 'Tóxico',
      Scorched: 'Escaldante',
      Radioactive: 'Radioativo',
      Frozen: 'Congelado',
      Barren: 'Árido',
      Dead: 'Morto',
      Weird: 'Exótico',
      Swamp: 'Pântano',
      Lava: 'Vulcânico',
      Red: 'Vermelho (cromático)',
      Green: 'Verde (cromático)',
      Blue: 'Azul (cromático)',
      Waterworld: 'Mundo aquático',
      GasGiant: 'Gigante gasoso'
    },
    variants: {
      standard: 'Padrão',
      highQuality: 'Alta qualidade',
      jungle: 'Selva',
      worlds: 'Renovado (Worlds)',
      floral: 'Campos de flores',
      rocky: 'Rochoso',
      tentacles: 'Tentáculos',
      bubbles: 'Bolhas',
      giant: 'Flora gigante',
      variant: 'Outra variante',
      swamp: 'Pantanoso',
      lava: 'Variante vulcânica',
      ruins: 'Ruínas',
      infested: 'Infestado',
      shapes: 'Formas exóticas',
      remix: 'Remix',
      none: 'Sem nome'
    },
    stormLimit: {
      None: 'Sem tempestades',
      Low: 'No máximo poucas',
      High: 'No máximo muitas',
      Always: 'Qualquer'
    },
    stormLevels: { None: 'nenhuma', Low: 'poucas', High: 'muitas', Always: 'constantes' },
    sentinelLimit: {
      Low: 'Só baixo',
      Default: 'Até padrão',
      Aggressive: 'Até agressivo',
      Corrupt: 'Qualquer, até corrompido'
    },
    sentinelLevels: {
      Low: 'baixo',
      Default: 'padrão',
      Aggressive: 'agressivo',
      Corrupt: 'corrompido'
    }
  },
  missions: {
    warningTitle: 'Experimental: use um save de teste',
    warning:
      'O jogo conclui cada missão que você marcar. Ainda não se sabe se você recebe o que as etapas puladas dão. Seu save é copiado antes.',
    search: 'Buscar por quest, missão ou ID',
    untitled: 'Mostrar missões sem título no jogo',
    untitledHint:
      'Missões auxiliares que o jogo nunca nomeia no registro. Aparecem pelo identificador.',
    untitledGroup: 'Sem título no jogo',
    section: {
      story: 'História principal',
      atlas: 'Caminho do Atlas',
      secondary: 'Missões secundárias',
      guide: 'Guia e marcos',
      seasonal: 'Expedições'
    },
    part: 'Parte {number}',
    after: 'Inicia após: {quest}',
    silent: 'sem mensagem de conclusão no jogo',
    quests: '{shown} de {total} quests',
    count: '{count} missões',
    stages: '{count} etapas',
    rewards: '{count} recompensas',
    chosen: '{count} marcadas',
    action: 'Concluir todas',
    actionChosen: 'Concluir marcadas ({count})'
  },
  levels: {
    hint: {
      standings:
        'Aumente sua reputação com uma raça, guilda ou facção por níveis. O próprio jogo faz isso e mostra a mensagem dele. Nada é reduzido.',
      milestones:
        'Aumente os marcos da jornada por níveis. Só o número sobe: aumentar Palavras coletadas não ensina nenhuma palavra. Nada é reduzido.'
    },
    mode: 'Até onde',
    modeOne: '1 nível',
    modeSome: 'Vários níveis',
    modeAll: 'Até o último nível',
    modeHint: 'Contado a partir do nível em que cada um está agora.',
    messageHint: 'Cada linha diz se o jogo mostra mensagem para ela.',
    message: { full: 'mensagem completa', quick: 'mensagem curta', silent: 'sem mensagem no jogo' },
    announce: 'Mostrar a tela de marco também nas entradas silenciosas',
    announceHint:
      'O jogo só mostra a tela completa de marco em algumas entradas. Ligado: ele mostra também nas outras.',
    count: 'Níveis',
    countHint: 'Quantos níveis subir, de 1 a {max}.',
    action: 'Aumentar todos',
    actionChosen: 'Aumentar escolhidos ({count})'
  },
  glyphs: {
    hint: 'O próprio jogo entrega os glifos, com a notificação dele. Eles vêm na ordem do jogo, mostrada abaixo; não dá para escolher um.',
    order: 'Ordem dos glifos no jogo',
    all: 'Todos os dezesseis',
    allHint: 'Todos os glifos de uma vez.',
    count: 'Quantos',
    countHint: 'Os próximos glifos que você ainda não tem, de 1 a {max}.',
    action: 'Aprender glifos'
  },
  teleport: {
    hint: 'O jogo leva você até lá, como os teleportes dele fazem. Você chega na estação espacial do sistema ou no planeta do primeiro glifo.',
    galaxy: 'Galáxia',
    galaxyHint: 'Todas as galáxias do jogo, por número e nome. Digite para buscar.',
    galaxyEmpty: 'Nenhuma galáxia encontrada.',
    galaxyNumber: 'Galáxia {number}',
    address: 'Endereço de portal',
    addressHint:
      'Doze glifos, como dígitos de 0 a F: planeta, sistema e depois as três coordenadas. Clique neles ou cole o código.',
    erase: 'Apagar o último glifo',
    destination: 'Chegar em',
    destinationHint:
      'A estação espacial é a opção segura. O planeta usa o primeiro glifo do endereço.',
    toStation: 'Estação espacial do sistema',
    toPlanet: 'Planeta do endereço',
    action: 'Teleportar',
    confirmBody:
      'Você sai de onde está agora e o jogo carrega o outro sistema. Salve antes se quiser voltar exatamente a este ponto.',
    favourites: 'Destinos salvos',
    favouritesHint: 'Guardados por esta aplicação neste computador; o jogo não os vê.',
    favouriteName: 'Nome do destino',
    addFavourite: 'Salvar este endereço',
    useFavourite: 'Usar',
    removeFavourite: 'Remover',
    noFavourites: 'Nada salvo ainda.'
  },
  workshop: {
    title: 'Oficina de modelos',
    description:
      'Escolha o que quer ver e depois digite uma seed, sorteie uma ou escolha as peças e deixe o aplicativo achar uma seed que as tenha.',
    tabBuild: 'Montar',
    tabView: 'Visualizar seed',
    buildDescription:
      'Escolha o tipo, as peças, as cores e as texturas. O aplicativo procura uma seed que as tenha e mostra o resultado.',
    viewDescription: 'Escolha o tipo e digite uma seed, ou sorteie uma, para ver como ela é.',
    colorTitle: 'Cores',
    roles: {
      primary: 'Cor principal',
      secondary: 'Cor secundária',
      decal1: 'Cor de decalque 1',
      decal2: 'Cor de decalque 2'
    },
    texturesTitle: 'Texturas e decalques',
    baseTexture: { COATING: 'Revestimento', PAINTED: 'Pintado', PANELS: 'Metal' },
    seedTexturesTitle: 'Texturas e decalques desta seed',
    colorHint:
      'Cada cor que o modelo tira das paletas do jogo. Escolha uma e depois a cor para ela; Qualquer deixa para a seed.',
    seedColorsTitle: 'Cores desta seed',
    paintLabel: 'Pintura',
    undercoatLabel: 'Fundo',
    tabSystem: 'Sistema atual',
    systemDescription:
      'O sistema estelar em que você está, lido do jogo em execução: a seed dele e as naves que o jogo gerou para ele. Nada no jogo é alterado.',
    systemNone:
      'Nada para mostrar. O jogo precisa estar aberto com a ponte 1.8.0 ou mais nova e um save carregado; a lista é atualizada a cada poucos segundos.',
    systemSeed: 'Seed do sistema',
    systemShips: 'Naves deste sistema',
    systemClass: 'Classe',
    systemRole: 'Papel',
    systemShipSeed: 'Seed',
    systemView: 'Ver',
    systemRefresh: 'Atualizar',
    systemClassNumber: 'Classe {number}',
    systemStream:
      'Conferido: as seeds das naves estão no fluxo de números da seed do sistema; a primeira sai após {steps} sorteios.',
    systemStreamUnknown:
      'As seeds das naves não foram encontradas no fluxo de números da seed do sistema.',
    tabFile: 'Arquivo de modelo',
    categoryLabel: 'Categoria',
    category: { starship: 'Nave', multitool: 'Multiferramenta', freighter: 'Cargueiro' },
    kindLabel: 'Tipo',
    toolKind: {
      standard: 'Padrão',
      royal: 'Real',
      sentinel: 'Sentinela',
      sentinelB: 'Sentinela B',
      atlasSceptre: 'Cetro Atlas',
      atlas: 'Atlântida',
      staff: 'Cajado',
      staffRuin: 'Pilar de Titã',
      staffBone: 'Coroa de basilisco',
      switch: 'Rifle Neon Infinito XXII',
      retro: 'Starbound v0.27',
      swarm: 'Desintegrador de vespatroz',
      staffNpc: 'Cajado de NPC'
    },
    seedLabel: 'Seed',
    homeSeedHint:
      'Um cargueiro pega as cores do seu sistema natal. Digite a semente desse sistema, sorteie uma ou informe o endereço de portal abaixo. Vazio mostra sem cores.',
    homeAddress: 'Esta seed é o sistema de endereço de portal {glyphs} na galáxia {galaxy}.',
    glyphsLabel: 'Endereço de portal (12 glifos como 0–9, A–F)',
    galaxyLabel: 'Número da galáxia',
    useAddress: 'Usar este sistema',
    legacyColours: 'Usar cores legadas',
    legacyColoursHint:
      'O jogo tem duas formas de sortear as cores de uma seed. As multiferramentas que ele entrega usam a legada; as naves são marcadas uma a uma no save (Usar cores antigas).',
    seedOrigin:
      'O jogo sorteia esta seed no sistema de endereço de portal {glyphs} na galáxia {galaxy} (após {steps} sorteios do fluxo de números dele). É uma pista, não uma prova.',
    seedHint: 'Dezesseis dígitos hexadecimais depois de 0x. Pressione Enter ou Mostrar para ver.',
    show: 'Mostrar',
    generate: 'Gerar uma seed',
    generateWithParts: 'Gerar com estas peças',
    clearParts: 'Limpar peças',
    getInGame: 'Obter esta no jogo',
    found: 'Seed encontrada após {tries} tentativas',
    building: 'Montando o modelo…',
    empty: 'Nada para mostrar ainda',
    partsTitle: 'Peças',
    partsHint:
      'Escolha as peças que quer e deixe o resto em Qualquer. Mais listas aparecem abaixo de uma peça que tem peças próprias.',
    anyPart: 'Qualquer',
    rare: 'rara',
    detailsTitle: 'Detalhes sorteados pela seed',
    note: 'O modelo vem dos arquivos do seu próprio jogo. Formas e cores seguem a semente; a iluminação é simplificada, então fica um pouco diferente do jogo.',
    errors: {
      INSTALLATION_NOT_SELECTED: 'Selecione primeiro a pasta do jogo, em Ponte.',
      UNKNOWN_KIND: 'Este tipo não está disponível.',
      INVALID_SEED: 'A seed deve ser 0x seguido de até dezesseis dígitos hexadecimais.',
      GAME_FILES_UNREADABLE: 'Não foi possível ler os arquivos do jogo deste modelo.',
      MODEL_TOO_LARGE: 'Este modelo é grande demais para mostrar.',
      SEED_NOT_FOUND:
        'Nenhuma seed com estas peças foi encontrada a tempo. Tente de novo ou deixe uma peça livre.'
    }
  },
  preview: {
    title: 'Oficina de modelos',
    description: 'Visualize um modelo GLB local e monte suas peças visíveis.',
    stage: 'Preview experimental',
    import: 'Abrir modelo GLB',
    loading: 'Carregando modelo…',
    empty: 'Escolha um modelo local para começar',
    hint: 'Arraste para girar, use a roda para aproximar e arraste com o botão direito para mover.',
    limits:
      'Esta versão aceita GLB estático de até 64 MiB apenas com texturas PNG embutidas e sem recursos externos. A conversão dos arquivos nativos do NMS ainda não está conectada.',
    warning:
      'A seleção de peças e a cor alteram apenas este preview. Não calculam uma seed nem entregam uma nave.',
    parts: 'Peças visíveis',
    all: 'Mostrar todas',
    none: 'Ocultar todas',
    filter: 'Filtrar peças por nome',
    tint: 'Cor do preview',
    original: 'Restaurar cores do modelo',
    reset: 'Redefinir câmera',
    palettes: 'Paletas do jogo',
    paletteHelp: 'Abra o BASECOLOURPALETTES.MBIN extraído do conjunto de dados compatível.',
    importPalette: 'Abrir MBIN de paletas',
    seed: 'Seed experimental de cores',
    calculatePalette: 'Calcular amostras de cores',
    calculatedSeed: 'Seed calculada',
    family: 'Família de paleta',
    samples: 'Cinco amostras de cores',
    sample: 'Amostra de cor',
    paletteIndex: 'Cor de origem',
    colorTarget: 'Aplicar em',
    visibleTarget: 'Todas as peças visíveis',
    applyColor: 'Aplicar cor selecionada',
    paletteWarning:
      'Cálculo experimental da paleta base. As amostras RGB recolorem peças; ainda não preveem máscaras de textura, a aparência nativa da nave nem uma seed inversa.',
    INVALID_PALETTE: 'Este arquivo não corresponde ao hash da paleta base compatível.',
    INVALID_SEED: 'Digite 0x seguido de 1–16 dígitos hexadecimais.',
    PALETTE_UNAVAILABLE: 'Abra uma paleta compatível antes de calcular as cores.',
    failed: 'Não foi possível renderizar o modelo.',
    INVALID_MODEL: 'O arquivo não é um modelo válido dentro dos limites do preview.',
    UNSUPPORTED_MODEL:
      'Este modelo usa texturas, animação, extensões ou geometria fora do formato aceito.',
    FILE_UNAVAILABLE: 'Não foi possível ler o arquivo selecionado.'
  },
  appearance: {
    title: 'Receita de aparência por seed',
    open: 'Abrir receita de aparência',
    apply: 'Aplicar receita ao preview',
    help: 'Importe uma receita ou relatório de busca com vínculos explícitos das peças.',
    warning:
      'Preview candidato: apenas peças explícitas e amostras RGB. Texturas DDS, máscaras e shaders nativos não são reproduzidos.',
    mismatch:
      'O hash do modelo ou os nomes das peças não correspondem. Nenhuma alteração foi aplicada.',
    failed: 'Não foi possível ler o arquivo como uma receita de aparência compatível.',
    seed: 'Seed candidata',
    applied: 'Receita aplicada ao preview',
    candidate: 'Candidato do avaliador parcial'
  },
  controls: {
    changeLanguage: 'Alterar idioma',
    changeTheme: 'Alterar tema',
    light: 'Claro',
    dark: 'Escuro',
    system: 'Sistema'
  }
}
