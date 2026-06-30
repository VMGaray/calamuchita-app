import {
  Wrench, Zap, Flame, Car, Building, Paintbrush, Hammer, KeyRound, Leaf, Waves, Home, Bug, Sparkles, Droplets, Shield, Scissors, Soup,
  Store, Shirt, Gem, HardHat, Baby, Smartphone, Armchair, Dog, HeartPulse, Package,
  Brain, AlertCircle, FlaskConical, Stethoscope, Ambulance,
  GraduationCap, BookOpen, Languages, Users, Music, Trophy, Palette,
  Hotel, Map, Tent, Activity, Compass, Bike, Plane,
  Utensils, Coffee, Beer, Wine, ShoppingBag, Clock, Wheat,
  Truck, Mountain, Printer, CreditCard, Briefcase,
  Dumbbell, PersonStanding, Timer, Wind, Tag, Video, ShieldCheck, ClipboardList, Cog, Snowflake, Bone
} from "lucide-react"

export const MASTER_CATEGORIES = {
  gastronomy: {
    label: "Gastronomía",
    subcategories: [
      { label: "Abierto ahora", icon: Clock, bg: "bg-yellow-50", color: "text-yellow-700" },
      { label: "Bar/Café", icon: Coffee, bg: "bg-accent-50", color: "text-accent-500" },
      { label: "Delivery", icon: Bike, bg: "bg-green-50", color: "text-green-600" },
      { label: "Restaurantes", icon: Utensils, bg: "bg-primary-50", color: "text-primary-500" },
      { label: "Viandas", icon: ShoppingBag, bg: "bg-blue-50", color: "text-blue-600" },
      { label: "Panadería", icon: Wheat, bg: "bg-amber-50", color: "text-amber-700" },
      { label: "Sushi", icon: Soup, bg: "bg-stone-50", color: "text-stone-600" },
      { label: "Otro", icon: Store, bg: "bg-stone-50", color: "text-stone-400" },
    ]
  },
  services: {
    label: "Servicios",
    subcategories: [
      { label: "Alarmas-Seguridad", icon: Shield, bg: "bg-blue-50", color: "text-blue-600" },
      { label: "Cerrajero", icon: KeyRound, bg: "bg-gray-50", color: "text-gray-600" },
      { label: "Construcción", icon: Building, bg: "bg-amber-50", color: "text-amber-600" },
      { label: "Desinfecciones", icon: Bug, bg: "bg-lime-50", color: "text-lime-600" },
      { label: "Electricidad", icon: Zap, bg: "bg-yellow-50", color: "text-yellow-600" },
      { label: "Fletes", icon: Truck, bg: "bg-orange-50", color: "text-orange-700" },
      { label: "Gasista", icon: Flame, bg: "bg-orange-50", color: "text-orange-600" },
      { label: "Herrero", icon: Hammer, bg: "bg-zinc-50", color: "text-zinc-600" },
      { label: "Impermeabilizaciones", icon: Waves, bg: "bg-teal-50", color: "text-teal-700" },
      { label: "Paisajismo y Jardines", icon: Leaf, bg: "bg-green-50", color: "text-green-600" },
      { label: "Limpieza", icon: Sparkles, bg: "bg-teal-50", color: "text-teal-600" },
      { label: "Mecánica", icon: Car, bg: "bg-stone-50", color: "text-stone-600" },
      { label: "Movimiento de suelos", icon: HardHat, bg: "bg-yellow-50", color: "text-yellow-700" },
      { label: "Perforaciones", icon: Droplets, bg: "bg-cyan-50", color: "text-cyan-600" },
      { label: "Piletero", icon: Waves, bg: "bg-sky-50", color: "text-sky-600" },
      { label: "Pintor", icon: Paintbrush, bg: "bg-purple-50", color: "text-purple-600" },
      { label: "Plomería", icon: Wrench, bg: "bg-blue-50", color: "text-blue-600" },
      { label: "Venta de áridos", icon: Mountain, bg: "bg-stone-50", color: "text-stone-600" },
      { label: "Profesionales", icon: Briefcase, bg: "bg-violet-50", color: "text-violet-600" },
      { label: "Zinguero", icon: Home, bg: "bg-slate-50", color: "text-slate-600" },
      { label: "Carteles tallados", icon: Tag, bg: "bg-amber-50", color: "text-amber-700" },
      { label: "Costurera/Modista", icon: Scissors, bg: "bg-pink-50", color: "text-pink-600" },
      { label: "Escuela de Equitación", icon: PersonStanding, bg: "bg-amber-50", color: "text-amber-700" },
      { label: "Traslados", icon: Car, bg: "bg-blue-50", color: "text-blue-600" },
      { label: "Auxilio y Remolque", icon: AlertCircle, bg: "bg-orange-50", color: "text-orange-600" },
      { label: "Servicios audiovisuales", icon: Video, bg: "bg-indigo-50", color: "text-indigo-600" },
      { label: "Higiene y seguridad laboral", icon: ShieldCheck, bg: "bg-emerald-50", color: "text-emerald-600" },
      { label: "Licenciado en higiene y seguridad", icon: ClipboardList, bg: "bg-teal-50", color: "text-teal-700" },
      { label: "Bombas y Motores eléctricos", icon: Cog, bg: "bg-cyan-50", color: "text-cyan-700" },
      { label: "Alquiler de autos", icon: Car, bg: "bg-blue-50", color: "text-blue-600" },
      { label: "Compostura de calzado", icon: Scissors, bg: "bg-amber-50", color: "text-amber-700" },
      { label: "Refrigeración", icon: Snowflake, bg: "bg-slate-50", color: "text-slate-400" },
      { label: "Papelería creativa", icon: Palette, bg: "bg-stone-50", color: "text-stone-500" },
      { label: "Máquinas de coser", icon: Cog, bg: "bg-slate-50", color: "text-slate-600" },
      { label: "Comisiones", icon: CreditCard, bg: "bg-emerald-50", color: "text-emerald-700" },
      { label: "Otro", icon: Sparkles, bg: "bg-stone-50", color: "text-stone-400" },
    ]
  },
  commerce: {
    label: "Comercios",
    subcategories: [
      { label: "Accesorios", icon: Gem, bg: "bg-pink-50", color: "text-pink-600" },
      { label: "Fábrica de Espumantes", icon: Wine, bg: "bg-rose-50", color: "text-rose-700" },
      { label: "Forrajería", icon: Package, bg: "bg-amber-50", color: "text-amber-700" },
      { label: "Hogar", icon: Armchair, bg: "bg-orange-50", color: "text-orange-700" },
      { label: "Imprenta", icon: Printer, bg: "bg-slate-50", color: "text-slate-600" },
      { label: "Indumentaria", icon: Shirt, bg: "bg-pink-50", color: "text-pink-600" },
      { label: "Inmobiliarias", icon: Building, bg: "bg-blue-50", color: "text-blue-600" },
      { label: "Mascotas", icon: Dog, bg: "bg-amber-50", color: "text-amber-600" },
      { label: "Niños", icon: Baby, bg: "bg-indigo-50", color: "text-indigo-600" },
      { label: "Salud", icon: HeartPulse, bg: "bg-green-50", color: "text-green-600" },
      { label: "Tecnología", icon: Smartphone, bg: "bg-blue-50", color: "text-blue-600" },
      { label: "Vehículos", icon: Car, bg: "bg-red-50", color: "text-red-600" },
      { label: "Verdulería", icon: Leaf, bg: "bg-green-50", color: "text-green-600" },
      { label: "Veterinarias", icon: Dog, bg: "bg-teal-50", color: "text-teal-600" },
      { label: "Cuero Argentino", icon: Briefcase, bg: "bg-stone-50", color: "text-stone-600" },
      { label: "Otro", icon: Store, bg: "bg-stone-50", color: "text-stone-400" },
    ]
  },
  health: {
    label: "Salud",
    subcategories: [
      { label: "Clínicas y Consultorios", icon: Building, bg: "bg-blue-50", color: "text-blue-600" },
      { label: "Especialidades", icon: Stethoscope, bg: "bg-purple-50", color: "text-purple-600" },
      { label: "Hospitales y Dispensarios", icon: AlertCircle, bg: "bg-red-50", color: "text-red-600" },
      { label: "Laboratorios", icon: FlaskConical, bg: "bg-cyan-50", color: "text-cyan-600" },
      { label: "Osteopatía", icon: Bone, bg: "bg-amber-50", color: "text-amber-600" },
      { label: "Psicología", icon: Brain, bg: "bg-indigo-50", color: "text-indigo-600" },
      { label: "Terapias alternativas", icon: Leaf, bg: "bg-green-50", color: "text-green-600" },
      { label: "Traslado de pacientes", icon: Ambulance, bg: "bg-sky-50", color: "text-sky-600" },
    ]
  },
  education: {
    label: "Educación",
    subcategories: [
      { label: "Arte y Música", icon: Music, bg: "bg-pink-50", color: "text-pink-600" },
      { label: "Colegios", icon: GraduationCap, bg: "bg-indigo-50", color: "text-indigo-600" },
      { label: "Idiomas", icon: Languages, bg: "bg-violet-50", color: "text-violet-600" },
      { label: "Maestras/os Particulares", icon: Users, bg: "bg-orange-50", color: "text-orange-600" },
      { label: "Universidad/Terciario", icon: BookOpen, bg: "bg-blue-50", color: "text-blue-600" },
    ]
  },
  sports: {
    label: "Deportes",
    subcategories: [
      { label: "Fútbol", icon: Trophy, bg: "bg-green-50", color: "text-green-600" },
      { label: "Rugby", icon: Shield, bg: "bg-emerald-50", color: "text-emerald-700" },
      { label: "Hockey", icon: Zap, bg: "bg-lime-50", color: "text-lime-700" },
      { label: "Básquet", icon: Activity, bg: "bg-orange-50", color: "text-orange-600" },
      { label: "Vóley", icon: Users, bg: "bg-indigo-50", color: "text-indigo-600" },
      { label: "Handball", icon: Users, bg: "bg-pink-50", color: "text-pink-600" },
      { label: "Fausball", icon: Trophy, bg: "bg-yellow-50", color: "text-yellow-700" },
      { label: "Pádel", icon: Activity, bg: "bg-blue-50", color: "text-blue-600" },
      { label: "Tenis", icon: Activity, bg: "bg-yellow-50", color: "text-yellow-600" },
      { label: "Natación", icon: Waves, bg: "bg-sky-50", color: "text-sky-600" },
      { label: "Ciclismo", icon: Bike, bg: "bg-orange-50", color: "text-orange-600" },
      { label: "Trekking / Montaña", icon: Mountain, bg: "bg-stone-50", color: "text-stone-600" },
      { label: "Yoga / Pilates", icon: PersonStanding, bg: "bg-purple-50", color: "text-purple-600" },
      { label: "Gimnasio", icon: Dumbbell, bg: "bg-red-50", color: "text-red-600" },
      { label: "Artes marciales", icon: Wind, bg: "bg-zinc-50", color: "text-zinc-600" },
      { label: "Running", icon: Timer, bg: "bg-amber-50", color: "text-amber-600" },
      { label: "Otro", icon: Sparkles, bg: "bg-stone-50", color: "text-stone-400" },
    ]
  },
  tourism: {
    label: "Turismo",
    subcategories: [
      { label: "Actividades y Paseos", icon: Activity, bg: "bg-orange-50", color: "text-orange-600" },
      { label: "Agencia de Viajes", icon: Plane, bg: "bg-blue-50", color: "text-blue-600" },
      { label: "Alojamiento", icon: Hotel, bg: "bg-sky-50", color: "text-sky-600" },
      { label: "Alquiler", icon: Bike, bg: "bg-stone-50", color: "text-stone-600" },
      { label: "Excursiones", icon: Map, bg: "bg-green-50", color: "text-green-600" },
    ]
  }
}