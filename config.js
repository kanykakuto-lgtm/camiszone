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
    "Hombre": ["S", "M", "L", "XL", "XXL", "3XL", "4XL"],
    "Mujer": ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"],
    "Niño": ["1-2 años", "3-4 años", "5-6 años", "7-8 años", "9-10 años", "11-12 años", "13-14 años"],
    "Niña": ["1-2 años", "3-4 años", "5-6 años", "7-8 años", "9-10 años", "11-12 años", "13-14 años"],
  },
};

// ============================================================
//  COMPETICIONES (pestañas del catálogo, en este orden)
// ============================================================
const COMPS = {
  laliga: "LaLiga",
  segunda: "Segunda",
  premier: "Premier",
  seriea: "Serie A",
  ligue1: "Ligue 1",
  champions: "Champions",
  selecciones: "Selecciones",
};

// ============================================================
//  CATÁLOGO 26/27
//  comps:   competiciones en las que juega (un equipo puede estar en varias)
//  pattern: "solid" | "stripes" | "hoops" | "halves" | "sash" | "hband" | "band" | "diagonal" | "checks" | "pinstripes" | "fade"
//  colors:  colores del cuerpo · sleeves: color de mangas (opcional)
//  trim:    cuello y puños · text: color del nombre/dorsal
//  stars:   estrellas sobre el escudo
//
//  EQUIPACIONES: cada equipo tiene 1ª, 2ª y 3ª. La 2ª y la 3ª se dibujan
//  automáticamente con los colores del club. Para cambiar alguna, añade
//  equipaciones: [ {}, { colors: ["#ffffff"], trim: "#c60b1e" }, {...} ]
//  (cada posición es 1ª, 2ª, 3ª; solo pones lo que cambia, y "nombre" opcional).
//
//  FOTOS: sube una foto a la carpeta img/ con el nombre del id:
//  img/real-madrid.jpg (1ª), img/real-madrid-2.jpg (2ª), img/real-madrid-3.jpg (3ª)
// ============================================================
const TEAMS = [
  // ---------- LaLiga EA Sports ----------
  { id: "alaves", name: "Deportivo Alavés", comps: ["laliga"], pattern: "stripes", colors: ["#0057a8", "#ffffff"], trim: "#0b2a5b", text: "#0b2a5b", equipaciones: [{}, { pattern: "solid", colors: ["#111111"], trim: "#e48aa6", text: "#e48aa6" }, { pattern: "solid", colors: ["#3f7d3a"], trim: "#ffffff", text: "#ffffff" }] },
  { id: "athletic", name: "Athletic Club", comps: ["laliga"], pattern: "stripes", colors: ["#ee2523", "#ffffff"], trim: "#111111", text: "#111111", equipaciones: [{}, { pattern: "solid", colors: ["#111111"], trim: "#ee2523", text: "#ffffff" }, {}] },
  { id: "atletico", name: "Atlético de Madrid", comps: ["laliga", "champions"], pattern: "stripes", colors: ["#cb3524", "#ffffff"], trim: "#272e61", text: "#272e61", equipaciones: [{}, { pattern: "solid", colors: ["#111111"], trim: "#d4ff00", text: "#d4ff00" }, { pattern: "hoops", colors: ["#c9c6c0", "#1b2340"], trim: "#c8102e", text: "#1b2340" }] },
  { id: "barcelona", name: "FC Barcelona", comps: ["laliga", "champions"], pattern: "stripes", colors: ["#a50044", "#004d98"], trim: "#edbb00", text: "#edbb00", equipaciones: [{}, { pattern: "fade", colors: ["#111111", "#5b2a86"], trim: "#d4af37", text: "#d4af37" }, { pattern: "solid", colors: ["#a8c8a0"], trim: "#6b8f5e", text: "#2f4a2a" }] },
  { id: "betis", name: "Real Betis", comps: ["laliga", "champions"], pattern: "stripes", colors: ["#00954c", "#ffffff"], trim: "#00954c", text: "#00562c", equipaciones: [{}, { pattern: "solid", colors: ["#0b6e3a"], trim: "#d4af37", text: "#d4af37" }, { pattern: "halves", colors: ["#1f4e9c", "#00954c"], trim: "#ffffff", text: "#ffffff" }] },
  { id: "celta", name: "RC Celta", comps: ["laliga"], pattern: "solid", colors: ["#8ac3ee"], trim: "#e5254b", text: "#ffffff", equipaciones: [{}, { pattern: "solid", colors: ["#0b2a5b"], trim: "#8ac3ee", text: "#ffffff" }, {}] },
  { id: "deportivo", name: "RC Deportivo", comps: ["laliga"], pattern: "stripes", colors: ["#0059a6", "#ffffff"], trim: "#0b2a5b", text: "#0b2a5b", equipaciones: [{}, { pattern: "solid", colors: ["#111111"], trim: "#0059a6", text: "#ffffff" }, {}] },
  { id: "elche", name: "Elche CF", comps: ["laliga"], pattern: "hband", colors: ["#ffffff", "#00843d"], trim: "#00843d", text: "#00843d", equipaciones: [{}, { pattern: "solid", colors: ["#5b2a86"], trim: "#d4af37", text: "#d4af37" }, {}] },
  { id: "espanyol", name: "RCD Espanyol", comps: ["laliga"], pattern: "stripes", colors: ["#0074c8", "#ffffff"], trim: "#0074c8", text: "#0b2a5b", equipaciones: [{}, { pattern: "solid", colors: ["#d81f26"], trim: "#0074c8", text: "#ffffff" }, { pattern: "solid", colors: ["#b5e61d"], trim: "#0b2a5b", text: "#0b2a5b" }] },
  { id: "getafe", name: "Getafe CF", comps: ["laliga"], pattern: "solid", colors: ["#005999"], trim: "#ffffff", text: "#ffffff", equipaciones: [{}, { pattern: "solid", colors: ["#7a1f2b"], trim: "#ffffff", text: "#ffffff" }, {}] },
  { id: "levante", name: "Levante UD", comps: ["laliga"], pattern: "stripes", colors: ["#b4053f", "#00428c"], trim: "#ffffff", text: "#ffffff", equipaciones: [{}, { pattern: "stripes", colors: ["#111111", "#f2ecdf"], trim: "#b4053f", text: "#b4053f" }, {}] },
  { id: "malaga", name: "Málaga CF", comps: ["laliga"], pattern: "stripes", colors: ["#0b5fa5", "#ffffff"], trim: "#0b5fa5", text: "#0b2a5b", equipaciones: [{}, { pattern: "solid", colors: ["#f27e6b"], trim: "#e8dcc5", text: "#ffffff" }, {}] },
  { id: "osasuna", name: "CA Osasuna", comps: ["laliga"], pattern: "solid", colors: ["#d91a21"], trim: "#0a346f", text: "#ffffff", equipaciones: [{}, { pattern: "solid", colors: ["#f3efe6"], trim: "#9cc3e6", text: "#0a346f" }, {}] },
  { id: "racing", name: "Racing de Santander", comps: ["laliga"], pattern: "solid", colors: ["#ffffff"], trim: "#00733e", text: "#00733e", equipaciones: [{}, { pattern: "solid", colors: ["#0f5132"], trim: "#ffffff", text: "#ffffff" }, {}] },
  { id: "rayo", name: "Rayo Vallecano", comps: ["laliga"], pattern: "sash", colors: ["#ffffff", "#e53027"], trim: "#e53027", text: "#111111", equipaciones: [{}, { pattern: "sash", colors: ["#e53027", "#ffffff"], trim: "#111111", text: "#ffffff" }, {}] },
  { id: "real-madrid", name: "Real Madrid", comps: ["laliga", "champions"], pattern: "solid", colors: ["#ffffff"], trim: "#d4af37", text: "#1b2a4a", equipaciones: [{}, { pattern: "solid", colors: ["#1f3d2b"], trim: "#f2ecdf", text: "#f2ecdf" }, { pattern: "solid", colors: ["#f4a6c1"], trim: "#f2ecdf", text: "#7a1f45" }] },
  { id: "real-sociedad", name: "Real Sociedad", comps: ["laliga"], pattern: "stripes", colors: ["#0067b1", "#ffffff"], trim: "#0067b1", text: "#0b2a5b", equipaciones: [{}, { pattern: "solid", colors: ["#111111"], trim: "#ffffff", text: "#ffffff" }, { pattern: "solid", colors: ["#9b111e"], trim: "#ffffff", text: "#ffffff" }] },
  { id: "sevilla", name: "Sevilla FC", comps: ["laliga"], pattern: "solid", colors: ["#ffffff"], trim: "#d2001f", text: "#d2001f", equipaciones: [{}, { pattern: "solid", colors: ["#d2001f"], trim: "#111111", text: "#ffffff" }, { pattern: "solid", colors: ["#111111"], trim: "#ff4fa3", text: "#ff4fa3" }] },
  { id: "valencia", name: "Valencia CF", comps: ["laliga"], pattern: "solid", colors: ["#ffffff"], trim: "#111111", text: "#111111", equipaciones: [{}, { pattern: "solid", colors: ["#1d3f8f"], trim: "#f58220", text: "#f58220" }, { pattern: "solid", colors: ["#f4a6c8"], trim: "#c8102e", text: "#c8102e" }] },
  { id: "villarreal", name: "Villarreal CF", comps: ["laliga", "champions"], pattern: "solid", colors: ["#ffe14d"], trim: "#005187", text: "#005187", equipaciones: [{}, { pattern: "solid", colors: ["#d9d9d6"], trim: "#ffe14d", text: "#005187", sleeves: "#2a7fba" }, {}] },

  // ---------- LaLiga Hypermotion (Segunda) ----------
  { id: "albacete", name: "Albacete BP", comps: ["segunda"], pattern: "solid", colors: ["#ffffff"], trim: "#c8102e", text: "#111111" },
  { id: "almeria", name: "UD Almería", comps: ["segunda"], pattern: "stripes", colors: ["#ee2523", "#ffffff"], trim: "#ee2523", text: "#111111" },
  { id: "andorra", name: "FC Andorra", comps: ["segunda"], pattern: "solid", colors: ["#0b2d6b"], trim: "#f4c300", text: "#f4c300" },
  { id: "burgos", name: "Burgos CF", comps: ["segunda"], pattern: "solid", colors: ["#ffffff"], trim: "#111111", text: "#111111" },
  { id: "cadiz", name: "Cádiz CF", comps: ["segunda"], pattern: "solid", colors: ["#fde100"], trim: "#0045a5", text: "#0045a5" },
  { id: "castellon", name: "CD Castellón", comps: ["segunda"], pattern: "stripes", colors: ["#111111", "#ffffff"], trim: "#111111", text: "#111111" },
  { id: "celta-fortuna", name: "Celta Fortuna", comps: ["segunda"], pattern: "solid", colors: ["#8ac3ee"], trim: "#e5254b", text: "#ffffff" },
  { id: "ceuta", name: "AD Ceuta", comps: ["segunda"], pattern: "solid", colors: ["#ffffff"], trim: "#111111", text: "#111111" },
  { id: "cordoba", name: "Córdoba CF", comps: ["segunda"], pattern: "stripes", colors: ["#007a33", "#ffffff"], trim: "#007a33", text: "#004d20" },
  { id: "eibar", name: "SD Eibar", comps: ["segunda"], pattern: "stripes", colors: ["#8a1538", "#00529f"], trim: "#ffffff", text: "#ffffff" },
  { id: "eldense", name: "CD Eldense", comps: ["segunda"], pattern: "stripes", colors: ["#003da5", "#d50032"], trim: "#ffffff", text: "#ffffff" },
  { id: "girona", name: "Girona FC", comps: ["segunda"], pattern: "stripes", colors: ["#d6001c", "#ffffff"], trim: "#d6001c", text: "#111111" },
  { id: "granada", name: "Granada CF", comps: ["segunda"], pattern: "hoops", colors: ["#c8102e", "#ffffff"], trim: "#c8102e", text: "#0b2a5b" },
  { id: "las-palmas", name: "UD Las Palmas", comps: ["segunda"], pattern: "solid", colors: ["#ffe500"], trim: "#0057b8", text: "#0057b8" },
  { id: "leganes", name: "CD Leganés", comps: ["segunda"], pattern: "stripes", colors: ["#0a3d91", "#ffffff"], trim: "#0a3d91", text: "#0a3d91" },
  { id: "mallorca", name: "RCD Mallorca", comps: ["segunda"], pattern: "solid", colors: ["#e20613"], trim: "#111111", text: "#ffffff", equipaciones: [{}, { pattern: "hband", colors: ["#111111", "#d4af37"], trim: "#d4af37", text: "#d4af37" }, {}] },
  { id: "oviedo", name: "Real Oviedo", comps: ["segunda"], pattern: "solid", colors: ["#0050a0"], trim: "#ffffff", text: "#ffffff" },
  { id: "real-sociedad-b", name: "Real Sociedad B", comps: ["segunda"], pattern: "stripes", colors: ["#0067b1", "#ffffff"], trim: "#0067b1", text: "#0b2a5b" },
  { id: "sabadell", name: "CE Sabadell", comps: ["segunda"], pattern: "halves", colors: ["#ffffff", "#1e5ba8"], trim: "#1e5ba8", text: "#111111" },
  { id: "sporting-gijon", name: "Real Sporting", comps: ["segunda"], pattern: "stripes", colors: ["#e30613", "#ffffff"], trim: "#0b2a5b", text: "#0b2a5b" },
  { id: "tenerife", name: "CD Tenerife", comps: ["segunda"], pattern: "solid", colors: ["#ffffff"], trim: "#003da5", text: "#003da5" },
  { id: "valladolid", name: "Real Valladolid", comps: ["segunda"], pattern: "stripes", colors: ["#5c2d91", "#ffffff"], trim: "#5c2d91", text: "#3b1a63" },

  // ---------- Premier League ----------
  { id: "arsenal", name: "Arsenal", comps: ["premier", "champions"], pattern: "solid", colors: ["#ef0107"], sleeves: "#ffffff", trim: "#063672", text: "#ffffff", equipaciones: [{}, { pattern: "solid", colors: ["#1d2a5b"], trim: "#ef0107", text: "#ffd200", sleeves: null }, { pattern: "solid", colors: ["#f7eb8a"], trim: "#1d2a5b", text: "#1d2a5b", sleeves: null }] },
  { id: "aston-villa", name: "Aston Villa", comps: ["premier", "champions"], pattern: "solid", colors: ["#670e36"], sleeves: "#95bfe5", trim: "#95bfe5", text: "#ffd200", equipaciones: [{}, { pattern: "solid", colors: ["#111111"], trim: "#95bfe5", text: "#ffd200", sleeves: null }, { pattern: "solid", colors: ["#bcd9f0"], trim: "#670e36", text: "#670e36", sleeves: null }] },
  { id: "bournemouth", name: "AFC Bournemouth", comps: ["premier"], pattern: "stripes", colors: ["#da291c", "#111111"], trim: "#111111", text: "#ffffff", equipaciones: [{}, { pattern: "solid", colors: ["#5b2a86"], trim: "#ffffff", text: "#ffffff" }, { pattern: "solid", colors: ["#f2ecdf"], trim: "#1b2a4a", text: "#1b2a4a" }] },
  { id: "brentford", name: "Brentford", comps: ["premier"], pattern: "stripes", colors: ["#e30613", "#ffffff"], trim: "#111111", text: "#111111", equipaciones: [{}, { pattern: "pinstripes", colors: ["#1b2a4a", "#f2ecdf"], trim: "#f2ecdf", text: "#f2ecdf" }, { pattern: "solid", colors: ["#ffd200"], trim: "#111111", text: "#111111" }] },
  { id: "brighton", name: "Brighton & Hove Albion", comps: ["premier"], pattern: "stripes", colors: ["#0057b8", "#ffffff"], trim: "#0057b8", text: "#0b2a5b", equipaciones: [{}, {}, { pattern: "solid", colors: ["#127c80"], trim: "#40e0d0", text: "#ffffff" }] },
  { id: "chelsea", name: "Chelsea", comps: ["premier"], pattern: "solid", colors: ["#034694"], trim: "#ffffff", text: "#ffffff", equipaciones: [{}, { pattern: "solid", colors: ["#111111"], trim: "#d4af37", text: "#d4af37" }, { pattern: "solid", colors: ["#ffffff"], trim: "#034694", text: "#034694" }] },
  { id: "coventry", name: "Coventry City", comps: ["premier"], pattern: "solid", colors: ["#6cace4"], trim: "#ffffff", text: "#ffffff", equipaciones: [{}, { pattern: "solid", colors: ["#ffffff"], trim: "#6cace4", text: "#1b2a4a" }, { pattern: "solid", colors: ["#6a2c91"], trim: "#ffffff", text: "#ffffff" }] },
  { id: "crystal-palace", name: "Crystal Palace", comps: ["premier"], pattern: "stripes", colors: ["#c4122e", "#1b458f"], trim: "#1b458f", text: "#ffffff", equipaciones: [{}, { pattern: "solid", colors: ["#111111"], trim: "#c4122e", text: "#ffffff" }, {}] },
  { id: "everton", name: "Everton", comps: ["premier"], pattern: "solid", colors: ["#003399"], trim: "#ffffff", text: "#ffffff", equipaciones: [{}, { pattern: "pinstripes", colors: ["#ffffff", "#ffd200"], trim: "#003399", text: "#003399" }, { pattern: "solid", colors: ["#6b6b3a"], trim: "#f58220", text: "#f58220" }] },
  { id: "fulham", name: "Fulham", comps: ["premier"], pattern: "solid", colors: ["#ffffff"], trim: "#111111", text: "#111111", equipaciones: [{}, {}, { pattern: "solid", colors: ["#b9d7ee"], trim: "#ff5fa2", text: "#ff5fa2" }] },
  { id: "hull", name: "Hull City", comps: ["premier"], pattern: "solid", colors: ["#f5a12d"], trim: "#111111", text: "#111111", equipaciones: [{}, { pattern: "solid", colors: ["#ffffff"], trim: "#f5a12d", text: "#111111" }, {}] },
  { id: "ipswich", name: "Ipswich Town", comps: ["premier"], pattern: "solid", colors: ["#0044a9"], trim: "#ffffff", text: "#ffffff", equipaciones: [{}, { pattern: "pinstripes", colors: ["#f2ecdf", "#c8102e"], trim: "#111111", text: "#111111" }, {}] },
  { id: "leeds", name: "Leeds United", comps: ["premier"], pattern: "solid", colors: ["#ffffff"], trim: "#1d428a", text: "#1d428a" },
  { id: "liverpool", name: "Liverpool", comps: ["premier", "champions"], pattern: "solid", colors: ["#c8102e"], trim: "#ffffff", text: "#ffffff", equipaciones: [{}, { pattern: "solid", colors: ["#ffffff"], trim: "#7a1f2b", text: "#7a1f2b" }, { pattern: "solid", colors: ["#5a1a24"], trim: "#ffffff", text: "#ffffff" }] },
  { id: "man-city", name: "Manchester City", comps: ["premier", "champions"], pattern: "solid", colors: ["#6cabdd"], trim: "#1c2c5b", text: "#ffffff", equipaciones: [{}, { pattern: "solid", colors: ["#111111"], trim: "#ffd200", text: "#ffd200" }, { pattern: "band", colors: ["#ffffff", "#6cabdd", "#ffffff"], trim: "#1c2c5b", text: "#1c2c5b" }] },
  { id: "man-utd", name: "Manchester United", comps: ["premier", "champions"], pattern: "solid", colors: ["#da291c"], trim: "#111111", text: "#ffffff", equipaciones: [{}, { pattern: "solid", colors: ["#1b2f6b"], trim: "#da291c", text: "#ffffff" }, { pattern: "solid", colors: ["#f2ecdf"], trim: "#7a1f2b", text: "#1f4d2b" }] },
  { id: "newcastle", name: "Newcastle United", comps: ["premier"], pattern: "stripes", colors: ["#111111", "#ffffff"], trim: "#111111", text: "#111111", equipaciones: [{}, { pattern: "solid", colors: ["#3b6aa0"], trim: "#ffffff", text: "#ffffff" }, { pattern: "solid", colors: ["#c8a2d6"], trim: "#111111", text: "#111111" }] },
  { id: "nottingham", name: "Nottingham Forest", comps: ["premier"], pattern: "solid", colors: ["#dd0000"], trim: "#ffffff", text: "#ffffff", equipaciones: [{}, { pattern: "solid", colors: ["#0f3d2a"], trim: "#dd0000", text: "#ffffff" }, { pattern: "solid", colors: ["#a7d3f0"], trim: "#ffffff", text: "#1b2a4a" }] },
  { id: "sunderland", name: "Sunderland", comps: ["premier"], pattern: "stripes", colors: ["#eb172b", "#ffffff"], trim: "#111111", text: "#111111", equipaciones: [{}, { pattern: "solid", colors: ["#f4a6c1"], trim: "#111111", text: "#111111" }, { pattern: "solid", colors: ["#1f4e9c"], trim: "#ffffff", text: "#ffffff" }] },
  { id: "tottenham", name: "Tottenham Hotspur", comps: ["premier"], pattern: "solid", colors: ["#ffffff"], trim: "#132257", text: "#132257", equipaciones: [{}, {}, { pattern: "solid", colors: ["#4b2a7b"], trim: "#ffffff", text: "#ffffff" }] },

  // ---------- Serie A ----------
  { id: "atalanta", name: "Atalanta", comps: ["seriea"], pattern: "stripes", colors: ["#1e71b8", "#111111"], trim: "#111111", text: "#ffffff", equipaciones: [{}, { pattern: "solid", colors: ["#ffffff"], trim: "#111111", text: "#1e71b8" }, {}] },
  { id: "bologna", name: "Bologna", comps: ["seriea"], pattern: "stripes", colors: ["#a21c26", "#1a2f48"], trim: "#ffffff", text: "#ffffff", equipaciones: [{}, { pattern: "solid", colors: ["#ffffff"], trim: "#a21c26", text: "#1a2f48" }, {}] },
  { id: "cagliari", name: "Cagliari", comps: ["seriea"], pattern: "halves", colors: ["#a50e2d", "#002350"], trim: "#ffffff", text: "#ffffff" },
  { id: "fiorentina", name: "Fiorentina", comps: ["seriea"], pattern: "solid", colors: ["#482e92"], trim: "#ffffff", text: "#ffffff", equipaciones: [{}, { pattern: "solid", colors: ["#ffffff"], trim: "#482e92", text: "#482e92" }, {}] },
  { id: "frosinone", name: "Frosinone", comps: ["seriea"], pattern: "solid", colors: ["#ffd400"], trim: "#0047ab", text: "#0047ab" },
  { id: "genoa", name: "Genoa", comps: ["seriea"], pattern: "halves", colors: ["#a21c26", "#002350"], trim: "#ffffff", text: "#ffffff" },
  { id: "juventus", name: "Juventus", comps: ["seriea"], pattern: "stripes", colors: ["#111111", "#ffffff"], trim: "#111111", text: "#111111", equipaciones: [{}, { pattern: "solid", colors: ["#f6c9d4"], trim: "#111111", text: "#111111" }, { pattern: "solid", colors: ["#111111"], trim: "#d4af37", text: "#d4af37" }] },
  { id: "lazio", name: "Lazio", comps: ["seriea"], pattern: "solid", colors: ["#87d8f7"], trim: "#ffffff", text: "#14284b", equipaciones: [{}, { pattern: "pinstripes", colors: ["#ffffff", "#87d8f7"], trim: "#14284b", text: "#14284b" }, { pattern: "solid", colors: ["#14284b"], trim: "#d4af37", text: "#d4af37" }] },
  { id: "lecce", name: "Lecce", comps: ["seriea"], pattern: "stripes", colors: ["#ffd700", "#d71920"], trim: "#0b2a5b", text: "#0b2a5b" },
  { id: "milan", name: "AC Milan", comps: ["seriea"], pattern: "stripes", colors: ["#e30613", "#111111"], trim: "#111111", text: "#ffffff", equipaciones: [{}, { pattern: "solid", colors: ["#ffffff"], trim: "#d4af37", text: "#111111" }, { pattern: "solid", colors: ["#111111"], trim: "#ff2a2a", text: "#ff2a2a" }] },
  { id: "monza", name: "Monza", comps: ["seriea"], pattern: "solid", colors: ["#e2001a"], trim: "#ffffff", text: "#ffffff" },
  { id: "parma", name: "Parma", comps: ["seriea"], pattern: "solid", colors: ["#ffffff"], trim: "#111111", text: "#111111" },
  { id: "sassuolo", name: "Sassuolo", comps: ["seriea"], pattern: "stripes", colors: ["#00a752", "#111111"], trim: "#111111", text: "#ffffff" },
  { id: "torino", name: "Torino", comps: ["seriea"], pattern: "solid", colors: ["#8a1e03"], trim: "#ffffff", text: "#ffffff" },
  { id: "udinese", name: "Udinese", comps: ["seriea"], pattern: "stripes", colors: ["#111111", "#ffffff"], trim: "#111111", text: "#111111" },
  { id: "venezia", name: "Venezia", comps: ["seriea"], pattern: "solid", colors: ["#111111"], trim: "#f26522", text: "#f26522" },

  // ---------- Ligue 1 ----------
  { id: "angers", name: "Angers SCO", comps: ["ligue1"], pattern: "stripes", colors: ["#111111", "#ffffff"], trim: "#111111", text: "#111111" },
  { id: "auxerre", name: "AJ Auxerre", comps: ["ligue1"], pattern: "solid", colors: ["#ffffff"], trim: "#0b4a99", text: "#0b4a99" },
  { id: "brest", name: "Stade Brestois", comps: ["ligue1"], pattern: "solid", colors: ["#e30613"], trim: "#ffffff", text: "#ffffff" },
  { id: "le-havre", name: "Le Havre AC", comps: ["ligue1"], pattern: "halves", colors: ["#8dc8e8", "#0a2240"], trim: "#0a2240", text: "#ffffff" },
  { id: "le-mans", name: "Le Mans FC", comps: ["ligue1"], pattern: "solid", colors: ["#e30613"], trim: "#ffd400", text: "#ffd400" },
  { id: "lorient", name: "FC Lorient", comps: ["ligue1"], pattern: "solid", colors: ["#f58113"], trim: "#111111", text: "#111111" },
  { id: "lyon", name: "Olympique de Lyon", comps: ["ligue1"], pattern: "solid", colors: ["#ffffff"], trim: "#da0812", text: "#14387f" },
  { id: "marseille", name: "Olympique de Marsella", comps: ["ligue1"], pattern: "solid", colors: ["#ffffff"], trim: "#2faee0", text: "#2faee0", equipaciones: [{}, {}, { pattern: "solid", colors: ["#c27ba0"], trim: "#ffffff", text: "#ffffff" }] },
  { id: "monaco", name: "AS Monaco", comps: ["ligue1"], pattern: "diagonal", colors: ["#e7001b", "#ffffff"], trim: "#d4af37", text: "#111111", equipaciones: [{}, { pattern: "solid", colors: ["#5a1e2e"], trim: "#d4af37", text: "#ffffff" }, {}] },
  { id: "nice", name: "OGC Nice", comps: ["ligue1"], pattern: "stripes", colors: ["#c8102e", "#111111"], trim: "#111111", text: "#ffffff" },
  { id: "paris-fc", name: "Paris FC", comps: ["ligue1"], pattern: "solid", colors: ["#0e2a47"], trim: "#b1d8f3", text: "#ffffff" },
  { id: "rennes", name: "Stade Rennais", comps: ["ligue1"], pattern: "solid", colors: ["#e13327"], sleeves: "#111111", trim: "#111111", text: "#ffffff" },
  { id: "strasbourg", name: "RC Strasbourg", comps: ["ligue1"], pattern: "solid", colors: ["#009fe3"], trim: "#ffffff", text: "#ffffff" },
  { id: "toulouse", name: "Toulouse FC", comps: ["ligue1"], pattern: "solid", colors: ["#5a2d82"], trim: "#ffffff", text: "#ffffff" },
  { id: "troyes", name: "ES Troyes AC", comps: ["ligue1"], pattern: "solid", colors: ["#0a3d91"], trim: "#ffffff", text: "#ffffff" },

  // ---------- Champions League (resto de Europa) ----------
  { id: "psg", name: "Paris Saint-Germain", comps: ["ligue1", "champions"], pattern: "band", colors: ["#004170", "#da291c", "#ffffff"], trim: "#da291c", text: "#ffffff", equipaciones: [{}, { pattern: "band", colors: ["#ffffff", "#da291c", "#1b2a5b"], trim: "#1b2a5b", text: "#1b2a5b" }, { pattern: "band", colors: ["#111111", "#da291c", "#2e7d32"], trim: "#da291c", text: "#ffffff" }] },
  { id: "bayern", name: "Bayern Múnich", comps: ["champions"], pattern: "solid", colors: ["#dc052d"], trim: "#ffffff", text: "#ffffff", equipaciones: [{}, { pattern: "solid", colors: ["#ffffff"], trim: "#0b2a5b", text: "#0b2a5b" }, { pattern: "solid", colors: ["#2b2560"], trim: "#ffffff", text: "#ffffff" }] },
  { id: "dortmund", name: "Borussia Dortmund", comps: ["champions"], pattern: "solid", colors: ["#fde100"], trim: "#111111", text: "#111111", equipaciones: [{}, { pattern: "solid", colors: ["#222222"], trim: "#fde100", text: "#fde100" }, { pattern: "solid", colors: ["#6b2fa0"], trim: "#d4ff00", text: "#d4ff00" }] },
  { id: "leipzig", name: "RB Leipzig", comps: ["champions"], pattern: "solid", colors: ["#ffffff"], trim: "#dd0741", text: "#0c2043" },
  { id: "stuttgart", name: "VfB Stuttgart", comps: ["champions"], pattern: "hband", colors: ["#ffffff", "#e32219"], trim: "#e32219", text: "#e32219" },
  { id: "inter", name: "Inter de Milán", comps: ["seriea", "champions"], pattern: "stripes", colors: ["#0068a8", "#111111"], trim: "#d4af37", text: "#ffffff", equipaciones: [{}, { pattern: "pinstripes", colors: ["#ffffff", "#1b2a5b"], trim: "#1b2a5b", text: "#1b2a5b" }, { pattern: "hband", colors: ["#5a5d63", "#111111"], trim: "#ffd200", text: "#ffd200" }] },
  { id: "napoli", name: "SSC Napoli", comps: ["seriea", "champions"], pattern: "solid", colors: ["#12a0d7"], trim: "#ffffff", text: "#ffffff", equipaciones: [{}, { pattern: "pinstripes", colors: ["#ffffff", "#12a0d7"], trim: "#12a0d7", text: "#12a0d7" }, { pattern: "solid", colors: ["#c8102e"], trim: "#ffffff", text: "#ffffff" }] },
  { id: "roma", name: "AS Roma", comps: ["seriea", "champions"], pattern: "solid", colors: ["#8e1f2f"], trim: "#f0bc42", text: "#f0bc42", equipaciones: [{}, { pattern: "hband", colors: ["#f2ecdf", "#f0bc42"], trim: "#8e1f2f", text: "#8e1f2f" }, { pattern: "solid", colors: ["#6b6e73"], trim: "#f0bc42", text: "#f0bc42" }] },
  { id: "como", name: "Como 1907", comps: ["seriea", "champions"], pattern: "solid", colors: ["#0d3b8c"], trim: "#ffffff", text: "#ffffff" },
  { id: "lens", name: "RC Lens", comps: ["ligue1", "champions"], pattern: "solid", colors: ["#ffd400"], sleeves: "#e00010", trim: "#e00010", text: "#e00010", equipaciones: [{}, { pattern: "solid", colors: ["#111111"], trim: "#2e8b57", text: "#ffffff", sleeves: null }, {}] },
  { id: "lille", name: "LOSC Lille", comps: ["ligue1", "champions"], pattern: "solid", colors: ["#e01e13"], trim: "#20325f", text: "#ffffff" },
  { id: "psv", name: "PSV Eindhoven", comps: ["champions"], pattern: "stripes", colors: ["#ed1c24", "#ffffff"], trim: "#111111", text: "#111111", equipaciones: [{}, { pattern: "solid", colors: ["#ffffff"], trim: "#8e44ad", text: "#5b2a86" }, {}] },
  { id: "feyenoord", name: "Feyenoord", comps: ["champions"], pattern: "halves", colors: ["#e2001a", "#ffffff"], trim: "#111111", text: "#111111", equipaciones: [{}, { pattern: "solid", colors: ["#a7d3f0"], trim: "#111111", text: "#111111" }, {}] },
  { id: "porto", name: "FC Porto", comps: ["champions"], pattern: "stripes", colors: ["#00428c", "#ffffff"], trim: "#00428c", text: "#00428c", equipaciones: [{}, { pattern: "solid", colors: ["#9b111e"], trim: "#f2ecdf", text: "#f2ecdf" }, {}] },
  { id: "sporting-cp", name: "Sporting CP", comps: ["champions"], pattern: "hoops", colors: ["#008057", "#ffffff"], trim: "#008057", text: "#111111", equipaciones: [{}, { pattern: "solid", colors: ["#c9a646"], trim: "#111111", text: "#111111" }, {}] },
  { id: "galatasaray", name: "Galatasaray", comps: ["champions"], pattern: "halves", colors: ["#fdb912", "#a90432"], trim: "#a90432", text: "#ffffff", equipaciones: [{}, { pattern: "solid", colors: ["#ffffff"], trim: "#7a1f2b", text: "#7a1f2b" }, {}] },
  { id: "fenerbahce", name: "Fenerbahçe", comps: ["champions"], pattern: "stripes", colors: ["#002d72", "#ffed00"], trim: "#002d72", text: "#ffffff", equipaciones: [{}, { pattern: "pinstripes", colors: ["#ffffff", "#f7e98e"], trim: "#d4af37", text: "#002d72" }, {}] },
  { id: "club-brugge", name: "Club Brugge", comps: ["champions"], pattern: "stripes", colors: ["#0062b0", "#111111"], trim: "#111111", text: "#ffffff" },
  { id: "bodo-glimt", name: "Bodø/Glimt", comps: ["champions"], pattern: "solid", colors: ["#ffd200"], trim: "#111111", text: "#111111" },
  { id: "viking", name: "Viking FK", comps: ["champions"], pattern: "solid", colors: ["#00205b"], trim: "#ffffff", text: "#ffffff" },
  { id: "slavia", name: "Slavia Praga", comps: ["champions"], pattern: "halves", colors: ["#ffffff", "#e30613"], trim: "#e30613", text: "#111111" },
  { id: "aek", name: "AEK Atenas", comps: ["champions"], pattern: "solid", colors: ["#ffd700"], trim: "#111111", text: "#111111" },
  { id: "lask", name: "LASK", comps: ["champions"], pattern: "stripes", colors: ["#111111", "#ffffff"], trim: "#111111", text: "#111111" },
  { id: "slovan", name: "Slovan Bratislava", comps: ["champions"], pattern: "solid", colors: ["#5bb4e5"], trim: "#ffffff", text: "#ffffff" },
  { id: "shakhtar", name: "Shakhtar Donetsk", comps: ["champions"], pattern: "stripes", colors: ["#f26a21", "#111111"], trim: "#111111", text: "#ffffff" },
  { id: "sabah", name: "Sabah FK", comps: ["champions"], pattern: "solid", colors: ["#ffffff"], trim: "#e05a1b", text: "#e05a1b" },

  // ---------- Selecciones (las 48 del Mundial 2026) ----------
  { id: "espana", name: "España", comps: ["selecciones"], pattern: "solid", colors: ["#c60b1e"], trim: "#ffc400", text: "#ffc400", stars: 2, starColor: "#ffc400", parches: ["campeones", "mundial"],
    equipaciones: [
      { nombre: "Roja" },
      { nombre: "Blanca", colors: ["#f5f1e8"], trim: "#7b1e2e", text: "#7b1e2e", starColor: "#d4a017" },
    ] },
  { id: "alemania", name: "Alemania", comps: ["selecciones"], pattern: "solid", colors: ["#ffffff"], trim: "#111111", text: "#111111", stars: 4, starColor: "#d4a017", equipaciones: [{}, { pattern: "solid", colors: ["#1b2a4a"], trim: "#98e0c8", text: "#ffffff" }, {}] },
  { id: "arabia-saudi", name: "Arabia Saudí", comps: ["selecciones"], pattern: "solid", colors: ["#006c35"], trim: "#ffffff", text: "#ffffff" },
  { id: "argelia", name: "Argelia", comps: ["selecciones"], pattern: "solid", colors: ["#ffffff"], trim: "#006233", text: "#006233" },
  { id: "argentina", name: "Argentina", comps: ["selecciones"], pattern: "stripes", colors: ["#75aadb", "#ffffff"], trim: "#111111", text: "#111111", stars: 3, starColor: "#d4a017", equipaciones: [{}, { pattern: "solid", colors: ["#111111"], trim: "#75aadb", text: "#ffffff" }, {}] },
  { id: "australia", name: "Australia", comps: ["selecciones"], pattern: "solid", colors: ["#ffcd00"], trim: "#00843d", text: "#00843d" },
  { id: "austria", name: "Austria", comps: ["selecciones"], pattern: "solid", colors: ["#ed2939"], trim: "#ffffff", text: "#ffffff" },
  { id: "belgica", name: "Bélgica", comps: ["selecciones"], pattern: "solid", colors: ["#c8102e"], trim: "#fdda24", text: "#fdda24", equipaciones: [{}, { pattern: "solid", colors: ["#5b8fd6"], trim: "#f4a6c8", text: "#ffffff" }, {}] },
  { id: "bosnia", name: "Bosnia y Herzegovina", comps: ["selecciones"], pattern: "solid", colors: ["#002395"], trim: "#fecb00", text: "#ffffff" },
  { id: "brasil", name: "Brasil", comps: ["selecciones"], pattern: "solid", colors: ["#ffdf00"], trim: "#009c3b", text: "#009c3b", stars: 5, starColor: "#009c3b" },
  { id: "cabo-verde", name: "Cabo Verde", comps: ["selecciones"], pattern: "solid", colors: ["#003893"], trim: "#cf2027", text: "#ffffff" },
  { id: "canada", name: "Canadá", comps: ["selecciones"], pattern: "solid", colors: ["#d80621"], trim: "#ffffff", text: "#ffffff" },
  { id: "chequia", name: "Chequia", comps: ["selecciones"], pattern: "solid", colors: ["#d7141a"], trim: "#11457e", text: "#ffffff" },
  { id: "colombia", name: "Colombia", comps: ["selecciones"], pattern: "solid", colors: ["#fcd116"], trim: "#003893", text: "#003893" },
  { id: "corea-sur", name: "Corea del Sur", comps: ["selecciones"], pattern: "solid", colors: ["#e2231a"], trim: "#111111", text: "#ffffff", equipaciones: [{}, { pattern: "solid", colors: ["#b9a6e0"], trim: "#111111", text: "#111111" }, {}] },
  { id: "costa-marfil", name: "Costa de Marfil", comps: ["selecciones"], pattern: "solid", colors: ["#f77f00"], trim: "#009e60", text: "#ffffff" },
  { id: "croacia", name: "Croacia", comps: ["selecciones"], pattern: "checks", colors: ["#ffffff", "#e30613"], trim: "#171796", text: "#171796", equipaciones: [{}, { pattern: "solid", colors: ["#1b2f6b"], trim: "#e30613", text: "#ffffff" }, {}] },
  { id: "curazao", name: "Curazao", comps: ["selecciones"], pattern: "solid", colors: ["#002b7f"], trim: "#f9e814", text: "#f9e814" },
  { id: "ecuador", name: "Ecuador", comps: ["selecciones"], pattern: "solid", colors: ["#ffd100"], trim: "#034ea2", text: "#034ea2" },
  { id: "egipto", name: "Egipto", comps: ["selecciones"], pattern: "solid", colors: ["#c8102e"], trim: "#111111", text: "#ffffff" },
  { id: "escocia", name: "Escocia", comps: ["selecciones"], pattern: "solid", colors: ["#1b2d5b"], trim: "#ffffff", text: "#ffffff" },
  { id: "estados-unidos", name: "Estados Unidos", comps: ["selecciones"], pattern: "solid", colors: ["#ffffff"], trim: "#0a3161", text: "#0a3161" },
  { id: "francia", name: "Francia", comps: ["selecciones"], pattern: "solid", colors: ["#1d2a5b"], trim: "#ffffff", text: "#ffffff", stars: 2, starColor: "#d4a017", equipaciones: [{}, { pattern: "solid", colors: ["#7fd1b9"], trim: "#1d2a5b", text: "#1d2a5b" }, {}] },
  { id: "ghana", name: "Ghana", comps: ["selecciones"], pattern: "solid", colors: ["#ffffff"], trim: "#006b3f", text: "#111111" },
  { id: "haiti", name: "Haití", comps: ["selecciones"], pattern: "solid", colors: ["#00209f"], trim: "#d21034", text: "#ffffff" },
  { id: "inglaterra", name: "Inglaterra", comps: ["selecciones"], pattern: "solid", colors: ["#ffffff"], trim: "#1d2a5b", text: "#1d2a5b", stars: 1, starColor: "#1d2a5b", equipaciones: [{}, { pattern: "solid", colors: ["#c8102e"], trim: "#1d2a5b", text: "#ffffff" }, {}] },
  { id: "irak", name: "Irak", comps: ["selecciones"], pattern: "solid", colors: ["#007a3d"], trim: "#ffffff", text: "#ffffff" },
  { id: "iran", name: "Irán", comps: ["selecciones"], pattern: "solid", colors: ["#ffffff"], trim: "#da0000", text: "#239f40" },
  { id: "japon", name: "Japón", comps: ["selecciones"], pattern: "solid", colors: ["#1a2b7a"], trim: "#e60012", text: "#ffffff", equipaciones: [{}, { pattern: "solid", colors: ["#f5f1e8"], trim: "#1a2b7a", text: "#1a2b7a" }, {}] },
  { id: "jordania", name: "Jordania", comps: ["selecciones"], pattern: "solid", colors: ["#ffffff"], trim: "#ce1126", text: "#ce1126" },
  { id: "marruecos", name: "Marruecos", comps: ["selecciones"], pattern: "solid", colors: ["#c1272d"], trim: "#006233", text: "#ffffff", equipaciones: [{}, { pattern: "solid", colors: ["#ffffff"], trim: "#c1272d", text: "#c1272d" }, {}] },
  { id: "mexico", name: "México", comps: ["selecciones"], pattern: "solid", colors: ["#006847"], trim: "#ce1126", text: "#ffffff", equipaciones: [{}, { pattern: "solid", colors: ["#ffffff"], trim: "#9e9e9e", text: "#006847" }, {}] },
  { id: "noruega", name: "Noruega", comps: ["selecciones"], pattern: "solid", colors: ["#ba0c2f"], trim: "#00205b", text: "#ffffff" },
  { id: "nueva-zelanda", name: "Nueva Zelanda", comps: ["selecciones"], pattern: "solid", colors: ["#ffffff"], trim: "#111111", text: "#111111" },
  { id: "paises-bajos", name: "Países Bajos", comps: ["selecciones"], pattern: "solid", colors: ["#f36c21"], trim: "#1b2f6b", text: "#1b2f6b", equipaciones: [{}, { pattern: "solid", colors: ["#ffffff"], trim: "#f36c21", text: "#f36c21" }, {}] },
  { id: "panama", name: "Panamá", comps: ["selecciones"], pattern: "solid", colors: ["#da121a"], trim: "#072357", text: "#ffffff" },
  { id: "paraguay", name: "Paraguay", comps: ["selecciones"], pattern: "stripes", colors: ["#d52b1e", "#ffffff"], trim: "#0038a8", text: "#0038a8" },
  { id: "portugal", name: "Portugal", comps: ["selecciones"], pattern: "solid", colors: ["#c8102e"], trim: "#046a38", text: "#ffd100", parches: ["mundial", "nations"], equipaciones: [{}, { pattern: "solid", colors: ["#7fd6d0"], trim: "#046a38", text: "#046a38" }, {}] },
  { id: "qatar", name: "Qatar", comps: ["selecciones"], pattern: "solid", colors: ["#8a1538"], trim: "#ffffff", text: "#ffffff" },
  { id: "rd-congo", name: "RD Congo", comps: ["selecciones"], pattern: "solid", colors: ["#007fff"], trim: "#ce1021", text: "#f7d618" },
  { id: "senegal", name: "Senegal", comps: ["selecciones"], pattern: "solid", colors: ["#ffffff"], trim: "#00853f", text: "#00853f" },
  { id: "sudafrica", name: "Sudáfrica", comps: ["selecciones"], pattern: "solid", colors: ["#ffb612"], trim: "#007749", text: "#007749" },
  { id: "suecia", name: "Suecia", comps: ["selecciones"], pattern: "solid", colors: ["#fecc02"], trim: "#006aa7", text: "#006aa7" },
  { id: "suiza", name: "Suiza", comps: ["selecciones"], pattern: "solid", colors: ["#d52b1e"], trim: "#ffffff", text: "#ffffff" },
  { id: "tunez", name: "Túnez", comps: ["selecciones"], pattern: "solid", colors: ["#e70013"], trim: "#ffffff", text: "#ffffff" },
  { id: "turquia", name: "Turquía", comps: ["selecciones"], pattern: "solid", colors: ["#e30a17"], trim: "#ffffff", text: "#ffffff" },
  { id: "uruguay", name: "Uruguay", comps: ["selecciones"], pattern: "solid", colors: ["#5cbfeb"], trim: "#111111", text: "#111111", stars: 4, starColor: "#d4a017", equipaciones: [{}, { pattern: "solid", colors: ["#2b2d6e"], trim: "#ff7a00", text: "#ff7a00" }, {}] },
  { id: "uzbekistan", name: "Uzbekistán", comps: ["selecciones"], pattern: "solid", colors: ["#ffffff"], trim: "#0099b5", text: "#0099b5" },
];

// ============================================================
//  PARCHES
//  Cada equipo puede llevar los parches de sus competiciones.
//  Un equipo puede tener otros con  parches: ["campeones", "mundial"]
//
//  FOTOS: sube una foto a img/parches/ con el nombre del id
//  (ej. img/parches/champions.jpg) y se mostrará en lugar del dibujo.
// ============================================================
const PARCHES = {
  laliga:     { nombre: "LaLiga",              linea1: "LALIGA",      linea2: "EA SPORTS",  forma: "escudo",  fondo: "#ffffff", borde: "#ff4b44", texto: "#111111" },
  segunda:    { nombre: "LaLiga Hypermotion",  linea1: "LALIGA",      linea2: "HYPERMOTION", forma: "escudo", fondo: "#ffffff", borde: "#1b1b1b", texto: "#111111" },
  premier:    { nombre: "Premier League",      linea1: "PREMIER",     linea2: "LEAGUE",     forma: "escudo",  fondo: "#37003c", borde: "#00ff85", texto: "#ffffff" },
  seriea:     { nombre: "Serie A",             linea1: "SERIE A",     linea2: "",           forma: "escudo",  fondo: "#ffffff", borde: "#0b2f6b", texto: "#0b2f6b" },
  ligue1:     { nombre: "Ligue 1",             linea1: "LIGUE 1",     linea2: "",           forma: "escudo",  fondo: "#091c3e", borde: "#dae025", texto: "#ffffff" },
  champions:  { nombre: "Champions League",    linea1: "CHAMPIONS",   linea2: "LEAGUE",     forma: "circulo", fondo: "#0b1e5b", borde: "#c0c8d8", texto: "#ffffff" },
  mundial:    { nombre: "Mundial 2026",        linea1: "MUNDIAL",     linea2: "2026",       forma: "circulo", fondo: "#ffffff", borde: "#d4a017", texto: "#111111" },
  campeones:  { nombre: "Campeones del Mundo", linea1: "CAMPEONES",   linea2: "DEL MUNDO",  forma: "escudo",  fondo: "#d4a017", borde: "#8a6a10", texto: "#ffffff" },
  nations:    { nombre: "Nations League",      linea1: "NATIONS",     linea2: "LEAGUE",     forma: "circulo", fondo: "#111111", borde: "#c0c8d8", texto: "#ffffff" },
};

// Parche que corresponde a cada competición
const PARCHE_DE_COMPETICION = { laliga: "laliga", segunda: "segunda", premier: "premier", seriea: "seriea", ligue1: "ligue1", champions: "champions", selecciones: "mundial" };
