// Mapeo de localidad → ruta de imagen en /public/images/localidades/
export const localidadImages: Record<string, string> = {
  "Villa General Belgrano":    "/images/localidades/villa-general-belgrano.jpg",
  "Santa Rosa de Calamuchita": "/images/localidades/santaRosa.jpg",
  "La Cumbrecita":             "/images/localidades/cumbresita.jpg",
  "Los Reartes":               "/images/localidades/los-reartes.jpg",
  "Embalse":                   "/images/localidades/embalse.jpg",
  "Amboy":                     "/images/localidades/amboy.jpg",
  "Villa del Dique":           "/images/localidades/villaDique.jpg",
  "Villa Rumipal":             "/images/localidades/villa-rumipal.jpg",
  "Potrero de Garay":          "/images/localidades/potrero-de-garay.jpg",
  "Villa Yacanto":             "/images/localidades/yacanto.jpg",
  "Yacanto":                   "/images/localidades/yacanto.jpg",
  "Villa Ciudad de América":   "/images/localidades/cAmerica.jpg",
  "Villa Alpina":              "/images/localidades/villa-alpina.jpg",
  "Villa Berna":               "/images/localidades/villa-berna.jpg",
  "Villa Ciudad Parque":       "/images/localidades/villa-ciudad-parque.jpg",
  "Villa Quillinzo":           "/images/localidades/villa-quillinzo.jpg",
  "La Cruz":                   "/images/localidades/la-cruz.jpg",
  "Intiyaco":                  "/images/localidades/intiyaco.jpg",
}

// Agregar la localidad acá cuando su imagen exista en /public/images/localidades/
export const activeLocalidadImages = new Set<string>([
  "Villa General Belgrano",
  "Los Reartes",
  "La Cumbrecita",
  "Santa Rosa de Calamuchita",
  "Embalse",
  "Amboy",
  "Villa del Dique",
  "Villa Yacanto",
  "Yacanto",
  "Villa Ciudad de América",
])
