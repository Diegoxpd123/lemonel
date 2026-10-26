import { ajustes, escalas, descuentoPara, porId } from './store'
import { calcular, dinero, opcionesPorDefecto, urlWhatsapp, type LineaCalc } from './cart'
import { $, $$ } from './util'

export function initEventos() {
  const form = $('[data-calc]') as HTMLFormElement | null
  if (!form) return
  const pieza = $('[data-calc-pieza]', form) as HTMLSelectElement
  const cant = $('[data-calc-cant]', form) as HTMLInputElement
  const unit = $('[data-calc-unit]', form)!
  const old = $('[data-calc-old]', form)!
  const total = $('[data-calc-total]', form)!
  const save = $('[data-calc-save]', form)!
  const tipo = $('[data-calc-tipo]', form) as HTMLSelectElement
  const fecha = $('[data-calc-fecha]', form) as HTMLInputElement
  const nota = $('[data-calc-nota]', form) as HTMLInputElement
  const err = $('[data-calc-error]', form)!
  const presets = $$('[data-calc-preset]', form)
  const filas = $$('[data-tier]')
  const dias = ajustes.evento?.diasAnticipacion ?? 7
  const lista = escalas()

  const min = new Date()
  min.setDate(min.getDate() + dias)
  fecha.min = min.toISOString().slice(0, 10)

  const qty = () => Math.max(1, Math.min(999, Math.floor(Number(cant.value)) || 1))

  const elegida = () => {
    const [id, vi] = pieza.value.split(':').map(Number)
    const p = porId(id!)!
    return { p, vi: vi ?? 0 }
  }

  const pintar = () => {
    const { p, vi } = elegida()
    const n = qty()
    const l = calcular(p, vi, n)
    unit.textContent = dinero(l.unit)
    old.textContent = l.descuento ? dinero(l.v.precio) : ''
    old.hidden = !l.descuento
    total.textContent = dinero(l.total)
    const ahorro = l.base - l.total
    save.textContent = ahorro > 0 ? `Ahorras ${dinero(Math.round(ahorro * 100) / 100)}` : lista[0] ? `Desde ${lista[0].desde} piezas tienes descuento` : ''
    presets.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.calcPreset) === n)))
    const activo = descuentoPara(n)
    filas.forEach((f) => {
      const e = lista.find((x) => x.desde === Number(f.dataset.tier))
      f.dataset.active = String(!!e && e.porcentaje / 100 === activo && activo > 0)
    })
  }

  $('[data-calc-menos]', form)!.addEventListener('click', () => {
    cant.value = String(Math.max(1, qty() - 1))
    pintar()
  })
  $('[data-calc-mas]', form)!.addEventListener('click', () => {
    cant.value = String(qty() + 1)
    pintar()
  })
  presets.forEach((b) =>
    b.addEventListener('click', () => {
      cant.value = b.dataset.calcPreset!
      pintar()
    }),
  )
  pieza.addEventListener('change', pintar)
  cant.addEventListener('input', pintar)
  cant.addEventListener('change', () => {
    cant.value = String(qty())
    pintar()
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    err.hidden = true
    if (!fecha.value) {
      err.textContent = 'Elige la fecha de tu evento para poder reservarte.'
      err.hidden = false
      fecha.focus()
      return
    }
    if (fecha.value < fecha.min) {
      err.textContent = `Necesitamos al menos ${dias} días de anticipación. Escríbenos y vemos si llegamos.`
      err.hidden = false
      fecha.focus()
      return
    }
    const { p, vi } = elegida()
    const n = qty()
    const c = calcular(p, vi, n)
    const op = opcionesPorDefecto(p)
    const detalle = [p.variantes.length > 1 ? c.v.tipo : '', ...Object.entries(op).map(([k, v]) => `${k}: ${v}`)].filter(Boolean)
    const linea: LineaCalc = { key: `evento-${p.id}-${vi}`, l: { id: p.id, vi, op, dis: '', qty: n }, p, v: c.v, qty: n, unit: c.unit, total: c.total, base: c.base, descuento: c.descuento, detalle }
    window.open(urlWhatsapp([linea], { evento: { tipo: tipo.value, fecha: fecha.value }, nota: nota.value }), '_blank', 'noopener')
  })

  pintar()
}
