using ReservaUPLA.Application.Common;
using ReservaUPLA.Application.DTOs.Usuarios;
using ReservaUPLA.Application.Interfaces.Services;
using ReservaUPLA.Application.Validators;
using ReservaUPLA.Domain.Common;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Domain.Interfaces.Repositories;

namespace ReservaUPLA.Application.Services;

public class UsuarioService : IUsuarioService
{
    private readonly IUsuarioRepository _usuarioRepository;

    public UsuarioService(IUsuarioRepository usuarioRepository)
    {
        _usuarioRepository = usuarioRepository;
    }

    public async Task<List<UsuarioResponseDto>> ListarUsuariosAsync(CancellationToken cancellationToken = default)
    {
        var usuarios = await _usuarioRepository.ListarConReservasAsync(cancellationToken);

        return usuarios
            .Select(MapearADto)
            .ToList();
    }

    public async Task<Result<UsuarioResponseDto>> RegistrarUsuarioAsync(
        CrearUsuarioDto dto,
        string? rolActor = null,
        CancellationToken cancellationToken = default)
    {
        if (!string.Equals(rolActor?.Trim(), ReservaConstantes.RolAdministrador, StringComparison.OrdinalIgnoreCase))
        {
            return Result<UsuarioResponseDto>.Fallido(MensajesCatalogo.AccesoDenegadoSoloAdminUsuarios, errorCode: ResultErrorCode.Forbidden);
        }

        var errores = UsuarioValidator.ValidarCreacion(dto);
        if (errores.Count > 0)
        {
            return Result<UsuarioResponseDto>.Fallido(errores[0], errores, ResultErrorCode.Validation);
        }

        var correoNormalizado = dto.Correo.Trim().ToLowerInvariant();
        if (await _usuarioRepository.ExisteCorreoAsync(correoNormalizado, cancellationToken))
        {
            return Result<UsuarioResponseDto>.Fallido(MensajesCatalogo.UsuarioCorreoDuplicado, errorCode: ResultErrorCode.Conflict);
        }

        var nuevoUsuario = new Usuario(dto.NombreCompleto, correoNormalizado, dto.Rol, dto.Activo);
        await _usuarioRepository.AgregarAsync(nuevoUsuario, cancellationToken);
        await _usuarioRepository.GuardarCambiosAsync(cancellationToken);

        return Result<UsuarioResponseDto>.Exitoso(
            MapearADto(nuevoUsuario),
            MensajesCatalogo.UsuarioRegistradoExito
        );
    }

    private static UsuarioResponseDto MapearADto(Usuario u) =>
        new(
            u.Id,
            u.NombreCompleto,
            u.Correo,
            u.Rol,
            u.Activo,
            u.Reservas?.Count ?? 0
        );
}
