namespace ReservaUPLA.Domain.Common;

public static class ReservaConstantes
{
    public static readonly TimeOnly HoraMinimaInstitucional = new(7, 0);
    public static readonly TimeOnly HoraMaximaInstitucional = new(22, 0);

    public const string RolSolicitante = "Solicitante";
    public const string RolAdministrador = "Administrador";
    public const string RolResponsableAmbiente = "Responsable de ambiente";

    public const string AmbienteDisponible = "Disponible";
    public const string AmbienteMantenimiento = "Mantenimiento";
    public const string AmbienteInactivo = "Inactivo";

    public const string ReservaPendiente = "Pendiente";
    public const string ReservaAprobada = "Aprobada";
    public const string ReservaRechazada = "Rechazada";
    public const string ReservaCancelada = "Cancelada";

    public static readonly IReadOnlySet<string> RolesPermitidos = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        RolSolicitante,
        RolAdministrador,
        RolResponsableAmbiente
    };

    public static readonly IReadOnlySet<string> EstadosAmbientePermitidos = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        AmbienteDisponible,
        AmbienteMantenimiento,
        AmbienteInactivo
    };

    public static readonly IReadOnlySet<string> EstadosReservaPermitidos = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        ReservaPendiente,
        ReservaAprobada,
        ReservaRechazada,
        ReservaCancelada
    };
}
