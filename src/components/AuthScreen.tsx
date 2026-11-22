import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Database,
  KeyRound,
  ArrowRight
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { isConfigured, signIn, signUp, resetPassword, profileError, session, signOut } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else if (mode === 'signup') {
        if (!fullName.trim()) {
          throw new Error('Ingrese sus nombres y apellidos completos.');
        }
        const { needsEmailConfirmation } = await signUp(fullName, email, password);
        if (needsEmailConfirmation) {
          setInfoMsg(
            'Registro recibido. Revisa tu correo @ug.edu.ec para confirmar la cuenta antes de iniciar sesión.'
          );
          setMode('login');
        }
      } else {
        await resetPassword(email);
        setInfoMsg('Se envió un enlace de recuperación de contraseña a tu correo institucional.');
        setMode('login');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Ocurrió un error al autenticar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md space-y-5">
        {/* Institutional Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-lg tracking-wider mx-auto shadow-sm">
            UG
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            UG-Investiga FCI
          </h1>
          <p className="text-xs text-slate-600">
            Facultad de Ingeniería Industrial · Carrera de Ingeniería en Telemática
          </p>
        </div>

        {/* Configuration Missing State */}
        {!isConfigured ? (
          <div className="bg-white rounded-xl border border-amber-300 shadow-sm p-6 space-y-4 text-xs text-slate-700">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Configuración de Supabase Pendiente
                </h2>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Para activar la autenticación, base de datos PostgreSQL y almacenamiento en Supabase, define estas dos variables de entorno:
                </p>
              </div>
            </div>

            <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] space-y-1">
              <p>VITE_SUPABASE_URL=&quot;https://TU_PROYECTO.supabase.co&quot;</p>
              <p>VITE_SUPABASE_ANON_KEY=&quot;TU_CLAVE_ANON_PUBLISHABLE&quot;</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 text-[11px]">
              <p className="font-bold text-slate-800">Pasos en Supabase Dashboard:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li>
                  Ejecuta en orden las migraciones SQL de <code className="font-mono text-blue-900">supabase/migrations/</code> (001 a 005).
                </li>
                <li>
                  Configura <code className="font-mono text-blue-900">VITE_SUPABASE_URL</code> y{' '}
                  <code className="font-mono text-blue-900">VITE_SUPABASE_ANON_KEY</code> en tus variables de entorno.
                </li>
                <li>
                  Nunca coloques la clave <code className="font-mono text-rose-700">service_role</code> en el frontend.
                </li>
              </ol>
            </div>
          </div>
        ) : session && profileError ? (
          <div className="bg-white rounded-xl border border-rose-200 shadow-sm p-6 space-y-4 text-xs">
            <div className="flex items-start gap-2.5 text-rose-800">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h2 className="font-bold text-sm text-rose-950">Perfil Institucional Incompleto</h2>
                <p className="mt-1 leading-relaxed">{profileError}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cerrar Sesión e Intentar con Otra Cuenta
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className={`py-3 transition-colors ${
                  mode === 'login'
                    ? 'bg-white text-blue-900 border-b-2 border-blue-900'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                }}
                className={`py-3 transition-colors ${
                  mode === 'signup'
                    ? 'bg-white text-blue-900 border-b-2 border-blue-900'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Registro UG
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('reset');
                  setErrorMsg(null);
                }}
                className={`py-3 transition-colors ${
                  mode === 'reset'
                    ? 'bg-white text-blue-900 border-b-2 border-blue-900'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Recuperar Clave
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {infoMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{infoMsg}</span>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nombres y Apellidos Académicos
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ej. Ing. Juan Pérez"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Correo Institucional (@ug.edu.ec)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre.apellido@ug.edu.ec"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Contraseña</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {mode === 'login' ? (
                  <>
                    <span>{submitting ? 'Verificando acceso...' : 'Ingresar al Sistema'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : mode === 'signup' ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{submitting ? 'Registrando cuenta...' : 'Registrar Cuenta @ug.edu.ec'}</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>{submitting ? 'Enviando enlace...' : 'Enviar Correo de Recuperación'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Autenticación segura Supabase Auth</span>
              <span className="font-mono text-blue-900 font-semibold">RLS Activo</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
