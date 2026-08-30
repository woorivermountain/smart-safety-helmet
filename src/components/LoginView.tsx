
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, User, ShieldCheck } from 'lucide-react';

interface LoginViewProps {
  onLogin: (mode: 'manager' | 'user') => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [mode, setMode] = useState<'manager' | 'user'>('manager');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validId = 'asd123';
    const validPw = '1234';

    if (id === validId && pw === validPw) {
      onLogin(mode);
    } else {
      setError('ID 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 tech-grid">
      <div className="w-full max-w-md relative">
        {/* HHS Logo */}
        <div className="flex flex-col items-center mb-8">
          <svg width="240" height="70" viewBox="0 0 300 80" className="opacity-95 mb-1.5" referrerPolicy="no-referrer">
            {/* Left Column (Grey) */}
            <rect x="10" y="10" width="30" height="60" fill="#8a8a8a" rx="4" />
            <circle cx="75" cy="40" r="15" fill="#8a8a8a" />
            {/* Middle Column (Orange) */}
            <rect x="120" y="10" width="30" height="60" fill="#f97316" rx="4" />
            <circle cx="185" cy="40" r="15" fill="#f97316" />
            <rect x="230" y="10" width="30" height="60" fill="#f97316" rx="4" />
            {/* Right slanted (Grey) */}
            <g transform="rotate(28, 290, 20)">
              <rect x="268" y="-14" width="30" height="42" fill="#8a8a8a" rx="4" />
            </g>
            <g transform="rotate(-28, 290, 60)">
              <rect x="268" y="52" width="30" height="42" fill="#8a8a8a" rx="4" />
            </g>
          </svg>
          <h1 className="text-sm font-semibold text-gray-400 tracking-widest uppercase">Health and Happiness System</h1>
          <p className="text-[#8a8a8a] text-[10px] mt-1 font-mono tracking-widest uppercase">Smart Safety System Connect</p>
        </div>

        <Card className="bg-[#16191e] border-gray-800 shadow-2xl overflow-hidden border-t-[#f97316] border-t-2">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-white">시스템 로그인</CardTitle>
            <CardDescription className="text-gray-400">계정 정보를 입력하여 서비스에 접속하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Mode Selection */}
              <div className="flex bg-gray-900/50 p-1 rounded-lg border border-gray-800">
                <button
                  type="button"
                  onClick={() => setMode('manager')}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                    mode === 'manager' 
                      ? 'bg-[#f97316] text-white shadow-lg' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  관리자 모드
                </button>
                <button
                  type="button"
                  onClick={() => setMode('user')}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                    mode === 'user' 
                      ? 'bg-[#f97316] text-white shadow-lg' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  작업자 모드
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">아이디</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="text"
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                      placeholder="Username"
                      className="w-full bg-gray-900/50 border border-gray-800 rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">비밀번호</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="password"
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-900/50 border border-gray-800 rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-lg text-center font-medium">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold h-12 rounded-lg shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                로그인
              </Button>

              <div className="flex justify-between items-center text-[10px] text-gray-600 font-medium px-1">
                <span>VER 2.1.0</span>
                <span>SECURE CONNECTION</span>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Floating decoration */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 blur-[50px] pointer-events-none rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600/10 blur-[50px] pointer-events-none rounded-full" />
      </div>
    </div>
  );
}
