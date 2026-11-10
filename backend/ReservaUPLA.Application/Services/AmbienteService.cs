using ReservaUPLA.Application.Common;
using ReservaUPLA.Application.DTOs.Ambientes;
using ReservaUPLA.Application.Interfaces.Services;
using ReservaUPLA.Application.Validators;
using ReservaUPLA.Domain.Common;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Domain.Interfaces.Repositories;

namespace ReservaUPLA.Application.Services;

public class AmbienteService : IAmbienteService
{
    private readonly IAmbienteRepository _ambienteRepository;

    public AmbienteService(IAmbienteRepository ambienteRepository)
    {
        _ambienteRepository = ambienteRepository;
    }

    public async Task<List<AmbienteResponseDto>> ListarAmbientesAsync(Guid? responsableId = null, CancellationToken cancellationToken = default)
    {
        List<Ambiente> ambientes;

        if (responsableId.HasValue && responsableId.Value != Guid.Empty)
        {
            // Responsable de ambiente: solo ve los ambientes asignados en AsignacionesResponsable
            ambientes = await _ambienteRepository.ListarPorResponsableAsync(responsableId.Value, cancellationToken);
        }
        else
        {
            // Administrador / Solicitante: lista completa
            ambientes = await _ambienteRepository.ListarConReservasAsync(cancellationToken);
        }

        return ambientes
            .Select(MapearADto)
            .ToList();
    }

    public async Task<Result<AmbienteResponseDto>> RegistrarAmbienteAsync(
        CrearAmbienteDto dto,
        string? rolActor = null,
        CancellationToken cancellationToken = default)
    {
        if (!string.Equals(rolActor?.Trim(), ReservaConstantes.RolAdministrador, StringComparison.OrdinalIgnoreCase))
        {
            return Result<AmbienteResponseDto>.Fallido(MensajesCatalogo.AccesoDenegadoSoloAdminAmbientes, errorCode: ResultErrorCode.Forbidden);
        }

        var errores = AmbienteValidator.ValidarCreacion(dto);
        if (errores.Count > 0)
        {
            return Result<AmbienteResponseDto>.Fallido(errores[0], errores, ResultErrorCode.Validation);
        }

        var nombreNormalizado = dto.Nombre.Trim();
        if (await _ambienteRepository.ExisteNombreAsync(nombreNormalizado, cancellationToken))
        {
            return Result<AmbienteResponseDto>.Fallido(MensajesCatalogo.AmbienteNombreDuplicado, errorCode: ResultErrorCode.Conflict);
        }

        var nuevoAmbiente = new Ambiente(
            nombreNormalizado,
            dto.Tipo,
            dto.Capacidad,
            dto.Ubicacion,
            dto.Estado
        );

        await _ambienteRepository.AgregarAsync(nuevoAmbiente, cancellationToken);
        await _ambienteRepository.GuardarCambiosAsync(cancellationToken);

        return Result<AmbienteResponseDto>.Exitoso(
            MapearADto(nuevoAmbiente),
            MensajesCatalogo.AmbienteRegistradoExito
        );
    }

    private static AmbienteResponseDto MapearADto(Ambiente a) =>
        new(
            a.Id,
            a.Nombre,
            a.Tipo,
            a.Capacidad,
            a.Ubicacion,
            a.Estado,
            a.Reservas?.Count(r => r.Estado == ReservaConstantes.ReservaAprobada) ?? 0
        );
}
