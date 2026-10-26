import gsap from 'gsap'
import { $ } from './util'

export function initCarrusel() {
  const track = $('[data-carrusel]')
  const next = $('[data-carrusel-next]')
  const barra = $('[data-carrusel-barra]')
  if (!track) return

  const actualizar = () => {
    const max = track.scrollWidth - track.clientWidth
    if (barra) {
      const ancho = max <= 0 ? 100 : (track.clientWidth / track.scrollWidth) * 100
      barra.style.width = `${ancho}%`
      const frac = max <= 0 ? 0 : track.scrollLeft / max
      const parent = barra.parentElement as HTMLElement
      gsap.set(barra, { x: frac * (parent.clientWidth - barra.clientWidth) })
    }
  }

  track.addEventListener('scroll', actualizar, { passive: true })
  window.addEventListener('resize', actualizar)
  actualizar()

  next?.addEventListener('click', () => {
    const max = track.scrollWidth - track.clientWidth
    const destino = track.scrollLeft >= max - 4 ? 0 : Math.min(max, track.scrollLeft + track.clientWidth * 0.75)
    track.scrollTo({ left: destino, behavior: 'smooth' })
  })

  if (window.matchMedia('(hover: hover)').matches) {
    let down = false
    let x0 = 0
    let s0 = 0
    let movido = false
    track.addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement).closest('button')) return
      down = true
      movido = false
      x0 = e.clientX
      s0 = track.scrollLeft
      track.style.scrollSnapType = 'none'
    })
    window.addEventListener('pointermove', (e) => {
      if (!down) return
      const dx = e.clientX - x0
      if (Math.abs(dx) > 4) movido = true
      track.scrollLeft = s0 - dx
    })
    const soltar = () => {
      if (!down) return
      down = false
      track.style.scrollSnapType = ''
    }
    window.addEventListener('pointerup', soltar)
    track.addEventListener(
      'click',
      (e) => {
        if (movido) {
          e.preventDefault()
          e.stopPropagation()
          movido = false
        }
      },
      true,
    )
    track.style.cursor = 'grab'
  }
}
