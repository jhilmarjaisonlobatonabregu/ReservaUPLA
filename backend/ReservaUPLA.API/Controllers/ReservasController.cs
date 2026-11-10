using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.Application.Common;
using ReservaUPLA.Application.DTOs.Reservas;
using ReservaUPLA.Application.Interfaces.Services;

namespace ReservaUPLA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservasController : ControllerBase
{
    private readonly IReservaService _reservaService;

    public ReservasController(IReservaService reservaService)
    {
        _reservaService = reservaService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ReservaResponseDto>>> Listar(
        [FromQuery] Guid? ambienteId = null,
        [FromQuery] string? estado = null,
        [FromQuery] string? fecha = null,
        [FromQuery] Guid? usuarioId = null,
        CancellationToken cancellationToken = default)
    {
        var reservas = await _reservaService.ListarReservasAsync(
            ambienteId,
            estado,
            fecha,
            usuarioId,
            cancellationToken
        );
        return Ok(reservas);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Result<ReservaResponseDto>>> ObtenerDetalle(
        Guid id,
        CancellationToken cancellationToken)
    {
        var resultado = await _reservaService.ObtenerDetalleAsync(id, cancellationToken);
        if (!resultado.IsSuccess)
        {
            return NotFound(resultado);
        }

        return Ok(resultado);
    }

    [HttpGet("disponibilidad")]
    public async Task<ActionResult<Result<DisponibilidadResponseDto>>> ValidarDisponibilidad(
        [FromQuery] Guid ambienteId,
        [FromQuery] string fecha,
        [FromQuery] string horaInicio,
        [FromQuery] string horaFin,
        CancellationToken cancellationToken)
    {
        var resultado = await _reservaService.ValidarDisponibilidadAsync(
            ambienteId,
            fecha,
            horaInicio,
            horaFin,
            null,
            cancellationToken
        );

        if (!resultado.IsSuccess)
        {
            return BadRequest(resultado);
        }

        return Ok(resultado);
    }

    [HttpPost]
    public async Task<ActionResult<Result<ReservaResponseDto>>> Registrar(
        [FromBody] CrearReservaDto dto,
        CancellationToken cancellationToken)
    {
        var rolActor = Request.Headers["X-Usuario-Rol"].FirstOrDefault();
        var resultado = await _reservaService.RegistrarReservaAsync(dto, rolActor, cancellationToken);
        if (!resultado.IsSuccess)
            return resultado.ErrorCode switch
            {
                ResultErrorCode.Forbidden => StatusCode(StatusCodes.Status403Forbidden, resultado),
                ResultErrorCode.NotFound  => NotFound(resultado),
                ResultErrorCode.Conflict  => Conflict(resultado),
                _                         => BadRequest(resultado)
            };

        return Created($"/api/reservas/{resultado.Data?.Id}", resultado);
    }

    [HttpPatch("{id:guid}/estado")]
    public async Task<ActionResult<Result<ReservaResponseDto>>> CambiarEstado(
        Guid id,
        [FromBody] CambiarEstadoReservaDto dto,
        CancellationToken cancellationToken)
    {
        var rolHeader = Request.Headers["X-Usuario-Rol"].FirstOrDefault();
        var usuarioIdHeader = Request.Headers["X-Usuario-Id"].FirstOrDefault();

        Guid? usuarioActorId = null;
        if (Guid.TryParse(usuarioIdHeader, out var parsedId))
            usuarioActorId = parsedId;

        var dtoConRolReal = !string.IsNullOrWhiteSpace(rolHeader)
            ? dto with { RolActor = rolHeader }
            : dto;

        var resultado = await _reservaService.CambiarEstadoAsync(id, dtoConRolReal, usuarioActorId, cancellationToken);
        if (!resultado.IsSuccess)
            return resultado.ErrorCode switch
            {
                ResultErrorCode.Forbidden => StatusCode(StatusCodes.Status403Forbidden, resultado),
                ResultErrorCode.NotFound  => NotFound(resultado),
                ResultErrorCode.Conflict  => Conflict(resultado),
                _                         => BadRequest(resultado)
            };

        return Ok(resultado);
    }
}
