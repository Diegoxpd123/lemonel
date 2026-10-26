# Lemonel

Tienda de joyas Lemonel (Astro + GSAP). Lee el catálogo de `lemonel-api` y arma el pedido que se envía por WhatsApp.

## Desarrollo local

```bash
npm install
npm run dev      # http://localhost:4321
```

Necesita la API corriendo. La dirección se define en `.env`:

```
API_URL=http://localhost:50002
```

## Cómo funciona

- Las páginas se generan en el servidor con los datos de la API (se guardan 15 segundos en memoria; si la API falla un momento, se muestra la última copia).
- El carrito y los favoritos viven en el navegador (`localStorage`).
- La clienta elige pieza, medida, color o letra. Todo viaja en el mensaje de WhatsApp con el código de cada pieza.
- Un producto se puede abrir directo con `/?producto=slug`.
- Los videos de la portada se cambian desde el panel (Ajustes → Video de inicio). Mientras no haya videos cargados, se usan los de muestra de `public/video`.

## Despliegue en Dokploy

Aplicación con el `Dockerfile` (puerto 4321). Variable de ejecución:

| Variable | Ejemplo |
| --- | --- |
| `API_URL` | `https://lemonel-api.tupaginazo.com` |

## Seguimiento de pedidos

- `/pedido/<token>`: página pública (SSR, `noindex`) con la cadena de estados del pedido. Consulta `GET /api/public/pedido/:token` de la API.
- `/api/pedido` (POST): proxy hacia `POST /api/public/pedidos`. El carrito lo usa al pulsar “Finalizar por WhatsApp” para crear el pedido y poner su número y su link en el mensaje. Si falla, el mensaje se envía igual, sin link.
