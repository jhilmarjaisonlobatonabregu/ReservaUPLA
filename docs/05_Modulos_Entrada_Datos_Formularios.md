# Semana 05 — Módulos de Entrada de Datos: Formularios del Sistema ReservaUPLA (Sección 9)

> **Universidad Peruana Los Andes (UPLA) · Facultad de Ingeniería**  
> Curso: Construcción de Software · Ciclo Académico 2026

---

## 1. Introducción

La presente sección documenta el diseño e implementación de los módulos de entrada de datos del sistema **ReservaUPLA**, correspondientes a los formularios interactivos que permiten a los actores del sistema registrar, modificar y gestionar la información de usuarios, ambientes universitarios y solicitudes de reserva. Según Pressman y Maxim (2021), los formularios constituyen el mecanismo primario de captura de datos en sistemas de información, y su diseño debe garantizar completitud, integridad y usabilidad simultáneamente.

En **ReservaUPLA** se identificaron tres formularios modales principales, cada uno correspondiente a una entidad del modelo de dominio, implementados en React 19 con TypeScript y validados en doble capa (cliente y servidor) conforme a las reglas de negocio RN-01 a RN-06 definidas en el caso práctico.

---

## 2. Inventario de Formularios Implementados

| # | Formulario | Componente React | Entidad de Dominio | Rol(es) habilitados |
|---|---|---|---|---|
| 1 | **Formulario de Registro de Usuario** | `UsuarioFormCard.tsx` | `Usuario` | Administrador |
| 2 | **Formulario de Registro de Ambiente** | `AmbienteFormCard.tsx` | `Ambiente` | Administrador |
| 3 | **Formulario de Solicitud de Reserva** | `ReservaFormCard.tsx` | `Reserva` | Administrador, Solicitante |

---

## 3. Formulario de Registro de Usuario (`UsuarioFormCard.tsx`)

### 3.1 Campos del Formulario

| Campo | Tipo de control | Validación | Regla |
|---|---|---|---|
| Nombre Completo | `TextInput` | Requerido, mín. 3 caracteres | RN-02 |
| Correo Institucional | `TextInput` (email) | Requerido, formato `@upla.edu.pe` | RN-02 |
| Clave de Acceso | `TextInput` (password) | Requerido, mín. 6 caracteres | RN-02 |
| Rol del Sistema | `SelectInput` | Requerido, valores: Administrador / Solicitante / Responsable de ambiente | RBAC |
| Estado | `SelectInput` | Requerido, valores: Activo / Inactivo | — |

### 3.2 Comportamiento

El formulario se presenta en un modal superpuesto (`z-50`) que captura el foco del teclado (accesibilidad ISO 9241-171). Al enviar el formulario, el componente `UsuariosPage.tsx` delega la operación al `usuarioService`, que invoca `POST /api/usuarios` o `PUT /api/usuarios/{id}` según el modo (creación o edición). La respuesta del servidor se comunica mediante el componente `AlertMessage` con retroalimentación inmediata al usuario.

**[Figura 1]** Formulario modal de registro de usuario con campos de nombre, correo institucional, rol y estado. La barra de título diferencia visualmente el modo creación del modo edición mediante ícono y etiqueta contextual. Fuente: elaboración propia.

> _[Insertar captura del modal `UsuarioFormCard` en modo creación]_

---

## 4. Formulario de Registro de Ambiente (`AmbienteFormCard.tsx`)

### 4.1 Campos del Formulario

| Campo | Tipo de control | Validación | Regla |
|---|---|---|---|
| Nombre del Ambiente | `TextInput` | Requerido, único en el sistema | RN-02 |
| Tipo de Ambiente | `SelectInput` | Requerido: Laboratorio / Auditorio / Sala de Reuniones | — |
| Capacidad (personas) | `TextInput` (number) | Requerido, entero positivo ≥ 1 | RN-02 |
| Ubicación | `TextInput` | Requerido, describe el piso/edificio | RN-02 |
| Estado Operativo | `SelectInput` | Requerido: Disponible / En Mantenimiento / Inactivo | — |

### 4.2 Comportamiento

Los ambientes en estado `En Mantenimiento` o `Inactivo` son automáticamente deshabilitados en el `SelectInput` del formulario de reservas (`ReservaFormCard`), impidiendo que se solicite un espacio no disponible. Esta restricción implementa la **Regla 5 de Shneiderman** (prevención de errores por restricción lógica).

**[Figura 2]** Formulario modal de registro de ambiente universitario con campos de nombre, tipo, capacidad, ubicación y estado operativo. Los ambientes en mantenimiento muestran indicador visual diferenciado. Fuente: elaboración propia.

> _[Insertar captura del modal `AmbienteFormCard` con un ambiente en estado "En Mantenimiento"]_

---

## 5. Formulario de Solicitud de Reserva (`ReservaFormCard.tsx`)

Este formulario constituye el módulo de entrada más complejo del sistema, dada la interacción en tiempo real con los datos de disponibilidad del ambiente seleccionado. Se estructura en tres bloques funcionales:

### 5.1 Bloque 1 — Identificación del Solicitante

El sistema adapta este bloque según el rol de la sesión activa:
- **Solicitante:** muestra una tarjeta de sesión autenticada (nombre, correo, badge "Sesión Activa") en lugar de un selector, forzando que la reserva siempre quede vinculada al usuario autenticado.
- **Administrador:** muestra un `SelectInput` con el padrón de usuarios activos para registrar reservas en nombre de cualquier solicitante.
- **Responsable de ambiente:** accede al formulario en modo verificación de disponibilidad (sin campo de motivo ni botón de envío).

### 5.2 Bloque 2 — Selección de Ambiente, Fecha y Horario

| Campo | Tipo de control | Comportamiento especial |
|---|---|---|
| Ambiente Universitario | `SelectInput` | Ambientes no Disponibles aparecen deshabilitados |
| Fecha Programada | `DateInput` | `min` = fecha de hoy (no permite fechas pasadas para Solicitantes) |
| Hora de Inicio | `TimeInput` | `min="07:00"` `max="22:00"` — Regla RN-04 |
| Hora de Fin | `TimeInput` | `min="07:00"` `max="22:00"` — debe ser > Hora Inicio (RN-03) |

Cuando el usuario selecciona un ambiente y una fecha, el componente calcula en tiempo real (`useMemo`) las reservas existentes en ese día y detecta conflictos horarios mediante la fórmula matemática de solapamiento:

```
conflicto = (HoraInicioNueva < HoraFinExistente) && (HoraFinNueva > HoraInicioExistente)
```

Esta verificación implementa la Regla de Negocio **RN-01** en el frontend, complementada por la misma verificación en el backend (`ReservaService.ComprobarConflictoHorarioAsync`).

### 5.3 Bloque 3 — Atajos de Bloques Académicos

El sistema provee atajos rápidos de selección de horarios institucionales frecuentes (ej. "08:00–10:00", "10:00–12:00", "14:00–16:00"), implementados como botones que invocan `aplicarBloqueHorarioRapido(inicio, fin)`. Esta funcionalidad reduce la carga cognitiva del usuario y aplica la **Regla 2 de Shneiderman** (soporte a usuarios frecuentes mediante atajos).

### 5.4 Bloque 4 — Motivo y Pie de Acciones

El campo de motivo académico (`TextInput`) es obligatorio para Administrador y Solicitante (mín. 5 caracteres), y se oculta para el Responsable de ambiente. El pie del formulario incluye los botones: **Limpiar campos**, **Validar Disponibilidad** (consulta al servidor), **Cancelar** y **Registrar Solicitud**.

**[Figura 3]** Formulario modal de nueva solicitud de reserva con ficha en vivo del ambiente seleccionado, agenda del día y alerta de conflicto horario detectado en tiempo real. Fuente: elaboración propia.

> _[Insertar captura de `ReservaFormCard` con ambiente seleccionado, bloques ocupados visibles y alerta de conflicto activa]_

**[Figura 4]** Atajos de bloques académicos en el formulario de reserva. El bloque activo se resalta en azul institucional. La agenda del día muestra las franjas Aprobadas (rojo) y Pendientes (ámbar). Fuente: elaboración propia.

> _[Insertar captura de `ReservaFormCard` mostrando los atajos de bloques horarios y la agenda del día]_

---

## 6. Principios de Diseño Aplicados en los Formularios

| Principio | Fuente bibliográfica | Aplicación en ReservaUPLA |
|---|---|---|
| Consistencia visual | Shneiderman et al. (2016), Regla 1 | Todos los formularios usan los mismos componentes `TextInput`, `SelectInput`, `DateInput`, `TimeInput` con idénticas clases Tailwind |
| Retroalimentación inmediata | Norman (2013), Cap. 3 | Mensajes de error bajo cada campo; alerta de conflicto en tiempo real sin enviar el formulario |
| Restricción lógica | Norman (2013), Cap. 4 | Deshabilitar ambientes no disponibles; bloquear fechas pasadas; `min/max` en inputs de hora |
| Reversibilidad | Shneiderman et al. (2016), Regla 4 | Botón "Limpiar campos" y tecla `Escape` para cerrar sin guardar |
| Reducción de carga cognitiva | Shneiderman et al. (2016), Regla 8 | Ficha en vivo del ambiente; atajos de bloques horarios; agenda del día |
| Accesibilidad | ISO 9241-171 | `aria-label`, `role="dialog"`, `aria-modal`, captura de foco con `Escape` |

---

## 7. Flujo de Datos de un Formulario de Reserva

```
Usuario completa campos
        │
        ▼
validarFormularioReserva() [frontend/utils/validators.ts]
        │  errores? → mostrar bajo cada campo
        ▼
reservaService.registrarReserva(payload) [POST /api/reservas]
        │
        ▼ (Backend)
ReservaValidator.ValidarSolicitud()
ReservaService.VerificarRolPermitidoParaCrear()
ReservaService.VerificarSolicitanteAsync()
ReservaService.VerificarAmbienteDisponibleAsync()
ReservaService.ComprobarConflictoHorarioAsync()
ReservaService.GuardarNuevaReservaAsync()
        │
        ▼
HTTP 201 Created → AlertMessage tipo "success"
HTTP 400/409    → Mostrar error en campo correspondiente
```

---

## 8. Referencias Bibliográficas

- Norman, D. A. (2013). *The Design of Everyday Things* (Rev. ed.). Basic Books.
- Pressman, R. S., & Maxim, B. R. (2021). *Ingeniería del Software: Un enfoque práctico* (9.ª ed.). McGraw-Hill.
- Shneiderman, B., Plaisant, C., Cohen, M., Jacobs, S., Elmqvist, N., & Diakopoulos, N. (2016). *Designing the User Interface: Strategies for Effective Human-Computer Interaction* (6th ed.). Pearson.
- ISO 9241-110:2020. *Ergonomics of human-system interaction — Part 110: Interaction principles*. International Organization for Standardization.
- ISO 9241-171:2008. *Ergonomics of human-system interaction — Part 171: Guidance on software accessibility*. International Organization for Standardization.
