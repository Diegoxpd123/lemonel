export type Kind =
  | 'corazon'
  | 'cruz'
  | 'trebol'
  | 'sol'
  | 'rosa'
  | 'perlas'
  | 'argollas'
  | 'flor'
  | 'anillos'
  | 'reloj'
  | 'oval'

export type Categoria = 'collares' | 'pulseras' | 'aretes' | 'anillos' | 'relojes'
export type Tono = 'sage' | 'blush' | 'lilac' | 'sand' | 'deep'

export interface Producto {
  id: string
  nombre: string
  categoria: Categoria
  kind: Kind
  precio: number
  tono: Tono
  colecciones?: string[]
  evento?: boolean
  nota: string
  foto: string
  alt: string
  hero?: string
}

export const categorias: { id: 'todo' | Categoria; nombre: string }[] = [
  { id: 'todo', nombre: 'Todo' },
  { id: 'collares', nombre: 'Collares' },
  { id: 'pulseras', nombre: 'Pulseras' },
  { id: 'aretes', nombre: 'Aretes' },
  { id: 'anillos', nombre: 'Anillos' },
  { id: 'relojes', nombre: 'Relojes' },
]

export const productos: Producto[] = [
  { id: 'collar-corazon', nombre: 'Collar Corazón', categoria: 'collares', kind: 'corazon', precio: 49, tono: 'blush', colecciones: ['corazon'], nota: 'Dije de nácar y cadena fina', foto: '/fotos/collar-corazon.webp', alt: 'Collar con dije de corazón de nácar sobre tela blanca' },
  { id: 'collar-corazon-oro', nombre: 'Corazón Dorado', categoria: 'collares', kind: 'corazon', precio: 58, tono: 'sand', colecciones: ['corazon'], nota: 'Corazón abombado, baño de oro', foto: '/fotos/collar-corazon-oro.webp', alt: 'Collar con corazón dorado abombado', hero: '/hero/corazon-oro.webp' },
  { id: 'collar-cruz', nombre: 'Collar Cruz', categoria: 'collares', kind: 'cruz', precio: 38, tono: 'sand', evento: true, nota: 'Ideal para misas y bautizos', foto: '/fotos/collar-cruz.webp', alt: 'Collar dorado con cruz larga sobre fondo durazno' },
  { id: 'collar-trebol', nombre: 'Collar Trébol', categoria: 'collares', kind: 'trebol', precio: 59, tono: 'sage', colecciones: ['trebol'], nota: 'Trébol de cuatro hojas', foto: '/fotos/collar-trebol.webp', alt: 'Dije de trébol negro con borde dorado', hero: '/hero/trebol.webp' },
  { id: 'collar-sol', nombre: 'Collar Sol', categoria: 'collares', kind: 'sol', precio: 55, tono: 'lilac', colecciones: ['sol'], nota: 'Inspirado en tu película favorita', foto: '/fotos/collar-sol.webp', alt: 'Collar con dije de sol sobre tela blanca', hero: '/hero/sol.webp' },
  { id: 'collar-medallon', nombre: 'Collar Medallón', categoria: 'collares', kind: 'rosa', precio: 62, tono: 'sage', colecciones: ['flor'], nota: 'Nácar, cruces y medallones', foto: '/fotos/collar-medallon.webp', alt: 'Collares dorados con cruces y medallones de nácar', hero: '/hero/medallon.webp' },
  { id: 'pulsera-perlas', nombre: 'Pulsera Perlas', categoria: 'pulseras', kind: 'perlas', precio: 45, tono: 'sand', evento: true, colecciones: ['flor', 'corazon'], nota: 'Perlas de río y cierre dorado', foto: '/fotos/pulsera-perlas.webp', alt: 'Pulsera de perlas sobre un plato blanco' },
  { id: 'set-perlas', nombre: 'Set de Perlas', categoria: 'pulseras', kind: 'perlas', precio: 78, tono: 'blush', evento: true, colecciones: ['flor'], nota: 'Tres pulseras de perlas', foto: '/fotos/set-perlas.webp', alt: 'Colección de pulseras de perlas de río' },
  { id: 'pulsera-dorada', nombre: 'Pulsera Ajustable', categoria: 'pulseras', kind: 'perlas', precio: 39, tono: 'sage', nota: 'Dorada, con perlas y cierre ajustable', foto: '/fotos/pulsera-dorada.webp', alt: 'Pulsera dorada ajustable con perlas' },
  { id: 'aretes-argolla', nombre: 'Aretes Argolla', categoria: 'aretes', kind: 'argollas', precio: 35, tono: 'deep', colecciones: ['trebol'], nota: 'Argolla trenzada, uso diario', foto: '/fotos/aretes-argolla.webp', alt: 'Aretes de argolla dorada trenzada', hero: '/hero/argollas.webp' },
  { id: 'aretes-gruesos', nombre: 'Argollas Gruesas', categoria: 'aretes', kind: 'argollas', precio: 42, tono: 'blush', nota: 'Dobles, con baño de oro', foto: '/fotos/aretes-gruesos.webp', alt: 'Aretes de argolla gruesa dorada', hero: '/hero/argollas-2.webp' },
  { id: 'aretes-flor', nombre: 'Aretes Flor', categoria: 'aretes', kind: 'flor', precio: 32, tono: 'lilac', colecciones: ['flor', 'sol'], nota: 'Flor lila, uso diario', foto: '/fotos/aretes-flor.webp', alt: 'Aretes de flor lila en la oreja' },
  { id: 'anillos-pareja', nombre: 'Anillos de Pareja', categoria: 'anillos', kind: 'anillos', precio: 69, tono: 'blush', colecciones: ['corazon'], nota: 'Dos anillos, un solo regalo', foto: '/fotos/anillos-pareja.webp', alt: 'Dos anillos dorados sobre fondo claro', hero: '/hero/anillos.webp' },
  { id: 'anillos-dorados', nombre: 'Anillos Dorados', categoria: 'anillos', kind: 'anillos', precio: 55, tono: 'sage', colecciones: ['corazon'], nota: 'Dos aros finos para combinar', foto: '/fotos/anillos-dorados.webp', alt: 'Dos anillos dorados en una cajita rosada' },
  { id: 'reloj-cuadrado', nombre: 'Reloj Cuadrado', categoria: 'relojes', kind: 'reloj', precio: 119, tono: 'sage', colecciones: ['trebol'], nota: 'Caja cuadrada, pulsera dorada', foto: '/fotos/reloj-cuadrado.webp', alt: 'Reloj dorado cuadrado sobre un tejido', hero: '/hero/reloj-cuadrado.webp' },
  { id: 'reloj-malla', nombre: 'Reloj Malla', categoria: 'relojes', kind: 'oval', precio: 129, tono: 'sand', colecciones: ['sol'], nota: 'Pulsera de malla, esfera rosada', foto: '/fotos/reloj-malla.webp', alt: 'Reloj con pulsera de malla rosada' },
]

export const colecciones = [
  {
    id: 'sol',
    nombre: 'El sol',
    frase: 'El set que parece sacado de tu película favorita.',
    tono: 'lilac' as Tono,
    foto: '/fotos/col-sol.webp',
    foto2: '/fotos/g-18.webp',
  },
  {
    id: 'trebol',
    nombre: 'El trébol',
    frase: 'La suerte también se regala. Mejor si es dorada.',
    tono: 'sage' as Tono,
    foto: '/fotos/col-trebol.webp',
    foto2: '/fotos/collar-trebol.webp',
  },
  {
    id: 'flor',
    nombre: 'La flor',
    frase: 'Detalles que no se marchitan, para decir lo que a veces no se dice.',
    tono: 'blush' as Tono,
    foto: '/fotos/col-rosa.webp',
    foto2: '/fotos/aretes-flor.webp',
  },
  {
    id: 'corazon',
    nombre: 'El corazón',
    frase: 'El regalo que toda amiga merece.',
    tono: 'sand' as Tono,
    foto: '/fotos/col-corazon.webp',
    foto2: '/fotos/collar-corazon.webp',
  },
]
