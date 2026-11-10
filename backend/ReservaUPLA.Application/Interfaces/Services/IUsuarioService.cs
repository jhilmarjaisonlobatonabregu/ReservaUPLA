using ReservaUPLA.Application.Common;
using ReservaUPLA.Application.DTOs.Usuarios;

namespace ReservaUPLA.Application.Interfaces.Services;

public interface IUsuarioService
{
    Task<List<UsuarioResponseDto>> ListarUsuariosAsync(CancellationToken cancellationToken = default);
    Task<Result<UsuarioResponseDto>> RegistrarUsuarioAsync(
        CrearUsuarioDto dto,
        string? rolActor = null,
        CancellationToken cancellationToken = default);
}
