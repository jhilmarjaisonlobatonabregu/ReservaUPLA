using ReservaUPLA.Domain.Common;
using ReservaUPLA.Domain.Helpers;

namespace ReservaUPLA.Domain.Entities;

public class Reserva
{
    public Guid Id { get; set; }
    public DateOnly Fecha { get; set; }
    public TimeOnly HoraInicio { get; set; }
    public TimeOnly HoraFin { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string Estado { get; set; } = ReservaConstantes.ReservaPendiente;

    public Guid UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public Guid AmbienteId { get; set; }
    public Ambiente? Ambiente { get; set; }

    public Reserva() { }

    public Reserva(
        DateOnly fecha,
        TimeOnly horaInicio,
        TimeOnly horaFin,
        string motivo,
        Guid usuarioId,
        Guid ambienteId)
    {
        Id = Guid.NewGuid();
        Fecha = fecha;
        HoraInicio = horaInicio;
        HoraFin = horaFin;
        Motivo = motivo.Trim();
        Estado = ReservaConstantes.ReservaPendiente;
        UsuarioId = usuarioId;
        AmbienteId = ambienteId;
    }

    public bool EstaRechazada() =>
        Estado.Equals(ReservaConstantes.ReservaRechazada, StringComparison.OrdinalIgnoreCase);

    public bool SeCruzaCon(TimeOnly otroInicio, TimeOnly otroFin) =>
        HoraInicio < otroFin && HoraFin > otroInicio;

    public void ActualizarEstado(string nuevoEstado)
    {
        Estado = NormalizarEstado(nuevoEstado);
    }

    public static string NormalizarEstado(string estado) =>
        DomainNormalizador.NormalizarEstadoReserva(estado);
}
