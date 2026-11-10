using ReservaUPLA.Application.DTOs.Reservas;

namespace ReservaUPLA.Application.DTOs.Dashboard;

public record DashboardIndicadoresDto(
    int TotalReservas,
    int ReservasPendientes,
    int ReservasAprobadas,
    int ReservasRechazadas,
    int ReservasCanceladas,
    string AmbienteMasUtilizado,
    int UsosAmbienteMasUtilizado,
    string TipoAmbienteMasUtilizado,
    List<UsoAmbienteDto> ResumenPorAmbiente,
    List<ReservaResponseDto> ProximasReservas
);

public record UsoAmbienteDto(
    Guid AmbienteId,
    string AmbienteNombre,
    string Tipo,
    string Ubicacion,
    int Capacidad,
    string EstadoAmbiente,
    int TotalSolicitudes,
    int ReservasAprobadas,
    int ReservasPendientes
);
