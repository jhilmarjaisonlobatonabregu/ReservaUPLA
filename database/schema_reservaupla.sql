-- =============================================================================
-- RESERVAUPLA: SISTEMA DE GESTIÓN DE RESERVAS DE AMBIENTES UNIVERSITARIOS
-- Modelo de Datos Referencial e Implementación Física (Sección 7 del Caso Práctico)
-- Motor: PostgreSQL | Base de Datos: reservaupla_db
-- =============================================================================

DROP TABLE IF EXISTS "Reservas" CASCADE;
DROP TABLE IF EXISTS "Ambientes" CASCADE;
DROP TABLE IF EXISTS "Usuarios" CASCADE;

-- =============================================================================
-- 1. ENTIDAD USUARIO (RF-01 / Sección 7)
-- =============================================================================
CREATE TABLE "Usuarios" (
    "Id" UUID PRIMARY KEY,
    "NombreCompleto" VARCHAR(150) NOT NULL,
    "Correo" VARCHAR(150) NOT NULL UNIQUE,
    "Rol" VARCHAR(50) NOT NULL CHECK ("Rol" IN ('Solicitante', 'Administrador', 'Responsable de ambiente')),
    "Activo" BOOLEAN NOT NULL DEFAULT TRUE
);

-- =============================================================================
-- 2. ENTIDAD AMBIENTE (RF-02 / Sección 7)
-- =============================================================================
CREATE TABLE "Ambientes" (
    "Id" UUID PRIMARY KEY,
    "Nombre" VARCHAR(100) NOT NULL UNIQUE,
    "Tipo" VARCHAR(50) NOT NULL,
    "Capacidad" INTEGER NOT NULL CHECK ("Capacidad" > 0),
    "Ubicacion" VARCHAR(100) NOT NULL,
    "Estado" VARCHAR(30) NOT NULL DEFAULT 'Disponible' CHECK ("Estado" IN ('Disponible', 'Mantenimiento', 'Inactivo'))
);

-- =============================================================================
-- 3. ENTIDAD RESERVA (RF-03..RF-08 y RN-01..RN-06 / Sección 7)
-- =============================================================================
CREATE TABLE "Reservas" (
    "Id" UUID PRIMARY KEY,
    "Fecha" DATE NOT NULL,
    "HoraInicio" TIME NOT NULL,
    "HoraFin" TIME NOT NULL,
    "Motivo" TEXT NOT NULL,
    "Estado" VARCHAR(30) NOT NULL DEFAULT 'Pendiente' CHECK ("Estado" IN ('Pendiente', 'Aprobada', 'Rechazada', 'Cancelada')),
    "UsuarioId" UUID NOT NULL REFERENCES "Usuarios"("Id") ON DELETE RESTRICT,
    "AmbienteId" UUID NOT NULL REFERENCES "Ambientes"("Id") ON DELETE RESTRICT,
    CONSTRAINT "CK_Reserva_Horas" CHECK ("HoraFin" > "HoraInicio"),
    CONSTRAINT "CK_Reserva_RangoPermitido" CHECK ("HoraInicio" >= '07:00:00' AND "HoraFin" <= '22:00:00')
);

CREATE INDEX "IX_Reservas_Ambiente_Fecha_Estado" ON "Reservas" ("AmbienteId", "Fecha", "Estado");
CREATE INDEX "IX_Reservas_UsuarioId" ON "Reservas" ("UsuarioId");

-- =============================================================================
-- 3b. ASIGNACIONES RESPONSABLE DE AMBIENTE (MVP — sin tabla EF, pura SQL)
-- Permite que el Responsable vea solo los ambientes a su cargo.
-- =============================================================================
CREATE TABLE IF NOT EXISTS "AsignacionesResponsable" (
    "UsuarioId"   UUID NOT NULL REFERENCES "Usuarios"("Id")   ON DELETE CASCADE,
    "AmbienteId"  UUID NOT NULL REFERENCES "Ambientes"("Id")  ON DELETE CASCADE,
    PRIMARY KEY ("UsuarioId", "AmbienteId")
);

-- =============================================================================
-- RN-01: RESTRICCIÓN DE EXCLUSIÓN PARA EVITAR SOLAPAMIENTO CONCURRENTE DE RESERVAS
-- Protege contra la condición de carrera donde dos administradores aprueban
-- simultáneamente dos solicitudes en el mismo ambiente, fecha y rango horario.
-- Requiere la extensión btree_gist (incluida en PostgreSQL 14+).
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- La restricción EXCLUDE solo actúa sobre filas con Estado = 'Aprobada'.
-- Cuando se hace UPDATE de Estado → 'Aprobada', PostgreSQL evalúa la exclusión
-- dentro de la misma transacción SERIALIZABLE, bloqueando el solapamiento a nivel motor.
ALTER TABLE "Reservas"
    ADD CONSTRAINT "EX_Reservas_SinSolapamiento_Aprobadas"
    EXCLUDE USING gist (
        "AmbienteId"  WITH =,
        "Fecha"       WITH =,
        tsrange(
            ("Fecha"::timestamp + "HoraInicio"::interval),
            ("Fecha"::timestamp + "HoraFin"::interval),
            '[)'
        ) WITH &&
    )
    WHERE ("Estado" = 'Aprobada');

-- =============================================================================
-- 4. DATOS SEMILLA INSTITUCIONALES (UNIVERSIDAD PERUANA LOS ANDES - UPLA)
-- =============================================================================

INSERT INTO "Usuarios" ("Id", "NombreCompleto", "Correo", "Rol", "Activo") VALUES
('11111111-1111-1111-1111-111111111101', 'Ing. Carlos Mendoza Quispe', 'cmendoza@upla.edu.pe', 'Administrador', TRUE),
('11111111-1111-1111-1111-111111111102', 'Mg. Elena Rojas Huamán', 'erojas@upla.edu.pe', 'Solicitante', TRUE),
('11111111-1111-1111-1111-111111111103', 'Téc. Roberto Poma Gavilán', 'rpoma@upla.edu.pe', 'Responsable de ambiente', TRUE),
('11111111-1111-1111-1111-111111111104', 'Dr. Javier Cerrón Palomino', 'jcerron@upla.edu.pe', 'Solicitante', TRUE),
('11111111-1111-1111-1111-111111111105', 'Est. Lucía Vilcapoma Castro', 'lvilcapoma@ms.upla.edu.pe', 'Solicitante', TRUE),
('11111111-1111-1111-1111-111111111106', 'Ing. Patricia Oré Santana', 'pore@upla.edu.pe', 'Responsable de ambiente', TRUE);

INSERT INTO "Ambientes" ("Id", "Nombre", "Tipo", "Capacidad", "Ubicacion", "Estado") VALUES
('22222222-2222-2222-2222-222222222201', 'Laboratorio de Cómputo L-301', 'Laboratorio de Cómputo', 40, 'Pabellón G - Piso 3 (Chorrillos)', 'Disponible'),
('22222222-2222-2222-2222-222222222202', 'Laboratorio de Redes y Ciberseguridad L-304', 'Laboratorio Especializado', 32, 'Pabellón G - Piso 3 (Chorrillos)', 'Disponible'),
('22222222-2222-2222-2222-222222222203', 'Auditorio Central UPLA', 'Auditorio', 250, 'Pabellón A - Piso 1 (Chorrillos)', 'Disponible'),
('22222222-2222-2222-2222-222222222204', 'Sala de Reuniones Decanato Ingeniería', 'Sala de Reuniones', 20, 'Pabellón B - Piso 2 (Chorrillos)', 'Disponible'),
('22222222-2222-2222-2222-222222222205', 'Laboratorio de Inteligencia Artificial L-402', 'Laboratorio de Cómputo', 35, 'Pabellón G - Piso 4 (Chorrillos)', 'Disponible'),
('22222222-2222-2222-2222-222222222206', 'Sala Multimedia de Sustentaciones', 'Sala Especial', 60, 'Pabellón C - Piso 2 (Chorrillos)', 'Mantenimiento');

INSERT INTO "Reservas" ("Id", "Fecha", "HoraInicio", "HoraFin", "Motivo", "Estado", "UsuarioId", "AmbienteId") VALUES
('33333333-3333-3333-3333-333333333301', CURRENT_DATE, '08:00:00', '10:30:00', 'Taller práctico de Diseño de Sistemas y Arquitectura Limpia - VIII Ciclo', 'Aprobada', '11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222201'),
('33333333-3333-3333-3333-333333333302', CURRENT_DATE, '11:00:00', '13:00:00', 'Práctica calificada de Base de Datos Avanzada en PostgreSQL', 'Aprobada', '11111111-1111-1111-1111-111111111104', '22222222-2222-2222-2222-222222222201'),
('33333333-3333-3333-3333-333333333303', CURRENT_DATE, '15:00:00', '18:00:00', 'Conferencia Académica de Ingeniería de Sistemas y Computación UPLA', 'Aprobada', '11111111-1111-1111-1111-111111111104', '22222222-2222-2222-2222-222222222203'),
('33333333-3333-3333-3333-333333333304', CURRENT_DATE + INTERVAL '1 day', '09:00:00', '11:30:00', 'Simulación de topologías VLAN y auditoría de seguridad en red', 'Pendiente', '11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222202'),
('33333333-3333-3333-3333-333333333305', CURRENT_DATE + INTERVAL '1 day', '14:00:00', '16:30:00', 'Sesión del Círculo de Estudios de Desarrollo Web Full Stack', 'Pendiente', '11111111-1111-1111-1111-111111111105', '22222222-2222-2222-2222-222222222201'),
('33333333-3333-3333-3333-333333333306', CURRENT_DATE + INTERVAL '2 days', '10:00:00', '12:00:00', 'Reunión de Coordinación de Acreditación ICACIT - Escuela Profesional', 'Aprobada', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222204'),
('33333333-3333-3333-3333-333333333307', CURRENT_DATE, '09:00:00', '11:00:00', 'Solicitud duplicada de refuerzo de programación competitiva', 'Rechazada', '11111111-1111-1111-1111-111111111105', '22222222-2222-2222-2222-222222222201'),
('33333333-3333-3333-3333-333333333308', CURRENT_DATE + INTERVAL '3 days', '16:00:00', '18:30:00', 'Entrenamiento de modelos de visión artificial con PyTorch', 'Pendiente', '11111111-1111-1111-1111-111111111104', '22222222-2222-2222-2222-222222222205');

-- Seed asignaciones: rpoma supervisa L-301, L-304, L-402; pore supervisa Sala Reuniones y Multimedia
INSERT INTO "AsignacionesResponsable" ("UsuarioId", "AmbienteId") VALUES
('11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222201'),  -- rpoma → Lab. Cómputo L-301
('11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222202'),  -- rpoma → Lab. Redes L-304
('11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222205'),  -- rpoma → Lab. IA L-402
('11111111-1111-1111-1111-111111111106', '22222222-2222-2222-2222-222222222204'),  -- pore  → Sala Reuniones Decanato
('11111111-1111-1111-1111-111111111106', '22222222-2222-2222-2222-222222222206');  -- pore  → Sala Multimedia
