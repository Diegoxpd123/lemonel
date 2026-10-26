import gsap from 'gsap'
import { $, $$, reduce } from './util'

const TIEMPO = 9

export function initHero() {
  const hero = $('[data-hero]')
  if (!hero) return
  const videos = $$('.hero__video', hero) as HTMLVideoElement[]
  const prev = $('[data-hero-prev]', hero)
  const next = $('[data-hero-next]', hero)
  const n = $('[data-hero-n]', hero)
  let cur = 0
  let timer: gsap.core.Tween | null = null
  let visible = true

  const conn = (navigator as any).connection
  const ahorro = !!(conn && conn.saveData)
  const quieto = reduce() || ahorro

  const reproducir = (v: HTMLVideoElement) => {
    v.muted = true
    v.setAttribute('muted', '')
    v.playsInline = true
    const p = v.play()
    if (p && typeof p.catch === 'function') p.catch(() => {})
  }

  if (quieto) {
    videos.forEach((v) => {
      v.removeAttribute('autoplay')
      v.pause()
    })
    $('.hero__ctrl', hero)?.setAttribute('hidden', '')
    return
  }

  reproducir(videos[0])

  const programar = () => {
    timer?.kill()
    if (videos.length < 2) return
    timer = gsap.delayedCall(TIEMPO, () => ir((cur + 1) % videos.length))
    if (!visible) timer.pause()
  }

  const ir = (i: number) => {
    if (i === cur) return
    const out = videos[cur]
    const inn = videos[i]
    reproducir(inn)
    inn.currentTime = 0
    gsap.to(inn, { opacity: 1, duration: 1.2, ease: 'power2.inOut' })
    gsap.to(out, {
      opacity: 0,
      duration: 1.2,
      ease: 'power2.inOut',
      onComplete: () => {
        if (out !== videos[cur]) out.pause()
      },
    })
    cur = i
    if (n) n.textContent = String(i + 1)
    programar()
  }

  prev?.addEventListener('click', () => ir((cur - 1 + videos.length) % videos.length))
  next?.addEventListener('click', () => ir((cur + 1) % videos.length))

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    videos.forEach((v, i) => {
      if (!visible) v.pause()
      else if (i === cur) reproducir(v)
    })
    if (visible) timer?.resume()
    else timer?.pause()
  }).observe(hero)

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      timer?.pause()
      videos[cur].pause()
    } else if (visible) {
      timer?.resume()
      reproducir(videos[cur])
    }
  })

  programar()
}
