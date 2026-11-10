import {
  Building2,
  CalendarCheck2,
  Clock,
  ShieldCheck
} from 'lucide-react';

export function AuthBrandPanel() {
  return (
    <aside
      className="hidden lg:flex lg:w-[58%] xl:w-[60%] text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden shrink-0 select-none h-full"
      style={{
        backgroundImage: "url('/images/Espacio%20de%20trabajo%20futurista%20en%20azul.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'right center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#071020',
      }}
    >
      {/* Capa oscura semitransparente para separación figura-fondo (WCAG AAA) */}
      <div
        className="absolute inset-0 pointer-events-none bg-slate-950/50"
        aria-hidden="true"
      />

      {/* Viñeta sutil inferior y lateral para reforzar la legibilidad de textos blancos */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 80%, rgba(7,17,32,0.40) 0%, transparent 70%)'
        }}
        aria-hidden="true"
      />

      {/* Cabecera superior con Logotipo Oficial de la UPLA */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl bg-[#1264A3] flex items-center justify-center shrink-0">
            <img
              src="/images/upla-logo.jpg"
              alt="Logotipo oficial Universidad Peruana Los Andes"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-xl tracking-tight text-white drop-shadow-xs">
                ReservaUPLA
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-md bg-amber-400/25 text-amber-200 border border-amber-300/40 backdrop-blur-xs">
                Facultad de Ingeniería
              </span>
            </div>
            <p className="text-xs text-slate-100 font-medium mt-0.5 drop-shadow-xs">
              Universidad Peruana Los Andes • Campus Chorrillos
            </p>
          </div>
        </div>
      </div>

      {/* Bloque central de propuesta de valor con contraste blanco impecable */}
      <div className="relative z-10 my-auto py-8 max-w-xl">
        <div className="mb-4">
          <span className="text-amber-300 font-extrabold tracking-widest text-xs uppercase block mb-2 drop-shadow-xs">
            PLATAFORMA ACADÉMICA E INSTITUCIONAL
          </span>
          <div className="w-14 h-1 bg-amber-400 rounded-full shadow-xs" />
        </div>

        <h1 className="font-extrabold text-4xl xl:text-5xl text-white leading-[1.14] mb-5 tracking-tight drop-shadow-sm">
          Gestión Inteligente de Ambientes Universitarios.
        </h1>

        <p className="text-white/95 text-sm xl:text-base leading-relaxed mb-8 font-medium drop-shadow-xs">
          Reserva, verifica disponibilidad y gestiona ambientes académicos con control total por rol.
        </p>

        {/* Tarjetas de garantías operativas con fondo traslúcido de alto contraste */}
        <div className="grid grid-cols-3 gap-3.5">
          <div className="bg-slate-950/60 border border-white/20 rounded-2xl p-4 backdrop-blur-md shadow-lg">
            <Clock className="w-5 h-5 text-amber-300 mb-2" aria-hidden="true" />
            <p className="text-xs font-bold text-white">Horario Hábil</p>
            <p className="text-[11px] text-slate-200 mt-0.5 tabular-nums">
              Atención de 07:00 a 22:00 horas
            </p>
          </div>

          <div className="bg-slate-950/60 border border-white/20 rounded-2xl p-4 backdrop-blur-md shadow-lg">
            <CalendarCheck2 className="w-5 h-5 text-emerald-300 mb-2" aria-hidden="true" />
            <p className="text-xs font-bold text-white">Cero Cruces</p>
            <p className="text-[11px] text-slate-200 mt-0.5">
              Validación horaria automática
            </p>
          </div>

          <div className="bg-slate-950/60 border border-white/20 rounded-2xl p-4 backdrop-blur-md shadow-lg">
            <ShieldCheck className="w-5 h-5 text-blue-300 mb-2" aria-hidden="true" />
            <p className="text-xs font-bold text-white">Control por Rol</p>
            <p className="text-[11px] text-slate-200 mt-0.5">
              Permisos diferenciados por perfil
            </p>
          </div>
        </div>
      </div>

      {/* Pie institucional */}
      <footer className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between text-xs text-slate-100 font-medium drop-shadow-xs">
        <span className="inline-flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-amber-300" />
          Universidad Peruana Los Andes &copy; {new Date().getFullYear()}
        </span>
        <span>Gestión de Infraestructura Académica</span>
      </footer>
    </aside>
  );
}
