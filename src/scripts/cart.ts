import { dinero, disponibles, type Producto, type Variante } from '../data/tienda'
import { descuentoPara, porId, productos, whatsapp } from './store'

export interface Linea {
  id: number
  vi: number
  op: Record<string, string>
  dis: string
  qty: number
}

export interface LineaCalc {
  key: string
  l: Linea
  p: Producto
  v: Variante
  qty: number
  unit: number
  total: number
  base: number
  descuento: number
  detalle: string[]
}

export interface Evento {
  tipo: string
  fecha: string
}

const KEY = 'lemonel-pedido-v2'
const FAV = 'lemonel-favoritos-v2'
const bus = new EventTarget()

export const claveDe = (l: Pick<Linea, 'id' | 'vi' | 'op' | 'dis'>) =>
  `${l.id}|${l.vi}|${Object.entries(l.op)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join(';')}|${l.dis.trim().toLowerCase()}`

const valida = (l: Linea) => {
  const p = porId(l.id)
  if (!p || p.agotado || !p.variantes[l.vi] || p.variantes[l.vi]!.agotado || !(Number(l.qty) > 0)) return false
  return Object.entries(l.op ?? {}).every(([k, v]) => p.opciones.some((o) => o.nombre === k && disponibles(o).includes(v)))
}

const leer = (): Linea[] => {
  try {
    const raw = localStorage.getItem(KEY)
    const data = raw ? JSON.parse(raw) : []
    if (!Array.isArray(data)) return []
    return data.filter((l) => l && typeof l.id === 'number' && valida({ dis: '', op: {}, vi: 0, ...l }) ).map((l) => ({ dis: '', op: {}, vi: 0, ...l }) as Linea)
  } catch {
    return []
  }
}

const leerFav = (): number[] => {
  try {
    const raw = localStorage.getItem(FAV)
    const data = raw ? JSON.parse(raw) : []
    return Array.isArray(data) ? data.filter((id) => typeof id === 'number' && productos.some((p) => p.id === id)) : []
  } catch {
    return []
  }
}

let lineas: Linea[] = leer()
let favoritos: number[] = leerFav()

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

export { dinero }

export const onChange = (fn: () => void) => bus.addEventListener('change', fn)
export const onFav = (fn: () => void) => bus.addEventListener('fav', fn)

export const calcular = (p: Producto, vi: number, qty: number, qtyGrupo = qty) => {
  const v = p.variantes[vi] ?? p.variantes[0]!
  const descuento = descuentoPara(qtyGrupo)
  const unit = redondear(v.precio * (1 - descuento))
  return { v, qty, unit, total: redondear(unit * qty), base: redondear(v.precio * qty), descuento }
}

const detalleDe = (p: Producto, l: Linea): string[] => {
  const partes: string[] = []
  if (p.variantes.length > 1) partes.push(p.variantes[l.vi]?.tipo ?? '')
  for (const o of p.opciones) if (l.op[o.nombre]) partes.push(`${o.nombre}: ${l.op[o.nombre]}`)
  if (l.dis.trim()) partes.push(`Diseño: ${l.dis.trim()}`)
  return partes.filter(Boolean)
}

export const getLineas = (): LineaCalc[] => {
  const grupos = new Map<string, number>()
  for (const l of lineas) grupos.set(`${l.id}|${l.vi}`, (grupos.get(`${l.id}|${l.vi}`) ?? 0) + l.qty)
  return lineas.flatMap((l) => {
    const p = porId(l.id)
    if (!p) return []
    const c = calcular(p, l.vi, l.qty, grupos.get(`${l.id}|${l.vi}`) ?? l.qty)
    return [{ key: claveDe(l), l, p, v: c.v, qty: l.qty, unit: c.unit, total: c.total, base: c.base, descuento: c.descuento, detalle: detalleDe(p, l) }]
  })
}

export const resumen = () => {
  const ls = getLineas()
  const total = redondear(ls.reduce((a, l) => a + l.total, 0))
  const base = redondear(ls.reduce((a, l) => a + l.base, 0))
  const piezas = ls.reduce((a, l) => a + l.qty, 0)
  return { lineas: ls, total, ahorro: redondear(base - total), piezas }
}

export const add = (nueva: Omit<Linea, 'qty'>, qty = 1) => {
  const k = claveDe(nueva)
  const l = lineas.find((x) => claveDe(x) === k)
  if (l) l.qty = Math.min(999, l.qty + qty)
  else lineas.push({ ...nueva, dis: nueva.dis.trim(), qty })
  guardar()
}

export const setQty = (key: string, qty: number) => {
  const n = Math.max(0, Math.min(999, Math.floor(qty) || 0))
  if (n === 0) lineas = lineas.filter((l) => claveDe(l) !== key)
  else {
    const l = lineas.find((x) => claveDe(x) === key)
    if (l) l.qty = n
  }
  guardar()
}

export const remove = (key: string) => setQty(key, 0)

export const esFav = (id: number) => favoritos.includes(id)
export const totalFav = () => favoritos.length
export const getFav = () => [...favoritos]

export const toggleFav = (id: number) => {
  favoritos = favoritos.includes(id) ? favoritos.filter((x) => x !== id) : [...favoritos, id]
  guardarFav()
  return favoritos.includes(id)
}

export const opcionesPorDefecto = (p: Producto) => {
  const op: Record<string, string> = {}
  for (const o of p.opciones) {
    const libres = disponibles(o)
    if (!o.requerida && libres.length) op[o.nombre] = libres[0]!
  }
  return op
}

export const fechaLegible = (iso: string) => {
  const [y, m, d] = iso.split('-')
  return y && m && d ? `${d}/${m}/${y}` : iso
}

export const urlWhatsapp = (ls: LineaCalc[], opts: { evento?: Evento | null; nota?: string; pedido?: { codigo: string; url: string } | null } = {}) => {
  const total = redondear(ls.reduce((a, l) => a + l.total, 0))
  const filas = ls.map((l) => {
    const desc = l.descuento ? ` (${Math.round(l.descuento * 100)}% menos por cantidad)` : ''
    const cod = l.v.sku ? ` [cód. ${l.v.sku}]` : ''
    const det = l.detalle.length ? `\n   ${l.detalle.join(' · ')}` : ''
    return `• ${l.qty} × ${l.p.nombre}${cod} — ${dinero(l.total)}${desc}${det}`
  })
  const partes = ['Hola Lemonel, quiero hacer este pedido:', '', ...filas, '', `Total: ${dinero(total)}`]
  if (opts.evento) {
    partes.push('', `Es para un evento: ${opts.evento.tipo}${opts.evento.fecha ? `, el ${fechaLegible(opts.evento.fecha)}` : ''}`)
  }
  if (opts.nota && opts.nota.trim()) partes.push('', `Nota: ${opts.nota.trim()}`)
  if (opts.pedido) partes.push('', `Pedido N° ${opts.pedido.codigo}`, `Sigue tu pedido aquí: ${opts.pedido.url}`)
  partes.push('', '¿Me confirman disponibilidad y envío?')
  return `https://wa.me/${whatsapp()}?text=${encodeURIComponent(partes.join('\n'))}`
}

export const urlConsulta = (texto: string) => `https://wa.me/${whatsapp()}?text=${encodeURIComponent(texto)}`

