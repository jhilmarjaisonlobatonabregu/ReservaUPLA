# Semana 06 — Validación y Captura de Datos: Frontend y Backend (Secciones 9 y 10)

> **Universidad Peruana Los Andes (UPLA) · Facultad de Ingeniería**  
> Curso: Construcción de Software · Ciclo Académico 2026

---

## 1. Introducción

La validación de datos constituye uno de los pilares fundamentales de la ingeniería de software de calidad. En sistemas de gestión institucional como **ReservaUPLA**, la ausencia de validaciones robustas puede derivar en inconsistencias de datos, reservas duplicadas en laboratorios universitarios y experiencias de usuario frustrantes. Según Sommerville (2016), la validación de entrada debe aplicarse en múltiples capas de la arquitectura para garantizar integridad de datos independientemente del canal de acceso.

El sistema **ReservaUPLA** implementa una **arquitectura de validación en triple capa** que actúa de forma complementaria y sucesiva: validación preventiva en el Frontend (React + TypeScript), validación de reglas de negocio en el Backend (.NET 8 Clean Architecture) y validación referencial e integridad transaccional en la base de datos PostgreSQL. Este documento describe exhaustivamente cada capa, los mecanismos implementados y su correspondencia con las reglas de negocio RN-01 a RN-06 del caso práctico.

---

## 2. Arquitectura de Validación en Triple Capa

```
┌─────────────────────────────────────────────────────────────────┐
│  CAPA 1: FRONTEND (React + TypeScript)                          │
│  Archivo: frontend/src/utils/validators.ts                      │
│  Propósito: Prevención de errores — experiencia ágil (UX)       │
│  Mecanismo: validarFormularioReserva(), useMemo, min/max attrs   │
└────────────────────────────┬────────────────────────────────────┘
                             │ POST/PATCH HTTP con payload validado
┌────────────────────────────▼────────────────────────────────────┐
│  CAPA 2: BACKEND (.NET 8 — Application Layer)                   │
│  Archivos: ReservaValidator.cs, ReservaService.cs               │
│  Propósito: Validación de reglas de negocio — integridad lógica │
│  Mecanismo: Result<T> + ErrorCode enum + 400/403/409 HTTP       │
└────────────────────────────┬────────────────────────────────────┘
                             │ SQL via EF Core + Npgsql
┌────────────────────────────▼────────────────────────────────────┐
│  CAPA 3: BASE DE DATOS (PostgreSQL)                             │
│  Archivo: database/schema_reservaupla.sql                       │
│  Propósito: Integridad declarativa — última línea de defensa    │
│  Mecanismo: CHECK constraints + EXCLUDE USING gist (btree_gist) │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Capa 1: Validación en el Frontend (React + TypeScript)

### 3.1 Función `validarFormularioReserva` (`validators.ts`)

La función principal de validación del cliente se ubica en `frontend/src/utils/validators.ts` y retorna un objeto de tipo `ErroresFormularioReserva` con los mensajes de error asociados a cada campo:

```typescript
// Reglas validadas (RN-02, RN-03, RN-04):
export function validarFormularioReserva(payload): ErroresFormularioReserva {
  const errores: ErroresFormularioReserva = {};

  if (!payload.usuarioId)        errores.usuarioId   = 'Seleccione un solicitante.';
  if (!payload.ambienteId)       errores.ambienteId  = 'Seleccione un ambiente universitario.';
  if (!payload.fecha)            errores.fecha       = 'Seleccione la fecha programada.';
  if (!payload.motivo || motivo.trim().length < 5)
                                 errores.motivo      = 'Ingrese el motivo (mínimo 5 caracteres).';

  // RN-04: Jornada 07:00–22:00
  if (payload.horaInicio < '07:00' || payload.horaInicio > '22:00')
    errores.horaInicio = 'La hora de inicio debe estar entre 07:00 y 22:00 horas.';

  if (payload.horaFin < '07:00' || payload.horaFin > '22:00')
    errores.horaFin = 'La hora de fin debe estar entre 07:00 y 22:00 horas.';

  // RN-03: HoraFin > HoraInicio
  if (payload.horaFin <= payload.horaInicio)
    errores.horaFin = 'La hora de fin debe ser mayor que la hora de inicio.';

  return errores;
}
```

Los errores se muestran bajo cada campo mediante la propiedad `error` de los componentes `TextInput`, `SelectInput`, `DateInput` y `TimeInput`, que renderizan un mensaje en color rojo con ícono de alerta.

### 3.2 Validación en Tiempo Real con `useMemo` (RN-01)

El componente `ReservaFormCard.tsx` implementa la detección de conflictos horarios en tiempo real sin necesidad de consultar el servidor, utilizando las reservas existentes ya cargadas en memoria:

```typescript
// Detección de solapamiento en tiempo real (RN-01)
const conflictoEnTiempoReal = useMemo(() => {
  if (!horaInicio || !horaFin || horaFin <= horaInicio) return null;
  return reservasDelAmbienteEnFecha.find(
    (r) =>
      r.estado === 'Aprobada' &&
      horaInicio < r.horaFin &&   // fórmula matemática de solapamiento
      horaFin > r.horaInicio
  ) ?? null;
}, [reservasDelAmbienteEnFecha, horaInicio, horaFin]);
```

Cuando `conflictoEnTiempoReal` es distinto de `null`, el formulario muestra una alerta roja prominente indicando el cruce detectado con el nombre del solicitante y el horario en conflicto, implementando el principio de **retroalimentación inmediata** de Norman (2013, Cap. 3).

**[Figura 1]** Alerta de conflicto horario en tiempo real dentro del formulario de reserva. El sistema detecta el solapamiento de forma inmediata al ajustar las horas, antes de que el usuario intente enviar la solicitud. Fuente: elaboración propia.

> _[Insertar captura de `ReservaFormCard` con alerta roja de conflicto visible y la agenda del día mostrando el bloque ocupado]_

### 3.3 Validación mediante Atributos HTML5 (RN-03, RN-04)

Los componentes `TimeInput` y `DateInput` refuerzan las validaciones mediante atributos HTML5 nativos:

```tsx
<TimeInput
  min="07:00"           {/* RN-04: límite inferior */}
  max="22:00"           {/* RN-04: límite superior */}
  required              {/* RN-02: campo obligatorio */}
/>
<DateInput
  min={obtenerFechaHoyIso()}  {/* No permite fechas pasadas */}
  required
/>
```

### 3.4 Manejo de Errores del Servidor en el Frontend

Cuando el servidor retorna un error (400, 403, 409), el componente `useReservaFormulario.ts` discrimina el tipo de error para señalar el campo exacto en conflicto, preservando todos los datos ya ingresados (Regla 5 de Shneiderman — no castigar al usuario borrando su trabajo):

```typescript
catch (err) {
  const msg = err instanceof Error ? err.message : 'Error al registrar reserva.';
  if (msg.toLowerCase().includes('conflicto') ||
      msg.toLowerCase().includes('cruz')) {
    setErroresForm((prev) => ({
      ...prev,
      horaInicio: 'Conflicto de horario detectado en este ambiente.',
      horaFin: 'Seleccione otro bloque horario libre.'
    }));
  }
  // Preserva todos los demás campos intactos
}
```

---

## 4. Capa 2: Validación en el Backend (.NET 8)

### 4.1 Patrón `Result<T>` con `ErrorCode` Enum

El backend implementa el patrón `Result<T>` ubicado en `backend/ReservaUPLA.Application/Common/Result.cs` para encapsular los resultados de las operaciones de servicio sin lanzar excepciones para flujos de negocio esperados:

```csharp
// ResultErrorCode — permite a los controladores decidir el código HTTP por código, no por texto
public enum ResultErrorCode
{
    None,
    Validation,   // → HTTP 400 Bad Request
    Forbidden,    // → HTTP 403 Forbidden
    NotFound,     // → HTTP 404 Not Found
    Conflict      // → HTTP 409 Conflict
}

public class Result<T>
{
    public bool Exito { get; }
    public string Mensaje { get; }
    public ResultErrorCode ErrorCode { get; }
    public T? Datos { get; }

    public static Result<T> Exitoso(T datos, string mensaje = "") => ...;
    public static Result<T> Fallido(string mensaje,
        ResultErrorCode errorCode = ResultErrorCode.Validation,
        IEnumerable<string>? errores = null) => ...;
}
```

Los controladores utilizan un `switch` sobre `ErrorCode` en lugar de comparar strings de mensajes (antipatrón eliminado en la Fase 3 de refactorización):

```csharp
// ReservasController.cs — decisión de código HTTP por ErrorCode
return resultado.ErrorCode switch {
    ResultErrorCode.Forbidden  => StatusCode(403, ProblemDetails(...)),
    ResultErrorCode.NotFound   => NotFound(ProblemDetails(...)),
    ResultErrorCode.Conflict   => Conflict(ProblemDetails(...)),
    _                          => BadRequest(ProblemDetails(...))
};
```

### 4.2 Validadores del Dominio (`ReservaValidator.cs`)

El validador de reservas centraliza todas las reglas de negocio en métodos estáticos con responsabilidad única:

| Método | Regla validada | Error devuelto |
|---|---|---|
| `ValidarSolicitud(dto)` | RN-02: campos obligatorios, formato de fecha | `ErrorCode.Validation` + lista de errores por campo |
| `ValidarRangoHorario(inicio, fin)` | RN-03: `HoraFin > HoraInicio`; RN-04: 07:00–22:00 | `ErrorCode.Validation` |
| `ValidarCambioEstado(actor, reserva, nuevoEstado)` | RN-05: solo Admin puede aprobar/rechazar; RN-06: Rechazada es inmutable | `ErrorCode.Forbidden` |

### 4.3 Descomposición de `RegistrarReservaAsync` en Métodos Privados

La operación de registro de reserva se descompone en 5 métodos privados con responsabilidad única (Principio de Responsabilidad Única — SOLID):

```
RegistrarReservaAsync(dto, actorId, actorRol)
    ├── VerificarRolPermitidoParaCrear(actorRol)       → Forbidden si Responsable
    ├── VerificarSolicitanteAsync(usuarioId)            → NotFound si no existe/inactivo
    ├── VerificarAmbienteDisponibleAsync(ambienteId)    → Conflict si no Disponible
    ├── ComprobarConflictoHorarioAsync(ambienteId,      → Conflict si solapamiento RN-01
    │       fecha, inicio, fin)
    └── GuardarNuevaReservaAsync(reserva)              → Persiste en BD
```

**[Figura 2]** Respuesta HTTP 409 Conflict retornada por el backend al detectar un solapamiento horario durante el intento de aprobación de una reserva. El cuerpo incluye el mensaje institucional y el código de error `Conflict`. Fuente: elaboración propia.

> _[Insertar captura del DevTools Network mostrando la respuesta 409 con el body JSON del ProblemDetails]_

### 4.4 Validación de Rol en Base de Datos (Hardening RN-05)

Para prevenir ataques de manipulación del encabezado `X-Usuario-Rol`, el método `CambiarEstadoAsync` verifica el rol real del actor directamente en la base de datos antes de ejecutar la operación:

```csharp
// ReservaService.cs — VerificarActorEsAdminEnBdAsync
private async Task<Result<ReservaResponseDto>> VerificarActorEsAdminEnBdAsync(Guid actorId) {
    var actor = await _usuarioRepository.ObtenerPorIdAsync(actorId);
    if (actor is null || !actor.Activo)
        return Result<ReservaResponseDto>.Fallido(
            MensajesCatalogo.UsuarioNoEncontrado, ResultErrorCode.Forbidden);
    if (actor.Rol != DomainEnums.Roles.Administrador)
        return Result<ReservaResponseDto>.Fallido(
            MensajesCatalogo.SoloAdminPuedeAprobar, ResultErrorCode.Forbidden);
    return Result<ReservaResponseDto>.Exitoso(null!); // actor verificado
}
```

---

## 5. Capa 3: Validación en la Base de Datos (PostgreSQL)

### 5.1 `CHECK CONSTRAINTS` Declarativos

```sql
-- RN-03: La hora de fin debe ser mayor que la hora de inicio
CONSTRAINT "CK_Reserva_Horas"
  CHECK ("HoraFin" > "HoraInicio"),

-- RN-04: Las reservas solo pueden programarse entre 07:00 y 22:00 horas
CONSTRAINT "CK_Reserva_RangoPermitido"
  CHECK ("HoraInicio" >= '07:00:00' AND "HoraFin" <= '22:00:00'),
```

### 5.2 `EXCLUDE USING gist` para Solapamiento (RN-01)

La restricción más sofisticada del sistema es el `EXCLUDE` de tipo `gist` que imposibilita matemáticamente la existencia simultánea de dos reservas Aprobadas en el mismo ambiente, fecha y rango horario solapado:

```sql
-- Requiere la extensión btree_gist de PostgreSQL
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Reservas"
ADD CONSTRAINT "EX_Reservas_SinSolapamiento_Aprobadas"
EXCLUDE USING gist (
  "AmbienteId"  WITH =,
  "Fecha"       WITH =,
  tsrange(
    "Fecha"::timestamp + "HoraInicio"::interval,
    "Fecha"::timestamp + "HoraFin"::interval
  )             WITH &&
)
WHERE ("Estado" = 'Aprobada');
```

Este constraint actúa como la **última línea de defensa** ante condiciones de carrera concurrentes o peticiones HTTP que burlen las capas anteriores, garantizando integridad transaccional absoluta (ACID).

**[Figura 3]** Verificación de la restricción `EXCLUDE USING gist` activa en la base de datos `reservaupla_db`. La columna `contype = 'x'` confirma la existencia del exclusion constraint. Fuente: elaboración propia.

> _[Insertar captura de la consulta SQL `SELECT conname, contype FROM pg_constraint WHERE conname LIKE '%Solapamiento%'` con el resultado `x`]_

---

## 6. Catálogo de Mensajes Centralizados (`MensajesCatalogo.cs`)

Todos los textos de error y validación del backend se centralizan en `backend/ReservaUPLA.Application/Common/MensajesCatalogo.cs`, eliminando los literales de string dispersos en servicios y validadores (principio DRY):

```csharp
public static class MensajesCatalogo
{
    // Validaciones de Reserva
    public const string FechaReservaRequerida       = "La fecha de la reserva es obligatoria.";
    public const string MotivoReservaRequerido       = "El motivo académico de la reserva es obligatorio.";
    public const string HoraInicioRequerida          = "La hora de inicio es obligatoria.";
    public const string HoraFinRequerida             = "La hora de fin es obligatoria.";
    public const string HoraFinDebeSerMayor          = "La hora de fin debe ser mayor que la hora de inicio.";
    public const string HorarioFueraDeJornada        = "Las reservas solo pueden programarse entre las 07:00 y las 22:00 horas.";
    public const string ConflictoHorarioDetectado    = "El ambiente ya tiene una reserva Aprobada en ese rango horario.";
    public const string SoloAdminPuedeAprobar        = "Solo el Administrador puede aprobar o rechazar reservas.";
    public const string ReservaRechazadaInmutable    = "Una reserva Rechazada no puede modificarse.";
    // ... 10 mensajes adicionales para Ambientes, Usuarios y Disponibilidad
}
```

---

## 7. Tabla de Resumen: Reglas de Negocio y su Implementación en Triple Capa

| RN | Regla | Frontend | Backend | BD |
|---|---|---|---|---|
| **RN-01** | No solapamiento en Aprobadas | `conflictoEnTiempoReal` (useMemo) | `ComprobarConflictoHorarioAsync` | `EXCLUDE USING gist` |
| **RN-02** | Campos obligatorios | `validarFormularioReserva()` + `required` | `ReservaValidator.ValidarSolicitud()` | `NOT NULL` |
| **RN-03** | `HoraFin > HoraInicio` | `validators.ts` + `TimeInput` | `ValidarRangoHorario()` | `CHECK ("HoraFin" > "HoraInicio")` |
| **RN-04** | Jornada 07:00–22:00 | `min/max` en `TimeInput` | `ReservaConstantes` | `CHECK` de rango horario |
| **RN-05** | Solo Admin aprueba/rechaza | Ocultar botones por rol | `VerificarActorEsAdminEnBdAsync()` → 403 | — |
| **RN-06** | Rechazada es inmutable | Candado visual | `ValidarCambioEstado()` → 409 | — |

---

## 8. Referencias Bibliográficas

- Sommerville, I. (2016). *Software Engineering* (10th ed.). Pearson.
- Martin, R. C. (2017). *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Prentice Hall.
- Norman, D. A. (2013). *The Design of Everyday Things* (Rev. ed.). Basic Books.
- Shneiderman, B., Plaisant, C., Cohen, M., Jacobs, S., Elmqvist, N., & Diakopoulos, N. (2016). *Designing the User Interface* (6th ed.). Pearson.
- PostgreSQL Global Development Group. (2024). *Constraints — Exclusion Constraints*. https://www.postgresql.org/docs/14/ddl-constraints.html#DDL-CONSTRAINTS-EXCLUSION
- Microsoft. (2024). *Handle errors in ASP.NET Core*. https://docs.microsoft.com/aspnet/core/fundamentals/error-handling
