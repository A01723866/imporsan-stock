# IMPORSAN — Diseño de Página Web
> Design spec & contenido para el sitio web de ImporSan. Basado en el pitch deck oficial.

---

## 1. BRAND SYSTEM

### Paleta de Color
```
--color-navy:      #0D2137   /* Títulos, fondos oscuros, CTAs primarios */
--color-teal-dark: #1A6B6E   /* Brand Building, acentos medios */
--color-teal-mid:  #2A9AA0   /* Bordes activos, iconos */
--color-green-mid: #3DC47E   /* Optimización, estados activos */
--color-green-lt:  #A8DDB0   /* Scouting, fondos suaves */
--color-green-bg:  #E8F5EC   /* Backgrounds de sección alternada */
--color-offwhite:  #F4F3EF   /* Background principal */
--color-white:     #FFFFFF   /* Cards, modales */
--color-text:      #1C1C2E   /* Cuerpo de texto */
--color-muted:     #6B7280   /* Subtextos, labels */
```

### Tipografía
```
Display / H1:   "DM Serif Display" — bold, dark navy — tracking tight
Headings H2-H3: "Syne" SemiBold — uppercase para labels de sección
Body:           "DM Sans" Regular/Medium — 16px / line-height 1.6
Mono / Labels:  "JetBrains Mono" — números grandes, KPIs, badges
```

### Spacing & Layout
- Container max-width: `1200px`
- Grid: 12 columnas con gutter `24px`
- Sección padding: `80px 0` (desktop) / `48px 0` (mobile)
- Border radius cards: `12px`
- Sombra card: `0 4px 24px rgba(13,33,55,0.08)`

---

## 2. ESTRUCTURA DEL SITIO

```
/                   ← Hero + Overview
/metodologia        ← ImporSan Funnel (5 etapas)
/modelo             ← Adquisición, Roll-Up, Exit or Hold
/mercado            ← TAM SAM SOM
/propuesta-de-valor ← Para el Comprador + Cliente Final
/impacto            ← ODS 8, 9, 12
/equipo             ← Estructura org + Cultura
/contacto           ← CTA final
```

---

## 3. SECCIONES — CONTENIDO & LAYOUT

---

### SECCIÓN 1 — HERO (/)
**Layout:** Pantalla completa, fondo `--color-offwhite`, motivo geométrico sutil (círculos concéntricos degradados en esquina inferior derecha, opacidad 8%).

**Contenido:**
```
[BADGE PILL]  M&A / Aceleradora de productos

[H1]
Construimos marcas
digitales que escalan.

[BODY]
ImporSan centraliza logística, diseño y análisis de datos
para transformar productos en activos rentables listos
para operar o ser adquiridos.

[CTAs]
  [PRIMARY]  Conoce el Funnel  →
  [SECONDARY — outline]  Habla con nosotros

[STAT ROW — 3 columnas]
  50+     |   2          |   4 Plataformas
  SKUs    |   Marcas     |   Amazon · MELI · TikTok · Shopify
```

**Diseño nota:** Los stats usan `--font-mono` en tamaño 48px color navy. Separador vertical `1px solid --color-green-lt`.

---

### SECCIÓN 2 — OVERVIEW DEL MODELO
**Layout:** 4 cards en grid 2×2 (desktop) / stack (mobile). Fondo `--color-navy`. Texto blanco.

**Cards:**

| # | Título | Cuerpo |
|---|--------|--------|
| 01 | IMPORSAN FUNNEL | Estrategia de adquisición y creación de marcas con alto potencial de maximizar su valuación de salida. |
| 02 | ROLL-UP | Inyectamos valor centralizando logística, diseño y análisis de datos para cada nueva marca. |
| 03 | SCOUTING | Metodología técnica que transforma hallazgos de Big Data en activos digitales rentables y escalables. |
| 04 | EXIT or HOLD | Análisis financiero para definir valor de los activos con el propósito de realizar un exit o agregar más valor. |

**Diseño nota:** Número `01–04` en `--font-mono` 11px uppercase verde claro. Card hover: borde izquierdo `3px solid --color-green-mid` + leve `translateX(4px)`.

---

### SECCIÓN 3 — IMPORSAN FUNNEL (/metodologia)
**Layout:** Dos columnas. Izquierda: diagrama de embudo SVG animado (scroll-driven). Derecha: lista de 5 etapas con expand/collapse sutil.

**5 Etapas:**

```
[01] Scouting & Big Data Analysis
     Detección de oportunidades en nichos desatendidos.
     Color: --color-green-lt

[02] Optimización Operativa
     Optimización de materiales y diseño para solucionar
     los problemas actuales que el mercado ignora.
     Color: --color-green-mid

[03] Optimización de Mercadotecnia
     Implementación de rigor técnico en algoritmos de
     marketplaces para garantizar visibilidad orgánica máxima.
     Color: --color-teal-mid

[04] Brand Building
     Despliegue estratégico en Amazon, Mercado Libre,
     TikTok Shop y Shopify para dominar la cuota de mercado.
     Color: --color-teal-dark

[05] STAR Product
     Maduración del producto hasta convertirlo en un activo
     sólido listo para operación propia o su adquisición.
     Color: --color-navy
```

**Diseño nota:** Al hacer hover en cada etapa, el embudo SVG ilumina la capa correspondiente. Número de etapa en `--font-mono` bold.

---

### SECCIÓN 4 — ADQUISICIÓN Y CREACIÓN (/modelo)
**Layout:** Tabs `A1 Creación` / `A2 Adquisición`. Fondo `--color-green-bg`.

**Tab A1 — Creación:**
```
Análisis de Nicho Desatendido
Utilizamos Big Data Analysis para detectar nichos
desatendidos en el mercado.

Brand Founding
Creamos la marca desde cero y diseñamos su identidad
para dominar el mercado.
```

**Tab A2 — Adquisición:**
```
Scouting
Identificamos empresas con ventas probadas pero con
operaciones ineficientes.

Acquisitions
Realizamos una evaluación de la marca para absorberla
y optimizarla mediante nuestra metodología.
```

**Diseño nota:** Tabs con pill indicators. Contenido con ícono SVG por step (target, $-cycle, globe, chart).

---

### SECCIÓN 5 — ROLL-UP
**Layout:** Izquierda: diagrama circular animado (3 flechas rotatorias, CSS animation). Derecha: 3 bloques con ícono.

**Bloques:**
```
[Logísticos]
Mayor eficiencia en movimientos logísticos,
almacenamiento y empaque.

[Operativos]
Mayor eficiencia en trabajo y análisis operativo.

[Plataforma]
Introducir los nuevos candidatos a nuestras plataformas
digitales ya con tracción.
```

---

### SECCIÓN 6 — EXIT OR HOLD
**Layout:** Línea de proceso horizontal (4 pasos → bullseye). Fondo blanco. En mobile: stack vertical.

**4 Pasos:**

```
[1] Propiedad Intelectual
    Marca, Productos, Plataformas, Procesos,
    Metodologías y todo en lo que consiste la marca.

[2] Activos Digitales
    Presencia dominada en múltiples e-commerce
    garantizando visibilidad orgánica máxima.

[3] Rentabilidad
    Agregamos rentabilidad a las marcas a través
    de nuestros procesos.

[4] Valor de Portafolio
    Definimos el valor en base a nuestra
    rentabilidad × múltiplo.

[→ TARGET ICON]
```

**Diseño nota:** Cada paso conectado con flecha SVG. Color progresa de `--green-lt` → `--navy`. Ícono de objetivo en teal.

---

### SECCIÓN 7 — TAM SAM SOM (/mercado)
**Layout:** Dos columnas. Izquierda: descripciones + stats. Derecha: diagrama de burbujas concéntricas SVG.

**Datos:**

| Nivel | Descripción | Valor |
|-------|-------------|-------|
| TAM | E-Commerce MX + USA | $1.36B USD |
| SAM | Volumen transaccional histórico de productos ImporSan | AMZ 61.85% · MELI 37.4% · Shopify 0.75% |
| SOM | Capacidad actual ImporSan | 40% crecimiento · +2 marcas · 100+ SKUs |

**Diseño nota:** Los porcentajes de plataforma se muestran con mini barras de progreso animadas al hacer scroll. Los valores de mercado usan `--font-mono` tamaño grande.

---

### SECCIÓN 8 — PROPUESTA DE VALOR (/propuesta-de-valor)
**Layout:** Toggle `Para el Comprador` / `Para el Cliente Final`. Fondo `--color-navy`.

#### Para el Comprador (El Comprador — "Alejandro Muñoz")

```
PAIN
• Founder-dependency: El founder se va, la marca se desmorona.
• Operaciones segmentadas: Cada marketplace tiene procesos distintos.
• Unit economics opacos.

GAIN
• Playbook multicanal documentado.
• Unit economics auditables y Economic Insights.

DIFERENCIADOR
• Operación documentada. Multi-canal.

PROPUESTA
Marcas probadas, multicanal y con operaciones estandarizadas,
con posicionamiento en los e-commerce más importantes de México.
Cuando adquieres ImporSan, compras un sistema operativo escalable
listo para integración post-cierre. Sin sorpresas, sin integración
caótica, sin riesgo de pérdida de valor.
```

#### Para el Cliente Final (Mariana Cervantez)

```
PAIN
Las marcas pequeñas de calidad frecuentemente no están disponibles
en todos los canales relevantes y/o tienen precios inflados por
ineficiencias operativas.

GAIN
• Disponibles en todas las plataformas.
• Precios más competitivos gracias a economías de escala.

DIFERENCIADOR
• Presencia multicanal garantizada (online).
• Calidad de servicio estandarizada.

PROPUESTA
Marcas de calidad disponibles en tu plataforma favorita
a precios competitivos y con servicio confiable.
```

**Diseño nota:** Cards PAIN/GAIN/DIFERENCIADOR/PROPUESTA con borde izquierdo de color progresivo. Texto blanco sobre navy.

---

### SECCIÓN 9 — IMPACTO (/impacto)
**Layout:** 3 cards en grid. Fondo `--color-offwhite`.

```
[ODS 8] Trabajo Decente y Crecimiento Económico
  • Crecimiento económico
  • Servicios compartidos
  • Mayor rentabilidad en marcas
  • Desarrollo profesional
  Accent: --color-green-mid

[ODS 9] Industria, Innovación e Infraestructura
  • Infraestructura del retail en México
  • ImporSan Funnel
  • Permitiendo que pequeñas marcas operen
    profesionalmente a través del modelo M&A
  Accent: --color-teal-dark

[ODS 12] Producción y Consumo Responsables
  • Eficiencia logística
  • Ingeniería de empaque
  • Reducción de espacio, desperdicio y fletes
  • Menores emisiones de carbono
  Accent: --color-navy
```

**Pie de sección:**
> Actualmente estamos agregando valor a 2 marcas con un total de más de 50 SKUs.

---

### SECCIÓN 10 — EQUIPO & CULTURA (/equipo)
**Layout:** Org chart simplificado + 4 cards de valores.

**Estructura:**
```
Founders (Estrategia · M&A · Inversión)
├── COO — Operaciones & Logística
├── Scout Owner — Scouting & Product Fit
├── Growth Coordinator — Brand Building & Marketplaces
└── Marketplace Specialist — Revenue Layer
    ⚠ CFO/Controller — pendiente (corto plazo)
```

**4 Valores:**
```
[1] Ownership Total
    Cada quien es dueño de su vertical.

[2] Tech-First Mindset
    Antes de hacer algo manual, pregunta si hay
    una herramienta que lo resuelva.

[3] Velocidad con Criterio
    Una decisión mediocre ejecutada hoy supera
    a una perfecta ejecutada tarde.

[4] Comunicación Radical
    La información no se guarda, se comparte.
```

---

### SECCIÓN 11 — CTA FINAL (/contacto)
**Layout:** Pantalla completa. Fondo `--color-navy`. Centrado.

```
[LABEL — verde, mono]  ¿Listo para escalar?

[H2 — blanco]
Construyamos el próximo
activo digital juntos.

[BODY — gris claro]
Hablemos sobre adquisiciones, marcas en proceso
o cómo nuestro Funnel puede aplicar a tu portafolio.

[CTA PRIMARY — verde]  Agendar una llamada  →
[CTA SECONDARY — outline blanco]  Ver portafolio

[Divider]

[Footer row]
IMPORSAN · Brand builder / Aceleradora de productos
© 2025 ImporSan  ·  50+ SKUs  ·  2 Brands
```

---

## 4. COMPONENTES REUTILIZABLES

### `<StatPill>` — Badge de KPI
```
[NÚMERO en font-mono bold 48px navy]
[LABEL en Syne 11px uppercase muted]
```

### `<ProcessStep>` — Paso numerado
```
[NUM 01–05 en mono verde]  [TÍTULO en Syne bold]
[BODY en DM Sans regular muted]
```

### `<ValueCard>` — Card PAIN / GAIN / PROPUESTA
```
[LABEL badge — pill verde/teal/navy según tipo]
[BODY texto]
Borde izquierdo 3px colored
```

### `<FunnelLayer>` — Capa del embudo
```
SVG path con fill degradado
Hover: brightness(1.15) + translateY(-2px)
Active: glow sutil del color de la capa
```

### `<OrgNode>` — Nodo del org chart
```
[ÍCONO rol]  [TÍTULO]  [DESCRIPCIÓN corta]
Badge: verde (activo) / naranja (brecha / por cubrir)
```

---

## 5. ANIMACIONES

| Elemento | Animación | Trigger |
|----------|-----------|---------|
| Hero H1 | Fade-in + slideUp (stagger por palabra) | Page load |
| Stat numbers | Count-up 0 → valor real | Scroll into view |
| Funnel layers | Dibujado secuencial (stroke-dashoffset) | Scroll |
| Process arrows (Roll-Up) | Rotate continuo 20s loop | Siempre |
| Cards | Fade-in + translateY(20px) staggered | Scroll into view |
| Tab content | Crossfade 200ms | Click tab |

---

## 6. NOTAS DE IMPLEMENTACIÓN

- **Framework recomendado:** React + Tailwind CSS + Framer Motion
- **Íconos:** Lucide React (consistente con el estilo del PDF)
- **Gráficos SVG:** Dibujados a mano para el Funnel, Burbujas TAM y Org Chart
- **Fuentes:** Google Fonts — `DM Serif Display`, `Syne`, `DM Sans`, `JetBrains Mono`
- **Accesibilidad:** Todos los colores de texto pasan WCAG AA. Diagramas con `aria-label`.
- **SEO:** Meta title: `ImporSan — M&A & Aceleradora de Marcas E-Commerce`

---

*Documento generado desde el pitch deck IMPORSAN FUNNEL. Versión 1.0*