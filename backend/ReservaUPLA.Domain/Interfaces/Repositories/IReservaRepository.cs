using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Domain.Interfaces.Repositories;

public interface IReservaRepository
{
    Task<List<Reserva>> ListarFiltradasAsync(
        Guid? ambienteId = null,
        string? estado = null,
        DateOnly? fecha = null,
        Guid? usuarioId = null,
        CancellationToken cancellationToken = default);

    Task<List<Reserva>> ListarTodasConRelacionesAsync(CancellationToken cancellationToken = default);

    Task<Reserva?> ObtenerPorIdConRelacionesAsync(Guid id, CancellationToken cancellationToken = default);

    Task<List<Reserva>> ObtenerConflictosAprobadosAsync(
        Guid ambienteId,
        DateOnly fecha,
        TimeOnly horaInicio,
        TimeOnly horaFin,
        Guid? excluirReservaId = null,
        CancellationToken cancellationToken = default);

    Task AgregarAsync(Reserva reserva, CancellationToken cancellationToken = default);
    Task ActualizarAsync(Reserva reserva, CancellationToken cancellationToken = default);
    Task GuardarCambiosAsync(CancellationToken cancellationToken = default);
}
