using ReservaUPLA.Application.Common;
using ReservaUPLA.Application.DTOs.Reservas;
using ReservaUPLA.Domain.Common;

namespace ReservaUPLA.Application.Validators;

public record ValidacionEstado(List<string> Errores, ResultErrorCode Codigo);

public static class ReservaValidator
{
    /// <summary>
    /// Valida RN-02 (datos obligatorios), RN-03 (HoraFin > HoraInicio) y RN-04 (07:00 a 22:00).
    /// </summary>
    public static List<string> ValidarSolicitud(
        CrearReservaDto dto,
        out DateOnly fecha,
        out TimeOnly horaInicio,
        out TimeOnly horaFin)
    {
        var errores = new List<string>();
        fecha = default;
        horaInicio = default;
        horaFin = default;

        // RN-02: Toda reserva debe tener fecha, hora de inicio, hora de fin, ambiente, solicitante y motivo.
        if (dto.UsuarioId == Guid.Empty)
        {
            errores.Add(MensajesCatalogo.RN02_SolicitanteObligatorio);
        }

        if (dto.AmbienteId == Guid.Empty)
        {
            errores.Add(MensajesCatalogo.RN02_AmbienteObligatorio);
        }

        if (string.IsNullOrWhiteSpace(dto.Motivo) || dto.Motivo.Trim().Length < 5)
        {
            errores.Add(MensajesCatalogo.RN02_MotivoObligatorio);
        }

        if (string.IsNullOrWhiteSpace(dto.Fecha) || !DateOnly.TryParse(dto.Fecha, out fecha))
        {
            errores.Add(MensajesCatalogo.RN02_FechaObligatoria);
        }

        var inicioValido = !string.IsNullOrWhiteSpace(dto.HoraInicio) && TimeOnly.TryParse(dto.HoraInicio, out horaInicio);
        var finValido = !string.IsNullOrWhiteSpace(dto.HoraFin) && TimeOnly.TryParse(dto.HoraFin, out horaFin);

        if (!inicioValido)
        {
            errores.Add(MensajesCatalogo.RN02_HoraInicioObligatoria);
        }

        if (!finValido)
        {
            errores.Add(MensajesCatalogo.RN02_HoraFinObligatoria);
        }

        if (inicioValido && finValido)
        {
            ValidarRangoHorario(horaInicio, horaFin, errores);
        }

        return errores;
    }

    /// <summary>
    /// Valida RN-03 (HoraFin > HoraInicio) y RN-04 (07:00 a 22:00).
    /// </summary>
    public static void ValidarRangoHorario(TimeOnly horaInicio, TimeOnly horaFin, List<string> errores)
    {
        // RN-03: La hora de fin debe ser mayor que la hora de inicio.
        if (horaFin <= horaInicio)
        {
            errores.Add(MensajesCatalogo.RN03_HoraFinMayor);
        }

        // RN-04: Las reservas solo pueden realizarse entre las 07:00 y las 22:00 horas.
        if (horaInicio < ReservaConstantes.HoraMinimaInstitucional ||
            horaFin > ReservaConstantes.HoraMaximaInstitucional)
        {
            errores.Add(MensajesCatalogo.RN04_HorarioInstitucional);
        }
    }

    /// <summary>
    /// Valida RN-05 (Solo el Administrador puede aprobar o rechazar), RN-06 (Una reserva rechazada no puede modificarse)
    /// y restricciones por actor (Responsable de ambiente es solo consulta).
    /// </summary>
    public static ValidacionEstado ValidarCambioEstado(string estadoActual, string nuevoEstado, string rolActor)
    {
        var errores = new List<string>();

        if (string.IsNullOrWhiteSpace(nuevoEstado) ||
            !ReservaConstantes.EstadosReservaPermitidos.Contains(nuevoEstado.Trim()))
        {
            errores.Add(MensajesCatalogo.EstadoReservaInvalido);
            return new ValidacionEstado(errores, ResultErrorCode.Validation);
        }

        // RN-06: Una reserva rechazada no puede modificarse.
        if (estadoActual.Equals(ReservaConstantes.ReservaRechazada, StringComparison.OrdinalIgnoreCase))
        {
            errores.Add(MensajesCatalogo.RN06_ReservaRechazadaInmutable);
            return new ValidacionEstado(errores, ResultErrorCode.Validation);
        }

        // Sección 4: Responsable de ambiente solo consulta el uso de los ambientes asignados.
        if (string.Equals(rolActor?.Trim(), ReservaConstantes.RolResponsableAmbiente, StringComparison.OrdinalIgnoreCase))
        {
            errores.Add(MensajesCatalogo.AccesoDenegadoResponsableCambiarEstado);
            return new ValidacionEstado(errores, ResultErrorCode.Forbidden);
        }

        // RN-05: Solo el Administrador puede aprobar o rechazar una reserva.
        var requiereAdmin = nuevoEstado.Equals(ReservaConstantes.ReservaAprobada, StringComparison.OrdinalIgnoreCase) ||
                            nuevoEstado.Equals(ReservaConstantes.ReservaRechazada, StringComparison.OrdinalIgnoreCase);

        if (requiereAdmin &&
            !string.Equals(rolActor?.Trim(), ReservaConstantes.RolAdministrador, StringComparison.OrdinalIgnoreCase))
        {
            errores.Add(MensajesCatalogo.RN05_SoloAdministradorApruebaRechaza);
            return new ValidacionEstado(errores, ResultErrorCode.Forbidden);
        }

        return new ValidacionEstado(errores, ResultErrorCode.Validation);
    }
}
