/**
 * CamisZone — recepción de pedidos en Google Sheets
 *
 * Pega este código en Extensiones → Apps Script de tu hoja de cálculo
 * y sigue los pasos del README ("Recibir los pedidos").
 *
 * - Cada camiseta de un pedido se guarda como una fila en la pestaña "Pedidos".
 * - Cada consulta ("¿tenéis esta camiseta?") se guarda en otra hoja de cálculo
 *   (o en la pestaña "Consultas" si no indicas ninguna).
 * - Te llega un email de aviso por cada pedido y cada consulta.
 *
 * Tu email solo está aquí, en el script: la web nunca lo muestra.
 */

// Los avisos llegan al email de la cuenta de Google donde instales este script.
// Solo si quieres recibirlos en otro correo, escríbelo aquí (en el editor de Google,
// no en GitHub, para que nadie lo vea). Pon AVISOS = false para no recibir emails.
const EMAIL_AVISO = "";
const AVISOS = true;

function destinatario() {
  return EMAIL_AVISO || Session.getEffectiveUser().getEmail();
}

// ID de la hoja de cálculo de consultas (lo que va entre /d/ y /edit en su dirección).
// Déjalo vacío ("") para guardarlas en una pestaña "Consultas" de esta misma hoja.
const CONSULTAS_HOJA_ID = "";

const CABECERA_CONSULTAS = [
  "Fecha", "Nombre", "Contacto", "Equipo", "Camiseta", "Para", "Talla", "Detalles", "Respondida",
];

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
    if (p.tipo === "consulta") {
      guardarConsulta(p);
      return ContentService.createTextOutput(JSON.stringify({ ok: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
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
    if (AVISOS) enviarAviso(p);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function obtenerHoja(libro, nombre, cabecera) {
  libro = libro || SpreadsheetApp.getActiveSpreadsheet();
  nombre = nombre || "Pedidos";
  cabecera = cabecera || CABECERA;
  let hoja = libro.getSheetByName(nombre);
  if (!hoja) hoja = libro.insertSheet(nombre);
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(cabecera);
    hoja.getRange(1, 1, 1, cabecera.length)
      .setFontWeight("bold").setBackground("#111827").setFontColor("#ffffff");
    hoja.setFrozenRows(1);
  }
  return hoja;
}

function guardarConsulta(p) {
  const libro = CONSULTAS_HOJA_ID
    ? SpreadsheetApp.openById(CONSULTAS_HOJA_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  const hoja = obtenerHoja(libro, "Consultas", CABECERA_CONSULTAS);
  const fila = [p.fecha, p.nombre, p.contacto, p.equipo, p.equipacion, p.corte, p.talla, p.mensaje, "No"]
    .map((v) => String(v == null ? "" : v).slice(0, 500));
  const rango = hoja.getRange(hoja.getLastRow() + 1, 1, 1, fila.length);
  rango.setNumberFormat("@");
  rango.setValues([fila]);
  if (AVISOS) {
    const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    MailApp.sendEmail({
      to: destinatario(),
      subject: `Consulta: ${fila[3]} (${fila[4]}) · ${fila[1]}`,
      htmlBody: `<h2>Nueva consulta de disponibilidad</h2>
        <p><b>Equipo:</b> ${esc(fila[3])}<br><b>Camiseta:</b> ${esc(fila[4])}<br>
        <b>Para:</b> ${esc(fila[5])} · <b>Talla:</b> ${esc(fila[6]) || "—"}<br>
        <b>Detalles:</b> ${esc(fila[7]) || "—"}</p>
        <p><b>Nombre:</b> ${esc(fila[1])}<br><b>Contacto:</b> ${esc(fila[2])}</p>
        <p><a href="${libro.getUrl()}">Ver todas las consultas</a></p>`,
    });
  }
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
    to: destinatario(),
    subject: `Nuevo pedido ${p.pedido} · ${c.nombre} · ${euros(p.total)}`,
    htmlBody: html,
    replyTo: c.email || undefined,
  });
}
