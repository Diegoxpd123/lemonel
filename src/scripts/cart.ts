import { productos, type Producto } from '../data/products'
import { config, descuentoPara } from '../data/config'

export interface Linea {
  id: string
  qty: number
}

export interface LineaCalc {
  p: Producto
  qty: number
  unit: number
  total: number
  base: number
  descuento: number
}

export interface Evento {
  tipo: string
  fecha: string
}

const KEY = 'lemonel-pedido'
const FAV = 'lemonel-favoritos'
const bus = new EventTarget()

const leer = (): Linea[] => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data.filter((l) => l && productos.some((p) => p.id === l.id) && Number(l.qty) > 0)
  } catch {
    return []
  }
}

const leerFav = (): string[] => {
  try {
    const raw = localStorage.getItem(FAV)
    const data = raw ? JSON.parse(raw) : []
    return Array.isArray(data) ? data.filter((id) => productos.some((p) => p.id === id)) : []
  } catch {
    return []
  }
}

let lineas: Linea[] = leer()
let favoritos: string[] = leerFav()

const guardar = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(lineas))
  } catch {}
  bus.dispatchEvent(new Event('change'))
}

const guardarFav = () => {
  try {
    localStorage.setItem(FAV, JSON.stringify(favoritos))
  } catch {}
  bus.dispatchEvent(new Event('fav'))
}

const redondear = (n: number) => Math.round(n * 100) / 100

export const dinero = (n: number) =>
  `${config.moneda} ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const onChange = (fn: () => void) => bus.addEventListener('change', fn)
export const onFav = (fn: () => void) => bus.addEventListener('fav', fn)

export const calcular = (p: Producto, qty: number): LineaCalc => {
  const descuento = descuentoPara(qty)
  const unit = redondear(p.precio * (1 - descuento))
  return { p, qty, unit, total: redondear(unit * qty), base: p.precio * qty, descuento }
}

export const getLineas = (): LineaCalc[] =>
  lineas.flatMap((l) => {
    const p = productos.find((x) => x.id === l.id)
    return p ? [calcular(p, l.qty)] : []
  })

export const resumen = () => {
  const ls = getLineas()
  const total = redondear(ls.reduce((a, l) => a + l.total, 0))
  const base = ls.reduce((a, l) => a + l.base, 0)
  const piezas = ls.reduce((a, l) => a + l.qty, 0)
  return { lineas: ls, total, ahorro: redondear(base - total), piezas }
}

export const add = (id: string, qty = 1) => {
  const l = lineas.find((x) => x.id === id)
  if (l) l.qty += qty
  else lineas.push({ id, qty })
  guardar()
}

export const setQty = (id: string, qty: number) => {
  const n = Math.max(0, Math.min(999, Math.floor(qty) || 0))
  if (n === 0) lineas = lineas.filter((l) => l.id !== id)
  else {
    const l = lineas.find((x) => x.id === id)
    if (l) l.qty = n
  }
  guardar()
}

export const remove = (id: string) => setQty(id, 0)

export const esFav = (id: string) => favoritos.includes(id)
export const totalFav = () => favoritos.length
export const getFav = () => [...favoritos]

export const toggleFav = (id: string) => {
  favoritos = favoritos.includes(id) ? favoritos.filter((x) => x !== id) : [...favoritos, id]
  guardarFav()
  return favoritos.includes(id)
}

export const fechaLegible = (iso: string) => {
  const [y, m, d] = iso.split('-')
  return y && m && d ? `${d}/${m}/${y}` : iso
}

export const urlWhatsapp = (ls: LineaCalc[], opts: { evento?: Evento | null; nota?: string } = {}) => {
  const total = redondear(ls.reduce((a, l) => a + l.total, 0))
  const filas = ls.map((l) => {
    const desc = l.descuento ? ` (${Math.round(l.descuento * 100)}% menos por cantidad)` : ''
    return `• ${l.qty} × ${l.p.nombre} — ${dinero(l.total)}${desc}`
  })
  const partes = ['Hola Lemonel, quiero hacer este pedido:', '', ...filas, '', `Total: ${dinero(total)}`]
  if (opts.evento) {
    partes.push('', `Es para un evento: ${opts.evento.tipo}${opts.evento.fecha ? `, el ${fechaLegible(opts.evento.fecha)}` : ''}`)
  }
  if (opts.nota && opts.nota.trim()) partes.push('', `Nota: ${opts.nota.trim()}`)
  partes.push('', '¿Me confirman disponibilidad y envío?')
  return `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(partes.join('\n'))}`
}
