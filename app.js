(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const eur = (n) => n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const P = CONFIG.precios;

  // Completa los datos que se pueden deducir de las competiciones
  const lum = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((v) => v / 255);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ink = (bg, pref) => (Math.abs(lum(pref) - lum(bg)) > 0.4 ? pref : lum(bg) > 0.55 ? "#111111" : "#ffffff");
  const KIT_NAMES = ["1ª equipación", "2ª equipación", "3ª equipación"];

  // 2ª y 3ª equipación: las reales si están en config.js, si no se generan con los colores del club
  const far = (a, b) => Math.abs(lum(a) - lum(b)) > 0.25 || a.toLowerCase() !== b.toLowerCase() && Math.abs(lum(a) - lum(b)) > 0.12 && hueGap(a, b);
  const hueGap = (a, b) => {
    const h = (hex) => { const n = parseInt(hex.slice(1), 16); const r = n >> 16, g = (n >> 8) & 255, bl = n & 255; const mx = Math.max(r, g, bl), mn = Math.min(r, g, bl);
      if (mx === mn) return -1; let x = mx === r ? (g - bl) / (mx - mn) : mx === g ? 2 + (bl - r) / (mx - mn) : 4 + (r - g) / (mx - mn); return ((x * 60) + 360) % 360; };
    const ha = h(a), hb = h(b); if (ha < 0 || hb < 0) return false; const d = Math.abs(ha - hb); return Math.min(d, 360 - d) > 40;
  };
  function autoKits(t) {
    const real = t.equipaciones || [];
    const all = [...t.colors, t.trim];
    const dark = all.find((c) => lum(c) < 0.45) || "#1b2a4a";
    const light = lum(t.colors[0]) > 0.6;
    const away = light
      ? { pattern: "solid", colors: [dark], sleeves: null, trim: t.colors[0], text: ink(dark, t.colors[0]) }
      : { pattern: "solid", colors: ["#ffffff"], sleeves: null, trim: t.colors[0], text: ink("#ffffff", t.colors[0]) };
    const awayBody = ((real[1] && real[1].colors) || away.colors)[0];
    const candidates = [t.trim, ...t.colors, "#ffffff", "#1d1f24", "#c9c6c0", "#1f3d6b", "#7a1f2b"];
    const thirdBody = candidates.find((c) => far(c, t.colors[0]) && far(c, awayBody)) || "#c9c6c0";
    const thirdTrim = far(t.colors[0], thirdBody) ? t.colors[0] : ink(thirdBody, "#ffffff");
    const third = { pattern: "solid", colors: [thirdBody], sleeves: null, trim: thirdTrim, text: ink(thirdBody, thirdTrim) };
    return [{}, away, third];
  }

  TEAMS.forEach((t) => {
    const auto = autoKits(t);
    t.kits = KIT_NAMES.map((name, k) => {
      const o = (t.equipaciones || [])[k] || {};
      const kit = { ...t, ...auto[k], ...o };
      kit.kit = o.nombre ? `${name} · ${o.nombre}` : name;
      kit.photoId = k ? `${t.id}-${k + 1}` : t.id;
      if (kit.stars && !o.starColor && k) kit.starColor = kit.trim;
      return kit;
    });
    t.kit = t.kits[0].kit;
    t.cat = t.comps.map((c) => COMPS[c]).join(" · ");
    t.parches = t.parches || [...new Set(t.comps.map((c) => PARCHE_DE_COMPETICION[c]).filter(Boolean))];
  });

  // ---------------------------------------------------------
  //  Dibujo de camisetas en SVG
  // ---------------------------------------------------------
  const SHIRT = "M70 12 Q100 30 130 12 L150 16 L192 46 L174 86 L152 76 L152 212 Q100 218 48 212 L48 76 L26 86 L8 46 L50 16 Z";
  const SLEEVE_L = "M50 16 L8 46 L26 86 L48 76 Z";
  const SLEEVE_R = "M150 16 L192 46 L174 86 L152 76 Z";
  const CUFF_L = "M8 46 L26 86 L32 83 L14 43 Z";
  const CUFF_R = "M192 46 L174 86 L168 83 L186 43 Z";
  let uid = 0;

  function star(cx, cy, r, color) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const rr = i % 2 ? r * 0.45 : r;
      pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
    }
    return `<polygon points="${pts.join(" ")}" fill="${color}"/>`;
  }

  function bodyPattern(t, id) {
    const [c1, c2, c3] = t.colors;
    if (t.pattern === "stripes") {
      const w = 17;
      let out = `<rect width="200" height="220" fill="${c1}"/>`;
      for (let x = 100 - w / 2 - w * 6, i = 0; x < 200; x += w, i++) {
        if (i % 2) out += `<rect x="${x}" y="0" width="${w}" height="220" fill="${c2}"/>`;
      }
      return out;
    }
    if (t.pattern === "hoops") {
      let out = `<rect width="200" height="220" fill="${c1}"/>`;
      for (let y = 30; y < 222; y += 32) out += `<rect x="0" y="${y}" width="200" height="16" fill="${c2}"/>`;
      return out;
    }
    if (t.pattern === "halves") {
      return `<rect width="200" height="220" fill="${c1}"/><rect x="100" y="0" width="100" height="220" fill="${c2}"/>`;
    }
    if (t.pattern === "sash") {
      return `<rect width="200" height="220" fill="${c1}"/><path d="M40 0 L80 0 L180 180 L180 230 L150 230 Z" fill="${c2}"/>`;
    }
    if (t.pattern === "pinstripes") {
      let out = `<rect width="200" height="220" fill="${c1}"/>`;
      for (let x = 6; x < 200; x += 12) out += `<rect x="${x}" y="0" width="2.2" height="220" fill="${c2}"/>`;
      return out;
    }
    if (t.pattern === "fade") {
      return `<linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset=".25" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
        <rect width="200" height="220" fill="url(#${id}f)"/>`;
    }
    if (t.pattern === "checks") {
      let out = `<rect width="200" height="220" fill="${c1}"/>`;
      const q = 16;
      for (let y = 0, r = 0; y < 222; y += q, r++)
        for (let x = 4, k = 0; x < 200; x += q, k++) if ((r + k) % 2) out += `<rect x="${x}" y="${y}" width="${q}" height="${q}" fill="${c2}"/>`;
      return out;
    }
    if (t.pattern === "diagonal") {
      return `<rect width="200" height="220" fill="${c2}"/><path d="M0 0 L200 0 L0 220 Z" fill="${c1}"/>`;
    }
    if (t.pattern === "hband") {
      return `<rect width="200" height="220" fill="${c1}"/><rect x="0" y="78" width="200" height="34" fill="${c2}"/>`;
    }
    if (t.pattern === "band") {
      return `<rect width="200" height="220" fill="${c1}"/>
        <rect x="77" y="0" width="46" height="220" fill="${c3 || "#fff"}"/>
        <rect x="82" y="0" width="36" height="220" fill="${c2}"/>`;
    }
    return `<rect width="200" height="220" fill="${c1}"/>`;
  }

  function shirtSVG(t, opts = {}) {
    const side = opts.side || "front";
    const id = `s${++uid}`;
    const sleeves = t.sleeves
      ? `<path d="${SLEEVE_L}" fill="${t.sleeves}"/><path d="${SLEEVE_R}" fill="${t.sleeves}"/>`
      : "";
    const collar = side === "front"
      ? `<path d="M70 12 Q100 30 130 12 Q100 42 70 12 Z" fill="${t.trim}"/>`
      : `<path d="M70 12 Q100 22 130 12 Q100 30 70 12 Z" fill="${t.trim}"/>`;

    let front = "";
    if (side === "front") {
      // Escudo genérico + estrellas
      const sx = 124, sy = 62;
      front += `<path d="M${sx - 9} ${sy - 9} h18 v9 q0 10 -9 14 q-9 -4 -9 -14 Z" fill="${t.trim}" stroke="rgba(0,0,0,.25)" stroke-width=".8"/>`;
      if (t.stars) {
        const gap = 7.5;
        const start = sx - ((t.stars - 1) * gap) / 2;
        for (let i = 0; i < t.stars; i++) front += star(start + i * gap, sy - 16, 3.4, t.starColor || t.trim);
      }
      // Marca genérica
      front += `<path d="M70 58 q6 4 14 -4" stroke="${t.trim}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    } else {
      const name = (opts.player || "").toUpperCase();
      const num = opts.number ?? "";
      const fs = name.length > 9 ? 13 : 16;
      front += `<g fill="${t.text}" font-family="Oswald, Impact, sans-serif" font-weight="700" text-anchor="middle" paint-order="stroke" stroke="rgba(0,0,0,.18)" stroke-width="1">
        <text x="100" y="66" font-size="${fs}" letter-spacing="1.5">${esc(name)}</text>
        <text x="100" y="${name ? 150 : 140}" font-size="70">${esc(num)}</text>
      </g>`;
    }

    return `<svg viewBox="0 0 200 222" class="shirt" role="img" aria-label="Camiseta ${esc(t.name)} ${esc(t.kit)}">
      <defs>
        <clipPath id="${id}c"><path d="${SHIRT}"/></clipPath>
        <linearGradient id="${id}g" x1="0" x2="1">
          <stop offset="0" stop-color="#000" stop-opacity=".18"/>
          <stop offset=".25" stop-color="#fff" stop-opacity=".08"/>
          <stop offset=".6" stop-color="#000" stop-opacity="0"/>
          <stop offset="1" stop-color="#000" stop-opacity=".2"/>
        </linearGradient>
      </defs>
      <g clip-path="url(#${id}c)">
        ${bodyPattern(t, id)}
        ${sleeves}
        <path d="${CUFF_L}" fill="${t.trim}"/><path d="${CUFF_R}" fill="${t.trim}"/>
        <path d="M48 76 L50 16 M152 76 L150 16" stroke="rgba(0,0,0,.15)" stroke-width="1.2" fill="none"/>
        <rect width="200" height="222" fill="url(#${id}g)"/>
      </g>
      ${collar}
      ${front}
      <path d="${SHIRT}" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="1.2" stroke-linejoin="round"/>
    </svg>`;
  }

  // Dibujo de un parche (o la foto img/parches/<id>.jpg si existe)
  function patchSVG(id) {
    const p = PARCHES[id];
    const shape = p.forma === "circulo"
      ? `<circle cx="50" cy="50" r="44" fill="${p.fondo}" stroke="${p.borde}" stroke-width="6"/>`
      : `<path d="M10 8 H90 V52 Q90 82 50 94 Q10 82 10 52 Z" fill="${p.fondo}" stroke="${p.borde}" stroke-width="6" stroke-linejoin="round"/>`;
    const fs1 = p.linea1.length > 8 ? 11 : 14;
    const fs2 = p.linea2.length > 8 ? 9 : 12;
    return `<svg viewBox="0 0 100 100" class="patch-svg" role="img" aria-label="Parche ${esc(p.nombre)}">
      ${shape}
      <g fill="${p.texto}" font-family="Oswald, Impact, sans-serif" font-weight="700" text-anchor="middle">
        <text x="50" y="${p.linea2 ? 48 : 56}" font-size="${fs1}">${esc(p.linea1)}</text>
        ${p.linea2 ? `<text x="50" y="64" font-size="${fs2}">${esc(p.linea2)}</text>` : ""}
      </g>
      <path d="M38 24 l3 6 6 1 -4.5 4 1 6 -5.5 -3 -5.5 3 1 -6 -4.5 -4 6 -1 Z" fill="${p.borde}" transform="translate(12 -4)"/>
    </svg>`;
  }
  function patchVisual(id) {
    return `<span class="shirt-visual">${patchSVG(id)}<img src="img/parches/${esc(id)}.jpg" alt="Parche ${esc(PARCHES[id].nombre)}"
      onload="this.parentNode.classList.add('has-photo')" onerror="this.remove()"></span>`;
  }

  // Si existe img/<id>.jpg se muestra la foto; si no, el dibujo con los colores del equipo
  const noPhoto = new Set();
  function shirtVisual(t, opts) {
    const svg = shirtSVG(t, opts);
    const pid = t.photoId || t.id;
    if (noPhoto.has(pid) || (opts && opts.side === "back")) return svg;
    return `<span class="shirt-visual">${svg}<img src="img/${esc(pid)}.jpg" alt="Camiseta ${esc(t.name)} ${esc(t.kit)}" loading="lazy"
      onload="this.parentNode.classList.add('has-photo')" onerror="window.__noPhoto('${esc(pid)}');this.remove()"></span>`;
  }
  window.__noPhoto = (id) => noPhoto.add(id);

  // ---------------------------------------------------------
  //  Catálogo
  // ---------------------------------------------------------
  const CATS = [...Object.keys(COMPS), "todos"];
  let currentCat = CATS[0];
  const catLabel = (c) => (c === "todos" ? "Todos" : COMPS[c]);

  function renderTabs() {
    $("#tabs").innerHTML = CATS.map(
      (c) => `<button class="${c === currentCat ? "active" : ""}" data-cat="${c}">${catLabel(c)} <small>${c === "todos" ? TEAMS.length : TEAMS.filter((t) => t.comps.includes(c)).length}</small></button>`
    ).join("");
  }

  function renderGrid() {
    const q = $("#search").value.trim().toLowerCase();
    const list = TEAMS.filter(
      (t) => (q || currentCat === "todos" || t.comps.includes(currentCat)) &&
        (!q || `${t.name} ${t.kit}`.toLowerCase().includes(q))
    );
    $("#grid").innerHTML = list.length
      ? list.map((t) => `
        <article class="card">
          <div class="card-img">${shirtVisual(t.kits[0])}${t.stars ? `<span class="badge">${"★".repeat(t.stars)}</span>` : ""}</div>
          <div class="card-body">
            <p class="eyebrow">${esc(t.cat)} · 26/27</p>
            <h3>${esc(t.name)}</h3>
            <p class="muted kit-dots">${t.kits.map((k) => `<i style="background:${k.colors[0]};border-color:${k.trim}"></i>`).join("")} 1ª, 2ª y 3ª equipación</p>
            <div class="card-foot">
              <span class="price">desde <b>${eur(P.fan)}</b></span>
              <button class="btn btn-primary btn-sm" data-open="${t.id}">Personalizar</button>
            </div>
          </div>
        </article>`).join("")
      : `<div class="empty"><p>No tenemos «${esc(q)}» en el catálogo.</p><button class="btn btn-primary" data-ask="${esc(q)}">Preguntar si la tenéis</button></div>`;
  }

  $("#tabs").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-cat]");
    if (!b) return;
    currentCat = b.dataset.cat;
    renderTabs();
    renderGrid();
  });
  $("#search").addEventListener("input", renderGrid);
  $("#grid").addEventListener("click", (e) => {
    const b = e.target.closest("[data-open]");
    if (b) openProduct(b.dataset.open);
  });

  // ---------------------------------------------------------
  //  Modal de producto
  // ---------------------------------------------------------
  const modal = $("#productModal");
  let sel = null;

  const isKid = (fit) => fit === "Niño" || fit === "Niña";

  function unitPrice(o) {
    let p = o.version === "jugador" ? P.jugador : P.fan;
    if (isKid(o.fit)) p -= P.ninoDescuento;
    if (o.player || o.number !== "") p += P.personalizacion;
    p += (o.patches || []).length * P.parche;
    return p;
  }

  function chips(container, items, value, name) {
    container.innerHTML = items.map(
      (it) => `<label class="chip"><input type="radio" name="${name}" value="${esc(it.value)}" ${it.value === value ? "checked" : ""}><span>${esc(it.label)}</span></label>`
    ).join("");
  }

  function openProduct(id) {
    const t = TEAMS.find((x) => x.id === id);
    sel = { team: t, version: "fan", fit: "Hombre", size: "M", player: "", number: "", patches: [], qty: 1, side: "front", kit: 0 };
    $("#mCat").textContent = `${t.cat} · Temporada 26/27`;
    $("#mName").textContent = t.name;
    $("#mKits").innerHTML = t.kits.map((k, i) => `
      <label class="kit-opt">
        <input type="radio" name="kit" value="${i}" ${i === 0 ? "checked" : ""}>
        <span class="kit-card">${shirtSVG(k)}<small>${esc(k.kit.replace(" equipación", ""))}</small></span>
      </label>`).join("");
    chips($("#mVersion"), [
      { value: "fan", label: `Aficionado · ${eur(P.fan)}` },
      { value: "jugador", label: `Jugador · ${eur(P.jugador)}` },
    ], sel.version, "version");
    chips($("#mFit"), Object.keys(CONFIG.cortes).map((c) => ({ value: c, label: c })), sel.fit, "fit");
    renderSizes();
    $("#mPersPrice").textContent = P.personalizacion ? `(+${eur(P.personalizacion)})` : "(incluida)";
    $("#mPatchPrice").textContent = P.parche ? `(+${eur(P.parche)} cada uno)` : "(incluidos)";
    $("#mPatches").innerHTML = t.parches.map((id) => `
      <label class="patch-opt">
        <input type="checkbox" name="patch" value="${id}">
        <span class="patch-card">${patchVisual(id)}<small>${esc(PARCHES[id].nombre)}</small></span>
      </label>`).join("");
    $("#mPlayer").value = "";
    $("#mNumber").value = "";
    setSide("front");
    updateModal();
    modal.showModal();
  }

  function renderSizes() {
    const sizes = CONFIG.cortes[sel.fit];
    if (!sizes.includes(sel.size)) sel.size = sizes.includes("M") ? "M" : sizes[Math.floor(sizes.length / 2)];
    chips($("#mSize"), sizes.map((s) => ({ value: s, label: s })), sel.size, "size");
  }

  function setSide(side) {
    sel.side = side;
    $$(".flip button").forEach((b) => b.classList.toggle("active", b.dataset.side === side));
  }

  function updateModal() {
    $("#mKit").textContent = sel.team.kits[sel.kit].kit;
    $("#previewShirt").innerHTML = shirtVisual(sel.team.kits[sel.kit], { side: sel.side, player: sel.player, number: sel.number });
    $("#mQty").textContent = sel.qty;
    $("#mPrice").textContent = eur(unitPrice(sel) * sel.qty);
  }

  $("#productForm").addEventListener("change", (e) => {
    if (e.target.name === "kit") { sel.kit = Number(e.target.value); setSide("front"); }
    if (e.target.name === "version") sel.version = e.target.value;
    if (e.target.name === "fit") { sel.fit = e.target.value; renderSizes(); }
    if (e.target.name === "size") sel.size = e.target.value;
    if (e.target.name === "patch") sel.patches = $$('#mPatches input:checked').map((i) => i.value);
    updateModal();
  });
  $("#mPlayer").addEventListener("input", (e) => {
    sel.player = e.target.value.replace(/[<>]/g, "").toUpperCase();
    e.target.value = sel.player;
    setSide("back");
    updateModal();
  });
  $("#mNumber").addEventListener("input", (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    e.target.value = v;
    sel.number = v;
    setSide("back");
    updateModal();
  });
  $(".flip").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-side]");
    if (!b) return;
    setSide(b.dataset.side);
    updateModal();
  });
  $("#qtyMinus").addEventListener("click", () => { sel.qty = Math.max(1, sel.qty - 1); updateModal(); });
  $("#qtyPlus").addEventListener("click", () => { sel.qty = Math.min(20, sel.qty + 1); updateModal(); });

  $("#productForm").addEventListener("submit", (e) => {
    if (e.submitter && e.submitter.value === "add") {
      cart.push({
        id: sel.team.id, kit: sel.kit, version: sel.version, fit: sel.fit, size: sel.size,
        player: sel.player, number: sel.number, patches: sel.patches, qty: sel.qty,
      });
      saveCart();
      renderCart();
      toast(`${sel.team.name} añadida al pedido`);
    }
  });
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

  // ---------------------------------------------------------
  //  Carrito
  // ---------------------------------------------------------
  const isKidSize = (size) => /años/.test(size);
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("camiszone-cart") || "[]").filter((i) => TEAMS.some((t) => t.id === i.id)).map((i) => ({ fit: isKidSize(i.size) ? "Niño" : "Hombre", ...i, kit: Number(i.kit) || 0, patches: (i.patches || []).filter((id) => PARCHES[id]) })); } catch { cart = []; }
  function saveCart() { try { localStorage.setItem("camiszone-cart", JSON.stringify(cart)); } catch {} }

  const teamOf = (i) => TEAMS.find((t) => t.id === i.id);
  const lineTotal = (i) => unitPrice(i) * i.qty;
  const total = () => cart.reduce((s, i) => s + lineTotal(i), 0);

  function describe(i) {
    const parts = [i.version === "jugador" ? "Versión jugador" : "Versión aficionado", i.fit, `Talla ${i.size}`];
    if (i.player || i.number !== "") parts.push(`${i.player || "—"} ${i.number !== "" ? "#" + i.number : ""}`.trim());
    if (i.patches.length) parts.push(`Parches: ${i.patches.map((id) => PARCHES[id].nombre).join(", ")}`);
    return parts;
  }

  function renderCart() {
    $("#cartCount").textContent = cart.reduce((s, i) => s + i.qty, 0);
    $("#cartTotal").textContent = eur(total());
    $("#cartItems").innerHTML = cart.length
      ? cart.map((i, idx) => {
        const t = teamOf(i);
        return `<div class="line">
          <div class="line-img">${shirtVisual(t.kits[i.kit])}</div>
          <div class="line-info">
            <b>${esc(t.name)}</b> <span class="muted">${esc(t.kits[i.kit].kit)}</span>
            <small>${describe(i).map(esc).join(" · ")}</small>
            <small>${i.qty} × ${eur(unitPrice(i))}</small>
          </div>
          <div class="line-end">
            <b>${eur(lineTotal(i))}</b>
            <button class="link" data-remove="${idx}">Quitar</button>
          </div>
        </div>`;
      }).join("")
      : `<p class="empty">Tu pedido está vacío.<br>Elige una camiseta del catálogo.</p>`;
    $("#orderForm").hidden = !cart.length;
  }

  $("#cartItems").addEventListener("click", (e) => {
    const b = e.target.closest("[data-remove]");
    if (!b) return;
    cart.splice(Number(b.dataset.remove), 1);
    saveCart();
    renderCart();
  });

  const drawer = $("#drawer");
  function openCart() { drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); $("#backdrop").classList.add("show"); }
  function closeCart() { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); $("#backdrop").classList.remove("show"); }
  $("#openCart").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  $("#backdrop").addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

  function newOrderId() {
    const d = new Date();
    const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    return `CZ-${ymd}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }

  function orderPayload(data) {
    return {
      pedido: newOrderId(),
      fecha: new Date().toLocaleString("es-ES"),
      cliente: {
        nombre: data.get("nombre").trim(),
        telefono: data.get("telefono").trim(),
        email: data.get("email").trim(),
        direccion: data.get("direccion").trim(),
        notas: data.get("notas").trim(),
      },
      camisetas: cart.map((i) => {
        const t = teamOf(i);
        return {
          equipo: t.name,
          equipacion: `${t.kits[i.kit].kit} 26/27`,
          version: i.version === "jugador" ? "Jugador" : "Aficionado",
          corte: i.fit,
          talla: i.size,
          nombre: i.player,
          dorsal: i.number,
          parche: i.patches.length ? i.patches.map((id) => PARCHES[id].nombre).join(", ") : "No",
          cantidad: i.qty,
          precioUnidad: unitPrice(i),
          subtotal: lineTotal(i),
        };
      }),
      total: total(),
    };
  }

  function showConfirmation(order) {
    $("#orderForm").hidden = true;
    $("#cartItems").innerHTML = `<div class="confirm">
      <div class="confirm-icon">✓</div>
      <h3>¡Pedido recibido!</h3>
      <p>Tu número de pedido es <b>${esc(order.pedido)}</b>.</p>
      <p class="muted">Te contactaremos al ${esc(order.cliente.telefono)} para confirmar el pago y la entrega.</p>
      <ul>${order.camisetas.map((c) => `<li>${c.cantidad} × ${esc(c.equipo)} · ${esc(c.version)} · ${esc(c.corte)} ${esc(c.talla)}${c.nombre || c.dorsal ? ` · ${esc(c.nombre)} ${esc(c.dorsal)}` : ""}</li>`).join("")}</ul>
      <p>Total: <b>${eur(order.total)}</b></p>
    </div>`;
    $("#cartTotal").textContent = eur(order.total);
  }

  $("#orderForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!cart.length) return;
    if (!CONFIG.pedidosUrl) {
      toast("La tienda aún no tiene configurada la recepción de pedidos.");
      return;
    }
    const order = orderPayload(new FormData(e.target));
    const btn = $("#sendOrder");
    btn.disabled = true;
    btn.textContent = "Enviando…";
    try {
      // Apps Script no devuelve cabeceras CORS: se envía como texto y sin leer la respuesta
      await fetch(CONFIG.pedidosUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(order),
      });
      cart = [];
      saveCart();
      $("#cartCount").textContent = 0;
      e.target.reset();
      showConfirmation(order);
    } catch {
      toast("No se pudo enviar el pedido. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Enviar pedido";
    }
  });

  // ---------------------------------------------------------
  //  Varios
  // ---------------------------------------------------------
  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  // ---------------------------------------------------------
  //  Consultas de disponibilidad
  // ---------------------------------------------------------
  const askModal = $("#askModal");
  document.addEventListener("click", (e) => {
    const open = e.target.closest("[data-ask]");
    if (open) {
      $("#askForm").reset();
      $("#askFields").hidden = false;
      $("#askDone").hidden = true;
      $("#askTeam").value = open.dataset.ask || "";
      askModal.showModal();
    }
    if (e.target.closest("[data-close-ask]") || e.target === askModal) askModal.close();
  });

  $("#askForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!CONFIG.pedidosUrl) {
      toast("La tienda aún no tiene configurada la recepción de consultas.");
      return;
    }
    const d = new FormData(e.target);
    const consulta = { tipo: "consulta", fecha: new Date().toLocaleString("es-ES") };
    ["nombre", "contacto", "equipo", "equipacion", "corte", "talla", "mensaje"].forEach((k) => (consulta[k] = String(d.get(k) || "").trim()));
    const btn = $("#sendAsk");
    btn.disabled = true;
    btn.textContent = "Enviando…";
    try {
      await fetch(CONFIG.pedidosUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(consulta),
      });
      $("#askFields").hidden = true;
      $("#askDone").hidden = false;
    } catch {
      toast("No se pudo enviar la consulta. Inténtalo de nuevo.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Enviar consulta";
    }
  });

  $("#heroShirts").innerHTML = ["barcelona", "real-madrid", "espana"]
    .map((id) => `<div class="hero-shirt">${shirtVisual(TEAMS.find((t) => t.id === id).kits[0])}</div>`).join("");
  $("#year").textContent = new Date().getFullYear();

  renderTabs();
  renderGrid();
  renderCart();
})();
