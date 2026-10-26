import gsap from 'gsap'
import { dinero } from '../data/tienda'
import { productos } from './store'
import { $, $$, reduce, irA } from './util'
import { getFav, onFav, totalFav } from './cart'

const norm = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const esc = (t: string) => t.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export function initHeader() {
  const head = $('[data-header]')
  const veil = $('[data-veil]')
  const mega = $('[data-mega]')
  const megaBtn = $('[data-mega-toggle]')
  const menu = $('[data-menu]')
  const burger = $('[data-burger]')
  const busca = $('[data-busca]')
  if (!head) return

  let megaAbierto = false
  let menuAbierto = false
  let buscaAbierta = false

  const estado = () => {
    const scrolled = window.scrollY > 40
    head.dataset.state = megaAbierto || menuAbierto ? 'open' : scrolled ? 'solid' : 'top'
    if (menuAbierto && !megaAbierto) head.dataset.state = 'solid'
  }
  estado()
  window.addEventListener('scroll', estado, { passive: true })

  const setMega = (abrir: boolean) => {
    if (!mega || !megaBtn || abrir === megaAbierto) return
    megaAbierto = abrir
    megaBtn.setAttribute('aria-expanded', String(abrir))
    if (abrir) {
      mega.hidden = false
      if (veil) veil.hidden = false
      if (!reduce()) {
        gsap.fromTo(mega, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power3.out' })
        gsap.fromTo(veil, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
        gsap.fromTo($$('.mega__col li, .mega__tile', mega), { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.025, ease: 'power3.out', delay: 0.05 })
      }
    } else {
      const fin = () => {
        mega.hidden = true
        if (veil) veil.hidden = true
      }
      if (reduce()) fin()
      else {
        gsap.to(mega, { autoAlpha: 0, y: -8, duration: 0.25, ease: 'power2.in', onComplete: fin })
        gsap.to(veil, { autoAlpha: 0, duration: 0.25 })
      }
    }
    estado()
  }

  megaBtn?.addEventListener('click', () => setMega(!megaAbierto))
  veil?.addEventListener('click', () => setMega(false))
  mega?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) setMega(false)
  })

  const setMenu = (abrir: boolean) => {
    if (!menu || !burger || abrir === menuAbierto) return
    menuAbierto = abrir
    burger.setAttribute('aria-expanded', String(abrir))
    document.body.classList.toggle('is-locked', abrir)
    const card = $('.menu__card', menu)
    if (abrir) {
      menu.hidden = false
      $$('.menu__panel', menu).forEach((p) => (p.hidden = p.dataset.panel !== 'main'))
      if (!reduce()) {
        gsap.fromTo(menu, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
        gsap.fromTo(card, { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' })
        gsap.fromTo($$('.menu__main > *', menu), { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out', delay: 0.12 })
      }
    } else {
      const fin = () => {
        menu.hidden = true
      }
      if (reduce()) fin()
      else {
        gsap.to(card, { y: 40, autoAlpha: 0, duration: 0.3, ease: 'power2.in' })
        gsap.to(menu, { autoAlpha: 0, duration: 0.3, onComplete: fin })
      }
    }
    estado()
  }

  burger?.addEventListener('click', () => setMenu(!menuAbierto))
  $$('[data-cerrar-menu]').forEach((b) => b.addEventListener('click', () => setMenu(false)))
  menu?.addEventListener('click', (e) => {
    if (e.target === menu) setMenu(false)
  })
  $$('[data-menu-link]', menu ?? document).forEach((a) => a.addEventListener('click', () => setMenu(false)))

  const cambiarPanel = (a: string, b: string) => {
    const pa = $(`[data-panel="${a}"]`, menu!)
    const pb = $(`[data-panel="${b}"]`, menu!)
    if (!pa || !pb) return
    const dir = b === 'main' ? -1 : 1
    if (reduce()) {
      pa.hidden = true
      pb.hidden = false
      return
    }
    gsap.to(pa, {
      x: -30 * dir,
      autoAlpha: 0,
      duration: 0.22,
      ease: 'power2.in',
      onComplete: () => {
        pa.hidden = true
        gsap.set(pa, { clearProps: 'all' })
        pb.hidden = false
        gsap.fromTo(pb, { x: 30 * dir, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.35, ease: 'power3.out' })
      },
    })
  }
  $('[data-sub]', menu ?? document)?.addEventListener('click', () => cambiarPanel('main', 'joyas'))
  $('[data-back]', menu ?? document)?.addEventListener('click', () => cambiarPanel('joyas', 'main'))

  const resultados = $('[data-busca-res]')
  const input = $('[data-busca-input]') as HTMLInputElement | null
  const pintar = (q: string) => {
    if (!resultados) return
    const t = q.trim().toLowerCase()
    const lista = (t ? productos.filter((p) => norm(`${p.nombre} ${p.categoria} ${p.material}`).includes(norm(t))) : productos.filter((p) => p.destacado)).slice(0, 12)
    resultados.innerHTML = ''
    if (!lista.length) {
      const li = document.createElement('li')
      li.className = 'busca__vacio'
      li.textContent = 'No encontramos joyas con ese nombre.'
      li.style.gridColumn = '1 / -1'
      resultados.appendChild(li)
      return
    }
    lista.forEach((p) => {
      const li = document.createElement('li')
      li.innerHTML = `<button type="button" class="busca__item" data-abrir-producto="${p.id}"><img src="${p.fotos[0]?.sm ?? ''}" alt="" width="150" height="188" loading="lazy" /><span>${esc(p.nombre)}</span><small>${dinero(p.precioDesde)}</small></button>`
      resultados.appendChild(li)
    })
  }

  const setBusca = (abrir: boolean) => {
    if (!busca || abrir === buscaAbierta) return
    buscaAbierta = abrir
    if (abrir) {
      setMenu(false)
      setMega(false)
      busca.hidden = false
      pintar('')
      if (veil) veil.hidden = false
      if (!reduce()) {
        gsap.fromTo(busca, { y: -30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out' })
        gsap.fromTo(veil, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
      }
      input?.focus()
    } else {
      const fin = () => {
        busca.hidden = true
        if (veil) veil.hidden = true
      }
      if (reduce()) fin()
      else {
        gsap.to(busca, { y: -20, autoAlpha: 0, duration: 0.25, onComplete: fin })
        gsap.to(veil, { autoAlpha: 0, duration: 0.25 })
      }
    }
  }
  $$('[data-abrir-busqueda]').forEach((b) => b.addEventListener('click', () => setBusca(true)))
  $$('[data-cerrar-busqueda]').forEach((b) => b.addEventListener('click', () => setBusca(false)))
  input?.addEventListener('input', () => pintar(input.value))
  $('[data-busca-form]')?.addEventListener('submit', (e) => e.preventDefault())
  resultados?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('[data-abrir-producto]')) setBusca(false)
  })
  veil?.addEventListener('click', () => setBusca(false))

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return
    setMega(false)
    setMenu(false)
    setBusca(false)
  })

  document.addEventListener('click', (e) => {
    if (megaAbierto && !(e.target as HTMLElement).closest('[data-header]')) setMega(false)
  })

  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
    if (!a) return
    const id = a.getAttribute('href')!
    if (id.length < 2) return
    const el = document.querySelector(id)
    if (!el) return
    e.preventDefault()
    irA(el)
  })

  const favDot = $$('[data-fav-count]')
  const pintarFav = () => {
    const n = totalFav()
    favDot.forEach((d) => {
      d.textContent = String(n)
      d.hidden = n === 0
    })
    $$('[data-fav]').forEach((b) => {
      const on = getFav().includes(b.dataset.fav!)
      b.setAttribute('aria-pressed', String(on))
    })
  }
  pintarFav()
  onFav(pintarFav)
}
