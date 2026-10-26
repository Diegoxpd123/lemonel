import { productos } from '../data/products'
import { config, descuentoPara, escalas } from '../data/config'
import { calcular, dinero, urlWhatsapp } from './cart'
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

  const min = new Date()
  min.setDate(min.getDate() + config.diasAnticipacion)
  fecha.min = min.toISOString().slice(0, 10)

  const qty = () => Math.max(1, Math.min(999, Math.floor(Number(cant.value)) || 1))

  const pintar = () => {
    const p = productos.find((x) => x.id === pieza.value)!
    const n = qty()
    const l = calcular(p, n)
    unit.textContent = dinero(l.unit)
    old.textContent = l.descuento ? dinero(p.precio) : ''
    old.hidden = !l.descuento
    total.textContent = dinero(l.total)
    const ahorro = l.base - l.total
    save.textContent = ahorro > 0 ? `Ahorras ${dinero(Math.round(ahorro * 100) / 100)}` : `Desde ${escalas[0].desde} piezas tienes descuento`
    presets.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.calcPreset) === n)))
    const activo = descuentoPara(n)
    filas.forEach((f) => {
      const e = escalas.find((x) => x.desde === Number(f.dataset.tier))
      f.dataset.active = String(!!e && e.descuento === activo && activo > 0)
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
      err.textContent = `Necesitamos al menos ${config.diasAnticipacion} días de anticipación. Escríbenos y vemos si llegamos.`
      err.hidden = false
      fecha.focus()
      return
    }
    const p = productos.find((x) => x.id === pieza.value)!
    const url = urlWhatsapp([calcular(p, qty())], { evento: { tipo: tipo.value, fecha: fecha.value }, nota: nota.value })
    window.open(url, '_blank', 'noopener')
  })

  pintar()
}
