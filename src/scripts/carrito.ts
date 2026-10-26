import gsap from 'gsap'
import plus from '/node_modules/@phosphor-icons/core/assets/light/plus-light.svg?raw'
import minus from '/node_modules/@phosphor-icons/core/assets/light/minus-light.svg?raw'
import trash from '/node_modules/@phosphor-icons/core/assets/light/trash-light.svg?raw'
import { dinero, getLineas, onChange, remove, resumen, setQty, urlWhatsapp } from './cart'
import { $, $$, reduce } from './util'

const icono = (svg: string) => svg.replace('<svg ', '<svg width="1em" height="1em" aria-hidden="true" ')

export function initCarrito() {
  const drawer = $('[data-cart]')
  const veil = $('[data-cveil]')
  if (!drawer || !veil) return

  const lines = $('[data-cart-lines]')!
  const empty = $('[data-cart-empty]')!
  const extra = $('[data-cart-extra]')!
  const n = $('[data-cart-n]')!
  const sub = $('[data-cart-sub]')!
  const total = $('[data-cart-total]')!
  const ahorroRow = $('[data-cart-ahorro-row]')!
  const ahorro = $('[data-cart-ahorro]')!
  const send = $('[data-enviar]') as HTMLButtonElement
  const toggle = $('[data-evento-toggle]') as HTMLInputElement
  const evFields = $('[data-evento-fields]')!
  const tipo = $('[data-evento-tipo]') as HTMLSelectElement
  const fecha = $('[data-evento-fecha]') as HTMLInputElement
  const nota = $('[data-cart-nota]') as HTMLTextAreaElement
  const counts = $$('[data-count]')
  let abierto = false
  let lastFocus: HTMLElement | null = null

  const min = new Date()
  min.setDate(min.getDate() + 1)
  fecha.min = min.toISOString().slice(0, 10)

  const pintarLineas = () => {
    lines.innerHTML = ''
    getLineas().forEach((l) => {
      const li = document.createElement('li')
      li.className = 'line'
      li.dataset.id = l.p.id
      const desc = l.descuento ? `<span class="line__tag">${Math.round(l.descuento * 100)}% menos</span>` : ''
      const antes = l.descuento ? `<s>${dinero(l.p.precio)}</s>` : ''
      li.innerHTML = `
        <img class="line__img" src="${l.p.foto}" alt="" width="84" height="104" />
        <span class="line__name">${l.p.nombre}</span>
        <button type="button" class="line__rm" data-quitar aria-label="Quitar ${l.p.nombre}">${icono(trash)}</button>
        <span class="line__price">${antes}${dinero(l.unit)}${desc}</span>
        <div class="line__qty">
          <button type="button" data-menos aria-label="Una menos de ${l.p.nombre}">${icono(minus)}</button>
          <input type="number" inputmode="numeric" min="1" value="${l.qty}" aria-label="Cantidad de ${l.p.nombre}" />
          <button type="button" data-mas aria-label="Una más de ${l.p.nombre}">${icono(plus)}</button>
        </div>
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
    counts.forEach((c) => {
      c.textContent = String(r.piezas)
      c.hidden = vacia
    })
    n.textContent = String(r.piezas)
    empty.hidden = !vacia
    extra.hidden = vacia
    send.disabled = vacia
    sub.textContent = dinero(r.total + r.ahorro)
    total.textContent = dinero(r.total)
    ahorroRow.hidden = r.ahorro <= 0
    ahorro.textContent = r.ahorro > 0 ? `− ${dinero(r.ahorro)}` : ''
    pintarLineas()
  }

  const abrir = () => {
    if (abierto) return
    abierto = true
    lastFocus = document.activeElement as HTMLElement
    veil.hidden = false
    drawer.hidden = false
    document.body.classList.add('is-locked')
    if (!reduce()) {
      gsap.fromTo(veil, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' })
      gsap.fromTo(drawer, { xPercent: 100 }, { xPercent: 0, duration: 0.5, ease: 'power4.out' })
      gsap.fromTo($$('.line', drawer), { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.05, delay: 0.2, ease: 'power3.out' })
    }
    ;($('[data-cerrar-carrito]', drawer) as HTMLElement).focus()
  }

  const cerrar = () => {
    if (!abierto) return
    abierto = false
    document.body.classList.remove('is-locked')
    const fin = () => {
      veil.hidden = true
      drawer.hidden = true
      lastFocus?.focus?.()
    }
    if (reduce()) return fin()
    gsap.to(veil, { autoAlpha: 0, duration: 0.25 })
    gsap.to(drawer, { xPercent: 100, duration: 0.4, ease: 'power3.in', onComplete: fin })
  }

  $$('[data-abrir-carrito]').forEach((b) => b.addEventListener('click', abrir))
  $$('[data-cerrar-carrito]').forEach((b) => b.addEventListener('click', cerrar))
  document.addEventListener('abrir-carrito', abrir)
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
    window.open(url, '_blank', 'noopener')
  })

  onChange(pintar)
  pintar()
}
