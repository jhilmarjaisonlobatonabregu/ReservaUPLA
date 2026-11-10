using ReservaUPLA.Domain.Common;
using ReservaUPLA.Domain.Helpers;

namespace ReservaUPLA.Domain.Entities;

public class Ambiente
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public int Capacidad { get; set; }
    public string Ubicacion { get; set; } = string.Empty;
    public string Estado { get; set; } = ReservaConstantes.AmbienteDisponible;

    public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();

    public Ambiente() { }

    public Ambiente(string nombre, string tipo, int capacidad, string ubicacion, string estado = ReservaConstantes.AmbienteDisponible)
    {
        Id = Guid.NewGuid();
        Nombre = nombre.Trim();
        Tipo = tipo.Trim();
        Capacidad = capacidad;
        Ubicacion = ubicacion.Trim();
        Estado = NormalizarEstado(estado);
    }

    public bool EstaDisponibleParaReserva() =>
        Estado.Equals(ReservaConstantes.AmbienteDisponible, StringComparison.OrdinalIgnoreCase);

    public static string NormalizarEstado(string estado) =>
        DomainNormalizador.NormalizarEstadoAmbiente(estado);
}
