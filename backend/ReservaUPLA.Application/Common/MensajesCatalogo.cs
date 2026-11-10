namespace ReservaUPLA.Application.Common;

public static class MensajesCatalogo
{
    // Reglas de Negocio con diagnóstico claro y acción constructiva de recuperación (Heurística 9 de Nielsen)
    public const string RN01_ConflictoHorario = "El ambiente '{0}' ya cuenta con una reserva aprobada de {1} a {2} h el {3}. Seleccione otro bloque horario libre o elija otro ambiente disponible.";
    public const string RN02_SolicitanteObligatorio = "Falta indicar el solicitante de la reserva. Seleccione un usuario activo de la lista.";
    public const string RN02_AmbienteObligatorio = "Falta elegir el ambiente universitario. Seleccione un laboratorio, auditorio o aula disponible.";
    public const string RN02_MotivoObligatorio = "El motivo académico o administrativo es obligatorio. Describa brevemente la actividad a realizar (mínimo 5 caracteres).";
    public const string RN02_FechaObligatoria = "La fecha de reserva es obligatoria. Seleccione una fecha válida en el calendario.";
    public const string RN02_HoraInicioObligatoria = "La hora de inicio es obligatoria. Indique una hora entre las 07:00 y las 22:00 h.";
    public const string RN02_HoraFinObligatoria = "La hora de fin es obligatoria. Indique una hora posterior a la de inicio (hasta las 22:00 h).";
    public const string RN03_HoraFinMayor = "La hora de fin debe ser posterior a la hora de inicio. Seleccione una hora de término mayor o utilice uno de los atajos de bloques académicos.";
    public const string RN04_HorarioInstitucional = "El horario elegido está fuera del horario hábil institucional. Programe su reserva únicamente entre las 07:00 y las 22:00 horas.";
    public const string RN05_SoloAdministradorApruebaRechaza = "Solo el perfil Administrador puede aprobar o rechazar solicitudes de reserva. Inicie sesión como Administrador para realizar esta acción.";
    public const string RN06_ReservaRechazadaInmutable = "Esta solicitud ya fue rechazada anteriormente y su estado es definitivo. Si necesita el ambiente, registre una nueva solicitud de reserva en un horario disponible.";

    // Seguridad de Roles por Actor con guía de recuperación
    public const string AccesoDenegadoSoloAdminAmbientes = "Solo el perfil Administrador está autorizado para registrar nuevos ambientes universitarios. Consulte el catálogo actual o contacte al Administrador.";
    public const string AccesoDenegadoSoloAdminUsuarios = "Solo el perfil Administrador está autorizado para registrar nuevos usuarios en el padrón institucional.";
    public const string AccesoDenegadoResponsableCrearReserva = "El perfil Responsable de ambiente está dedicado a la supervisión de aforo y agenda. Para solicitar un ambiente, inicie sesión con una cuenta de Solicitante o Administrador.";
    public const string AccesoDenegadoResponsableCambiarEstado = "El perfil Responsable de ambiente solo dispone de permisos de supervisión y consulta de agenda.";
    public const string AccesoDenegadoSolicitanteCancelarAjena = "Únicamente puede cancelar las solicitudes registradas con su propia cuenta institucional.";

    // Mensajes de Dominio
    public const string UsuarioRegistradoExito = "El usuario fue registrado correctamente en el padrón institucional.";
    public const string UsuarioCorreoDuplicado = "Ya existe una cuenta registrada con ese correo institucional. Ingrese un correo diferente o búsquelo en el padrón actual.";
    public const string AmbienteRegistradoExito = "El ambiente universitario fue incorporado correctamente al catálogo.";
    public const string AmbienteNombreDuplicado = "Ya existe un ambiente universitario registrado con ese nombre. Indique un código o número de aula distinto (ej. L-302).";
    public const string ReservaRegistradaExito = "Su solicitud de reserva fue registrada correctamente en estado Pendiente.";
    public const string ReservaNoEncontrada = "No se encontró la solicitud de reserva seleccionada. Actualice la tabla para sincronizar el listado.";

    // Mensajes de validación de ambiente (Fase 3 — centralizados)
    public const string AmbienteNombreMinimo = "El nombre del ambiente es obligatorio y debe tener al menos 3 caracteres.";
    public const string AmbienteTipoObligatorio = "El tipo de ambiente universitario es obligatorio.";
    public const string AmbienteCapacidadInvalida = "La capacidad del ambiente debe ser un número entero entre 1 y 2000.";
    public const string AmbienteUbicacionObligatoria = "La ubicación física (pabellón/piso) es obligatoria.";
    public const string AmbienteEstadoInvalido = "El estado del ambiente debe ser Disponible, Mantenimiento o Inactivo.";
    public const string AmbienteNoExiste = "El ambiente universitario seleccionado no existe.";
    public const string AmbienteNoDisponible = "El ambiente '{0}' se encuentra en estado '{1}' y no puede reservarse.";

    // Mensajes de validación de usuario (Fase 3 — centralizados)
    public const string UsuarioNombreMinimo = "El nombre completo es obligatorio y debe tener al menos 3 caracteres.";
    public const string UsuarioCorreoInvalido = "Debe ingresar un correo electrónico institucional o válido.";
    public const string UsuarioRolInvalido = "El rol seleccionado no es válido. Use: Solicitante, Administrador o Responsable de ambiente.";
    public const string UsuarioNoEncontrado = "El solicitante seleccionado no existe o se encuentra inactivo.";

    // Mensajes de validación de horario en disponibilidad (Fase 3 — centralizados)
    public const string DisponibilidadParametrosInvalidos = "Debe especificar fecha, hora de inicio y hora de fin válidas para verificar disponibilidad.";
    public const string EstadoReservaInvalido = "El estado solicitado no es válido (Pendiente, Aprobada, Rechazada, Cancelada).";

    // Errores de base de datos con causa identificable (Fase 1)
    public const string RN01_ConflictoHorarioConcurrente = "Otra aprobación acaba de ocupar ese horario en este ambiente. Actualice el listado y elija otro bloque libre.";
    public const string RegistroDuplicado = "Ya existe un registro con esos datos. Verifique el correo o el nombre ingresado e inténtelo nuevamente.";

    // Mensajes con marcadores de posición — servicios de reserva (Fase 4)
    public const string ReservaEstadoActualizado = "El estado de la reserva fue actualizado a '{0}'.";
    public const string AmbienteNoDisponibleOperativo = "Ambiente no disponible por estado operativo.";
    public const string DisponibilidadLibre = "El ambiente '{0}' está libre el {1} de {2} a {3} h. Puede continuar con el registro de su solicitud.";
    public const string DisponibilidadOcupado = "El ambiente '{0}' ya cuenta con una reserva aprobada de {1} a {2} h el {3}. Seleccione otro bloque horario u otro ambiente disponible.";
}
