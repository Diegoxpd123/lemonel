import gsap from 'gsap'
import { etiquetas, productos } from '../data/products'
import { config } from '../data/config'
import { add, esFav, onFav, toggleFav } from './cart'
import { $, $$, bump, reduce, toast } from './util'

export function initProducto() {
  const modal = $('[data-prod]')
  const veil = $('[data-pveil]')
  if (!modal || !veil) return

  const imgA = $('[data-prod-img-a]', modal) as HTMLImageElement
  const imgB = $('[data-prod-img-b]', modal) as HTMLImageElement
  const cat = $('[data-prod-cat]', modal)!
  const name = $('[data-prod-name]', modal)!
  const price = $('[data-prod-price]', modal)!
  const det = $('[data-prod-det]', modal)!
  const nota = $('[data-prod-nota]', modal)!
  const cant = $('[data-prod-cant]', modal) as HTMLInputElement
  const favBtn = $('[data-prod-fav]', modal)!
  const favT = $('[data-prod-fav-t]', modal)!
  let actual = ''
  let abierto = false
  let lastFocus: HTMLElement | null = null

  const qty = () => Math.max(1, Math.min(999, Math.floor(Number(cant.value)) || 1))

  const pintarFav = () => {
    const on = esFav(actual)
    favT.textContent = on ? 'Guardado en favoritos' : 'Agregar a favoritos'
    favBtn.setAttribute('aria-pressed', String(on))
  }

  const abrir = (id: string) => {
    const p = productos.find((x) => x.id === id)
    if (!p) return
    actual = id
    lastFocus = document.activeElement as HTMLElement
    imgA.src = p.foto
    imgA.alt = p.alt
    imgB.src = p.foto2
    cat.textContent = p.etiqueta ? etiquetas[p.etiqueta] : p.categoria
    name.textContent = p.nombre
    price.textContent = `${config.moneda} ${p.precio.toFixed(2)}`
    det.textContent = p.detalle
    nota.textContent = p.nota
    cant.value = '1'
    pintarFav()
    if (abierto) return
    abierto = true
    veil.hidden = false
    modal.hidden = false
    document.body.classList.add('is-locked')
    if (!reduce()) {
      const movil = window.matchMedia('(max-width: 760px)').matches
      gsap.fromTo(veil, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
      gsap.fromTo(modal, movil ? { yPercent: 100 } : { autoAlpha: 0, y: 24, scale: 0.98 }, movil ? { yPercent: 0, duration: 0.5, ease: 'power4.out' } : { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out' })
    }
    ;($('[data-cerrar-producto]', modal) as HTMLElement).focus()
  }

  const cerrar = () => {
    if (!abierto) return
    abierto = false
    document.body.classList.remove('is-locked')
    const fin = () => {
      veil.hidden = true
      modal.hidden = true
      gsap.set(modal, { clearProps: 'all' })
      lastFocus?.focus?.()
    }
    if (reduce()) return fin()
    const movil = window.matchMedia('(max-width: 760px)').matches
    gsap.to(veil, { autoAlpha: 0, duration: 0.25 })
    gsap.to(modal, movil ? { yPercent: 100, duration: 0.35, ease: 'power3.in', onComplete: fin } : { autoAlpha: 0, y: 16, duration: 0.25, onComplete: fin })
  }

  document.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('[data-abrir-producto]') as HTMLElement | null
    if (b) abrir(b.dataset.abrirProducto!)
  })
  $$('[data-cerrar-producto]').forEach((b) => b.addEventListener('click', cerrar))
  veil.addEventListener('click', cerrar)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrar()
  })

  $('[data-prod-menos]', modal)!.addEventListener('click', () => (cant.value = String(Math.max(1, qty() - 1))))
  $('[data-prod-mas]', modal)!.addEventListener('click', () => (cant.value = String(qty() + 1)))
  cant.addEventListener('change', () => (cant.value = String(qty())))

  $('[data-prod-add]', modal)!.addEventListener('click', () => {
    const p = productos.find((x) => x.id === actual)
    add(actual, qty())
    bump($$('[data-count]'))
    cerrar()
    if (p) toast(`${p.nombre} agregado al carrito`, { texto: 'Ver carrito', fn: () => document.dispatchEvent(new Event('abrir-carrito')) })
  })

  favBtn.addEventListener('click', () => {
    toggleFav(actual)
    pintarFav()
  })
  onFav(pintarFav)
}
