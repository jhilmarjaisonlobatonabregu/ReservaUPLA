# Informe Técnico Final y Pregunta de Reflexión (Secciones 11, 12 y 13)

## 1. Matriz de Trazabilidad Completa: Requerimientos Funcionales (RF-01 a RF-08)

| Código | Requerimiento Funcional | Endpoint API (.NET) | Componente Frontend (React) | Estado |
|---|---|---|---|---|
| **RF-01** | Registrar usuarios solicitantes / actores | `POST /api/usuarios` (`UsuariosController.cs`) | `UsuariosPage.tsx` + `UsuarioFormCard.tsx` | **100% Operativo** |
| **RF-02** | Registrar ambientes universitarios | `POST /api/ambientes` (`AmbientesController.cs`) | `AmbientesPage.tsx` + `AmbienteFormCard.tsx` | **100% Operativo** |
| **RF-03** | Registrar solicitudes de reserva | `POST /api/reservas` (`ReservasController.cs`) | `ReservasPage.tsx` + `ReservaFormCard.tsx` | **100% Operativo** |
| **RF-04** | Validar disponibilidad antes de registrar | `GET /api/reservas/disponibilidad` | `ReservaFormCard.tsx` (`conflictoEnTiempoReal` + botón `Validar Disponibilidad`) | **100% Operativo** |
| **RF-05** | Listar reservas registradas | `GET /api/reservas` | `ReservaFilterBar.tsx` + `ReservaTableSection.tsx` | **100% Operativo** |
| **RF-06** | Consultar detalle de una reserva | `GET /api/reservas/{id}` | `ReservaDetalleModal.tsx` | **100% Operativo** |
| **RF-07** | Cambiar el estado de una reserva | `PATCH /api/reservas/{id}/estado` | `ReservaEstadoConfirmModal.tsx` | **100% Operativo** |
| **RF-08** | Mostrar indicadores básicos en Dashboard | `GET /api/dashboard` (`DashboardController.cs`) | `DashboardPage.tsx` + `DashboardIndicadoresGrid.tsx` | **100% Operativo** |

---

## 2. Matriz de Trazabilidad Completa: Reglas de Negocio (RN-01 a RN-06)

| Código | Regla de Negocio del Caso Práctico | Validación en Frontend (React + TS) | Validación en Backend (.NET Clean Architecture + PostgreSQL) |
|---|---|---|---|
| **RN-01** | No permitir más de una reserva `Aprobada` para el mismo ambiente, fecha y horario solapado (`HoraInicioNueva < HoraFinExistente && HoraFinNueva > HoraInicioExistente`). | Alerta en vivo `conflictoEnTiempoReal` en `ReservaFormCard.tsx` y aviso de pendientes en competencia en `ReservaEstadoConfirmModal.tsx`. | `ReservaRepository.ObtenerConflictosAprobadosAsync()` invocado tanto en `RegistrarReservaAsync` como en `CambiarEstadoAsync` al aprobar (`ReservaService.cs`). |
| **RN-02** | Toda reserva exige fecha, hora inicio, hora fin, ambiente, solicitante y motivo. | `validarFormularioReserva()` en `frontend/src/utils/validators.ts`. | `ReservaValidator.ValidarSolicitud()` en `backend/ReservaUPLA.Application/Validators/ReservaValidator.cs` + `NOT NULL` en PostgreSQL. |
| **RN-03** | La hora de fin debe ser mayor que la hora de inicio (`HoraFin > HoraInicio`). | `validarFormularioReserva()` y restricción en `TimeInput.tsx`. | `ReservaValidator.ValidarRangoHorario()` + `CONSTRAINT "CK_Reserva_Horas" CHECK ("HoraFin" > "HoraInicio")` en BD. |
| **RN-04** | Las reservas solo pueden realizarse entre las `07:00` y las `22:00` horas. | `min="07:00"` y `max="22:00"` en `TimeInput.tsx` + `validators.ts`. | `ReservaConstantes.HoraMinimaInstitucional` (`07:00`) y `HoraMaximaInstitucional` (`22:00`) + `CONSTRAINT "CK_Reserva_RangoPermitido"` en BD. |
| **RN-05** | Solo el `Administrador` puede aprobar o rechazar una reserva. | Ocultación de botones `Aprobar` y `Rechazar` para roles no administradores en `ReservaTableSection.tsx`. | `ReservaValidator.ValidarCambioEstado()` + respuesta HTTP `403 Forbidden` en `ReservasController.cs`. |
| **RN-06** | Una reserva `Rechazada` no puede modificarse. | Candado `Inmutable` y ocultación de botones de acción sobre reservas `Rechazada` en `ReservaTableSection.tsx`. | Bloqueo estricto en `ReservaValidator.ValidarCambioEstado()` y `Reserva.CambiarEstado()` (`Domain`). |

---

## 3. Respuesta a la Pregunta de Reflexión Final (Sección 13 del Caso Práctico)

> **Pregunta oficial (Sección 13):**  
> *«¿De qué manera la aplicación de estándares de construcción, validación de datos, reutilización de componentes y refinamiento de código contribuye a mejorar la calidad, mantenibilidad y posible evolución del sistema ReservaUPLA?»*

### Respuesta Técnica Sustentada:

1. **Impacto de los Estándares de Construcción y Clean Architecture en la Mantenibilidad:**
   - La separación estricta del backend en 4 capas (`Domain`, `Application`, `Infrastructure`, `API`) y del frontend en carpetas especializadas (`components/ui`, `components/<dominio>`, `hooks`, `services`, `pages`) elimina el código espagueti. Si en el futuro la UPLA decide migrar la autenticación a OAuth2 institucional o agregar notificaciones por correo electrónico, dicho cambio se encapsula únicamente en `Infrastructure` sin tocar una sola línea de las entidades de `Domain` ni de las vistas de `React`.

2. **Impacto de la Validación de Datos en Doble Capa (Frontend + Backend/BD) sobre la Calidad y Confiabilidad:**
   - La validación preventiva en el Frontend (`validators.ts`, `TimeInput`, `DateInput`, `conflictoEnTiempoReal`) ofrece una experiencia de usuario ágil y libre de frustración (cumpliendo ISO 9241-110 y las reglas de Norman/Nielsen). Simultáneamente, la validación defensiva en `ReservaValidator.cs`, `ReservaService.cs` y los `CHECK CONSTRAINTS` de PostgreSQL garantizan la integridad transaccional absoluta ante peticiones HTTP directas o condiciones de carrera concurrentes, erradicando al 100% la duplicidad de reservas en los laboratorios de la universidad.

3. **Impacto de la Reutilización de los 9 Componentes UI (Sección 9) en la Consistencia y Escalabilidad:**
   - Centralizar la interfaz en los **9 componentes reutilizables** (`TextInput`, `SelectInput`, `DateInput`, `TimeInput`, `Button`, `AlertMessage`, `ModalConfirmacion`, `TableList`, `CardIndicador`) permitió implementar mejoras transversales —como el **Modo Oscuro persistente**, el sistema de **Tooltips accesibles** y la **captura de foco por teclado (ISO 9241-171)**— en un único lugar, propagándolas automáticamente a los 4 módulos del sistema sin duplicar código.

4. **Impacto del Refinamiento Continuo en la Evolución Futura de ReservaUPLA:**
   - Gracias al uso de contratos tipados (`TypeScript` estricto sin `any` y DTOs en C#), al patrón `Result<T>` y a las convenciones de nombres consistentes, cualquier nuevo desarrollador o equipo de ingeniería de la UPLA puede incorporar nuevos módulos (como préstamos de equipamiento multimedia o reportes PDF por facultad) en una fracción del tiempo y con riesgo mínimo de introducir regresiones.
