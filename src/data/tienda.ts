export interface Foto {
  url: string
  sm: string
  ancho: number
  alto: number
}

export interface Variante {
  id: number
  tipo: string
  precio: number
  sku: string | null
  agotado: boolean
}

export interface Opcion {
  nombre: string
  valores: string[]
  requerida: boolean
}

export interface Producto {
  id: number
  slug: string
  nombre: string
  categoria: string
  material: string
  descripcion: string
  agotado: boolean
  destacado: boolean
  nuevo: boolean
  escogeDiseno: boolean
  precioDesde: number
  variantes: Variante[]
  opciones: Opcion[]
  fotos: Foto[]
  colecciones: string[]
}

export interface Categoria {
  id: number
  slug: string
  nombre: string
  descripcion: string
}

export interface Coleccion {
  id: number
  slug: string
  nombre: string
  descripcion: string
  foto: string | null
  productoIds: number[]
}

export interface Contacto {
  whatsapp: string
  instagram: string
  tiktok: string
  email: string
}

export interface Escala {
  desde: number
  porcentaje: number
}

export interface Envios {
  motorizadoLima: number
  shalom: number
  dias: string
  separar: number
  mesesSeparar: number
  horasCambio: number
}

export interface VideoHero {
  video: string | null
  poster: string | null
}

export interface Tienda {
  ajustes: {
    contacto: Contacto
    evento: { minimo: number; diasAnticipacion: number }
    descuentos: Escala[]
    envios: Envios
    hero: VideoHero[]
  }
  categorias: Categoria[]
  colecciones: Coleccion[]
  colores: Record<string, string>
  faqs: { pregunta: string; respuesta: string }[]
  productos: Producto[]
}

export const MONEDA = 'S/'

export const dinero = (n: number) =>
  `${MONEDA} ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const tieneVariantes = (p: Producto) => p.variantes.length > 1

export const necesitaElegir = (p: Producto) =>
  p.variantes.length > 1 || p.escogeDiseno || p.opciones.some((o) => o.valores.length > 1 || o.requerida)

export const etiquetaDe = (p: Producto): { id: 'agotado' | 'nuevo' | 'vendido'; texto: string } | null => {
  if (p.agotado) return { id: 'agotado', texto: 'Agotado' }
  if (p.nuevo) return { id: 'nuevo', texto: 'Nuevo' }
  if (p.destacado) return { id: 'vendido', texto: 'Más vendido' }
  return null
}

export const escalaPara = (escalas: Escala[], cantidad: number) => {
  let d = 0
  for (const e of [...escalas].sort((a, b) => a.desde - b.desde)) if (cantidad >= e.desde) d = e.porcentaje / 100
  return d
}

export const compactar = (t: Tienda) => ({
  ajustes: t.ajustes,
  colores: t.colores,
  colecciones: t.colecciones.map((c) => ({ id: c.id, slug: c.slug, nombre: c.nombre })),
  categorias: t.categorias.map((c) => ({ slug: c.slug, nombre: c.nombre })),
  productos: t.productos.map((p) => ({
    id: p.id,
    slug: p.slug,
    nombre: p.nombre,
    categoria: p.categoria,
    material: p.material,
    descripcion: p.descripcion,
    agotado: p.agotado,
    destacado: p.destacado,
    nuevo: p.nuevo,
    escogeDiseno: p.escogeDiseno,
    precioDesde: p.precioDesde,
    variantes: p.variantes,
    opciones: p.opciones,
    fotos: p.fotos.map((f) => ({ url: f.url, sm: f.sm, ancho: f.ancho, alto: f.alto })),
    colecciones: p.colecciones,
  })),
})

export type TiendaCliente = ReturnType<typeof compactar>

export const jsonSeguro = (valor: unknown) =>
  JSON.stringify(valor)
    .replace(/</g, '\u003c')
    .replace(/\u2028/g, '\u2028')
    .replace(/\u2029/g, '\u2029')
