import type { Messages } from '../messages'

export const ptPT: Messages = {
  app: { name: 'NMS Courier', tagline: 'Entrega local para No Man’s Sky' },
  sections: { obtain: 'Obter', upgrade: 'Melhorar' },
  corvette: {
    title: 'Corveta a partir de ficheiro',
    hint: 'Escolha um ficheiro de corveta partilhado (.nmsship). O jogo passa a abrir a construção de corvetas com essa nave já montada. Reinicie o jogo depois de escolher.',
    none: 'Ainda não foi preparado nenhum ficheiro de corveta.',
    current: 'Preparado: {name}, {count} peças.',
    parts: '{count} peças',
    hullParts: '{count} peças de casco',
    missing: 'Sem: {parts}. O jogo mostra um aviso e constrói na mesma.',
    partCockpit: 'cabina',
    partLandingGear: 'trem de aterragem',
    partHabitation: 'módulo de habitação',
    partReactor: 'reator',
    rejectedTitle: 'Este ficheiro não pode ser utilizado',
    rejectedShip:
      'Esta é uma nave comum, não uma corveta. As naves a partir de ficheiro ainda não estão disponíveis.',
    rejectedInvalid: 'Este não é um ficheiro de corveta válido.',
    installedTitle: 'Corveta preparada',
    installedBody:
      'Feche o jogo, se estiver aberto, e volte a abri-lo. Depois utilize "Iniciar construção de corveta" abaixo.',
    installFailedTitle: 'Não foi possível preparar a corveta',
    installFailed: 'Não foi possível escrever os ficheiros na pasta do jogo.',
    choose: 'Escolher ficheiro',
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
    dashboard: {
      title: 'Painel',
      summary: 'Se a entrega está disponível neste momento, e porquê.'
    },
    activity: {
      title: 'Atividade',
      summary: 'Cada pedido enviado ao jogo e o respetivo resultado.'
    },
    items: {
      title: 'Itens',
      summary: 'Substâncias e produtos colocados num inventário da gravação carregada.'
    },
    currencies: { title: 'Moedas', summary: 'Unidades, nanites e mercúrio.' },
    teleport: {
      title: 'Teletransporte',
      summary:
        'Viaje para um sistema estelar por galáxia e endereço de portal, sem precisar de um portal.'
    },
    planets: {
      title: 'Localizar planetas',
      summary: 'Encontre planetas por bioma, clima e sentinelas, com o endereço de portal.'
    },
    exosuit: {
      title: 'Exofato',
      summary: 'Classe, espaços de carga e de tecnologia e espaços sobrecarregados do exofato.'
    },
    starships: {
      title: 'Naves',
      summary: 'Classe, tamanho do inventário e espaços sobrecarregados da nave que possui.'
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
    corvettes: {
      title: 'Corvetas',
      summary: 'Uma corveta construída a partir de um projeto partilhado.'
    },
    companions: { title: 'Companheiros', summary: 'Ovos de companheiro e criaturas.' },
    technologies: {
      title: 'Tecnologias',
      summary: 'Projetos que a personagem sabe instalar.'
    },
    productRecipes: {
      title: 'Receitas de fabrico',
      summary: 'Receitas de itens fabricáveis e de tecnologia fabricável.'
    },
    buildParts: {
      title: 'Peças de construção',
      summary: 'Peças de base, de cargueiro e de decoração no menu de construção.'
    },
    refinerRecipes: {
      title: 'Refinação e culinária',
      summary: 'Receitas do refinador e do processador de nutrientes no catálogo.'
    },
    customisation: {
      title: 'Aparência',
      summary: 'Capacetes, armaduras, capas, estandartes, rastos de jetpack e gestos.'
    },
    titles: { title: 'Títulos', summary: 'Títulos de jogador para o estandarte.' },
    words: {
      title: 'Palavras',
      summary: 'Palavras das línguas Gek, Vy’keen, Korvax, Atlas e Autófago: uma, várias ou todas.'
    },
    glyphs: { title: 'Glifos de portal', summary: 'Os dezasseis glifos que abrem portais.' },
    missions: {
      title: 'Missões',
      summary:
        'Pede ao jogo para concluir missões: todas, uma missão com os seus passos ou um só passo.'
    },
    guide: {
      title: 'Guia',
      summary: 'Tópicos do guia do jogo que normalmente se abrem à medida que joga.'
    },
    nexus: {
      title: 'Anomalia Espacial',
      summary: 'Acesso à Anomalia Espacial, que a história normalmente desbloqueia.'
    },
    standings: {
      title: 'Reputação',
      summary:
        'Reputação com todas as raças, as três guildas e os foras da lei, aumentada por níveis.'
    },
    milestones: {
      title: 'Objetivos',
      summary: 'Objetivos da jornada e medalhas das fações, aumentados por níveis.'
    },
    fishing: { title: 'Registo de pesca', summary: 'O registo de captura de cada peixe.' },
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
      summary: 'Recompensas associadas a uma plataforma, a uma pré-venda ou a um evento.'
    },
    quicksilver: {
      title: 'Loja de mercúrio',
      summary: 'Itens vendidos pelo companheiro de mercúrio.'
    },
    catalog: { title: 'Catálogo do jogo', summary: 'Pesquise os itens do seu jogo instalado.' },
    models: {
      title: 'Oficina de modelos',
      summary: 'Veja como é uma seed ou encontre uma seed para as peças que quer.'
    },
    bridge: {
      title: 'Jogo e ponte',
      summary: 'Instalação, versão do jogo e a ligação ao jogo em execução.'
    },
    saves: {
      title: 'Gravações e conta',
      summary: 'Que slot de gravação está carregado e o que é partilhado por toda a conta.'
    },
    settings: { title: 'Definições', summary: 'Idioma, aparência e detalhes da aplicação.' }
  },
  status: { verified: 'Verificado', experimental: 'Em teste', planned: 'Planeado' },
  statusHint: {
    verified: 'Funcionou no jogo em execução, na versão de investigação.',
    experimental: 'Funciona em parte ou apenas em condições conhecidas.',
    planned: 'Ainda não foi construído.'
  },
  scope: {
    slot: 'Slot de gravação',
    account: 'Conta',
    both: 'Slot de gravação e conta',
    none: 'Sem alteração'
  },
  scopeHint: {
    slot: 'Altera apenas o slot de gravação carregado.',
    account: 'Altera a conta, partilhada por todos os slots de gravação.',
    both: 'Altera o slot de gravação carregado e a conta.',
    none: 'Apenas leitura; nada muda no jogo.'
  },
  rows: {
    deliverable: 'Entregues',
    blockedDamaged: 'Entradas de espaço danificado, nunca entregues',
    blockedMaintenance: 'Entradas de manutenção, nunca entregues',
    blockedTemplates: 'Modelos procedimentais, nunca entregues',
    blockedById: 'Bloqueadas por uma regra permanente',
    catalogueItems: 'Itens fabricáveis',
    craftableTechnology: 'Tecnologia fabricável',
    buildParts: 'Peças de construção',
    researchTree: 'Vendidas nos terminais de investigação',
    repeatableNever: 'Compras repetíveis, nunca desbloqueadas',
    missionBound: 'Associados a uma missão, ignorados',
    redeemedInSave: 'Registados na gravação',
    itemRewards: 'Itens para resgatar na loja',
    total: 'No jogo'
  },
  rules: {
    gameRoutines:
      'Tudo é feito pelo próprio jogo em execução. Os ficheiros de gravação nunca são editados.',
    defectiveNever: 'Entradas defeituosas e internas nunca são entregues, em nenhum modo.',
    repeatableNever:
      'Fogo de artifício, o Sinalizador Mítico e o Ovo do Vazio nunca são desbloqueados: a loja deixaria de os vender.',
    claimItems:
      'Naves, multiferramentas, ovos e pacotes são desbloqueados na conta; resgate-os na loja para receber o item.',
    keepList:
      'Os drops da Twitch só continuam resgatáveis enquanto a ponte estiver instalada. Resgate o que quiser manter.',
    backup: 'A pasta de gravações é copiada antes de cada alteração.',
    slotIdentified: 'O slot de gravação carregado é identificado antes de cada entrega.',
    accountShared:
      'As alterações na conta chegam a todos os slots de gravação e são sincronizadas pelo jogo.'
  },
  page: {
    errorTitle: 'Esta página deixou de funcionar',
    errorReload: 'Recarregar',
    availabilityTitle: 'Ainda não disponível nesta janela',
    availabilityBody:
      'Isto foi feito através da ponte de investigação. A ligação desta aplicação ao jogo ainda está em construção, pelo que nada pode ser enviado a partir daqui.',
    includes: 'O que abrange',
    includesHint: 'Números da versão de investigação.',
    rulesTitle: 'Como se comporta',
    rulesHint: 'Regras que se aplicam sempre.',
    entries: 'Entradas',
    kind: 'Tipo',
    status: 'Estado',
    scope: 'Altera',
    researchBuild: 'Versão de investigação {build}',
    plannedTitle: 'Ainda não construído',
    plannedBody: 'Esta área está planeada. Aparecerá aqui quando funcionar no jogo em execução.',
    open: 'Abrir'
  },
  dashboard: {
    connection: 'Ligação',
    heroBody:
      'Envie itens, moedas e desbloqueios para o seu próprio jogo enquanto ele corre. O jogo faz tudo sozinho; as suas gravações nunca são editadas.',
    game: 'Jogo',
    build: 'Versão do jogo',
    bridge: 'Ponte',
    catalog: 'Catálogo',
    capabilities: 'O que o Courier faz',
    capabilitiesHint: 'Cada área, o que altera e até onde foi comprovada.',
    feature: 'Área',
    area: 'Grupo',
    running: 'Em execução',
    notRunning: 'Fechado',
    notSelected: 'Nenhuma instalação selecionada',
    unknown: 'Desconhecido',
    supported: 'Compatível',
    unsupported: 'Não compatível',
    connected: 'Ligada',
    notConnected: 'Não ligada',
    available: 'Disponível',
    unavailable: 'Não gerado',
    entriesCount: '{count} entradas',
    processId: 'Processo {id}'
  },
  savesPage: {
    slotsTitle: 'Os seus slots de gravação',
    slotsHint:
      'Quando o jogo gravou cada slot pela última vez. O Courier só altera o slot que está carregado no jogo.',
    slot: 'Slot {number}',
    lastSaved: 'Gravado pela última vez em {when}',
    noSlots: 'Ainda não foi encontrada nenhuma gravação.',
    backupsTitle: 'Cópias de segurança',
    backupsHint:
      'Antes de cada alteração o Courier copia toda a sua pasta de gravações. Para voltar atrás, feche o jogo e devolva os ficheiros de uma cópia à pasta de gravações.',
    backupCount: '{count} cópias guardadas',
    noBackups: 'Ainda sem cópias. É feita uma antes da primeira alteração.',
    openFolder: 'Abrir a pasta das cópias',
    before: 'Antes de: {feature}'
  },
  setup: {
    chooseTitle: 'Escolha a pasta do jogo',
    chooseBody: "O Courier precisa de saber onde o No Man's Sky está instalado.",
    chooseButton: 'Escolher pasta',
    installTitle: 'Instalar o Courier no jogo',
    updateTitle: 'Atualizar o Courier no jogo',
    installBody:
      'Dois ficheiros pequenos são copiados para a pasta do jogo. Nada do jogo é substituído e as suas gravações não são tocadas. Depois, abra o jogo.',
    installButton: 'Instalar',
    updateButton: 'Atualizar',
    closeGameTitle: 'Feche o jogo para concluir',
    closeGameBody:
      'Os ficheiros não podem ser trocados com o jogo aberto. Feche o jogo e volte aqui.',
    foreignTitle: 'Outro mod usa o mesmo ficheiro',
    foreignBody:
      'A pasta do jogo já tem um ficheiro xinput9_1_0.dll que não é do Courier. O Courier não o vai substituir; remova esse mod primeiro para usar o Courier.',
    unavailableTitle: 'Faltam os ficheiros do Courier',
    unavailableBody:
      'Esta cópia da aplicação não traz os ficheiros que instala. Transfira a aplicação de novo.',
    openGameTitle: 'Abra o jogo e carregue uma gravação',
    openGameBody: 'O Courier liga-se sozinho assim que o jogo estiver aberto.',
    readyTitle: 'Ligado ao jogo',
    readyBody: 'Tudo pronto. Escolha o que enviar.'
  },
  settings: {
    internalNames: 'Mostrar nomes internos',
    internalNamesHint:
      'Mostra os identificadores do jogo e a resposta técnica de cada envio. Útil para comunicar um problema.',
    notifications: 'Notificações do jogo',
    notificationsHint:
      'Permite que o jogo mostre a sua própria notificação do que for entregue, quando existir. Desative para entregar em silêncio. As melhorias de inventário nunca pedem confirmação.',
    general: 'Geral',
    appearance: 'Aparência',
    about: 'Acerca',
    language: 'Idioma',
    languageHint: 'Os catorze idiomas de No Man’s Sky.',
    theme: 'Tema',
    themeHint: 'Segue o sistema por predefinição.',
    experimental: 'Software experimental',
    experimentalBody:
      'O NMS Courier é uma ferramenta não oficial em desenvolvimento. Funciona com uma versão exata do jogo de cada vez.'
  },
  delivery: {
    actionOne: 'Enviar para o jogo',
    expeditionGroup: 'Expedição {number}',
    groupNames: {
      Weapon: 'Multiferramenta',
      Suit: 'Exofato',
      AllShipsExceptAlien: 'Naves, exceto vivas',
      AllShips: 'Todas as naves',
      Mech: 'Minotauro',
      Exocraft: 'Exonave',
      Freighter: 'Cargueiro',
      Ship: 'Nave espacial',
      AlienShip: 'Nave Viva',
      RobotShip: 'Intercetor Sentinela',
      Submarine: 'Nautilon',
      AllVehicles: 'Todos os exoveículos',
      Colossus: 'Colosso',
      catalogue_item: 'Itens',
      catalogue_technology: 'Tecnologia',
      catalogue_construction: 'Menu de construção',
      research_tree: 'Investigação',
      cooking: 'Cozinhar',
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
      fighter: 'Combatente',
      hauler: 'Transportador',
      explorer: 'Explorador',
      shuttle: 'Vaivém',
      solar: 'Solar',
      exotic: 'Exótico',
      living: 'Nave Viva',
      interceptor: 'Intercetor'
    },
    toolModel: {
      pistol: 'Pistola',
      rifle: 'Espingarda',
      experimental: 'Experimental',
      alien: 'Alienígena',
      staff: 'Cajado'
    },
    equipSeedHint: 'Vazio sorteia uma semente aleatória.',
    obtainAction: 'Enviar oferta',
    obtainShipHint:
      'O jogo oferece uma nave nova deste tipo, semente e classe no seu próprio ecrã: adicione à coleção, troque pela atual ou recuse.',
    obtainToolHint:
      'O jogo oferece uma multiferramenta nova deste tipo, semente e classe no seu próprio ecrã: adicione à coleção, troque pela atual ou recuse.',
    obtainPlanned: 'Ainda não é possível obter um novo aqui.',
    equipSceneEmpty: 'Nenhum modelo encontrado.',
    freighterModel: {
      default: 'Escolhido pelo jogo',
      regular: 'Cargueiro',
      small: 'Cargueiro pequeno',
      tiny: 'Cargueiro minúsculo',
      capital: 'Cargueiro capital',
      pirate: 'Couraçado pirata'
    },
    equipScene: 'Modelo',
    equipSceneHint: 'Opcional. Deixe vazio para o jogo escolher.',
    equipModelSeed: 'Semente do modelo',
    equipLegacyColours: 'Usar cores antigas',
    equipLegacyColoursHint:
      'Dá à multiferramenta as cores antigas, como as das ferramentas que o jogo entrega. Aplicado logo depois de aceitar a oferta.',
    equipHomeSeed: 'Semente do sistema de origem',
    currencyAmountHint: 'Qualquer valor de 1 a {max}, o maior saldo que o jogo mantém.',
    itemsStack: 'Pilha de {count}',
    equipActionLabel: 'Ação',
    equipTarget: 'Nave',
    equipTargetCurrent: 'Nave atual',
    equipTargetSlot: 'Nave do espaço {number}',
    equipClass: 'Classe',
    equipSlots: 'Todos os espaços do inventário',
    equipSlotsHint: 'Torna utilizáveis todas as posições das grelhas de carga e de tecnologia.',
    equipToolSlots: 'Todos os espaços de tecnologia',
    equipToolSlotsHint:
      'Liberta todas as posições da grelha de tecnologia da multiferramenta, já na oferta.',
    equipSupercharge: 'Espaços sobrecarregados',
    equipSuperchargeHint:
      'Transforma cada espaço de tecnologia utilizável num espaço sobrecarregado.',
    equipExtended: 'Linhas adicionais de tecnologia',
    equipExtendedHint:
      'Aumenta a grelha de tecnologia para doze linhas. Requer todos os espaços do inventário.',
    currencyHint:
      'A recompensa do próprio jogo adiciona o valor e mostra a sua notificação. O saldo nunca ultrapassa o máximo do jogo.',
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
        'Pede ao jogo a sua própria recompensa de espaço. O jogo abre a janela para escolher onde fica o novo espaço.',
      grid: 'Altera o inventário que já possui, no próprio local. Nada é aberto no jogo.',
      classStep:
        'Pede ao jogo a sua própria recompensa de melhoria: um nível de classe por pedido, até S.',
      offer:
        'O jogo oferece um cargueiro com as opções abaixo. Aceite no jogo; substitui o seu cargueiro atual.',
      build: 'O jogo abre a construção de corveta com as opções abaixo.'
    },
    currencyName: { units: 'Unidades', nanites: 'Nanites', quicksilver: 'Mercúrio' },
    itemsTitle: 'Enviar itens para o jogo',
    itemsHint:
      'As substâncias e os produtos vão para a carga do exofato da gravação carregada, em pilhas do tamanho que o jogo permite. O que não couber não é enviado.',
    itemsAdd: 'Adicionar',
    itemsAmount: 'Quantidade',
    itemsRemove: 'Remover',
    itemsEmpty: 'Procure no catálogo e adicione os itens a enviar.',
    itemsAction: 'Enviar itens ({count})',
    itemsConfirm:
      'Os itens são colocados na carga do exofato da gravação carregada neste momento. Antes é feita uma cópia de segurança da pasta de gravações. A alteração é escrita na gravação quando o jogo gravar.',
    selectTitle: 'Escolha o que enviar',
    selectHint: 'Marque uma entrada, várias ou todas. Apenas as entradas escolhidas são enviadas.',
    selectSearch: 'Procurar por nome ou ID',
    selectAllShown: 'Selecionar todos os apresentados',
    selectClear: 'Limpar seleção',
    selectCount: '{count} selecionados',
    selectShowing: 'A apresentar {shown} de {total}. Utilize a pesquisa para reduzir a lista.',
    selectAction: 'Enviar selecionados ({count})',
    selectNoCatalog:
      'Os nomes aparecem depois de o catálogo ser lido do jogo (Biblioteca, Catálogo do jogo).',
    selectNone: 'Nada corresponde à pesquisa.',
    title: 'Enviar para o jogo',
    hint: 'O próprio jogo, em execução, faz isto da forma como ele mesmo entregaria.',
    action: 'Entregar tudo',
    sending: 'A enviar…',
    confirmTitle: 'Enviar isto para o jogo em execução?',
    confirmSlot:
      'Altera o slot de gravação carregado no jogo neste momento. A pasta de gravações é copiada primeiro.',
    confirmAccount:
      'Altera a sua conta, partilhada por todos os slots de gravação, e o jogo sincroniza-a. A pasta de gravações e o ficheiro de definições são copiados primeiro.',
    confirm: 'Enviar',
    cancel: 'Cancelar',
    result: 'Resultado',
    backup: 'Cópia de segurança: {path}',
    time: 'Hora',
    activityEmptyTitle: 'Ainda nada enviado',
    activityEmptyBody: 'As entregas desta sessão aparecem aqui.',
    state: {
      currency_data_missing:
        'O ficheiro de dados das moedas não está na pasta de mods do jogo ou é de outra versão. Nada foi enviado.',
      selection_invalid:
        'A seleção contém uma entrada que esta área não disponibiliza. Nada foi enviado.',
      unavailable: 'Disponível apenas numa versão de desenvolvimento.',
      installation_not_selected: 'Selecione primeiro a instalação do jogo.',
      game_not_running: 'Inicie o jogo e carregue uma gravação.',
      bridge_missing: 'A ponte não está instalada na pasta do jogo.',
      bridge_untested: 'A ponte instalada não é uma versão testada.',
      ready: 'Pronto: jogo em execução, processo {id}.',
      busy: 'Está outra entrega em curso.',
      backup_failed: 'Não foi possível fazer a cópia de segurança; nada foi enviado.'
    },
    outcome: {
      completed: 'Concluído',
      unknown: 'Resultado desconhecido',
      failed: 'Falhou',
      refused: 'Não enviado'
    },
    outcomeHint: {
      completed: 'O jogo respondeu a todos os pedidos. Grave no jogo para manter.',
      unknown: 'O jogo não respondeu a tempo. Não envie novamente; verifique no jogo.',
      failed: 'Um pedido foi recusado antes de chegar ao jogo.',
      refused: 'Nada foi enviado.'
    }
  },
  bridgePage: {
    versionApp: 'Versão da aplicação',
    versionBridge: 'Versão da ponte instalada',
    versionNone: 'Não instalada',
    versionOld: 'Antiga, sem versão',
    versionCurrent: 'A ponte está atualizada.',
    versionOutdated: 'A ponte está desatualizada. Esta aplicação inclui a ponte {version}.',
    detect: 'Detetar automaticamente',
    detecting: 'A procurar…',
    detectNone: 'Não foi encontrada nenhuma instalação. Selecione a pasta manualmente.',
    detectSeveral: 'Foi encontrada mais de uma instalação. Selecione a que utiliza para jogar.',
    installationTitle: 'Instalação do jogo',
    installationSelected: '{name} está selecionada.',
    installationNone: 'Escolha a pasta de instalação do No Man’s Sky.',
    installationInvalid: 'A pasta selecionada não é uma instalação válida do No Man’s Sky.',
    select: 'Selecionar instalação',
    verifying: 'A verificar…',
    bridgeTitle: 'Ligação ao jogo',
    bridgeHint: 'Um pequeno ficheiro do Courier dentro do jogo faz o que envia daqui.',
    diagnosticsTitle: 'Diagnóstico só de leitura',
    diagnosticsHint:
      'Liga o anfitrião de runtime privado, que não tem qualquer comando de entrega. Mantenha esta janela aberta até fechar o jogo.',
    connect: 'Ligar runtime só de leitura',
    starting: 'A iniciar…',
    diagNotConnected: 'Nenhum runtime de diagnóstico ligado.',
    diagHostReady: 'O anfitrião de runtime está pronto, a aguardar o jogo.',
    diagAuthenticated: 'Handshake concluído; a aguardar o callback do jogo.',
    diagCallbackReady: 'O callback só de leitura está ativo no jogo.',
    diagFailed: 'O diagnóstico falhou ({reason}).',
    diagEnded: 'A sessão de diagnóstico terminou com o jogo.'
  },
  catalogPage: {
    generate: 'Ler do jogo',
    refresh: 'Ler novamente',
    generating: 'A ler os ficheiros do jogo…',
    generateHint:
      'O catálogo é lido da sua própria instalação. Nada é alterado na pasta do jogo e nenhuma gravação é aberta.',
    imported: '{count} entradas lidas do jogo.',
    failInstallation: 'Selecione primeiro a instalação do jogo.',
    failArchives: 'Os ficheiros de dados do jogo não foram encontrados na instalação selecionada.',
    failStructure:
      'O jogo foi atualizado e as tabelas mudaram. Esta versão da aplicação ainda não as consegue ler.',
    failUnreadable: 'Não foi possível ler os ficheiros de dados do jogo.',
    unavailableTitle: 'O catálogo local não está disponível',
    unavailableBody: 'Ainda não foi gerado nenhum catálogo neste perfil da aplicação.',
    title: 'Catálogo local',
    description:
      'Definições só de leitura extraídas da instalação selecionada do jogo. Um resultado não significa que o item pode ser entregue.',
    buildBadge: 'Versão {build}',
    searchLabel: 'Pesquisar no catálogo local',
    searchPlaceholder: 'Pesquise por nome ou ID do jogo',
    all: 'Tudo',
    substance: 'Substâncias',
    product: 'Produtos',
    technology: 'Tecnologias',
    matching: '{count} definições encontradas',
    loading: 'A carregar definições…',
    languages: '{count} idiomas do jogo'
  },
  words: {
    hint: 'As linhas são palavras, as colunas são idiomas. Marque o que quer aprender. Marcar uma palavra marca também as outras formas dela (abandonar, abandonado).',
    id: 'ID',
    marked: '{count} de {total} marcadas',
    word: 'Palavra',
    raceAll: 'Todas as palavras de {race} apresentadas',
    race: {
      Traders: 'Gek',
      Warriors: 'Vy’keen',
      Explorers: 'Korvax',
      Atlas: 'Atlas',
      Builders: 'Autófago'
    }
  },
  pendingTech: {
    exocraft: {
      0: 'Andarilho',
      1: 'Nómada',
      2: 'Colosso',
      3: 'Peregrino',
      4: 'Dragonfly',
      5: 'Nautilon',
      6: 'Minotauro'
    },
    title: 'Tecnologias a aguardar instalação',
    hint: 'Uma tecnologia com uma engrenagem no canto ainda pede componentes. Veja o que está pendente e conclua aqui: os componentes não são gastos.',
    check: 'Verificar os meus inventários',
    notChecked:
      'A verificação percorre o exofato, a multiferramenta em uso, todas as naves, o cargueiro e todos os exoveículos.',
    none: 'Nada pendente. Todas as tecnologias estão instaladas.',
    finishAll: 'Concluir todas ({count})',
    finishGroup: 'Concluir estas',
    finishOne: 'Concluir',
    confirm:
      'O jogo conclui {count} tecnologias pendentes. Os componentes que pedem não são gastos, e o jogo pode não mostrar mensagem.',
    blockedHint: 'Entradas de slot danificado e internas nunca são concluídas aqui.',
    truncated: 'Há mais de 256 pendentes; só as primeiras 256 são mostradas.',
    groups: {
      exosuit: 'Exofato',
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
    purple: 'Estrela roxa',
    purpleHint: 'Os mundos aquáticos e os gigantes gasosos só existem em torno de estrelas roxas.',
    portalOnly: 'Só por portal',
    portalOnlyHint:
      'Não é uma estrela do mapa da galáxia: só um portal ou o Viajar desta página chega lá.',
    sourceSurvey: 'Lista pronta (Euclid)',
    sourceLive: 'À minha volta (qualquer galáxia)',
    liveHint:
      'O próprio jogo percorre os sistemas à sua volta, dos mais próximos aos mais distantes. Quanto mais tempo, mais longe chega. Continue a jogar; a procura para se sair do sistema.',
    duration: 'Procurar durante',
    minutes: '{count} min',
    start: 'Iniciar procura',
    stop: 'Parar',
    progress: '{systems} sistemas vistos, até {distance} regiões de distância',
    liveEmpty: 'Ainda nada encontrado. Inicie uma procura ou peça menos.',
    grass: 'Cor da relva',
    liveState: {
      running: 'A procurar…',
      done: 'Procura concluída',
      stopped: 'Parada',
      travelled: 'Parada: saiu do sistema',
      failed: 'O jogo não respondeu; nada mais foi tentado',
      not_ready: 'Ainda não há um sistema estelar carregado'
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
      '{count} planetas de uma região de Euclid, calculados com as regras do próprio jogo. Alguns foram verificados no jogo e coincidiram.',
    presetEarth: 'Semelhante à Terra',
    presetAll: 'Tudo',
    presetHint:
      'Semelhante à Terra: luxuriante, sem tempestades, sem clima extremo, poucas sentinelas, nem infestado nem pantanoso.',
    biome: 'Bioma',
    variant: 'Variante',
    variantEarth: 'Variantes semelhantes à Terra',
    storms: 'Tempestades',
    sentinels: 'Sentinelas',
    race: 'Raça do sistema',
    raceNone: 'Desabitado',
    perSystem: 'Resultados no mesmo sistema',
    perSystemOption: 'Pelo menos {count}',
    perSystemOne: 'Um é suficiente',
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
      PowerGeneration: 'Produção de energia'
    },
    extreme: 'Permitir clima extremo',
    extremeHint: 'Os planetas extremos têm tempestades e perigos mais fortes.',
    extremeYes: 'clima extremo',
    any: 'Qualquer',
    search: 'Procurar por endereço de portal',
    found: '{planets} planetas em {systems} sistemas',
    inSystem: '{count} neste sistema',
    copy: 'Copiar o endereço de portal',
    copied: 'Copiado',
    save: 'Guardar na página de Teletransporte',
    saved: 'Guardado',
    travel: 'Viajar',
    confirm:
      'Sai de onde está e o jogo carrega o sistema de {planet} ({portal}), deixando-o nesse planeta. Guarde antes se quiser voltar a este ponto exato.',
    empty: 'Não foi possível ler o levantamento de planetas.',
    biomes: {
      Lush: 'Luxuriante',
      Toxic: 'Tóxico',
      Scorched: 'Escaldante',
      Radioactive: 'Radioativo',
      Frozen: 'Gelado',
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
      Default: 'Até normal',
      Aggressive: 'Até agressivo',
      Corrupt: 'Qualquer, até corrompido'
    },
    sentinelLevels: {
      Low: 'baixo',
      Default: 'normal',
      Aggressive: 'agressivo',
      Corrupt: 'corrompido'
    }
  },
  missions: {
    warningTitle: 'Experimental: use um save de teste',
    warning:
      'O jogo conclui cada missão que marcar. Ainda não se sabe se recebe o que as etapas saltadas dão. A sua gravação é copiada antes.',
    search: 'Procurar por missão ou ID',
    untitled: 'Mostrar missões sem título no jogo',
    untitledHint:
      'Missões auxiliares que o jogo nunca nomeia no registo. Aparecem pelo identificador.',
    untitledGroup: 'Sem título no jogo',
    section: {
      story: 'História principal',
      atlas: 'Caminho do Atlas',
      secondary: 'Missões secundárias',
      guide: 'Guia e objetivos',
      seasonal: 'Expedições'
    },
    part: 'Parte {number}',
    after: 'Inicia após: {quest}',
    silent: 'sem mensagem de conclusão no jogo',
    quests: '{shown} de {total} missões principais',
    count: '{count} missões',
    stages: '{count} passos',
    rewards: '{count} recompensas',
    chosen: '{count} marcadas',
    action: 'Concluir todas',
    actionChosen: 'Concluir marcadas ({count})'
  },
  levels: {
    hint: {
      standings:
        'Aumente a sua reputação com uma raça, guilda ou fação por níveis. O próprio jogo fá-lo e mostra a sua mensagem. Nada é reduzido.',
      milestones:
        'Aumente os marcos da jornada por níveis. Só o número sobe: aumentar Palavras recolhidas não ensina nenhuma palavra. Nada é reduzido.'
    },
    mode: 'Até onde',
    modeOne: '1 nível',
    modeSome: 'Vários níveis',
    modeAll: 'Até ao último nível',
    modeHint: 'Contado a partir do nível em que cada um está agora.',
    messageHint: 'Cada linha diz se o jogo mostra mensagem para ela.',
    message: { full: 'mensagem completa', quick: 'mensagem curta', silent: 'sem mensagem no jogo' },
    announce: 'Mostrar o ecrã de objetivo também nas entradas silenciosas',
    announceHint:
      'O jogo só mostra o ecrã completo de marco em algumas entradas. Ligado: mostra-o também nas outras.',
    count: 'Níveis',
    countHint: 'Quantos níveis subir, de 1 a {max}.',
    action: 'Aumentar todos',
    actionChosen: 'Aumentar escolhidos ({count})'
  },
  glyphs: {
    hint: 'O próprio jogo entrega os glifos, com a sua notificação. Vêm pela ordem do jogo, mostrada abaixo; não é possível escolher um.',
    order: 'Ordem dos glifos no jogo',
    all: 'Todos os dezasseis',
    allHint: 'Todos os glifos de uma vez.',
    count: 'Quantos',
    countHint: 'Os próximos glifos que ainda não tem, de 1 a {max}.',
    action: 'Aprender glifos'
  },
  teleport: {
    hint: 'O jogo leva-o até lá, como os seus teletransportes fazem. Chega à estação espacial do sistema ou ao planeta do primeiro glifo.',
    galaxy: 'Galáxia',
    galaxyHint: 'Todas as galáxias do jogo, por número e nome. Escreva para procurar.',
    galaxyEmpty: 'Nenhuma galáxia encontrada.',
    galaxyNumber: 'Galáxia {number}',
    address: 'Endereço de portal',
    addressHint:
      'Doze glifos, como dígitos de 0 a F: planeta, sistema e depois as três coordenadas. Clique neles ou cole o código.',
    erase: 'Apagar o último glifo',
    destination: 'Chegar a',
    destinationHint:
      'A estação espacial é a opção segura. O planeta usa o primeiro glifo do endereço.',
    toStation: 'Estação espacial do sistema',
    toPlanet: 'Planeta do endereço',
    action: 'Teletransportar',
    confirmBody:
      'Sai de onde está agora e o jogo carrega o outro sistema. Guarde antes se quiser voltar exatamente a este ponto.',
    favourites: 'Destinos guardados',
    favouritesHint: 'Guardados por esta aplicação neste computador; o jogo não os vê.',
    favouriteName: 'Nome do destino',
    addFavourite: 'Guardar este endereço',
    useFavourite: 'Usar',
    removeFavourite: 'Remover',
    noFavourites: 'Ainda nada guardado.'
  },
  workshop: {
    title: 'Oficina de modelos',
    description:
      'Escolha o que quer ver e depois escreva uma seed, sorteie uma ou escolha as peças e deixe a aplicação encontrar uma seed que as tenha.',
    tabBuild: 'Montar',
    tabView: 'Ver uma seed',
    buildDescription:
      'Escolha o tipo, as peças, as cores e as texturas. A aplicação procura uma seed que as tenha e mostra o resultado.',
    viewDescription: 'Escolha o tipo e escreva uma seed, ou sorteie uma, para ver como é.',
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
    undercoatLabel: 'Subcapa',
    tabSystem: 'Sistema atual',
    systemDescription:
      'O sistema estelar em que está, lido do jogo em execução: a seed dele e as naves que o jogo gerou para ele. Nada no jogo é alterado.',
    systemNone:
      'Nada para mostrar. O jogo tem de estar aberto com a ponte 1.8.0 ou mais recente e um save carregado; a lista é atualizada de poucos em poucos segundos.',
    systemSeed: 'Seed do sistema',
    systemShips: 'Naves deste sistema',
    systemClass: 'Classe',
    systemRole: 'Função',
    systemShipSeed: 'Seed',
    systemView: 'Ver',
    systemRefresh: 'Atualizar',
    systemClassNumber: 'Classe {number}',
    systemStream:
      'Verificado: as seeds das naves estão no fluxo de números da seed do sistema; a primeira sai após {steps} sorteios.',
    systemStreamUnknown:
      'As seeds das naves não foram encontradas no fluxo de números da seed do sistema.',
    tabFile: 'Ficheiro de modelo',
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
      staff: 'Bastão',
      staffRuin: 'Pilar de Titã',
      staffBone: 'Coroa de Basilisco',
      switch: 'Néon Infinito Mark XXII',
      retro: 'Invólucro das Estrelas v0.27',
      swarm: 'Desintegrador de Vespa Nefasta',
      staffNpc: 'Cajado de NPC'
    },
    seedLabel: 'Seed',
    homeSeedHint:
      'Um cargueiro vai buscar as cores ao seu sistema natal. Escreva a semente desse sistema, sorteie uma ou indique o endereço de portal abaixo. Vazio mostra sem cores.',
    homeAddress: 'Esta seed é o sistema com o endereço de portal {glyphs} na galáxia {galaxy}.',
    glyphsLabel: 'Endereço de portal (12 glifos como 0–9, A–F)',
    galaxyLabel: 'Número da galáxia',
    useAddress: 'Usar este sistema',
    legacyColours: 'Usar cores antigas',
    legacyColoursHint:
      'O jogo tem duas formas de sortear as cores de uma seed. As multiferramentas que entrega usam a antiga; as naves são marcadas uma a uma na gravação (Usar cores antigas).',
    seedOrigin:
      'O jogo sorteia esta seed no sistema de endereço de portal {glyphs} na galáxia {galaxy} (após {steps} sorteios do respetivo fluxo de números). É uma pista, não uma prova.',
    seedHint: 'Dezasseis dígitos hexadecimais depois de 0x. Prima Enter ou Mostrar para ver.',
    show: 'Mostrar',
    generate: 'Gerar uma seed',
    generateWithParts: 'Gerar com estas peças',
    clearParts: 'Limpar peças',
    getInGame: 'Obter esta no jogo',
    found: 'Seed encontrada após {tries} tentativas',
    building: 'A montar o modelo…',
    empty: 'Ainda nada para mostrar',
    partsTitle: 'Peças',
    partsHint:
      'Escolha as peças que quer e deixe o resto em Qualquer. Aparecem mais listas por baixo de uma peça que tem peças próprias.',
    anyPart: 'Qualquer',
    rare: 'rara',
    detailsTitle: 'Detalhes sorteados pela seed',
    note: 'O modelo vem dos ficheiros do seu próprio jogo. Formas e cores seguem a semente; a iluminação é simplificada, por isso fica um pouco diferente do jogo.',
    errors: {
      INSTALLATION_NOT_SELECTED: 'Selecione primeiro a pasta do jogo, em Ponte.',
      UNKNOWN_KIND: 'Este tipo não está disponível.',
      INVALID_SEED: 'A seed deve ser 0x seguido de até dezasseis dígitos hexadecimais.',
      GAME_FILES_UNREADABLE: 'Não foi possível ler os ficheiros do jogo deste modelo.',
      MODEL_TOO_LARGE: 'Este modelo é demasiado grande para mostrar.',
      SEED_NOT_FOUND:
        'Não foi encontrada a tempo nenhuma seed com estas peças. Tente de novo ou deixe uma peça livre.'
    }
  },
  preview: {
    title: 'Oficina de modelos',
    description: 'Inspecione um modelo GLB estático local e monte as suas partes visíveis.',
    stage: 'Pré-visualização experimental',
    import: 'Abrir modelo GLB',
    loading: 'A carregar modelo…',
    empty: 'Escolha um modelo local para começar',
    hint: 'Arraste para rodar, use a roda para aproximar e arraste com o botão direito para deslocar.',
    limits:
      'Esta versão aceita ficheiros GLB estáticos até 64 MiB, apenas com texturas PNG incorporadas e sem recursos externos. A conversão nativa de recursos do NMS ainda não está ligada.',
    warning:
      'As seleções de partes e a tonalidade afetam apenas esta pré-visualização. Não calculam uma semente nem entregam uma nave.',
    parts: 'Partes visíveis',
    all: 'Mostrar tudo',
    none: 'Ocultar tudo',
    filter: 'Filtrar partes por nome',
    tint: 'Tonalidade da pré-visualização',
    original: 'Repor cores do modelo',
    reset: 'Repor câmara',
    palettes: 'Paletas do jogo',
    paletteHelp: 'Abra o BASECOLOURPALETTES.MBIN extraído do conjunto de dados suportado.',
    importPalette: 'Abrir MBIN de paletas',
    seed: 'Semente de cor experimental',
    calculatePalette: 'Calcular amostras de cor',
    calculatedSeed: 'Semente calculada',
    family: 'Família de paleta',
    samples: 'Cinco amostras de cor',
    sample: 'Amostra de cor',
    paletteIndex: 'Cor de origem',
    colorTarget: 'Aplicar a',
    visibleTarget: 'Todas as partes visíveis',
    applyColor: 'Aplicar cor selecionada',
    paletteWarning:
      'Cálculo experimental da paleta base. As amostras RGB recolorem as partes; não preveem máscaras de textura nativas, o aspeto de uma nave nem uma semente inversa.',
    INVALID_PALETTE: 'Este ficheiro não corresponde à impressão digital da paleta base suportada.',
    INVALID_SEED: 'Introduza 0x seguido de 1 a 16 dígitos hexadecimais.',
    PALETTE_UNAVAILABLE: 'Abra um ficheiro de paleta suportado antes de calcular cores.',
    failed: 'Não foi possível apresentar o modelo.',
    INVALID_MODEL: 'O ficheiro não é um modelo válido dentro dos limites da pré-visualização.',
    UNSUPPORTED_MODEL:
      'Este modelo usa texturas, animação, extensões ou geometria fora do subconjunto suportado.',
    FILE_UNAVAILABLE: 'Não foi possível ler o ficheiro selecionado.'
  },
  appearance: {
    title: 'Receita de aparência por semente',
    open: 'Abrir receita de aparência',
    apply: 'Aplicar receita à pré-visualização',
    help: 'Importe uma receita ou um relatório de pesquisa de sementes com associações de malhas explícitas.',
    warning:
      'Pré-visualização candidata: apenas partes explícitas e amostras RGB. Texturas DDS, máscaras e shaders nativos não são reproduzidos.',
    mismatch:
      'A impressão digital do modelo ou os nomes das malhas não correspondem. Não foram aplicadas alterações.',
    failed: 'Não foi possível ler o ficheiro como uma receita de aparência suportada.',
    seed: 'Semente candidata',
    applied: 'Receita aplicada à pré-visualização',
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
