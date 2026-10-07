import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Lock, Mail, User, Phone, Car, ArrowRight, ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    loginUser,
    registerUser,
    recoverPassword,
    resetPasswordWithCode,
  } = useStore();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+598 99 ');
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('2024');
  const [rememberMe, setRememberMe] = useState(true);

  // Recovery states
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'reset'>('request');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [generatedCodeHint, setGeneratedCodeHint] = useState<string | null>(null);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setErrorMessage('');
    setSuccessMessage('');
    setRecoveryStep('request');
    setGeneratedCodeHint(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = loginUser(email, password, rememberMe);
    if (res.success) {
      handleClose();
    } else {
      setErrorMessage(res.error || 'Error al iniciar sesión.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    const res = registerUser({
      name,
      email,
      password,
      phone,
      carBrand: carBrand || undefined,
      carModel: carModel || undefined,
      carYear: carYear || undefined,
    });

    if (res.success) {
      setSuccessMessage('¡Cuenta creada exitosamente! Sesión iniciada.');
      setTimeout(() => {
        handleClose();
      }, 1000);
    } else {
      setErrorMessage(res.error || 'Error al crear la cuenta.');
    }
  };

  const handleRequestRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = recoverPassword(email);
    if (res.success) {
      setRecoveryStep('reset');
      setRecoveryMessage(res.message);
      setGeneratedCodeHint(res.tempCode || null);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPasswordInput.length < 6) {
      setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const res = resetPasswordWithCode(email, recoveryCodeInput, newPasswordInput);
    if (res.success) {
      setSuccessMessage('¡Contraseña reestablecida con éxito! Ahora podés iniciar sesión.');
      setTimeout(() => {
        setAuthModalMode('login');
        setPassword(newPasswordInput);
        setRecoveryStep('request');
        setGeneratedCodeHint(null);
      }, 1500);
    } else {
      setErrorMessage(res.error || 'Error al restablecer la contraseña.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl my-auto">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Branding Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-50/30">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-display font-extrabold text-xl text-slate-900">
            {authModalMode === 'login' && 'Iniciar Sesión'}
            {authModalMode === 'register' && 'Crear Cuenta'}
            {authModalMode === 'recovery' && 'Recuperar Contraseña'}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            {authModalMode === 'login' && 'Accedé a tus pedidos guardados y garage de vehículos.'}
            {authModalMode === 'register' && 'Registrate para gestionar tus compras y solicitar moldes a medida.'}
            {authModalMode === 'recovery' && 'Te enviaremos un código de seguridad para restaurar tu acceso.'}
          </p>
        </div>

        {/* Mode Selector Tabs (Login / Register) */}
        {authModalMode !== 'recovery' && (
          <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 mb-6 text-xs font-semibold">
            <button
              onClick={() => {
                setAuthModalMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                authModalMode === 'login' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ya tengo cuenta
            </button>
            <button
              onClick={() => {
                setAuthModalMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                authModalMode === 'register' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Registrarme
            </button>
          </div>
        )}

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-blue-50/50 border border-blue-500/40 rounded-xl text-xs text-red-300">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {authModalMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="ej. juan.perez@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-700">Contraseña</label>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('recovery');
                    setErrorMessage('');
                  }}
                  className="text-[11px] text-blue-600 hover:text-red-300 underline"
                >
                  ¿Olvidaste tu clave?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 bg-slate-100 border-slate-300"
                />
                <span>Mantener sesión iniciada</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-50/40 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <span>Entrar a Mi Cuenta</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Fill Buttons */}
            <div className="pt-3 border-t border-slate-200/80 text-center">
              <span className="text-[10px] text-slate-500 block mb-2">Cuentas de demostración rápida:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('juan.perez@gmail.com');
                    setPassword('cliente123');
                  }}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[10px] text-slate-700 font-mono"
                >
                  Cliente Demo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@distribuidorabuenosaires.com');
                    setPassword('admin123');
                  }}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[10px] text-slate-700 font-mono"
                  title="Acceso Administrador (admin123)"
                >
                  Admin Demo
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 2. REGISTER FORM */}
        {authModalMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Nombre Completo *</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="ej. Agustín Pereira"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="agustin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Optional default vehicle */}
            <div className="p-3 bg-slate-100/60 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-blue-500" />
                <span>Tu Vehículo Principal (Opcional para moldes)</span>
              </span>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Marca (Toyota)"
                  value={carBrand}
                  onChange={(e) => setCarBrand(e.target.value)}
                  className="bg-white border border-slate-300/80 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-900 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Modelo (Hilux)"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  className="bg-white border border-slate-300/80 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-900 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Año (2024)"
                  value={carYear}
                  onChange={(e) => setCarYear(e.target.value)}
                  className="bg-white border border-slate-300/80 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-900 text-center font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Contraseña *</label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Confirmar Clave *</label>
                <input
                  type="password"
                  required
                  placeholder="Repetir contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-50/40 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <span>Completar Registro Seguro</span>
              <ShieldCheck className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 3. PASSWORD RECOVERY FORM */}
        {authModalMode === 'recovery' && (
          <div className="space-y-4">
            {recoveryStep === 'request' ? (
              <form onSubmit={handleRequestRecovery} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Correo asociado a tu cuenta
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="tucorreo@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  Enviar Código de Recuperación
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setAuthModalMode('login')}
                    className="text-xs text-slate-600 hover:text-slate-900"
                  >
                    Volver a Iniciar Sesión
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {generatedCodeHint && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 text-center">
                    <span>Código de verificación generado: </span>
                    <strong className="font-mono text-sm tracking-widest text-slate-900 ml-1">
                      {generatedCodeHint}
                    </strong>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Código de 6 dígitos
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={recoveryCodeInput}
                    onChange={(e) => setRecoveryCodeInput(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-center text-sm font-mono tracking-widest text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-bold text-xs rounded-xl transition-colors"
                >
                  Guardar Nueva Contraseña
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
