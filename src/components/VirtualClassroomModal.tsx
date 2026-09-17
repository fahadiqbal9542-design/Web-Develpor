import React, { useState, useEffect, useRef } from 'react';
import { OnlineClass } from '../types';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  MessageSquare,
  Send,
  Users,
  FileText,
  CheckCircle2,
  X,
  ExternalLink,
  Play,
  Terminal,
  Code,
  Layout,
  Maximize2,
  Minimize2,
  Sparkles,
  Flame,
  Heart,
  Lightbulb,
  Rocket,
  BarChart2,
  Copy,
  Check,
  Share2,
  Monitor,
  Volume2,
  VolumeX,
  Radio,
  Download,
  HelpCircle
} from 'lucide-react';

interface VirtualClassroomModalProps {
  onlineClass: OnlineClass;
  onClose: () => void;
}

type StageMode = 'code' | 'stream' | 'whiteboard' | 'split';
type SidebarTab = 'chat' | 'participants' | 'resources' | 'poll';

interface ChatMessage {
  id: string;
  user: string;
  avatar?: string;
  text: string;
  time: string;
  isTeacher?: boolean;
  role?: string;
}

interface Participant {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isOnline: boolean;
  isMuted: boolean;
  hasCam: boolean;
}

const SAMPLE_CODE_FILES = {
  'App.tsx': `// Live Classroom Code — Web Developer School
import React, { useState, useEffect } from 'react';
import { CloudService, DatabaseConnection } from '@school/cloud-sdk';

export function ModernWebArchitecture() {
  const [clusterReady, setClusterReady] = useState(true);
  const [latencyMs, setLatencyMs] = useState(14);
  const [activeServices, setActiveServices] = useState([
    'Vite Frontend Cluster',
    'High-Speed Node.js Server',
    'Supabase Cloud Persistence'
  ]);

  // Real-time synchronization pipeline
  useEffect(() => {
    const conn = DatabaseConnection.connect({
      endpoint: 'cloud://school.internal',
      heartbeat: 1000
    });
    return () => conn.disconnect();
  }, []);

  return (
    <div className="enterprise-cloud-dashboard">
      <h2>Welcome to Web Developer School Virtual Lab</h2>
      <p>Status: {clusterReady ? 'Operational' : 'Connecting'}</p>
      <div className="metrics">Cluster Latency: {latencyMs}ms</div>
    </div>
  );
}`,
  'server.ts': `// Enterprise Backend Gateway
import express from 'express';
import { createServer } from 'http';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    school: 'Web Developer School Live Lecture'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`[Live Stream] Server active on port \${PORT}\`);
});`,
  'schema.sql': `-- Production Database Schema
CREATE TABLE IF NOT EXISTS public.school_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(180) UNIQUE NOT NULL,
  current_course VARCHAR(100) DEFAULT 'Full-Stack Web Dev',
  attendance_rate NUMERIC(5,2) DEFAULT 98.50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time subscription triggers enabled
CREATE INDEX idx_student_email ON public.school_students(email);`
};

export const VirtualClassroomModal: React.FC<VirtualClassroomModalProps> = ({
  onlineClass,
  onClose
}) => {
  // Navigation & View Modes
  const [stageMode, setStageMode] = useState<StageMode>('code');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('chat');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Classroom Media Controls
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isTeacherSpeaking, setIsTeacherSpeaking] = useState(true);

  // Floating Reactions
  const [floatingReactions, setFloatingReactions] = useState<{ id: number; emoji: string; left: number }[]>([]);

  // Code Editor State
  const [selectedFile, setSelectedFile] = useState<keyof typeof SAMPLE_CODE_FILES>('App.tsx');
  const [codeContent, setCodeContent] = useState<Record<string, string>>(SAMPLE_CODE_FILES);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[INIT] Virtual Classroom Workspace booted (Node v20.12, TypeScript 5.4)',
    '[CONNECT] Connected to live teacher audio-video pipeline (1080p60)',
    '[READY] Ready for interactive coding.'
  ]);
  const [isTerminalRunning, setIsTerminalRunning] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Whiteboard Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#38bdf8');
  const [penSize, setPenSize] = useState(3);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      user: onlineClass.instructor,
      role: 'Lead Instructor',
      avatar: onlineClass.instructorAvatar || onlineClass.image,
      text: `Assalam-o-Alaikum & Welcome everyone to our live lecture! Today we are mastering full-stack cloud workflows.`,
      time: '18:00',
      isTeacher: true
    },
    {
      id: 'm-2',
      user: 'Ali Raza',
      role: 'Student (Cohort A)',
      text: 'Salam Sir Abdullah! Screen and audio are crystal clear.',
      time: '18:02'
    },
    {
      id: 'm-3',
      user: 'Zainab Fatima',
      role: 'Student (Cohort B)',
      text: 'Sir, will we cover database migration and REST APIs today as well?',
      time: '18:04'
    },
    {
      id: 'm-4',
      user: onlineClass.instructor,
      role: 'Lead Instructor',
      avatar: onlineClass.instructorAvatar || onlineClass.image,
      text: 'Yes Zainab! In the second half of the class we will live-deploy database schemas.',
      time: '18:05',
      isTeacher: true
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Participants
  const [participants] = useState<Participant[]>([
    {
      id: 'p-1',
      name: onlineClass.instructor,
      role: 'Instructor (Host)',
      avatar: onlineClass.instructorAvatar || onlineClass.image,
      isOnline: true,
      isMuted: false,
      hasCam: true
    },
    {
      id: 'p-2',
      name: 'You (Student)',
      role: 'Student (Active)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      isOnline: true,
      isMuted: isMicMuted,
      hasCam: !isVideoOff
    },
    {
      id: 'p-3',
      name: 'Ali Raza',
      role: 'Student',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      isOnline: true,
      isMuted: true,
      hasCam: false
    },
    {
      id: 'p-4',
      name: 'Zainab Fatima',
      role: 'Student',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      isOnline: true,
      isMuted: true,
      hasCam: true
    },
    {
      id: 'p-5',
      name: 'Fahad Iqbal',
      role: 'Student',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      isOnline: true,
      isMuted: true,
      hasCam: false
    },
    {
      id: 'p-6',
      name: 'Sara Khan',
      role: 'Student',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
      isOnline: true,
      isMuted: true,
      hasCam: false
    }
  ]);

  // Live Poll State
  const [pollVoted, setPollVoted] = useState<number | null>(null);
  const [pollVotes, setPollVotes] = useState([18, 42, 6, 2]);

  // Stream Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(2475); // ~41 mins

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Speaking indicator cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTeacherSpeaking((prev) => !prev);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  // Format elapsed time (HH:MM:SS)
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h.toString().padStart(2, '0')}:` : ''}${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalContainerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Spawn Reaction
  const spawnReaction = (emoji: string) => {
    const newReaction = {
      id: Date.now() + Math.random(),
      emoji,
      left: 15 + Math.random() * 60
    };
    setFloatingReactions((prev) => [...prev, newReaction]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 2400);
  };

  // Send Chat
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      user: 'You (Student)',
      role: 'Student',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setChatInput('');
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Run Code in Simulated Terminal
  const handleRunCode = () => {
    setIsTerminalRunning(true);
    setTerminalLogs((prev) => [
      ...prev,
      `> vite build --mode development`,
      `[BUILD] Compiling ${selectedFile}...`,
      `[OK] 12 modules transformed in 42ms.`,
      `[VIRTUAL RUNTIME] Output: ModernWebArchitecture rendered successfully.`
    ]);
    setTimeout(() => {
      setIsTerminalRunning(false);
    }, 700);
  };

  // Copy active code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeContent[selectedFile] || '');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Whiteboard Canvas Initialization
  useEffect(() => {
    if (stageMode === 'whiteboard' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw initial architecture diagram
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Pre-drawn architecture blocks
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(60, 80, 180, 90);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('Client (React SPA)', 85, 120);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Vite + Tailwind CSS', 95, 145);

        // Arrow 1
        ctx.strokeStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(240, 125);
        ctx.lineTo(340, 125);
        ctx.stroke();

        // Server Block
        ctx.strokeStyle = '#fbbf24';
        ctx.strokeRect(340, 80, 180, 90);
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('Server (Express)', 365, 120);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Node.js REST API', 380, 145);

        // Arrow 2
        ctx.strokeStyle = '#34d399';
        ctx.beginPath();
        ctx.moveTo(520, 125);
        ctx.lineTo(620, 125);
        ctx.stroke();

        // Database Block
        ctx.strokeStyle = '#34d399';
        ctx.strokeRect(620, 80, 180, 90);
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('Cloud Database', 655, 120);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('PostgreSQL / Supabase', 645, 145);
      }
    }
  }, [stageMode]);

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const handleStopDraw = () => {
    setIsDrawing(false);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Clean Title
  const displayTitle =
    !onlineClass.title || onlineClass.title.trim().length <= 2
      ? 'Full-Stack Modern Web Engineering Masterclass'
      : onlineClass.title;

  return (
    <div
      ref={modalContainerRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-3 md:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="bg-[#0b1120] text-slate-100 rounded-2xl sm:rounded-3xl max-w-7xl w-full h-[96vh] sm:h-[92vh] shadow-2xl border border-slate-800 flex flex-col overflow-hidden relative">
        {/* Floating animated reactions */}
        {floatingReactions.map((r) => (
          <div
            key={r.id}
            style={{ left: `${r.left}%` }}
            className="absolute bottom-24 pointer-events-none z-40 text-3xl sm:text-4xl animate-bounce transition-all duration-1000 opacity-90 drop-shadow-lg"
          >
            {r.emoji}
          </div>
        ))}

        {/* =========================================================================
            1. TOP HEADER STUDIO BAR
            ========================================================================= */}
        <header className="px-3.5 sm:px-6 py-2.5 sm:py-3 bg-[#070b14] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 z-20">
          {/* Left: Class Title & Host Info */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 bg-red-950/70 border border-red-500/50 px-2.5 py-1 rounded-full shrink-0">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-[11px] font-black text-red-400 tracking-wider uppercase flex items-center gap-1">
                <Radio className="w-3 h-3 text-red-400" />
                LIVE
              </span>
            </div>

            {/* REC indicator & Duration */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span>REC {formatTime(elapsedSeconds)}</span>
            </div>

            {/* Title & Instructor */}
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-white truncate max-w-[260px] sm:max-w-md flex items-center gap-2">
                <span>{displayTitle}</span>
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>
                  Instructor: <strong className="text-amber-400 font-semibold">{onlineClass.instructor}</strong>
                </span>
                <span className="text-slate-600 hidden md:inline">•</span>
                <span className="hidden md:inline text-slate-400">{onlineClass.level || 'All Cohorts'}</span>
              </div>
            </div>
          </div>

          {/* Center: Stage View Switcher */}
          <div className="hidden lg:flex items-center p-1 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setStageMode('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                stageMode === 'code' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Live Code</span>
            </button>
            <button
              type="button"
              onClick={() => setStageMode('stream')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                stageMode === 'stream' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video Stream</span>
            </button>
            <button
              type="button"
              onClick={() => setStageMode('whiteboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                stageMode === 'whiteboard' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Whiteboard</span>
            </button>
            <button
              type="button"
              onClick={() => setStageMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                stageMode === 'split' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
          </div>

          {/* Right: Actions & Close */}
          <div className="flex items-center gap-2">
            {onlineClass.meetingUrl && onlineClass.meetingUrl.startsWith('http') && (
              <a
                href={onlineClass.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                title="Launch this live stream in Google Meet external window"
              >
                <span>Launch in Google Meet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer hidden sm:flex"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Leave / Close button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Leave Class</span>
            </button>
          </div>
        </header>

        {/* Mobile View Selector Bar (Shown only on small screens) */}
        <div className="flex lg:hidden items-center justify-around bg-slate-900 border-b border-slate-800 p-1.5 text-xs">
          <button
            type="button"
            onClick={() => setStageMode('code')}
            className={`px-2.5 py-1 rounded-lg font-bold ${
              stageMode === 'code' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
            }`}
          >
            Code
          </button>
          <button
            type="button"
            onClick={() => setStageMode('stream')}
            className={`px-2.5 py-1 rounded-lg font-bold ${
              stageMode === 'stream' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
            }`}
          >
            Video
          </button>
          <button
            type="button"
            onClick={() => setStageMode('whiteboard')}
            className={`px-2.5 py-1 rounded-lg font-bold ${
              stageMode === 'whiteboard' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
            }`}
          >
            Board
          </button>
          <button
            type="button"
            onClick={() => setStageMode('split')}
            className={`px-2.5 py-1 rounded-lg font-bold ${
              stageMode === 'split' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
            }`}
          >
            Split
          </button>
        </div>

        {/* =========================================================================
            2. MAIN CONTENT AREA (STAGE + SIDEBAR)
            ========================================================================= */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
          {/* =====================================================================
              LEFT: CLASSROOM STAGE (70% WIDTH ON DESKTOP)
              ===================================================================== */}
          <main className="lg:col-span-8 bg-[#070b14] relative flex flex-col justify-between overflow-hidden p-2 sm:p-4 border-r border-slate-800/80">
            {/* STAGE CONTAINER */}
            <div className="relative flex-1 rounded-2xl overflow-hidden border border-slate-800 bg-[#0b101c] flex flex-col shadow-2xl min-h-0">
              {/* MODE A: LIVE CODE & TERMINAL VIEW */}
              {stageMode === 'code' && (
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  {/* IDE Tab Header */}
                  <div className="h-10 bg-[#0f172a] border-b border-slate-800 px-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 overflow-x-auto py-1">
                      {Object.keys(SAMPLE_CODE_FILES).map((fileName) => {
                        const isCurrent = selectedFile === fileName;
                        return (
                          <button
                            key={fileName}
                            type="button"
                            onClick={() => setSelectedFile(fileName as any)}
                            className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                              isCurrent
                                ? 'bg-slate-800 text-amber-400 border border-slate-700/80'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                            }`}
                          >
                            <Code className="w-3 h-3" />
                            <span>{fileName}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="px-2.5 py-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        title="Copy code"
                      >
                        {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRunCode}
                        disabled={isTerminalRunning}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-[11px] rounded-lg flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{isTerminalRunning ? 'Running...' : 'Run Code'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Code Editor Body */}
                  <div className="flex-1 p-4 font-mono text-xs sm:text-[13px] text-slate-300 overflow-y-auto leading-relaxed bg-[#0b101d]">
                    <pre className="whitespace-pre-wrap font-mono">
                      <code>{codeContent[selectedFile]}</code>
                    </pre>
                  </div>

                  {/* Bottom Integrated Terminal Panel */}
                  <div className="h-32 sm:h-36 bg-[#040711] border-t border-slate-800/90 flex flex-col text-xs font-mono">
                    <div className="px-3 py-1.5 bg-[#090e1a] border-b border-slate-800/80 flex items-center justify-between text-slate-400 text-[11px]">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Interactive Output Terminal</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        node runtime active
                      </span>
                    </div>
                    <div className="flex-1 p-2.5 overflow-y-auto space-y-1 text-slate-400 text-[11px]">
                      {terminalLogs.map((log, idx) => (
                        <div
                          key={idx}
                          className={
                            log.startsWith('>')
                              ? 'text-amber-400 font-bold'
                              : log.startsWith('[OK]')
                              ? 'text-emerald-400'
                              : 'text-slate-300'
                          }
                        >
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Teacher Picture-in-Picture (PIP) Webcam Overlay */}
                  <div className="absolute top-12 right-4 w-36 sm:w-48 h-24 sm:h-32 rounded-2xl overflow-hidden border-2 border-amber-400/90 shadow-2xl bg-black group z-10">
                    <img
                      src={onlineClass.image}
                      alt={onlineClass.instructor}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Live Badge & Instructor Name */}
                    <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-xs text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      TEACHER
                    </div>
                    {/* Audio wave indicator */}
                    <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-xs px-2 py-1 rounded-lg flex items-center justify-between text-[10px]">
                      <span className="text-amber-300 font-bold truncate max-w-[90px]">{onlineClass.instructor}</span>
                      <div className="flex items-center gap-0.5">
                        <span className={`w-1 h-2 bg-emerald-400 rounded-full ${isTeacherSpeaking ? 'animate-bounce' : 'opacity-40'}`} />
                        <span className={`w-1 h-3 bg-emerald-400 rounded-full ${isTeacherSpeaking ? 'animate-bounce delay-100' : 'opacity-40'}`} />
                        <span className={`w-1 h-2 bg-emerald-400 rounded-full ${isTeacherSpeaking ? 'animate-bounce delay-200' : 'opacity-40'}`} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE B: FULL VIDEO STREAM MODE */}
              {stageMode === 'stream' && (
                <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                  <img
                    src={onlineClass.image}
                    alt="Main Live Stream"
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Center live badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-bold text-white">{onlineClass.instructor}’s Camera Stream</span>
                      <span className="text-slate-400 text-[10px]">• 1080p Ultra HD</span>
                    </div>
                  </div>

                  {/* Teacher Mic Waveform */}
                  <div className="absolute bottom-6 left-6 bg-slate-950/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/80 flex items-center gap-3">
                    <img
                      src={onlineClass.instructorAvatar || onlineClass.image}
                      alt={onlineClass.instructor}
                      className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{onlineClass.instructor}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-mono">
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Broadcasting Voice (Crystal Audio)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE C: INTERACTIVE WHITEBOARD */}
              {stageMode === 'whiteboard' && (
                <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
                  {/* Whiteboard Toolbar */}
                  <div className="h-11 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-300">Whiteboard Tools:</span>
                      <div className="flex items-center gap-1.5">
                        {['#38bdf8', '#fbbf24', '#34d399', '#f87171', '#ffffff'].map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setPenColor(color)}
                            style={{ backgroundColor: color }}
                            className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                              penColor === color ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1 ml-2 text-slate-400 text-[11px]">
                        <span>Size:</span>
                        <button
                          type="button"
                          onClick={() => setPenSize(2)}
                          className={`px-2 py-0.5 rounded cursor-pointer ${penSize === 2 ? 'bg-slate-700 text-white' : ''}`}
                        >
                          Thin
                        </button>
                        <button
                          type="button"
                          onClick={() => setPenSize(5)}
                          className={`px-2 py-0.5 rounded cursor-pointer ${penSize === 5 ? 'bg-slate-700 text-white' : ''}`}
                        >
                          Thick
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleClearCanvas}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                      >
                        Clear Board
                      </button>
                    </div>
                  </div>

                  {/* Canvas Drawing Area */}
                  <div className="flex-1 relative overflow-hidden bg-slate-950 flex items-center justify-center">
                    <canvas
                      ref={canvasRef}
                      width={840}
                      height={460}
                      onMouseDown={handleStartDraw}
                      onMouseMove={handleDraw}
                      onMouseUp={handleStopDraw}
                      onMouseLeave={handleStopDraw}
                      className="cursor-crosshair shadow-inner rounded-xl max-w-full max-h-full"
                    />
                  </div>
                </div>
              )}

              {/* MODE D: SPLIT DUAL VIEW */}
              {stageMode === 'split' && (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden bg-slate-950">
                  {/* Left: Code */}
                  <div className="border-r border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-y-auto leading-relaxed bg-[#0b101d]">
                    <div className="text-amber-400 font-bold mb-2">// Split Screen: Live Code</div>
                    <pre className="whitespace-pre-wrap">
                      <code>{codeContent[selectedFile]}</code>
                    </pre>
                  </div>
                  {/* Right: Video Stream */}
                  <div className="relative bg-black flex items-center justify-center overflow-hidden">
                    <img
                      src={onlineClass.image}
                      alt="Instructor Video"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-amber-300 font-bold">
                      {onlineClass.instructor} (Host)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* =========================================================================
                BOTTOM CONTROL CONSOLE (AUDIO, VIDEO, HAND, REACTIONS, ACTIVE VIEWERS)
                ========================================================================= */}
            <div className="pt-3 sm:pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Mic & Camera Controls */}
              <div className="flex items-center gap-2">
                {/* Mic Button */}
                <button
                  type="button"
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  className={`px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isMicMuted
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                      : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30'
                  }`}
                  title={isMicMuted ? 'Click to Unmute Microphone' : 'Click to Mute Microphone'}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isMicMuted ? 'Mic Muted' : 'Mic Active'}</span>
                </button>

                {/* Webcam Button */}
                <button
                  type="button"
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isVideoOff
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                      : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30'
                  }`}
                  title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isVideoOff ? 'Camera Off' : 'Camera On'}</span>
                </button>

                {/* Raise Hand Button */}
                <button
                  type="button"
                  onClick={() => setHandRaised(!handRaised)}
                  className={`px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    handRaised
                      ? 'bg-amber-400 text-slate-950 font-black shadow-lg scale-105'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <span className="text-sm">✋</span>
                  <span className="hidden sm:inline">{handRaised ? 'Hand Raised!' : 'Raise Hand'}</span>
                </button>

                {/* Speaker Mute/Unmute */}
                <button
                  type="button"
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                  title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isAudioMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>

              {/* Emoji Quick Reactions Bar */}
              <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/90 px-2 py-1.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-500 font-semibold px-1 hidden md:inline">React:</span>
                {[
                  { icon: '👏', label: 'Clap' },
                  { icon: '🔥', label: 'Fire' },
                  { icon: '❤️', label: 'Love' },
                  { icon: '💡', label: 'Idea' },
                  { icon: '🚀', label: 'Rocket' }
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => spawnReaction(item.icon)}
                    className="p-1 sm:p-1.5 hover:bg-slate-800 rounded-xl text-base sm:text-lg transition-transform hover:scale-125 cursor-pointer active:scale-95"
                    title={item.label}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>

              {/* Viewers & Network Health */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-slate-200">{onlineClass.enrolledStudentsCount || 35}</span>
                  <span className="hidden sm:inline">Active Students</span>
                </span>
              </div>
            </div>
          </main>

          {/* =====================================================================
              RIGHT: MULTI-TAB WORKSPACE (CHAT, PARTICIPANTS, RESOURCES, POLL)
              ===================================================================== */}
          <aside className="lg:col-span-4 bg-[#0a0f1d] flex flex-col justify-between h-full border-t lg:border-t-0 lg:border-l border-slate-800/80 overflow-hidden">
            {/* Sidebar Tabs Header */}
            <div className="p-2 bg-[#060a14] border-b border-slate-800 flex items-center justify-around text-xs font-bold">
              <button
                type="button"
                onClick={() => setSidebarTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  sidebarTab === 'chat'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Live Q&A</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab('participants')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  sidebarTab === 'participants'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Attendees ({participants.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab('resources')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  sidebarTab === 'resources'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Notes</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab('poll')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  sidebarTab === 'poll'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Quiz</span>
              </button>
            </div>

            {/* TAB 1: LIVE CHAT */}
            {sidebarTab === 'chat' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                {/* Chat Stream */}
                <div className="flex-1 p-3.5 space-y-3 overflow-y-auto text-xs">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-2xl space-y-1 transition-all ${
                        m.isTeacher
                          ? 'bg-gradient-to-r from-amber-500/15 to-amber-600/10 border border-amber-500/30 text-amber-50'
                          : m.user.startsWith('You')
                          ? 'bg-blue-600/25 border border-blue-500/40 text-blue-50 ml-3'
                          : 'bg-slate-900/90 border border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <div className="flex items-center gap-1.5">
                          {m.avatar && (
                            <img
                              src={m.avatar}
                              alt={m.user}
                              className="w-5 h-5 rounded-full object-cover border border-amber-400"
                            />
                          )}
                          <span className={m.isTeacher ? 'text-amber-400' : 'text-blue-300'}>
                            {m.user}
                          </span>
                          {m.role && (
                            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-normal">
                              {m.role}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-normal">{m.time}</span>
                      </div>
                      <p className="leading-relaxed text-xs pl-0.5">{m.text}</p>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                {/* Quick Question Chips */}
                <div className="px-3 py-1.5 bg-[#070b14] border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px]">
                  <span className="text-slate-500 shrink-0 font-semibold">Quick Ask:</span>
                  <button
                    type="button"
                    onClick={() => setChatInput('Can you please re-explain line 15?')}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 cursor-pointer"
                  >
                    Explain line 15
                  </button>
                  <button
                    type="button"
                    onClick={() => setChatInput('Where can we find today’s homework repo?')}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 cursor-pointer"
                  >
                    Homework repo?
                  </button>
                </div>

                {/* Chat Input Bar */}
                <form
                  onSubmit={handleSendChat}
                  className="p-3 bg-[#060a14] border-t border-slate-800 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Ask teacher a question..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="p-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: PARTICIPANTS */}
            {sidebarTab === 'participants' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Active in Class ({participants.length} connected)
                </div>
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-200 flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {p.role.includes('Host') && (
                            <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1 rounded font-bold">
                              HOST
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">{p.role}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400">
                      {p.isMuted ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                      {p.hasCam ? <Video className="w-3.5 h-3.5 text-emerald-400" /> : <VideoOff className="w-3.5 h-3.5 text-slate-500" />}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: NOTES & CODE REPOSITORIES */}
            {sidebarTab === 'resources' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>Today's Lecture Topic</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Building resilient, high-speed full-stack cloud web architectures with Vite, React 19, TypeScript, and Supabase integration.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">
                    Lecture Files & Assets
                  </span>

                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">GitHub Starter Code</div>
                      <div className="text-[10px] text-slate-500">github.com/webdev-school/cohort-2026</div>
                    </div>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Lecture Slides (PDF)</div>
                      <div className="text-[10px] text-slate-500">Architecture-Diagrams-v2.pdf • 4.2 MB</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('Lecture slides downloaded!')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>

                {/* Practical Homework */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="font-bold text-amber-300 text-xs">📝 Hands-on Homework Task:</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                    <li>Fork the repository and run local dev server.</li>
                    <li>Implement responsive navbar with Tailwind CSS.</li>
                    <li>Connect student attendance API endpoint.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 4: LIVE QUIZ & POLL */}
            {sidebarTab === 'poll' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
                      LIVE QUESTION FROM INSTRUCTOR
                    </span>
                    <span className="text-[11px] text-slate-400">68 Votes</span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-100">
                    Which React Hook is primarily designed to handle side-effects like data fetching and subscription listeners?
                  </h4>

                  <div className="space-y-2 pt-1">
                    {[
                      { idx: 0, text: 'useState', votes: pollVotes[0] },
                      { idx: 1, text: 'useEffect', votes: pollVotes[1], isCorrect: true },
                      { idx: 2, text: 'useMemo', votes: pollVotes[2] },
                      { idx: 3, text: 'useRef', votes: pollVotes[3] }
                    ].map((opt) => {
                      const totalVotes = pollVotes.reduce((a, b) => a + b, 0);
                      const pct = Math.round((opt.votes / totalVotes) * 100);
                      const isSelected = pollVoted === opt.idx;

                      return (
                        <button
                          key={opt.idx}
                          type="button"
                          onClick={() => {
                            if (pollVoted === null) {
                              setPollVoted(opt.idx);
                              const updated = [...pollVotes];
                              updated[opt.idx]++;
                              setPollVotes(updated);
                            }
                          }}
                          className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                            isSelected
                              ? 'border-amber-400 bg-amber-400/15'
                              : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                          }`}
                        >
                          {/* Percentage progress bar */}
                          {pollVoted !== null && (
                            <div
                              style={{ width: `${pct}%` }}
                              className={`absolute top-0 bottom-0 left-0 opacity-15 pointer-events-none ${
                                opt.isCorrect ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                          )}

                          <div className="relative flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{opt.text}</span>
                            {pollVoted !== null && (
                              <span className="font-bold text-xs text-amber-300">{pct}%</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {pollVoted !== null && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-[11px] leading-relaxed">
                      <strong>Correct Answer: useEffect!</strong> It executes after rendering to synchronize with external systems, APIs, or database connections.
                    </div>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};
