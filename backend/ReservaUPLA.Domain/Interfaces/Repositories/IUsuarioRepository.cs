using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Domain.Interfaces.Repositories;

public interface IUsuarioRepository
{
    Task<List<Usuario>> ListarConReservasAsync(CancellationToken cancellationToken = default);
    Task<Usuario?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> ExisteCorreoAsync(string correoNormalizado, CancellationToken cancellationToken = default);
    Task AgregarAsync(Usuario usuario, CancellationToken cancellationToken = default);
    Task GuardarCambiosAsync(CancellationToken cancellationToken = default);
}
