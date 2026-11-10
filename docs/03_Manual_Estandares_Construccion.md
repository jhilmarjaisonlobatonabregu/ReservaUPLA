# Semana 03 — Manual de Estándares de Construcción, Arquitectura y Control de Versiones (Sección 8)

Este documento define los estándares de ingeniería de software aplicados rigurosamente en la construcción de **ReservaUPLA**.

---

## 1. Arquitectura del Sistema

### 1.1 Backend: Clean Architecture en .NET (`backend/`)
El backend está dividido en **4 proyectos con dependencia unidireccional hacia el centro**:
1. **`ReservaUPLA.Domain`:** Entidades puras (`Usuario`, `Ambiente`, `Reserva`), constantes de dominio (`ReservaConstantes`) e interfaces de repositorio (`IUsuarioRepository`, `IAmbienteRepository`, `IReservaRepository`). Cero dependencias externas.
2. **`ReservaUPLA.Application`:** Casos de uso (`ReservaService`, `AmbienteService`, `UsuarioService`, `DashboardService`), DTOs inmutables (`record`), validadores (`ReservaValidator`, `AmbienteValidator`, `UsuarioValidator`), catálogo de mensajes (`MensajesCatalogo`) y patrón `Result<T>`.
3. **`ReservaUPLA.Infrastructure`:** Persistencia con Entity Framework Core y Npgsql (`AppDbContext`), configuraciones Fluent API (`UsuarioConfiguration`, `AmbienteConfiguration`, `ReservaConfiguration`) e implementación de repositorios.
4. **`ReservaUPLA.API`:** Controladores REST delgados (`UsuariosController`, `AmbientesController`, `ReservasController`, `DashboardController`) y middleware global de manejo de excepciones (`ExceptionHandlingMiddleware`).

### 1.2 Frontend: Arquitectura Modular Basada en Componentes (`frontend/src/`)
```text
frontend/src/
├── components/
│   ├── ui/             # Los 9 componentes reutilizables (Sección 9) + Tooltip accesible
│   ├── layout/         # Marco estructural (Header, Sidebar, PageHeader, AuthBrandPanel, LogoutModal)
│   ├── dashboard/      # Grid de los 5 indicadores (CardIndicador) y tablas de resumen
│   ├── reservas/       # Formulario modal, barra de filtros, tabla y modales de detalle/estado
│   ├── ambientes/      # Formulario modal y tabla de catálogo de ambientes
│   └── usuarios/       # Formulario modal, tabla de padrón y selector de perfiles demo
├── hooks/              # Custom hooks de estado y negocio (useReservasManagement, useDashboard, etc.)
├── layouts/            # Plantillas AuthLayout y MainLayout
├── pages/              # Orquestadores de página (LoginPage, DashboardPage, ReservasPage, AmbientesPage, UsuariosPage)
├── services/           # Cliente HTTP nativo (apiClient.ts) y servicios por entidad
├── types/              # Contratos e interfaces TypeScript estrictos (sin uso de 'any')
└── utils/              # Formateadores de fecha/hora peruana y validadores preventivos
```

---

## 2. Convenciones de Nomenclatura (Naming Conventions)

| Elemento | Convención | Ejemplo Real en `ReservaUPLA` |
|---|---|---|
| **Clases, Entidades, Interfaces y Métodos C#** | `PascalCase` | `ReservaService`, `ValidarDisponibilidadAsync`, `ObtenerConflictosAprobadosAsync` |
| **Campos privados en C#** | `_camelCase` | `_reservaRepository`, `_ambienteRepository`, `_usuarioRepository` |
| **Componentes de React y Tipos TypeScript** | `PascalCase` | `CardIndicador.tsx`, `ModalConfirmacion.tsx`, `ReservaResponseDto` |
| **Funciones, Hooks y Variables en TypeScript** | `camelCase` | `useReservasManagement`, `formatearFechaLegible`, `conflictoEnTiempoReal` |
| **Constantes Globales en TypeScript** | `UPPER_SNAKE_CASE` | `HORA_MINIMA_INSTITUCIONAL`, `BLOQUES_HORARIOS_RAPIDOS` |
| **Tablas y Columnas en PostgreSQL** | `PascalCase` entre comillas | `"Usuarios"`, `"Ambientes"`, `"Reservas"`, `"HoraInicio"`, `"HoraFin"` |

---

## 3. Estándares de Control de Versiones (Git)
- **Ramas:** `main` (producción estable), `develop` (integración) y ramas de característica (`feat/reservas-validacion`, `feat/dashboard-indicadores`, `fix/validacion-solapamiento`).
- **Formato de Commits (Conventional Commits):**
  - `feat:` nueva funcionalidad del caso práctico (`RF-01`..`RF-08`).
  - `fix:` corrección de defectos o validaciones (`RN-01`..`RN-06`).
  - `refactor:` mejora de estructura o componentes UI sin alterar comportamiento.
  - `docs:` actualización de documentación técnica o scripts SQL.
