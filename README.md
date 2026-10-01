# CamisZone

Web para recibir pedidos de camisetas de fútbol de la temporada 26/27.

Abre `index.html` en el navegador (o súbela a GitHub Pages, Netlify, etc.). No necesita servidor.

## Cómo funciona

1. El cliente elige camiseta, versión (aficionado/jugador), talla, nombre, dorsal y parche.
2. Lo añade a su pedido y rellena sus datos.
3. Pulsa **Enviar por WhatsApp** (o email) y te llega el pedido ya redactado con el total.

## Personalizar

Todo se edita en `config.js`:

- `whatsapp`: tu número con prefijo, sin `+` (ej. `34612345678`).
- `email`: dónde recibir pedidos por correo.
- `precios`: precio aficionado, jugador, personalización, parche y descuento de niño.
- `TEAMS`: lista de equipos. Puedes añadir, quitar o cambiar colores.

### Poner fotos reales

Las camisetas se muestran como ilustraciones con los colores de cada equipo.
Para usar una foto real, guárdala en `img/` y pon su ruta en el campo `foto` del equipo:

```js
{ id: "real-madrid", ..., foto: "img/real-madrid.jpg" }
```
