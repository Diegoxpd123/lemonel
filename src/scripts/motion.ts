import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $, $$, reduce } from './util'

gsap.registerPlugin(ScrollTrigger)

export function initFaq() {
  const items = $$('[data-item]')
  const cerrar = (it: HTMLElement) => {
    const q = $('[data-q]', it)!
    const a = it.querySelector('.faq__a') as HTMLElement
    q.setAttribute('aria-expanded', 'false')
    if (reduce()) {
      a.hidden = true
      return
    }
    gsap.to(a, { height: 0, duration: 0.35, ease: 'power2.inOut', onComplete: () => { a.hidden = true; gsap.set(a, { clearProps: 'height' }) } })
  }
  const abrir = (it: HTMLElement) => {
    const q = $('[data-q]', it)!
    const a = it.querySelector('.faq__a') as HTMLElement
    q.setAttribute('aria-expanded', 'true')
    a.hidden = false
    if (!reduce()) gsap.fromTo(a, { height: 0 }, { height: 'auto', duration: 0.4, ease: 'power2.out', onComplete: () => gsap.set(a, { clearProps: 'height' }) })
  }
  items.forEach((it) => {
    $('[data-q]', it)!.addEventListener('click', () => {
      const abierto = $('[data-q]', it)!.getAttribute('aria-expanded') === 'true'
      items.forEach((o) => {
        if (o !== it && $('[data-q]', o)!.getAttribute('aria-expanded') === 'true') cerrar(o)
      })
      if (abierto) cerrar(it)
      else abrir(it)
    })
  })
}

export function initNews() {
  const form = $('[data-news]') as HTMLFormElement | null
  if (!form) return
  const email = $('[data-news-email]', form) as HTMLInputElement
  const ok = $('[data-news-ok]', form) as HTMLInputElement
  const msg = $('[data-news-msg]', form)!
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const valido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())
    msg.hidden = false
    if (!valido) {
      msg.textContent = 'Escribe un correo válido para suscribirte.'
      email.focus()
      return
    }
    if (!ok.checked) {
      msg.textContent = 'Acepta la política de privacidad para continuar.'
      return
    }
    msg.textContent = '¡Gracias por unirte al círculo Lemonel! Pronto te escribiremos.'
    form.reset()
  })
}

export function initMotion() {
  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    $$('[data-rv]').forEach((el) => {
      gsap.set(el, { autoAlpha: 0, y: 26 })
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', overwrite: 'auto' }),
      })
    })

    const grupos = ['.fila__grid', '.cat__grid', '.cols__grid', '.vend__row']
    grupos.forEach((g) => {
      $$(g).forEach((grid) => {
        const hijos = $$('.card:not([hidden]), .tile', grid)
        gsap.set(hijos, { autoAlpha: 0, y: 30 })
        ScrollTrigger.batch(hijos, {
          start: 'top 94%',
          once: true,
          onEnter: (b) => gsap.to(b, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out', overwrite: 'auto' }),
        })
      })
    })

    $$('[data-parallax]').forEach((img) => {
      const sec = img.closest('[data-banner]') as HTMLElement
      gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } })
    })

    const nombre = $('[data-foot-name] span')
    if (nombre) {
      gsap.fromTo(nombre, { yPercent: 30 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '[data-foot-name]', start: 'top bottom', end: 'bottom bottom', scrub: 0.5 } })
    }

    $$('.btn, .chip, .preset').forEach((b) => {
      b.addEventListener('pointerdown', () => gsap.to(b, { scale: 0.97, duration: 0.12, overwrite: 'auto' }))
      const up = () => gsap.to(b, { scale: 1, duration: 0.4, ease: 'back.out(3)', overwrite: 'auto' })
      b.addEventListener('pointerup', up)
      b.addEventListener('pointerleave', up)
    })
  })

  window.addEventListener('load', () => ScrollTrigger.refresh())
}
