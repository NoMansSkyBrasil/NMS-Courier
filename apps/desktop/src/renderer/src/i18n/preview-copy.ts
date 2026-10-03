export const previewCopy = {
  'en-US': {
    title: 'Model workshop',
    description: 'Inspect a local static GLB model and assemble its visible parts.',
    stage: 'Experimental preview',
    import: 'Open GLB model',
    loading: 'Loading model…',
    empty: 'Choose a local model to begin',
    hint: 'Drag to rotate, scroll to zoom, and right-drag to pan.',
    limits:
      'This version accepts static GLB files up to 16 MiB without textures or external resources. Native NMS asset conversion is not connected yet.',
    warning:
      'Part selections and tint affect this preview only. They do not calculate a seed or deliver a ship.',
    parts: 'Visible parts',
    all: 'Show all',
    none: 'Hide all',
    filter: 'Filter parts by name',
    tint: 'Preview tint',
    original: 'Restore model colors',
    reset: 'Reset camera',
    failed: 'The model could not be rendered.',
    INVALID_MODEL: 'The file is not a valid model within the preview limits.',
    UNSUPPORTED_MODEL:
      'This model uses textures, animation, extensions, or geometry outside the supported subset.',
    FILE_UNAVAILABLE: 'The selected file could not be read.'
  },
  'pt-BR': {
    title: 'Oficina de modelos',
    description: 'Visualize um modelo GLB local e monte suas peças visíveis.',
    stage: 'Preview experimental',
    import: 'Abrir modelo GLB',
    loading: 'Carregando modelo…',
    empty: 'Escolha um modelo local para começar',
    hint: 'Arraste para girar, use a roda para aproximar e arraste com o botão direito para mover.',
    limits:
      'Esta versão aceita GLB estático de até 16 MiB sem texturas ou recursos externos. A conversão dos arquivos nativos do NMS ainda não está conectada.',
    warning:
      'A seleção de peças e a cor alteram apenas este preview. Não calculam uma seed nem entregam uma nave.',
    parts: 'Peças visíveis',
    all: 'Mostrar todas',
    none: 'Ocultar todas',
    filter: 'Filtrar peças por nome',
    tint: 'Cor do preview',
    original: 'Restaurar cores do modelo',
    reset: 'Redefinir câmera',
    failed: 'Não foi possível renderizar o modelo.',
    INVALID_MODEL: 'O arquivo não é um modelo válido dentro dos limites do preview.',
    UNSUPPORTED_MODEL:
      'Este modelo usa texturas, animação, extensões ou geometria fora do formato aceito.',
    FILE_UNAVAILABLE: 'Não foi possível ler o arquivo selecionado.'
  },
  'es-ES': {
    title: 'Taller de modelos',
    description: 'Visualiza un modelo GLB local y configura sus piezas visibles.',
    stage: 'Vista experimental',
    import: 'Abrir modelo GLB',
    loading: 'Cargando modelo…',
    empty: 'Elige un modelo local para empezar',
    hint: 'Arrastra para girar, usa la rueda para acercar y el botón derecho para desplazar.',
    limits:
      'Esta versión admite GLB estático de hasta 16 MiB sin texturas ni recursos externos. La conversión de archivos nativos de NMS aún no está conectada.',
    warning:
      'Las piezas y el color solo cambian esta vista. No calculan una seed ni entregan una nave.',
    parts: 'Piezas visibles',
    all: 'Mostrar todas',
    none: 'Ocultar todas',
    filter: 'Filtrar piezas por nombre',
    tint: 'Color de la vista',
    original: 'Restaurar colores del modelo',
    reset: 'Restablecer cámara',
    failed: 'No se pudo renderizar el modelo.',
    INVALID_MODEL: 'El archivo no es un modelo válido dentro de los límites de la vista.',
    UNSUPPORTED_MODEL: 'Este modelo usa texturas, animación, extensiones o geometría no admitidas.',
    FILE_UNAVAILABLE: 'No se pudo leer el archivo seleccionado.'
  }
}
