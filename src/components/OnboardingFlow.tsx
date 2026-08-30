
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Bluetooth, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  HardHat, 
  Activity,
  ArrowRight,
  Loader2,
  XCircle,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface OnboardingFlowProps {
  mode: 'manager' | 'user';
  onComplete: () => void;
}

type CheckStatus = 'idle' | 'verifying' | 'success' | 'fail';

export default function OnboardingFlow({ mode, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<'rules' | 'checklist'>('rules');
  const [progress, setProgress] = useState(0);
  
  // User Mode States
  const [statuses, setStatuses] = useState<Record<string, CheckStatus>>({
    bluetooth: 'idle',
    sensors: 'idle',
    helmet: 'idle',
    environment: 'idle'
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [failCount, setFailCount] = useState<Record<string, number>>({
    bluetooth: 0,
    sensors: 0,
    helmet: 0,
    environment: 0
  });

  // Manager Mode States
  const [workerReadiness, setWorkerReadiness] = useState([
    { id: '1', name: '김철수', status: 'ready' },
    { id: '2', name: '이영희', status: 'waiting' },
    { id: '3', name: '박지성', status: 'ready' },
    { id: '4', name: '최동현', status: 'waiting' },
    { id: '5', name: '정민준', status: 'ready' },
  ]);

  // Simulation for manager: update worker status
  useEffect(() => {
    if (mode === 'manager' && step === 'checklist') {
      const interval = setInterval(() => {
        setWorkerReadiness(prev => {
          const waitingIndices = prev.map((w, i) => w.status === 'waiting' ? i : -1).filter(i => i !== -1);
          if (waitingIndices.length === 0) {
            clearInterval(interval);
            return prev;
          }
          const randomIndex = waitingIndices[Math.floor(Math.random() * waitingIndices.length)];
          const next = [...prev];
          next[randomIndex] = { ...next[randomIndex], status: 'ready' };
          return next;
        });
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [mode, step]);

  const safetyRules = mode === 'user' ? [
    "작업 전 반드시 안전 보호구를 착용하십시오.",
    "모든 센서의 연결 상태를 확인하십시오.",
    "긴급 상황 발생 시 즉시 상황을 전파하십시오.",
    "정해진 작업 구역을 준수해 주십시오."
  ] : [
    "실시간 관제 데이터의 무결성을 확인하십시오.",
    "작업자별 안전 장구 착용 상태를 전수 점검하십시오.",
    "위험 구역 진입 알림 시 즉시 대응 절차를 숙지하십시오.",
    "현장 기상 상태 및 외부 위험 요인을 파악하십시오."
  ];

  const [currentRuleIndex, setCurrentRuleIndex] = useState(0);

  // Loading progress for rules screen
  useEffect(() => {
    if (step === 'rules') {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setTimeout(() => setStep('checklist'), 1000);
            return 100;
          }
          return prev + 1;
        });
      }, 50);

      const ruleTimer = setInterval(() => {
        setCurrentRuleIndex(prev => (prev + 1) % safetyRules.length);
      }, 1500);

      return () => {
        clearInterval(timer);
        clearInterval(ruleTimer);
      };
    }
  }, [step]);

  const handleCheck = async (id: string) => {
    if (statuses[id] === 'success' || statuses[id] === 'verifying') return;

    setErrorMsg(null);
    setStatuses(prev => ({ ...prev, [id]: 'verifying' }));

    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulation logic: Fail the first time for some items, or random chance for others
    // Let's make Bluetooth and Helmet fail on the first try specifically to show the "real check" feel
    const shouldFail = (id === 'bluetooth' || id === 'helmet') && failCount[id] === 0;

    if (shouldFail) {
      setStatuses(prev => ({ ...prev, [id]: 'fail' }));
      setFailCount(prev => ({ ...prev, [id]: prev[id] + 1 }));
      
      if (id === 'bluetooth') setErrorMsg("근처에 페어링할 장비가 발견되지 않았습니다. 장비 전원을 확인하세요.");
      if (id === 'helmet') setErrorMsg("안전모 센서가 머리와 밀착되지 않았습니다. 올바르게 착용 후 다시 시도하세요.");
    } else {
      setStatuses(prev => ({ ...prev, [id]: 'success' }));
    }
  };

  const allChecked = mode === 'user' 
    ? Object.values(statuses).every(v => v === 'success')
    : workerReadiness.every(w => w.status === 'ready');

  if (step === 'rules') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 tech-grid">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg text-center"
        >
          <div className="mb-12 relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-48 h-48 border-2 border-dashed border-[#f97316]/30 rounded-full" />
            </motion.div>
            <div className="relative z-10 flex justify-center">
              <div className="w-24 h-24 bg-[#f97316] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.4)]">
                <ShieldCheck color="white" size={48} />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter italic">Initializing System</h2>
          <p className="text-[#f97316] text-xs font-bold mb-8 uppercase tracking-widest">안전 수칙 로딩 중...</p>

          <div className="bg-[#16191e] border border-gray-800 p-8 rounded-2xl relative overflow-hidden mb-8">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#f97316]" />
            <AnimatePresence mode="wait">
              <motion.div
                key={currentRuleIndex}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="min-h-[80px] flex flex-col justify-center"
              >
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle size={14} className="text-[#f97316]" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Rule 0{currentRuleIndex + 1}</span>
                </div>
                <p className="text-lg font-bold text-white leading-tight">
                  {safetyRules[currentRuleIndex]}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase px-1">
              <span>Security Protocols Loading</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1 bg-gray-900" indicatorClassName="bg-[#f97316]" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 tech-grid">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#16191e] border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5">
           {mode === 'manager' ? <Users size={120} className="text-white" /> : <ShieldCheck size={120} className="text-white" />}
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-[#f97316]/10 rounded-xl mb-4 border border-[#f97316]/20">
            {mode === 'manager' ? <Users className="text-[#f97316]" /> : <CheckCircle2 className="text-[#f97316]" />}
          </div>
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">
            {mode === 'manager' ? 'Site Readiness Monitor' : 'Pre-Operation Checklist'}
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            {mode === 'manager' 
              ? '전체 작업자의 안전 관리 규정 준수 상태를 확인하십시오.' 
              : '작업 시작 전 장비 및 환경 점검을 완료하십시오.'}
          </p>
        </div>

        {mode === 'manager' ? (
          <div className="space-y-6 mb-8">
            {/* Site Summary Card */}
            <div className="bg-[#f97316]/5 border border-[#f97316]/20 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#f97316] uppercase mb-1">Live Site Summary</span>
                <span className="text-white font-bold text-sm">현재 3개 구역 작업 중</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Risk Level</span>
                <span className="text-green-500 font-black italic">LOW</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
                  Worker Readiness Tracking
                </span>
                <span className="text-lg font-black text-white italic">
                  {workerReadiness.filter(w => w.status === 'ready').length} / {workerReadiness.length}
                </span>
              </div>
              <Progress 
                value={(workerReadiness.filter(w => w.status === 'ready').length / workerReadiness.length) * 100} 
                className="h-2 bg-gray-900" 
                indicatorClassName="bg-[#f97316] shadow-[0_0_10px_rgba(249,115,22,0.5)]"
              />
              
              <div className="mt-4 space-y-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                {workerReadiness.map((worker) => (
                  <motion.div 
                    layout
                    key={worker.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      worker.status === 'ready' 
                        ? 'bg-[#f97316]/5 border-[#f97316]/20 text-white' 
                        : 'bg-gray-900/50 border-gray-800 text-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        worker.status === 'ready' ? 'bg-[#f97316] text-white' : 'bg-gray-800 text-[#8a8a8a]'
                      }`}>
                        {worker.name[0]}
                      </div>
                      <span className="font-bold text-sm tracking-tight">{worker.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {worker.status === 'ready' ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#f97316] uppercase">
                          <CheckCircle2 size={12} />
                          Ready
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 uppercase">
                          <Loader2 size={12} className="animate-spin" />
                          Checking
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-4">
              <CheckItem 
                icon={<Bluetooth size={18} />}
                label="블루투스 센서 연결 확인"
                status={statuses.bluetooth}
                onClick={() => handleCheck('bluetooth')}
              />
              <CheckItem 
                icon={<Activity size={18} />}
                label="생체 지표 센서 활성화"
                status={statuses.sensors}
                onClick={() => handleCheck('sensors')}
              />
              <CheckItem 
                icon={<HardHat size={18} />}
                label="안전모 착용 상태 확인"
                status={statuses.helmet}
                onClick={() => handleCheck('helmet')}
              />
              <CheckItem 
                icon={<Zap size={18} />}
                label="주변 작업 환경 안전 점검"
                status={statuses.environment}
                onClick={() => handleCheck('environment')}
              />
            </div>

            <AnimatePresence>
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex gap-3 items-start">
                    <AlertCircle className="text-red-500 shrink-0" size={16} />
                    <p className="text-xs text-red-200 leading-relaxed font-medium">{errorMsg}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        <Button 
          disabled={!allChecked}
          onClick={onComplete}
          className={`w-full h-14 rounded-2xl font-bold text-lg transition-all flex gap-3 ${
            allChecked 
              ? 'bg-[#f97316] hover:bg-[#ea580c] text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]' 
              : 'bg-gray-800 text-gray-500 grayscale'
          }`}
        >
          {allChecked ? (
            <>
              {mode === 'manager' ? '관제 대시보드 진입' : '대시보드 시작하기'}
              <ArrowRight size={20} />
            </>
          ) : (
            mode === 'manager' ? '작업자 준비 대기 중...' : '모든 항목을 점검해 주세요'
          )}
        </Button>
      </motion.div>
    </div>
  );
}

function CheckItem({ icon, label, status, onClick }: { 
  icon: React.ReactNode, 
  label: string, 
  status: CheckStatus, 
  onClick: () => void 
}) {
  const isSuccess = status === 'success';
  const isVerifying = status === 'verifying';
  const isFail = status === 'fail';

  return (
    <button 
      onClick={onClick}
      disabled={isVerifying || isSuccess}
      className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group relative overflow-hidden ${
        isSuccess 
          ? 'bg-[#f97316]/10 border-[#f97316]/50 text-white' 
          : isFail
            ? 'bg-red-500/5 border-red-500/30 text-red-200'
            : isVerifying
              ? 'bg-gray-900/50 border-[#f97316]/30 text-gray-300'
              : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700'
      }`}
    >
      {isVerifying && (
        <motion.div 
          className="absolute inset-0 bg-[#f97316]/5"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      )}

      <div className="flex items-center gap-4 relative z-10">
        <div className={`p-2 rounded-lg transition-colors ${
          isSuccess ? 'bg-[#f97316] text-white' : 
          isFail ? 'bg-red-900/50 text-red-400' :
          isVerifying ? 'bg-orange-950/30 text-[#f97316]' :
          'bg-gray-800 text-gray-500'
        }`}>
          {isVerifying ? <Loader2 size={18} className="animate-spin" /> : icon}
        </div>
        <div className="flex flex-col items-start">
          <span className="font-bold text-sm leading-tight">{label}</span>
          {isVerifying && <span className="text-[9px] text-[#f97316] font-bold uppercase mt-1 animate-pulse">Verifying...</span>}
          {isFail && <span className="text-[9px] text-red-500 font-bold uppercase mt-1">Verification Failed</span>}
        </div>
      </div>

      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all relative z-10 ${
        isSuccess 
          ? 'bg-[#f97316] border-[#f97316] scale-110 shadow-[0_0_10px_rgba(249,115,22,0.3)]' 
          : isFail
            ? 'bg-red-500 border-red-500'
            : isVerifying
              ? 'border-[#f97316]/50 border-t-transparent animate-spin'
              : 'border-gray-700'
      }`}>
        {isSuccess && <CheckCircle2 size={16} className="text-white" />}
        {isFail && <XCircle size={16} className="text-white" />}
      </div>
    </button>
  );
}
