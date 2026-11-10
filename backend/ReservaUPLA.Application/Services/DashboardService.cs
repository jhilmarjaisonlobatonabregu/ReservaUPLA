using ReservaUPLA.Application.DTOs.Dashboard;
using ReservaUPLA.Application.Interfaces.Services;
using ReservaUPLA.Domain.Common;
using ReservaUPLA.Domain.Interfaces.Repositories;

namespace ReservaUPLA.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IReservaRepository _reservaRepository;
    private readonly IAmbienteRepository _ambienteRepository;

    public DashboardService(
        IReservaRepository reservaRepository,
        IAmbienteRepository ambienteRepository)
    {
        _reservaRepository = reservaRepository;
        _ambienteRepository = ambienteRepository;
    }

    public async Task<DashboardIndicadoresDto> ObtenerIndicadoresAsync(
        Guid? usuarioId = null,
        string? rol = null,
        CancellationToken cancellationToken = default)
    {
        var todasLasReservas = await _reservaRepository.ListarTodasConRelacionesAsync(cancellationToken);
        var ambientes = await _ambienteRepository.ListarTodosAsync(cancellationToken);

        var esSolicitante =
            string.Equals(rol?.Trim(), ReservaConstantes.RolSolicitante, StringComparison.OrdinalIgnoreCase) &&
            usuarioId.HasValue &&
            usuarioId.Value != Guid.Empty;

        // RF-08: Si el actor es Solicitante, aislar estrictamente sus propias reservas por UsuarioId autenticado
        var reservasEvaluadas = esSolicitante
            ? todasLasReservas.Where(r => r.UsuarioId == usuarioId!.Value).ToList()
            : todasLasReservas;

        var totalReservas = reservasEvaluadas.Count;
        var pendientes = reservasEvaluadas.Count(r => r.Estado == ReservaConstantes.ReservaPendiente);
        var aprobadas = reservasEvaluadas.Count(r => r.Estado == ReservaConstantes.ReservaAprobada);
        var rechazadas = reservasEvaluadas.Count(r => r.Estado == ReservaConstantes.ReservaRechazada);
        var canceladas = reservasEvaluadas.Count(r => r.Estado == ReservaConstantes.ReservaCancelada);

        var resumenAmbientes = ambientes
            .Select(a =>
            {
                var reservasAmbiente = reservasEvaluadas.Where(r => r.AmbienteId == a.Id).ToList();
                return new UsoAmbienteDto(
                    a.Id,
                    a.Nombre,
                    a.Tipo,
                    a.Ubicacion,
                    a.Capacidad,
                    a.Estado,
                    reservasAmbiente.Count,
                    reservasAmbiente.Count(r => r.Estado == ReservaConstantes.ReservaAprobada),
                    reservasAmbiente.Count(r => r.Estado == ReservaConstantes.ReservaPendiente)
                );
            })
            .OrderByDescending(x => x.ReservasAprobadas)
            .ThenByDescending(x => x.TotalSolicitudes)
            .ThenBy(x => x.AmbienteNombre)
            .ToList();

        var topAmbiente = resumenAmbientes.FirstOrDefault(x => x.ReservasAprobadas > 0 || x.TotalSolicitudes > 0);
        var nombreMasUtilizado = topAmbiente?.AmbienteNombre ?? "Sin registros";
        var usosMasUtilizado = topAmbiente is not null
            ? (topAmbiente.ReservasAprobadas > 0 ? topAmbiente.ReservasAprobadas : topAmbiente.TotalSolicitudes)
            : 0;
        var tipoMasUtilizado = topAmbiente?.Tipo ?? "N/A";

        var proximasReservas = reservasEvaluadas
            .OrderByDescending(r => r.Fecha)
            .ThenBy(r => r.HoraInicio)
            .Take(8)
            .Select(ReservaService.MapearADto)
            .ToList();

        return new DashboardIndicadoresDto(
            totalReservas,
            pendientes,
            aprobadas,
            rechazadas,
            canceladas,
            nombreMasUtilizado,
            usosMasUtilizado,
            tipoMasUtilizado,
            resumenAmbientes,
            proximasReservas
        );
    }
}
