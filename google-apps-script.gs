/**
 * CamisZone — recepción de pedidos en Google Sheets
 *
 * Pega este código en Extensiones → Apps Script de tu hoja de cálculo
 * y sigue los pasos del README ("Recibir los pedidos").
 *
 * Cada camiseta del pedido se guarda como una fila en la pestaña "Pedidos"
 * y te llega un email con el pedido detallado.
 */

// Email donde quieres recibir el aviso de cada pedido ("" para no recibir email)
const EMAIL_AVISO = "tu-email@gmail.com";

const CABECERA = [
  "Fecha", "Nº pedido", "Cliente", "Teléfono", "Email", "Dirección",
  "Equipo", "Equipación", "Versión", "Para", "Talla", "Nombre", "Dorsal",
  "Parche", "Cantidad", "Precio/ud", "Subtotal", "Total pedido", "Notas", "Estado",
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const p = JSON.parse(e.postData.contents);
    const hoja = obtenerHoja();
    const c = p.cliente || {};
    const filas = (p.camisetas || []).map((cam) => [
      p.fecha, p.pedido, c.nombre, c.telefono, c.email, c.direccion,
      cam.equipo, cam.equipacion, cam.version, cam.corte, cam.talla,
      cam.nombre, cam.dorsal, cam.parche, cam.cantidad,
      cam.precioUnidad, cam.subtotal, p.total, c.notas, "Pendiente",
    ]);
    if (filas.length) {
      const inicio = hoja.getLastRow() + 1;
      const rango = hoja.getRange(inicio, 1, filas.length, CABECERA.length);
      // Columnas de texto (teléfono, talla, dorsal "08"…) para que Sheets no las transforme
      rango.setNumberFormat("@");
      hoja.getRange(inicio, 15, filas.length, 1).setNumberFormat("0");
      hoja.getRange(inicio, 16, filas.length, 3).setNumberFormat("#,##0.00 €");
      rango.setValues(filas);
    }
    if (EMAIL_AVISO) enviarAviso(p);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function obtenerHoja() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName("Pedidos");
  if (!hoja) hoja = libro.insertSheet("Pedidos");
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(CABECERA);
    hoja.getRange(1, 1, 1, CABECERA.length)
      .setFontWeight("bold").setBackground("#111827").setFontColor("#ffffff");
    hoja.setFrozenRows(1);
  }
  return hoja;
}

function enviarAviso(p) {
  const c = p.cliente || {};
  const euros = (n) => Number(n).toFixed(2).replace(".", ",") + " €";
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const td = 'style="border:1px solid #ddd;padding:6px 8px"';
  const filas = p.camisetas.map((cam) => `<tr>
      <td ${td}>${esc(cam.equipo)}<br><small>${esc(cam.equipacion)}</small></td>
      <td ${td}>${esc(cam.version)}</td><td ${td}>${esc(cam.corte)}</td><td ${td}>${esc(cam.talla)}</td>
      <td ${td}>${esc(cam.nombre) || "—"}</td><td ${td}>${esc(cam.dorsal) || "—"}</td>
      <td ${td}>${esc(cam.parche)}</td><td ${td}>${esc(cam.cantidad)}</td><td ${td}>${euros(cam.subtotal)}</td>
    </tr>`).join("");
  const html = `
    <h2>Nuevo pedido ${esc(p.pedido)}</h2>
    <p><b>Fecha:</b> ${esc(p.fecha)}<br>
       <b>Cliente:</b> ${esc(c.nombre)}<br>
       <b>Teléfono:</b> ${esc(c.telefono)}<br>
       ${c.email ? `<b>Email:</b> ${esc(c.email)}<br>` : ""}
       ${c.direccion ? `<b>Dirección:</b> ${esc(c.direccion)}<br>` : ""}
       ${c.notas ? `<b>Notas:</b> ${esc(c.notas)}` : ""}</p>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr style="background:#111827;color:#fff">
        <th ${td}>Camiseta</th><th ${td}>Versión</th><th ${td}>Para</th><th ${td}>Talla</th>
        <th ${td}>Nombre</th><th ${td}>Dorsal</th><th ${td}>Parche</th><th ${td}>Cant.</th><th ${td}>Subtotal</th>
      </tr>${filas}
    </table>
    <p style="font-size:18px"><b>Total: ${euros(p.total)}</b></p>
    <p><a href="${SpreadsheetApp.getActiveSpreadsheet().getUrl()}">Ver todos los pedidos</a></p>`;
  MailApp.sendEmail({
    to: EMAIL_AVISO,
    subject: `Nuevo pedido ${p.pedido} · ${c.nombre} · ${euros(p.total)}`,
    htmlBody: html,
    replyTo: c.email || undefined,
  });
}
