# Semana 07 — Reutilización de Código: Componentes UI Reutilizables (Sección 9)

> **Universidad Peruana Los Andes (UPLA) · Facultad de Ingeniería**  
> Curso: Construcción de Software · Ciclo Académico 2026

---

## 1. Introducción

La reutilización de código es uno de los principios fundamentales de la ingeniería de software moderna. Según Pressman y Maxim (2021), la reutilización sistemática de componentes reduce el tiempo de desarrollo, disminuye la densidad de defectos y favorece la consistencia visual y funcional del sistema. En el contexto del desarrollo frontend con React, la reutilización se materializa mediante **componentes funcionales tipados** que encapsulan comportamiento, estilos y accesibilidad en unidades independientes, cohesivas y fácilmente testables.

El sistema **ReservaUPLA** implementa una biblioteca de **componentes UI primitivos reutilizables** alojados en `frontend/src/components/ui/`, agnósticos al dominio gastronómico universitario, que son consumidos de manera uniforme por los 4 módulos funcionales del sistema: Usuarios, Ambientes, Reservas y Dashboard.

---

## 2. Inventario de Componentes UI Reutilizables

Los componentes reutilizables del sistema se ubican en `frontend/src/components/ui/` y se re-exportan desde el archivo barrel `frontend/src/components/ui/index.ts`, lo que permite importarlos con una sola línea desde cualquier componente consumidor:

```typescript
import { Button, AlertMessage, TextInput, SelectInput,
         DateInput, TimeInput, Tooltip, PageHeader } from '../ui';
```

| # | Componente | Archivo | Propósito | Módulos que lo consumen |
|---|---|---|---|---|
| 1 | `TextInput` | `TextInput.tsx` | Campo de texto con label, error y helper | Usuarios, Ambientes, Reservas |
| 2 | `SelectInput` | `SelectInput.tsx` | Selector desplegable con opciones tipadas | Usuarios, Ambientes, Reservas |
| 3 | `DateInput` | `DateInput.tsx` | Input de fecha con restricción de rango | Reservas, Filtros |
| 4 | `TimeInput` | `TimeInput.tsx` | Input de hora con min/max institucional | Reservas |
| 5 | `Button` | `Button.tsx` | Botón polimórfico con variantes y estados | Todos los módulos |
| 6 | `AlertMessage` | `AlertMessage.tsx` | Mensaje de retroalimentación tipado | Todos los módulos |
| 7 | `Tooltip` | `Tooltip.tsx` | Globo de ayuda contextual accesible | Todos los módulos |
| 8 | `PageHeader` | `PageHeader.tsx` | Cabecera de sección con título, badge y acciones | Todos los módulos |
| 9 | `ModalWrapper` | `ModalWrapper.tsx` | Contenedor modal con overlay y captura de foco | Reservas, Ambientes, Usuarios |

---

## 3. Especificación Técnica de Componentes Clave

### 3.1 `TextInput` — Campo de Texto Genérico

```typescript
interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;      // Mensaje de error bajo el campo (rojo + ícono)
  helperText?: string; // Texto de ayuda contextual (gris)
  required?: boolean;  // Añade asterisco visual al label
}
```

El componente aplica los estilos del sistema de diseño de forma consistente: borde azul al foco, borde rojo cuando existe `error`, fondo adaptativo para modo oscuro. Esta consistencia visual implementa la **Regla 1 de Shneiderman** (coherencia de la interfaz).

**[Figura 1]** Componente `TextInput` en sus tres estados: vacío/neutro, con foco activo (borde azul institucional) y con error de validación (borde rojo con mensaje descriptivo). Fuente: elaboración propia.

> _[Insertar captura de tres instancias de `TextInput` mostrando los tres estados]_

### 3.2 `Button` — Botón Polimórfico

El componente `Button` es el más consumido del sistema, con soporte para múltiples variantes visuales, estados de carga y tooltips integrados:

```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;    // Muestra spinner + loadingText
  loadingText?: string;   // Texto durante carga (ej. "Procesando...")
  icon?: ReactNode;       // Ícono Lucide a la izquierda del label
  tooltip?: string;       // Texto del Tooltip integrado
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}
```

Variantes y su uso en el sistema:

| Variante | Color | Uso primario |
|---|---|---|
| `primary` | Azul institucional `#1E3A8A` | Acción principal (Registrar, Aprobar, Guardar) |
| `secondary` | Gris neutro | Cancelar, cerrar modal |
| `outline` | Borde azul / fondo transparente | Acciones secundarias (Validar Disponibilidad) |
| `danger` | Rojo | Acciones destructivas (Rechazar, Eliminar) |
| `ghost` | Transparente | Acciones terciarias (Limpiar campos) |

**[Figura 2]** Componente `Button` en sus cinco variantes de estilo y estado de carga (spinner). El botón primario activo está resaltado en azul institucional; el danger en rojo para acciones destructivas. Fuente: elaboración propia.

> _[Insertar captura de los 5 botones en fila: primary, secondary, outline, danger, ghost]_

### 3.3 `AlertMessage` — Retroalimentación del Sistema

```typescript
interface AlertMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  details?: string[];  // Lista expandible de sub-mensajes (ej. conflictos de horario)
  onClose?: () => void;
}
```

El componente adapta colores y ícono según el tipo: verde (success), rojo (error), ámbar (warning), azul (info). La prop `details` permite mostrar una lista expandible de conflictos específicos, como en el modal de disponibilidad que lista cada reserva en competencia con su solicitante y motivo.

**[Figura 3]** Componente `AlertMessage` en variante `success` (reserva registrada) y `warning` (conflicto de disponibilidad detectado con lista de reservas en competencia). Fuente: elaboración propia.

> _[Insertar captura de `AlertMessage` tipo success y warning con lista de conflictos expandida]_

### 3.4 `Tooltip` — Ayuda Contextual Accesible

El componente `Tooltip` envuelve cualquier elemento y muestra un globo de ayuda al hacer hover o foco con teclado, implementando las recomendaciones de accesibilidad de ISO 9241-171:

```typescript
interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
}
```

El tooltip se usa en más de 15 ubicaciones del sistema: botones de acción en la tabla de reservas, iconos de estado, el botón de modo oscuro y los atajos de bloques horarios.

### 3.5 `PageHeader` — Cabecera de Sección

```typescript
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;    // Etiqueta contextual (ej. "Sesión: Administrador")
  actions?: ReactNode; // Botones de acción en la cabecera derecha
}
```

El `PageHeader` se utiliza uniformemente en las 4 páginas principales del sistema (`DashboardPage`, `ReservasPage`, `AmbientesPage`, `UsuariosPage`), garantizando que la cabecera siempre tenga la misma altura, tipografía y estructura visual independientemente del módulo.

---

## 4. Componentes de Dominio Reutilizables

Además de los componentes UI primitivos, el sistema cuenta con componentes de dominio que encapsulan lógica específica de **ReservaUPLA** y son reutilizados entre vistas:

| Componente | Descripción | Reutilización |
|---|---|---|
| `ReservaFilterBar` | Barra de filtros de reservas (ambiente, estado, fecha, búsqueda) | `ReservasPage` (Administrador, Solicitante y Responsable) |
| `ReservaTableSection` | Tabla de reservas con columnas y acciones adaptadas por rol | `ReservasPage` (los 3 roles ven la misma tabla con acciones distintas) |
| `ReservaDetalleModal` | Modal de detalle de expediente de una reserva | `ReservasPage` |
| `ReservaEstadoConfirmModal` | Modal de confirmación de cambio de estado con validación de solapamientos | `ReservasPage` |
| `AuthBrandPanel` | Panel corporativo izquierdo de la pantalla de login | `AuthLayout` |
| `LoginDemoProfiles` | Selector de perfiles demo para acceso rápido en entorno de desarrollo | `LoginPage` |

---

## 5. Patrón de Barrel Export (`index.ts`)

Todos los componentes reutilizables se re-exportan desde archivos `index.ts` por carpeta, lo que permite importaciones limpias y agnósticas a la estructura interna:

```typescript
// frontend/src/components/ui/index.ts
export * from './TextInput';
export * from './SelectInput';
export * from './DateInput';
export * from './TimeInput';
export * from './Button';
export * from './AlertMessage';
export * from './Tooltip';
export * from './PageHeader';
export * from './ModalWrapper';

// frontend/src/components/index.ts
export * from './ui';
export * from './layout';
export * from './reservas';
export * from './ambientes';
export * from './usuarios';
export * from './dashboard';
```

Este patrón favorece la encapsulación y permite refactorizar la ubicación interna de un componente sin modificar ninguna importación de los consumidores.

---

## 6. Impacto de la Reutilización en el Sistema

| Métrica | Sin reutilización | Con componentes reutilizables |
|---|---|---|
| Implementación de Modo Oscuro | Modificar ~40 archivos de vista | Modificar **9 componentes UI** — el cambio se propaga automáticamente |
| Corrección de un error de accesibilidad en inputs | Modificar cada formulario individualmente | Modificar **1 componente** (`TextInput`) |
| Nueva variante de botón | Duplicar estilos en cada uso | Agregar 1 caso al `switch` de variantes en `Button.tsx` |
| Consistencia tipográfica | Depende del criterio de cada desarrollador | **Garantizada** — todos los textos de error usan la misma clase |

**[Figura 4]** Diagrama de reutilización de los 9 componentes UI primitivos a través de los 4 módulos funcionales del sistema ReservaUPLA. Las flechas representan dependencias de consumo. Fuente: elaboración propia.

> _[Insertar diagrama de dependencias — componentes UI → módulos de dominio]_

---

## 7. Referencias Bibliográficas

- Pressman, R. S., & Maxim, B. R. (2021). *Ingeniería del Software: Un enfoque práctico* (9.ª ed.). McGraw-Hill.
- Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley.
- Shneiderman, B., Plaisant, C., Cohen, M., Jacobs, S., Elmqvist, N., & Diakopoulos, N. (2016). *Designing the User Interface* (6th ed.). Pearson.
- Facebook/Meta. (2024). *React — Component documentation*. https://react.dev/learn/thinking-in-react
- ISO 9241-171:2008. *Ergonomics of human-system interaction — Part 171: Guidance on software accessibility*. International Organization for Standardization.
- Fain, Y., & Moiseev, A. (2020). *Angular Development with TypeScript* (2nd ed.). Manning Publications. [Referencia adaptada al patrón de componentes en React/TypeScript]
