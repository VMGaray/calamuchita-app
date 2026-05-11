export type LocalidadData = {
  bomberos: string | null
  policia: string | null
  salud: string | null
  cooperativa: string | null
}

export const DATA_TELEFONOS: Record<string, LocalidadData> = {
  "Villa General Belgrano": {
    bomberos: "03546-461222",
    policia: "03546-461101",
    salud: "03546-461234",
    cooperativa: "03546-461300",
  },
  "Santa Rosa de Calamuchita": {
    bomberos: "03546-490222",
    policia: "03546-490101",
    salud: "03546-490300",
    cooperativa: "03546-490400",
  },
  "La Cumbrecita": {
    bomberos: "03546-490222",
    policia: "03546-498101",
    salud: "03546-498200",
    cooperativa: "03546-498300",
  },
  "Los Reartes": {
    bomberos: "03546-497222",
    policia: "03546-497101",
    salud: "03546-497200",
    cooperativa: null,
  },
  "Embalse": {
    bomberos: "03571-432222",
    policia: "03571-432101",
    salud: "03571-432300",
    cooperativa: "03571-432400",
  },
  "Amboy": {
    bomberos: "03546-499222",
    policia: "03546-499101",
    salud: "03546-499200",
    cooperativa: null,
  },
  "Villa del Dique": {
    bomberos: "03571-490222",
    policia: "03571-490101",
    salud: "03571-490200",
    cooperativa: "03571-490400",
  },
  "Villa Rumipal": {
    bomberos: "03571-491222",
    policia: "03571-491101",
    salud: "03571-491200",
    cooperativa: null,
  },
  "Potrero de Garay": {
    bomberos: "0351-499222",
    policia: "0351-499101",
    salud: "0351-499200",
    cooperativa: null,
  },
  "Villa Yacanto": {
    bomberos: "03546-496222",
    policia: "03546-496101",
    salud: "03546-496200",
    cooperativa: null,
  },
  "Villa Alpina": {
    bomberos: "03546-495222",
    policia: "03546-495101",
    salud: null,
    cooperativa: null,
  },
  "Villa Berna": {
    bomberos: "03546-494222",
    policia: "03546-494101",
    salud: "03546-494200",
    cooperativa: null,
  },
  "Villa Ciudad Parque": {
    bomberos: "03546-493222",
    policia: "03546-493101",
    salud: null,
    cooperativa: null,
  },
  "Villa Quillinzo": {
    bomberos: "03546-492222",
    policia: "03546-492101",
    salud: null,
    cooperativa: null,
  },
  "La Cruz": {
    bomberos: "03546-491222",
    policia: "03546-491101",
    salud: null,
    cooperativa: null,
  },
  "Intiyaco": {
    bomberos: "03546-490900",
    policia: "03546-490800",
    salud: null,
    cooperativa: null,
  },
}

export const LOCALIDADES = Object.keys(DATA_TELEFONOS)

export const MAIN_LOCALIDADES = [
  "Villa General Belgrano",
  "Santa Rosa de Calamuchita",
  "La Cumbrecita",
  "Los Reartes",
  "Embalse",
  "Villa del Dique",
]
