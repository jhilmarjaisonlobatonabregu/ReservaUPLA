using ReservaUPLA.Domain.Common;

namespace ReservaUPLA.Domain.Helpers;

/// <summary>
/// Centraliza los métodos NormalizarEstado y NormalizarRol que antes estaban
/// duplicados en Reserva, Ambiente y Usuario (DRY — Fase 3).
/// </summary>
public static class DomainNormalizador
{
    public static string NormalizarEstadoReserva(string estado)
    {
        var v = estado?.Trim() ?? string.Empty;
        if (v.Equals(ReservaConstantes.ReservaAprobada,  StringComparison.OrdinalIgnoreCase)) return ReservaConstantes.ReservaAprobada;
        if (v.Equals(ReservaConstantes.ReservaRechazada, StringComparison.OrdinalIgnoreCase)) return ReservaConstantes.ReservaRechazada;
        if (v.Equals(ReservaConstantes.ReservaCancelada, StringComparison.OrdinalIgnoreCase)) return ReservaConstantes.ReservaCancelada;
        return ReservaConstantes.ReservaPendiente;
    }

    public static string NormalizarEstadoAmbiente(string estado)
    {
        var v = estado?.Trim() ?? string.Empty;
        if (v.Equals(ReservaConstantes.AmbienteMantenimiento, StringComparison.OrdinalIgnoreCase)) return ReservaConstantes.AmbienteMantenimiento;
        if (v.Equals(ReservaConstantes.AmbienteInactivo,      StringComparison.OrdinalIgnoreCase)) return ReservaConstantes.AmbienteInactivo;
        return ReservaConstantes.AmbienteDisponible;
    }

    public static string NormalizarRol(string rol)
    {
        var v = rol?.Trim() ?? string.Empty;
        if (v.Equals(ReservaConstantes.RolAdministrador,       StringComparison.OrdinalIgnoreCase)) return ReservaConstantes.RolAdministrador;
        if (v.Equals(ReservaConstantes.RolResponsableAmbiente, StringComparison.OrdinalIgnoreCase)) return ReservaConstantes.RolResponsableAmbiente;
        return ReservaConstantes.RolSolicitante;
    }
}
