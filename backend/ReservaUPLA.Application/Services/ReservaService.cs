using ReservaUPLA.Application.Common;
using ReservaUPLA.Application.DTOs.Reservas;
using ReservaUPLA.Application.Interfaces.Services;
using ReservaUPLA.Application.Validators;
using ReservaUPLA.Domain.Common;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Domain.Interfaces.Repositories;

namespace ReservaUPLA.Application.Services;

public class ReservaService : IReservaService
{
    private readonly IReservaRepository _reservaRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IAmbienteRepository _ambienteRepository;

    public ReservaService(
        IReservaRepository reservaRepository,
        IUsuarioRepository usuarioRepository,
        IAmbienteRepository ambienteRepository)
    {
        _reservaRepository = reservaRepository;
        _usuarioRepository = usuarioRepository;
        _ambienteRepository = ambienteRepository;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RF-05: Listar reservas con filtros opcionales
    // ─────────────────────────────────────────────────────────────────────────
    public async Task<List<ReservaResponseDto>> ListarReservasAsync(
        Guid? ambienteId = null,
        string? estado = null,
        string? fecha = null,
        Guid? usuarioId = null,
        CancellationToken cancellationToken = default)
    {
        DateOnly? fechaFiltro = null;
        if (!string.IsNullOrWhiteSpace(fecha) && DateOnly.TryParse(fecha, out var parsedFecha))
            fechaFiltro = parsedFecha;

        var reservas = await _reservaRepository.ListarFiltradasAsync(
            ambienteId, estado, fechaFiltro, usuarioId, cancellationToken);

        return reservas.Select(MapearADto).ToList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RF-06: Obtener detalle de una reserva por ID
    // ─────────────────────────────────────────────────────────────────────────
    public async Task<Result<ReservaResponseDto>> ObtenerDetalleAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var reserva = await _reservaRepository.ObtenerPorIdConRelacionesAsync(id, cancellationToken);
        if (reserva is null)
            return Result<ReservaResponseDto>.Fallido(MensajesCatalogo.ReservaNoEncontrada, errorCode: ResultErrorCode.NotFound);

        return Result<ReservaResponseDto>.Exitoso(MapearADto(reserva));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RF-04: Consultar disponibilidad de un ambiente en fecha/horario
    // ─────────────────────────────────────────────────────────────────────────
    public async Task<Result<DisponibilidadResponseDto>> ValidarDisponibilidadAsync(
        Guid ambienteId,
        string fechaStr,
        string horaInicioStr,
        string horaFinStr,
        Guid? excluirReservaId = null,
        CancellationToken cancellationToken = default)
    {
        if (!DateOnly.TryParse(fechaStr, out var fecha) ||
            !TimeOnly.TryParse(horaInicioStr, out var horaInicio) ||
            !TimeOnly.TryParse(horaFinStr, out var horaFin))
        {
            return Result<DisponibilidadResponseDto>.Fallido(
                MensajesCatalogo.DisponibilidadParametrosInvalidos,
                errorCode: ResultErrorCode.Validation);
        }

        var erroresHorario = new List<string>();
        ReservaValidator.ValidarRangoHorario(horaInicio, horaFin, erroresHorario);
        if (erroresHorario.Count > 0)
            return Result<DisponibilidadResponseDto>.Fallido(erroresHorario[0], erroresHorario, ResultErrorCode.Validation);

        var ambiente = await _ambienteRepository.ObtenerPorIdAsync(ambienteId, cancellationToken);
        if (ambiente is null)
            return Result<DisponibilidadResponseDto>.Fallido(MensajesCatalogo.AmbienteNoExiste, errorCode: ResultErrorCode.NotFound);

        if (!ambiente.EstaDisponibleParaReserva())
        {
            return Result<DisponibilidadResponseDto>.Exitoso(
                new DisponibilidadResponseDto(
                    false,
                    string.Format(MensajesCatalogo.AmbienteNoDisponible, ambiente.Nombre, ambiente.Estado),
                    new List<ReservaConflictoDto>()),
                MensajesCatalogo.AmbienteNoDisponibleOperativo);
        }

        var conflictosEntidad = await _reservaRepository.ObtenerConflictosAprobadosAsync(
            ambienteId, fecha, horaInicio, horaFin, excluirReservaId, cancellationToken);

        var conflictos = conflictosEntidad
            .Select(r => new ReservaConflictoDto(
                r.Id,
                r.HoraInicio.ToString("HH:mm"),
                r.HoraFin.ToString("HH:mm"),
                r.Estado,
                r.Usuario?.NombreCompleto ?? "Solicitante",
                r.Motivo))
            .ToList();

        var disponible = conflictos.Count == 0;
        var mensaje = disponible
            ? string.Format(MensajesCatalogo.DisponibilidadLibre,
                ambiente.Nombre,
                fecha.ToString("dd/MM/yyyy"),
                horaInicio.ToString("HH:mm"),
                horaFin.ToString("HH:mm"))
            : string.Format(MensajesCatalogo.DisponibilidadOcupado,
                ambiente.Nombre,
                horaInicio.ToString("HH:mm"),
                horaFin.ToString("HH:mm"),
                fecha.ToString("dd/MM/yyyy"));

        return Result<DisponibilidadResponseDto>.Exitoso(
            new DisponibilidadResponseDto(disponible, mensaje, conflictos), mensaje);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RF-03: Registrar solicitud de reserva (Punto 1 — descompuesto en privados)
    // ─────────────────────────────────────────────────────────────────────────
    public async Task<Result<ReservaResponseDto>> RegistrarReservaAsync(
        CrearReservaDto dto,
        string? rolActor = null,
        CancellationToken cancellationToken = default)
    {
        // 1. Autorización por rol
        var errorRol = VerificarRolPermitidoParaCrear(rolActor);
        if (errorRol is not null) return errorRol;

        // 2. Validar datos del DTO (RN-02, RN-03, RN-04)
        var errores = ReservaValidator.ValidarSolicitud(dto, out var fecha, out var horaInicio, out var horaFin);
        if (errores.Count > 0)
            return Result<ReservaResponseDto>.Fallido(errores[0], errores, ResultErrorCode.Validation);

        // 3. Verificar que el solicitante exista, esté activo y tenga rol permitido
        var errorUsuario = await VerificarSolicitanteAsync(dto.UsuarioId, cancellationToken);
        if (errorUsuario.error is not null) return errorUsuario.error;
        var usuario = errorUsuario.usuario!;

        // 4. Verificar que el ambiente exista y esté disponible operativamente
        var errorAmbiente = await VerificarAmbienteDisponibleAsync(dto.AmbienteId, cancellationToken);
        if (errorAmbiente.error is not null) return errorAmbiente.error;
        var ambiente = errorAmbiente.ambiente!;

        // 5. Comprobar conflicto de horario (RN-01)
        var errorConflicto = await ComprobarConflictoHorarioAsync(
            dto.AmbienteId, fecha, horaInicio, horaFin, null, ambiente.Nombre, cancellationToken);
        if (errorConflicto is not null) return errorConflicto;

        // 6. Guardar
        return await GuardarNuevaReservaAsync(fecha, horaInicio, horaFin, dto.Motivo, usuario, ambiente, cancellationToken);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RF-07/RF-08: Cambiar estado de reserva (Aprobar/Rechazar/Cancelar)
    // ─────────────────────────────────────────────────────────────────────────
    public async Task<Result<ReservaResponseDto>> CambiarEstadoAsync(
        Guid id,
        CambiarEstadoReservaDto dto,
        Guid? usuarioActorId = null,
        CancellationToken cancellationToken = default)
    {
        var reserva = await _reservaRepository.ObtenerPorIdConRelacionesAsync(id, cancellationToken);
        if (reserva is null)
            return Result<ReservaResponseDto>.Fallido(MensajesCatalogo.ReservaNoEncontrada, errorCode: ResultErrorCode.NotFound);

        // RN-05 Hardening: verificar rol real en BD al Aprobar o Rechazar
        var estadoSolicitado = Reserva.NormalizarEstado(dto.NuevoEstado);
        if (estadoSolicitado == ReservaConstantes.ReservaAprobada ||
            estadoSolicitado == ReservaConstantes.ReservaRechazada)
        {
            var errorAdmin = await VerificarActorEsAdminEnBdAsync(usuarioActorId, cancellationToken);
            if (errorAdmin is not null) return errorAdmin;
        }

        // Validaciones RN-05/RN-06/rol
        var validacion = ReservaValidator.ValidarCambioEstado(reserva.Estado, dto.NuevoEstado, dto.RolActor);
        if (validacion.Errores.Count > 0)
            return Result<ReservaResponseDto>.Fallido(validacion.Errores[0], validacion.Errores, validacion.Codigo);

        // Solicitante solo puede cancelar su propia reserva
        if (string.Equals(dto.RolActor?.Trim(), ReservaConstantes.RolSolicitante, StringComparison.OrdinalIgnoreCase) &&
            usuarioActorId.HasValue && usuarioActorId.Value != Guid.Empty &&
            reserva.UsuarioId != usuarioActorId.Value)
        {
            return Result<ReservaResponseDto>.Fallido(
                MensajesCatalogo.AccesoDenegadoSolicitanteCancelarAjena, errorCode: ResultErrorCode.Forbidden);
        }

        var estadoNormalizado = Reserva.NormalizarEstado(dto.NuevoEstado);

        // RN-01: Al aprobar, verificar ausencia de conflictos
        if (estadoNormalizado == ReservaConstantes.ReservaAprobada)
        {
            var errorConflicto = await ComprobarConflictoHorarioAsync(
                reserva.AmbienteId, reserva.Fecha, reserva.HoraInicio, reserva.HoraFin,
                reserva.Id, reserva.Ambiente?.Nombre ?? string.Empty, cancellationToken);
            if (errorConflicto is not null) return errorConflicto;
        }

        reserva.ActualizarEstado(estadoNormalizado);
        await _reservaRepository.ActualizarAsync(reserva, cancellationToken);
        await _reservaRepository.GuardarCambiosAsync(cancellationToken);

        return Result<ReservaResponseDto>.Exitoso(
            MapearADto(reserva),
            string.Format(MensajesCatalogo.ReservaEstadoActualizado, estadoNormalizado));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Métodos privados de responsabilidad única (Punto 1)
    // ─────────────────────────────────────────────────────────────────────────

    /// <summary>Verifica que el rol del actor permita crear reservas.</summary>
    private static Result<ReservaResponseDto>? VerificarRolPermitidoParaCrear(string? rolActor)
    {
        if (string.Equals(rolActor?.Trim(), ReservaConstantes.RolResponsableAmbiente, StringComparison.OrdinalIgnoreCase))
            return Result<ReservaResponseDto>.Fallido(MensajesCatalogo.AccesoDenegadoResponsableCrearReserva, errorCode: ResultErrorCode.Forbidden);
        return null;
    }

    /// <summary>Verifica que el solicitante exista, esté activo y tenga rol permitido para reservar.</summary>
    private async Task<(Result<ReservaResponseDto>? error, Usuario? usuario)> VerificarSolicitanteAsync(
        Guid usuarioId, CancellationToken ct)
    {
        var usuario = await _usuarioRepository.ObtenerPorIdAsync(usuarioId, ct);
        if (usuario is null || !usuario.Activo)
            return (Result<ReservaResponseDto>.Fallido(MensajesCatalogo.UsuarioNoEncontrado, errorCode: ResultErrorCode.NotFound), null);

        if (string.Equals(usuario.Rol, ReservaConstantes.RolResponsableAmbiente, StringComparison.OrdinalIgnoreCase))
            return (Result<ReservaResponseDto>.Fallido(MensajesCatalogo.AccesoDenegadoResponsableCrearReserva, errorCode: ResultErrorCode.Forbidden), null);

        return (null, usuario);
    }

    /// <summary>Verifica que el ambiente exista y esté operativamente disponible para reservar.</summary>
    private async Task<(Result<ReservaResponseDto>? error, Ambiente? ambiente)> VerificarAmbienteDisponibleAsync(
        Guid ambienteId, CancellationToken ct)
    {
        var ambiente = await _ambienteRepository.ObtenerPorIdAsync(ambienteId, ct);
        if (ambiente is null)
            return (Result<ReservaResponseDto>.Fallido(MensajesCatalogo.AmbienteNoExiste, errorCode: ResultErrorCode.NotFound), null);

        if (!ambiente.EstaDisponibleParaReserva())
            return (Result<ReservaResponseDto>.Fallido(
                string.Format(MensajesCatalogo.AmbienteNoDisponible, ambiente.Nombre, ambiente.Estado),
                errorCode: ResultErrorCode.Validation), null);

        return (null, ambiente);
    }

    /// <summary>Comprueba que no exista solapamiento horario con una reserva Aprobada (RN-01).</summary>
    private async Task<Result<ReservaResponseDto>?> ComprobarConflictoHorarioAsync(
        Guid ambienteId, DateOnly fecha, TimeOnly horaInicio, TimeOnly horaFin,
        Guid? excluirId, string nombreAmbiente, CancellationToken ct)
    {
        var conflictos = await _reservaRepository.ObtenerConflictosAprobadosAsync(
            ambienteId, fecha, horaInicio, horaFin, excluirId, ct);

        var primero = conflictos.FirstOrDefault();
        if (primero is null) return null;

        return Result<ReservaResponseDto>.Fallido(
            string.Format(MensajesCatalogo.RN01_ConflictoHorario,
                nombreAmbiente,
                primero.HoraInicio.ToString("HH:mm"),
                primero.HoraFin.ToString("HH:mm"),
                fecha.ToString("dd/MM/yyyy")),
            errorCode: ResultErrorCode.Conflict);
    }

    /// <summary>Persiste la nueva reserva en repositorio.</summary>
    private async Task<Result<ReservaResponseDto>> GuardarNuevaReservaAsync(
        DateOnly fecha, TimeOnly horaInicio, TimeOnly horaFin,
        string motivo, Usuario usuario, Ambiente ambiente, CancellationToken ct)
    {
        var nuevaReserva = new Reserva(fecha, horaInicio, horaFin, motivo, usuario.Id, ambiente.Id)
        {
            Usuario = usuario,
            Ambiente = ambiente
        };

        await _reservaRepository.AgregarAsync(nuevaReserva, ct);
        await _reservaRepository.GuardarCambiosAsync(ct);

        return Result<ReservaResponseDto>.Exitoso(MapearADto(nuevaReserva), MensajesCatalogo.ReservaRegistradaExito);
    }

    /// <summary>Verifica en BD que el actor exista, esté activo y sea Administrador (RN-05 Hardening).</summary>
    private async Task<Result<ReservaResponseDto>?> VerificarActorEsAdminEnBdAsync(
        Guid? actorId, CancellationToken ct)
    {
        if (!actorId.HasValue || actorId.Value == Guid.Empty)
            return Result<ReservaResponseDto>.Fallido(
                MensajesCatalogo.RN05_SoloAdministradorApruebaRechaza, errorCode: ResultErrorCode.Forbidden);

        var actor = await _usuarioRepository.ObtenerPorIdAsync(actorId.Value, ct);
        if (actor is null || !actor.Activo ||
            !string.Equals(actor.Rol, ReservaConstantes.RolAdministrador, StringComparison.OrdinalIgnoreCase))
        {
            return Result<ReservaResponseDto>.Fallido(
                MensajesCatalogo.RN05_SoloAdministradorApruebaRechaza, errorCode: ResultErrorCode.Forbidden);
        }

        return null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Mapeador
    // ─────────────────────────────────────────────────────────────────────────
    public static ReservaResponseDto MapearADto(Reserva r) =>
        new(
            r.Id,
            r.Fecha.ToString("yyyy-MM-dd"),
            r.HoraInicio.ToString("HH:mm"),
            r.HoraFin.ToString("HH:mm"),
            r.Motivo,
            r.Estado,
            r.UsuarioId,
            r.Usuario?.NombreCompleto ?? "Sin asignar",
            r.Usuario?.Correo ?? string.Empty,
            r.Usuario?.Rol ?? ReservaConstantes.RolSolicitante,
            r.AmbienteId,
            r.Ambiente?.Nombre ?? "Sin ambiente",
            r.Ambiente?.Tipo ?? string.Empty,
            r.Ambiente?.Capacidad ?? 0,
            r.Ambiente?.Ubicacion ?? string.Empty
        );
}
