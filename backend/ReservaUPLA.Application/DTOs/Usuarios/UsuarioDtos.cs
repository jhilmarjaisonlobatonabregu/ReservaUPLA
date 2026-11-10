namespace ReservaUPLA.Application.DTOs.Usuarios;

public record UsuarioResponseDto(
    Guid Id,
    string NombreCompleto,
    string Correo,
    string Rol,
    bool Activo,
    int TotalReservas
);

public record CrearUsuarioDto(
    string NombreCompleto,
    string Correo,
    string Rol,
    bool Activo = true
);
