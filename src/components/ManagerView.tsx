
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  Map as MapIcon, 
  Settings, 
  Search,
  Bell,
  Vibrate,
  Zap,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Wifi,
  WifiOff,
  MapPin,
  MessageSquare,
  Send,
  History,
  HardHat,
  Trash2,
  Filter,
  Brain,
  Download,
  CloudSun,
  Thermometer,
  Wind
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Worker, AlertType, TabType } from '../types';
import SiteMap from './SiteMap';
import { motion } from 'motion/react';

interface ManagerViewProps {
  workers: Worker[];
  onTriggerAlert: (workerId: string, alertTypes: AlertType[]) => void;
  onTriggerBulkAlert: (location: string, alertTypes: AlertType[], floor?: number) => void;
  onResolveAlert: (workerId: string, comment: string) => void;
  onRemoveWorker: (workerId: string) => void;
  onAddWorker?: (newWorkerData: { name: string; location: string; floor: number; customTask: string }) => void;
}

export default function ManagerView({ workers, onTriggerAlert, onTriggerBulkAlert, onResolveAlert, onRemoveWorker, onAddWorker }: ManagerViewProps) {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(workers[0]?.id || '');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [aiComment, setAiComment] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'location' | 'status'>('name');
  const [bulkZone, setBulkZone] = useState('A구역');
  const [bulkFloor, setBulkFloor] = useState('all');
  const [alertConfig, setAlertConfig] = useState<Record<AlertType, boolean>>({
    vibration: true,
    sound: true,
    flash: false
  });

  // New Worker Registration Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerLocation, setNewWorkerLocation] = useState('A구역');
  const [newWorkerFloor, setNewWorkerFloor] = useState(1);
  const [newWorkerTask, setNewWorkerTask] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleAddNewWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName.trim()) {
      alert('작업자 이름을 입력해 주세요.');
      return;
    }
    if (!newWorkerTask.trim()) {
      alert('특이사항(작업 내용)을 입력해 주세요.');
      return;
    }

    if (onAddWorker) {
      onAddWorker({
        name: newWorkerName.trim(),
        location: newWorkerLocation,
        floor: newWorkerFloor,
        customTask: newWorkerTask.trim()
      });
      
      const registeredMsg = `새 가교 근직: '${newWorkerName}' (${newWorkerLocation} ${newWorkerFloor}층, ${newWorkerTask})`;
      setSuccessToast(registeredMsg);
      
      // Auto select the newly added worker after registered
      setTimeout(() => {
        setSuccessToast(null);
      }, 3500);

      // Speak confirmation
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(`${newWorkerName} 작업자 신규 가용 등록이 정상 완료되었습니다.`);
          utterance.lang = 'ko-KR';
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.log(err);
        }
      }

      setShowAddModal(false);
      setNewWorkerName('');
      setNewWorkerLocation('A구역');
      setNewWorkerFloor(1);
      setNewWorkerTask('');
    }
  };

  const sortedWorkers = [...workers].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'location') {
      const locA = `${a.location} ${a.floor}`;
      const locB = `${b.location} ${b.floor}`;
      return locA.localeCompare(locB);
    }
    if (sortBy === 'status') {
      const priority = { emergency: 0, warning: 1, normal: 2 };
      return priority[a.status] - priority[b.status];
    }
    return 0;
  });

  const selectedWorker = workers.find(w => w.id === selectedWorkerId);

  const toggleAlertConfig = (type: AlertType) => {
    setAlertConfig(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleSendAlert = () => {
    const activeTypes = (Object.keys(alertConfig) as AlertType[]).filter(k => alertConfig[k]);
    if (activeTypes.length > 0) {
      onTriggerAlert(selectedWorkerId, activeTypes);
    }
  };

  const getAIAnalysis = (worker: Worker) => {
    if (worker.status === 'normal') {
      return `현재 ${worker.name} 작업자의 모든 생체 지표가 정상 범위 내에 있습니다. 안정적인 상태로 업무 수행 중입니다.`;
    }

    const issues = [];
    if (worker.sensors.heartRate > 100) issues.push(`심박수 상승(${worker.sensors.heartRate.toFixed(1)} BPM)`);
    if (worker.sensors.eeg < 30) issues.push(`집중도 저하(${worker.sensors.eeg.toFixed(1)}%)`);
    if (worker.sensors.oxygen < 95) issues.push(`산소 포화도 주의(${worker.sensors.oxygen.toFixed(1)}%)`);
    if (worker.sensors.temp > 38) issues.push(`체온 상승(${worker.sensors.temp.toFixed(1)}°C)`);
    if (worker.sensors.gas > 0.1) issues.push(`유해 가스 감지(${worker.sensors.gas.toFixed(1)} ppm)`);
    if (!worker.sensors.helmetWorn) issues.push('안전모 미착용');
    if (worker.sensors.isFalling) issues.push('추락 감지');

    const issueText = issues.length > 0 ? issues.join(', ') : '생체 지표 불안정';

    if (worker.status === 'emergency') {
      return `${worker.name} 작업자에게 위험 상황(${issueText})이 발생했습니다! 즉시 현장 확인 및 구호 조치가 필요합니다.`;
    }

    return `${worker.name} 작업자의 지표(${issueText})가 주의 수준입니다. 원격 음성 교신을 통해 상태를 확인해 주세요.`;
  };

  const handleResolve = () => {
    if (aiComment.trim()) {
      onResolveAlert(selectedWorkerId, aiComment);
      setAiComment('');
    }
  };

  return (
    <div className="flex h-screen bg-[#0f1115] text-white font-sans overflow-hidden tech-grid">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 flex flex-col bg-[#16191e]">
        <div className="p-5 border-b border-gray-800">
          <div className="flex flex-col gap-2 mb-2">
            <svg width="150" height="42" viewBox="0 0 300 80" className="opacity-95" referrerPolicy="no-referrer">
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
            <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none">Health & Happiness</h2>
          </div>
          <p className="text-[10px] text-[#f97316] font-mono tracking-widest font-bold uppercase leading-none">Smart Control System</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem 
            icon={<Activity size={18} />} 
            label="대시보드" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<Users size={18} />} 
            label="작업자 관리" 
            active={activeTab === 'workers'} 
            onClick={() => setActiveTab('workers')} 
          />
          <NavItem 
            icon={<MapIcon size={18} />} 
            label="현장 맵" 
            active={activeTab === 'map'} 
            onClick={() => setActiveTab('map')} 
          />
          <NavItem 
            icon={<Clock size={18} />} 
            label="이력 로그" 
            active={activeTab === 'logs'} 
            onClick={() => setActiveTab('logs')} 
          />
          <NavItem 
            icon={<Settings size={18} />} 
            label="시스템 설정" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50">
            <div className="w-8 h-8 rounded-full bg-[#f97316] flex items-center justify-center font-bold text-xs text-white">AD</div>
            <div>
              <p className="text-xs font-bold text-white">관리자</p>
              <p className="text-[10px] text-gray-400">Demo workspace</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#16191e]">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-300">
              {activeTab === 'dashboard' ? '실시간 모니터링' : 
               activeTab === 'map' ? '현장 위치 관제' : 
               activeTab === 'logs' ? '이력 및 로그' : 
               activeTab === 'workers' ? '작업자 통합 관리' : '시스템 설정'}
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                시스템 정상
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-[#f97316]/10 border border-[#f97316]/20 px-3 py-1.5 rounded-full">
              <div className="flex items-center gap-1.5 border-r border-[#f97316]/20 pr-3">
                <CloudSun size={14} className="text-[#f97316]" />
                <span className="text-[10px] font-black text-white italic">24.5°C</span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-[#f97316]/20 pr-3">
                <Wind size={14} className="text-[#f97316]" />
                <span className="text-[10px] font-black text-white italic">4.2m/s</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-green-500" />
                <span className="text-[10px] font-black text-white italic uppercase">Safe Site</span>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="작업자 검색..." 
                className="bg-gray-800 border-none rounded-full py-1.5 pl-9 pr-4 text-xs text-white focus:ring-1 focus:ring-[#f97316] outline-none w-48 placeholder:text-gray-500"
              />
            </div>
            <Button variant="ghost" size="icon" className="relative text-gray-300 hover:text-white">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#16191e]" />
            </Button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <>
              {/* Worker List */}
              <div className="w-80 border-r border-gray-800 flex flex-col bg-[#121418]">
                {/* Bulk Alert Section */}
                <div className="p-4 border-b border-gray-800 bg-red-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert size={14} className="text-red-500" />
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-red-500">구역/층별 일괄 알림</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <select 
                      value={bulkZone}
                      onChange={(e) => setBulkZone(e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-[10px] text-white outline-none focus:ring-1 focus:ring-red-500"
                    >
                      {['A구역', 'B구역', 'C구역', 'D구역', 'E구역'].map(z => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                    <select 
                      value={bulkFloor}
                      onChange={(e) => setBulkFloor(e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-[10px] text-white outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="all">전체 층</option>
                      <option value="1">1F</option>
                      <option value="2">2F</option>
                      <option value="3">3F</option>
                    </select>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full h-8 text-[10px] font-bold gap-2"
                    onClick={() => {
                      const activeTypes = (Object.keys(alertConfig) as AlertType[]).filter(k => alertConfig[k]);
                      onTriggerBulkAlert(bulkZone, activeTypes, bulkFloor === 'all' ? undefined : parseInt(bulkFloor));
                    }}
                  >
                    <Send size={12} />
                    {bulkZone} {bulkFloor === 'all' ? '전체' : `${bulkFloor}F`} 발송
                  </Button>
                </div>

                <div className="p-4 border-b border-gray-800 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">작업자 목록 ({workers.length})</h3>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`text-[10px] h-7 px-2 ${sortBy === 'name' ? 'bg-[#f97316]/20 text-[#f97316]' : 'text-gray-400'}`}
                        onClick={() => setSortBy('name')}
                      >
                        이름순
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`text-[10px] h-7 px-2 ${sortBy === 'location' ? 'bg-[#f97316]/20 text-[#f97316]' : 'text-gray-400'}`}
                        onClick={() => setSortBy('location')}
                      >
                        위치순
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`text-[10px] h-7 px-2 ${sortBy === 'status' ? 'bg-[#f97316]/20 text-[#f97316]' : 'text-gray-400'}`}
                        onClick={() => setSortBy('status')}
                      >
                        상태순
                      </Button>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-[11px] font-black h-8 text-[#f97316] border-[#f97316]/30 hover:bg-[#f97316]/10 hover:text-white"
                    onClick={() => setShowAddModal(true)}
                  >
                    + 신규 작업자 등록
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="p-2 space-y-1">
                    {sortedWorkers.map(worker => (
                      <button
                        key={worker.id}
                        onClick={() => setSelectedWorkerId(worker.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all border ${
                          selectedWorkerId === worker.id 
                            ? 'bg-[#f97316] border-[#ea580c] text-white shadow-lg' 
                            : 'bg-gray-900/40 border-transparent hover:bg-gray-800 text-gray-300 hover:text-white'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{worker.name}</span>
                            {worker.isConnected ? (
                              <Wifi size={10} className="text-green-500" />
                            ) : (
                              <WifiOff size={10} className="text-red-500" />
                            )}
                          </div>
                          <StatusBadge status={worker.status} />
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="flex gap-2 text-[10px] opacity-90">
                            <span className="flex items-center gap-1"><Activity size={10} /> {worker.sensors.heartRate.toFixed(1)}</span>
                            <span className="flex items-center gap-1 font-mono">{worker.location}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Details Area */}
              <div className="flex-1 p-8 overflow-y-auto bg-[#0f1115]">
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Celebratory Banner when all alerts are cleared */}
                  {workers.every(w => w.status === 'normal') && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600/20 via-green-600/10 to-teal-600/20 border-2 border-emerald-500 flex items-center justify-between shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                    >
                      <div className="flex items-center gap-3.5 text-left">
                        <div className="w-11 h-11 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-extrabold text-lg border border-emerald-500/40 animate-bounce">
                          ✅
                        </div>
                        <div>
                           <span className="text-[10px] uppercase font-black text-emerald-400 tracking-widest block font-mono">ALL TASKS RESOLVED</span>
                           <h4 className="text-white font-extrabold text-sm">현장 안전 신호: 모든 위험 경보 해제 완료 (작업 임무 달성)</h4>
                           <p className="text-[11px] text-gray-400 mt-0.5">현재 관내 모든 작업자의 생체정보 및 위험 요소가 성공적으로 관리 통제되고 있습니다.</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 font-mono">
                         <span className="text-[9px] font-black text-emerald-400">STATUS LEVEL</span>
                         <span className="text-[11px] font-black text-white px-2 py-0.5 rounded bg-emerald-500/30 animate-pulse uppercase">100% SECURE</span>
                      </div>
                    </motion.div>
                  )}

                  {selectedWorker ? (
                    <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-3xl font-black tracking-tighter text-white">{selectedWorker.name}</h2>
                          <Badge variant={selectedWorker.isConnected ? "outline" : "destructive"} className={selectedWorker.isConnected ? "bg-green-500/10 text-green-400 border-green-500/20" : ""}>
                            {selectedWorker.isConnected ? "연동 중" : "연동 끊김"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                          <MapPin size={14} className="text-[#f97316]" />
                          <span>ID: {selectedWorker.id} • {selectedWorker.location} {selectedWorker.floor}F</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="border-red-500/50 text-red-500 hover:bg-red-500/10 font-bold gap-2"
                          onClick={() => {
                            if (window.confirm(`${selectedWorker.name} 작업자를 목록에서 제외하시겠습니까?`)) {
                              onRemoveWorker(selectedWorker.id);
                              setSelectedWorkerId(workers.find(w => w.id !== selectedWorker.id)?.id || '');
                            }
                          }}
                        >
                          <Trash2 size={16} />
                          작업자 제외
                        </Button>
                        <Button variant="destructive" className="font-bold px-6" onClick={handleSendAlert}>긴급 알림 발송</Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <MetricCard 
                        label="심박수" 
                        value={selectedWorker.sensors.heartRate.toFixed(1)} 
                        unit="BPM" 
                        trend="+2" 
                        status={selectedWorker.sensors.heartRate > 140 ? 'error' : 'normal'}
                      />
                      <MetricCard 
                        label="뇌파 활성도" 
                        value={selectedWorker.sensors.eeg.toFixed(1)} 
                        unit="%" 
                        trend="-5" 
                        status={selectedWorker.sensors.eeg < 20 ? 'warning' : 'normal'}
                      />
                      <MetricCard 
                        label="산소 포화도" 
                        value={selectedWorker.sensors.oxygen.toFixed(1)} 
                        unit="%" 
                        trend="0" 
                        status={selectedWorker.sensors.oxygen < 95 ? 'error' : 'normal'}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* Alert Control Panel */}
                      <Card className="bg-[#16191e] border-gray-800">
                        <CardHeader>
                          <CardTitle className="text-sm font-bold uppercase tracking-wider text-white">알림 제어 패널</CardTitle>
                          <CardDescription className="text-xs text-gray-400">작업자에게 보낼 알림 수단을 선택하세요.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <AlertToggle 
                            icon={<Vibrate size={18} />} 
                            label="진동 알림" 
                            active={alertConfig.vibration} 
                            onToggle={() => toggleAlertConfig('vibration')} 
                          />
                          <AlertToggle 
                            icon={<Bell size={18} />} 
                            label="소리 알림" 
                            active={alertConfig.sound} 
                            onToggle={() => toggleAlertConfig('sound')} 
                          />
                          <AlertToggle 
                            icon={<Zap size={18} />} 
                            label="플래시 알림" 
                            active={alertConfig.flash} 
                            onToggle={() => toggleAlertConfig('flash')} 
                          />
                          <div className="pt-4">
                            <Button className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold" onClick={handleSendAlert}>
                              선택한 알림 전송
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* AI & Resolution Panel */}
                      <Card className="bg-[#16191e] border-gray-800">
                        <CardHeader>
                          <CardTitle className="text-sm font-bold uppercase tracking-wider text-white">AI 분석 및 조치</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="p-3 bg-[#f97316]/10 rounded-lg border border-[#f97316]/20">
                            <p className="text-[10px] text-[#f97316] font-bold uppercase mb-1">AI 분석 의견</p>
                            <p className="text-xs text-gray-200 leading-relaxed">
                              {getAIAnalysis(selectedWorker)}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">관리자 조치 메모</label>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-[10px] text-[#f97316] hover:text-[#ea580c] hover:bg-[#f97316]/10 gap-1"
                                onClick={() => {
                                  const suggestions = [];
                                  if (selectedWorker.sensors.heartRate > 100) suggestions.push('휴식 권고');
                                  if (selectedWorker.sensors.eeg < 30) suggestions.push('작업 중단');
                                  if (!selectedWorker.sensors.helmetWorn) suggestions.push('안전모 착용 지시');
                                  if (selectedWorker.sensors.isFalling) suggestions.push('긴급 출동');
                                  const suggestionText = suggestions.length > 0 ? suggestions.join(', ') : '상태 확인 완료';
                                  setAiComment(`AI 제안: ${suggestionText}`);
                                }}
                              >
                                <Brain size={12} />
                                AI 조치 제안
                              </Button>
                            </div>
                            <div className="relative">
                              <textarea 
                                value={aiComment}
                                onChange={(e) => setAiComment(e.target.value)}
                                placeholder="조치 사항을 직접 입력하세요..."
                                className="w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-xs text-white min-h-[80px] focus:ring-1 focus:ring-[#f97316] outline-none resize-none"
                              />
                            </div>
                            <Button 
                              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold gap-2"
                              disabled={!aiComment.trim() || selectedWorker.status === 'normal'}
                              onClick={handleResolve}
                            >
                              <CheckCircle2 size={16} />
                              상태 정상으로 복구
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="h-full py-20 flex flex-col items-center justify-center text-gray-400 bg-[#121418]/50 rounded-2xl border border-gray-800/40">
                    <Users size={64} className="mb-4 opacity-20 text-gray-500" />
                    <p>작업자를 선택하여 상세 정보를 확인하세요.</p>
                  </div>
                )}
              </div>
            </div>
            </>
          )}

          {/* Map View */}
          {activeTab === 'map' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]">
               <div className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#16191e]/50 backdrop-blur-sm shrink-0">
                  <div className="flex items-center gap-3">
                     <MapPin className="text-[#f97316]" size={18} />
                     <h3 className="text-sm font-bold uppercase tracking-widest text-white">Digital Twin 관제</h3>
                     <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 animate-pulse">
                        ⚠️ C구역 제한구역 설정됨
                     </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                        <div className="w-2 h-2 rounded-full bg-[#f97316]" /> 정상 작업
                        <div className="w-2 h-2 rounded-full bg-red-500" /> 위급/월경
                     </div>
                  </div>
               </div>
               <div className="flex-1 p-6 relative">
                  <SiteMap 
                    workers={workers} 
                    onZoneAlert={(zone, workers) => console.log(`Alert in ${zone}:`, workers)} 
                  />
               </div>
            </div>
          )}

          {/* Logs View */}
          {activeTab === 'logs' && (
            <div className="flex-1 p-8 bg-[#0f1115] overflow-y-auto">
              <div className="max-w-4xl mx-auto pb-12">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-2xl font-black flex items-center gap-2 text-white">
                     <History className="text-[#f97316]" /> 전체 시스템 로그 및 준수 이력
                   </h3>
                   <Button 
                     variant="outline" 
                     className="bg-[#f97316]/10 border-[#f97316]/20 text-[#f97316] hover:bg-[#ea580c] hover:text-white font-bold gap-2"
                     onClick={() => {
                        const csvContent = "Timestamp,Worker,Type,Message\n" + 
                          workers.flatMap(w => w.logs.map(l => `${l.timestamp},${w.name},${l.type},"${l.message}"`)).join("\n");
                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `HHS_Safety_Report_${new Date().toISOString().split('T')[0]}.csv`;
                        a.click();
                     }}
                   >
                     <Download size={16} />
                     PDF/CSV 리포트 추출
                   </Button>
                </div>
                <Card className="bg-[#16191e] border-gray-800">
                  <ScrollArea className="h-[600px]">
                    <div className="p-4 space-y-4">
                      {workers.flatMap(w => w.logs.map(l => ({ ...l, workerName: w.name }))).sort((a, b) => b.timestamp.localeCompare(a.timestamp)).map((log, i) => (
                        <div key={i} className="flex gap-4 p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                          <div className="text-[10px] font-mono text-gray-400 pt-1">{log.timestamp}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-[10px] py-0 text-white border-gray-700">{log.workerName}</Badge>
                              <span className={`text-[10px] font-bold uppercase ${
                                log.type === 'alert' ? 'text-red-400' : 
                                log.type === 'comment' ? 'text-[#f97316]' : 'text-gray-400'
                              }`}>{log.type}</span>
                            </div>
                            <p className="text-sm text-white font-medium">{log.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </div>
            </div>
          )}

          {/* Workers Management View */}
          {activeTab === 'workers' && (
            <div className="flex-1 p-8 bg-[#0f1115] overflow-y-auto">
              <div className="max-w-6xl mx-auto w-full">
                <div className="flex justify-between items-center mb-8 shrink-0">
                  <h3 className="text-2xl font-black flex items-center gap-2 text-white">
                    <Users className="text-[#f97316]" /> 작업자 통합 관리
                  </h3>
                  <Button 
                    className="bg-[#f97316] hover:bg-[#ea580c] font-bold"
                    onClick={() => setShowAddModal(true)}
                  >
                    새 작업자 등록
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
                  {workers.map(w => (
                    <Card key={w.id} className="bg-[#16191e] border-gray-800 hover:border-[#f97316]/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                            <HardHat size={20} className="text-gray-500" />
                          </div>
                          <StatusBadge status={w.status} />
                        </div>
                        <h4 className="font-bold text-lg mb-1 text-white">{w.name}</h4>
                        <p className="text-xs text-gray-400 mb-4">{w.location} {w.floor}F</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-gray-400">연동 상태</span>
                            <span className={w.isConnected ? 'text-green-400' : 'text-red-400'}>{w.isConnected ? 'CONNECTED' : 'OFFLINE'}</span>
                          </div>
                          <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-[#f97316] h-full" style={{ width: `${w.sensors.eeg}%` }} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Settings View */}
          {activeTab === 'settings' && (
            <div className="flex-1 p-8 bg-[#0f1115]">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-2 text-white">
                  <Settings className="text-[#f97316]" /> 시스템 설정
                </h3>
                <div className="space-y-6">
                  <Card className="bg-[#16191e] border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-sm text-white">알림 임계값 설정</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-300">심박수 위험 기준 (상한)</span>
                        <Badge variant="outline" className="text-white border-gray-700">140 BPM</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-300">뇌파 활성도 경고 기준</span>
                        <Badge variant="outline" className="text-white border-gray-700">20 %</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-300">산소 농도 위험 기준</span>
                        <Badge variant="outline" className="text-white border-gray-700">95 %</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#16191e] border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-sm text-white">시스템 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs text-gray-400">
                      <div className="flex justify-between">
                        <span className="text-gray-400">버전</span>
                        <span className="text-white font-medium">v2.4.0-stable</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">마지막 업데이트</span>
                        <span className="text-white font-medium">2026-04-09 21:00</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* New Worker Registration Modal overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div 
            className="bg-[#16191e] border border-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#1c222c] px-6 py-5 border-b border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span className="text-[#f97316]">👷</span> 신규 현장 근로자 대장 등록
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  HHS 스마트 헬멧 시스템 안전망에 새로운 작업자를 편입 등록합니다.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddNewWorkerSubmit} className="p-6 space-y-5">
              {/* Input: Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                  <span className="text-[#f97316]">●</span> 작업자 성명
                </label>
                <input 
                  type="text"
                  required
                  placeholder="예: 홍길동"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  className="w-full bg-[#0f1115] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-all"
                />
              </div>

              {/* Input: Location/Zone */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                  <span className="text-[#f97316]">●</span> 담당 구역 배정
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {['A구역', 'B구역', 'C구역', 'D구역', 'E구역'].map(zone => (
                    <button
                      key={zone}
                      type="button"
                      onClick={() => setNewWorkerLocation(zone)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        newWorkerLocation === zone 
                          ? 'bg-[#f97316]/10 border-[#f97316] text-[#f97316]' 
                          : 'bg-[#0f1115] border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      {zone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input: Floor */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                  <span className="text-[#f97316]">●</span> 작업 층수
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map(floor => (
                    <button
                      key={floor}
                      type="button"
                      onClick={() => setNewWorkerFloor(floor)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                        newWorkerFloor === floor 
                          ? 'bg-[#f97316]/10 border-[#f97316] text-[#f97316]' 
                          : 'bg-[#0f1115] border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <span>🏢</span> {floor}층
                    </button>
                  ))}
                </div>
              </div>

              {/* Input: Task Details */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                  <span className="text-[#f97316]">●</span> 특이 사항 및 세부 과업
                </label>
                <textarea 
                  required
                  placeholder="예: 고소 철골 조립 및 전선 안전 피목 계측"
                  value={newWorkerTask}
                  onChange={(e) => setNewWorkerTask(e.target.value)}
                  className="w-full bg-[#0f1115] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] h-20 resize-none transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-[#1c222c] hover:bg-[#252c38] text-gray-300 font-bold py-3 text-xs rounded-xl transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-black py-3 text-xs rounded-xl shadow-lg hover:shadow-[#f97316]/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  정상 가용 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real-time success toast popup */}
      {successToast && (
        <div className="fixed top-6 right-6 z-[200] max-w-sm bg-[#161a21]/95 text-white border-2 border-green-500/50 p-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm font-bold animate-pulse">
            ✓
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-green-400 uppercase tracking-widest leading-none">신규 등록 성공</h4>
            <p className="text-[11px] text-gray-300 leading-tight mt-1">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-[#f97316]/10 text-[#f97316]' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: Worker['status'] }) {
  const configs = {
    normal: { label: '정상', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    warning: { label: '주의', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    emergency: { label: '비상', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase ${configs[status].color}`}>
      {configs[status].label}
    </span>
  );
}

function MetricCard({ label, value, unit, trend, status }: { label: string, value: string | number, unit: string, trend: string, status: 'normal' | 'warning' | 'error' }) {
  const colors = {
    normal: 'text-white',
    warning: 'text-yellow-400',
    error: 'text-red-400'
  };
  return (
    <div className="bg-[#16191e] border border-gray-800 p-4 rounded-xl">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-black ${colors[status]}`}>{value}</span>
        <span className="text-xs text-gray-500 font-medium">{unit}</span>
      </div>
      <div className="mt-2 flex items-center gap-1">
        <span className={`text-[10px] font-bold ${trend.startsWith('+') ? 'text-red-400' : 'text-green-400'}`}>
          {trend} {unit}
        </span>
        <span className="text-[10px] text-gray-500">vs 10분 전</span>
      </div>
    </div>
  );
}

function AlertToggle({ icon, label, active, onToggle }: { icon: React.ReactNode, label: string, active: boolean, onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-800">
      <div className="flex items-center gap-3">
        <div className={`${active ? 'text-[#f97316]' : 'text-gray-500'}`}>{icon}</div>
        <span className="text-xs font-bold text-gray-200">{label}</span>
      </div>
      <Switch checked={active} onCheckedChange={onToggle} />
    </div>
  );
}

function StatusItem({ label, status }: { label: string, status: 'ok' | 'warning' | 'error' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-300">{label}</span>
      {status === 'ok' ? (
        <CheckCircle2 size={14} className="text-green-500" />
      ) : status === 'warning' ? (
        <AlertCircle size={14} className="text-yellow-500" />
      ) : (
        <AlertCircle size={14} className="text-red-500" />
      )}
    </div>
  );
}

function Heart({ size, className }: { size?: number, className?: string }) {
  return <Activity size={size} className={className} />;
}
