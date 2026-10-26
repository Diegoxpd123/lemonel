import gsap from 'gsap'

export const $ = <T extends HTMLElement>(s: string, root: ParentNode = document) => root.querySelector(s) as T | null
export const $$ = <T extends HTMLElement>(s: string, root: ParentNode = document) => Array.from(root.querySelectorAll(s)) as T[]

export const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const irA = (el: Element | null) => {
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 70
  window.scrollTo({ top, behavior: reduce() ? 'auto' : 'smooth' })
}

let toastEl: HTMLElement | null = null
let toastTween: gsap.core.Tween | null = null
let toastTimer: gsap.core.Tween | null = null

export const toast = (texto: string, accion?: { texto: string; fn: () => void }) => {
  toastTimer?.kill()
  if (!toastEl) {
    toastEl = document.createElement('div')
    toastEl.className = 'toast'
    toastEl.setAttribute('role', 'status')
    document.body.appendChild(toastEl)
  }
  toastEl.innerHTML = ''
  const span = document.createElement('span')
  span.textContent = texto
  toastEl.appendChild(span)
  if (accion) {
    const b = document.createElement('button')
    b.type = 'button'
    b.textContent = accion.texto
    b.addEventListener('click', accion.fn)
    toastEl.appendChild(b)
  }
  toastTween?.kill()
  gsap.set(toastEl, { display: 'flex' })
  toastTween = gsap.fromTo(toastEl, { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out' })
  toastTimer = gsap.to(toastEl, { autoAlpha: 0, y: 10, duration: 0.35, delay: 2.8, overwrite: false, onComplete: () => gsap.set(toastEl, { display: 'none' }) })
}

export const bump = (els: HTMLElement[]) => {
  if (reduce()) return
  gsap.fromTo(els, { scale: 1.5 }, { scale: 1, duration: 0.5, ease: 'back.out(3)', overwrite: 'auto' })
}
