import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, Eye, EyeOff, ShieldCheck, AlertCircle, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';

interface WebsiteLockScreenProps {
  onUnlock: () => void;
}

const MASTER_PASSWORD = 'king295.';

export const WebsiteLockScreen: React.FC<WebsiteLockScreenProps> = ({ onUnlock }) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) {
      setError('Please enter the password');
      return;
    }

    if (passwordInput === MASTER_PASSWORD) {
      setError(null);
      setIsSuccess(true);
      setTimeout(() => {
        onUnlock();
      }, 500);
    } else {
      setError('Incorrect password! Access denied.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  return (
    <div
      id="website-master-lock-screen"
      className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-[#07172F] px-4 overflow-y-auto selection:bg-amber-400 selection:text-blue-950"
    >
      {/* Decorative ambient background lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div
        className={`relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden transition-all duration-300 ${
          isShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
        }`}
      >
        {/* Card Header */}
        <div className="bg-[#0B2347] p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Lock className="w-32 h-32" />
          </div>

          <div className="flex justify-center mb-4">
            <SchoolLogo size="lg" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Protected Campus Portal</span>
          </div>

          <h1 className="text-2xl font-black font-display tracking-tight text-white">
            Website Access Locked
          </h1>
          <p className="text-xs text-blue-200 mt-1 max-w-xs mx-auto">
            Website ko open karne ke liye authorized security password enter karein.
          </p>
        </div>

        {/* Card Form Body */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="site-lock-password"
                className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2"
              >
                Security Password
              </label>

              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>

                <input
                  id="site-lock-password"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (error) setError(null);
                  }}
                  autoFocus
                  placeholder="Enter access password..."
                  className="w-full pl-10 pr-12 py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-[#0B2347] focus:bg-white rounded-2xl text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Notification */}
            {isSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Password Verified! Opening website...</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="site-lock-unlock-btn"
              type="submit"
              disabled={isSuccess}
              className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                isSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0B2347] hover:bg-[#123363] text-white hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {isSuccess ? (
                <>
                  <Unlock className="w-4 h-4 text-emerald-200" />
                  <span>Access Granted</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Unlock & Open Website</span>
                  <ArrowRight className="w-4 h-4 text-blue-200 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Encrypted Session • Official Web Developer School</span>
          </div>
        </div>
      </div>
    </div>
  );
};
