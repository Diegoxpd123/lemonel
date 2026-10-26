import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { colecciones, productos } from '../data/products'
import { $, $$, bump, irA, reduce, toast } from './util'
import { add, getFav, toggleFav } from './cart'

export function initCatalogo() {
  const root = $('[data-catalogo]')
  if (!root) return
  const cards = $$('[data-card]', root)
  const chips = $$('[data-chip]', root)
  const limpiar = $('[data-limpiar]', root)!
  const limpiarTexto = $('[data-limpiar-texto]', root)!
  const vacio = $('[data-vacio]', root)!
  let cat = 'todo'
  let col = ''

  const aplicar = (animar: boolean) => {
    const favs = getFav()
    const visibles: HTMLElement[] = []
    cards.forEach((c) => {
      const okCat = cat === 'todo' || (cat === 'favoritos' ? favs.includes(c.dataset.id!) : c.dataset.cat === cat)
      const okCol = !col || (c.dataset.col ?? '').split(' ').includes(col)
      c.hidden = !(okCat && okCol)
      if (!c.hidden) visibles.push(c)
    })
    chips.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.chip === cat)))
    const nombreCol = colecciones.find((x) => x.id === col)?.nombre
    limpiar.hidden = !col
    limpiarTexto.textContent = nombreCol ? `Colección: ${nombreCol}` : ''
    vacio.hidden = visibles.length > 0 || cat !== 'favoritos'
    if (animar && !reduce()) {
      gsap.fromTo(visibles, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.04, ease: 'power3.out', overwrite: true })
    } else {
      gsap.set(visibles, { autoAlpha: 1, y: 0 })
    }
    ScrollTrigger.refresh()
  }

  const filtrar = (nuevaCat: string, nuevaCol = '') => {
    cat = nuevaCat
    col = nuevaCol
    aplicar(true)
    irA(root)
  }

  chips.forEach((b) => b.addEventListener('click', () => {
    cat = b.dataset.chip!
    aplicar(true)
  }))
  limpiar.addEventListener('click', () => {
    col = ''
    aplicar(true)
  })

  document.addEventListener('click', (e) => {
    const t = e.target as HTMLElement
    const f = t.closest('[data-filtro]') as HTMLElement | null
    if (f && f.dataset.filtro) {
      e.preventDefault()
      e.stopPropagation()
      filtrar(f.dataset.filtro)
      return
    }
    const c = t.closest('[data-coleccion]') as HTMLElement | null
    if (c && c.dataset.coleccion) {
      e.preventDefault()
      e.stopPropagation()
      filtrar('todo', c.dataset.coleccion)
      return
    }
    const v = t.closest('[data-ver-favoritos]') as HTMLElement | null
    if (v) {
      e.preventDefault()
      filtrar('favoritos')
    }
  }, true)

  document.addEventListener('click', (e) => {
    const t = e.target as HTMLElement
    const fav = t.closest('[data-fav]') as HTMLElement | null
    if (fav) {
      const id = fav.dataset.fav!
      const on = toggleFav(id)
      const p = productos.find((x) => x.id === id)
      if (on && p) toast(`${p.nombre} guardado en favoritos`)
      if (cat === 'favoritos') aplicar(false)
      return
    }
    const ad = t.closest('[data-add]') as HTMLElement | null
    if (ad) {
      const id = ad.dataset.add!
      add(id, 1)
      const p = productos.find((x) => x.id === id)
      bump($$('[data-count]'))
      if (p) toast(`${p.nombre} agregado al carrito`, { texto: 'Ver carrito', fn: () => document.dispatchEvent(new Event('abrir-carrito')) })
    }
  })
}
