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

### Dashboard — Rol `business`

- Métricas en tiempo real (pedidos activos, reservas del día, estado del menú)
- Gestión del **menú del día** (publicar, editar, dar de baja)
- Gestión de **carta completa** (categorías, ítems, precios, disponibilidad)
- Configuración del perfil del negocio (datos, horarios, fotos, logo)
- Vista de **pedidos** (takeaway y delivery) con estados
- Vista de **reservas** con confirmación

### Panel Admin — Rol `admin`

- **Dashboard** — métricas globales: negocios activos, pendientes, usuarios, vistas totales y contactos WhatsApp acumulados
- **Negocios** — CRUD completo con filtro por sección, ordenamiento por fecha / vistas / contactos, toggle de estado, analytics por fila
- **Promociones** — listado de todas las promos con negocio vinculado, badge de descuento, estado (Activa / Pausada / Vencida) y toggle
- **Marketing App** — generador de QR para la home de la app, descarga PNG del QR solo o del diseño de calcomanía (900×900 px) y vista de impresión A5
- **Info Útil** — gestión de contactos de emergencia con filtro por categoría, toggle activo/inactivo y formulario de creación inline
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
│       ├── negocios/[id]/
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
│   │                            #   AdminInfoUtil, QRMarketing, QRAppMarketing)
│   └── ui/                      # Utilidades reutilizables
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

## Localidades

16 localidades del Valle de Calamuchita con teléfonos de emergencia:

Villa General Belgrano · Santa Rosa de Calamuchita · La Cumbrecita · Los Reartes · Embalse · Amboy · Villa del Dique · Villa Rumipal · Potrero de Garay · Villa Yacanto · Villa Alpina · Villa Berna · Villa Ciudad Parque · Villa Quillinzo · La Cruz · Intiyaco

---

## Instalación

```bash
npm install

cp .env.example .env.local
# Completar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY

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
/admin/negocios                     Listado de negocios
/admin/negocios/[id]                Edición de negocio + QR marketing
/admin/promociones                  Gestión de promociones
/admin/marketing                    QR general + calcomanías
/admin/info-util                    Contactos de emergencia
```

---

## Pendiente

| Funcionalidad | Estado |
|---|---|
| Suscripciones | Tipo definido en `database.ts`, sin UI |
| WebGLBackground | Componente creado, sin integrar |
