using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.Application.DTOs.Dashboard;
using ReservaUPLA.Application.Interfaces.Services;

namespace ReservaUPLA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardIndicadoresDto>> ObtenerIndicadores(
        [FromQuery] Guid? usuarioId = null,
        [FromQuery] string? rol = null,
        CancellationToken cancellationToken = default)
    {
        var rolEfectivo = !string.IsNullOrWhiteSpace(rol)
            ? rol
            : Request.Headers["X-Usuario-Rol"].FirstOrDefault();

        var usuarioEfectivo = usuarioId;
        if (!usuarioEfectivo.HasValue || usuarioEfectivo.Value == Guid.Empty)
        {
            var headerUsuarioId = Request.Headers["X-Usuario-Id"].FirstOrDefault();
            if (Guid.TryParse(headerUsuarioId, out var parsedId))
            {
                usuarioEfectivo = parsedId;
            }
        }

        var indicadores = await _dashboardService.ObtenerIndicadoresAsync(
            usuarioEfectivo,
            rolEfectivo,
            cancellationToken
        );
        return Ok(indicadores);
    }
}
