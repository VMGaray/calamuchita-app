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
| Mapbox GL / react-map-gl | Mapa interactivo de comercios |
| qrcode.react | Generación de QR en canvas |
| Lenis | Smooth scrolling |

---

## Funcionalidades

### Sitio Público

- **Hero con búsqueda global** — filtra negocios por nombre o categoría
- **JoyasDelValle** — marquee infinito RAF-based de negocios destacados con flechas de navegación manual
- **Directorio por secciones** — 8 secciones con subcategorías: Gastronomía, Servicios, Salud, Educación, Turismo, Comercios, Eventos, Info útil
- **Menús del día** — carrusel de menús diarios publicados por los restaurantes
- **Teléfonos Útiles** — contactos de emergencia (Bomberos, Policía, Salud, Cooperativa) para las 16 localidades, con selector de pueblo y tarjetas glassmorphism
- **Detalle de negocio** — carta interactiva, menú del día, reserva por WhatsApp, horarios, servicios
- **Barra sticky de categorías** — grid 2×4 en mobile, barra horizontal en desktop
- **Sistema de leads** — botón WhatsApp sticky en mobile que registra contactos vía RPC `increment_lead`
- **SEO dinámico** — `generateMetadata` por negocio con Open Graph, Twitter Cards y títulos con descuento activo
- **Agenda de eventos** — listado de eventos filtrable por localidad con detalle propio y galería de fotos
- **Mapa interactivo** — comercios geolocalizados sobre Mapbox con popup de detalle y centrado en la ubicación del usuario
- **Página de planes** (`/unite`) — landing para que negocios se sumen a la app: tres planes con precios (Oficios y Servicios $9.000/mes, Comercial $15.000/mes, Gastronómico $35.000/mes) y banner de "Club Fundadores" con primeros meses bonificados

### Dashboard — Rol `business`

- Métricas en tiempo real (pedidos activos, reservas del día, estado del menú)
- Gestión del **menú del día** (publicar, editar, dar de baja)
- Gestión de **carta completa** (categorías, ítems, precios, disponibilidad)
- Configuración del perfil del negocio (datos, horarios, fotos, logo)
- Vista de **pedidos** (takeaway y delivery) con estados
- Vista de **reservas** con confirmación

### Panel Admin — Rol `admin`

- **Dashboard** — métricas globales: negocios activos, pendientes, usuarios, vistas totales, contactos WhatsApp y cantidad de eventos
- **Negocios** — CRUD completo con filtro por sección, ordenamiento por fecha / vistas / contactos, toggle de estado, analytics por fila
- **Eventos** — crear y listar eventos con título, descripción, localidad, fechas libres y galería de imágenes múltiples (storage `event-images`)
- **Promociones** — listado de todas las promos con negocio vinculado, badge de descuento, estado (Activa / Pausada / Vencida) y toggle
- **Marketing App** — generador de QR para la home de la app, descarga PNG del QR solo o del diseño de calcomanía (900×900 px) y vista de impresión A5
- **Suscripciones** — CRUD completo de suscripciones por negocio: estado (trial/activa/vencida/cancelada), precio, ciclo (mensual/anual), fechas del período y notas. Resumen con contadores por estado y filtro rápido
- **Info Útil** — panel con 4 pestañas: (1) Contactos útiles: CRUD completo con filtro por categoría, toggle, creación y edición inline; (2) Localidades: gestión de las 16 localidades con slug y sort_order; (3) Servicios: servicios por localidad (categoría, teléfono, dirección, descripción); (4) Transporte: horarios de colectivos con empresa, origen/destino, días y horarios
- **QR por negocio** — sección "Material de marketing" en cada ficha de edición con QR del perfil público, descarga PNG e impresión de cartel A5

---

## Analytics

Tracking básico integrado:

| Métrica | Dónde se registra | Cómo |
|---|---|---|
| Vistas | Detalle de negocio (público) | RPC `increment_view` al montar |
| Contactos WA | Botón WhatsApp (público) | RPC `increment_lead` al hacer click |

SQL necesario en Supabase (si no está aplicado):

```sql
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS total_views integer NOT NULL DEFAULT 0;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS total_leads integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION increment_view(business_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE businesses SET total_views = total_views + 1 WHERE id = business_id;
$$;

CREATE OR REPLACE FUNCTION increment_lead(business_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE businesses SET total_leads = total_leads + 1 WHERE id = business_id;
$$;
```

---

## Tabla `subscriptions` en Supabase

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

---

## Tablas adicionales en Supabase

```sql
CREATE TABLE localities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
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
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
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
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
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
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

---

## Tabla `events` en Supabase

```sql
CREATE TABLE events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  localidad text,
  date_description text,         -- Texto libre: "2 al 4 de Octubre"
  category text DEFAULT 'festival',
  image_url jsonb DEFAULT '[]',  -- Array de URLs de storage
  created_at timestamptz DEFAULT now()
);
```

Storage bucket requerido: `event-images` (público).

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
│   ├── eventos/                 # Agenda pública de eventos
│   │   ├── page.tsx             # Listado con filtros por localidad
│   │   └── [id]/page.tsx        # Detalle con galería
│   ├── unite/                   # Landing de planes/precios para negocios
│   │   └── page.tsx
│   ├── mapa/                    # Mapa interactivo (Mapbox)
│   │   └── page.tsx
│   ├── dashboard/               # Panel de negocio
│   │   ├── menu-del-dia/
│   │   ├── carta/
│   │   ├── configuracion/
│   │   └── reservas/
│   └── admin/                   # Panel admin
│       ├── negocios/[id]/
│       ├── eventos/             # Crear y listar eventos
│       │   └── [id]/            # Detalle de evento (admin)
│       ├── promociones/
│       ├── marketing/
│       └── info-util/
│
├── components/
│   ├── public/                  # Componentes del sitio público
│   ├── shared/                  # Header, Footer
│   ├── dashboard/               # Panel de negocio
│   ├── admin/                   # Panel admin (AdminHome, AdminNegocios,
│   │                            #   AdminNegocioEdit, AdminPromociones,
│   │                            #   AdminInfoUtil, AdminLocalidades,
│   │                            #   AdminServiciosUtiles, AdminTransporte,
│   │                            #   QRMarketing, QRAppMarketing)
│   ├── events/                  # EventCard (componente reutilizable)
│   └── ui/                      # Utilidades reutilizables
│
├── lib/
│   ├── supabase/                # Clientes browser y server
│   ├── hooks/
│   │   └── useGeolocation.ts    # Hook de geolocalización del usuario
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

## Paleta de Colores

```
brand-sand     #E1DBC9   Fondo base (admin + público)
brand-pine     #2D4530   Verde profundo — sidebar admin, textos, QR
brand-sage     #A3B18A   Verde salvia — estados activos en admin
brand-gold     #C9A44B   Dorado — acentos decorativos
brand-slate    #6B7B84   Gris azulado
brand-earth    #5E4B3B   Marrón tierra
brand-charcoal #3C3C3C   Carbón
```

---

## Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=
```

---

## Localidades

16 localidades del Valle de Calamuchita con teléfonos de emergencia:

Villa General Belgrano · Santa Rosa de Calamuchita · La Cumbrecita · Los Reartes · Embalse · Amboy · Villa del Dique · Villa Rumipal · Potrero de Garay · Villa Yacanto · Villa Alpina · Villa Berna · Villa Ciudad Parque · Villa Quillinzo · La Cruz · Intiyaco

---

## Instalación

```bash
npm install

cp .env.example .env.local
# Completar NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
# y NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

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

## Rutas Principales

```
/                                   Home
/buscar?q=                          Búsqueda global
/negocios                           Listado gastronómico
/negocios/[slug]                    Detalle de negocio
/directorio/[section]               Directorio por sección
/directorio/[section]/[slug]        Detalle de directorio
/eventos                            Agenda del Valle
/eventos/[id]                       Detalle de evento
/mapa                               Mapa interactivo de comercios
/login                              Iniciar sesión
/registro                           Crear cuenta
/dashboard                          Panel de negocio
/admin                              Panel administrador
/admin/negocios                     Listado de negocios
/admin/negocios/[id]                Edición de negocio + QR marketing
/admin/eventos                      Crear y listar eventos
/admin/promociones                  Gestión de promociones
/admin/marketing                    QR general + calcomanías
/admin/info-util                    Contactos, localidades, servicios y transporte
/unite                              Landing de planes para negocios
```

---

## Pendiente

| Funcionalidad | Estado |
|---|---|
| Suscripciones — vista en dashboard del negocio | El admin puede gestionar suscripciones; falta que cada negocio vea su propio estado desde `/dashboard` |
| WebGLBackground | Componente creado (`components/public/WebGLBackground.tsx`), sin integrar |
| Edición/borrado de eventos desde admin | Lógica parcial (`editingId` state); sin lista de eventos con botones de acción |
| Link a `/eventos` en la navegación | `/mapa` ya tiene acceso desde el Header; `/eventos` todavía no |
| `EventCard` sin usar | Componente en `components/events/EventCard.tsx` creado pero no integrado |
| Selector de localidad en formulario de eventos | El campo localidad no tiene selector; usa valor por defecto |
| Paginación de eventos | Sin implementar |
