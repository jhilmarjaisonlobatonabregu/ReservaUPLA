import type { DemoAccountOption, ModuloSistema, RolUsuario } from '../types';

export const HORA_MINIMA_INSTITUCIONAL = '07:00';
export const HORA_MAXIMA_INSTITUCIONAL = '22:00';

export const SESSION_STORAGE_KEY = 'reservaupla.session.v1';

export const DEFAULT_CONNECTION_ERROR_MESSAGE =
  'No se pudo establecer conexión con el servidor de ReservaUPLA. Verifique que la API esté en ejecución.';

export const MODULOS_PERMITIDOS_POR_ROL: Record<RolUsuario, ModuloSistema[]> = {
  Administrador: ['dashboard', 'reservas', 'ambientes', 'usuarios'],
  Solicitante: ['dashboard', 'reservas'],
  'Responsable de ambiente': ['dashboard', 'reservas', 'ambientes']
};

export const ROLES_DISPONIBLES: RolUsuario[] = [
  'Administrador',
  'Solicitante',
  'Responsable de ambiente'
];

export const DESCRIPCION_POR_ROL: Record<RolUsuario, string> = {
  Administrador:
    'Control total del sistema: gestión del padrón de usuarios, catálogo de ambientes universitarios y aprobación o rechazo de solicitudes.',
  Solicitante:
    'Panel personal de docente, estudiante o personal administrativo: registro de solicitudes propias, verificación de disponibilidad y seguimiento de estado.',
  'Responsable de ambiente':
    'Modo supervisión: consulta exclusiva de uso, ocupación, aforo y disponibilidad horaria de los ambientes universitarios asignados a su cargo.'
};

export const PERMISOS_RESUMEN_POR_ROL: Record<RolUsuario, string[]> = {
  Administrador: [
    'Aprobar y rechazar solicitudes de reserva',
    'Registrar nuevos ambientes universitarios',
    'Gestionar el padrón institucional de usuarios',
    'Acceso global a indicadores de ocupación'
  ],
  Solicitante: [
    'Registrar solicitudes de reserva propias',
    'Validar disponibilidad horaria de ambientes',
    'Consultar el estado de mis solicitudes',
    'Cancelar mis solicitudes pendientes'
  ],
  'Responsable de ambiente': [
    'Consultar ocupación por ambiente asignado',
    'Verificar disponibilidad horaria en vivo',
    'Supervisar agenda programada de ambientes',
    'Acceso de consulta y supervisión operativa'
  ]
};

export const CREDENCIAL_DEMO_POR_ROL: Record<RolUsuario, string> = {
  Administrador: 'AdminUPLA2026',
  Solicitante: 'DocenteUPLA2026',
  'Responsable de ambiente': 'Responsable2026'
};

export const CUENTAS_INSTITUCIONALES_DEMO: DemoAccountOption[] = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    nombreCompleto: 'Ing. Carlos Mendoza Quispe',
    correo: 'cmendoza@upla.edu.pe',
    claveAcceso: CREDENCIAL_DEMO_POR_ROL['Administrador'],
    rol: 'Administrador',
    cargo: 'Oficina de Infraestructura y Servicios Académicos — Campus Chorrillos',
    descripcionPermisos: 'Control total: gestión de usuarios, catálogo de ambientes y aprobación de reservas.'
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    nombreCompleto: 'Mg. Elena Rojas Huamán',
    correo: 'erojas@upla.edu.pe',
    claveAcceso: CREDENCIAL_DEMO_POR_ROL['Solicitante'],
    rol: 'Solicitante',
    cargo: 'Docente Principal — Facultad de Ingeniería de Sistemas y Computación',
    descripcionPermisos: 'Dashboard personal, registro de solicitudes propias y consulta de disponibilidad.'
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    nombreCompleto: 'Téc. Roberto Poma Gavilán',
    correo: 'rpoma@upla.edu.pe',
    claveAcceso: CREDENCIAL_DEMO_POR_ROL['Responsable de ambiente'],
    rol: 'Responsable de ambiente',
    cargo: 'Coordinación de Laboratorios de Cómputo — Pabellón G (Chorrillos)',
    descripcionPermisos: 'Consulta de uso, ocupación y disponibilidad de los ambientes asignados.'
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    nombreCompleto: 'Dr. Javier Cerrón Palomino',
    correo: 'jcerron@upla.edu.pe',
    claveAcceso: CREDENCIAL_DEMO_POR_ROL['Solicitante'],
    rol: 'Solicitante',
    cargo: 'Director de Investigación — Escuela de Posgrado UPLA',
    descripcionPermisos: 'Dashboard personal, registro de solicitudes propias y consulta de disponibilidad.'
  }
];

export const BLOQUES_HORARIOS_RAPIDOS: { label: string; inicio: string; fin: string }[] = [
  { label: '08:00 – 10:00', inicio: '08:00', fin: '10:00' },
  { label: '10:00 – 12:00', inicio: '10:00', fin: '12:00' },
  { label: '14:00 – 16:00', inicio: '14:00', fin: '16:00' },
  { label: '16:00 – 18:00', inicio: '16:00', fin: '18:00' },
  { label: '18:00 – 20:00', inicio: '18:00', fin: '20:00' }
];

export const TIPOS_AMBIENTE_UPLA: { value: string; label: string }[] = [
  { value: 'Laboratorio de Cómputo', label: 'Laboratorio de Cómputo' },
  { value: 'Auditorio', label: 'Auditorio Universitario' },
  { value: 'Sala de Reuniones', label: 'Sala de Reuniones / Grados' },
  { value: 'Aula Especial / Multimedia', label: 'Aula Especial / Multimedia' },
  { value: 'Sala de Conferencias', label: 'Sala de Conferencias' }
];

export const BREADCRUMB_POR_MODULO: Record<ModuloSistema, { section: string; page: string }> = {
  dashboard: {
    section: 'Monitoreo Académico',
    page: 'Dashboard de Indicadores y Ocupación'
  },
  reservas: {
    section: 'Operaciones de Reserva',
    page: 'Solicitudes, Disponibilidad y Estados'
  },
  ambientes: {
    section: 'Infraestructura Física',
    page: 'Catálogo de Ambientes Universitarios'
  },
  usuarios: {
    section: 'Administración',
    page: 'Padrón Institucional de Usuarios'
  }
};
