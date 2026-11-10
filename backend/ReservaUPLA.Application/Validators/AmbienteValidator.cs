using ReservaUPLA.Application.Common;
using ReservaUPLA.Application.DTOs.Ambientes;
using ReservaUPLA.Domain.Common;

namespace ReservaUPLA.Application.Validators;

public static class AmbienteValidator
{
    public static List<string> ValidarCreacion(CrearAmbienteDto dto)
    {
        var errores = new List<string>();

        if (string.IsNullOrWhiteSpace(dto.Nombre) || dto.Nombre.Trim().Length < 3)
            errores.Add(MensajesCatalogo.AmbienteNombreMinimo);

        if (string.IsNullOrWhiteSpace(dto.Tipo))
            errores.Add(MensajesCatalogo.AmbienteTipoObligatorio);

        if (dto.Capacidad <= 0 || dto.Capacidad > 2000)
            errores.Add(MensajesCatalogo.AmbienteCapacidadInvalida);

        if (string.IsNullOrWhiteSpace(dto.Ubicacion))
            errores.Add(MensajesCatalogo.AmbienteUbicacionObligatoria);

        if (string.IsNullOrWhiteSpace(dto.Estado) || !ReservaConstantes.EstadosAmbientePermitidos.Contains(dto.Estado.Trim()))
            errores.Add(MensajesCatalogo.AmbienteEstadoInvalido);

        return errores;
    }
}
