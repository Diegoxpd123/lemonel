import gsap from 'gsap'
import { productos } from '../data/products'
import { config } from '../data/config'

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const INTERVALO = 2.2

export function initHero() {
  const hero = document.querySelector('[data-hero]') as HTMLElement | null
  if (!hero) return

  const imgs = Array.from(hero.querySelectorAll('.hero__img')) as HTMLImageElement[]
  const dots = Array.from(hero.querySelectorAll('[data-dot]')) as HTMLButtonElement[]
  const stage = hero.querySelector('[data-hero-stage]') as HTMLElement
  const disc = hero.querySelector('[data-disc]') as HTMLElement
  const name = hero.querySelector('[data-now-name]') as HTMLElement
  const note = hero.querySelector('[data-now-note]') as HTMLElement
  const price = hero.querySelector('[data-now-price]') as HTMLElement
  const add = hero.querySelector('[data-now-add]') as HTMLButtonElement
  const lines = Array.from(hero.querySelectorAll('[data-hero-line]')) as HTMLElement[]
  const ins = Array.from(hero.querySelectorAll('[data-hero-in]')) as HTMLElement[]

  const rows = Array.from(hero.querySelectorAll('[data-hero-row]')) as HTMLElement[]
  const color = (i: number) => getComputedStyle(document.documentElement).getPropertyValue('--' + (imgs[i].dataset.tone ?? 'sand')).trim()
  const disco = (i: number) => (imgs[i].dataset.disc === 'oscuro' ? 'rgba(24, 31, 14, 0.58)' : '#fffdf5')
  const items = imgs.map((img) => productos.find((p) => p.id === img.dataset.slide)!)
  let cur = 0
  let idle: gsap.core.Tween | null = null
  let progress: gsap.core.Tween | null = null
  let visible = true
  let animando = false

  imgs[0].setAttribute('data-current', '')

  const textos = (i: number) => {
    const p = items[i]
    name.textContent = p.nombre
    note.textContent = p.nota
    price.textContent = `${config.moneda} ${p.precio}`
    add.dataset.add = p.id
    dots.forEach((d, k) => d.setAttribute('aria-selected', String(k === i)))
    imgs.forEach((im, k) => (k === i ? im.setAttribute('data-current', '') : im.removeAttribute('data-current')))
  }

  const arrancarProgreso = () => {
    progress?.kill()
    dots.forEach((d) => gsap.set(d.querySelector('i'), { scaleX: 0 }))
    if (reduce()) return
    progress = gsap.fromTo(
      dots[cur].querySelector('i'),
      { scaleX: 0 },
      { scaleX: 1, duration: INTERVALO, ease: 'none', onComplete: () => go((cur + 1) % imgs.length) },
    )
    if (!visible) progress.pause()
  }

  const flotar = (img: HTMLElement) => {
    idle?.kill()
    idle = gsap.to(img, { y: -12, rotation: 1.4, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 })
  }

  const go = (i: number) => {
    if (i === cur || animando) return
    const out = imgs[cur]
    const inn = imgs[i]
    const from = cur
    cur = i
    if (reduce()) {
      gsap.set(out, { autoAlpha: 0 })
      gsap.set(inn, { autoAlpha: 1 })
      textos(i)
      hero.style.backgroundColor = color(i)
      disc.style.backgroundColor = disco(i)
      return
    }
    animando = true
    progress?.kill()
    idle?.kill()
    const dir = i > from || (from === imgs.length - 1 && i === 0) ? 1 : -1
    const tl = gsap.timeline({
      onComplete: () => {
        animando = false
        flotar(inn)
        arrancarProgreso()
      },
    })
    tl.to(hero, { backgroundColor: color(i), duration: 1, ease: 'power2.inOut' }, 0.1)
      .to(disc, { backgroundColor: disco(i), duration: 0.8, ease: 'power2.inOut' }, 0.2)
      .to(out, { y: -80 * dir, rotation: 12 * dir, scale: 0.88, autoAlpha: 0, duration: 0.55, ease: 'power2.in' }, 0)
      .to([name, note, price], { y: -16, autoAlpha: 0, duration: 0.25, stagger: 0.03, ease: 'power2.in' }, 0)
      .add(() => textos(i), 0.3)
      .fromTo(
        inn,
        { y: 120 * dir, rotation: -14 * dir, scale: 0.86, autoAlpha: 0 },
        { y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 1.1, ease: 'back.out(1.5)' },
        0.3,
      )
      .fromTo(disc, { scale: 0.93 }, { scale: 1, duration: 1.2, ease: 'elastic.out(1, 0.55)' }, 0.3)
      .fromTo([name, note, price], { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out' }, 0.45)
  }

  dots.forEach((d, i) =>
    d.addEventListener('click', () => {
      if (i === cur) return
      go(i)
    }),
  )

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    if (!progress) return
    if (visible) progress.resume()
    else progress.pause()
  }).observe(hero)

  if (reduce()) {
    gsap.set(lines, { yPercent: 0, opacity: 1 })
    gsap.set(ins, { y: 0, opacity: 1 })
    gsap.set(stage, { opacity: 1 })
    return
  }

  rows.forEach((r, i) => {
    if (i % 2) gsap.fromTo(r, { xPercent: -50 }, { xPercent: 0, duration: 90 - i * 8, ease: 'none', repeat: -1 })
    else gsap.to(r, { xPercent: -50, duration: 90 - i * 8, ease: 'none', repeat: -1 })
  })

  gsap.set(imgs.slice(1), { autoAlpha: 0 })
  gsap.set(imgs[0], { autoAlpha: 0 })

  const intro = gsap.timeline({ defaults: { ease: 'power4.out' }, paused: true })
  intro
    .fromTo(lines, { yPercent: 115, opacity: 1 }, { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.12 }, 0)
    .fromTo(ins, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 }, 0.5)
    .fromTo(stage, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0)
    .fromTo(disc, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.3, ease: 'elastic.out(1, 0.6)' }, 0.1)
    .fromTo(imgs[0], { y: 140, rotation: -16, scale: 0.85, autoAlpha: 0 }, { y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 1.3, ease: 'back.out(1.4)' }, 0.45)
    .fromTo(dots, { y: 20, opacity: 0 }, { y: 0, opacity: 0.6, duration: 0.6, stagger: 0.05, clearProps: 'opacity' }, 1)
    .add(() => {
      flotar(imgs[0])
      arrancarProgreso()
    }, 1.8)

  const logo = document.querySelector('.head__logo img') as HTMLImageElement | null
  const nav = Array.from(document.querySelectorAll('.head__nav, .head__caja, .head__burger')) as HTMLElement[]
  if (!logo) {
    intro.play()
    return
  }

  gsap.set(logo, { autoAlpha: 0 })
  gsap.set(nav, { autoAlpha: 0 })

  const grande = Math.min(window.innerWidth * 0.5, 260)
  const clon = document.createElement('img')
  clon.src = logo.currentSrc || logo.src
  clon.alt = ''
  clon.setAttribute('aria-hidden', 'true')
  clon.style.cssText = `position:fixed;left:50%;top:50%;width:${grande}px;height:${grande}px;margin:${-grande / 2}px 0 0 ${-grande / 2}px;z-index:120;pointer-events:none;`
  document.body.appendChild(clon)

  const destino = () => {
    const r = logo.getBoundingClientRect()
    return { x: r.left + r.width / 2 - window.innerWidth / 2, y: r.top + r.height / 2 - window.innerHeight / 2, s: r.width / grande }
  }

  gsap
    .timeline({
      onComplete: () => {
        clon.remove()
        gsap.set(logo, { autoAlpha: 1 })
        gsap.fromTo(nav, { autoAlpha: 0, y: -14 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' })
      },
    })
    .fromTo(clon, { scale: 0, rotation: -720 }, { scale: 1, rotation: 0, duration: 1.2, ease: 'back.out(1.5)' })
    .to(clon, { rotation: 360, duration: 0.8, ease: 'power2.inOut' }, '+=0.05')
    .add(() => {
      intro.play()
    }, '>-0.1')
    .to(
      clon,
      { x: () => destino().x, y: () => destino().y, scale: () => destino().s, rotation: 720, duration: 0.95, ease: 'power3.inOut' },
      '>-0.05',
    )
}
