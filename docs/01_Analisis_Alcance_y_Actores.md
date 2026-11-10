# Semana 01 — Análisis del Problema, Actores, Necesidades y Alcance MVP (Secciones 1 al 4)

## 1. Contexto y Problemática Institucional en la UPLA
En la **Universidad Peruana Los Andes (UPLA)** existen diversos espacios físicos destinados a actividades académicas y administrativas:
- **Laboratorios de cómputo** (Ej. `Laboratorio de Cómputo L-301`, `Laboratorio de Inteligencia Artificial L-402`).
- **Auditorios** (Ej. `Auditorio Central UPLA`).
- **Salas de reuniones** (Ej. `Sala de Reuniones Decanato Ingeniería`).
- **Laboratorios especializados** (Ej. `Laboratorio de Redes y Ciberseguridad L-304`).

Antes de **ReservaUPLA**, la programación de estos espacios se realizaba mediante hojas de cálculo dispersas, mensajes de WhatsApp, correos electrónicos o anotaciones manuales, originando **4 problemas críticos**:
1. **Duplicidad de reservas (cruces horarios):** Dos docentes o grupos estudiantiles llegaban simultáneamente al mismo laboratorio.
2. **Pérdida de solicitudes:** Pedidos enviados por mensajería informal quedaban sin atención ni registro.
3. **Poca trazabilidad:** Imposibilidad de auditar quién solicitó un ambiente, con qué motivo académico y quién lo autorizó.
4. **Dificultad para conocer la disponibilidad real:** Los solicitantes desconocían qué bloques horarios estaban libres antes de enviar su pedido.

---

## 2. Propósito del Sistema
Construir una aplicación web full-stack (**ReservaUPLA**) que centralice y automatice el registro, validación previa de disponibilidad, consulta, aprobación o rechazo de solicitudes de reserva de ambientes universitarios, garantizando persistencia transaccional en **PostgreSQL (`reservaupla_db`)**.

---

## 3. Identificación de Actores y Responsabilidades (Sección 4)

| Actor | Perfil Institucional | Necesidades y Responsabilidades en ReservaUPLA | Restricciones de Seguridad (RBAC) |
|---|---|---|---|
| **1. Solicitante** | Docente, estudiante o personal administrativo | - Registrar nuevas solicitudes de reserva (`RF-03`).<br>- Validar disponibilidad previa del ambiente (`RF-04`).<br>- Consultar únicamente sus propias solicitudes y detalle (`RF-05`, `RF-06`).<br>- Cancelar sus solicitudes en estado `Pendiente` (`RF-07`).<br>- Visualizar `"Mi Dashboard"` con indicadores exclusivos de sus reservas (`RF-08`). | Bloqueado (`403 Forbidden`) para aprobar/rechazar reservas (`RN-05`) y para registrar ambientes o usuarios. |
| **2. Administrador** | Encargado de gestionar ambientes y evaluar reservas | - Único actor autorizado para **Aprobar** o **Rechazar** solicitudes (`RN-05`, `RF-07`).<br>- Registrar y administrar el padrón de usuarios (`RF-01`).<br>- Registrar y administrar el catálogo de ambientes (`RF-02`).<br>- Visualizar el **Dashboard Institucional Global** (`RF-08`). | Sujeto a las reglas de negocio `RN-01` (imposibilidad de aprobar reservas solapadas) y `RN-06` (inmutabilidad de rechazadas). |
| **3. Responsable de ambiente** | Encargado de supervisar el uso del espacio asignado | - Supervisar en modo lectura la ocupación, aforo, estado operativo y agenda de los ambientes universitarios.<br>- Utilizar el verificador de disponibilidad en tiempo real (`RF-04`, `RF-05`, `RF-06`). | Bloqueado (`403 Forbidden`) para crear reservas, aprobar/rechazar solicitudes y crear ambientes o usuarios. |

---

## 4. Delimitación del Alcance bajo Enfoque MVP (Producto Mínimo Viable)

### 4.1 Dentro del Alcance MVP (Implementado al 100%)
- Gestión de usuarios actores (`RF-01`) y catálogo de ambientes (`RF-02`).
- Registro de reservas (`RF-03`) con validación matemática previa de cruces (`RF-04`, `RN-01`), campos obligatorios (`RN-02`), coherencia horaria (`RN-03`) y jornada institucional `07:00–22:00` (`RN-04`).
- Listado filtrable (`RF-05`), consulta de expediente detallado (`RF-06`), gestión de los 4 estados (`Pendiente`, `Aprobada`, `Rechazada`, `Cancelada` — `RF-07`, `RN-05`, `RN-06`) y Dashboard con los 5 indicadores dinámicos (`RF-08`).

### 4.2 Fuera del Alcance MVP (Excluido deliberadamente para evitar sobreingeniería)
- Integración con pasarelas de pago o alquiler externo de locales.
- Reservas recurrentes multianuales complejas o sincronización con calendarios externos de terceros.
