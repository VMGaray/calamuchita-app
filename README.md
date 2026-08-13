# Calamuchita App

Directorio digital y plataforma gastronómica para el Valle de Calamuchita, Córdoba, Argentina.

Conecta a turistas y residentes con los comercios, servicios y restaurantes de las 16 localidades del valle. Los negocios gastronómicos pueden gestionar su carta, menú del día, reservas y pedidos desde un dashboard propio. Los administradores tienen control total sobre la plataforma.

---

## Stack

| Tecnología | Uso |
|---|---|
| Next.js (App Router) | Framework principal, SSR, rutas |
| React 19 | UI |
| TypeScript 5 | Tipado estático |
| Tailwind CSS 4 | Estilos (con `@theme` CSS variables) |
| Supabase | PostgreSQL, autenticación, storage |
| Framer Motion | Animaciones |
| Lucide React | Iconografía |
| Mapbox GL / react-map-gl | Mapa interactivo de comercios |
| qrcode.react | Generación de QR en canvas |
| Recharts | Gráficos de estadísticas |
| Swiper | Carruseles (menú del día, galería) |
| Lenis | Smooth scrolling |
| next-pwa (`@ducanh2912`) | Progressive Web App (service worker, manifest) |

---

## Funcionalidades

### Sitio Público

- **Hero con búsqueda global** — filtra negocios por nombre o categoría
- **JoyasDelValle** — marquee infinito RAF-based de negocios destacados con navegación manual
- **Directorio por secciones** — 8 secciones con subcategorías: Gastronomía, Servicios, Salud, Educación, Turismo, Comercios, Eventos, Info útil
- **Menús del día** — carrusel de menús diarios publicados por los restaurantes
- **Teléfonos Útiles** — contactos de emergencia (Bomberos, Policía, Salud, Cooperativa) para las 16 localidades
- **Detalle de negocio** — carta interactiva, menú del día, reserva por WhatsApp, horarios, servicios, mapa
- **Profesionales en clínicas** — los profesionales de salud cargados dentro de una clínica también aparecen en la vista de su especialidad (Psicología, Terapias, Especialidades, etc.)
- **Barra sticky de categorías** — grid 2×4 en mobile, barra horizontal en desktop
- **Sistema de leads** — botón WhatsApp sticky en mobile que registra contactos
- **SEO dinámico** — `generateMetadata` por negocio con Open Graph y Twitter Cards
- **Agenda de eventos** — listado filtrable por localidad con detalle y galería de fotos
- **Mapa interactivo** — comercios geolocalizados sobre Mapbox con popup de detalle
- **Página de planes** (`/unite`) — landing para negocios con tres planes y banner "Club Fundadores"
- **Política de privacidad** (`/politica-de-privacidad`) — página estática con política de privacidad del sitio
- **Eliminar cuenta** (`/eliminar-cuenta`) — formulario para que usuarios soliciten la baja de su cuenta

### Auth — Gastronómicos

- Ruta `/gastronomicos` con dos formularios en una misma página: **login** y **registro**
- El registro es exclusivo para negocios (`role: "business"`), crea una fila en `pending_registrations` y queda pendiente de aprobación admin
- Una vez aprobado, el gastronómico puede acceder al dashboard
- `/registro` redirige a `/gastronomicos` (flujo unificado)
- El admin accede por `/login` (footer del sitio público)

### Dashboard — Rol `business`

- **Inicio** — métricas del día (pedidos, reservas, menú), toggle abierto/cerrado, pedidos recientes
- **Menú del día** — publicar, editar, usar menú del día anterior como base
- **Carta** — categorías y platos con nombre, descripción, precio, disponibilidad y foto
- **Pedidos** — delivery y take away con estados (nuevo → confirmado → listo → entregado), realtime via Supabase
- **Reservas** — confirmación/rechazo, vista por fecha, realtime
- **Estadísticas** — vistas al perfil, contactos generados, pedidos y facturación del mes
- **Mi local** — datos, descripción, logo, fotos, horarios de atención (con 2° turno), coordenadas (soporta link de Google Maps o decimal), servicios, formas de pago, carta PDF
- **Estado pendiente** — si la cuenta está pendiente de aprobación, se muestra `DashboardPending` con botón de contacto por WhatsApp y actualización en tiempo real cuando el admin aprueba

### Panel Admin — Rol `admin`

- **Dashboard** — métricas globales: negocios, usuarios, vistas, contactos WhatsApp, eventos
- **Negocios** — CRUD completo, filtro por sección, toggle estado, analytics por fila
- **Solicitudes** — listado de gastronómicos pendientes de aprobación con acciones aprobar/rechazar
- **Eventos** — crear, listar y editar eventos con galería de imágenes múltiples
- **Promociones** — listado con badge de descuento, estado y toggle
- **Suscripciones** — CRUD por negocio: estado (trial/activa/vencida/cancelada), precio, ciclo (mensual/anual), fechas, notas. Resumen con contadores y filtro rápido
- **Marketing App** — generador de QR para la home, descarga PNG y calcomanía A5
- **Vista gastronómico** — preview del panel de negocio para mostrarle a clientes cómo se ve el dashboard
- **Info Útil** — 4 pestañas: Contactos útiles, Localidades, Servicios, Transporte
- **QR por negocio** — en cada ficha de edición, QR del perfil público con descarga e impresión A5

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
| `customer` | Sitio público completo |
| `business` | Sitio público + `/dashboard` |
| `admin` | Sitio público + `/dashboard` + `/admin` |

El rol `business` se guarda en `user.user_metadata.role`. El rol `admin` se guarda en la tabla `profiles`.

---

## Protección de Rutas

- **Middleware** (`middleware.ts`) — redirige `/dashboard` y `/admin` si no hay sesión activa
- **Layout `/dashboard`** — verifica `user_metadata.role === "business"` o `profiles.role === "admin"`. Si el negocio no está aprobado aún, muestra `DashboardPending`
- **Layout `/admin`** — verifica `profiles.role === "admin"`, redirige si no

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/                  # Login
│   │   └── login/
│   ├── (public)/                # Sitio público
│   │   ├── page.tsx             # Home
│   │   ├── buscar/              # Búsqueda global
│   │   └── directorio/[section]/[slug]/
│   ├── gastronomicos/           # Auth de gastronómicos (login + registro + aprobación)
│   ├── eventos/                 # Agenda pública
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── unite/                   # Landing de planes para negocios
│   ├── mapa/                    # Mapa interactivo (Mapbox)
│   ├── dashboard/               # Panel de negocio (requiere rol business/admin)
│   │   ├── page.tsx             # Inicio — métricas del día
│   │   ├── menu-del-dia/
│   │   ├── carta/
│   │   ├── pedidos/
│   │   ├── reservas/
│   │   ├── estadisticas/
│   │   └── configuracion/       # Mi local
│   └── admin/                   # Panel admin
│       ├── page.tsx             # Dashboard global
│       ├── negocios/[id]/
│       ├── solicitudes/         # Aprobación de gastronómicos
│       ├── eventos/
│       ├── promociones/
│       ├── suscripciones/
│       ├── marketing/
│       ├── info-util/
│       └── gastronomicos/       # Vista previa del dashboard para admin
│
├── components/
│   ├── public/                  # DirectorioList, DirectorioDetalle, etc.
│   ├── shared/                  # Header, Footer
│   ├── dashboard/               # DashboardHome, CartaManager, PedidosDashboard,
│   │                            #   ReservasDashboard, EstadisticasDashboard,
│   │                            #   MenuDelDia, ConfiguracionLocal, Sidebar,
│   │                            #   DashboardPending
│   ├── admin/                   # AdminHome, AdminNegocios, AdminNegocioForm,
│   │                            #   AdminNegocioEdit, AdminSolicitudes,
│   │                            #   AdminSuscripciones, AdminPromociones,
│   │                            #   AdminInfoUtil, AdminSidebar, QRMarketing
│   ├── events/
│   └── ui/                      # ImageUpload, PdfUpload, HorariosEditor,
│                                #   AnimateIn, Card3D, Skeleton, etc.
│
├── lib/
│   ├── supabase/                # Clientes browser y server (@supabase/ssr)
│   ├── hooks/
│   ├── context/
│   │   └── LocalidadContext.tsx
│   ├── constants/
│   │   ├── telefonos.ts
│   │   └── categories.ts
│   └── sections.ts              # Secciones + subcategorías + rutas del directorio
│
└── middleware.ts                 # Protección de rutas /dashboard y /admin
```

---

## Rutas Principales

```
/                                   Home
/buscar?q=                          Búsqueda global
/directorio/[section]               Directorio por sección
/directorio/[section]/[slug]        Detalle de negocio
/directorio/health?cat=psicologia   Filtro por especialidad (salud)
/eventos                            Agenda del Valle
/eventos/[id]                       Detalle de evento
/mapa                               Mapa interactivo
/gastronomicos                      Login + registro para gastronómicos
/unite                              Landing de planes para negocios
/dashboard                          Inicio del panel de negocio
/dashboard/menu-del-dia             Menú del día
/dashboard/carta                    Gestión de carta
/dashboard/pedidos                  Pedidos en tiempo real
/dashboard/reservas                 Reservas
/dashboard/estadisticas             Estadísticas del negocio
/dashboard/configuracion            Mi local (perfil, horarios, fotos, coordenadas)
/admin                              Panel administrador
/admin/negocios                     Listado y gestión de negocios
/admin/negocios/[id]                Edición de negocio + QR
/admin/solicitudes                  Solicitudes de registro pendientes
/admin/eventos                      Gestión de eventos
/admin/promociones                  Gestión de promociones
/admin/suscripciones                Gestión de suscripciones
/admin/marketing                    QR general + calcomanías
/admin/info-util                    Contactos, localidades, servicios, transporte
/admin/gastronomicos                Vista previa del dashboard (demo para clientes)
/politica-de-privacidad             Política de privacidad
/eliminar-cuenta                    Solicitud de baja de cuenta
```

---

## Base de Datos — Tablas Principales

### `businesses`
Negocio o comercio del directorio.

Campos clave: `id`, `name`, `slug`, `section`, `subcategory`, `categories`, `status` (`pending`/`active`/`inactive`), `owner_id`, `is_premium`, `total_views`, `total_leads`, `latitude`, `longitude`, `professionals` (JSONB), `medical_specialties`, `health_coverages`, `has_24h_guard`, `payment_methods`, `pet_friendly`, `logo_url`, `cover_url`, `menu_pdf_url`.

### `profiles`
Tabla con rol del usuario (para detectar admins).

```sql
CREATE TABLE profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role text NOT NULL DEFAULT 'customer',
  created_at timestamptz DEFAULT now()
);
```

### `pending_registrations`
Solicitudes de registro de gastronómicos pendientes de aprobación.

```sql
CREATE TABLE pending_registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  business_name text,
  approval_status text NOT NULL DEFAULT 'pending'
    CHECK (approval_status IN ('pending','approved','rejected')),
  created_at timestamptz DEFAULT now()
);
```

### `business_hours`
Horarios de atención (hasta 2 turnos por día).

```sql
CREATE TABLE business_hours (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL,  -- 0=Dom ... 6=Sáb
  opens_at time NOT NULL,
  closes_at time NOT NULL,
  is_closed boolean NOT NULL DEFAULT false
);
```

### `business_photos`
Galería de fotos del negocio.

```sql
CREATE TABLE business_photos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  url text NOT NULL,
  sort_order integer DEFAULT 0
);
```

### `business_leads`
Registro de contactos generados (WhatsApp, teléfono, reserva).

```sql
CREATE TABLE business_leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('whatsapp','phone','reserva')),
  created_at timestamptz DEFAULT now()
);
```

### `orders` / `order_items`
Pedidos (delivery y take away).

```sql
CREATE TABLE orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('delivery','takeaway')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','ready','delivered','cancelled')),
  total numeric NOT NULL DEFAULT 0,
  customer_name text,
  customer_phone text,
  delivery_address text,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  item_price numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 1
);
```

### `reservations`
Reservas de mesa.

```sql
CREATE TABLE reservations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  date date NOT NULL,
  time time NOT NULL,
  party_size integer NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','cancelled')),
  notes text,
  created_at timestamptz DEFAULT now()
);
```

### `daily_menus` / `daily_menu_items`
Menú del día.

```sql
CREATE TABLE daily_menus (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  date date NOT NULL,
  is_published boolean NOT NULL DEFAULT false,
  UNIQUE (business_id, date)
);

CREATE TABLE daily_menu_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  daily_menu_id uuid REFERENCES daily_menus(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  includes_drink boolean NOT NULL DEFAULT false,
  image_url text,
  sort_order integer DEFAULT 0
);
```

### `menu_categories` / `menu_items`
Carta permanente del negocio.

```sql
CREATE TABLE menu_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE menu_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  category_id uuid REFERENCES menu_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 0,
  image_url text
);
```

### `subscriptions`

```sql
CREATE TABLE subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'trial' CHECK (status IN ('trial','active','overdue','cancelled')),
  price numeric NOT NULL DEFAULT 0,
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','yearly')),
  current_period_start date NOT NULL,
  current_period_end date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);
```

### `events`

```sql
CREATE TABLE events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  localidad text,
  date_description text,
  category text DEFAULT 'festival',
  image_url jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);
```

### Tablas Info Útil

```sql
CREATE TABLE localities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE useful_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  phone text,
  address text,
  schedule text,
  category text NOT NULL DEFAULT 'other',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE utility_services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  locality_id uuid REFERENCES localities(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  phone text,
  address text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE transport_schedules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company text NOT NULL,
  origin_id uuid REFERENCES localities(id),
  destination_id uuid REFERENCES localities(id),
  departure_time text NOT NULL,
  arrival_time text,
  days text[] NOT NULL DEFAULT '{}',
  notes text,
  is_active boolean NOT NULL DEFAULT true
);
```

---

## Analytics

| Métrica | Dónde | Cómo |
|---|---|---|
| Vistas al perfil | Detalle de negocio | RPC `increment_view` al montar |
| Contactos (WhatsApp, teléfono, reserva) | Botones de contacto público | Insert en `business_leads` (ver tabla más abajo) |

```sql
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS total_views integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION increment_view(business_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE businesses SET total_views = total_views + 1 WHERE id = business_id;
$$;

-- Policy necesaria para que el insert público a business_leads funcione
-- (sin esto el insert falla en silencio y ningún contacto queda registrado):
CREATE POLICY "Cualquiera puede registrar un lead"
  ON business_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

`businesses.total_leads` existió como columna pero quedó sin uso real (solo la
incrementaba un componente que nunca se renderizaba) — el panel admin y el
dashboard del negocio calculan los contactos contando filas de `business_leads`.

---

## Storage Buckets (Supabase)

| Bucket | Uso |
|---|---|
| `logos` | Logos de negocios |
| `covers` | Fotos de portada |
| `gallery` | Fotos adicionales del negocio |
| `menu-items` | Fotos de platos de la carta |
| `professionals` | Fotos de profesionales de salud |
| `event-images` | Imágenes de eventos |

Todos públicos (lectura pública, escritura autenticada).

---

## PWA

La app está configurada como Progressive Web App con `@ducanh2912/next-pwa`.

- `public/manifest.json` — nombre, colores, íconos
- `public/icons/` — íconos en múltiples tamaños incluyendo `icon-512-maskable.png` (para Android adaptive icons)
- El service worker se genera automáticamente en build de producción
- `assetlinks.json` en `/public/.well-known/` habilita TWA (Trusted Web Activity) en Android con el SHA-256 del certificado de firma de Google Play

---

## Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=
```

---

## Localidades

16 localidades del Valle de Calamuchita:

Villa General Belgrano · Santa Rosa de Calamuchita · La Cumbrecita · Los Reartes · Embalse · Amboy · Villa del Dique · Villa Rumipal · Potrero de Garay · Villa Yacanto · Villa Alpina · Villa Berna · Villa Ciudad Parque · Villa Quillinzo · La Cruz · Intiyaco

---

## Instalación

```bash
npm install
cp .env.example .env.local
# Completar variables de entorno
npm run dev
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

## Pendiente / En progreso

| Funcionalidad | Estado |
|---|---|
| Suscripciones — vista en dashboard del negocio | Admin gestiona suscripciones; falta vista `/dashboard` para que el negocio vea su propio estado |
| Paginación del directorio | Sin implementar |
| Selector de localidad en formulario de eventos | El campo usa texto libre; sin selector de `localities` |
| WebGLBackground | Componente creado, sin integrar |
| Push notifications para pedidos | Sin implementar |
