# DESIGN — Sistema de Gestion de Finanzas Empresariales

## Design Read

> **Dashboard SaaS financiero** para PyMEs — vibe **clean/profesional/corporativo** — sistema: **minimal-finance**

## 1. Tema Visual y Atmosfera

Interface limpia y profesional, inspirada en herramientas financieras como Xero y QuickBooks. Fondo gris claro (`#f6f8fa`), acento azul acero (`oklch(0.55 0.12 250)`), tarjetas blancas con sombras sutiles. El dinero y los numeros son los protagonistas — tipografia clara, espaciado generoso, sin decoracion innecesaria.

## 2. Paleta de Colores

Color primario unico:
- **Primary**: `oklch(0.55 0.12 250)` — azul acero profesional
- **Primary hover**: `oklch(0.50 0.12 250)`
- **Primary light**: `oklch(0.70 0.08 250)` (fondos hover, badges)
- **Surface**: `oklch(0.985 0.005 250)` — gris muy claro
- **Surface card**: `oklch(1 0 0)` — blanco
- **Text primary**: `oklch(0.15 0.02 250)` — casi negro
- **Text secondary**: `oklch(0.45 0.02 250)` — gris medio
- **Error**: `oklch(0.55 0.2 25)` — rojo para egresos
- **Success**: `oklch(0.55 0.15 145)` — verde para ingresos
- **Border**: `oklch(0.90 0.01 250)`

## 3. Tipografia

- **Headings**: `'Plus Jakarta Sans', sans-serif` — geometrica, limpia, profesional
- **Body**: `'DM Sans', sans-serif` — legible, espaciado generoso
- **Monospace** (montos): `'JetBrains Mono', monospace` — numeros tabulares alineados
- Google Fonts: `Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Sans:wght@400;500&family=JetBrains+Mono:wght@400;500`
- Jerarquia: h1 32px/2rem, h2 24px/1.5rem, h3 20px/1.25rem, body 16px/1rem, small 14px/0.875rem

## 4. Componentes Base

### Botones
- **Primary**: bg primary, texto blanco, px-4 py-2, rounded-lg, hover:bg-primary-dark, active:scale-[0.97]
- **Secondary**: bg white, border, texto primary, hover:bg-surface
- **Danger**: bg error, texto blanco, hover:opacity-90
- **Ghost**: sin fondo, texto text-secondary, hover:bg-surface
- Todos con `transition: all 150ms`, `cursor-pointer`, focus ring, disabled:opacity-50

### Cards
- bg white, rounded-xl, border, shadow-sm, p-6
- Dashboard cards: mas grandes con icono + monto grande + label

### Inputs
- bg white, border, rounded-lg, px-3 py-2, focus:border-primary focus:ring-2 focus:ring-primary/20
- Label arriba en text-sm font-medium text-secondary
- Error: border-red-400 + mensaje abajo en text-sm text-error

### Tabla
- Thead con bg-surface, th text-xs uppercase tracking-wide text-secondary
- Tbody con hover:bg-surface/50
- Celdas con padding simetrico

## 5. Layout

- **Sidebar** (desktop): fixed left, 240px, con logo arriba, nav links, user info abajo
- **Mobile**: top navbar + hamburger menu (drawer)
- **Main content**: ml-60 en desktop (sidebar width), p-8
- **Max content width**: 1200px centrado
- **Grid**: dashboard con 3 cards en row, tabla full-width

## 6. Elevacion y Sombras

- Cards: `shadow-sm` (1px y 1px blur, sutil)
- Dropdowns/modals: `shadow-lg` (10px blur)
- Sidebar: `shadow-md` con borde derecho
- NUNCA sombras dramaticas o coloreadas

## 7. Animacion e Interaccion

- Page transitions: fade + slide suave (200ms)
- Hover en cards de dashboard: translateY(-2px) + shadow aumento
- Loading: skeleton shimmer (bg-gradient con animate-pulse)
- Botones: active scale 0.97
- `prefers-reduced-motion` respetado: todas las animaciones condicionales

## 8. Do's y Don'ts

- **DO**: usar verde para ingresos, rojo para egresos, siempre con texto indicador
- **DO**: formatos de moneda con $ y separadores de miles
- **DO**: mostrar fechas en formato DD/MM/AAAA (espanol)
- **DO**: confirmar acciones destructivas con modal
- **DON'T**: usar em-dash (`—`) en ningun lado
- **DON'T**: usar Inter o Roboto
- **DON'T**: gradients ni sombras de colores
- **DON'T**: 3 columnas iguales de icono+texto generico
- **DON'T**: nombres genericos ni placeholders
- **DON'T**: dejar "Welcome to SvelteKit" o templates default

## 9. Responsive

- **Mobile** (<768px): sidebar oculto, nav superior con hamburguesa, cards full-width, tabla se convierte en lista de cards
- **Tablet** (768-1024px): sidebar colapsable, grid de 2 columnas
- **Desktop** (>1024px): sidebar fijo, grid de 3 columnas en dashboard

## 10. Estados por Componente

### DashboardCard
- **Loading**: skeleton rectangular con animate-pulse
- **Success**: numero grande con color segun tipo
- **Empty**: "Sin datos" en gris

### TransactionList
- **Loading**: 5 filas de skeleton
- **Empty**: icono + "No hay transacciones" + boton "Crear primera"
- **Error**: "Error al cargar" + boton reintentar
- **Success**: tabla paginada con filas

### TransactionForm
- **Loading**: spinner en boton submit
- **Error**: errores inline por campo + toast general
- **Success**: redirect a listado

### CategoryList (admin)
- **Empty**: "No hay categorias" + boton crear
- **Edit**: inline form o modal
- **Delete**: modal de confirmacion con advertencia si tiene transacciones

### Login
- **Empty**: form limpio
- **Error**: "Credenciales invalidas" en rojo sobre el form
- **Loading**: boton con spinner "Iniciando sesion..."
