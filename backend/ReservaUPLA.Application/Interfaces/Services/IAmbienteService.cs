using ReservaUPLA.Application.Common;
using ReservaUPLA.Application.DTOs.Ambientes;

namespace ReservaUPLA.Application.Interfaces.Services;

public interface IAmbienteService
{
    Task<List<AmbienteResponseDto>> ListarAmbientesAsync(Guid? responsableId = null, CancellationToken cancellationToken = default);
    Task<Result<AmbienteResponseDto>> RegistrarAmbienteAsync(
        CrearAmbienteDto dto,
        string? rolActor = null,
        CancellationToken cancellationToken = default);
}
