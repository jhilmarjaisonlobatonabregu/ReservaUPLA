using ReservaUPLA.Domain.Common;
using ReservaUPLA.Domain.Helpers;

namespace ReservaUPLA.Domain.Entities;

public class Usuario
{
    public Guid Id { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Rol { get; set; } = ReservaConstantes.RolSolicitante;
    public bool Activo { get; set; } = true;

    public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();

    public Usuario() { }

    public Usuario(string nombreCompleto, string correo, string rol, bool activo = true)
    {
        Id = Guid.NewGuid();
        NombreCompleto = nombreCompleto.Trim();
        Correo = correo.Trim().ToLowerInvariant();
        Rol = NormalizarRol(rol);
        Activo = activo;
    }

    public static string NormalizarRol(string rol) =>
        DomainNormalizador.NormalizarRol(rol);
}
