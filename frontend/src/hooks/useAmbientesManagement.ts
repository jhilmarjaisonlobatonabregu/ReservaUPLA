import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ambienteService } from '../services';
import type {
  Ambiente,
  ErroresFormularioAmbiente,
  EstadoAmbiente,
  FeedbackAlert
} from '../types';
import { validarFormularioAmbiente } from '../utils/validators';

export function useAmbientesManagement() {
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [nombre, setNombre] = useState<string>('');
  const [tipo, setTipo] = useState<string>('Laboratorio de Cómputo');
  const [capacidad, setCapacidad] = useState<string>('35');
  const [ubicacion, setUbicacion] = useState<string>('');
  const [estado, setEstado] = useState<EstadoAmbiente>('Disponible');
  const [errores, setErrores] = useState<ErroresFormularioAmbiente>({});

  const [alerta, setAlerta] = useState<FeedbackAlert | null>(null);

  const cargarAmbientes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ambienteService.listarAmbientes();
      setAmbientes(data);
    } catch (err) {
      setAlerta({
        type: 'error',
        title: 'Error al listar ambientes',
        message: err instanceof Error ? err.message : 'No se pudo cargar el catálogo de ambientes.'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarAmbientes();
  }, [cargarAmbientes]);

  const abrirModalRegistro = () => {
    setErrores({});
    setIsModalOpen(true);
  };

  const cerrarModalRegistro = () => {
    if (isSubmitting) return;
    setErrores({});
    setIsModalOpen(false);
  };

  const limpiarFormulario = () => {
    setNombre('');
    setTipo('Laboratorio de Cómputo');
    setCapacidad('35');
    setUbicacion('');
    setEstado('Disponible');
    setErrores({});
  };

  const handleRegistrar = async (e: FormEvent) => {
    e.preventDefault();
    setAlerta(null);

    const payload = {
      nombre: nombre.trim(),
      tipo,
      capacidad: Number(capacidad),
      ubicacion: ubicacion.trim(),
      estado
    };

    const errs = validarFormularioAmbiente(payload);
    setErrores(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    try {
      const res = await ambienteService.registrarAmbiente(payload);

      setAlerta({
        type: 'success',
        title: `Ambiente "${payload.nombre}" registrado exitosamente`,
        message:
          res.mensaje ||
          res.message ||
          `El ambiente '${payload.nombre}' (${payload.tipo}, capacidad ${payload.capacidad} personas) fue incorporado al catálogo en estado '${payload.estado}'.`
      });
      limpiarFormulario();
      setIsModalOpen(false);
      await cargarAmbientes();
    } catch (err) {
      const msgError = err instanceof Error ? err.message : 'No se pudo registrar el ambiente.';
      // Shneiderman Regla 5: No borrar datos escritos; marcar campo conflictivo si es nombre duplicado
      if (msgError.toLowerCase().includes('nombre')) {
        setErrores((prev) => ({
          ...prev,
          nombre: msgError
        }));
      } else {
        setAlerta({
          type: 'error',
          title: 'Error al registrar ambiente',
          message: msgError
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    ambientes,
    isLoading,
    isSubmitting,
    isModalOpen,
    abrirModalRegistro,
    cerrarModalRegistro,
    limpiarFormulario,
    nombre,
    setNombre,
    tipo,
    setTipo,
    capacidad,
    setCapacidad,
    ubicacion,
    setUbicacion,
    estado,
    setEstado,
    errores,
    setErrores,
    alerta,
    setAlerta,
    handleRegistrar
  };
}
