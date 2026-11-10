using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Domain.Interfaces.Repositories;

public interface IAmbienteRepository
{
    Task<List<Ambiente>> ListarConReservasAsync(CancellationToken cancellationToken = default);
    Task<List<Ambiente>> ListarTodosAsync(CancellationToken cancellationToken = default);
    /// <summary>Devuelve solo los ambientes asignados al Responsable indicado (tabla AsignacionesResponsable).</summary>
    Task<List<Ambiente>> ListarPorResponsableAsync(Guid responsableId, CancellationToken cancellationToken = default);
    Task<Ambiente?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> ExisteNombreAsync(string nombreNormalizado, CancellationToken cancellationToken = default);
    Task AgregarAsync(Ambiente ambiente, CancellationToken cancellationToken = default);
    Task GuardarCambiosAsync(CancellationToken cancellationToken = default);
}
