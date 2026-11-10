import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { KeyRound, LogIn, Mail } from 'lucide-react';
import { AlertMessage, Button, TextInput, Tooltip } from '../components/ui';
import { LoginDemoProfiles } from '../components/usuarios/LoginDemoProfiles';
import { AuthLayout } from '../layouts/AuthLayout';
import { usuarioService } from '../services';
import type { DemoAccountOption, UserSession, Usuario } from '../types';
import { CUENTAS_INSTITUCIONALES_DEMO, CREDENCIAL_DEMO_POR_ROL } from '../utils/constants';

export interface LoginPageProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export function LoginPage({ isDark = false, onToggleTheme, onLoginSuccess }: LoginPageProps) {
  const [correo, setCorreo] = useState<string>('');
  const [claveAcceso, setClaveAcceso] = useState<string>('');
  const [mostrarClave, setMostrarClave] = useState<boolean>(false);

  const [usuariosRegistrados, setUsuariosRegistrados] = useState<Usuario[]>([]);
  const [errores, setErrores] = useState<{ correo?: string; claveAcceso?: string }>({});
  const [alerta, setAlerta] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    usuarioService
      .listarUsuarios()
      .then((lista) => setUsuariosRegistrados(lista))
      .catch(() => {
        // Si se carga al enviar, volverá a consultar
      });
  }, []);

  const handleSelectDemo = (cuenta: DemoAccountOption) => {
    setCorreo(cuenta.correo);
    setClaveAcceso(cuenta.claveAcceso);
    setErrores({});
    setAlerta({
      type: 'info',
      message: `Credenciales cargadas para ${cuenta.nombreCompleto} (${cuenta.rol}).`
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAlerta(null);

    const nuevosErrores: { correo?: string; claveAcceso?: string } = {};
    const correoLimpio = correo.trim().toLowerCase();

    if (!correoLimpio) {
      nuevosErrores.correo = 'Ingrese su correo institucional (@upla.edu.pe).';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
      nuevosErrores.correo = 'Formato de correo electrónico no válido.';
    }

    if (!claveAcceso.trim()) {
      nuevosErrores.claveAcceso = 'Ingrese su credencial o código de acceso.';
    }

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setIsSubmitting(true);
    try {
      const padrón =
        usuariosRegistrados.length > 0
          ? usuariosRegistrados
          : await usuarioService.listarUsuarios();

      const usuarioEncontrado = padrón.find(
        (u) => u.correo.trim().toLowerCase() === correoLimpio
      );

      if (!usuarioEncontrado) {
        setAlerta({
          type: 'error',
          message:
            'No existe una cuenta registrada con ese correo institucional en ReservaUPLA.'
        });
        return;
      }

      if (!usuarioEncontrado.activo) {
        setAlerta({
          type: 'error',
          message:
            'La cuenta institucional se encuentra inactiva. Contacte al Administrador.'
        });
        return;
      }

      // MVP: validación de credencial por rol institucional
      const demoMatch = CUENTAS_INSTITUCIONALES_DEMO.find(
        (d) => d.correo.toLowerCase() === correoLimpio
      );

      const credencialEsperada = CREDENCIAL_DEMO_POR_ROL[usuarioEncontrado.rol];

      if (!credencialEsperada) {
        setAlerta({
          type: 'error',
          message: 'Credencial de acceso incorrecta.'
        });
        return;
      }

      if (claveAcceso.trim() !== credencialEsperada) {
        setErrores((prev) => ({
          ...prev,
          claveAcceso: 'Credencial de acceso incorrecta.'
        }));
        setAlerta({
          type: 'error',
          message: 'La credencial ingresada no coincide con la registrada para esta cuenta.'
        });
        return;
      }

      const session: UserSession = {
        id: usuarioEncontrado.id,
        nombreCompleto: usuarioEncontrado.nombreCompleto,
        correo: usuarioEncontrado.correo,
        rol: usuarioEncontrado.rol,
        activo: usuarioEncontrado.activo,
        facultadDependencia:
          demoMatch?.cargo ?? 'Facultad de Ingeniería — Universidad Peruana Los Andes',
        loginTimestamp: new Date().toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      onLoginSuccess(session);
    } catch (err) {
      setAlerta({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'No se pudo verificar la cuenta con el servidor.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout isDark={isDark} onToggleTheme={onToggleTheme}>
      {/* Cabecera del inicio de sesión con Logotipo Oficial UPLA */}
      <div className="mb-6">
        <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 bg-[#1264A3] mb-4">
          <img
            src="/images/upla-logo.jpg"
            alt="Logotipo oficial Universidad Peruana Los Andes"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-[#1E3A8A] dark:text-[#3B82F6] text-[11px] font-extrabold tracking-widest uppercase block mb-1">
          AUTENTICACIÓN INSTITUCIONAL
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-tight">
          Iniciar sesión
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Ingrese con su cuenta institucional UPLA para acceder según su rol asignado.
        </p>
      </div>

      {/* Slot reservado de altura estable para evitar saltos visuales (CLS = 0) */}
      <div className="min-h-[3.25rem] mb-2 flex items-center">
        {alerta ? (
          <AlertMessage
            type={alerta.type}
            message={alerta.message}
            onClose={() => setAlerta(null)}
            className="w-full py-2.5 px-3.5"
          />
        ) : (
          <div className="w-full h-full opacity-0 pointer-events-none select-none" aria-hidden="true" />
        )}
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} noValidate className="space-y-4">
        <TextInput
          id="login-correo"
          type="email"
          label="Correo Institucional UPLA"
          placeholder="usuario@upla.edu.pe"
          required
          value={correo}
          onChange={(e) => {
            setCorreo(e.target.value);
            if (errores.correo) setErrores((prev) => ({ ...prev, correo: undefined }));
          }}
          error={errores.correo}
          icon={<Mail className="w-4 h-4" />}
        />

        <TextInput
          id="login-clave"
          type={mostrarClave ? 'text' : 'password'}
          label="Credencial de Acceso"
          placeholder="Ingrese su credencial institucional"
          required
          value={claveAcceso}
          onChange={(e) => {
            setClaveAcceso(e.target.value);
            if (errores.claveAcceso)
              setErrores((prev) => ({ ...prev, claveAcceso: undefined }));
          }}
          error={errores.claveAcceso}
          icon={<KeyRound className="w-4 h-4" />}
          rightElement={
            <Tooltip
              content={mostrarClave ? 'Ocultar credencial de acceso' : 'Mostrar credencial de acceso'}
              position="top"
            >
              <button
                type="button"
                onClick={() => setMostrarClave((prev) => !prev)}
                className="text-xs font-bold text-[#1E3A8A] dark:text-blue-400 hover:underline px-2 py-1 rounded cursor-pointer"
              >
                {mostrarClave ? 'Ocultar' : 'Mostrar'}
              </button>
            </Tooltip>
          }
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            loadingText="Verificando credenciales..."
            tooltip="Autenticar cuenta institucional e ingresar al sistema"
            icon={<LogIn className="w-4 h-4" />}
            className="w-full font-bold tracking-wide"
          >
            INGRESAR AL SISTEMA
          </Button>
        </div>
      </form>

      {/* Selector rápido de cuentas reales por rol (Shneiderman Regla 2) */}
      <LoginDemoProfiles
        correoSeleccionado={correo}
        onSelectAccount={handleSelectDemo}
      />
    </AuthLayout>
  );
}
