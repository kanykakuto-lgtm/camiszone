// ============================================================
//  CONFIGURACIÓN DE LA TIENDA — edita aquí precios y contacto
// ============================================================
const CONFIG = {
  // Dirección de tu Google Apps Script (ver README → "Recibir los pedidos").
  // Cada pedido se guarda en tu hoja de Google Sheets y te llega un email.
  pedidosUrl: "",

  precios: {
    fan: 20,            // Versión aficionado
    jugador: 25,        // Versión jugador
    personalizacion: 0, // Nombre + dorsal (0 = incluido)
    parche: 0,          // Parche de competición (0 = incluido)
    ninoDescuento: 0,   // Descuento tallas de niño/niña
  },

  // Corte de la camiseta y las tallas disponibles para cada uno
  cortes: {
    "Hombre": ["S", "M", "L", "XL", "XXL"],
    "Mujer": ["XS", "S", "M", "L", "XL"],
    "Niño": ["4 años", "6 años", "8 años", "10 años", "12 años", "14 años"],
    "Niña": ["4 años", "6 años", "8 años", "10 años", "12 años", "14 años"],
  },
};

// ============================================================
//  CATÁLOGO
//  pattern: "solid" | "stripes" | "band" | "sash"
//  colors:  colores del cuerpo (para rayas, se alternan)
//  sleeves: color de las mangas (opcional)
//  trim:    cuello y puños · text: color del nombre/dorsal
//  stars:   estrellas sobre el escudo
//  foto:    ruta a una foto real (ej. "img/real-madrid.jpg"); si está
//           vacía se muestra la ilustración con los colores del equipo
// ============================================================
const TEAMS = [
  // ---------- LaLiga ----------
  { id: "real-madrid", name: "Real Madrid", cat: "LaLiga", kit: "1ª equipación", pattern: "solid", colors: ["#ffffff"], trim: "#d4af37", text: "#1b2a4a", patch: "LaLiga / Champions", foto: "" },
  { id: "barcelona", name: "FC Barcelona", cat: "LaLiga", kit: "1ª equipación", pattern: "stripes", colors: ["#a50044", "#004d98"], trim: "#edbb00", text: "#edbb00", patch: "LaLiga / Champions", foto: "" },
  { id: "atletico", name: "Atlético de Madrid", cat: "LaLiga", kit: "1ª equipación", pattern: "stripes", colors: ["#cb3524", "#ffffff"], trim: "#272e61", text: "#272e61", patch: "LaLiga / Champions", foto: "" },
  { id: "athletic", name: "Athletic Club", cat: "LaLiga", kit: "1ª equipación", pattern: "stripes", colors: ["#ee2523", "#ffffff"], trim: "#111111", text: "#111111", patch: "LaLiga", foto: "" },
  { id: "real-sociedad", name: "Real Sociedad", cat: "LaLiga", kit: "1ª equipación", pattern: "stripes", colors: ["#0067b1", "#ffffff"], trim: "#0067b1", text: "#0b2a5b", patch: "LaLiga", foto: "" },
  { id: "betis", name: "Real Betis", cat: "LaLiga", kit: "1ª equipación", pattern: "stripes", colors: ["#00954c", "#ffffff"], trim: "#00954c", text: "#00562c", patch: "LaLiga", foto: "" },
  { id: "sevilla", name: "Sevilla FC", cat: "LaLiga", kit: "1ª equipación", pattern: "solid", colors: ["#ffffff"], trim: "#d2001f", text: "#d2001f", patch: "LaLiga", foto: "" },
  { id: "villarreal", name: "Villarreal CF", cat: "LaLiga", kit: "1ª equipación", pattern: "solid", colors: ["#ffe14d"], trim: "#005187", text: "#005187", patch: "LaLiga / Champions", foto: "" },
  { id: "valencia", name: "Valencia CF", cat: "LaLiga", kit: "1ª equipación", pattern: "solid", colors: ["#ffffff"], trim: "#111111", text: "#111111", patch: "LaLiga", foto: "" },

  // ---------- Selecciones ----------
  { id: "espana-roja", name: "España", cat: "Selecciones", kit: "1ª equipación · Roja", pattern: "solid", colors: ["#c60b1e"], trim: "#ffc400", text: "#ffc400", stars: 2, starColor: "#ffc400", patch: "Campeones del Mundo", foto: "" },
  { id: "espana-blanca", name: "España", cat: "Selecciones", kit: "2ª equipación · Blanca", pattern: "solid", colors: ["#ffffff"], trim: "#c60b1e", text: "#c60b1e", stars: 2, starColor: "#d4a017", patch: "Campeones del Mundo", foto: "" },
  { id: "argentina", name: "Argentina", cat: "Selecciones", kit: "1ª equipación", pattern: "stripes", colors: ["#75aadb", "#ffffff"], trim: "#111111", text: "#111111", stars: 3, starColor: "#d4a017", patch: "Campeones del Mundo", foto: "" },
  { id: "brasil", name: "Brasil", cat: "Selecciones", kit: "1ª equipación", pattern: "solid", colors: ["#ffdf00"], trim: "#009c3b", text: "#009c3b", stars: 5, starColor: "#009c3b", patch: "Campeones del Mundo", foto: "" },
  { id: "francia", name: "Francia", cat: "Selecciones", kit: "1ª equipación", pattern: "solid", colors: ["#1d2a5b"], trim: "#ffffff", text: "#ffffff", stars: 2, starColor: "#d4a017", patch: "Campeones del Mundo", foto: "" },
  { id: "portugal", name: "Portugal", cat: "Selecciones", kit: "1ª equipación", pattern: "solid", colors: ["#c8102e"], trim: "#046a38", text: "#ffd100", patch: "Nations League", foto: "" },

  // ---------- Europa ----------
  { id: "man-city", name: "Manchester City", cat: "Europa", kit: "1ª equipación", pattern: "solid", colors: ["#6cabdd"], trim: "#1c2c5b", text: "#ffffff", patch: "Premier / Champions", foto: "" },
  { id: "liverpool", name: "Liverpool", cat: "Europa", kit: "1ª equipación", pattern: "solid", colors: ["#c8102e"], trim: "#ffffff", text: "#ffffff", patch: "Premier / Champions", foto: "" },
  { id: "arsenal", name: "Arsenal", cat: "Europa", kit: "1ª equipación", pattern: "solid", colors: ["#ef0107"], sleeves: "#ffffff", trim: "#063672", text: "#ffffff", patch: "Premier / Champions", foto: "" },
  { id: "man-utd", name: "Manchester United", cat: "Europa", kit: "1ª equipación", pattern: "solid", colors: ["#da291c"], trim: "#111111", text: "#ffffff", patch: "Premier", foto: "" },
  { id: "chelsea", name: "Chelsea", cat: "Europa", kit: "1ª equipación", pattern: "solid", colors: ["#034694"], trim: "#ffffff", text: "#ffffff", patch: "Premier / Champions", foto: "" },
  { id: "psg", name: "Paris Saint-Germain", cat: "Europa", kit: "1ª equipación", pattern: "band", colors: ["#004170", "#da291c", "#ffffff"], trim: "#da291c", text: "#ffffff", patch: "Ligue 1 / Champions", foto: "" },
  { id: "bayern", name: "Bayern Múnich", cat: "Europa", kit: "1ª equipación", pattern: "solid", colors: ["#dc052d"], trim: "#ffffff", text: "#ffffff", patch: "Bundesliga / Champions", foto: "" },
  { id: "juventus", name: "Juventus", cat: "Europa", kit: "1ª equipación", pattern: "stripes", colors: ["#111111", "#ffffff"], trim: "#111111", text: "#111111", patch: "Serie A / Champions", foto: "" },
  { id: "inter", name: "Inter de Milán", cat: "Europa", kit: "1ª equipación", pattern: "stripes", colors: ["#0068a8", "#111111"], trim: "#d4af37", text: "#ffffff", patch: "Serie A / Champions", foto: "" },
  { id: "milan", name: "AC Milan", cat: "Europa", kit: "1ª equipación", pattern: "stripes", colors: ["#e30613", "#111111"], trim: "#111111", text: "#ffffff", patch: "Serie A / Champions", foto: "" },
];
