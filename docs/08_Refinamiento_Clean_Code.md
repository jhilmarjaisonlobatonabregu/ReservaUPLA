# Semana 08 — Refinamiento de Código: Clean Code y Refactorización (Secciones 8 y 10)

> **Universidad Peruana Los Andes (UPLA) · Facultad de Ingeniería**  
> Curso: Construcción de Software · Ciclo Académico 2026

---

## 1. Introducción

El refinamiento de código constituye la cuarta etapa del ciclo iterativo-incremental aplicado en **ReservaUPLA**. Según Martin (2008), el código limpio no es un lujo sino una necesidad profesional: un sistema cuyo código es difícil de leer y modificar acumula deuda técnica que se convierte, con el tiempo, en el principal obstáculo para su evolución. Esta semana documenta las decisiones de refactorización aplicadas sistemáticamente tanto en el backend (.NET 8) como en el frontend (React + TypeScript), orientadas a mejorar la cohesión, reducir el acoplamiento y eliminar las duplicaciones de código (principio DRY — *Don't Repeat Yourself*).

Las refactorizaciones se realizaron sin alterar el comportamiento observable del sistema: todas las reglas de negocio RN-01 a RN-06 y los requerimientos funcionales RF-01 a RF-08 se mantuvieron operativos al 100% al finalizar cada cambio, verificado mediante compilación limpia (`dotnet build` → 0 errores, `npx tsc --noEmit` → 0 errores).

---

## 2. Refinamientos en el Backend (.NET 8 Clean Architecture)

### 2.1 Descomposición de `RegistrarReservaAsync` (Principio SRP)

**Situación original:** El método `RegistrarReservaAsync` en `ReservaService.cs` concentraba en un único bloque monolítico de ~80 líneas las responsabilidades de: validación de rol, verificación de existencia del solicitante, verificación del estado del ambiente, detección de conflicto horario y persistencia en base de datos.

**Problema:** Dificultad para identificar en qué paso fallaba una operación; imposibilidad de reutilizar las verificaciones individualmente (ej. para pruebas unitarias).

**Solución aplicada:** Descomposición en 5 métodos privados con responsabilidad única:

```csharp
// ANTES: método monolítico de ~80 líneas
public async Task<Result<ReservaResponseDto>> RegistrarReservaAsync(...) {
    // validación de rol
    // verificación de usuario en BD
    // verificación de ambiente en BD
    // verificación de conflicto horario
    // guardar en BD
    // todo en un solo bloque sin separación de responsabilidades
}

// DESPUÉS: método coordinador + 5 métodos privados SRP
public async Task<Result<ReservaResponseDto>> RegistrarReservaAsync(...) {
    var rolCheck = VerificarRolPermitidoParaCrear(actorRol);
    if (!rolCheck.Exito) return rolCheck;

    var usuarioCheck = await VerificarSolicitanteAsync(dto.UsuarioId);
    if (!usuarioCheck.Exito) return usuarioCheck;

    var ambienteCheck = await VerificarAmbienteDisponibleAsync(dto.AmbienteId);
    if (!ambienteCheck.Exito) return ambienteCheck;

    var conflictoCheck = await ComprobarConflictoHorarioAsync(
        dto.AmbienteId, dto.Fecha, dto.HoraInicio, dto.HoraFin);
    if (!conflictoCheck.Exito) return conflictoCheck;

    return await GuardarNuevaReservaAsync(dto, ambiente);
}
```

**Beneficio:** Cada método privado puede ser probado y depurado de forma independiente. El método coordinador comunica claramente la secuencia lógica del caso de uso.

### 2.2 Enum `ResultErrorCode` y Eliminación de Comparación de Strings

**Situación original:** Los controladores determinaban el código HTTP de respuesta comparando el texto del mensaje de error con fragmentos de string hardcodeados (antipatrón frágil ante cambios de texto):

```csharp
// ANTES: comparación de strings — frágil y acoplada
if (resultado.Mensaje.Contains("no encontrado")) return NotFound(...);
if (resultado.Mensaje.Contains("403"))           return Forbid();
```

**Solución aplicada:** Enum `ResultErrorCode` en `Result.cs` que permite a los controladores tomar decisiones por código tipado:

```csharp
// DESPUÉS: switch sobre ErrorCode tipado — robusto y expresivo
return resultado.ErrorCode switch {
    ResultErrorCode.Forbidden => StatusCode(403, Problem(...)),
    ResultErrorCode.NotFound  => NotFound(Problem(...)),
    ResultErrorCode.Conflict  => Conflict(Problem(...)),
    _                         => BadRequest(Problem(...))
};
```

### 2.3 Centralización de Mensajes en `MensajesCatalogo.cs`

**Situación original:** Cadenas de texto de error dispersas en servicios, validadores y controladores. Riesgo de inconsistencia y dificultad para traducir o modificar mensajes.

**Solución aplicada:** Clase estática `MensajesCatalogo` con todas las constantes de mensaje centralizadas. Los validadores y servicios referencian exclusivamente constantes de esta clase.

```csharp
// ANTES: literal en el servicio
return Result<T>.Fallido("El ambiente no está disponible para reservas.");

// DESPUÉS: constante centralizada
return Result<T>.Fallido(MensajesCatalogo.AmbienteNoDisponible,
                         ResultErrorCode.Conflict);
```

### 2.4 Unificación de `NormalizarEstado` y `NormalizarRol` (DRY)

**Situación original:** Tres copias del método `NormalizarEstado` existían en `Reserva.cs`, `Ambiente.cs` y el servicio de usuarios. Tres copias de `NormalizarRol` en entidades y servicios distintos.

**Solución aplicada:** Clase helper centralizada `DomainNormalizador.cs` en `ReservaUPLA.Domain/Helpers/`:

```csharp
// backend/ReservaUPLA.Domain/Helpers/DomainNormalizador.cs
public static class DomainNormalizador
{
    public static string NormalizarEstadoReserva(string estado) => estado.Trim() switch {
        "Pendiente"  => "Pendiente",
        "Aprobada"   => "Aprobada",
        "Rechazada"  => "Rechazada",
        "Cancelada"  => "Cancelada",
        _            => throw new ArgumentException(
                            MensajesCatalogo.EstadoReservaInvalido)
    };

    public static string NormalizarEstadoAmbiente(string estado) => ...;

    public static string NormalizarRol(string rol) => ...;
}
```

Las entidades `Reserva`, `Ambiente` y `Usuario` delegan su método local al normalizador centralizado.

### 2.5 Corrección del Middleware de Excepciones

**Situación original:** `ExceptionHandlingMiddleware.cs` incluía propiedades duplicadas (`exito`/`isSuccess`, `mensaje`/`message`) en el cuerpo de la respuesta JSON, lo que generaba inconsistencias entre las llamadas al API.

**Solución aplicada:** Se unificó el contrato de respuesta de error a únicamente: `isSuccess`, `message` y `errores`, alineado con el estándar RFC 7807 (ProblemDetails).

---

## 3. Refinamientos en el Frontend (React + TypeScript)

### 3.1 Agrupación de Props de `ReservaFormCard` en Interfaces Cohesivas

**Situación original:** El componente `ReservaFormCard.tsx` recibía **28 props individuales** sin relación semántica explícita entre ellas, dificultando la comprensión de su API y generando llamadas al componente con largas listas de parámetros en `ReservasPage.tsx`.

**Solución aplicada:** Agrupación en 3 interfaces con responsabilidad semántica clara:

```typescript
// ANTES: 28 props individuales
<ReservaFormCard
  isOpen={isModalOpen} onClose={cerrarModalReserva}
  usuarios={usuarios} ambientes={ambientes}
  usuarioId={usuarioId} onUsuarioIdChange={...}
  ambienteId={ambienteId} onAmbienteIdChange={...}
  fecha={fecha} onFechaChange={...}
  horaInicio={horaInicio} onHoraInicioChange={...}
  // ... 16 props más
/>

// DESPUÉS: 3 objetos semánticos + props de contexto
<ReservaFormCard
  isOpen={isModalOpen}
  session={session} usuarios={usuarios} ambientes={ambientes}
  reservasExistentes={todasLasReservas}
  campos={{ usuarioId, onUsuarioIdChange, ambienteId, ... }}
  estado={{ erroresForm, disponibilidadInfo, isSubmitting, ... }}
  acciones={{ onSubmit, onClose, onLimpiarFormulario, ... }}
/>
```

**[Figura 1]** Comparación del número de props antes y después de la agrupación en interfaces cohesivas. La reducción de acoplamiento mejora la legibilidad y el mantenimiento del componente. Fuente: elaboración propia.

> _[Insertar diagrama de comparación de props antes (28 individuales) vs después (3 objetos + 5 props de contexto)]_

### 3.2 Modularización de `useReservasManagement` en 3 Sub-hooks

**Situación original:** El hook `useReservasManagement.ts` concentraba ~390 líneas con 4 responsabilidades distintas: gestión de filtros, estado del formulario, cambios de estado de reservas y carga de datos.

**Solución aplicada:** Extracción de 3 sub-hooks con responsabilidad única, que el hook orquestador compone internamente manteniendo el mismo `return {}` para no modificar `ReservasPage.tsx`:

```
useReservasManagement (orquestador — mantiene return idéntico)
    ├── useReservaFiltros.ts     — estado de los 4 filtros + NFD normalizer
    ├── useReservaFormulario.ts  — estado del form + handleVerificarDisponibilidad
    │                              + handleRegistrarReserva
    └── useReservaEstado.ts      — modalCambioEstado + handleConfirmarCambioEstado
```

**[Figura 2]** Diagrama de composición del hook `useReservasManagement` y sus tres sub-hooks. Las flechas de dependencia muestran la dirección del flujo de estado. Fuente: elaboración propia.

> _[Insertar diagrama de composición de hooks]_

| Métrica | Antes | Después |
|---|---|---|
| Líneas de `useReservasManagement.ts` | 391 | 165 (hook orquestador) |
| Líneas totales (hook + sub-hooks) | 391 | ~530 (distribuidas en 4 archivos con responsabilidades claras) |
| Responsabilidades en un archivo | 4 | 1 por archivo |
| Testabilidad | Difícil (todo acoplado) | Alta (cada sub-hook es independiente) |

### 3.3 Tipado Estricto: Eliminación de `any` y `verbatimModuleSyntax`

El proyecto frontend mantiene configuración TypeScript estricta sin ningún uso de `any`. Todas las importaciones de tipos puros utilizan `import type` conforme a la directiva `verbatimModuleSyntax` del `tsconfig.json`:

```typescript
// Correcto — verbatimModuleSyntax
import type { FormEvent } from 'react';
import type { UserSession, Reserva, Ambiente } from '../types';

// Incorrecto (detectado y corregido durante la refactorización)
import { FormEvent } from 'react'; // ❌ sin 'type'
```

---

## 4. Métricas de Calidad Post-Refactorización

| Indicador | Estado final | Herramienta de verificación |
|---|---|---|
| Errores de compilación backend | **0** | `dotnet build ReservaUPLA.sln -v q` |
| Advertencias de compilación backend | **0** | `dotnet build ReservaUPLA.sln -v q` |
| Errores de tipo en frontend | **0** | `npx tsc --noEmit` |
| Build de producción frontend | **✅ Exitoso** | `npm run build` |
| Módulos transformados por Vite | **2 108** | `npm run build` |
| Uso de `any` en TypeScript | **0** | Revisión manual + `tsc --strict` |
| Strings literales en servicios/validadores backend | **0** | Todos migrados a `MensajesCatalogo` |
| Duplicados de `NormalizarEstado`/`NormalizarRol` | **0** | Centralizados en `DomainNormalizador` |

---

## 5. Principios SOLID Aplicados

| Principio | Código | Implementación |
|---|---|---|
| **S** — Responsabilidad Única (SRP) | `RegistrarReservaAsync` → 5 métodos privados; `useReservasManagement` → 3 sub-hooks | Cada método/hook tiene una razón de cambio |
| **O** — Abierto/Cerrado (OCP) | `ResultErrorCode` enum extensible; variantes de `Button` | Nuevos errores/variantes sin modificar código existente |
| **D** — Inversión de Dependencias (DIP) | `IAmbienteRepository`, `IReservaRepository`, `IUsuarioRepository` | Los servicios dependen de interfaces, no de implementaciones concretas |

---

## 6. Referencias Bibliográficas

- Martin, R. C. (2008). *Clean Code: A Handbook of Agile Software Craftsmanship*. Prentice Hall.
- Martin, R. C. (2017). *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Prentice Hall.
- Fowler, M. (2018). *Refactoring: Improving the Design of Existing Code* (2nd ed.). Addison-Wesley.
- Hunt, A., & Thomas, D. (1999). *The Pragmatic Programmer: From Journeyman to Master*. Addison-Wesley.
- Pressman, R. S., & Maxim, B. R. (2021). *Ingeniería del Software: Un enfoque práctico* (9.ª ed.). McGraw-Hill.
- Microsoft. (2024). *C# Coding Conventions*. https://docs.microsoft.com/dotnet/csharp/fundamentals/coding-style/coding-conventions
