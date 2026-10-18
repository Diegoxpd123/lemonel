import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { productos } from '../data/products'
import { config, descuentoPara, escalas } from '../data/config'
import { calcular, dinero, urlWhatsapp } from './cart'

const $ = <T extends HTMLElement>(s: string, root: ParentNode = document) => root.querySelector(s) as T | null
const $$ = <T extends HTMLElement>(s: string, root: ParentNode = document) => Array.from(root.querySelectorAll(s)) as T[]

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function initHeader() {
  const chrome = $('[data-chrome]')
  const head = $('[data-header]')
  const hero = $('[data-hero]')
  const burger = $('[data-burger]')
  const menu = $('[data-menu]')
  if (!head || !hero || !chrome) return

  const actualizar = () => {
    const y = window.scrollY
    head.dataset.state = y > hero.offsetHeight - 130 ? 'solid' : 'top'
    chrome.dataset.compact = String(y > 40)
  }
  actualizar()
  window.addEventListener('scroll', actualizar, { passive: true })
  window.addEventListener('resize', actualizar)

  if (!burger || !menu) return

  const setMenu = (abierto: boolean) => {
    burger.setAttribute('aria-expanded', String(abierto))
    burger.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú')
    head.dataset.menuOpen = String(abierto)
    document.body.classList.toggle('is-locked', abierto)
    if (abierto) {
      menu.hidden = false
      if (!reduce()) {
        gsap.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: 0.3 })
        gsap.fromTo(
          $$('[data-menu-link], .menu .btn, .menu__social a', menu),
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out', delay: 0.1 },
        )
      }
    } else {
      menu.hidden = true
    }
  }

  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'))
  $$('[data-menu-link]', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)))
  $$('[data-abrir-caja]', menu).forEach((b) => b.addEventListener('click', () => setMenu(false)))
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') setMenu(false)
  })
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false)
  })
}

export function initCatalogo() {
  const root = $('[data-catalogo]')
  if (!root) return
  const tiles = $$('[data-tile]', root)
  const chips = $$('[data-filter]', root)
  const clear = $('[data-clear-col]', root)!
  const colName = $('[data-col-name]', root)!
  let cat = 'todo'
  let col = ''

  const aplicar = (animar: boolean) => {
    const visibles: HTMLElement[] = []
    tiles.forEach((t) => {
      const ok = (cat === 'todo' || t.dataset.cat === cat) && (!col || (t.dataset.col ?? '').split(' ').includes(col))
      t.hidden = !ok
      if (ok) visibles.push(t)
    })
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === cat)))
    clear.hidden = !col
    if (animar && !reduce()) {
      gsap.fromTo(
        visibles,
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.05, ease: 'power3.out', overwrite: true },
      )
    } else {
      gsap.set(visibles, { autoAlpha: 1, y: 0 })
    }
    ScrollTrigger.refresh()
  }

  chips.forEach((c) =>
    c.addEventListener('click', () => {
      cat = c.dataset.filter!
      aplicar(true)
    }),
  )

  clear.addEventListener('click', () => {
    col = ''
    aplicar(true)
  })

  $$('[data-ver-col]').forEach((b) =>
    b.addEventListener('click', () => {
      col = b.dataset.verCol!
      cat = 'todo'
      colName.textContent = b.dataset.nombre ?? ''
      aplicar(true)
      root.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' })
    }),
  )
}

export function initEvento() {
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
