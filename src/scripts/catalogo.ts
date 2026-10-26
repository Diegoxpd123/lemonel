import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { colecciones, porId } from './store'
import { $, $$, bump, irA, reduce, toast } from './util'
import { add, getFav, opcionesPorDefecto, toggleFav } from './cart'
import { necesitaElegir } from '../data/tienda'

const PAGINA = 24

export function initCatalogo() {
  const root = $('[data-catalogo]')
  if (!root) return
  const cards = $$('[data-card]', root)
  const chips = $$('[data-chip]', root)
  const limpiar = $('[data-limpiar]', root)!
  const limpiarTexto = $('[data-limpiar-texto]', root)!
  const vacio = $('[data-vacio]', root)!
  const mas = $('[data-mas]', root) as HTMLButtonElement
  const contador = $('[data-contador]', root)!
  let cat = 'todo'
  let col = ''
  let limite = PAGINA

  const aplicar = (animar: boolean, nuevos = false) => {
    const favs = getFav()
    const coinciden = cards.filter((c) => {
      const okCat = cat === 'todo' || (cat === 'favoritos' ? favs.includes(Number(c.dataset.id)) : c.dataset.cat === cat)
      const okCol = !col || (c.dataset.col ?? '').split(' ').includes(col)
      return okCat && okCol
    })
    const visibles = coinciden.slice(0, limite)
    const antes = new Set(cards.filter((c) => !c.hidden))
    cards.forEach((c) => (c.hidden = !visibles.includes(c)))
    chips.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.chip === cat)))
    const nombreCol = colecciones.find((x) => x.slug === col)?.nombre
    limpiar.hidden = !col
    limpiarTexto.textContent = nombreCol ? `Colección: ${nombreCol}` : ''
    vacio.hidden = coinciden.length > 0 || cat !== 'favoritos'
    contador.textContent = coinciden.length ? `Mostrando ${visibles.length} de ${coinciden.length} joyas` : ''
    mas.hidden = coinciden.length <= visibles.length
    const aAnimar = nuevos ? visibles.filter((c) => !antes.has(c)) : visibles
    if (animar && !reduce()) {
      gsap.fromTo(aAnimar, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.035, ease: 'power3.out', overwrite: true })
    } else {
      gsap.set(visibles, { autoAlpha: 1, y: 0 })
    }
    ScrollTrigger.refresh()
  }

  const filtrar = (nuevaCat: string, nuevaCol = '') => {
    cat = nuevaCat
    col = nuevaCol
    limite = PAGINA
    aplicar(true)
    irA(root)
  }

  chips.forEach((b) =>
    b.addEventListener('click', () => {
      cat = b.dataset.chip!
      limite = PAGINA
      aplicar(true)
    }),
  )
  limpiar.addEventListener('click', () => {
    col = ''
    limite = PAGINA
    aplicar(true)
  })
  mas.addEventListener('click', () => {
    limite += PAGINA
    aplicar(true, true)
  })

  document.addEventListener(
    'click',
    (e) => {
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
    },
    true,
  )

  document.addEventListener('click', (e) => {
    const t = e.target as HTMLElement
    const fav = t.closest('[data-fav]') as HTMLElement | null
    if (fav) {
      const id = Number(fav.dataset.fav)
      const on = toggleFav(id)
      const p = porId(id)
      if (on && p) toast(`${p.nombre} guardado en favoritos`)
      if (cat === 'favoritos') aplicar(false)
      return
    }
    const ad = t.closest('[data-add]') as HTMLElement | null
    if (ad) {
      const p = porId(ad.dataset.add!)
      if (!p) return
      if (necesitaElegir(p)) {
        document.dispatchEvent(new CustomEvent('abrir-producto', { detail: p.id }))
        return
      }
      add({ id: p.id, vi: 0, op: opcionesPorDefecto(p), dis: '' }, 1)
      bump($$('[data-count]'))
      toast(`${p.nombre} agregado al carrito`, { texto: 'Ver carrito', fn: () => document.dispatchEvent(new Event('abrir-carrito')) })
    }
  })

  aplicar(false)
}
