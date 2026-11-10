using ReservaUPLA.Application.Common;
using ReservaUPLA.Application.DTOs.Reservas;

namespace ReservaUPLA.Application.Interfaces.Services;

public interface IReservaService
{
    Task<List<ReservaResponseDto>> ListarReservasAsync(
        Guid? ambienteId = null,
        string? estado = null,
        string? fecha = null,
        Guid? usuarioId = null,
        CancellationToken cancellationToken = default);

    Task<Result<ReservaResponseDto>> ObtenerDetalleAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Result<DisponibilidadResponseDto>> ValidarDisponibilidadAsync(
        Guid ambienteId,
        string fechaStr,
        string horaInicioStr,
        string horaFinStr,
        Guid? excluirReservaId = null,
        CancellationToken cancellationToken = default);

    Task<Result<ReservaResponseDto>> RegistrarReservaAsync(
        CrearReservaDto dto,
        string? rolActor = null,
        CancellationToken cancellationToken = default);

    Task<Result<ReservaResponseDto>> CambiarEstadoAsync(
        Guid id,
        CambiarEstadoReservaDto dto,
        Guid? usuarioActorId = null,
        CancellationToken cancellationToken = default);
}
