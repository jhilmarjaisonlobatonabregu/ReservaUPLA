using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.Application.Common;
using ReservaUPLA.Application.DTOs.Ambientes;
using ReservaUPLA.Application.Interfaces.Services;

namespace ReservaUPLA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AmbientesController : ControllerBase
{
    private readonly IAmbienteService _ambienteService;

    public AmbientesController(IAmbienteService ambienteService)
    {
        _ambienteService = ambienteService;
    }

    [HttpGet]
    public async Task<ActionResult<List<AmbienteResponseDto>>> Listar(CancellationToken cancellationToken)
    {
        // Si el actor es Responsable de ambiente, filtrar solo sus ambientes asignados (RN-MVP)
        var rolHeader = Request.Headers["X-Usuario-Rol"].FirstOrDefault();
        Guid? responsableId = null;
        if (string.Equals(rolHeader?.Trim(), "Responsable de ambiente", StringComparison.OrdinalIgnoreCase))
        {
            var idHeader = Request.Headers["X-Usuario-Id"].FirstOrDefault();
            if (Guid.TryParse(idHeader, out var parsedId))
                responsableId = parsedId;
        }

        var ambientes = await _ambienteService.ListarAmbientesAsync(responsableId, cancellationToken);
        return Ok(ambientes);
    }

    [HttpPost]
    public async Task<ActionResult<Result<AmbienteResponseDto>>> Registrar(
        [FromBody] CrearAmbienteDto dto,
        CancellationToken cancellationToken)
    {
        var rolActor = Request.Headers["X-Usuario-Rol"].FirstOrDefault();
        var resultado = await _ambienteService.RegistrarAmbienteAsync(dto, rolActor, cancellationToken);
        if (!resultado.IsSuccess)
            return resultado.ErrorCode switch
            {
                ResultErrorCode.Forbidden => StatusCode(StatusCodes.Status403Forbidden, resultado),
                ResultErrorCode.NotFound  => NotFound(resultado),
                _                         => BadRequest(resultado)
            };

        return Created($"/api/ambientes/{resultado.Data?.Id}", resultado);
    }
}
