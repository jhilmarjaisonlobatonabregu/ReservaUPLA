namespace ReservaUPLA.Application.DTOs.Ambientes;

public record AmbienteResponseDto(
    Guid Id,
    string Nombre,
    string Tipo,
    int Capacidad,
    string Ubicacion,
    string Estado,
    int TotalReservasAprobadas
);

public record CrearAmbienteDto(
    string Nombre,
    string Tipo,
    int Capacidad,
    string Ubicacion,
    string Estado = "Disponible"
);
