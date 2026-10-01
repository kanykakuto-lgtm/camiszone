# CamisZone

Web para recibir pedidos de camisetas de fútbol de la temporada 26/27.

Abre `index.html` en el navegador (o súbela a GitHub Pages, Netlify, etc.). No necesita servidor.

## Cómo funciona

1. El cliente elige camiseta, versión (aficionado/jugador), si es para hombre, mujer, niño o niña, talla, nombre, dorsal y parche.
2. Lo añade a su pedido, rellena sus datos y pulsa **Enviar pedido**.
3. El pedido se guarda en **tu hoja de Google Sheets** (una fila por camiseta, con todos los detalles)
   y te llega un **email** con el pedido en una tabla. El cliente ve su número de pedido.

## Recibir los pedidos (Google Sheets) — 5 minutos, una sola vez

1. Entra en [sheets.new](https://sheets.new) con tu cuenta de Google y ponle nombre, por ejemplo «Pedidos CamisZone».
2. Menú **Extensiones → Apps Script**.
3. Borra lo que haya, pega todo el contenido de `google-apps-script.gs` y cambia
   `EMAIL_AVISO` por tu email. Guarda (icono del disquete).
4. Arriba a la derecha: **Implementar → Nueva implementación**.
   - Tipo (rueda dentada): **Aplicación web**.
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier usuario**.
   - Pulsa **Implementar** y acepta los permisos (Google avisará de que la app no está verificada:
     *Configuración avanzada → Ir a … (no seguro)*; es tu propio script).
5. Copia la **URL de la aplicación web** (acaba en `/exec`) y pégala en `config.js`:

```js
pedidosUrl: "https://script.google.com/macros/s/XXXXXXXX/exec",
```

Listo. Haz un pedido de prueba y verás aparecer la pestaña **Pedidos** en tu hoja con columnas:
Fecha, Nº pedido, Cliente, Teléfono, Email, Dirección, Equipo, Equipación, Versión, Para, Talla,
Nombre, Dorsal, Parche, Cantidad, Precio/ud, Subtotal, Total pedido, Notas y Estado
(la columna Estado la puedes ir cambiando tú: Pendiente, Pagado, Enviado…).

> Si más adelante cambias el script, vuelve a **Implementar → Gestionar implementaciones → Editar →
> Nueva versión** para que se apliquen los cambios con la misma URL.

## Personalizar

Todo se edita en `config.js`:

- `pedidosUrl`: la dirección de tu Apps Script (ver arriba).
- `precios`: aficionado 20 €, jugador 25 €; nombre, dorsal y parche incluidos (0 €).
- `cortes`: tallas disponibles — hombre S a 4XL, mujer XS a 4XL, niño y niña de 1-2 a 13-14 años.
- `TEAMS`: lista de equipos. Puedes añadir, quitar o cambiar colores.

### Poner fotos reales

Las camisetas se muestran como ilustraciones con los colores de cada equipo.
Para usar una foto real, guárdala en `img/` y pon su ruta en el campo `foto` del equipo:

```js
{ id: "real-madrid", ..., foto: "img/real-madrid.jpg" }
```
