# Calamuchita App

Directorio digital y plataforma gastronómica para el Valle de Calamuchita, Córdoba, Argentina.

Conecta a turistas y residentes con los comercios, servicios y restaurantes de las 16 localidades del valle. Los negocios pueden gestionar su carta, menú del día, reservas y pedidos desde un dashboard propio. Los administradores tienen control total sobre la plataforma.

---

## Stack

| Tecnología | Uso |
|---|---|
| Next.js 16 (App Router) | Framework principal, SSR, rutas |
| React 19 | UI |
| TypeScript 5 | Tipado estático |
| Tailwind CSS 4 | Estilos |
| Supabase | Base de datos (PostgreSQL), autenticación, storage |
| Framer Motion 12 | Animaciones |
| Lucide React | Iconografía |
| Lenis | Smooth scrolling |

---

## Funcionalidades

### Sitio Público

- **Hero con búsqueda global** — filtra negocios por nombre o categoría
- **Directorio por secciones** — 8 secciones con subcategorías:
  - Gastronomía, Servicios, Salud, Educación, Turismo, Comercios, Eventos, Info útil
- **Teléfonos Útiles** — contactos de emergencia (Bomberos, Policía, Salud, Cooperativa) para las 16 localidades, con selector de pueblo, tarjetas glassmorphism y botón de copia
- **Detalle de negocio** — carta interactiva, galería de fotos, reserva por WhatsApp, horarios
- **Barra sticky de categorías** — navegación rápida entre secciones

### Dashboard — Rol `business`

- Métricas en tiempo real (pedidos activos, reservas del día, estado del menú)
- Gestión del **menú del día** (publicar, editar, dar de baja)
- Gestión de **carta completa** (categorías, ítems, precios, disponibilidad)
- Configuración del perfil del negocio (datos, horarios, fotos, logo)
- Vista de **pedidos** (takeaway y delivery) con estados
- Vista de **reservas** con confirmación

### Panel Admin — Rol `admin`

- Estadísticas globales de la plataforma
- CRUD completo de negocios (alta, edición, suspensión)
- Gestión del menú del día de cualquier negocio
- Gestión de contactos útiles

---

## Pendiente / En progreso

| Funcionalidad | Estado | Detalle |
|---|---|---|
| Carrusel de Menús del Día | ✅ Implementado | Conectado a `daily_menus` + `businesses` + `daily_menu_items`. Prioriza la localidad activa. |
| Stats Section | ✅ Implementado | Fetch server-side en page.tsx con `head:true`. Pueblos desde constante, comercios y categorías desde Supabase. |
| Suscripciones | Sin UI | El tipo `Subscription` está definido en `database.ts` pero no hay componente ni página de gestión |
| WebGLBackground | Sin usar | El componente existe pero no está integrado en ninguna página |

---

## Roles de Usuario

| Rol | Acceso |
|---|---|
| `customer` | Sitio público completo |
| `business` | Sitio público + `/dashboard` |
| `admin` | Sitio público + `/dashboard` + `/admin` |

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/                  # Login, registro
│   ├── (public)/                # Sitio público
│   │   ├── page.tsx             # Home
│   │   ├── buscar/              # Búsqueda global
│   │   ├── negocios/[slug]/     # Detalle gastronómico
│   │   └── directorio/[section]/[slug]/
│   ├── dashboard/               # Panel de negocio
│   │   ├── menu-del-dia/
│   │   ├── carta/
│   │   ├── configuracion/
│   │   └── reservas/
│   └── admin/                   # Panel admin
│       └── negocios/[id]/
│
├── components/
│   ├── public/                  # 23 componentes del sitio público
│   ├── shared/                  # Header, Footer
│   ├── dashboard/               # 7 componentes del panel de negocio
│   ├── admin/                   # 6 componentes del panel admin
│   └── ui/                      # 17 utilidades reutilizables
│
├── lib/
│   ├── supabase/                # Clientes browser y server
│   ├── context/
│   │   └── LocalidadContext.tsx # Estado global de localidad activa
│   ├── constants/
│   │   ├── telefonos.ts         # Teléfonos útiles por localidad
│   │   └── categories.ts        # Categorías del directorio
│   └── sections.ts              # Secciones + subcategorías + rutas
│
└── types/
    └── database.ts              # Tipos de todas las entidades
```

---

## Localidades

16 localidades del Valle de Calamuchita con teléfonos de emergencia:

Villa General Belgrano · Santa Rosa de Calamuchita · La Cumbrecita · Los Reartes · Embalse · Amboy · Villa del Dique · Villa Rumipal · Potrero de Garay · Villa Yacanto · Villa Alpina · Villa Berna · Villa Ciudad Parque · Villa Quillinzo · La Cruz · Intiyaco

---

## Paleta de Colores

```
brand-sand     #E1DBC9   Fondo base
brand-pine     #2D4530   Verde profundo — textos principales
brand-slate    #6B7B84   Gris azulado
brand-earth    #5E4B3B   Marrón tierra
brand-charcoal #3C3C3C   Carbón
```

---

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Completar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY

# Iniciar en desarrollo
npm run dev
```

---

## Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Scripts

```bash
npm run dev      # Desarrollo local (http://localhost:3000)
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Lint del código
```

---

## Rutas Principales

```
/                                   Home
/buscar?q=                          Búsqueda global
/negocios                           Listado gastronómico
/negocios/[slug]                    Detalle de negocio
/directorio/[section]               Directorio por sección
/directorio/[section]/[slug]        Detalle de directorio
/login                              Iniciar sesión
/registro                           Crear cuenta
/dashboard                          Panel de negocio
/admin                              Panel administrador
```
