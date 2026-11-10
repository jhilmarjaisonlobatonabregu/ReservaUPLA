import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { usuarioService } from '../services';
import type {
  ErroresFormularioUsuario,
  FeedbackAlert,
  RolUsuario,
  Usuario
} from '../types';
import { validarFormularioUsuario } from '../utils/validators';

export function useUsuariosManagement() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [nombreCompleto, setNombreCompleto] = useState<string>('');
  const [correo, setCorreo] = useState<string>('');
  const [rol, setRol] = useState<RolUsuario>('Solicitante');
  const [errores, setErrores] = useState<ErroresFormularioUsuario>({});

  const [alerta, setAlerta] = useState<FeedbackAlert | null>(null);

  const cargarUsuarios = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await usuarioService.listarUsuarios();
      setUsuarios(data);
    } catch (err) {
      setAlerta({
        type: 'error',
        title: 'Error al listar usuarios',
        message: err instanceof Error ? err.message : 'No se pudo cargar el padrón de usuarios.'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarUsuarios();
  }, [cargarUsuarios]);

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
    setNombreCompleto('');
    setCorreo('');
    setRol('Solicitante');
    setErrores({});
  };

  const handleRegistrar = async (e: FormEvent) => {
    e.preventDefault();
    setAlerta(null);

    const payload = {
      nombreCompleto: nombreCompleto.trim(),
      correo: correo.trim(),
      rol,
      activo: true
    };

    const errs = validarFormularioUsuario(payload);
    setErrores(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    try {
      const res = await usuarioService.registrarUsuario(payload);

      setAlerta({
        type: 'success',
        title: `Usuario "${payload.nombreCompleto}" registrado con rol ${payload.rol}`,
        message:
          res.mensaje ||
          res.message ||
          `La cuenta institucional '${payload.correo}' fue incorporada exitosamente al padrón como '${payload.rol}'.`
      });
      limpiarFormulario();
      setIsModalOpen(false);
      await cargarUsuarios();
    } catch (err) {
      const msgError = err instanceof Error ? err.message : 'No se pudo registrar el usuario.';
      // Shneiderman Regla 5: Sin pérdida de datos; marcar el campo correo si ya existe
      if (msgError.toLowerCase().includes('correo')) {
        setErrores((prev) => ({
          ...prev,
          correo: msgError
        }));
      } else {
        setAlerta({
          type: 'error',
          title: 'Error al registrar usuario',
          message: msgError
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    usuarios,
    isLoading,
    isSubmitting,
    isModalOpen,
    abrirModalRegistro,
    cerrarModalRegistro,
    limpiarFormulario,
    nombreCompleto,
    setNombreCompleto,
    correo,
    setCorreo,
    rol,
    setRol,
    errores,
    setErrores,
    alerta,
    setAlerta,
    handleRegistrar
  };
}
