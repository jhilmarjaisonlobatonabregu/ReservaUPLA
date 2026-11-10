using ReservaUPLA.Application.DTOs.Dashboard;

namespace ReservaUPLA.Application.Interfaces.Services;

public interface IDashboardService
{
    Task<DashboardIndicadoresDto> ObtenerIndicadoresAsync(
        Guid? usuarioId = null,
        string? rol = null,
        CancellationToken cancellationToken = default);
}
