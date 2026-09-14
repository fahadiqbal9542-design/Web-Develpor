import React, { useState, useEffect, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Image as ImageIcon,
  Users,
  HardDrive,
  Copy,
  Check,
  Info,
  Cloud,
  CloudUpload,
  CloudDownload,
  Terminal,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  downloadDatabaseBackup,
  restoreDatabaseBackup,
  getDatabaseStats,
  getFullDatabasePayload,
  DatabaseStats
} from '../utils/databaseManager';
import {
  isSupabaseConfigured,
  pushToSupabase,
  pullFromSupabase,
  SUPABASE_SETUP_SQL,
  SUPABASE_URL
} from '../utils/supabase';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatabaseRestored?: () => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  isOpen,
  onClose,
  onDatabaseRestored,
}) => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabaseReady = isSupabaseConfigured();

  const refreshStats = async () => {
    try {
      const data = await getDatabaseStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshStats();
      setSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setLoading(true);
      await downloadDatabaseBackup();
      setSuccessMsg('Database backup downloaded successfully! You can now import this file on Vercel.');
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (err) {
      setErrorMsg('Failed to download database backup.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setLoading(true);
        const jsonStr = event.target?.result as string;
        await restoreDatabaseBackup(jsonStr);
        setSuccessMsg('Database restored successfully! Reloading site data...');
        await refreshStats();
        setTimeout(() => {
          if (onDatabaseRestored) {
            onDatabaseRestored();
          } else {
            window.location.reload();
          }
        }, 1200);
      } catch (err) {
        setErrorMsg('Invalid JSON backup file or corrupted database format.');
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handlePushSupabase = async () => {
    try {
      setSupabaseLoading(true);
      setErrorMsg(null);
      const payload = await getFullDatabasePayload();
      const res = await pushToSupabase(payload);
      if (res.success) {
        setSuccessMsg('Successfully synced all photos and database records to Supabase Cloud!');
        setTimeout(() => setSuccessMsg(null), 6000);
      } else {
        setErrorMsg(res.error || 'Failed to sync to Supabase.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error pushing data to Supabase.');
    } finally {
      setSupabaseLoading(false);
    }
  };

  const handlePullSupabase = async () => {
    try {
      setSupabaseLoading(true);
      setErrorMsg(null);
      const res = await pullFromSupabase();
      if (res.success) {
        setSuccessMsg('Successfully fetched latest data from Supabase! Reloading website...');
        await refreshStats();
        setTimeout(() => {
          if (onDatabaseRestored) {
            onDatabaseRestored();
          } else {
            window.location.reload();
          }
        }, 1200);
      } else {
        setErrorMsg(res.error || 'Failed to fetch from Supabase.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error pulling data from Supabase.');
    } finally {
      setSupabaseLoading(false);
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#0B2347] text-white px-6 py-5 flex items-center justify-between border-b border-blue-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center shadow-md">
              <Database className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-display tracking-tight flex items-center gap-2">
                Website Database & Supabase Sync
              </h2>
              <p className="text-xs sm:text-sm text-blue-200 font-normal">
                Supabase Cloud Database & Vercel Image Storage Manager
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-blue-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700">
          {/* Success / Error alerts */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECTION 1: SUPABASE CLOUD DATABASE INTEGRATION */}
          <div className="border-2 border-emerald-200 bg-emerald-50/40 rounded-3xl p-5 space-y-4 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">
                      Supabase Cloud Database
                    </h3>
                    {supabaseReady ? (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Connected
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Info className="w-3 h-3 text-amber-600" />
                        Credentials Ready to Set
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time cloud PostgreSQL database for persistent images and data.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSqlGuide(!showSqlGuide)}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-emerald-100/60 transition-colors"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>SQL Setup</span>
                {showSqlGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Supabase Actions if Ready */}
            {supabaseReady ? (
              <div className="space-y-3 pt-1">
                <div className="text-xs text-slate-600">
                  Connected project URL:{' '}
                  <code className="bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-900 font-mono text-[11px]">
                    {SUPABASE_URL.slice(0, 35)}...
                  </code>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handlePushSupabase}
                    disabled={supabaseLoading}
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <CloudUpload className="w-4 h-4 text-emerald-200" />
                    <span>Push All Data to Supabase</span>
                  </button>

                  <button
                    onClick={handlePullSupabase}
                    disabled={supabaseLoading}
                    className="py-3 px-4 bg-white hover:bg-emerald-50 text-emerald-800 border-2 border-emerald-600 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <CloudDownload className="w-4 h-4 text-emerald-700" />
                    <span>Pull / Restore from Supabase</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Guide to activate Supabase */
              <div className="space-y-3 pt-1 text-xs text-slate-600">
                <div className="bg-white/80 border border-emerald-200 rounded-2xl p-3.5 space-y-2">
                  <span className="font-bold text-slate-800 block text-xs">
                    Supabase Setup Guide (Permanent Vercel Storage):
                  </span>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed text-xs">
                    <li>
                      Apne <strong>Supabase.com</strong> dashboard mein jaien aur Project Settings &gt; API se apna <strong>Project URL</strong> aur <strong>anon public key</strong> copy karein.
                    </li>
                    <li>
                      Apne environment variables ya Vercel Project Settings mein add karein:
                      <div className="font-mono text-[11px] bg-slate-900 text-emerald-400 p-2 rounded-lg mt-1 select-all">
                        VITE_SUPABASE_URL=https://your-project.supabase.co<br />
                        VITE_SUPABASE_ANON_KEY=your-anon-key
                      </div>
                    </li>
                    <li>
                      Supabase SQL Editor mein neechay diya gaya SQL script run karein taake table create ho jaye.
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {/* SQL Table Creation Accordion */}
            {showSqlGuide && (
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    Supabase SQL Editor Query:
                  </span>
                  <button
                    onClick={copySql}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono leading-relaxed overflow-x-auto text-emerald-200 bg-black/40 p-3 rounded-xl border border-slate-800">
                  {SUPABASE_SETUP_SQL}
                </pre>
              </div>
            )}
          </div>

          {/* Database Live Stats */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Current Local Database Status
              </span>
              <button
                onClick={refreshStats}
                className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 hover:underline"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                <div className="text-2xl font-black text-[#0B2347]">
                  {stats ? stats.totalImagesCount : '...'}
                </div>
                <div className="text-xs font-semibold text-slate-500 flex items-center justify-center gap-1 mt-1">
                  <ImageIcon className="w-3 h-3 text-amber-500" />
                  Saved Images
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                <div className="text-2xl font-black text-[#0B2347]">
                  {stats ? stats.studentsCount : '...'}
                </div>
                <div className="text-xs font-semibold text-slate-500 flex items-center justify-center gap-1 mt-1">
                  <Users className="w-3 h-3 text-blue-600" />
                  Students
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                <div className="text-2xl font-black text-[#0B2347]">
                  {stats ? stats.cardsCount : '...'}
                </div>
                <div className="text-xs font-semibold text-slate-500 flex items-center justify-center gap-1 mt-1">
                  <Layers className="w-3 h-3 text-indigo-600" />
                  Env Cards
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                <div className="text-2xl font-black text-[#0B2347]">
                  {stats ? `${stats.estimatedSizeKb} KB` : '...'}
                </div>
                <div className="text-xs font-semibold text-slate-500 flex items-center justify-center gap-1 mt-1">
                  <HardDrive className="w-3 h-3 text-emerald-600" />
                  DB Size
                </div>
              </div>
            </div>
          </div>

          {/* Primary Operations: Export & Import */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Download / Export Button */}
            <div className="border-2 border-slate-200 hover:border-[#0B2347] rounded-2xl p-5 flex flex-col justify-between bg-white transition-all shadow-xs hover:shadow-md">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0B2347] flex items-center justify-center font-bold">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Export JSON Backup
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Apni tamam images, students aur cards ko ek single JSON database file mein save karein.
                </p>
              </div>

              <button
                onClick={handleDownload}
                disabled={loading}
                className="mt-4 w-full py-3 px-4 bg-[#0B2347] hover:bg-[#123363] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Export & Download (.json)</span>
              </button>
            </div>

            {/* Restore / Import Button */}
            <div className="border-2 border-slate-200 hover:border-amber-500 rounded-2xl p-5 flex flex-col justify-between bg-white transition-all shadow-xs hover:shadow-md">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Restore / Import on Vercel
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Vercel par ya kisi bhi new device par backup file upload kar ke sab kuch foran restore karein.
                </p>
              </div>

              <label className="mt-4 w-full py-3 px-4 bg-amber-400 hover:bg-amber-500 text-blue-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98] cursor-pointer">
                <Upload className="w-4 h-4 text-blue-950" />
                <span>Select & Restore File</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={loading}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Supabase PostgreSQL Ready + Local IndexedDB Storage
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
