(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const eur = (n) => n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const P = CONFIG.precios;

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

  function bodyPattern(t) {
    const [c1, c2, c3] = t.colors;
    if (t.pattern === "stripes") {
      const w = 17;
      let out = `<rect width="200" height="220" fill="${c1}"/>`;
      for (let x = 100 - w / 2 - w * 6, i = 0; x < 200; x += w, i++) {
        if (i % 2) out += `<rect x="${x}" y="0" width="${w}" height="220" fill="${c2}"/>`;
      }
      return out;
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
        ${bodyPattern(t)}
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

  function shirtVisual(t, opts) {
    if (t.foto && (!opts || opts.side !== "back")) {
      return `<img src="${esc(t.foto)}" alt="Camiseta ${esc(t.name)} ${esc(t.kit)}" loading="lazy">`;
    }
    return shirtSVG(t, opts);
  }

  // ---------------------------------------------------------
  //  Catálogo
  // ---------------------------------------------------------
  const CATS = ["Todos", "LaLiga", "Selecciones", "Europa"];
  let currentCat = "Todos";

  function renderTabs() {
    $("#tabs").innerHTML = CATS.map(
      (c) => `<button class="${c === currentCat ? "active" : ""}" data-cat="${c}">${c}</button>`
    ).join("");
  }

  function renderGrid() {
    const q = $("#search").value.trim().toLowerCase();
    const list = TEAMS.filter(
      (t) => (currentCat === "Todos" || t.cat === currentCat) &&
        (!q || `${t.name} ${t.kit}`.toLowerCase().includes(q))
    );
    $("#grid").innerHTML = list.length
      ? list.map((t) => `
        <article class="card">
          <div class="card-img">${shirtVisual(t)}${t.stars ? `<span class="badge">${"★".repeat(t.stars)}</span>` : ""}</div>
          <div class="card-body">
            <p class="eyebrow">${esc(t.cat)} · 26/27</p>
            <h3>${esc(t.name)}</h3>
            <p class="muted">${esc(t.kit)}</p>
            <div class="card-foot">
              <span class="price">desde <b>${eur(P.fan)}</b></span>
              <button class="btn btn-primary btn-sm" data-open="${t.id}">Personalizar</button>
            </div>
          </div>
        </article>`).join("")
      : `<p class="empty">No hay camisetas que coincidan con «${esc(q)}».</p>`;
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

  const isKid = (size) => CONFIG.tallasNino.includes(size);

  function unitPrice(o) {
    let p = o.version === "jugador" ? P.jugador : P.fan;
    if (isKid(o.size)) p -= P.ninoDescuento;
    if (o.player || o.number !== "") p += P.personalizacion;
    if (o.patch) p += P.parche;
    return p;
  }

  function chips(container, items, value, name) {
    container.innerHTML = items.map(
      (it) => `<label class="chip"><input type="radio" name="${name}" value="${esc(it.value)}" ${it.value === value ? "checked" : ""}><span>${esc(it.label)}</span></label>`
    ).join("");
  }

  function openProduct(id) {
    const t = TEAMS.find((x) => x.id === id);
    sel = { team: t, version: "fan", size: "M", player: "", number: "", patch: false, qty: 1, side: "front" };
    $("#mCat").textContent = `${t.cat} · Temporada 26/27`;
    $("#mName").textContent = t.name;
    $("#mKit").textContent = t.kit;
    chips($("#mVersion"), [
      { value: "fan", label: `Aficionado · ${eur(P.fan)}` },
      { value: "jugador", label: `Jugador · ${eur(P.jugador)}` },
    ], sel.version, "version");
    chips($("#mSize"), [
      ...CONFIG.tallasAdulto.map((s) => ({ value: s, label: s })),
      ...CONFIG.tallasNino.map((s) => ({ value: s, label: `Niño ${s}` })),
    ], sel.size, "size");
    $("#mPersPrice").textContent = `(+${eur(P.personalizacion)})`;
    $("#mPatchLabel").textContent = `Parche ${t.patch || "de competición"} (+${eur(P.parche)})`;
    $("#mPlayer").value = "";
    $("#mNumber").value = "";
    $("#mPatch").checked = false;
    setSide("front");
    updateModal();
    modal.showModal();
  }

  function setSide(side) {
    sel.side = side;
    $$(".flip button").forEach((b) => b.classList.toggle("active", b.dataset.side === side));
  }

  function updateModal() {
    $("#previewShirt").innerHTML = shirtVisual(sel.team, { side: sel.side, player: sel.player, number: sel.number });
    $("#mQty").textContent = sel.qty;
    $("#mPrice").textContent = eur(unitPrice(sel) * sel.qty);
  }

  $("#productForm").addEventListener("change", (e) => {
    if (e.target.name === "version") sel.version = e.target.value;
    if (e.target.name === "size") sel.size = e.target.value;
    if (e.target.id === "mPatch") sel.patch = e.target.checked;
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
        id: sel.team.id, version: sel.version, size: sel.size,
        player: sel.player, number: sel.number, patch: sel.patch, qty: sel.qty,
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
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("camiszone-cart") || "[]").filter((i) => TEAMS.some((t) => t.id === i.id)); } catch { cart = []; }
  function saveCart() { try { localStorage.setItem("camiszone-cart", JSON.stringify(cart)); } catch {} }

  const teamOf = (i) => TEAMS.find((t) => t.id === i.id);
  const lineTotal = (i) => unitPrice(i) * i.qty;
  const total = () => cart.reduce((s, i) => s + lineTotal(i), 0);

  function describe(i) {
    const parts = [i.version === "jugador" ? "Versión jugador" : "Versión aficionado", `Talla ${i.size}`];
    if (i.player || i.number !== "") parts.push(`${i.player || "—"} ${i.number !== "" ? "#" + i.number : ""}`.trim());
    if (i.patch) parts.push("Con parche");
    return parts;
  }

  function renderCart() {
    $("#cartCount").textContent = cart.reduce((s, i) => s + i.qty, 0);
    $("#cartTotal").textContent = eur(total());
    $("#cartItems").innerHTML = cart.length
      ? cart.map((i, idx) => {
        const t = teamOf(i);
        return `<div class="line">
          <div class="line-img">${shirtVisual(t)}</div>
          <div class="line-info">
            <b>${esc(t.name)}</b> <span class="muted">${esc(t.kit)}</span>
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

  function orderText(data) {
    const lines = cart.map((i, n) => {
      const t = teamOf(i);
      return `${n + 1}) ${t.name} – ${t.kit} 26/27\n   ${describe(i).join(" · ")}\n   ${i.qty} × ${eur(unitPrice(i))} = ${eur(lineTotal(i))}`;
    });
    return [
      "¡Hola! Quiero hacer este pedido en CamisZone:",
      "",
      ...lines,
      "",
      `TOTAL: ${eur(total())}`,
      "",
      `Nombre: ${data.get("nombre")}`,
      `Teléfono: ${data.get("telefono")}`,
      data.get("direccion") ? `Dirección: ${data.get("direccion")}` : "",
      data.get("notas") ? `Notas: ${data.get("notas")}` : "",
    ].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n").trim();
  }

  $("#orderForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!cart.length) return;
    const text = orderText(new FormData(e.target));
    const via = e.submitter && e.submitter.dataset.via;
    const url = via === "email"
      ? `mailto:${CONFIG.email}?subject=${encodeURIComponent("Pedido CamisZone")}&body=${encodeURIComponent(text)}`
      : `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    toast("¡Pedido preparado! Envíalo para confirmarlo.");
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

  $("#heroShirts").innerHTML = ["barcelona", "real-madrid", "espana-roja"]
    .map((id) => `<div class="hero-shirt">${shirtVisual(TEAMS.find((t) => t.id === id))}</div>`).join("");
  $("#year").textContent = new Date().getFullYear();

  renderTabs();
  renderGrid();
  renderCart();
})();
