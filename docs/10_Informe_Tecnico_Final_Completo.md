# INFORME TÉCNICO FINAL
## ReservaUPLA: Sistema de Gestión de Reservas de Ambientes Universitarios
### Asignatura: Construcción de Software — Semanas 01 a 09

> **Universidad Peruana Los Andes (UPLA)**  
> Facultad de Ingeniería · Escuela Profesional de Ingeniería de Sistemas y Computación  
> Ciclo Académico 2026

---

## ÍNDICE

1. [Planteamiento del Problema y Análisis](#1-planteamiento-del-problema-y-análisis)
2. [Ciclo de Vida del Software](#2-ciclo-de-vida-del-software)
3. [Estándares de Construcción y Arquitectura del Sistema](#3-estándares-de-construcción-y-arquitectura-del-sistema)
4. [Módulos de Entrada de Datos y Formularios](#4-módulos-de-entrada-de-datos-y-formularios)
5. [Estrategia de Validación en Triple Capa](#5-estrategia-de-validación-en-triple-capa)
6. [Componentes Reutilizables](#6-componentes-reutilizables)
7. [Refinamiento de Código: SOLID y Clean Code](#7-refinamiento-de-código-solid-y-clean-code)
8. [Módulos de Salida de Datos y Dashboard](#8-módulos-de-salida-de-datos-y-dashboard)
9. [Pregunta de Reflexión Final](#9-pregunta-de-reflexión-final)
10. [Conclusiones](#10-conclusiones)
11. [Referencias Bibliográficas](#11-referencias-bibliográficas)

---

## 1. Planteamiento del Problema y Análisis

### 1.1 Contexto Institucional y Descripción del Problema

La Universidad Peruana Los Andes (UPLA) dispone de una infraestructura académica compuesta por laboratorios de cómputo, auditorios, salas de reuniones y laboratorios especializados, cuya disponibilidad constituye un recurso crítico para el desarrollo de las actividades docentes y de investigación. Previo a la implementación de **ReservaUPLA**, la programación de dichos ambientes se gestionaba mediante mecanismos informales: hojas de cálculo físicas o digitales dispersas, mensajes a través de aplicaciones de mensajería instantánea, correos electrónicos sin trazabilidad y anotaciones manuales en cuadernos de control, administrados de forma descentralizada por distintos responsables de cada facultad.

Este modelo de gestión generaba cuatro problemáticas críticas y recurrentes, identificadas mediante el análisis de requerimientos institucionales:

1. **Duplicidad de reservas (solapamiento horario):** Dos o más docentes o grupos de estudiantes solicitaban el mismo ambiente universitario para la misma fecha y franja horaria, llegando simultáneamente al espacio y encontrándolo ocupado, lo que interrumpía actividades académicas planificadas.
2. **Pérdida de solicitudes:** Los pedidos enviados por canales informales (WhatsApp, correo) quedaban sin atención, respuesta oportuna ni registro histórico consultable.
3. **Ausencia de trazabilidad:** Era imposible auditar con exactitud quién había solicitado un ambiente específico, con qué propósito académico, en qué fecha y quién había autorizado o denegado la solicitud.
4. **Desconocimiento de la disponibilidad real:** Los solicitantes carecían de un mecanismo centralizado para verificar qué bloques horarios se encontraban libres antes de formular su pedido, incrementando las solicitudes inviables y la carga administrativa de coordinación.

### 1.2 Propósito del Sistema

El sistema **ReservaUPLA** se diseña e implementa como una aplicación web institucional full-stack cuyo propósito es centralizar y automatizar el registro, la validación de disponibilidad horaria, el seguimiento y la aprobación de solicitudes de reserva de ambientes universitarios, garantizando la integridad transaccional mediante un motor de detección matemática de solapamientos horarios implementado en las tres capas de la arquitectura.

### 1.3 Identificación de Actores del Sistema

El análisis de requerimientos identificó tres actores institucionales con perfiles, necesidades y restricciones de acceso diferenciados, tal como se detalla en la Tabla 1.

**Tabla 1.** Actores del sistema ReservaUPLA, sus responsabilidades y restricciones de control de acceso basado en roles (RBAC).

| Actor | Perfil Institucional | Responsabilidades en el Sistema | Restricciones de Seguridad |
|---|---|---|---|
| **Solicitante** | Docente, estudiante o personal administrativo con necesidad de uso de ambientes | Registrar solicitudes de reserva (RF-03); verificar disponibilidad previa (RF-04); consultar sus propias solicitudes (RF-05, RF-06); cancelar reservas propias en estado Pendiente (RF-07); visualizar "Mi Dashboard" filtrado por su identidad (RF-08) | Bloqueado con HTTP 403 para aprobar/rechazar reservas (RN-05); no puede consultar reservas de otros usuarios |
| **Administrador** | Encargado de la gestión de infraestructura académica | Único actor autorizado para aprobar o rechazar solicitudes (RN-05, RF-07); gestionar el padrón de usuarios (RF-01) y el catálogo de ambientes (RF-02); visualizar el Dashboard institucional global (RF-08) | Sujeto a las reglas RN-01 (no puede aprobar reservas solapadas) y RN-06 (no puede modificar reservas Rechazadas) |
| **Responsable de ambiente** | Encargado de supervisar el uso operativo de los espacios asignados | Supervisar en modo solo lectura la ocupación, aforo, estado operativo y agenda de los ambientes universitarios asignados; utilizar el verificador de disponibilidad en tiempo real | Bloqueado con HTTP 403 para crear reservas, aprobar/rechazar solicitudes y gestionar usuarios o ambientes |

### 1.4 Requerimientos Funcionales (RF-01 a RF-08)

La Tabla 2 presenta la especificación completa de los ocho requerimientos funcionales definidos para el alcance MVP del sistema.

**Tabla 2.** Requerimientos funcionales del sistema ReservaUPLA.

| Código | Requerimiento Funcional | Descripción |
|---|---|---|
| **RF-01** | Gestión de usuarios | El sistema debe permitir al Administrador registrar, editar y dar de baja usuarios del padrón institucional, asignando rol (Administrador / Solicitante / Responsable de ambiente) y estado (Activo / Inactivo). |
| **RF-02** | Gestión de ambientes | El sistema debe permitir al Administrador registrar, editar y eliminar ambientes universitarios con nombre, tipo, capacidad, ubicación y estado operativo (Disponible / En Mantenimiento / Inactivo). |
| **RF-03** | Registro de solicitudes de reserva | El sistema debe permitir al Solicitante y al Administrador registrar solicitudes de reserva especificando ambiente, fecha, hora de inicio, hora de fin y motivo académico; la reserva ingresa en estado Pendiente. |
| **RF-04** | Validación de disponibilidad horaria | El sistema debe verificar en tiempo real si el ambiente seleccionado tiene reservas Aprobadas que solapen el rango horario propuesto antes de que el usuario envíe la solicitud. |
| **RF-05** | Listado filtrable de reservas | El sistema debe mostrar el listado de reservas con filtros por ambiente, estado, fecha y búsqueda de texto libre; el Solicitante solo visualiza sus propias reservas. |
| **RF-06** | Consulta de detalle de reserva | El sistema debe permitir consultar el expediente completo de una reserva individual (solicitante, ambiente, fecha, horario, motivo, estado e historial). |
| **RF-07** | Gestión de estados de reserva | El sistema debe permitir al Administrador Aprobar o Rechazar reservas Pendientes; al Solicitante Cancelar sus reservas Pendientes. Una reserva Rechazada es inmutable (RN-06). |
| **RF-08** | Dashboard con indicadores | El sistema debe presentar un panel de indicadores dinámicos adaptado al rol del usuario autenticado, con al menos los 5 KPIs mínimos requeridos. |

### 1.5 Reglas de Negocio (RN-01 a RN-06)

**Tabla 3.** Reglas de negocio del sistema ReservaUPLA.

| Código | Regla de Negocio | Descripción |
|---|---|---|
| **RN-01** | Prohibición de solapamiento horario | No puede existir más de una reserva en estado Aprobada para el mismo ambiente, misma fecha y rango horario solapado. La fórmula de detección es: `HoraInicioNueva < HoraFinExistente AND HoraFinNueva > HoraInicioExistente`. |
| **RN-02** | Campos obligatorios | Toda solicitud de reserva debe incluir fecha, hora de inicio, hora de fin, ambiente universitario, solicitante y motivo académico. La ausencia de cualquier campo invalida el registro. |
| **RN-03** | Coherencia horaria | La hora de fin debe ser estrictamente mayor que la hora de inicio (`HoraFin > HoraInicio`). No se admiten reservas de duración cero o negativa. |
| **RN-04** | Jornada institucional | Las reservas solo pueden programarse dentro de la jornada académica institucional: de 07:00 a 22:00 horas. |
| **RN-05** | Control exclusivo de aprobación | Solo el actor con rol Administrador puede cambiar el estado de una reserva a Aprobada o Rechazada. Esta verificación se realiza consultando el rol real del actor en la base de datos. |
| **RN-06** | Inmutabilidad de reservas rechazadas | Una reserva en estado Rechazada no puede modificarse a ningún otro estado. Es el estado terminal negativo del ciclo de vida de una solicitud. |

### 1.6 Modelo de Datos Relacional

El modelo de datos del sistema se implementa en PostgreSQL (`reservaupla_db`) con tres entidades principales y una tabla de relación para la supervisión de ambientes asignados:

- **`Usuarios`** (`UsuarioId` PK, `NombreCompleto`, `Correo`, `ClaveAcceso`, `Rol`, `Activo`, `FechaCreacion`)
- **`Ambientes`** (`AmbienteId` PK, `Nombre`, `Tipo`, `Capacidad`, `Ubicacion`, `Estado`, `FechaCreacion`)
- **`Reservas`** (`ReservaId` PK, `UsuarioId` FK, `AmbienteId` FK, `Fecha`, `HoraInicio`, `HoraFin`, `Motivo`, `Estado`, `FechaCreacion`)
- **`AsignacionesResponsable`** (`UsuarioId` FK + `AmbienteId` FK, clave primaria compuesta)

---

```
╔══════════════════════════════════════════════════════════════════╗
║  [ESPACIO PARA CAPTURA DE PANTALLA]                              ║
║  Figura 1: Diagrama Entidad-Relación del sistema ReservaUPLA     ║
║  Qué debe mostrar: Diagrama ER con las 4 tablas (Usuarios,       ║
║  Ambientes, Reservas, AsignacionesResponsable), sus columnas,    ║
║  tipos de dato y relaciones de clave foránea.                    ║
║  Herramienta sugerida: pgAdmin → ER Diagram, o DBeaver.          ║
╚══════════════════════════════════════════════════════════════════╝
```

---

### 1.7 Alcance MVP y Exclusiones Deliberadas

El sistema se delimita bajo el enfoque de **Producto Mínimo Viable (MVP)**, incluyendo todos los requerimientos RF-01 a RF-08 y reglas RN-01 a RN-06, y excluyendo deliberadamente para evitar sobreingeniería: integración con pasarelas de pago, reservas recurrentes multianuales automatizadas, sincronización con calendarios externos de terceros (Google Calendar, Outlook) y notificaciones push en tiempo real.

---

## 2. Ciclo de Vida del Software

### 2.1 Modelo Seleccionado: Iterativo e Incremental con Enfoque MVP

Para el desarrollo de **ReservaUPLA** se adoptó el **Modelo de Ciclo de Vida Iterativo e Incremental** guiado por el concepto de Producto Mínimo Viable, estructurado en cuatro incrementos semanales alineados con el cronograma de la asignatura. Este modelo fue seleccionado frente a alternativas como el modelo en Cascada puro (Waterfall) y el modelo Espiral por tres razones técnicas fundamentales:

**Primera razón — Entrega temprana de valor verificable:** El enfoque iterativo permite validar desde el primer incremento el motor de detección de solapamientos horarios (RN-01) y las entidades del dominio, reduciendo el riesgo de que defectos de diseño se propaguen a capas superiores.

**Segunda razón — Desacoplamiento por capas:** La arquitectura Clean Architecture facilita la construcción y prueba independiente del núcleo de reglas de negocio (`ReservaUPLA.Domain` y `ReservaUPLA.Application`) antes de que la interfaz gráfica (`frontend/`) y la persistencia (`ReservaUPLA.Infrastructure`) estén completamente implementadas.

**Tercera razón — Refinamiento continuo de calidad:** Cada iteración permite incorporar progresivamente los 9 componentes reutilizables, someter la interfaz a inspección frente a las heurísticas de Nielsen [1] y los principios de Norman [2], y aplicar refactorizaciones de Clean Code [3] sin interrumpir la funcionalidad entregada.

### 2.2 Planificación de Incrementos

**Tabla 4.** Planificación de incrementos del proyecto ReservaUPLA.

| Incremento | Semanas | Entregables Construidos | RF y RN Cubiertos |
|---|---|---|---|
| **Incremento 1** | 01-02 | Análisis de actores y requerimientos; diseño del modelo relacional en PostgreSQL; entidades de dominio C# (`Usuario`, `Ambiente`, `Reserva`); justificación del ciclo de vida | Semanas 01-02, RF-01 a RF-08 (diseño), RN-01 a RN-06 (diseño) |
| **Incremento 2** | 03-04 | Manual de estándares; Clean Architecture 4 capas; repositorios EF Core; validadores de dominio; controladores REST con `Result<T>` | RF-01, RF-02, RF-03, RF-04, RN-01 a RN-06 (implementación) |
| **Incremento 3** | 05-07 | 9 componentes UI reutilizables; formularios modales; barra de filtros; validación en triple capa (Frontend + Backend + BD); constraint `EXCLUDE USING gist` | RF-03, RF-04, RF-05, RF-06, RF-07; Sección 9 |
| **Incremento 4** | 08-09 | Refactorización Clean Code; Dashboard diferenciado por rol; tablas de salida; modales de detalle y confirmación de estado; compilación 0 errores | RF-08, Sección 10, Semana 09 |

---

## 3. Estándares de Construcción y Arquitectura del Sistema

### 3.1 Arquitectura General del Sistema

El sistema **ReservaUPLA** implementa una **Arquitectura Cliente-Servidor Desacoplada** donde el backend y el frontend son proyectos independientes que se comunican exclusivamente a través de una API REST. La Figura 2 ilustra la estructura general del sistema.

---

```
╔══════════════════════════════════════════════════════════════════╗
║  [ESPACIO PARA CAPTURA DE PANTALLA]                              ║
║  Figura 2: Diagrama de arquitectura general del sistema          ║
║  Qué debe mostrar: Diagrama de capas con React (puerto 5174)     ║
║  → API REST → Clean Architecture .NET (puerto 5060) → PostgreSQL ║
║  Puede ser elaborado en draw.io o similar.                       ║
╚══════════════════════════════════════════════════════════════════╝
```

---

### 3.2 Arquitectura del Backend: Clean Architecture (.NET 8)

El backend implementa la **Clean Architecture** propuesta por Martin [4], organizada en cuatro proyectos con dependencia unidireccional hacia el núcleo del dominio:

**Proyecto 1 — `ReservaUPLA.Domain` (Núcleo):**
Contiene las entidades POCO puras (`Usuario`, `Ambiente`, `Reserva`), los enumerados de dominio (`DomainEnums`), las constantes institucionales (`ReservaConstantes`) y las interfaces de repositorio (`IUsuarioRepository`, `IAmbienteRepository`, `IReservaRepository`). Esta capa no tiene dependencia de ningún framework externo.

**Proyecto 2 — `ReservaUPLA.Application` (Casos de Uso):**
Implementa los servicios de aplicación (`ReservaService`, `AmbienteService`, `UsuarioService`, `DashboardService`), los contratos de Data Transfer Objects (DTOs de tipo `record` inmutable), los validadores de dominio (`ReservaValidator`, `AmbienteValidator`, `UsuarioValidator`), el catálogo centralizado de mensajes (`MensajesCatalogo`) y el patrón `Result<T>` con `ResultErrorCode` enum para encapsular resultados de operaciones.

**Proyecto 3 — `ReservaUPLA.Infrastructure` (Implementación Técnica):**
Implementa la persistencia mediante Entity Framework Core 8 con el proveedor Npgsql (`AppDbContext`), las configuraciones Fluent API para cada entidad y los repositorios concretos que cumplen las interfaces del dominio.

**Proyecto 4 — `ReservaUPLA.API` (Punto de Entrada HTTP):**
Contiene los controladores REST delgados (`UsuariosController`, `AmbientesController`, `ReservasController`, `DashboardController`) que únicamente reciben la solicitud HTTP, validan el modelo, delegan al servicio de aplicación y traducen el `Result<T>` al código HTTP correspondiente mediante un `switch` sobre `ErrorCode`. El middleware `ExceptionHandlingMiddleware` gestiona excepciones no controladas conforme al estándar RFC 7807 (ProblemDetails).

### 3.3 Arquitectura del Frontend: Componentes Modulares (React 19)

El frontend implementa una **Arquitectura Basada en Componentes** sobre React 19 + TypeScript + Vite + Tailwind CSS v4. La estructura modular de `frontend/src/` organiza el código en capas con responsabilidades diferenciadas:

```
frontend/src/
├── components/
│   ├── ui/          # 9 componentes reutilizables primitivos
│   ├── layout/      # Marco estructural (Header, Sidebar, AuthBrandPanel)
│   ├── reservas/    # Componentes de dominio del módulo de reservas
│   ├── ambientes/   # Componentes de dominio del módulo de ambientes
│   ├── usuarios/    # Componentes de dominio del módulo de usuarios
│   └── dashboard/   # Componentes de indicadores y KPIs
├── hooks/           # Custom hooks (useReservasManagement, useDashboard, etc.)
├── layouts/         # Plantillas AuthLayout y MainLayout
├── pages/           # Orquestadores de página (un archivo por vista)
├── services/        # apiClient.ts (fetch nativo) + servicios tipados
├── types/           # Contratos e interfaces TypeScript sin uso de 'any'
└── utils/           # Validadores, formateadores de fecha/hora y constantes
```

### 3.4 Estándares de Codificación

**Tabla 5.** Convenciones de nomenclatura aplicadas en el sistema ReservaUPLA.

| Elemento | Convención | Ejemplo en ReservaUPLA |
|---|---|---|
| Clases, Entidades, Interfaces (C#) | `PascalCase` | `ReservaService`, `IReservaRepository` |
| Campos privados (C#) | `_camelCase` | `_reservaRepository`, `_usuarioRepository` |
| Componentes React y tipos TypeScript | `PascalCase` | `ReservaFormCard.tsx`, `UserSession` |
| Funciones, hooks y variables (TS) | `camelCase` | `useReservasManagement`, `formatearFechaLegible` |
| Constantes globales (TS) | `UPPER_SNAKE_CASE` | `HORA_MINIMA_INSTITUCIONAL`, `BLOQUES_HORARIOS_RAPIDOS` |
| Tablas y columnas PostgreSQL | `PascalCase` entre comillas | `"Usuarios"`, `"HoraInicio"`, `"AmbienteId"` |

### 3.5 Estándares de Control de Versiones

El proyecto adopta el estándar **Conventional Commits** para los mensajes de confirmación de cambios, con los prefijos: `feat:` (nueva funcionalidad), `fix:` (corrección de defectos), `refactor:` (mejora de estructura sin cambio de comportamiento), `docs:` (documentación) y `test:` (pruebas). Se prohíbe explícitamente incluir menciones de herramientas de asistencia en los mensajes de commit.

---

## 4. Módulos de Entrada de Datos y Formularios

### 4.1 Principios de Diseño de Formularios

Los formularios de **ReservaUPLA** se diseñaron siguiendo los principios de Diseño Centrado en el Humano (ISO 9241-210:2010 [5]) y las 8 Reglas de Oro de Shneiderman [6]: consistencia visual (Regla 1), reducción de carga de memoria (Regla 8), restricción lógica para prevenir errores (Regla 5) y retroalimentación inmediata (Regla 4). Todos los formularios se implementan como modales superpuestos con captura de foco de teclado (`Escape` para cerrar) y atributos ARIA para accesibilidad (ISO 9241-171 [7]).

### 4.2 Formulario de Registro de Usuario (`UsuarioFormCard.tsx`)

El formulario de gestión de usuarios permite al Administrador crear y editar registros del padrón institucional. Sus campos son: nombre completo (`TextInput`), correo institucional (`TextInput` con validación de formato), clave de acceso (`TextInput` tipo password), rol del sistema (`SelectInput` con las tres opciones RBAC) y estado (Activo/Inactivo). El componente opera en modo creación (`POST /api/usuarios`) o modo edición (`PUT /api/usuarios/{id}`) según el contexto de invocación desde `UsuariosPage.tsx`.

---

```
╔══════════════════════════════════════════════════════════════════╗
║  [ESPACIO PARA CAPTURA DE PANTALLA]                              ║
║  Figura 3: Formulario modal de registro de usuario               ║
║  Qué debe mostrar: Modal `UsuarioFormCard` abierto en modo       ║
║  creación con todos los campos visibles. Puede mostrar errores   ║
║  de validación en al menos un campo para evidenciar la          ║
║  retroalimentación inmediata del sistema.                        ║
╚══════════════════════════════════════════════════════════════════╝
```

---

### 4.3 Formulario de Registro de Ambiente (`AmbienteFormCard.tsx`)

El formulario de ambientes permite registrar el catálogo de espacios universitarios con los campos: nombre del ambiente, tipo (Laboratorio / Auditorio / Sala de Reuniones), capacidad (aforo en personas), ubicación y estado operativo. Los ambientes registrados con estado `En Mantenimiento` o `Inactivo` son automáticamente deshabilitados como opciones en el `SelectInput` del formulario de reservas, implementando la **restricción lógica** (Norman [2], Cap. 4) que previene solicitudes sobre espacios no disponibles.

---

```
╔══════════════════════════════════════════════════════════════════╗
║  [ESPACIO PARA CAPTURA DE PANTALLA]                              ║
║  Figura 4: Formulario modal de registro de ambiente universitario ║
║  Qué debe mostrar: Modal `AmbienteFormCard` con campos de        ║
║  nombre, tipo, capacidad, ubicación y estado. Preferiblemente   ║
║  con un ambiente en estado "En Mantenimiento" para evidenciar    ║
║  la restricción aplicada en el formulario de reservas.           ║
╚══════════════════════════════════════════════════════════════════╝
```

---

### 4.4 Formulario de Solicitud de Reserva (`ReservaFormCard.tsx`)

Este formulario constituye el módulo de entrada más complejo del sistema. Se estructura en cuatro bloques funcionales con comportamiento adaptativo según el rol de la sesión activa:

**Bloque 1 — Identificación del solicitante:** Para el rol Solicitante, muestra una tarjeta de sesión autenticada que vincula automáticamente la reserva a su identidad (sin posibilidad de registro en nombre de otro usuario). Para el Administrador, despliega un `SelectInput` con el padrón de usuarios activos. El Responsable de ambiente accede al formulario en modo verificador de disponibilidad, sin campos de motivo ni botón de registro.

**Bloque 2 — Selección de ambiente y fecha:** El `SelectInput` de ambientes deshabilita aquellos en estado no Disponible. El `DateInput` establece `min = fechaDeHoy()` para Solicitantes, impidiendo solicitudes retroactivas.

**Bloque 3 — Horario con verificación en tiempo real:** Los componentes `TimeInput` aplican `min="07:00"` y `max="22:00"` (RN-04). Al modificar las horas, el componente calcula en tiempo real mediante `useMemo` si existe solapamiento con reservas Aprobadas del mismo ambiente y fecha (RN-01), mostrando una alerta roja inmediata sin necesidad de enviar el formulario al servidor.

**Bloque 4 — Atajos de bloques académicos:** Se proveen botones de selección rápida de franjas horarias frecuentes (p.ej. "08:00–10:00", "10:00–12:00"), que al ser seleccionados actualizan simultáneamente los campos de hora de inicio y fin. Este mecanismo implementa la **Regla 2 de Shneiderman** (soporte a usuarios frecuentes mediante atajos de teclado y acceso acelerado).

---

```
╔══════════════════════════════════════════════════════════════════╗
║  [ESPACIO PARA CAPTURA DE PANTALLA]                              ║
║  Figura 5: Formulario modal de solicitud de reserva              ║
║  Qué debe mostrar: Modal `ReservaFormCard` con ambiente          ║
║  seleccionado, agenda del día visible (bloques Aprobados en      ║
║  rojo, Pendientes en ámbar) y alerta de conflicto horario en     ║
║  tiempo real activa. Evidencia del Bloque 2 y la fórmula RN-01.  ║
╚══════════════════════════════════════════════════════════════════╝
```

```
╔══════════════════════════════════════════════════════════════════╗
║  [ESPACIO PARA CAPTURA DE PANTALLA]                              ║
║  Figura 6: Atajos de bloques académicos en el formulario         ║
║  Qué debe mostrar: Sección de atajos horarios del formulario     ║
║  de reserva con un bloque activo resaltado en azul               ║
║  institucional (#1E3A8A). La agenda del día debe mostrar         ║
║  al menos un bloque ocupado y otro libre.                        ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 5. Estrategia de Validación en Triple Capa

La arquitectura de validación de **ReservaUPLA** opera en tres capas complementarias y sucesivas. Según Sommerville [8], la validación de entrada debe aplicarse en múltiples niveles de la arquitectura para garantizar integridad de datos independientemente del canal de acceso, anticipando tanto errores involuntarios del usuario como intentos deliberados de manipulación de las solicitudes HTTP.

### 5.1 Capa 1: Validación en el Frontend (React + TypeScript)

La función `validarFormularioReserva()` ubicada en `frontend/src/utils/validators.ts` ejecuta la validación preventiva de los 6 campos obligatorios (RN-02), la coherencia horaria (RN-03) y la jornada institucional (RN-04) antes de realizar cualquier llamada al servidor. Los errores se comunican al usuario mediante mensajes rojos descriptivos bajo cada campo afectado, preservando todos los datos ya ingresados (Regla 5 de Shneiderman — no castigar al usuario).

La verificación del solapamiento horario en tiempo real (RN-01) se implementa mediante el hook `useMemo` en el componente `ReservaFormCard.tsx`, aplicando la fórmula matemática:

```
conflicto_detectado = (HoraInicioNueva < HoraFinExistente) ∧ (HoraFinNueva > HoraInicioExistente)
```

Esta verificación opera sobre las reservas ya cargadas en memoria del cliente, sin costo adicional de red, y produce retroalimentación visual instantánea al usuario mientras ajusta las horas del formulario.

---

```
╔══════════════════════════════════════════════════════════════════╗
║  [ESPACIO PARA CAPTURA DE PANTALLA]                              ║
║  Figura 7: Validación frontend — errores bajo campos             ║
║  Qué debe mostrar: Formulario de reserva intentando enviarse     ║
║  con campos incompletos. Los componentes TextInput, SelectInput  ║
║  y TimeInput deben mostrar mensajes de error en rojo bajo        ║
║  cada campo inválido, sin borrar el contenido ya ingresado.      ║
╚══════════════════════════════════════════════════════════════════╝
```

---

### 5.2 Capa 2: Validación en el Backend (.NET 8 — Capa Application)

El backend implementa el patrón `Result<T>` con el enum `ResultErrorCode` (`Validation`, `Forbidden`, `NotFound`, `Conflict`) en `ReservaUPLA.Application/Common/Result.cs`. Este patrón encapsula los resultados de las operaciones de servicio sin lanzar excepciones para flujos de negocio esperados, permitiendo a los controladores decidir el código HTTP de respuesta mediante un `switch` tipado sobre `ErrorCode`.

El método `RegistrarReservaAsync` en `ReservaService.cs` se descompone en cinco métodos privados con responsabilidad única:

1. `VerificarRolPermitidoParaCrear(actorRol)` → HTTP 403 si el rol es Responsable de ambiente
2. `VerificarSolicitanteAsync(usuarioId)` → HTTP 404 si el usuario no existe o está inactivo
3. `VerificarAmbienteDisponibleAsync(ambienteId)` → HTTP 409 si el ambiente no está en estado Disponible
4. `ComprobarConflictoHorarioAsync(ambienteId, fecha, inicio, fin)` → HTTP 409 si existe solapamiento (RN-01)
5. `GuardarNuevaReservaAsync(reserva)` → Persiste la entidad en PostgreSQL

Para el hardening de RN-05, el método `CambiarEstadoAsync` implementa verificación del rol real del actor directamente en la base de datos mediante `ObtenerPorIdAsync`, previniendo manipulaciones del encabezado HTTP `X-Usuario-Rol`.

---

```
╔══════════════════════════════════════════════════════════════════╗
║  [ESPACIO PARA CAPTURA DE PANTALLA]                              ║
║  Figura 8: Respuesta HTTP 409 Conflict del backend               ║
║  Qué debe mostrar: Pestaña Network de DevTools del navegador     ║
║  con una petición POST /api/reservas rechazada con código 409.   ║
║  El body de la respuesta debe mostrar el JSON ProblemDetails     ║
║  con el mensaje institucional de conflicto horario.              ║
╚══════════════════════════════════════════════════════════════════╝
```

---

### 5.3 Capa 3: Validación en la Base de Datos (PostgreSQL)

La base de datos opera como la última línea de defensa contra inconsistencias, mediante dos mecanismos declarativos:

**Restricciones CHECK:** Garantizan las reglas RN-03 (`CHECK ("HoraFin" > "HoraInicio")`) y RN-04 (`CHECK ("HoraInicio" >= '07:00:00' AND "HoraFin" <= '22:00:00')`), rechazando a nivel de motor de base de datos cualquier inserción que viole la coherencia horaria o la jornada institucional.

**Restricción EXCLUDE USING gist (RN-01):** Constituye el mecanismo más sofisticado del sistema. Requiere la extensión `btree_gist` de PostgreSQL y define una exclusión que hace matemáticamente imposible la coexistencia de dos filas en la tabla `Reservas` que representen reservas Aprobadas en el mismo ambiente, misma fecha y rango horario solapado:

```sql
ALTER TABLE "Reservas"
ADD CONSTRAINT "EX_Reservas_SinSolapamiento_Aprobadas"
EXCLUDE USING gist (
    "AmbienteId"  WITH =,
    "Fecha"       WITH =,
    tsrange("Fecha"::timestamp + "HoraInicio"::interval,
            "Fecha"::timestamp + "HoraFin"::interval) WITH &&
)
WHERE ("Estado" = 'Aprobada');
```

Esta restricción actúa incluso ante condiciones de carrera concurrentes, garantizando integridad transaccional ACID.

**Tabla 6.** Resumen de la implementación de las reglas de negocio en la estrategia de validación en triple capa.

| RN | Regla | Capa 1: Frontend | Capa 2: Backend | Capa 3: Base de Datos |
|---|---|---|---|---|
| RN-01 | No solapamiento en Aprobadas | `conflictoEnTiempoReal` (useMemo) | `ComprobarConflictoHorarioAsync` → 409 | `EXCLUDE USING gist` (btree_gist) |
| RN-02 | Campos obligatorios | `validarFormularioReserva()` + `required` | `ReservaValidator.ValidarSolicitud()` | `NOT NULL` constraints |
| RN-03 | HoraFin > HoraInicio | `validators.ts` + `TimeInput` | `ValidarRangoHorario()` | `CHECK ("HoraFin" > "HoraInicio")` |
| RN-04 | Jornada 07:00–22:00 | `min/max` en `TimeInput` | `ReservaConstantes` | `CHECK` de rango horario |
| RN-05 | Solo Admin aprueba/rechaza | Ocultar botones por rol | `VerificarActorEsAdminEnBdAsync()` → 403 | — |
| RN-06 | Rechazada es inmutable | Candado visual en tabla | `ValidarCambioEstado()` → 409 | — |

---

## 6. Componentes Reutilizables

### 6.1 Principio de Reutilización en Ingeniería de Software

La reutilización sistemática de componentes es uno de los principios fundamentales de la ingeniería de software [9]. En el contexto del desarrollo frontend con React, la reutilización se materializa mediante **componentes funcionales tipados** que encapsulan comportamiento, estilos y accesibilidad en unidades independientes, cohesivas y fácilmente mantenibles. Pressman y Maxim [10] sostienen que un componente reutilizable bien diseñado reduce el tiempo de desarrollo, disminuye la densidad de defectos y favorece la consistencia visual del sistema.

### 6.2 Los 9 Componentes UI Reutilizables del Sistema

Los componentes se ubican en `frontend/src/components/ui/` y se re-exportan desde el archivo barrel `index.ts`, habilitando importaciones limpias desde cualquier módulo del sistema. La Tabla 7 describe los nueve componentes implementados y su consumo en los módulos del sistema.

**Tabla 7.** Inventario de los 9 componentes UI reutilizables de ReservaUPLA.

| # | Componente | Responsabilidad | Módulos que lo consumen |
|---|---|---|---|
| 1 | `TextInput` | Campo de texto con label, error, helper y soporte modo oscuro | Usuarios, Ambientes, Reservas, Login |
| 2 | `SelectInput` | Selector desplegable con opciones tipadas y soporte de deshabilitar opciones individuales | Usuarios, Ambientes, Reservas, Filtros |
| 3 | `DateInput` | Input de fecha nativo con restricción de rango mínimo/máximo | Reservas, Filtros |
| 4 | `TimeInput` | Input de hora con restricciones min/max institucionales (07:00–22:00) | Reservas |
| 5 | `Button` | Botón polimórfico con 5 variantes (primary, secondary, outline, danger, ghost), estados de carga y tooltip integrado | Todos los módulos |
| 6 | `AlertMessage` | Mensaje de retroalimentación tipado (success, error, warning, info) con lista expandible de detalles | Todos los módulos |
| 7 | `Tooltip` | Globo de ayuda contextual accesible al hacer hover o foco con teclado | Todos los módulos |
| 8 | `PageHeader` | Cabecera de sección con título, subtítulo, badge de rol y área de acciones | Dashboard, Reservas, Ambientes, Usuarios |
| 9 | `ModalWrapper` | Contenedor modal con overlay, captura de foco, cierre con Escape y protección de borrador | Todos los módulos |

### 6.3 Especificación del Componente `Button` (Componente más Consumido)

```typescript
// Interfaz TypeScript del componente Button
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?:    'xs' | 'sm' | 'md' | 'lg';
  isLoading?:   boolean;   // Spinner + loadingText al estar en estado de carga
  loadingText?: string;    // Texto alternativo durante la carga
  icon?:        ReactNode; // Ícono Lucide a la izquierda del label
  tooltip?:     string;    // Texto del Tooltip accesible integrado
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}
```

---

```
╔══════════════════════════════════════════════════════════════════╗
║  [ESPACIO PARA CAPTURA DE PANTALLA]                              ║
║  Figura 9: Los 9 componentes UI reutilizables en uso             ║
║  Qué debe mostrar: Collage o pantalla del sistema que muestre    ║
║  simultáneamente el mayor número posible de los 9 componentes:   ║
║  TextInput, SelectInput, DateInput, TimeInput, Button (varias    ║
║  variantes), AlertMessage, Tooltip, PageHeader y ModalWrapper.   ║
║  Recomendado: captura del formulario de reserva + la tabla.      ║
╚══════════════════════════════════════════════════════════════════╝
```

---

### 6.4 Impacto de la Reutilización en la Calidad del Sistema

La centralización de la interfaz en los 9 componentes reutilizables generó tres beneficios transversales concretos: (a) el Modo Oscuro persistente se implementó en un único lugar y se propagó automáticamente a los 4 módulos del sistema; (b) la captura de foco por teclado (ISO 9241-171 [7]) y los atributos ARIA se configuraron una vez en `ModalWrapper` y quedaron garantizados en todos los modales; (c) la corrección de cualquier error de accesibilidad en inputs requiere modificar un único componente (`TextInput`) en lugar de cada formulario individualmente.

---

## 7. Refinamiento de Código: SOLID y Clean Code

### 7.1 Fundamentos del Refinamiento

El refinamiento de código es la práctica de mejorar la estructura interna del sistema sin alterar su comportamiento observable, con el objetivo de reducir la deuda técnica y mejorar la mantenibilidad a largo plazo. Martin [3] define el código limpio como aquel que "hace una sola cosa y la hace bien", que "puede ser leído por alguien que no lo escribió" y que "tiene pruebas". Fowler [11] complementa esta visión afirmando que la refactorización es el proceso disciplinado de restructurar el código existente sin cambiar su comportamiento externo.

En **ReservaUPLA**, el refinamiento se aplicó sistemáticamente en ambas capas del sistema, con verificación continua mediante compilación limpia (`dotnet build` → 0 errores y 0 advertencias; `npx tsc --noEmit` → 0 errores).

### 7.2 Refinamientos en el Backend

**Descomposición de métodos monolíticos (SRP — Principio de Responsabilidad Única):**  
El método `RegistrarReservaAsync`, que originalmente concentraba ~80 líneas con múltiples responsabilidades, fue descompuesto en 5 métodos privados con responsabilidad única. Esta refactorización hace que el flujo de validación sea legible como una narración secuencial: verificar rol → verificar solicitante → verificar ambiente → comprobar conflicto → guardar.

**Enum `ResultErrorCode` (eliminación del antipatrón de comparación de strings):**  
Los controladores originalmente determinaban el código HTTP comparando fragmentos del mensaje de error. Esta práctica frágil fue reemplazada por un `switch` tipado sobre el enum `ResultErrorCode`, cuya extensibilidad no requiere modificar los controladores existentes.

**Centralización de mensajes en `MensajesCatalogo` (Principio DRY):**  
Los 29 literales de texto de error dispersos en servicios, validadores y controladores fueron migrados a constantes en la clase estática `MensajesCatalogo.cs`. Cualquier modificación de un mensaje (p.ej. para internacionalización) se realiza en un único lugar.

**Clase `DomainNormalizador` (eliminación de triplicación de código):**  
Tres copias idénticas del método `NormalizarEstado` existían en las entidades `Reserva`, `Ambiente` y el servicio de usuarios. Se unificaron en la clase `DomainNormalizador.cs`, y las entidades delegan a esta clase centralizada.

### 7.3 Refinamientos en el Frontend

**Agrupación de props de `ReservaFormCard` en interfaces cohesivas:**  
El componente recibía originalmente 28 props individuales sin agrupación semántica. La refactorización las organizó en tres interfaces con responsabilidad clara: `ReservaFormCampos` (valores y handlers de cambio), `ReservaFormEstado` (errores, disponibilidad y loaders) y `ReservaFormAcciones` (submit, limpiar, verificar y cerrar).

**Modularización de `useReservasManagement` en 3 sub-hooks:**  
El hook central de ~390 líneas con 4 responsabilidades distintas fue refactorizado en tres sub-hooks independientes (`useReservaFiltros`, `useReservaFormulario`, `useReservaEstado`) compuestos por un hook orquestador que mantiene el mismo objeto de retorno, preservando compatibilidad con `ReservasPage.tsx` sin ningún cambio en el componente consumidor.

**Tabla 8.** Métricas de calidad verificadas al finalizar el refinamiento de código.

| Indicador de Calidad | Resultado | Herramienta |
|---|---|---|
| Errores de compilación backend | **0** | `dotnet build ReservaUPLA.sln -v q` |
| Advertencias de compilación backend | **0** | `dotnet build ReservaUPLA.sln -v q` |
| Errores de tipo TypeScript en frontend | **0** | `npx tsc --noEmit` |
| Build de producción Vite | **Exitoso** | `npm run build` |
| Módulos transformados por Vite | **2 108** | `npm run build` |
| Uso de `any` en TypeScript | **0** | Revisión estricta con `tsconfig strict: true` |
| Strings literales hardcodeados en servicios/validadores | **0** | Migrados a `MensajesCatalogo` |
| Métodos `NormalizarEstado`/`NormalizarRol` duplicados | **0** | Centralizados en `DomainNormalizador` |

---

```
╔══════════════════════════════════════════════════════════════════╗
║  [ESPACIO PARA CAPTURA DE PANTALLA]                              ║
║  Figura 10: Resultado de compilación backend sin errores         ║
║  Qué debe mostrar: Terminal con salida de                        ║
║  `dotnet build ReservaUPLA.sln -v q` mostrando:                 ║
║  "0 Advertencia(s)   0 Error(es)" en las líneas finales.         ║
╚══════════════════════════════════════════════════════════════════╝
```

```
╔══════════════════════════════════════════════════════════════════╗
║  [ESPACIO PARA CAPTURA DE PANTALLA]                              ║
║  Figura 11: Resultado de compilación frontend sin errores        ║
║  Qué debe mostrar: Terminal con salida de `npm run build`        ║
║  mostrando "✓ built in 869ms" (o similar) y la lista de         ║
║  archivos generados en dist/ sin ningún error o advertencia.     ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 8. Módulos de Salida de Datos y Dashboard

### 8.1 Dashboard Diferenciado por Rol (RF-08)

El Dashboard de **ReservaUPLA** implementa el Requerimiento Funcional RF-08 mediante vistas diferenciadas adaptadas al modelo mental de cada actor (Norman [2], Cap. 2). El endpoint `GET /api/dashboard` retorna indicadores calculados dinámicamente en base al rol y la identidad del actor autenticado.

**Dashboard del Administrador — Visión Institucional Global:**

Los cinco indicadores mínimos requeridos se presentan en un grid responsive de tarjetas KPI:

| # | Indicador | Descripción | Color |
|---|---|---|---|
| 1 | **Total de Reservas** | Suma de todas las reservas en todos los estados | Azul institucional |
| 2 | **Pendientes de Evaluación** | Reservas en estado Pendiente que requieren decisión | Ámbar (urgencia) |
| 3 | **Aprobadas** | Reservas confirmadas y vigentes en el sistema | Verde esmeralda |
| 4 | **Rechazadas** | Reservas denegadas (inmutables por RN-06) | Rojo |
| 5 | **Ambientes Activos** | Ambientes universitarios en estado Disponible | Índigo |

**Dashboard del Solicitante — "Mi Dashboard":**  
Los mismos 5 indicadores filtrados exclusivamente por el `UsuarioId` de la sesión activa. El título de la página cambia a "Mis Solicitudes de Reserva de Ambientes" para comunicar explícitamente el alcance personal de la vista, implementando la coherencia entre el Modelo de Diseño y el Modelo Mental del Usuario [2].

**Dashboard del Responsable de Ambiente:**  
Indicadores de ocupación centrados en los ambientes asignados mediante la tabla `AsignacionesResponsable`, con énfasis en la disponibilidad y la carga horaria.

---

```
╔══════════════════════════════════════════════════════════════════╗
║  [ESPACIO PARA CAPTURA DE PANTALLA]                              ║
║  Figura 12: Dashboard del Administrador con los 5 KPIs           ║
║  Qué debe mostrar: `DashboardPage` en rol Administrador con      ║
║  los 5 indicadores dinámicos, badges cromáticos y el banner      ║
║  ámbar de "Atención requerida" con el número de reservas         ║
║  Pendientes. El modo oscuro es opcional pero valorado.           ║
╚══════════════════════════════════════════════════════════════════╝
```

```
╔══════════════════════════════════════════════════════════════════╗
║  [ESPACIO PARA CAPTURA DE PANTALLA]                              ║
║  Figura 13: Dashboard del Solicitante ("Mi Dashboard")           ║
║  Qué debe mostrar: `DashboardPage` en rol Solicitante con        ║
║  el título "Mis Solicitudes de Reserva de Ambientes" y los       ║
║  indicadores filtrados solo por las reservas del usuario         ║
║  autenticado (diferente a la vista del Administrador).           ║
╚══════════════════════════════════════════════════════════════════╝
```

---

### 8.2 Tabla de Reservas — Módulo de Salida Principal (`ReservaTableSection.tsx`)

La tabla de reservas presenta el listado completo con columnas de ambiente, solicitante (ocultado para Solicitante), fecha, horario, motivo (truncado con tooltip), estado (badge cromático) y acciones diferenciadas por RBAC. El Administrador visualiza botones de Aprobar y Rechazar; el Solicitante solo visualiza el botón de Cancelar en sus reservas Pendientes; el Responsable de ambiente visualiza la tabla en modo solo lectura.

La barra de filtros (`ReservaFilterBar.tsx`) implementa cuatro criterios: por ambiente (consulta al servidor), por estado (consulta al servidor), por fecha (consulta al servidor) y búsqueda de texto libre (filtrado local instantáneo con normalización NFD tolerante a tildes y mayúsculas).

---

```
╔══════════════════════════════════════════════════════════════════╗
║  [ESPACIO PARA CAPTURA DE PANTALLA]                              ║
║  Figura 14: Tabla de gestión de reservas — vista Administrador   ║
║  Qué debe mostrar: `ReservaTableSection` en rol Administrador    ║
║  con reservas en distintos estados (Pendiente, Aprobada,         ║
║  Rechazada). Los botones Aprobar (verde) y Rechazar (rojo)       ║
║  deben ser visibles en las filas con estado Pendiente. Las       ║
║  filas Rechazadas deben mostrar el ícono de candado (RN-06).     ║
╚══════════════════════════════════════════════════════════════════╝
```

```
╔══════════════════════════════════════════════════════════════════╗
║  [ESPACIO PARA CAPTURA DE PANTALLA]                              ║
║  Figura 15: Tabla de reservas — vista Solicitante                ║
║  Qué debe mostrar: `ReservaTableSection` en rol Solicitante      ║
║  sin las columnas ni botones de aprobación/rechazo. Solo         ║
║  deben aparecer las reservas propias del usuario autenticado.    ║
╚══════════════════════════════════════════════════════════════════╝
```

---

### 8.3 Modal de Detalle y Modal de Confirmación de Estado

El `ReservaDetalleModal.tsx` presenta el expediente completo de una reserva seleccionada: identificación (ID, fecha de registro, estado), datos del ambiente (nombre, tipo, capacidad, ubicación), datos del solicitante (nombre, correo, rol), programación (fecha, horario, duración calculada) y motivo completo.

El `ReservaEstadoConfirmModal.tsx` implementa la **Regla 6 de Shneiderman** (permitir la reversión de acciones y advertir sobre las irreversibles) listando las reservas Pendientes que compiten por el mismo bloque horario antes de que el Administrador confirme una aprobación, habilitando una decisión informada.

---

```
╔══════════════════════════════════════════════════════════════════╗
║  [ESPACIO PARA CAPTURA DE PANTALLA]                              ║
║  Figura 16: Modal de confirmación de aprobación de reserva       ║
║  Qué debe mostrar: `ReservaEstadoConfirmModal` con el resumen    ║
║  de la reserva a aprobar y la lista de reservas Pendientes en    ║
║  competencia (si las hubiera). Los botones Confirmar y Cancelar  ║
║  deben ser visibles con jerarquía visual clara.                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

### 8.4 Pantalla de Inicio de Sesión

La pantalla de login (`LoginPage.tsx` + `AuthLayout.tsx`) implementa el modelo conceptual correcto (Norman [2], Cap. 2): el panel izquierdo corporativo comunica visualmente la identidad institucional UPLA mediante la imagen de fondo, overlay semitransparente con `backdrop-blur`, tres tarjetas de garantías operativas (Horario Hábil, Cero Cruces, Control por Rol) y el pie institucional. El panel derecho contiene el formulario de autenticación con validación de contraseña real contra las credenciales institucionales.

---

```
╔══════════════════════════════════════════════════════════════════╗
║  [ESPACIO PARA CAPTURA DE PANTALLA]                              ║
║  Figura 17: Pantalla de inicio de sesión del sistema             ║
║  Qué debe mostrar: `LoginPage` completa con el panel izquierdo   ║
║  (imagen de fondo institucional `fondo-login.png`, overlay,      ║
║  título, subtítulo y 3 tarjetas de garantías) y el panel         ║
║  derecho con el formulario de autenticación. Preferiblemente     ║
║  en modo oscuro para contrastar mejor el diseño.                 ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 9. Pregunta de Reflexión Final

> **Pregunta oficial del Caso Práctico (Sección 13):**  
> *"¿De qué manera la aplicación de estándares de construcción, validación de datos, reutilización de componentes y refinamiento de código contribuye a mejorar la calidad, mantenibilidad y posible evolución del sistema ReservaUPLA?"*

### 9.1 Impacto de los Estándares de Construcción en la Calidad Arquitectural

La adopción de la Clean Architecture propuesta por Martin [4], con separación estricta del backend en cuatro capas (`Domain`, `Application`, `Infrastructure`, `API`) y del frontend en carpetas especializadas (`components/ui`, `components/<dominio>`, `hooks`, `services`, `pages`), elimina el código espagueti y establece fronteras claras de responsabilidad entre subsistemas. Esta separación garantiza que futuros cambios tecnológicos o de requisitos queden encapsulados en la capa correspondiente, sin propagarse a las demás. Por ejemplo, si la UPLA decide migrar la autenticación desde el mecanismo de encabezados HTTP (`X-Usuario-Id`, `X-Usuario-Rol`) hacia un estándar OAuth2 institucional, dicho cambio afectará únicamente la capa `Infrastructure` y la configuración de `Program.cs`, sin modificar una sola línea de las entidades del `Domain` ni de los componentes de React.

Las convenciones de nomenclatura consistentes (Tabla 5), los estándares de Conventional Commits y la estructura modular del proyecto permiten que cualquier nuevo integrante del equipo de desarrollo comprenda la organización del código sin necesidad de documentación adicional, reduciendo el tiempo de incorporación (*onboarding*) y el riesgo de introducir defectos por incomprensión de la arquitectura.

### 9.2 Impacto de la Validación de Datos en Doble Capa sobre la Confiabilidad

La estrategia de validación en triple capa implementada en **ReservaUPLA** establece una defensa en profundidad que garantiza la integridad de los datos de reserva incluso ante escenarios adversos. La validación preventiva en el frontend (función `validarFormularioReserva`, `useMemo` para detección de solapamientos, atributos `min/max` en `TimeInput`) proporciona retroalimentación inmediata sin costo de red, cumpliendo los principios de ISO 9241-110 [12] y las reglas de Shneiderman [6] para una experiencia ágil y libre de frustración. Simultáneamente, la validación defensiva en `ReservaValidator.cs` y `ReservaService.cs` protege la integridad lógica del sistema frente a peticiones HTTP directas que omitan el frontend. Finalmente, el `EXCLUDE USING gist` de PostgreSQL garantiza la integridad transaccional absoluta (ACID) incluso ante condiciones de carrera concurrentes, donde dos solicitudes de aprobación simultáneas sobre el mismo bloque horario podrían eludir las validaciones de las capas superiores.

Este triple blindaje erradica al 100% la problemática original de duplicidad de reservas en los laboratorios universitarios, que fue la motivación principal del sistema.

### 9.3 Impacto de la Reutilización de los 9 Componentes UI en la Consistencia y Escalabilidad

La centralización de la interfaz en los 9 componentes reutilizables generó un efecto multiplicador de calidad: cada mejora aplicada a un componente se propaga automáticamente a todos sus puntos de uso. El Modo Oscuro persistente, el sistema de Tooltips accesibles y la captura de foco por teclado (ISO 9241-171 [7]) se implementaron una única vez y quedaron disponibles en los 4 módulos del sistema sin duplicar una sola línea de código.

Desde la perspectiva de la escalabilidad futura, si la UPLA decide incorporar un nuevo módulo (por ejemplo, gestión de equipamiento multimedia o reservas de estacionamiento), el equipo de desarrollo dispondrá de la biblioteca completa de 9 componentes listos para usar, lo que reducirá el tiempo de implementación y garantizará la consistencia visual sin esfuerzo adicional de diseño.

### 9.4 Impacto del Refinamiento Continuo en la Evolución Futura

El refinamiento de código aplicado durante las Semanas 07-08 —descomposición de métodos monolíticos en unidades SRP, extracción de sub-hooks responsables, centralización de mensajes y unificación de normalizadores— redujo significativamente la **deuda técnica acumulada** del sistema. Hunt y Thomas [13] afirman que el código duplicado es una de las causas más frecuentes de errores en sistemas de software, pues una corrección aplicada en una copia fácilmente se omite en las demás. Al eliminar todas las duplicaciones detectadas, **ReservaUPLA** alcanza un estado en que cualquier modificación futura —corrección de un mensaje de error, ajuste de una regla de negocio, adición de un nuevo tipo de ambiente— requiere intervenir en un único punto del código, reduciendo el riesgo de regresiones.

Los contratos tipados en TypeScript estricto (sin `any`) y los DTOs inmutables en C# (`record`) actúan como una red de seguridad que el compilador verifica automáticamente en cada cambio, detectando incompatibilidades de tipo antes de que el código llegue a ejecución. Esta disciplina de tipado transforma el compilador en un aliado proactivo de la calidad, cerrando la brecha entre el diseño intencional y el comportamiento real del sistema.

---

## 10. Conclusiones

El desarrollo de **ReservaUPLA** durante las Semanas 01 a 09 de la asignatura Construcción de Software demostró en la práctica la interdependencia y el valor sinérgico de los cuatro pilares abordados: estándares de construcción, validación de datos, reutilización de componentes y refinamiento de código. El sistema resultante cumple al 100% los ocho Requerimientos Funcionales (RF-01 a RF-08) y las seis Reglas de Negocio (RN-01 a RN-06) del caso práctico, con validación verificada en triple capa y compilación limpia en backend y frontend.

La elección del Modelo de Ciclo de Vida Iterativo e Incremental permitió entregar valor funcional desde los primeros incrementos y realizar ajustes progresivos de calidad sin interrumpir la funcionalidad. La Clean Architecture garantiza que el sistema permanezca mantenible y extensible frente a los cambios tecnológicos e institucionales previsibles en el contexto universitario de la UPLA. Los 9 componentes UI reutilizables establecen una base sólida para la evolución del sistema hacia nuevos módulos, y el refinamiento de código aplicado en las etapas finales posiciona a **ReservaUPLA** como un sistema de ingeniería de calidad profesional, listo para ser incorporado al portafolio institucional.

---

## 11. Referencias Bibliográficas

```
[1]  J. Nielsen, Usability Engineering. San Francisco, CA: Morgan Kaufmann, 1994.

[2]  D. A. Norman, The Design of Everyday Things, Rev. ed. Nueva York, NY: Basic Books, 2013.

[3]  R. C. Martin, Clean Code: A Handbook of Agile Software Craftsmanship. Upper Saddle
     River, NJ: Prentice Hall, 2008.

[4]  R. C. Martin, Clean Architecture: A Craftsman's Guide to Software Structure and Design.
     Upper Saddle River, NJ: Prentice Hall, 2017.

[5]  International Organization for Standardization, Ergonomics of human–system interaction —
     Part 210: Human-centred design for interactive systems, ISO 9241-210:2010. Ginebra,
     Suiza: ISO, 2010.

[6]  B. Shneiderman, C. Plaisant, M. Cohen, S. Jacobs, N. Elmqvist y N. Diakopoulos,
     Designing the User Interface: Strategies for Effective Human-Computer Interaction,
     6th ed. Upper Saddle River, NJ: Pearson, 2016.

[7]  International Organization for Standardization, Ergonomics of human-system interaction —
     Part 171: Guidance on software accessibility, ISO 9241-171:2008. Ginebra, Suiza:
     ISO, 2008.

[8]  I. Sommerville, Software Engineering, 10th ed. Upper Saddle River, NJ: Pearson, 2016.

[9]  E. Gamma, R. Helm, R. Johnson y J. Vlissides, Design Patterns: Elements of Reusable
     Object-Oriented Software. Reading, MA: Addison-Wesley, 1994.

[10] R. S. Pressman y B. R. Maxim, Ingeniería del Software: Un enfoque práctico, 9.ª ed.
     Ciudad de México, México: McGraw-Hill, 2021.

[11] M. Fowler, Refactoring: Improving the Design of Existing Code, 2nd ed. Boston, MA:
     Addison-Wesley, 2018.

[12] International Organization for Standardization, Ergonomics of human-system interaction —
     Part 110: Interaction principles, ISO 9241-110:2020. Ginebra, Suiza: ISO, 2020.

[13] A. Hunt y D. Thomas, The Pragmatic Programmer: From Journeyman to Master.
     Reading, MA: Addison-Wesley, 1999.

[14] PostgreSQL Global Development Group, "Constraints — Exclusion Constraints," PostgreSQL
     14 Documentation. [En línea]. Disponible: https://www.postgresql.org/docs/14/
     ddl-constraints.html#DDL-CONSTRAINTS-EXCLUSION [Accedido: nov. 2026].

[15] Microsoft, "ASP.NET Core documentation," Microsoft Developer Network. [En línea].
     Disponible: https://docs.microsoft.com/aspnet/core [Accedido: nov. 2026].

[16] Meta Open Source, "React — Component documentation," React.dev. [En línea].
     Disponible: https://react.dev/learn/thinking-in-react [Accedido: nov. 2026].
```

---

*Documento elaborado en el contexto del Caso Práctico de la asignatura Construcción de Software, Universidad Peruana Los Andes (UPLA), Ciclo Académico 2026. Todos los fragmentos de código, diagramas y capturas de pantalla corresponden a la implementación real del sistema ReservaUPLA.*
