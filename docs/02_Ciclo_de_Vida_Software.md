# Semana 02 — Selección y Justificación del Modelo de Ciclo de Vida del Software (Sección 8)

## 1. Modelo Seleccionado: Ciclo de Vida Iterativo e Incremental con Enfoque MVP

Para el desarrollo de **ReservaUPLA** se seleccionó el **Modelo de Ciclo de Vida Iterativo e Incremental guiado por un Producto Mínimo Viable (MVP)**, estructurado en 4 incrementos semanales alineados con el cronograma académico de la UPLA.

```
[Incremento 1: Dominio y BD] ---> [Incremento 2: API y Reglas RN-01..06] ---> [Incremento 3: UI React y 9 Componentes] ---> [Incremento 4: Dashboard, Auditoría HCI y Pruebas E2E]
```

---

## 2. Justificación Técnica de la Elección

1. **Entrega temprana de valor verificable (Enfoque MVP):**
   - A diferencia del modelo en Cascada puro, el enfoque iterativo-incremental permite validar desde el primer incremento las 3 entidades nucleares (`Usuario`, `Ambiente`, `Reserva`) y el motor de detección de solapamientos horarios (`RN-01`).
2. **Desacoplamiento por capas en Clean Architecture:**
   - Permite construir y probar primero el núcleo de reglas de negocio (`ReservaUPLA.Domain` y `ReservaUPLA.Application`) de manera independiente a la interfaz gráfica (`frontend/`) y a la persistencia en PostgreSQL (`ReservaUPLA.Infrastructure`).
3. **Refinamiento continuo de Usabilidad y Experiencia de Usuario (DCU):**
   - Cada iteración permitió incorporar progresivamente los 9 componentes reutilizables de la Sección 9 y someterlos a inspección frente a las 8 Reglas de Oro de Shneiderman, las 10 Heurísticas de Nielsen, los principios de Donald Norman y la norma ISO 9241-210:2010.

---

## 3. Planificación de Incrementos del Proyecto ReservaUPLA

| Incremento | Fase / Semana | Entregables Técnicos Construidos | Requerimientos y Reglas Cubiertos |
|---|---|---|---|
| **Incremento 1** | Semana 01 | Definición de actores, alcance MVP, diseño del modelo relacional en PostgreSQL (`reservaupla_db`) y entidades de dominio C#. | Sección 1 a 4, Sección 7 |
| **Incremento 2** | Semana 02 | Implementación de repositorios EF Core, validadores de dominio (`ReservaValidator`, `AmbienteValidator`, `UsuarioValidator`) y controladores REST. | `RF-01`, `RF-02`, `RF-03`, `RF-04`, `RN-01` a `RN-06` |
| **Incremento 3** | Semana 03 | Construcción de la biblioteca de **9 componentes reutilizables** en React + TypeScript y vistas modales de Usuarios, Ambientes y Reservas. | `RF-05`, `RF-06`, `RF-07`, Sección 9 |
| **Incremento 4** | Semana 04 | Implementación del Dashboard diferenciado por rol (`RF-08`), Modo Claro/Oscuro persistente, pruebas de integración E2E y auditoría HCI/ISO. | `RF-08`, Sección 10, 11, 12 y 13 |
