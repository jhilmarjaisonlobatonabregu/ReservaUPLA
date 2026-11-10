using System.Text.RegularExpressions;
using ReservaUPLA.Application.Common;
using ReservaUPLA.Application.DTOs.Usuarios;
using ReservaUPLA.Domain.Common;

namespace ReservaUPLA.Application.Validators;

public static class UsuarioValidator
{
    public static List<string> ValidarCreacion(CrearUsuarioDto dto)
    {
        var errores = new List<string>();

        if (string.IsNullOrWhiteSpace(dto.NombreCompleto) || dto.NombreCompleto.Trim().Length < 3)
            errores.Add(MensajesCatalogo.UsuarioNombreMinimo);

        if (string.IsNullOrWhiteSpace(dto.Correo) ||
            !Regex.IsMatch(dto.Correo.Trim(), @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            errores.Add(MensajesCatalogo.UsuarioCorreoInvalido);

        if (string.IsNullOrWhiteSpace(dto.Rol) || !ReservaConstantes.RolesPermitidos.Contains(dto.Rol.Trim()))
            errores.Add(MensajesCatalogo.UsuarioRolInvalido);

        return errores;
    }
}
