# Semana 09 — Módulos de Salida de Datos y Dashboard (Secciones 10 y 11)

> **Universidad Peruana Los Andes (UPLA) · Facultad de Ingeniería**  
> Curso: Construcción de Software · Ciclo Académico 2026

---

## 1. Introducción

Los módulos de salida de datos constituyen la capa de presentación de la información procesada por el sistema hacia los actores institucionales. Según Nielsen (1994), la efectividad de un sistema de información no solo depende de su capacidad para capturar datos correctamente, sino también de su habilidad para presentarlos de manera clara, relevante y accionable para el usuario correcto en el momento correcto. En **ReservaUPLA**, los módulos de salida se materializan principalmente en dos formas: el **Dashboard diferenciado por rol** y las **tablas filtrables de gestión** de los módulos de Reservas, Ambientes y Usuarios.

El Requerimiento Funcional **RF-08** del caso práctico exige que el sistema muestre indicadores básicos adaptados al rol del actor autenticado. Esta semana documenta la implementación del Dashboard y todos los mecanismos de presentación de datos de salida del sistema.

---

## 2. Dashboard Diferenciado por Rol (`DashboardPage.tsx`)

### 2.1 Arquitectura del Dashboard

El Dashboard se implementa mediante el hook `useDashboard.ts` que consume el endpoint `GET /api/dashboard` del backend. El controlador `DashboardController.cs` retorna indicadores calculados dinámicamente en base al rol del actor, extraído de los encabezados HTTP `X-Usuario-Id` y `X-Usuario-Rol`:

```
DashboardPage
    └── useDashboard(session) [hook de datos]
            └── dashboardService.obtenerIndicadores()
                    └── GET /api/dashboard
                            └── DashboardController → DashboardService
                                    └── calcula KPIs según rol (Solicitante filtra por usuarioId)
```

### 2.2 Indicadores por Rol

El sistema provee **vistas diferenciadas** del Dashboard según el rol autenticado:

#### Dashboard del Administrador — Visión Institucional Global

| Indicador | Descripción | Color de Badge |
|---|---|---|
| **Total de Reservas** | Suma de todas las reservas del sistema en todos los estados | Azul institucional |
| **Pendientes de Evaluación** | Reservas en estado `Pendiente` que requieren aprobación o rechazo | Ámbar (urgencia) |
| **Aprobadas** | Reservas confirmadas y vigentes | Verde esmeralda |
| **Rechazadas** | Reservas denegadas (inmutables por RN-06) | Rojo |
| **Ambientes Activos** | Ambientes universitarios en estado `Disponible` | Índigo |

#### Dashboard del Solicitante — Visión Personal

Los mismos 5 indicadores pero filtrados exclusivamente por el `UsuarioId` de la sesión activa, implementando el principio de **modelo mental correcto para el rol** (Norman, 2013, Cap. 2). El solicitante solo ve sus propias reservas ("Mi Dashboard"), nunca las de otros docentes.

#### Dashboard del Responsable de Ambiente — Visión de Supervisión

Indicadores de ocupación de los ambientes asignados mediante la tabla `AsignacionesResponsable`, con énfasis en la disponibilidad actual y la carga horaria de cada espacio supervisado.

**[Figura 1]** Dashboard del Administrador mostrando los 5 indicadores dinámicos con badges cromáticos. Las tarjetas KPI incluyen ícono, valor numérico y etiqueta descriptiva. El banner ámbar de "Atención requerida" alerta sobre reservas Pendientes que esperan evaluación. Fuente: elaboración propia.

> _[Insertar captura de `DashboardPage` en rol Administrador con al menos 1 reserva Pendiente]_

**[Figura 2]** Dashboard del Solicitante ("Mi Dashboard") mostrando únicamente los indicadores de sus propias solicitudes. El subtítulo de la cabecera comunica explícitamente "Mis Solicitudes de Reserva". Fuente: elaboración propia.

> _[Insertar captura de `DashboardPage` en rol Solicitante]_

### 2.3 Componente `DashboardIndicadoresGrid`

```typescript
interface CardIndicadorProps {
  titulo: string;
  valor: number | string;
  icono: ReactNode;        // Ícono Lucide contextual
  colorClase: string;      // Clase Tailwind de color (ej. 'bg-blue-50 text-blue-700')
  descripcion?: string;    // Texto de apoyo bajo el valor
}
```

El grid de indicadores usa CSS Grid responsive (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`) para adaptarse a pantallas desde móvil hasta escritorio de alta resolución, cumpliendo el requisito de diseño responsivo de la ISO 9241-210.

---

## 3. Tabla de Reservas — Módulo de Salida Principal (`ReservaTableSection.tsx`)

### 3.1 Columnas de la Tabla

| Columna | Descripción | Visible para |
|---|---|---|
| **Ambiente** | Nombre del ambiente universitario con tipo | Todos los roles |
| **Solicitante** | Nombre completo del solicitante y su correo | Administrador y Responsable |
| **Fecha** | Fecha programada en formato legible (ej. "lun 09 nov 2026") | Todos |
| **Horario** | Rango `HoraInicio – HoraFin` h | Todos |
| **Motivo** | Texto del motivo académico (truncado con tooltip al hacer hover) | Todos |
| **Estado** | Badge cromático: Pendiente (ámbar) / Aprobada (verde) / Rechazada (rojo) / Cancelada (gris) | Todos |
| **Acciones** | Botones de Ver detalle, Aprobar, Rechazar, Cancelar (diferenciados por rol) | Según RBAC |

### 3.2 Acciones Diferenciadas por Rol (RBAC)

```typescript
// La tabla adapta las acciones visibles según el rol de la sesión activa
const puedeAprobar = session.rol === 'Administrador' && reserva.estado === 'Pendiente';
const puedeRechazar = session.rol === 'Administrador' && reserva.estado === 'Pendiente';
const puedeCancelar = (session.rol === 'Solicitante' || session.rol === 'Administrador')
                      && reserva.estado === 'Pendiente'
                      && (session.rol === 'Administrador' || reserva.usuarioId === session.id);
```

**[Figura 3]** Tabla de reservas en vista del Administrador con botones de Aprobar (verde) y Rechazar (rojo) visibles. La columna de estado muestra badges cromáticos. Las filas de reservas Rechazadas presentan el ícono de candado (inmutabilidad RN-06). Fuente: elaboración propia.

> _[Insertar captura de `ReservaTableSection` en rol Administrador con distintos estados visibles]_

**[Figura 4]** Tabla de reservas en vista del Solicitante. Los botones de Aprobar/Rechazar no aparecen. Solo se muestran las reservas propias del usuario autenticado (filtrado por `UsuarioId` en el backend). Fuente: elaboración propia.

> _[Insertar captura de `ReservaTableSection` en rol Solicitante]_

### 3.3 Barra de Filtros Reactivos (`ReservaFilterBar.tsx`)

La barra de filtros implementa filtrado reactivo sin espera de servidor para el filtro de búsqueda de texto libre, usando la función NFD-normalizada del sub-hook `useReservaFiltros`:

```typescript
// Filtrado NFD (tolerante a tildes y mayúsculas) en useReservaFiltros.ts
const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Ejemplo: buscar "laboratorio" encuentra "Laboratorio de Cómputo L-301"
// sin importar las tildes ni el uso de mayúsculas
```

| Filtro | Tipo | Comportamiento |
|---|---|---|
| **Por Ambiente** | `SelectInput` | Consulta al servidor al cambiar (`cargarDatos`) |
| **Por Estado** | `SelectInput` | Consulta al servidor al cambiar |
| **Por Fecha** | `DateInput` | Consulta al servidor al cambiar |
| **Búsqueda de texto** | `TextInput` | Filtrado local instantáneo NFD (ambiente, solicitante, motivo, fecha) |
| **Limpiar filtros** | `Button` | Restablece todos los filtros a valores por defecto |

**[Figura 5]** Barra de filtros de reservas con filtro de búsqueda de texto activo. El contador inferior muestra el número de registros que coinciden con el criterio de búsqueda. Fuente: elaboración propia.

> _[Insertar captura de `ReservaFilterBar` con un término de búsqueda activo y el contador actualizado]_

---

## 4. Modal de Detalle de Reserva (`ReservaDetalleModal.tsx`)

El modal de detalle presenta el expediente completo de una reserva seleccionada, funcionando como el módulo de salida de datos más detallado del sistema:

| Sección | Datos mostrados |
|---|---|
| **Identificación** | ID de reserva, fecha de registro, estado con badge |
| **Ambiente** | Nombre, tipo, capacidad, ubicación |
| **Solicitante** | Nombre completo, correo institucional, rol |
| **Programación** | Fecha, hora inicio, hora fin, duración calculada |
| **Motivo** | Texto completo sin truncamiento |
| **Historial** | Fecha de creación y última modificación |

**[Figura 6]** Modal de detalle de reserva (`ReservaDetalleModal`) con el expediente completo de una solicitud Aprobada. Incluye datos del ambiente, solicitante, programación horaria y motivo académico. Fuente: elaboración propia.

> _[Insertar captura de `ReservaDetalleModal` con una reserva en estado Aprobada]_

---

## 5. Modal de Confirmación de Cambio de Estado (`ReservaEstadoConfirmModal.tsx`)

Este modal funciona como módulo de salida de información crítica antes de que el Administrador confirme una acción irreversible (Aprobar o Rechazar). Implementa la **Regla 6 de Shneiderman** (permitir la reversión de acciones y advertir sobre las irreversibles):

- Muestra el resumen de la reserva a modificar (ambiente, fecha, horario, solicitante, motivo)
- Si se va a Aprobar, lista todas las reservas Pendientes en el mismo ambiente/fecha/rango que quedarán afectadas (posibles conflictos competitivos)
- Presenta los botones **Confirmar** y **Cancelar** con jerarquía visual clara (primario a la derecha)

**[Figura 7]** Modal de confirmación de aprobación de reserva con advertencia de reservas competidoras en el mismo bloque horario. El Administrador puede evaluar el impacto antes de confirmar. Fuente: elaboración propia.

> _[Insertar captura de `ReservaEstadoConfirmModal` con lista de reservas en competencia visible]_

---

## 6. Tablas de Gestión de Ambientes y Usuarios

Los módulos de Ambientes (`AmbientesPage`) y Usuarios (`UsuariosPage`) implementan tablas de salida con funcionalidad completa de gestión:

### 6.1 Tabla de Ambientes Universitarios

| Columna | Descripción |
|---|---|
| **Nombre** | Nombre del ambiente con ícono de tipo |
| **Tipo** | Laboratorio / Auditorio / Sala de Reuniones |
| **Capacidad** | Aforo máximo en personas |
| **Ubicación** | Descripción del piso/edificio |
| **Estado** | Badge: Disponible (verde) / En Mantenimiento (ámbar) / Inactivo (gris) |
| **Acciones** | Editar (ícono lápiz) / Eliminar (ícono papelera con confirmación) |

**[Figura 8]** Tabla de gestión de catálogo de ambientes universitarios. Los ambientes en estado "En Mantenimiento" presentan badge ámbar y se bloquean automáticamente en el formulario de reservas. Fuente: elaboración propia.

> _[Insertar captura de `AmbientesPage` con la tabla de ambientes y al menos un ambiente en Mantenimiento]_

### 6.2 Tabla de Padrón de Usuarios

| Columna | Descripción |
|---|---|
| **Nombre** | Nombre completo del usuario |
| **Correo** | Correo institucional (`@upla.edu.pe`) |
| **Rol** | Badge: Administrador (azul) / Solicitante (verde) / Responsable (índigo) |
| **Estado** | Activo / Inactivo |
| **Acciones** | Editar / Eliminar (solo Administrador) |

**[Figura 9]** Tabla de padrón de usuarios con badges de rol cromáticos. El Administrador puede editar y eliminar cualquier usuario del sistema. Los usuarios inactivos se atenúan visualmente. Fuente: elaboración propia.

> _[Insertar captura de `UsuariosPage` con la tabla de usuarios mostrando los 4 roles de prueba]_

---

## 7. Flujo de Datos de Salida — Ciclo Completo

```
Usuario autenticado navega a ReservasPage
           │
           ▼
useReservasManagement(session) → cargarDatos()
           │
           ▼ GET /api/reservas?estado=Todos&usuarioId=[si Solicitante]
           │
           ▼ DashboardController / ReservasController
           │   └── DashboardService / ReservaRepository (EF Core → PostgreSQL)
           │
           ▼ JSON: [ { id, ambienteNombre, usuarioNombre, fecha, estado, ... } ]
           │
           ▼ reservasBase (useState)
           │
           ├── filtros → useReservaFiltros.aplicarFiltroBusqueda(reservasBase)
           │                └── reservas (filtradas, mostradas en ReservaTableSection)
           │
           └── todasLasReservas → DashboardIndicadoresGrid (KPIs)
                                 └── ReservaEstadoConfirmModal (reservas en competencia)
```

---

## 8. Cumplimiento ISO 9241-210 en Módulos de Salida

| Cláusula ISO | Principio | Implementación en ReservaUPLA |
|---|---|---|
| Cláusula 4.3 | Comprensión explícita del usuario | Dashboard diferenciado — Solicitante nunca ve datos de otros usuarios |
| Cláusula 4.4 | Perspectiva del usuario desde el diseño | "Mi Dashboard" para Solicitante vs Dashboard institucional para Admin |
| Cláusula 4.6 | Efectividad y eficiencia | Filtros reactivos instantáneos sin recarga de página; KPIs en landing page |
| ISO 9241-11 | Efectividad, eficiencia, satisfacción | 100% de RF-01 a RF-08 cubiertos; 0 clics innecesarios para ver reservas |
| ISO 9241-110 | Principios de diálogo | Feedback inmediato ante acciones (AlertMessage); estado visible en todo momento |

---

## 9. Referencias Bibliográficas

- Nielsen, J. (1994). *Usability Engineering*. Morgan Kaufmann.
- Norman, D. A. (2013). *The Design of Everyday Things* (Rev. ed.). Basic Books.
- Shneiderman, B., Plaisant, C., Cohen, M., Jacobs, S., Elmqvist, N., & Diakopoulos, N. (2016). *Designing the User Interface* (6th ed.). Pearson.
- ISO 9241-210:2010. *Ergonomics of human–system interaction — Part 210: Human-centred design for interactive systems*. International Organization for Standardization.
- ISO 9241-11:2018. *Ergonomics of human-system interaction — Part 11: Usability: Definitions and concepts*. International Organization for Standardization.
- Pressman, R. S., & Maxim, B. R. (2021). *Ingeniería del Software: Un enfoque práctico* (9.ª ed.). McGraw-Hill.
- Few, S. (2006). *Information Dashboard Design: The Effective Visual Communication of Data*. O'Reilly Media.
