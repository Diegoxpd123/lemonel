import gsap from 'gsap'
import plus from '/node_modules/@phosphor-icons/core/assets/light/plus-light.svg?raw'
import minus from '/node_modules/@phosphor-icons/core/assets/light/minus-light.svg?raw'
import trash from '/node_modules/@phosphor-icons/core/assets/light/trash-light.svg?raw'
import { dinero, onChange, remove, resumen, setQty, urlWhatsapp, type DatosCliente } from './cart'
import { $, $$, reduce, toast } from './util'

const ULTIMO = 'lemonel-ultimo-pedido'
const CLIENTE = 'lemonel-cliente'

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
  const campoNombre = $('[data-cliente-nombre]') as HTMLInputElement
  const campoWa = $('[data-cliente-wa]') as HTMLInputElement
  const campoCiudad = $('[data-cliente-ciudad]') as HTMLInputElement
  const errorDatos = $('[data-cart-err]')!
  const counts = $$('[data-count]')
  let abierto = false
  let lastFocus: HTMLElement | null = null

  const min = new Date()
  min.setDate(min.getDate() + 1)
  fecha.min = min.toISOString().slice(0, 10)

  const esc = (t: string) => t.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

  const pintarLineas = () => {
    lines.innerHTML = ''
    resumen().lineas.forEach((l) => {
      const li = document.createElement('li')
      li.className = 'line'
      li.dataset.key = l.key
      const desc = l.descuento ? `<span class="line__tag">${Math.round(l.descuento * 100)}% menos</span>` : ''
      const antes = l.descuento ? `<s>${dinero(l.v.precio)}</s>` : ''
      const foto = l.p.fotos[0]?.sm ?? ''
      const detalle = l.detalle.length ? `<span class="line__det">${esc(l.detalle.join(' · '))}</span>` : ''
      const nombre = esc(l.p.nombre)
      li.innerHTML = `
        <img class="line__img" src="${foto}" alt="" width="84" height="104" />
        <span class="line__name">${nombre}${detalle}</span>
        <button type="button" class="line__rm" data-quitar aria-label="Quitar ${nombre}">${icono(trash)}</button>
        <span class="line__price">${antes}${dinero(l.unit)}${desc}</span>
        <div class="line__qty">
          <button type="button" data-menos aria-label="Una menos de ${nombre}">${icono(minus)}</button>
          <input type="number" inputmode="numeric" min="1" value="${l.qty}" aria-label="Cantidad de ${nombre}" />
          <button type="button" data-mas aria-label="Una más de ${nombre}">${icono(plus)}</button>
        </div>
      `
      const input = li.querySelector('input') as HTMLInputElement
      li.querySelector('[data-menos]')!.addEventListener('click', () => setQty(l.key, l.qty - 1))
      li.querySelector('[data-mas]')!.addEventListener('click', () => setQty(l.key, l.qty + 1))
      li.querySelector('[data-quitar]')!.addEventListener('click', () => remove(l.key))
      input.addEventListener('change', () => setQty(l.key, Number(input.value)))
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

  try {
    const guardado = JSON.parse(localStorage.getItem(CLIENTE) ?? 'null') as Partial<DatosCliente> | null
    if (guardado) {
      campoNombre.value = guardado.nombre ?? ''
      campoWa.value = guardado.whatsapp ?? ''
      campoCiudad.value = guardado.ciudad ?? ''
    }
  } catch {
    localStorage.removeItem(CLIENTE)
  }

  const guardarCliente = () => {
    try {
      localStorage.setItem(CLIENTE, JSON.stringify({ nombre: campoNombre.value.trim(), whatsapp: campoWa.value.trim(), ciudad: campoCiudad.value.trim() }))
    } catch {
      return
    }
  }

  ;[campoNombre, campoWa, campoCiudad].forEach((c) =>
    c.addEventListener('input', () => {
      c.removeAttribute('aria-invalid')
      errorDatos.hidden = true
      guardarCliente()
    }),
  )

  const leerCliente = (): DatosCliente | null => {
    const nombre = campoNombre.value.trim()
    const whatsapp = campoWa.value.trim()
    const digitos = whatsapp.replace(/\D/g, '')
    const ciudad = campoCiudad.value.trim()
    const fallas: [HTMLInputElement, string][] = []
    if (nombre.length < 2) fallas.push([campoNombre, 'Escribe tu nombre y apellido'])
    const valido = (digitos.length === 9 && digitos.startsWith('9')) || (digitos.length >= 10 && digitos.length <= 15)
    if (!valido) fallas.push([campoWa, 'Escribe tu WhatsApp con 9 dígitos, por ejemplo 987 654 321'])
    if (ciudad.length < 2) fallas.push([campoCiudad, 'Escribe tu ciudad o distrito'])
    ;[campoNombre, campoWa, campoCiudad].forEach((c) => c.removeAttribute('aria-invalid'))
    if (fallas.length) {
      fallas.forEach(([c]) => c.setAttribute('aria-invalid', 'true'))
      errorDatos.textContent = fallas[0]![1]
      errorDatos.hidden = false
      fallas[0]![0].focus()
      fallas[0]![0].scrollIntoView({ block: 'center', behavior: reduce() ? 'auto' : 'smooth' })
      return null
    }
    errorDatos.hidden = true
    guardarCliente()
    return { nombre, whatsapp, ciudad }
  }

  const registrar = async (lineas: ReturnType<typeof resumen>['lineas'], evento: { tipo: string; fecha: string } | null, texto: string, cliente: DatosCliente) => {
    const huella = JSON.stringify([lineas.map((l) => [l.l.id, l.l.vi, l.l.op, l.l.dis, l.qty]), texto, evento, cliente])
    try {
      const previo = JSON.parse(localStorage.getItem(ULTIMO) ?? 'null') as { huella: string; codigo: string; url: string; hasta: number } | null
      if (previo && previo.huella === huella && previo.hasta > Date.now()) return { codigo: previo.codigo, url: previo.url }
    } catch {
      localStorage.removeItem(ULTIMO)
    }
    const res = await fetch('/api/pedido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: lineas.map((l) => ({ id: l.l.id, vi: l.l.vi, op: l.l.op, dis: l.l.dis, qty: l.qty })), nota: texto, evento, cliente }),
    })
    const datos = (await res.json().catch(() => ({}))) as { codigo?: string; ruta?: string; error?: string }
    if (res.status === 400) throw new Error(datos.error ?? 'Revisa tu pedido')
    if (!res.ok || !datos.codigo || !datos.ruta) return null
    const pedido = { codigo: datos.codigo, url: `${location.origin}${datos.ruta}` }
    try {
      localStorage.setItem(ULTIMO, JSON.stringify({ huella, ...pedido, hasta: Date.now() + 6 * 3600 * 1000 }))
    } catch {
      return pedido
    }
    return pedido
  }

  send.addEventListener('click', async () => {
    const r = resumen()
    if (!r.piezas || send.getAttribute('aria-busy') === 'true') return
    if (toggle.checked && !fecha.value) {
      fecha.setCustomValidity('Elige la fecha de tu evento')
      fecha.reportValidity()
      return
    }
    const cliente = leerCliente()
    if (!cliente) return
    const evento = toggle.checked ? { tipo: tipo.value, fecha: fecha.value } : null
    const ventana = window.open('', '_blank')
    send.setAttribute('aria-busy', 'true')
    send.disabled = true
    const etiqueta = send.lastChild
    const textoOriginal = etiqueta?.textContent ?? ''
    if (etiqueta) etiqueta.textContent = ' Preparando tu pedido…'
    let pedido: { codigo: string; url: string } | null = null
    try {
      pedido = await registrar(r.lineas, evento, nota.value, cliente)
    } catch (e) {
      ventana?.close()
      toast((e as Error).message)
      return
    } finally {
      send.removeAttribute('aria-busy')
      send.disabled = resumen().piezas === 0
      if (etiqueta) etiqueta.textContent = textoOriginal
    }
    const url = urlWhatsapp(r.lineas, { evento, nota: nota.value, pedido, cliente })
    if (ventana) {
      ventana.opener = null
      ventana.location.href = url
    } else {
      window.location.href = url
    }
    if (pedido) toast(`Pedido ${pedido.codigo} registrado. Guarda tu link de seguimiento.`)
  })

  onChange(pintar)
  pintar()
}
