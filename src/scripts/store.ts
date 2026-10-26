import { dinero, escalaPara, type Producto, type Variante } from '../data/tienda'
import type { TiendaCliente } from '../data/tienda'

const leer = (): TiendaCliente => {
  const el = document.getElementById('lemonel-data')
  try {
    return JSON.parse(el?.textContent ?? '{}') as TiendaCliente
  } catch {
    return { ajustes: {} as TiendaCliente['ajustes'], colores: {}, colecciones: [], categorias: [], productos: [] }
  }
}

export const tienda = leer()
export const productos = tienda.productos as unknown as Producto[]
export const ajustes = tienda.ajustes
export const colores = tienda.colores
export const colecciones = tienda.colecciones

export const porId = (id: number | string) => productos.find((p) => p.id === Number(id))

export const descuentoPara = (cantidad: number) => escalaPara(ajustes.descuentos ?? [], cantidad)

export const escalas = () => [...(ajustes.descuentos ?? [])].sort((a, b) => a.desde - b.desde)

export const whatsapp = () => ajustes.contacto?.whatsapp ?? ''

export const precioDe = (p: Producto, vi: number): number => (p.variantes[vi] as Variante | undefined)?.precio ?? p.precioDesde

export { dinero }
