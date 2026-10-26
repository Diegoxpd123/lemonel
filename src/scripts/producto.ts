import gsap from 'gsap'
import { dinero, etiquetaDe, type Producto } from '../data/tienda'
import { add, esFav, onFav, toggleFav, urlConsulta } from './cart'
import { colores, productos, tienda } from './store'
import { $, $$, bump, reduce, toast } from './util'

const LETRAS_MIN = 18

export function initProducto() {
  const modal = $('[data-prod]')
  const veil = $('[data-pveil]')
  if (!modal || !veil) return

  const img = $('[data-prod-img]', modal) as HTMLImageElement
  const thumbs = $('[data-prod-thumbs]', modal)!
  const cat = $('[data-prod-cat]', modal)!
  const name = $('[data-prod-name]', modal)!
  const price = $('[data-prod-price]', modal)!
  const mat = $('[data-prod-mat]', modal)!
  const det = $('[data-prod-det]', modal)!
  const opts = $('[data-prod-opts]', modal)!
  const disenoBox = $('[data-prod-diseno]', modal)!
  const diseno = $('[data-prod-diseno-txt]', modal) as HTMLTextAreaElement
  const qtyBox = $('[data-prod-qty]', modal)!
  const cant = $('[data-prod-cant]', modal) as HTMLInputElement
  const error = $('[data-prod-error]', modal)!
  const addBtn = $('[data-prod-add]', modal) as HTMLButtonElement
  const addTxt = $('[data-prod-add-t]', modal)!
  const consulta = $('[data-prod-consulta]', modal) as HTMLAnchorElement
  const favBtn = $('[data-prod-fav]', modal)!
  const favT = $('[data-prod-fav-t]', modal)!

  let actual: Producto | null = null
  let vi = 0
  let op: Record<string, string> = {}
  let abierto = false
  let lastFocus: HTMLElement | null = null

  const qty = () => Math.max(1, Math.min(999, Math.floor(Number(cant.value)) || 1))
  const nombreCategoria = (p: Producto) => tienda.categorias.find((c) => c.slug === p.categoria)?.nombre ?? p.categoria

  const pintarFav = () => {
    if (!actual) return
    const on = esFav(actual.id)
    favT.textContent = on ? 'Guardado en favoritos' : 'Agregar a favoritos'
    favBtn.setAttribute('aria-pressed', String(on))
  }

  const pintarFotos = (p: Producto, i: number) => {
    const f = p.fotos[i]
    if (!f) {
      img.removeAttribute('src')
      return
    }
    img.src = f.url
    img.alt = p.nombre
    $$('.prod__thumb', thumbs).forEach((b, k) => b.setAttribute('aria-current', String(k === i)))
  }

  const crearThumbs = (p: Producto) => {
    thumbs.innerHTML = ''
    if (p.fotos.length < 2) return
    p.fotos.forEach((f, i) => {
      const li = document.createElement('li')
      const b = document.createElement('button')
      b.type = 'button'
      b.className = 'prod__thumb'
      b.setAttribute('aria-label', `Ver foto ${i + 1}`)
      b.innerHTML = `<img src="${f.sm}" alt="" width="60" height="74" loading="lazy" />`
      b.addEventListener('click', () => pintarFotos(p, i))
      li.appendChild(b)
      thumbs.appendChild(li)
    })
  }

  const estaAgotado = () => !!actual && (actual.agotado || !!actual.variantes[vi]?.agotado)

  const pintarPrecio = () => {
    if (!actual) return
    const v = actual.variantes[vi]
    price.textContent = v ? dinero(v.precio) : dinero(actual.precioDesde)
    const agot = estaAgotado()
    addBtn.hidden = agot
    qtyBox.hidden = agot
    consulta.hidden = !agot
    if (agot) {
      const detalle = actual.variantes.length > 1 && v ? ` (${v.tipo})` : ''
      consulta.href = urlConsulta(`Hola Lemonel, ¿cuándo vuelve a estar disponible "${actual.nombre}"${detalle}?`)
    }
  }

  const chip = (texto: string, extra = '', color = '') => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'opt__chip'
    b.setAttribute('aria-pressed', 'false')
    if (color) {
      const d = document.createElement('i')
      d.className = 'opt__dot'
      d.style.background = color
      b.appendChild(d)
    }
    const s = document.createElement('span')
    s.textContent = texto
    b.appendChild(s)
    if (extra) {
      const sm = document.createElement('small')
      sm.textContent = extra
      b.appendChild(sm)
    }
    return b
  }

  const crearOpciones = (p: Producto) => {
    opts.innerHTML = ''
    if (p.variantes.length > 1) {
      const fs = document.createElement('fieldset')
      fs.className = 'opt'
      fs.innerHTML = '<legend>Elige <b>tu pieza</b></legend><div class="opt__chips"></div>'
      const cont = fs.querySelector('.opt__chips')!
      const botones = p.variantes.map((v, i) => {
        const b = chip(v.tipo, dinero(v.precio))
        b.disabled = v.agotado
        b.addEventListener('click', () => {
          vi = i
          botones.forEach((x, k) => x.setAttribute('aria-pressed', String(k === i)))
          pintarPrecio()
        })
        cont.appendChild(b)
        return b
      })
      const primera = Math.max(0, p.variantes.findIndex((v) => !v.agotado))
      vi = primera
      botones[primera]?.setAttribute('aria-pressed', 'true')
      opts.appendChild(fs)
    } else {
      vi = 0
    }

    p.opciones.forEach((o) => {
      if (!o.valores.length) return
      const fs = document.createElement('fieldset')
      fs.className = 'opt'
      fs.dataset.opcion = o.nombre
      const sel = document.createElement('b')
      const leg = document.createElement('legend')
      leg.append(`${o.nombre}${o.requerida ? ' *' : ''} `)
      leg.appendChild(sel)
      fs.appendChild(leg)
      const cont = document.createElement('div')
      cont.className = `opt__chips${o.valores.length >= LETRAS_MIN ? ' opt__chips--letras' : ''}`
      const botones = o.valores.map((val) => {
        const b = chip(val, '', colores[val] ?? '')
        b.addEventListener('click', () => {
          op[o.nombre] = val
          botones.forEach((x, k) => x.setAttribute('aria-pressed', String(o.valores[k] === val)))
          sel.textContent = val
          fs.classList.remove('opt--error')
          error.hidden = true
        })
        cont.appendChild(b)
        return b
      })
      fs.appendChild(cont)
      if (!o.requerida) {
        op[o.nombre] = o.valores[0]!
        botones[0]?.setAttribute('aria-pressed', 'true')
        sel.textContent = o.valores[0]!
      }
      opts.appendChild(fs)
    })
  }

  const abrir = (id: number | string) => {
    const p = productos.find((x) => x.id === Number(id))
    if (!p) return
    actual = p
    op = {}
    lastFocus = document.activeElement as HTMLElement
    const e = etiquetaDe(p)
    cat.textContent = e && e.id !== 'agotado' ? e.texto : nombreCategoria(p)
    name.textContent = p.nombre
    mat.textContent = p.material
    mat.hidden = !p.material
    det.textContent = p.descripcion
    det.hidden = !p.descripcion
    cant.value = '1'
    diseno.value = ''
    disenoBox.hidden = !p.escogeDiseno
    error.hidden = true
    crearThumbs(p)
    pintarFotos(p, 0)
    crearOpciones(p)
    pintarPrecio()
    addTxt.textContent = 'Agregar al carrito'
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
  document.addEventListener('abrir-producto', ((e: CustomEvent<number>) => abrir(e.detail)) as EventListener)
  $$('[data-cerrar-producto]').forEach((b) => b.addEventListener('click', cerrar))
  veil.addEventListener('click', cerrar)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrar()
  })

  $('[data-prod-menos]', modal)!.addEventListener('click', () => (cant.value = String(Math.max(1, qty() - 1))))
  $('[data-prod-mas]', modal)!.addEventListener('click', () => (cant.value = String(qty() + 1)))
  cant.addEventListener('change', () => (cant.value = String(qty())))

  addBtn.addEventListener('click', () => {
    if (!actual || estaAgotado()) return
    const faltante = actual.opciones.find((o) => o.requerida && o.valores.length && !op[o.nombre])
    if (faltante) {
      const fs = $(`[data-opcion="${faltante.nombre}"]`, opts)
      fs?.classList.add('opt--error')
      error.textContent = `Elige ${faltante.nombre.toLowerCase() === 'letra' ? 'la letra' : `tu ${faltante.nombre.toLowerCase()}`} para continuar.`
      error.hidden = false
      fs?.scrollIntoView({ block: 'center', behavior: reduce() ? 'auto' : 'smooth' })
      return
    }
    add({ id: actual.id, vi, op: { ...op }, dis: actual.escogeDiseno ? diseno.value : '' }, qty())
    const nombre = actual.nombre
    bump($$('[data-count]'))
    cerrar()
    toast(`${nombre} agregado al carrito`, { texto: 'Ver carrito', fn: () => document.dispatchEvent(new Event('abrir-carrito')) })
  })

  favBtn.addEventListener('click', () => {
    if (!actual) return
    toggleFav(actual.id)
    pintarFav()
  })
  onFav(pintarFav)

  const buscado = new URLSearchParams(location.search).get('producto')
  const enLink = buscado ? productos.find((p) => p.slug === buscado) : null
  if (enLink) window.setTimeout(() => abrir(enLink.id), 600)
}
