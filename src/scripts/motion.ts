import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const $ = <T extends Element>(s: string, root: ParentNode = document) => root.querySelector(s) as T | null
const $$ = <T extends Element>(s: string, root: ParentNode = document) => Array.from(root.querySelectorAll(s)) as T[]

const marquesina = (track: Element | null, duracion: number, derecha = false) => {
  if (!track) return
  const tween = derecha
    ? gsap.fromTo(track, { xPercent: -50 }, { xPercent: 0, duration: duracion, ease: 'none', repeat: -1 })
    : gsap.to(track, { xPercent: -50, duration: duracion, ease: 'none', repeat: -1 })
  ScrollTrigger.create({
    onUpdate: (self) => {
      const v = Math.min(Math.abs(self.getVelocity()) / 260, 7)
      gsap.to(tween, { timeScale: 1 + v, duration: 0.25, overwrite: true })
      gsap.to(tween, { timeScale: 1, duration: 1.4, delay: 0.25 })
    },
  })
}

export function initMotion() {
  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    marquesina($('[data-cinta-track]'), 38)
    $$('[data-tira-track]').forEach((t, i) => marquesina(t, 70 + i * 6, t.getAttribute('data-tira-track') === 'der'))

    $$('[data-reveal]').forEach((el) => {
      gsap.set(el, { autoAlpha: 0, y: 36 })
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', overwrite: 'auto' }),
      })
    })

    const lote = (sel: string, desde = 40) => {
      const els = $$(sel)
      gsap.set(els, { autoAlpha: 0, y: desde })
      ScrollTrigger.batch(els, {
        start: 'top 94%',
        once: true,
        onEnter: (b) => gsap.to(b, { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.08, ease: 'power3.out', overwrite: 'auto' }),
      })
    }
    lote('[data-tile]')
    lote('[data-gal]', 56)
    lote('.tier', 30)

    $$('[data-col-panel]').forEach((panel) => {
      const title = $('[data-col-title]', panel)!
      const big = $('[data-col-piece]', panel)!
      const small = $('[data-col-small]', panel)!
      const flip = panel.classList.contains('col--flip')
      const st = { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      gsap.fromTo(title, { xPercent: flip ? 5 : -5 }, { xPercent: flip ? -3 : 3, ease: 'none', scrollTrigger: st })
      gsap.fromTo(big, { y: 70, rotation: flip ? 2 : -2 }, { y: -70, rotation: flip ? -1.5 : 1.5, ease: 'none', scrollTrigger: st })
      gsap.fromTo(small, { y: -50 }, { y: 70, ease: 'none', scrollTrigger: st })
    })

    const imgs = $$('[data-ent-img]')
    const icos = $$('[data-ent-ico]')
    if (imgs.length) {
      let activo = 0
      const ir = (i: number) => {
        if (i === activo) return
        const out = imgs[activo]
        const inn = imgs[i]
        gsap.to(out, { autoAlpha: 0, scale: 1.06, duration: 0.7, ease: 'power2.inOut', overwrite: 'auto' })
        gsap.fromTo(inn, { autoAlpha: 0, scale: 1.1 }, { autoAlpha: 1, scale: 1, duration: 1, ease: 'power3.out', overwrite: 'auto' })
        gsap.to(icos[activo], { autoAlpha: 0, scale: 0.5, rotation: -40, duration: 0.3, overwrite: 'auto' })
        gsap.fromTo(icos[i], { autoAlpha: 0, scale: 0.4, rotation: 40 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.6, delay: 0.15, ease: 'back.out(2.4)', overwrite: 'auto' })
        activo = i
      }
      $$('[data-ent-step]').forEach((step, i) => {
        ScrollTrigger.create({
          trigger: step,
          start: 'top 58%',
          end: 'bottom 58%',
          onEnter: () => ir(i),
          onEnterBack: () => ir(i),
        })
      })
    }

    const nombre = $('[data-foot-name] span')
    if (nombre) {
      gsap.fromTo(
        nombre,
        { yPercent: 38 },
        { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '[data-foot-name]', start: 'top bottom', end: 'bottom bottom', scrub: 0.5 } },
      )
    }

    $$('.btn, .chip, .tile__add, .dot').forEach((b) => {
      b.addEventListener('pointerdown', () => gsap.to(b, { scale: 0.96, duration: 0.12, overwrite: 'auto' }))
      const up = () => gsap.to(b, { scale: 1, duration: 0.45, ease: 'back.out(3)', overwrite: 'auto' })
      b.addEventListener('pointerup', up)
      b.addEventListener('pointerleave', up)
    })
  })

  window.addEventListener('load', () => ScrollTrigger.refresh())
}
