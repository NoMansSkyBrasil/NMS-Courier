import type { Messages } from '../messages'

export const ptPT: Messages = {
  app: { name: 'NMS Courier', tagline: 'Entrega local para No Man’s Sky' },
  groups: {
    overview: 'Visão geral',
    deliver: 'Entregar',
    unlock: 'Desbloquear',
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
      summary: 'Pré-visualize modelos importados e paletas de cores.'
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
  status: { verified: 'Verificado', experimental: 'Experimental', planned: 'Planeado' },
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
  settings: {
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
  controls: {
    changeLanguage: 'Alterar idioma',
    changeTheme: 'Alterar tema',
    light: 'Claro',
    dark: 'Escuro',
    system: 'Sistema'
  }
}
