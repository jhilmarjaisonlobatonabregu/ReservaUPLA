namespace ReservaUPLA.Application.DTOs.Reservas;

public record ReservaResponseDto(
    Guid Id,
    string Fecha,
    string HoraInicio,
    string HoraFin,
    string Motivo,
    string Estado,
    Guid UsuarioId,
    string UsuarioNombre,
    string UsuarioCorreo,
    string UsuarioRol,
    Guid AmbienteId,
    string AmbienteNombre,
    string AmbienteTipo,
    int AmbienteCapacidad,
    string AmbienteUbicacion
);

public record CrearReservaDto(
    string Fecha,
    string HoraInicio,
    string HoraFin,
    string Motivo,
    Guid UsuarioId,
    Guid AmbienteId
);

public record CambiarEstadoReservaDto(
    string NuevoEstado,
    string RolActor
);

public record DisponibilidadResponseDto(
    bool Disponible,
    string Mensaje,
    List<ReservaConflictoDto> Conflictos
);

public record ReservaConflictoDto(
    Guid Id,
    string HoraInicio,
    string HoraFin,
    string Estado,
    string Solicitante,
    string Motivo
);
