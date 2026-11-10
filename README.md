# ReservaUPLA — Sistema de Gestión de Reservas de Ambientes Universitarios

> **Universidad Peruana Los Andes (UPLA) · Facultad de Ingeniería · Escuela Profesional de Ingeniería de Sistemas y Computación**  
> Caso Práctico de Construcción de Software — Ciclo Académico 2026

---

## Descripción General

**ReservaUPLA** es una aplicación web institucional full-stack que centraliza y automatiza el registro, validación de disponibilidad horaria, aprobación y seguimiento de solicitudes de reserva de ambientes universitarios (laboratorios de cómputo, auditorios, salas de reuniones y laboratorios especializados) en la UPLA. El sistema elimina la duplicidad de reservas mediante validación matemática de solapamientos horarios tanto en el frontend como en el backend y en la base de datos PostgreSQL.

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│  FRONTEND  React 19 + TypeScript + Vite + Tailwind CSS v4           │
│  puerto: 5174  │  Proxy /api → http://127.0.0.1:5060               │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTP/REST (fetch nativo)
┌───────────────────────────▼─────────────────────────────────────────┐
│  BACKEND  ASP.NET Core 8 · Clean Architecture                       │
│  puerto: 5060                                                        │
│  ┌────────────┐  ┌─────────────────┐  ┌──────────────────────────┐  │
│  │   Domain   │◄─│   Application   │◄─│    Infrastructure        │  │
│  │ Entidades  │  │ Servicios/DTOs  │  │ EF Core + Npgsql         │  │
│  │ Interfaces │  │ Validadores     │  │ Repositorios             │  │
│  │ Enumerados │  │ Result<T>       │  │ AppDbContext             │  │
│  └────────────┘  └─────────────────┘  └──────────────────────────┘  │
│                           ▲                                          │
│                  ┌────────┴───────┐                                  │
│                  │  API (HTTP)    │                                   │
│                  │ Controllers    │                                   │
│                  │ Middleware     │                                   │
│                  └────────────────┘                                  │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ Npgsql / EF Core
┌───────────────────────────▼─────────────────────────────────────────┐
│  BASE DE DATOS  PostgreSQL 14+  │  reservaupla_db  │  puerto: 5432  │
│  Tablas: Usuarios · Ambientes · Reservas · AsignacionesResponsable  │
│  Constraints: CHECK horario · EXCLUDE solapamiento (btree_gist)     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Requisitos Previos

| Herramienta | Versión mínima | Verificación |
|---|---|---|
| **[.NET SDK](https://dotnet.microsoft.com/download/dotnet/8.0)** | 8.0 | `dotnet --version` |
| **[Node.js](https://nodejs.org/)** | 20 LTS | `node --version` |
| **[npm](https://www.npmjs.com/)** | 10+ | `npm --version` |
| **[PostgreSQL](https://www.postgresql.org/download/)** | 14+ | `psql --version` |
| **Extensión PostgreSQL** | btree_gist | `CREATE EXTENSION IF NOT EXISTS btree_gist;` |

---

## Instalación y Configuración

### Paso 1 — Base de Datos

```bash
# Crear la base de datos y ejecutar el script DDL + seed completo
psql -U postgres -c "CREATE DATABASE reservaupla_db;"
psql -U postgres -d reservaupla_db -f database/schema_reservaupla.sql
```

El script `database/schema_reservaupla.sql` crea automáticamente:
- Las tablas `Usuarios`, `Ambientes`, `Reservas` y `AsignacionesResponsable`
- Todos los `CHECK CONSTRAINTS` (horario 07:00–22:00, HoraFin > HoraInicio)
- El `EXCLUDE USING gist` para imposibilitar solapamientos en reservas Aprobadas (`RN-01`)
- Los datos semilla de 6 usuarios, 6 ambientes y 8 reservas de prueba

### Paso 2 — Backend (.NET 8)

```bash
# Configurar credenciales de BD (copiar y editar)
cp backend/ReservaUPLA.API/appsettings.Example.json \
   backend/ReservaUPLA.API/appsettings.Development.json
# Editar appsettings.Development.json: reemplazar TU_CONTRASEÑA_AQUI por admin123
```

```bash
# Compilar y ejecutar (puerto 5060)
cd backend
dotnet build ReservaUPLA.sln
dotnet run --project ReservaUPLA.API --launch-profile "Development"
# → Now listening on: http://localhost:5060
```

### Paso 3 — Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
# → Local: http://localhost:5174/
```

> **Nota:** Si el puerto 5174 está ocupado, Vite usará el siguiente disponible (p.ej. 5175). El proxy hacia el backend está configurado en `frontend/vite.config.ts`.

---

## Cuentas Institucionales de Prueba

| Rol | Correo Institucional | Contraseña | Permisos |
|---|---|---|---|
| **Administrador** | `cmendoza@upla.edu.pe` | `AdminUPLA2026` | Aprobar/Rechazar reservas · Gestionar usuarios y ambientes · Dashboard global |
| **Solicitante** | `erojas@upla.edu.pe` | `DocenteUPLA2026` | Registrar reservas · Consultar sus propias solicitudes · Dashboard personal |
| **Solicitante** | `jcerron@upla.edu.pe` | `DocenteUPLA2026` | Ídem anterior |
| **Responsable de ambiente** | `rpoma@upla.edu.pe` | `Responsable2026` | Supervisión en modo lectura · Verificador de disponibilidad · Ambientes: L-301, L-304, L-402 |

---

## Endpoints REST de la API

| Método | Endpoint | Descripción | Rol requerido |
|---|---|---|---|
| `GET` | `/api/usuarios` | Listar padrón de usuarios | Admin / Responsable |
| `POST` | `/api/usuarios` | Registrar nuevo usuario | Admin |
| `PUT` | `/api/usuarios/{id}` | Actualizar usuario | Admin |
| `DELETE` | `/api/usuarios/{id}` | Eliminar usuario | Admin |
| `GET` | `/api/ambientes` | Listar catálogo de ambientes | Todos |
| `POST` | `/api/ambientes` | Registrar ambiente | Admin |
| `PUT` | `/api/ambientes/{id}` | Actualizar ambiente | Admin |
| `GET` | `/api/reservas` | Listar reservas (filtrable) | Todos |
| `POST` | `/api/reservas` | Registrar solicitud de reserva | Admin / Solicitante |
| `GET` | `/api/reservas/{id}` | Consultar detalle | Todos |
| `PATCH` | `/api/reservas/{id}/estado` | Cambiar estado (Aprobar/Rechazar/Cancelar) | Admin / Solicitante |
| `GET` | `/api/reservas/disponibilidad` | Validar disponibilidad horaria | Todos |
| `GET` | `/api/dashboard` | Indicadores del dashboard | Todos |

---

## Matriz de Cumplimiento — Requerimientos Funcionales (RF-01 a RF-08)

| Código | Requerimiento | Endpoint Backend | Componente Frontend | Estado |
|---|---|---|---|---|
| **RF-01** | Gestión de usuarios (CRUD) | `POST/PUT/DELETE /api/usuarios` | `UsuariosPage` + `UsuarioFormCard` | ✅ 100% |
| **RF-02** | Gestión de ambientes universitarios (CRUD) | `POST/PUT/DELETE /api/ambientes` | `AmbientesPage` + `AmbienteFormCard` | ✅ 100% |
| **RF-03** | Registro de solicitudes de reserva | `POST /api/reservas` | `ReservasPage` + `ReservaFormCard` | ✅ 100% |
| **RF-04** | Validación de disponibilidad horaria previa | `GET /api/reservas/disponibilidad` | `ReservaFormCard` (`conflictoEnTiempoReal`) | ✅ 100% |
| **RF-05** | Listado filtrable de reservas | `GET /api/reservas` | `ReservaFilterBar` + `ReservaTableSection` | ✅ 100% |
| **RF-06** | Consulta de detalle de reserva | `GET /api/reservas/{id}` | `ReservaDetalleModal` | ✅ 100% |
| **RF-07** | Gestión de estados (Aprobar/Rechazar/Cancelar) | `PATCH /api/reservas/{id}/estado` | `ReservaEstadoConfirmModal` | ✅ 100% |
| **RF-08** | Dashboard con indicadores por rol | `GET /api/dashboard` | `DashboardPage` + `DashboardIndicadoresGrid` | ✅ 100% |

---

## Matriz de Cumplimiento — Reglas de Negocio (RN-01 a RN-06)

| Código | Regla de Negocio | Frontend | Backend | BD PostgreSQL | Estado |
|---|---|---|---|---|---|
| **RN-01** | No permitir reservas Aprobadas solapadas (misma fecha/ambiente/horario) | Alerta `conflictoEnTiempoReal` en tiempo real | `ObtenerConflictosAprobadosAsync()` en `ReservaService` | `EXCLUDE USING gist` (btree_gist) | ✅ 100% |
| **RN-02** | Campos obligatorios: fecha, hora inicio/fin, ambiente, solicitante, motivo | `validarFormularioReserva()` en `validators.ts` | `ReservaValidator.ValidarSolicitud()` | `NOT NULL` constraints | ✅ 100% |
| **RN-03** | `HoraFin > HoraInicio` | Restricción en `TimeInput` + validators | `ReservaValidator.ValidarRangoHorario()` | `CHECK ("HoraFin" > "HoraInicio")` | ✅ 100% |
| **RN-04** | Jornada 07:00–22:00 | `min/max` en `TimeInput` + validators | `ReservaConstantes` | `CHECK ("HoraInicio" >= '07:00' AND "HoraFin" <= '22:00')` | ✅ 100% |
| **RN-05** | Solo Administrador puede Aprobar/Rechazar | Ocultar botones por rol | Verificación de rol real en BD + `403 Forbidden` | — | ✅ 100% |
| **RN-06** | Una reserva Rechazada es inmutable | Candado visual en tabla | `Reserva.CambiarEstado()` bloquea transición | — | ✅ 100% |

---

## Capturas de Pantalla del Sistema

Las siguientes figuras documentan las vistas principales del sistema ReservaUPLA en su versión MVP. Las capturas deben obtenerse del sistema en ejecución en `http://localhost:5174`.

**[Figura 1]** Vista de la pantalla de inicio de sesión con panel corporativo institucional y formulario de autenticación por rol. Fuente: elaboración propia.

> _[Insertar captura de `LoginPage` — pantalla de login con imagen de fondo `fondo-login.png`]_

**[Figura 2]** Dashboard del Administrador con los 5 indicadores dinámicos: total de reservas, pendientes, aprobadas, rechazadas y ambientes activos. Fuente: elaboración propia.

> _[Insertar captura de `DashboardPage` — vista de Administrador con indicadores en tiempo real]_

**[Figura 3]** Módulo de Gestión de Reservas: tabla filtrable con columnas de ambiente, solicitante, fecha, horario, estado y acciones diferenciadas por rol. Fuente: elaboración propia.

> _[Insertar captura de `ReservasPage` — tabla de reservas con filtros activos]_

**[Figura 4]** Formulario modal de nueva solicitud de reserva con validación en tiempo real de conflictos horarios y atajos de bloques académicos. Fuente: elaboración propia.

> _[Insertar captura de `ReservaFormCard` — modal abierto con alerta de conflicto detectado]_

**[Figura 5]** Vista del Responsable de Ambiente: verificador de disponibilidad en modo solo lectura con agenda del día y bloques ocupados en tiempo real. Fuente: elaboración propia.

> _[Insertar captura de `ReservaFormCard` en modo Responsable de ambiente]_

**[Figura 6]** Modal de confirmación de cambio de estado con validación de solapamientos y advertencia de reservas en competencia para el Administrador. Fuente: elaboración propia.

> _[Insertar captura de `ReservaEstadoConfirmModal` — modal de aprobación con lista de conflictos]_

---

## Estructura de Carpetas del Proyecto

```
ReservaUPLA/
├── backend/                          # ASP.NET Core 8 — Clean Architecture
│   ├── ReservaUPLA.sln               # Solución única
│   ├── ReservaUPLA.Domain/           # Entidades, enums, interfaces
│   ├── ReservaUPLA.Application/      # Servicios, DTOs, validadores, Result<T>
│   ├── ReservaUPLA.Infrastructure/   # EF Core, repositorios, AppDbContext
│   └── ReservaUPLA.API/              # Controladores REST, Middleware, Program.cs
│       ├── appsettings.json          # Config base (sin contraseña real)
│       ├── appsettings.Development.json  # Config local (gitignored)
│       └── appsettings.Example.json  # Plantilla pública
├── database/
│   └── schema_reservaupla.sql        # DDL completo + seeds + constraints
├── docs/                             # Documentación técnica por semana
│   ├── 01_Analisis_Alcance_y_Actores.md
│   ├── 02_Ciclo_de_Vida_Software.md
│   ├── 03_Manual_Estandares_Construccion.md
│   ├── 04_Informe_Tecnico_y_Reflexion_Final.md
│   ├── 05_Modulos_Entrada_Datos_Formularios.md
│   ├── 06_Validacion_Captura_de_Datos.md
│   ├── 07_Reutilizacion_Componentes_UI.md
│   ├── 08_Refinamiento_Clean_Code.md
│   └── 09_Modulos_Salida_Dashboard.md
├── frontend/                         # React 19 + TypeScript + Vite + Tailwind CSS v4
│   ├── public/images/                # Assets institucionales (logo, fondo-login)
│   └── src/
│       ├── components/               # UI reutilizable + componentes de dominio
│       ├── hooks/                    # Custom hooks (useReservasManagement, etc.)
│       ├── layouts/                  # AuthLayout, MainLayout
│       ├── pages/                    # Orquestadores de página
│       ├── services/                 # apiClient.ts + servicios tipados
│       ├── types/                    # Contratos TypeScript estrictos
│       └── utils/                    # Validadores, formateadores, constantes
├── CONFORMIDAD_UX_ISO_NORMAN_SHNEIDERMAN_NIELSEN.md
├── .gitignore
└── README.md                         # Este archivo
```

---

## Tecnologías y Versiones

| Capa | Tecnología | Versión |
|---|---|---|
| Lenguaje Backend | C# | 12 |
| Framework Backend | ASP.NET Core | 8.0 |
| ORM | Entity Framework Core + Npgsql | 8.x |
| Base de Datos | PostgreSQL | 14+ |
| Lenguaje Frontend | TypeScript | 5.x |
| Framework Frontend | React | 19 |
| Build Tool | Vite | 8.x |
| CSS | Tailwind CSS | v4 |
| Iconografía | Lucide React | latest |

---

## Referencias

- Martin, R. C. (2017). *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Prentice Hall.
- Norman, D. A. (2013). *The Design of Everyday Things* (Rev. ed.). Basic Books.
- Nielsen, J. (1994). *Usability Engineering*. Morgan Kaufmann.
- ISO 9241-210:2010. *Ergonomics of human–system interaction — Part 210: Human-centred design for interactive systems*. International Organization for Standardization.
- Microsoft. (2024). *ASP.NET Core documentation*. https://docs.microsoft.com/aspnet/core
- PostgreSQL Global Development Group. (2024). *PostgreSQL 14 Documentation*. https://www.postgresql.org/docs/14/

---

*Documento generado en el contexto del Caso Práctico de Construcción de Software — UPLA 2026.*
