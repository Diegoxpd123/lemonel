import gsap from 'gsap'
import plus from '/node_modules/@phosphor-icons/core/assets/bold/plus-bold.svg?raw'
import minus from '/node_modules/@phosphor-icons/core/assets/bold/minus-bold.svg?raw'
import { add, dinero, getLineas, onChange, remove, resumen, setQty, urlWhatsapp } from './cart'

const $ = <T extends HTMLElement>(s: string, root: ParentNode = document) => root.querySelector(s) as T | null
const $$ = <T extends HTMLElement>(s: string, root: ParentNode = document) => Array.from(root.querySelectorAll(s)) as T[]

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const icono = (svg: string) => svg.replace('<svg ', '<svg width="1em" height="1em" aria-hidden="true" ')

export function initCaja() {
  const drawer = $('[data-caja]')
  const veil = $('[data-veil]')
  if (!drawer || !veil) return

  const lines = $('[data-caja-lines]')!
  const empty = $('[data-caja-empty]')!
  const extra = $('[data-caja-extra]')!
  const totalEl = $('[data-caja-total]')!
  const ahorroEl = $('[data-caja-ahorro]')!
  const send = $('[data-enviar]') as HTMLButtonElement
  const toggle = $('[data-evento-toggle]') as HTMLInputElement
  const evFields = $('[data-evento-fields]')!
  const tipo = $('[data-evento-tipo]') as HTMLSelectElement
  const fecha = $('[data-evento-fecha]') as HTMLInputElement
  const nota = $('[data-caja-nota]') as HTMLTextAreaElement
  const lazo = $('[data-lazo]')!
  const bandas = $$('i', lazo)
  const sello = $('span', lazo)!
  const closeBtns = $$('[data-cerrar-caja]')
  const counts = $$('[data-count]')
  const fab = $('[data-fab]')!

  const min = new Date()
  min.setDate(min.getDate() + 1)
  fecha.min = min.toISOString().slice(0, 10)

  let abierta = false
  let lastFocus: HTMLElement | null = null
  let enviando = false

  const pintarLineas = () => {
    const ls = getLineas()
    lines.innerHTML = ''
    ls.forEach((l) => {
      const li = document.createElement('li')
      li.className = 'line'
      li.dataset.id = l.p.id
      const desc = l.descuento ? `<span class="line__tag">${Math.round(l.descuento * 100)}% menos</span>` : ''
      const antes = l.descuento ? `<s>${dinero(l.p.precio)}</s>` : ''
      li.innerHTML = `
        <img class="line__img" src="${l.p.foto}" alt="" width="84" height="104" />
        <span class="line__name">${l.p.nombre}</span>
        <div class="line__qty">
          <button type="button" data-menos aria-label="Una menos de ${l.p.nombre}">${icono(minus)}</button>
          <input type="number" inputmode="numeric" min="1" value="${l.qty}" aria-label="Cantidad de ${l.p.nombre}" />
          <button type="button" data-mas aria-label="Una más de ${l.p.nombre}">${icono(plus)}</button>
        </div>
        <span class="line__price">${antes}${dinero(l.unit)} c/u${desc}</span>
        <button type="button" class="line__rm" data-quitar>Quitar</button>
      `
      const input = li.querySelector('input') as HTMLInputElement
      li.querySelector('[data-menos]')!.addEventListener('click', () => setQty(l.p.id, l.qty - 1))
      li.querySelector('[data-mas]')!.addEventListener('click', () => setQty(l.p.id, l.qty + 1))
      li.querySelector('[data-quitar]')!.addEventListener('click', () => remove(l.p.id))
      input.addEventListener('change', () => setQty(l.p.id, Number(input.value)))
      lines.appendChild(li)
    })
  }

  const pintar = () => {
    const r = resumen()
    const vacia = r.piezas === 0
    counts.forEach((c) => (c.textContent = String(r.piezas)))
    empty.hidden = !vacia
    extra.hidden = vacia
    send.disabled = vacia
    totalEl.textContent = dinero(r.total)
    ahorroEl.hidden = r.ahorro <= 0
    ahorroEl.textContent = r.ahorro > 0 ? `Ahorras ${dinero(r.ahorro)} por cantidad` : ''
    pintarLineas()
  }

  const abrir = () => {
    if (abierta) return
    abierta = true
    lastFocus = document.activeElement as HTMLElement
    veil.hidden = false
    drawer.hidden = false
    document.body.classList.add('is-locked')
    if (!reduce()) {
      gsap.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' })
      gsap.fromTo(drawer, { xPercent: 100 }, { xPercent: 0, duration: 0.6, ease: 'power4.out' })
      gsap.fromTo(
        $$('.line', drawer),
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, delay: 0.25, ease: 'power3.out' },
      )
    }
    ;(closeBtns[0] as HTMLElement).focus()
  }

  const cerrar = () => {
    if (!abierta || enviando) return
    abierta = false
    document.body.classList.remove('is-locked')
    const fin = () => {
      veil.hidden = true
      drawer.hidden = true
      lastFocus?.focus()
    }
    if (reduce()) return fin()
    gsap.to(veil, { opacity: 0, duration: 0.3 })
    gsap.to(drawer, { xPercent: 100, duration: 0.45, ease: 'power3.in', onComplete: fin })
  }

  $$('[data-abrir-caja]').forEach((b) => b.addEventListener('click', abrir))
  closeBtns.forEach((b) => b.addEventListener('click', cerrar))
  veil.addEventListener('click', cerrar)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrar()
  })

  toggle.addEventListener('change', () => {
    evFields.hidden = !toggle.checked
    fecha.setCustomValidity('')
  })
  fecha.addEventListener('input', () => fecha.setCustomValidity(''))

  send.addEventListener('click', () => {
    if (enviando) return
    const r = resumen()
    if (!r.piezas) return
    if (toggle.checked && !fecha.value) {
      fecha.setCustomValidity('Elige la fecha de tu evento')
      fecha.reportValidity()
      return
    }
    const url = urlWhatsapp(r.lineas, {
      evento: toggle.checked ? { tipo: tipo.value, fecha: fecha.value } : null,
      nota: nota.value,
    })
    enviando = true
    send.disabled = true
    if (reduce()) {
      window.location.href = url
      enviando = false
      send.disabled = false
      return
    }
    lazo.style.visibility = 'visible'
    gsap.set(bandas[0], { scaleX: 0 })
    gsap.set(bandas[1], { scaleY: 0 })
    gsap.set(sello, { scale: 0, rotation: -30 })
    gsap
      .timeline({
        onComplete: () => {
          window.location.href = url
          setTimeout(() => {
            enviando = false
            send.disabled = false
            lazo.style.visibility = 'hidden'
          }, 1500)
        },
      })
      .to(bandas[0], { scaleX: 1, duration: 0.5, ease: 'power3.inOut' }, 0)
      .to(bandas[1], { scaleY: 1, duration: 0.5, ease: 'power3.inOut' }, 0.1)
      .to(sello, { scale: 1, rotation: 0, duration: 0.55, ease: 'back.out(2.2)' }, 0.45)
      .to({}, { duration: 0.35 })
  })

  const volar = (id: string, origen: HTMLElement) => {
    const enHero = !!origen.closest('[data-hero]')
    const fuente = enHero
      ? (document.querySelector('[data-hero] .hero__img[data-current]') as HTMLImageElement | null)
      : (document.querySelector(`[data-id="${id}"] [data-art] img`) as HTMLImageElement | null)
    const visible = [fab, ...$$('.head__caja')].find((el) => el.offsetParent !== null) ?? fab
    gsap.fromTo(counts, { scale: 1.6 }, { scale: 1, duration: 0.55, ease: 'back.out(3)', overwrite: 'auto' })
    if (reduce() || !fuente) return
    const a = fuente.getBoundingClientRect()
    const t = visible.getBoundingClientRect()
    const clone = fuente.cloneNode(true) as HTMLImageElement
    clone.removeAttribute('style')
    const size = Math.min(a.width, a.height) * (enHero ? 0.42 : 0.55)
    clone.style.cssText = `position:fixed;left:${a.left + a.width / 2 - size / 2}px;top:${a.top + a.height / 2 - size / 2}px;width:${size}px;height:${size}px;object-fit:${enHero ? 'contain' : 'cover'};border-radius:${enHero ? '0' : '50%'};z-index:90;pointer-events:none;`
    document.body.appendChild(clone)
    const dx = t.left + t.width / 2 - (a.left + a.width / 2)
    const dy = t.top + t.height / 2 - (a.top + a.height / 2)
    gsap
      .timeline({ onComplete: () => clone.remove() })
      .to(clone, { y: -40, scale: 1.12, duration: 0.25, ease: 'power2.out' })
      .to(clone, { x: dx, y: dy, scale: 0.15, opacity: 0.2, duration: 0.7, ease: 'power3.in' })
    gsap.fromTo(visible, { scale: 1 }, { scale: 1.08, duration: 0.2, delay: 0.85, yoyo: true, repeat: 1, ease: 'power2.out' })
    origen.blur?.()
  }

  document.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('[data-add]') as HTMLElement | null
    if (!b) return
    const id = b.dataset.add!
    add(id, 1)
    volar(id, b)
  })

  onChange(pintar)
  pintar()
}
