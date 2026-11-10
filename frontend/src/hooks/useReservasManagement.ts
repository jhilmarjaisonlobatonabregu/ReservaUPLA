import { useCallback, useEffect, useMemo, useState } from 'react';
import { ambienteService, reservaService, usuarioService } from '../services';
import type {
  Ambiente,
  FeedbackAlert,
  Reserva,
  UserSession,
  Usuario
} from '../types';
import { useReservaEstado } from './useReservaEstado';
import { useReservaFiltros } from './useReservaFiltros';
import { useReservaFormulario } from './useReservaFormulario';

export function useReservasManagement(session: UserSession) {
  // ── Datos base ─────────────────────────────────────────────────────────────
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [reservasBase, setReservasBase] = useState<Reserva[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [alerta, setAlerta] = useState<FeedbackAlert | null>(null);
  const [reservaDetalle, setReservaDetalle] = useState<Reserva | null>(null);

  // ── Sub-hooks ───────────────────────────────────────────────────────────────
  const filtros = useReservaFiltros();

  // cargarDatos se declara a continuación; se pasa como callback estable
  // usando una ref intermedia para romper la dependencia circular.
  const cargarDatosRef = useCallback(
    async () => {
      /* stub — se sobreescribe en el useEffect de más abajo */
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const formulario = useReservaFormulario({
    session,
    ambientes,
    cargarDatos: cargarDatosRef,
    setAlerta,
    setIsModalOpen
  });

  const estadoHook = useReservaEstado({
    rolActivo: session.rol,
    cargarDatos: cargarDatosRef,
    setAlerta
  });

  // ── Carga de datos ──────────────────────────────────────────────────────────
  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    try {
      const [listaUsuarios, listaAmbientes, listaReservas] = await Promise.all([
        usuarioService.listarUsuarios(),
        ambienteService.listarAmbientes(),
        reservaService.listarReservas({
          ambienteId: filtros.filtroAmbienteId || undefined,
          estado: filtros.filtroEstado,
          fecha: filtros.filtroFecha || undefined,
          usuarioId: session.rol === 'Solicitante' ? session.id : undefined
        })
      ]);

      setUsuarios(listaUsuarios);
      setAmbientes(listaAmbientes);
      setReservasBase(listaReservas);

      // Inicializa usuarioId según rol
      if (session.rol === 'Solicitante') {
        formulario.setUsuarioId(session.id);
      } else if (listaUsuarios.length > 0 && !formulario.usuarioId) {
        const existeSesion = listaUsuarios.some((u) => u.id === session.id && u.activo);
        if (existeSesion) {
          formulario.setUsuarioId(session.id);
        } else {
          const solicitanteDefault =
            listaUsuarios.find((u) => u.rol === 'Solicitante' && u.activo) ??
            listaUsuarios[0];
          formulario.setUsuarioId(solicitanteDefault.id);
        }
      }

      // Inicializa ambienteId con el primer ambiente disponible
      if (!formulario.ambienteId && listaAmbientes.length > 0) {
        const ambienteDefault =
          listaAmbientes.find((a) => a.estado === 'Disponible') ?? listaAmbientes[0];
        formulario.setAmbienteId(ambienteDefault.id);
      }
    } catch (err) {
      setAlerta({
        type: 'error',
        title: 'Error de sincronización',
        message: err instanceof Error ? err.message : 'No se pudieron obtener las reservas.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    filtros.filtroAmbienteId,
    filtros.filtroEstado,
    filtros.filtroFecha,
    session.id,
    session.rol,
    formulario.usuarioId,
    formulario.ambienteId,
    formulario.setUsuarioId,
    formulario.setAmbienteId
  ]);

  // Actualiza la referencia estable que inyectaron los sub-hooks
  // (el useCallback de cargarDatosRef ya se ejecutó: sobreescribimos su closure)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (cargarDatosRef as any).current = cargarDatos;
  }, [cargarDatos, cargarDatosRef]);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  // ── Filtrado reactivo (NFD tolerante a tildes) ──────────────────────────────
  const reservas = useMemo(
    () => filtros.aplicarFiltroBusqueda(reservasBase),
    [filtros.aplicarFiltroBusqueda, reservasBase]
  );

  // ── Modal handlers ──────────────────────────────────────────────────────────
  const abrirModalReserva = () => {
    formulario.setErroresForm({});
    formulario.setDisponibilidadInfo(null);
    setIsModalOpen(true);
  };

  const cerrarModalReserva = () => {
    if (formulario.isSubmitting) return;
    formulario.setErroresForm({});
    formulario.setDisponibilidadInfo(null);
    setIsModalOpen(false);
  };

  // ── Return idéntico al original (ReservasPage.tsx no cambia su destructura) ─
  return {
    usuarios,
    ambientes,
    reservas,
    todasLasReservas: reservasBase,
    isLoading,
    isModalOpen,
    abrirModalReserva,
    cerrarModalReserva,
    filtroAmbienteId: filtros.filtroAmbienteId,
    setFiltroAmbienteId: filtros.setFiltroAmbienteId,
    filtroEstado: filtros.filtroEstado,
    setFiltroEstado: filtros.setFiltroEstado,
    filtroFecha: filtros.filtroFecha,
    setFiltroFecha: filtros.setFiltroFecha,
    filtroBusqueda: filtros.filtroBusqueda,
    setFiltroBusqueda: filtros.setFiltroBusqueda,
    limpiarFiltros: filtros.limpiarFiltros,
    limpiarFormulario: formulario.limpiarFormulario,
    aplicarBloqueHorarioRapido: formulario.aplicarBloqueHorarioRapido,
    usuarioId: formulario.usuarioId,
    setUsuarioId: formulario.setUsuarioId,
    ambienteId: formulario.ambienteId,
    setAmbienteId: formulario.setAmbienteId,
    fecha: formulario.fecha,
    setFecha: formulario.setFecha,
    horaInicio: formulario.horaInicio,
    setHoraInicio: formulario.setHoraInicio,
    horaFin: formulario.horaFin,
    setHoraFin: formulario.setHoraFin,
    motivo: formulario.motivo,
    setMotivo: formulario.setMotivo,
    erroresForm: formulario.erroresForm,
    setErroresForm: formulario.setErroresForm,
    isSubmitting: formulario.isSubmitting,
    isCheckingDisp: formulario.isCheckingDisp,
    alerta,
    setAlerta,
    disponibilidadInfo: formulario.disponibilidadInfo,
    setDisponibilidadInfo: formulario.setDisponibilidadInfo,
    reservaDetalle,
    setReservaDetalle,
    modalCambioEstado: estadoHook.modalCambioEstado,
    setModalCambioEstado: estadoHook.setModalCambioEstado,
    isChangingStatus: estadoHook.isChangingStatus,
    handleVerificarDisponibilidad: formulario.handleVerificarDisponibilidad,
    handleRegistrarReserva: formulario.handleRegistrarReserva,
    handleConfirmarCambioEstado: estadoHook.handleConfirmarCambioEstado
  };
}
