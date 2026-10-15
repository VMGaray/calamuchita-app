# Calamuchita App

Directorio digital y plataforma gastronómica para el Valle de Calamuchita, Córdoba, Argentina.

Conecta a turistas y residentes con los comercios, servicios y restaurantes de las localidades del valle. Los negocios gastronómicos gestionan su carta, menú del día, pedidos y reservas desde un dashboard propio; los clientes piden y reservan **sin necesidad de crear cuenta**. Los administradores tienen control total sobre la plataforma.

---

## Stack

| Tecnología | Uso |
|---|---|
| Next.js 16 (App Router) | Framework principal, SSR, rutas |
| React 19 | UI |
| TypeScript 5 | Tipado estático |
| Tailwind CSS 4 | Estilos (con `@theme` CSS variables) |
| Supabase | PostgreSQL, autenticación, storage, realtime |
| Resend | Emails transaccionales (alta, aprobación y rechazo de negocios) |
| Framer Motion | Animaciones |
| Lucide React | Iconografía |
| Mapbox GL / react-map-gl | Mapa interactivo y selector de ubicación |
| qrcode.react | Generación de QR en canvas |
| Recharts | Gráficos de estadísticas |
| Swiper | Carruseles (menú del día, galería) |
| Lenis | Smooth scrolling |
| next-pwa (`@ducanh2912`) | Progressive Web App (service worker, manifest) |

> El build de producción usa webpack (`next build --webpack`) porque next-pwa todavía no soporta Turbopack.

---

## Funcionalidades

### Sitio Público

- **Hero con búsqueda global** — filtra negocios por nombre o categoría
- **JoyasDelValle** — marquee infinito de negocios destacados con navegación manual
- **Directorio por secciones** — Gastronomía, Servicios, Comercios, Salud, Educación, Turismo, Deportes, Eventos, Info útil. Los negocios pueden figurar además en secciones extra (`extra_sections`)
- **Grupos de rubros en Servicios** — grupos → rubros, definidos en código (`SERVICE_GROUPS` en `src/lib/constants/categories.ts`)
- **Gastronomía** (`/negocios`) — filtros por categoría, abierto ahora, delivery, take away, búsqueda y opciones alimentarias (sin TACC, vegano, etc.)
- **Perfil de negocio** — gastronómicos en `/negocios/[slug]`; el resto en `/directorio/[section]/[slug]` (la URL vieja de gastronomía redirige). Carta interactiva, menú del día, galería, horarios, servicios, mapa, promoción vigente
- **Pedidos sin cuenta** — carrito con delivery / take away (solo los que el local ofrece), creados vía RPC `crear_pedido`
- **Reservas sin cuenta** — botón *Reservar* en locales que aceptan reservas, creadas vía RPC `crear_reserva`
- **Carta pública** — etiquetas alimentarias por plato y aviso de servicio de mesa (con o sin cargo)
- **Menú del día** (`/menu-del-dia`) — carrusel de menús diarios publicados por los restaurantes (fechas en hora de Argentina)
- **Destacados** (`/destacados`) — negocios premium
- **Novedades** (`/novedades`) — avisos de corto plazo con vencimiento y localidad
- **Identidad Calamuchitana** (`/identidad-calamuchitana/[id]`) — notas editoriales (entrevistas, efemérides, tips, noticias)
- **Info Útil** (`/info-util`) — servicios por localidad, farmacias y veterinarias de guardia, transporte, contactos de emergencia
- **Profesionales en clínicas** — los profesionales de salud cargados dentro de una clínica también aparecen en la vista de su especialidad
- **Sistema de leads** — botones de WhatsApp / teléfono / reserva que registran contactos
- **SEO dinámico** — `generateMetadata` por negocio con Open Graph y Twitter Cards
- **Agenda de eventos** — listado filtrable por localidad con detalle y galería
- **Mapa interactivo** — comercios geolocalizados sobre Mapbox
- **Página de planes** (`/unite`) — landing para negocios con planes y banner "Club Fundadores"
- **Política de privacidad** y **Eliminar cuenta** — páginas requeridas por Google Play

### Auth

- Ruta `/gastronomicos` con **login** y **registro** en la misma página (también es donde inicia sesión el admin)
- El registro es exclusivo para negocios (`role: "business"`), crea una fila en `pending_registrations` (con la categoría elegida) y notifica al admin por email
- Al aprobar o rechazar, el negocio recibe un email (`/api/send-email`, Resend)
- Recuperación de contraseña en `/reset-password`; los links de email pasan por `/auth/callback`

### Dashboard — Rol `business`

Hay dos variantes según la categoría del negocio (`isRestaurante` en `src/lib/utils/business.ts`):

**Restaurantes** (Inicio, Menú del día, Carta, Pedidos, Reservas, Estadísticas, Mi local)

- **Inicio** — métricas del día, toggle abierto/cerrado, pedidos recientes
- **Menú del día** — publicar, editar, usar el del día anterior como base
- **Carta** — categorías y platos con precio, disponibilidad, foto y etiquetas alimentarias; configuración de servicio de mesa
- **Pedidos** — estados Pendiente → Confirmado → Listo → Entregado / Cancelado; pestañas Activos, Historial y Todos; realtime
- **Reservas** — Confirmar / Rechazar y luego Completada / No se presentó; pestañas Próximas, Hoy, Historial y Todas; realtime
- **Estadísticas** — vistas y contactos por período

**Viandas y otros** (Inicio, Menú del día, Mi carta, Mi local) — carta simplificada con PDF, link o fotos de la carta

**Mi local** (ambas) — datos, logo, portada, galería de hasta 8 fotos (con orden y redimensionado), horarios con 2° turno, ubicación con mapa y geocodificación, pueblo, servicios, formas de pago, opciones alimentarias

**Estado pendiente** — si la cuenta no fue aprobada se muestra `DashboardPending`, que se actualiza en tiempo real cuando el admin aprueba

### Panel Admin — Rol `admin`

- **Dashboard** — métricas globales: negocios, usuarios, vistas, contactos, instalaciones de la app
- **Negocios** — alta (hasta 5 fotos de galería), edición, filtro por sección, toggle de estado, QR del perfil con descarga e impresión A5, edición del menú del día de cada negocio
- **Solicitudes** — gastronómicos pendientes de aprobación (badge con contador)
- **Eventos** — crear, listar y editar con galería de imágenes
- **Identidad Calamuchitana** — notas editoriales (`editorial_posts`)
- **Novedades** — avisos con fecha de vencimiento y localidad
- **Estadísticas** — vistas y contactos por período (7 días / 30 días / todo), ranking top 10 y desglose por sección (RPC `admin_activity`)
- **Promociones** — descuentos por negocio con vencimiento
- **Suscripciones** — 7 estados (ver abajo), renovar +1 mes / +1 año, filtros Por vencer y Vencidas, orden por urgencia
- **Marketing** — QR de la home, descarga PNG y calcomanía A5
- **Info Útil** — pestañas Servicios (por localidad), Transporte, Guardias (fotos del cuadro de turnos de farmacias y veterinarias) y Localidades
- **Vista gastronómico** — preview del panel de negocio para mostrar a clientes
- **Configuración** — datos del sitio, contacto y redes (`site_config`)

---

## Suscripciones y visibilidad

| Estado | Visible al público | Vence solo |
|---|---|---|
| `trial` | Sí | No |
| `active` | Sí | Sí |
| `discount` | Sí | Sí |
| `complimentary` (Bonificado) | Sí | Sí |
| `free` (Gratis, sin fecha de fin) | Sí | No |
| `expired` | No | — |
| `suspended` | No | — |

- El vencimiento se **calcula al leer** (estado efectivo): `current_period_end` + 7 días de gracia. No se guarda.
- Estados heredados: `overdue` → `expired`, `cancelled` → `suspended`.
- La visibilidad la decide la base con `public.business_is_public()` y una política RLS **restrictiva** sobre `businesses` (admin y dueño siempre ven su negocio). Las constantes de `src/lib/constants/subscriptions.ts` son solo un espejo para rotular en el panel.
- Fotos y carta "heredan" la visibilidad del negocio (migración B2).

---

## Paleta de Colores

```
Verde Pino   #2D4530   Color primario — botones, sidebar, textos activos
Verde Musgo  #A3B18A   Secundario — focus rings, acentos suaves
Crema        #E1DBC9   Fondo base, textos sobre verde
Verde Claro  #6B8F70   Variante media

Dorado       #C9A44B   Acentos decorativos (badge "Destacado")
Slate        #6B7B84   Gris azulado (estadísticas)
```

Variables CSS (Tailwind 4 `@theme`):

```css
--color-primary-500: #2D4530;   /* verde pino */
--color-primary-300: #A3B18A;   /* verde musgo */
--color-primary-100: #E1DBC9;   /* crema */
```

---

## Roles de Usuario

| Rol | Acceso |
|---|---|
| `customer` | Sitio público completo (no hace falta cuenta para pedir ni reservar) |
| `business` | Sitio público + `/dashboard` |
| `admin` | Sitio público + `/dashboard` + `/admin` |

El rol `business` se guarda en `user.user_metadata.role`. El rol `admin` se guarda en la tabla `profiles` (en SQL se consulta con `public.is_admin()`).

---

## Protección de Rutas

- **Middleware** (`middleware.ts`) — redirige `/dashboard` y `/admin` a `/gastronomicos` si no hay sesión
- **Layout `/dashboard`** — verifica `user_metadata.role === "business"` o `profiles.role === "admin"`. Si el negocio no está aprobado, muestra `DashboardPending`
- **Layout `/admin`** — verifica `profiles.role === "admin"`
- **RLS en Supabase** — la seguridad real vive en las políticas: pedidos y reservas solo se crean por RPC y solo los leen el dueño y el admin; el dueño solo puede cambiar el `status`

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/reset-password/
│   ├── (public)/                    # Sitio público
│   │   ├── page.tsx                 # Home
│   │   ├── buscar/
│   │   ├── negocios/[slug]/         # Gastronomía + perfil gastronómico
│   │   ├── directorio/[section]/[slug]/
│   │   ├── menu-del-dia/
│   │   ├── destacados/
│   │   ├── novedades/[id]/
│   │   ├── identidad-calamuchitana/[id]/
│   │   └── info-util/
│   ├── api/send-email/              # Emails vía Resend
│   ├── auth/callback/               # Intercambio de código de Supabase Auth
│   ├── gastronomicos/               # Login + registro
│   ├── eventos/[id]/
│   ├── mapa/
│   ├── unite/
│   ├── politica-de-privacidad/
│   ├── eliminar-cuenta/
│   ├── ~offline/                    # Fallback offline de la PWA
│   ├── dashboard/                   # Panel de negocio
│   │   ├── menu-del-dia/  carta/  mi-carta/  pedidos/
│   │   ├── reservas/  estadisticas/  configuracion/
│   └── admin/                       # Panel admin
│       ├── negocios/ (nuevo, [id], [id]/menu-del-dia)
│       ├── solicitudes/  eventos/  identidad-calamuchitana/  novedades/
│       ├── stats/  promociones/  suscripciones/  marketing/
│       ├── info-util/  gastronomicos/  configuracion/
│
├── components/
│   ├── public/      # NegocioDetalle, DirectorioDetalle, CartaInteractiva, CarritoDrawer, …
│   ├── dashboard/   # DashboardHome, CartaManager, MiCartaSimple, PedidosDashboard,
│   │                #   ReservasDashboard, ConfiguracionLocal, UbicacionPicker, …
│   ├── admin/       # AdminNegocios, AdminSuscripciones, AdminStats, AdminInfoUtil, …
│   ├── auth/        # RegisterForm, LoginForm, ResetPasswordForm
│   ├── shared/      # Header, Footer
│   ├── events/
│   └── ui/          # ImageUpload, GaleriaFotos, HorariosEditor, DietaryTags, …
│
├── lib/
│   ├── supabase/    # Clientes browser y server (@supabase/ssr)
│   ├── constants/   # categories (rubros y SERVICE_GROUPS), subscriptions, dietary,
│   │                #   gastronomyCategories, telefonos, localidadImages
│   ├── context/     # LocalidadContext, BusinessDashboardContext
│   ├── hooks/
│   ├── utils/       # business, subscriptions, fechas (hora AR), tableService, …
│   ├── email.ts  geocoding.ts  pwa.ts  sections.ts  …
│
└── types/database.ts

supabase/migrations/   # Migraciones numeradas y de la rama de gastronomía
*.sql (raíz)           # Migraciones anteriores (novedades, promociones, suscripciones, grupos)
scripts/               # create-reviewer-user.mjs (usuario revisor de Google Play)
```

---

## Rutas Principales

```
/                                   Home
/buscar?q=                          Búsqueda global
/negocios                           Gastronomía (filtros: categoria, abierto, delivery, takeaway, dieta, q)
/negocios/[slug]                    Perfil de negocio gastronómico
/directorio/[section]               Directorio por sección (?cat= para rubro)
/directorio/[section]/[slug]        Perfil de negocio no gastronómico
/menu-del-dia                       Menús del día
/destacados                         Negocios destacados
/novedades  ·  /novedades/[id]      Novedades
/identidad-calamuchitana/[id]       Nota editorial
/info-util?categoria=&pueblo=       Info Útil
/eventos  ·  /eventos/[id]          Agenda del Valle
/mapa                               Mapa interactivo
/unite                              Planes para negocios
/gastronomicos                      Login + registro
/reset-password                     Nueva contraseña
/dashboard                          Inicio del panel de negocio
/dashboard/menu-del-dia             Menú del día
/dashboard/carta                    Carta (restaurantes)
/dashboard/mi-carta                 Carta simplificada (viandas y otros)
/dashboard/pedidos                  Pedidos en tiempo real
/dashboard/reservas                 Reservas
/dashboard/estadisticas             Estadísticas
/dashboard/configuracion            Mi local
/admin                              Panel administrador
/admin/negocios[/nuevo|/[id]]       Gestión de negocios
/admin/negocios/[id]/menu-del-dia   Menú del día de un negocio
/admin/solicitudes                  Solicitudes de registro
/admin/eventos                      Eventos
/admin/identidad-calamuchitana      Notas editoriales
/admin/novedades                    Novedades
/admin/stats                        Estadísticas globales
/admin/promociones                  Promociones
/admin/suscripciones                Suscripciones
/admin/marketing                    QR general + calcomanías
/admin/info-util                    Servicios, transporte, guardias, localidades
/admin/gastronomicos                Vista previa del dashboard
/admin/configuracion                Configuración del sitio
/politica-de-privacidad             Política de privacidad
/eliminar-cuenta                    Solicitud de baja de cuenta
```

---

## Base de Datos

Los tipos de referencia están en `src/types/database.ts`. Tablas principales:

| Tabla | Contenido |
|---|---|
| `businesses` | Negocios. Campos clave: `slug`, `section`, `extra_sections`, `category`, `categories`, `subcategory`, `status`, `owner_id`, `is_premium`, `pueblo`, coordenadas, `offers_delivery`/`offers_takeaway`/`offers_dine_in`, `accepts_reservations`, `dietary_options`, `charges_table_service`/`table_service_fee`, `menu_pdf_url`/`menu_link`/`menu_photos_urls`, `total_views` |
| `profiles` | Rol del usuario (`customer` / `business` / `admin`) |
| `pending_registrations` | Solicitudes de alta de gastronómicos (con `category`) |
| `subscriptions` | Una por negocio: estado, precio, ciclo, período, notas, motivo |
| `business_hours` | Horarios (hasta 2 turnos por día) |
| `business_photos` | Galería (tope de 8 por trigger) |
| `menu_categories` / `menu_items` | Carta permanente (`dietary_tags` por plato) |
| `daily_menus` / `daily_menu_items` | Menú del día |
| `orders` / `order_items` | Pedidos; `customer_id` opcional. Solo se crean con `crear_pedido` |
| `reservations` | Reservas; `customer_id` opcional, `customer_name`/`customer_phone`. Solo se crean con `crear_reserva` |
| `promotions` | Promociones por negocio |
| `business_leads` | Contactos (WhatsApp, teléfono, reserva) |
| `events` | Agenda |
| `novedades` | Avisos de corto plazo |
| `editorial_posts` | Identidad Calamuchitana |
| `localities`, `useful_contacts`, `transport_companies`, `guardia_photos` | Info Útil |
| `site_config` | Configuración del sitio (admin) |
| `info_views`, `view_events` | Analytics de Info Útil y eventos con fecha |
| `pwa_devices` | Dispositivos que abren la app instalada |

### Funciones (RPC) usadas desde la app

| Función | Uso |
|---|---|
| `crear_pedido` | Crea pedido + items validando negocio, tipo, productos y precios (salen de `menu_items`). Tope de 3 por teléfono/negocio/hora |
| `crear_reserva` | Crea reserva: hasta 90 días, 1–30 personas, hora de Argentina. Tope de 3 por teléfono/local/hora |
| `increment_view` | Suma una vista al negocio |
| `increment_info_view` | Suma una vista a una categoría de Info Útil |
| `admin_activity` | Vistas y contactos por período para el panel admin |
| `track_pwa_device` / `pwa_stats` | Registro y conteo de instalaciones |

### Migraciones

Se corren a mano en Supabase → SQL Editor. Cada archivo explica en su encabezado qué hace y sus requisitos.

- `supabase/migrations/01..03` — dispositivos PWA, vistas de Info Útil y `view_events`
- `supabase/migrations/gastronomia_A*` — **antes** del merge de `feat/gastronomia`: tope de fotos, opciones alimentarias, servicio de mesa, `crear_pedido`, `crear_reserva`
- `supabase/migrations/gastronomia_B*` — **después** del merge a `main`: Storage por negocio, lectura heredada de fotos/carta, políticas de pedidos y reservas
- Raíz: `suscripciones_funciones_estado.sql` → `suscripciones_politica_visibilidad.sql` (en ese orden), `grupos_servicios_migracion.sql`, novedades, promociones y columnas sueltas

---

## Analytics

| Métrica | Cómo |
|---|---|
| Vistas al perfil | RPC `increment_view` → `businesses.total_views` |
| Contactos (WhatsApp, teléfono, reserva) | Insert en `business_leads` |
| Vistas de Info Útil | RPC `increment_info_view` → `info_views` |
| Actividad por período | Triggers que copian lo anterior en `view_events` (desde el 6/10/2026) |
| Instalaciones de la app | `track_pwa_device` → `pwa_devices` |

`businesses.total_leads` quedó sin uso: los contactos se cuentan sobre `business_leads`.

---

## Storage (Supabase)

| Bucket | Uso |
|---|---|
| `businesses` | Logos, portadas, galería, PDF y fotos de la carta, fotos de platos. Desde el panel del comercio: `<business_id>/<carpeta>/<archivo>` |
| `event-images` | Eventos, novedades e Identidad Calamuchitana (solo admin) |

Lectura pública. Escritura: el admin todo; el dueño solo dentro de la carpeta de su negocio (migración B1).

---

## PWA

Configurada con `@ducanh2912/next-pwa`.

- `src/app/manifest.ts` — nombre, colores, íconos
- `public/icons/` — íconos en varios tamaños, incluido `icon-512-maskable.png`
- El service worker se genera en el build de producción; `/~offline` es la página sin conexión
- `public/.well-known/assetlinks.json` habilita TWA (Trusted Web Activity) para la app de Google Play

---

## Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=
NEXT_PUBLIC_SITE_URL=
RESEND_API_KEY=
```

---

## Localidades

Las localidades se administran desde **Admin → Info Útil → Localidades** (tabla `localities`). Entre ellas:

Villa General Belgrano · Santa Rosa de Calamuchita · La Cumbrecita · Los Reartes · Embalse · Amboy · Villa del Dique · Villa Rumipal · Potrero de Garay · Villa Yacanto · Villa Ciudad de América · Villa Alpina · Villa Berna · Villa Ciudad Parque · Villa Quillinzo · La Cruz · Intiyaco

Las fotos de cada localidad se mapean en `src/lib/constants/localidadImages.ts`.

---

## Instalación

```bash
npm install
# Crear .env.local con las variables de arriba
npm run dev
```

---

## Scripts

```bash
npm run dev      # Desarrollo local (http://localhost:3000)
npm run build    # Build de producción (webpack)
npm run start    # Servidor de producción
npm run lint     # Lint del código
```

---

## Pendiente / En progreso

| Funcionalidad | Estado |
|---|---|
| Suscripciones — vista en el dashboard del negocio | El admin las gestiona; el negocio todavía no ve su propio estado |
| Paginación del directorio | Sin implementar |
| Selector de localidad en el formulario de eventos | Usa texto libre |
| WebGLBackground | Componente creado, sin integrar |
| Push notifications para pedidos y reservas | Sin implementar |
