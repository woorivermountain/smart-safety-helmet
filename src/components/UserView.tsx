import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Brain, 
  Thermometer, 
  Wind, 
  AlertTriangle, 
  ShieldAlert, 
  ChevronRight,
  Bell,
  Vibrate,
  Zap,
  MapPin,
  Volume2,
  Phone,
  MessageSquare,
  HelpCircle,
  FileText,
  Users,
  ShieldCheck,
  Check,
  Play,
  Share2,
  RefreshCw,
  AlertCircle,
  Smartphone,
  BookOpen,
  CheckCircle2,
  Eye,
  Settings,
  ChevronDown,
  Lock,
  Flame,
  Activity
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Worker, AlertType } from '../types';

interface UserViewProps {
  worker: Worker;
  onConfirmAlert: () => void;
  onUpdateWorker?: (fields: Partial<Worker>) => void;
}

const translations = {
  ko: {
    title: "HHS 스마트 안전 관제",
    subtitle: "Health & Happiness",
    appTab: "스마트 안전앱",
    designTab: "R&D / UX 기획서",
    statusNormal: "정상 가동형",
    gpsTitle: "① 금일 현장 작업 위치 & 내용 입력 (GPS 음영 백업)",
    locationLabel: "작업 구역",
    taskLabel: "작업 내용",
    gpsDetail: "GPS 전파 음영 지하 구역에서도 맥락 정보 기반으로 신속 정밀 위치 정보를 제공합니다.",
    changeLocation: "위치/작업 변경 입력",
    voiceTitle: "④ 긴급 음성 구조 요청",
    voiceDesc: "'살려줘', '도와줘' 키워드 혹은 마이크 터치를 통한 원클릭 긴급 전파 기능입니다. 전파 시 5초 지연 취소 기회가 제공됩니다.",
    keywordSave: "살려줘 (구조 요청)",
    keywordHelp: "도와줘 (지원 요청)",
    fatigueTitle: "① 피로도 & 컨디션 실시간 분석 (뇌파·심박수 조합)",
    stable: "안정",
    unstable: "불안정",
    danger: "위험",
    fatigueStatus: "피로도 수위 및 컨디션 인덱스",
    antiFatigue: "③ 경보 피로 방지 필터 (Alarm Fatigue Guard)",
    filterActive: "활성 상태 (미세 소음 무시)",
    filterInactive: "해제 상태 (모든 소음 경보)",
    toggleFilter: "필터 전환",
    gasTitle: "⑩ 환경 유해 가스 & 산소 센서 (안정·불안정·위험 3단계)",
    o2Label: "산소 농도 (O2)",
    gasLabel: "유해가스 농도 (VOCs)",
    hazardTitle: "⑪ 주변 위험 구조물 알림 피드",
    hazardDesc: "정보기술 비콘 기반으로 안전망 주변의 미가공 위험 요소를 인공지능이 분석합니다.",
    sosButton: "긴급전화 SOS",
    shareHazard: "위험요소 공유",
    cprGuide: "주변 조치: 심폐소생술(CPR) 골든타임 4분 가이드",
    onboardingInfo: "테스트용 낙상 충격 시뮬레이터",
    triggerFallSim: "낙상 신호 모조 기동",
    pointsCollected: "적립 포인트",
    cashwalkClaim: "슬라이드 확인 시 캐시워크 100포인트가 즉시 지급됩니다!",
    volumeHoldRescue: "볼륨 Down 버튼을 3초간 길게 눌러도 경보가 해제됩니다.",
    unconsciousAlert: "⚠️ 무응답: 자동 기절 상태 판단됨! 신호 발송중"
  },
  en: {
    title: "HHS Smart Safety Control",
    subtitle: "Health & Happiness",
    appTab: "Smart App",
    designTab: "R&D Plan",
    statusNormal: "Normal Connection",
    gpsTitle: "① Daily Work Location & Task Input (GPS Backup)",
    locationLabel: "Work Zone",
    taskLabel: "Work Details",
    gpsDetail: "Provides immediate, micro-context location using database fallback even under heavy thick concrete where GPS signals are blocked.",
    changeLocation: "Update Location & Task",
    voiceTitle: "④ Emergency Voice Rescue",
    voiceDesc: "Automatically recognizes emergency vocal triggers ('Save me', 'Help me') with an auto-cancel 5-second countdown timer option.",
    keywordSave: "'Save me' (SOS)",
    keywordHelp: "'Help me' (Support)",
    fatigueTitle: "① Fatigue & Biometric Analysis (EEG & ECG)",
    stable: "Stable",
    unstable: "Unstable",
    danger: "Danger",
    fatigueStatus: "Biometric Condition Index",
    antiFatigue: "③ Alarm Fatigue Suppressive Filter",
    filterActive: "Active (Muffling micro-noises)",
    filterInactive: "Inactive (All alerts live)",
    toggleFilter: "Toggle Filter",
    gasTitle: "⑩ Oxygen & Hazardous Gas Levels",
    o2Label: "Oxygen Level (O2)",
    gasLabel: "Hazardous Gas (VOC/CO)",
    hazardTitle: "⑪ Surrounding Hazardous Infrastructure",
    hazardDesc: "Real-time automated sensing of unstable structures and crane loads in proximity.",
    sosButton: "Emergency SOS",
    shareHazard: "Report Hazard",
    cprGuide: "First-Aid: CPR Golden Time 4-Minute Guide",
    onboardingInfo: "Fall Sensor Simulator Override",
    triggerFallSim: "Simulate Fall Impact",
    pointsCollected: "Earned Points",
    cashwalkClaim: "Receive 100 CashWalk points immediately upon verifying your safety slide!",
    volumeHoldRescue: "You can also hold the Volume Down button for 3 seconds as an alternative.",
    unconsciousAlert: "⚠️ Unresponsive: Automatic Unconscious State dispatches Rescue!"
  },
  vi: {
    title: "Giám Sát An Toàn HHS",
    subtitle: "Yêu và Hạnh Phúc",
    appTab: "Ứng dụng An Toàn",
    designTab: "R&D / Bản UX",
    statusNormal: "Trạng thái Bình thường",
    gpsTitle: "① Nhập vị trí & Công việc hàng ngày (Dữ liệu dự phòng)",
    locationLabel: "Khu vực làm việc",
    taskLabel: "Chi tiết công việc",
    gpsDetail: "Cung cấp vị trí chính xác dựa trên ngữ cảnh ngay cả ở những khu vực không có sóng GPS.",
    changeLocation: "Cập nhật Vị trí & Công việc",
    voiceTitle: "④ Yêu cầu Cứu hộ khẩn cấp bằng giọng nói",
    voiceDesc: "Tự động nhận diện cụm từ: 'Cứu tôi', 'Giúp tôi' với thời gian đệm 5 giây cho phép hủy nhanh.",
    keywordSave: "'Cứu tôi' (Trực tuyến)",
    keywordHelp: "'Giúp tôi' (Hỗ trợ)",
    fatigueTitle: "① Phân tích trạng thái mệt mỏi (Điện não đồ & Nhịp tim)",
    stable: "Ổn định",
    unstable: "Không ổn định",
    danger: "Nguy hiểm",
    fatigueStatus: "Chỉ số mệt mỏi & Thể trạng",
    antiFatigue: "③ Bộ lọc giảm mệt mỏi cảnh báo (Alarm Fatigue)",
    filterActive: "Bật bộ lọc (Mute cảnh báo nhẹ)",
    filterInactive: "Tắt bộ lọc (Báo cáo đầy đủ)",
    toggleFilter: "Thay đổi bộ lọc",
    gasTitle: "⑩ Đo Nồng độ Oxy & Khí độc hại",
    o2Label: "Nồng độ Oxy (O2)",
    gasLabel: "Nồng độ khí độc (VOCs)",
    hazardTitle: "⑪ Cảnh báo cấu trúc nguy hiểm xung quanh",
    hazardDesc: "Nhận diện thời gian thực các vật thể rơi tự do và tải trọng cẩu tháp lân cận.",
    sosButton: "Kêu cứu khẩn cấp",
    shareHazard: "Báo cáo nguy hiểm",
    cprGuide: "Sơ cứu: Hướng dẫn sơ cứu CPR trong 4 phút vàng",
    onboardingInfo: "Mô phỏng đâm ngã va đập",
    triggerFallSim: "Kích hoạt mô phỏng rơi ngã",
    pointsCollected: "Điểm đã nhận",
    cashwalkClaim: "Nhận ngay 100 điểm CashWalk sau khi trượt xác nhận an toàn!",
    volumeHoldRescue: "Bạn cũng có thể nhấn giữ phím Âm lượng xuống trong 3 giây để tắt.",
    unconsciousAlert: "⚠️ Không phản hồi: Tự động phát hiện bất tỉnh!"
  }
};

export default function UserView({ worker, onConfirmAlert, onUpdateWorker }: UserViewProps) {
  // Navigation: "app" for mobile, "research" for PPT / Research Brief deck
  const [activeTab, setActiveTab] = useState<'app' | 'research'>('app');
  const [eegActive, setEegActive] = useState(true);
  const [simulateFallTrigger, setSimulateFallTrigger] = useState(false);
  const [simulationDelay, setSimulationDelay] = useState<number | null>(null);
  const [showSpeechBubble, setShowSpeechBubble] = useState<string | null>(null);
  const [activeSpeechInput, setActiveSpeechInput] = useState('');
  
  // Accessibility & Language Support
  const [language, setLanguage] = useState<'ko' | 'en' | 'vi'>('ko');
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'highcontrast'>('dark');

  // Manual GPS-Shadow Fallback Task/Location Entry
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editedLocation, setEditedLocation] = useState(worker.location || 'A구역');
  const [editedFloor, setEditedFloor] = useState(worker.floor || 4);
  const [editedTask, setEditedTask] = useState(worker.customTask || '용접 작업');

  // Custom states for HHS Dialogue mode
  const [dialogueActive, setDialogueActive] = useState(false);
  const [dialogueStep, setDialogueStep] = useState(1);
  const [dialogueCountdown, setDialogueCountdown] = useState(5);
  const [dialogueVolumeMaxed, setDialogueVolumeMaxed] = useState(true);
  const [isVibrating, setIsVibrating] = useState(false);
  const [dialogueLogs, setDialogueLogs] = useState<string[]>([]);
  
  // Alternative volume cancellation holding
  const [isHoldingVolume, setIsHoldingVolume] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  // Rewards wallet / gaming gamified states
  const [rewardsWallet, setRewardsWallet] = useState(1200);
  const [coins, setCoins] = useState<Array<{ id: number; x: number; y: number; rotate: number; delay: number }>>([]);
  const [pointRewardAmount, setPointRewardAmount] = useState<number | null>(null);
  const [luckyBoxOpened, setLuckyBoxOpened] = useState(false);
  const [showSimulationTools, setShowSimulationTools] = useState(false);

  // Retro arcade double-ping coin synthesized sound effect
  const playCoinSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      
      // First high note
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
      gain1.gain.setValueAtTime(0.06, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Second note slightly delayed
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.08); // A5
      osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.22); // E6
      gain2.gain.setValueAtTime(0.06, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.45);
    } catch (err) {
      console.log("Web Audio not supported:", err);
    }
  };

  // Flying coin shower trigger with custom scatter points
  const triggerCoinShower = () => {
    playCoinSound();
    const newCoins = Array.from({ length: 18 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: Math.random() * 260 - 130, // Random horizontal scatter
      y: -(Math.random() * 220 + 120), // Fly upwards
      rotate: Math.random() * 360,
      delay: Math.random() * 0.15,
    }));
    setCoins(newCoins);
    // Auto clear particles
    setTimeout(() => {
      setCoins([]);
    }, 1600);
  };

  // Simulation values (Oxygen %, Gas ppm)
  const [bluetoothSignal, setBluetoothSignal] = useState(-42);
  const [gForce, setGForce] = useState(1.0);
  const [oxygenLevel, setOxygenLevel] = useState(20.9);
  const [gasLevel, setGasLevel] = useState(0.01); // 안정수치

  // Slide state for lock
  const [slideValue, setSlideValue] = useState(0);

  // Alarm threshold suppression state (Prevents alarm fatigue)
  const [alarmFatigueMitigation, setAlarmFatigueMitigation] = useState(true);

  // Translation hook-like function
  const t = (key: keyof (typeof translations)['ko']) => {
    return translations[language][key] || translations['ko'][key] || '';
  };

  // Audio simulation in selected language
  const speakLocal = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // select language voice
      if (language === 'en') {
        utterance.lang = 'en-US';
      } else if (language === 'vi') {
        utterance.lang = 'vi-VN';
      } else {
        utterance.lang = 'ko-KR';
      }
      
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
    setDialogueLogs(prev => [`[${language.toUpperCase()} 음성]: "${text}"`, ...prev]);
  };

  // Toggle alarm simulation
  const isEmergency = worker.status === 'emergency' || simulateFallTrigger || dialogueActive;

  // Track counts for fall simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (simulationDelay !== null && simulationDelay > 0) {
      timer = setTimeout(() => {
        setSimulationDelay(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (simulationDelay === 0) {
      triggerAutomaticDialogue();
      setSimulationDelay(null);
    }
    return () => clearTimeout(timer);
  }, [simulationDelay]);

  // Dialogue Countdown loop for automatic response validation (Unconscious detector)
  useEffect(() => {
    let countdownTimer: NodeJS.Timeout;
    if (dialogueActive && dialogueStep === 1) {
      if (dialogueCountdown > 0) {
        countdownTimer = setTimeout(() => {
          setDialogueCountdown(prev => prev - 1);
        }, 1000);
      } else if (dialogueCountdown === 0) {
        // Automatic Dispatch: Trigger emergency because of no answer within 5 seconds! (기절 상태 판단)
        setDialogueStep(3);
        const announceText = language === 'en' 
          ? "Critical! No speech response. Deemed unconscious state. Automative incident classification: Critical. Broadcasting rescue coordinates to near workers and safety manager immediately."
          : language === 'vi'
          ? "Nguy kịch! Không có phản hồi giọng nói. Được coi là bất tỉnh. Tự động gửi tín hiệu cứu hộ khẩn cấp đến đội ngũ quản lý giám sát."
          : `대화 시도 무응답 발생! 작업자 기절 상태로 자동 판정합니다. 인계 수치: 최상위 위급(Critical). 인근 반경 50m 동료 및 관리자 일제 무선 구조 방송을 강제 전개합니다.`;
        
        speakLocal(announceText);

        onUpdateWorker?.({
          status: 'emergency',
          accidentClassification: 'critical',
          logs: [
            {
              id: Math.random().toString(36).substr(2, 9),
              timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
              type: 'alert',
              message: `⚠️ [자동 대화 실패] 5초 무해제 의식불능(기절) 감지 -> '위급' 구조 요청 개시`
            },
            ...(worker.logs || [])
          ]
        });
      }
    }
    return () => clearTimeout(countdownTimer);
  }, [dialogueActive, dialogueCountdown, dialogueStep]);

  // Audio volume override & vibration interval loop
  useEffect(() => {
    let vibTimer: NodeJS.Timeout;
    if (isEmergency) {
      setIsVibrating(true);
      vibTimer = setInterval(() => {
        setIsVibrating(v => !v);
      }, 450);
    } else {
      setIsVibrating(false);
    }
    return () => clearInterval(vibTimer);
  }, [isEmergency]);

  // Handle slide back to safety
  useEffect(() => {
    if (slideValue > 85) {
      setSimulateFallTrigger(false);
      setDialogueActive(false);
      onConfirmAlert();
      setSlideValue(0);

      // Award points for validating safety! (캐시워크)
      setRewardsWallet(prev => prev + 100);
      triggerCoinShower();
      
      const safetyClearMsg = language === 'en'
        ? "Safety slide dismissed. Reporting normal connection. Plus 100 points rewarded!"
        : language === 'vi'
        ? "Mở khóa an toàn thành công. Trạng thái bình thường. Đã nhận 100 điểm thưởng!"
        : "슬라이드로 안전이 최종 확인되었습니다. 메인 관제실 알람이 리셋되며 캐시워크 100포인트가 즉시 전수 리워드 지급되었습니다.";

      speakLocal(safetyClearMsg);
      onUpdateWorker?.({
        status: 'normal',
        accidentClassification: 'none'
      });
    }
  }, [slideValue, onConfirmAlert]);

  // Volume holding backup cancel listener
  useEffect(() => {
    let holdTimer: NodeJS.Timeout;
    if (isHoldingVolume && isEmergency) {
      holdTimer = setInterval(() => {
        setHoldProgress(prev => {
          if (prev >= 100) {
            clearInterval(holdTimer);
            setIsHoldingVolume(false);
            setSimulateFallTrigger(false);
            setDialogueActive(false);
            onConfirmAlert();
            setRewardsWallet(p => p + 100);
            triggerCoinShower();
            speakLocal(language === 'en' ? "Alternative override. 3-second Volume hold success." : "대체 비상 해제 완료: 볼륨 가운 홀드 3초 수용. 일제 구조 해제와 리워드 100포인트를 적립합니다.");
            onUpdateWorker?.({
              status: 'normal',
              accidentClassification: 'none'
            });
            return 0;
          }
          return prev + 10;
        });
      }, 300);
    } else {
      setHoldProgress(0);
    }
    return () => clearInterval(holdTimer);
  }, [isHoldingVolume, isEmergency]);

  // Auto trigger dialogue mode if heartRate spiked
  useEffect(() => {
    if (worker.sensors.heartRate > 140 && !dialogueActive && !simulateFallTrigger) {
      triggerAutomaticDialogue();
    }
  }, [worker.sensors.heartRate]);

  const triggerAutomaticDialogue = () => {
    setDialogueActive(true);
    setDialogueStep(1);
    setDialogueCountdown(5);
    
    const warnSpeak = language === 'en'
      ? `Warning: Biometric condition anomaly detected for ${worker.name}. If you represent okay, say, YES, or pull safety slide within 5 seconds.`
      : language === 'vi'
      ? `Cảnh báo: Phát hiện bất thường thể trạng của ${worker.name}. Nếu bạn vẫn ổn, vui lòng nói vâng hoặc trượt khóa an toàn trong 5 giây.`
      : `${worker.name}님 컨디션 저하 및 비상 생체가 감지되었습니다. 의식이 온전하시면 "응"이라고 말씀하시거나 슬라이드를 5초 내 당겨 해제하세요.`;

    speakLocal(warnSpeak);
  };

  // Simulated Speech recognition engine trigger
  const handleKeywordSpeak = (keyword: string) => {
    setActiveSpeechInput(keyword);
    setShowSpeechBubble(`의식 상태 감지: "${keyword}" 키워드 음성 수신됨!`);
    
    // translate foreign keywords to fit system
    const mappedWord = (keyword === 'cứu tôi' || keyword === 'save me' || keyword === '살려줘') ? '살려줘' : '도와줘';
    
    setTimeout(() => {
      setDialogueActive(true);
      setDialogueStep(2); // Goes to emergency dispatch phase

      const replyText = language === 'en'
        ? `Speech trigger successful. Recognised: ${keyword}. Instant status mapped to Emergency and broadcast is propagating immediately.`
        : language === 'vi'
        ? `Hệ thống giọng nói phát hiện từ khóa: ${keyword}. Chuyển phát trạng thái Khẩn cấp đến đồng nghiệp lân cận.`
        : `안전모 음성 인식 가공 완료. "${keyword}"가 감지되었습니다. 현 구역(50m) 동료 및 안전 소장에게 [응급 상황 일제 전파]를 강제 융합 전개합니다.`;

      speakLocal(replyText);
      setShowSpeechBubble(null);

      onUpdateWorker?.({
        status: 'emergency',
        accidentClassification: 'emergency',
        logs: [
          {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
            type: 'alert',
            message: `🗣️ 음성 긴급 인식: "${keyword}" 수신 -> 응급 구조 전파`
          },
          ...(worker.logs || [])
        ]
      });
    }, 1500);
  };

  const saveManualLocation = () => {
    onUpdateWorker?.({
      location: editedLocation,
      floor: Number(editedFloor),
      customTask: editedTask,
      logs: [
        {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
          type: 'status',
          message: `📍 수동 위치 갱신: ${editedLocation} ${editedFloor}층 [${editedTask}] 입력 완료`
        },
        ...(worker.logs || [])
      ]
    });
    setShowLocationModal(false);
    speakLocal(`작업 위치가 ${editedLocation} ${editedFloor}층, 과업은 ${editedTask}으로 정상 분리 기록되었습니다.`);
  };

  // 3-Stage Biometric Fatigue Level Analyzer
  const getFatigueStage = () => {
    // low eeg + abnormal HR = Dangerous
    if (worker.sensors.eeg < 30 && worker.sensors.heartRate > 120) {
      return { label: t('danger'), color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    }
    if (worker.sensors.eeg < 50 || worker.sensors.heartRate > 105) {
      return { label: t('unstable'), color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    }
    return { label: t('stable'), color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' };
  };

  // 3-Stage Gas Stability Level Analyzer
  const getGasStage = () => {
    if (gasLevel > 40) return { label: t('danger'), color: 'text-red-500', bg: 'bg-red-500/25 border-red-500/50' };
    if (gasLevel > 15) return { label: t('unstable'), color: 'text-orange-500', bg: 'bg-orange-500/25 border-orange-500/50' };
    return { label: t('stable'), color: 'text-green-500', bg: 'bg-green-500/25 border-green-500/50' };
  };

  // 3-Stage Oxygen Stability Level Analyzer
  const getO2Stage = () => {
    if (oxygenLevel < 18.0) return { label: t('danger'), color: 'text-red-500', bg: 'bg-red-500/25 border-red-500/50' };
    if (oxygenLevel < 19.5) return { label: t('unstable'), color: 'text-orange-500', bg: 'bg-orange-500/25 border-orange-500/50' };
    return { label: t('stable'), color: 'text-green-500', bg: 'bg-green-500/25 border-green-500/50' };
  };

  // Surrounding Unsafe Structure Mapping based on current location
  const getNearbyHazards = () => {
    const loc = editedLocation;
    if (loc.includes('A')) return ["H-Beam 크레인 회전 중 (충돌 위험)", "상층 낙하물 고소 가인 방지망 결선 미비"];
    if (loc.includes('B')) return ["고압 차단 전력반 절연 불충분 의심", "2층 콘크리트 외장 접착부 미응결"];
    if (loc.includes('C')) return ["제한 밀폐 공간 내부 CO 가스 체류", "안전 비계 하층 받침 고정 볼트 이완"];
    return ["용접 잔류 불꽃 잔상 불티 비산", "리프트 하층부 난간 미결속 추락 위험"];
  };

  // Accessibility theme styles helper
  const getThemeColorClass = () => {
    if (themeMode === 'highcontrast') {
      return {
        bg: 'bg-black',
        cardBg: 'bg-black border-2 border-yellow-400 text-yellow-400',
        text: 'text-yellow-400',
        mutedText: 'text-yellow-400/80 font-bold',
        badge: 'bg-yellow-400 text-black border border-yellow-400',
        border: 'border-yellow-400',
        button: 'bg-yellow-400 text-black hover:bg-yellow-500 font-extrabold',
        hoverBorder: 'hover:border-yellow-400'
      };
    }
    if (themeMode === 'light') {
      return {
        bg: 'bg-[#f7f8fa]',
        cardBg: 'bg-white border border-[#e2e8f0] shadow-sm text-gray-900',
        text: 'text-gray-900',
        mutedText: 'text-gray-500 font-medium',
        badge: 'bg-[#f1f5f9] text-gray-700 border border-[#e2e8f0]',
        border: 'border-[#e2e8f0]',
        button: 'bg-[#f97316] text-white hover:bg-[#ea580c] font-bold',
        hoverBorder: 'hover:border-[#f97316]/50'
      };
    }
    // Dark default
    return {
      bg: 'bg-[#121417]',
      cardBg: 'bg-[#1c1f26] border border-[#2d323e] text-[#e0e2e5]',
      text: 'text-[#e0e2e5]',
      mutedText: 'text-[#8a8a8a]',
      badge: 'bg-[#252831] text-[#e0e2e5] border border-[#383d4c]',
      border: 'border-[#2d323e]',
      button: 'bg-[#f97316] text-[#121417] hover:bg-[#ea580c] hover:text-white font-black',
      hoverBorder: 'hover:border-[#f97316]/40'
    };
  };

  const style = getThemeColorClass();

  return (
    <div className={`relative min-h-screen ${isVibrating ? 'border-4 border-orange-500/80' : 'border-4 border-transparent'} bg-[#121417] text-[#e0e2e5] font-sans overflow-x-hidden selection:bg-orange-500 selection:text-white transition-all duration-300`}>
      
      {/* Background Neon Grids */}
      <div className="absolute inset-0 tech-grid opacity-5 pointer-events-none z-0" />
      
      {/* Top Navigation Panel with HHS Theme and Logo */}
      <div className={`${style.cardBg} sticky top-0 z-40 border-b ${style.border} px-4 py-3 flex flex-col gap-2 transition-all`}>
        <div className="flex justify-between items-center gap-2">
          {/* Top-Left Company Logo precisely matching the 60% gray / 35% orange ratio */}
          <div className="flex items-center gap-2">
            <svg width="45" height="15" viewBox="0 0 300 80" className="opacity-95" referrerPolicy="no-referrer">
              {/* Left Column (60% Grey blocks) */}
              <rect x="10" y="10" width="30" height="60" fill="#8a8a8a" rx="4" />
              <circle cx="75" cy="40" r="15" fill="#8a8a8a" />
              {/* Middle Column (35% Orange accent blocks) */}
              <rect x="120" y="10" width="30" height="60" fill="#f97316" rx="4" />
              <circle cx="185" cy="40" r="15" fill="#f97316" />
              <rect x="230" y="10" width="30" height="60" fill="#f97316" rx="4" />
              {/* Side Balance line */}
              <g transform="rotate(28, 290, 20)">
                <rect x="268" y="-14" width="30" height="42" fill="#8a8a8a" rx="4" />
              </g>
              <g transform="rotate(-28, 290, 60)">
                <rect x="268" y="52" width="30" height="42" fill="#8a8a8a" rx="4" />
              </g>
            </svg>
            <div className="flex flex-col">
              <span className={`text-[#f97316] text-xs font-black italic tracking-tight`}>HHS SmartApp</span>
              <span className={`text-[7px] uppercase font-bold tracking-widest ${style.mutedText}`}>Health & Happiness</span>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex bg-[#252831]/50 p-1 rounded-xl border border-[#383d4c] text-[10px]">
            <button 
              onClick={() => setActiveTab('app')}
              className={`px-2.5 py-1 font-black rounded-lg uppercase tracking-tight transition-all ${
                activeTab === 'app' ? 'bg-[#f97316] text-white' : 'text-[#8a8a8a] hover:text-[#f97316]'
              }`}
            >
              {t('appTab')}
            </button>
            <button 
              onClick={() => setActiveTab('research')}
              className={`px-2.5 py-1 font-black rounded-lg uppercase tracking-tight transition-all flex items-center gap-1 ${
                activeTab === 'research' ? 'bg-[#8a8a8a] text-white' : 'text-[#8a8a8a] hover:text-[#f97316]'
              }`}
            >
              <FileText size={10} />
              {t('designTab')}
            </button>
          </div>
        </div>

        {/* Accessibility Selector & Translation Controls */}
        <div className="flex justify-between items-center border-t border-[#8a8a8a]/10 pt-2 text-[10px]">
          {/* Quick Access Language Select for Foreign Laborers (Vietnam / English / Korea) */}
          <div className="flex items-center gap-1">
            <span className={style.mutedText}>🌐</span>
            <button 
              onClick={() => { setLanguage('ko'); speakLocal("한국어 번역 모드가 설정되었습니다."); }}
              className={`px-1.5 py-0.5 rounded font-bold ${language === 'ko' ? 'bg-orange-500 text-white' : style.mutedText}`}
            >
              KO
            </button>
            <button 
              onClick={() => { setLanguage('en'); speakLocal("English translation mode activated."); }}
              className={`px-1.5 py-0.5 rounded font-bold ${language === 'en' ? 'bg-orange-500 text-white' : style.mutedText}`}
            >
              EN
            </button>
            <button 
              onClick={() => { setLanguage('vi'); speakLocal("Chế độ dịch tiếng Việt đã được kích hoạt."); }}
              className={`px-1.5 py-0.5 rounded font-bold ${language === 'vi' ? 'bg-orange-500 text-white' : style.mutedText}`}
            >
              VI
            </button>
          </div>
          {/* Real-time active status banner */}
          <div className="flex items-center gap-1 opacity-80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[8px] text-emerald-400 uppercase tracking-widest">GATEWAY LINKED</span>
          </div>
        </div>

        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'app' ? (
          <motion.div 
            key="app-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="p-4 space-y-5 relative"
          >
            {/* Real-time flying golden coins shower layer */}
            <AnimatePresence>
              {coins.map((coin) => (
                <motion.div
                  key={coin.id}
                  initial={{ opacity: 1, scale: 0.1, x: 0, y: 100, rotate: 0 }}
                  animate={{ 
                    opacity: [1, 1, 0], 
                    scale: [0.1, 1.4, 0.8], 
                    x: coin.x, 
                    y: coin.y, 
                    rotate: coin.rotate 
                  }}
                  transition={{ duration: 1.3, ease: "easeOut", delay: coin.delay }}
                  className="fixed inset-x-0 bottom-44 mx-auto w-11 h-11 bg-gradient-to-b from-yellow-300 to-amber-500 rounded-full border-2 border-yellow-200 flex items-center justify-center font-bold text-base shadow-[0_0_25px_rgba(245,158,11,0.9)] z-[999] pointer-events-none select-none"
                >
                  🪙
                </motion.div>
              ))}

              {pointRewardAmount !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 80 }}
                  animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.25, 1.25, 0.9], y: -160 }}
                  transition={{ duration: 1.8, times: [0, 0.1, 0.82, 1], ease: "easeOut" }}
                  className="fixed inset-x-0 top-[45%] mx-auto w-fit bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-black font-black text-[13px] px-5 py-3 rounded-full border-2 border-yellow-200 flex items-center gap-2 shadow-[0_0_50px_rgba(245,158,11,0.92)] z-[9999] pointer-events-none tracking-tight select-none font-sans"
                >
                  <span className="text-lg animate-bounce animate-duration-500">🪙</span>
                  <span>+{pointRewardAmount} 안전 보상 포인트 획득!</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* DYNAMIC SAFETY STATE HEADER CARD */}
            {isEmergency ? (
              <motion.div 
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="p-5 rounded-2xl bg-gradient-to-b from-red-600/35 to-red-950/20 border-2 border-red-500 flex flex-col items-center text-center space-y-3 shadow-xl"
              >
                <div className="w-12 h-12 rounded-full bg-red-600/40 flex items-center justify-center text-red-100 font-bold border border-red-500 animate-pulse">
                  🚨
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">비상 연락망 및 긴급 전파 가동</h3>
                  <p className="text-[11px] text-red-300 font-medium leading-relaxed mt-1">
                    의식 이상 또는 높은 충격이 검출되었습니다. 귀하는 무사하십니까? 아래의 안전 입증 슬라이더를 즉시 우측으로 밀어 안심 메시지를 전송하세요.
                  </p>
                </div>

                {/* Micro Slide confirming lock during emergency */}
                <div className="w-full bg-red-950/40 rounded-2xl p-1 relative h-14 flex items-center border border-red-500/20 mt-2">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-white/60 font-black uppercase text-[10px] tracking-widest animate-pulse">
                      드래그하여 안전 입증하기 (안전 확인)
                    </span>
                  </div>
                  <div className="absolute left-1 right-1 h-12 bg-black/45 rounded-xl overflow-hidden pointer-events-none">
                    <motion.div 
                      className="h-full bg-emerald-500/30"
                      animate={{ width: `${Math.min(100, Math.max(0, slideValue))}%` }}
                    />
                  </div>
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 180 }}
                    dragElastic={0.05}
                    onDrag={(_, info) => {
                      const percent = (info.point.x / 180) * 100;
                      setSlideValue(percent);
                    }}
                    onDragEnd={() => {
                      if (slideValue >= 85) {
                        setSimulateFallTrigger(false);
                        setDialogueActive(false);
                        onConfirmAlert();
                        setRewardsWallet(p => p + 100);
                        setPointRewardAmount(100);
                        setTimeout(() => setPointRewardAmount(null), 1800);
                        triggerCoinShower();
                        setSlideValue(0);
                        speakLocal("슬라이드 확인 성공. 전원 동료 및 관리자에게 안전 피드가 전송 완료되었습니다.");
                        onUpdateWorker?.({
                          status: 'normal',
                          accidentClassification: 'none'
                        });
                      } else {
                        setSlideValue(0);
                      }
                    }}
                    animate={{ x: (Math.min(100, Math.max(0, slideValue)) / 100) * 180 }}
                    transition={slideValue === 0 ? { type: 'spring', damping: 25, stiffness: 200 } : { type: 'just' }}
                    className="w-12 h-12 bg-white rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg z-10"
                  >
                    <ChevronRight className="text-emerald-600 font-bold" size={24} />
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <div className={`p-4 rounded-2xl ${style.cardBg} border border-green-500/30 bg-gradient-to-r from-green-500/5 to-teal-500/5 flex items-center gap-3.5 shadow-md`}>
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-400 border border-emerald-500/20 text-lg animate-pulse">
                  💚
                </div>
                <div className="flex-1 text-left leading-tight">
                  <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest block font-mono">HEALTH STATUS SECURE</span>
                  <span className="text-xs font-black text-white">{worker.name} 작업자님: 실시간 평정 상태</span>
                  <span className={`text-[10px] block mt-0.5 ${style.mutedText}`}>스마트 안전모가 의식 및 심맥파를 맑게 관측하고 있습니다.</span>
                </div>
              </div>
            )}

            {/* INTERACTIVE GAMIFIED REWARDS WALLET CARD */}
            <div className={`p-4 rounded-2xl ${style.cardBg} border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-transparent to-yellow-600/5 flex flex-col gap-3 shadow-lg relative overflow-hidden`}>
              <div className="absolute -right-6 -bottom-6 text-amber-500/10 opacity-30 select-none font-bold text-7xl">
                🪙
              </div>
              
              <div className="flex justify-between items-center pb-2.5 border-b border-amber-500/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center font-bold text-amber-400 text-sm">
                    🪙
                  </div>
                  <div className="text-left">
                    <span className="text-[8.5px] font-semibold text-amber-400/80 uppercase tracking-widest block font-mono">CASHWALK WALLET</span>
                    <h4 className="text-sm font-black text-white">현장 연동 리워드 머니</h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-amber-400 font-mono tracking-tight">
                    {rewardsWallet.toLocaleString()} <span className="text-xs font-black text-amber-500">P</span>
                  </span>
                </div>
              </div>

              {/* GAMIFIED LUCKY BONUS GIFT BOX */}
              <div className="bg-[#121418]/60 p-3 rounded-xl border border-amber-500/20 flex items-center justify-between gap-3 h-[60px]">
                <div className="text-left leading-none">
                  <span className="text-[10px] font-black text-amber-400 block mb-0.5">🎁 오늘의 행운 골드 박스</span>
                  <span className="text-[9px] text-gray-400">매일 터치하여 랜덤 리워드 포인트를 적립하세요!</span>
                </div>
                <Button 
                  onClick={() => {
                    if (!luckyBoxOpened) {
                      setLuckyBoxOpened(true);
                      setRewardsWallet(prev => prev + 50);
                      setPointRewardAmount(50);
                      setTimeout(() => setPointRewardAmount(null), 1800);
                      triggerCoinShower();
                      speakLocal("깜짝 포인트 당첨을 축하드립니다! 50포인트를 적립합니다.");
                    }
                  }}
                  disabled={luckyBoxOpened}
                  className={`h-9 px-3.5 rounded-lg text-[10.5px] font-bold ${
                    luckyBoxOpened 
                      ? 'bg-gray-800 text-gray-500 border border-gray-700/50' 
                      : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-600 hover:to-orange-500 shadow-md shadow-amber-500/10 animate-bounce'
                  }`}
                  size="sm"
                >
                  {luckyBoxOpened ? "✓ 열기 완료 (+50P)" : "상자 열기 🎁"}
                </Button>
              </div>
            </div>

            {/* THREE BEAUTIFUL BENTO HEALTH METRICS CARDS */}
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* Metric 1: Pulse */}
              <div className={`p-3 rounded-2xl ${style.cardBg} flex flex-col justify-between h-[105px] border border-gray-800 text-left`}>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">심맥 맥박 (HR)</span>
                  <span className="text-xs animate-pulse">💓</span>
                </div>
                <div>
                  <span className="text-base font-black block text-white">
                    {worker.sensors.heartRate.toFixed(0)} <span className="text-[9px] text-[#8a8a8a] font-normal">BPM</span>
                  </span>
                  <span className="text-[8.5px] text-emerald-400 font-bold block mt-1">● 센서 양호</span>
                </div>
              </div>

              {/* Metric 2: Cranial Vitality (EEG) */}
              <div className={`p-3 rounded-2xl ${style.cardBg} flex flex-col justify-between h-[105px] border border-gray-800 text-left`}>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">뇌파 index (EEG)</span>
                  <span className="text-xs">🧠</span>
                </div>
                <div>
                  <span className="text-base font-black block text-white">
                    {worker.sensors.eeg} <span className="text-[9px] text-[#8a8a8a] font-normal">uV</span>
                  </span>
                  <span className="text-[8.5px] text-emerald-400 font-bold block mt-1">● 집중도 최고</span>
                </div>
              </div>

              {/* Metric 3: Toxic Gas / Oxygen */}
              <div className={`p-3 rounded-2xl ${style.cardBg} flex flex-col justify-between h-[105px] border border-gray-800 text-left`}>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">현장 공기 (O2)</span>
                  <span className="text-xs">💨</span>
                </div>
                <div>
                  <span className="text-base font-black block text-white">
                    {oxygenLevel.toFixed(1)} <span className="text-[9px] text-[#8a8a8a] font-normal">%</span>
                  </span>
                  <span className="text-[8.5px] text-emerald-300 font-bold block mt-1">● 산소 청정</span>
                </div>
              </div>

            </div>

            {/* WORK LOCATION & TASK SUMMARY CARD */}
            <div className={`p-3 rounded-1.5xl bg-[#121418]/60 border border-gray-800/80 rounded-2xl flex justify-between items-center text-xs text-left shadow-inner`}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center text-xs text-orange-400">
                  📍
                </div>
                <div>
                  <span className="text-[8px] text-gray-500 uppercase block font-mono">LOCATION & CURRENT WORK</span>
                  <span className="font-extrabold text-white text-[11px]">
                    {editedLocation} {editedFloor}층 · <span className="text-orange-400">{editedTask}</span>
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowLocationModal(true)}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white transition-all"
              >
                ✏️ 변경
              </button>
            </div>

            {/* ACCORDION COLLAPSIBLE DRAWER BUTTON FOR CLINICAL EVALUATION SIMULATOR SETTINGS */}
            <div className="pt-2 border-t border-gray-800">
              <button
                onClick={() => setShowSimulationTools(!showSimulationTools)}
                className="w-full py-3 px-4 rounded-xl bg-gray-900/60 hover:bg-gray-900/90 border border-gray-800 text-left flex justify-between items-center transition-all group active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs group-hover:rotate-45 transition-transform duration-300">⚙️</span>
                  <span className="text-[11.5px] font-extrabold text-gray-300">임상 시연 및 비상 모드 강제 기동 패널</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-orange-500 font-semibold">
                  <span>{showSimulationTools ? "COLLAPSE" : "EXPAND"}</span>
                  <ChevronDown size={13} className={`transition-transform duration-300 ${showSimulationTools ? "rotate-180" : ""}`} />
                </div>
              </button>

              <AnimatePresence>
                {showSimulationTools && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden space-y-4 pt-3.5"
                  >
                    {/* Simulated Voice Emergency Detection Dashboard */}
                    <div className={`${style.cardBg} p-4 rounded-2xl shadow-lg`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Volume2 size={14} className="text-orange-500" />
                          <span className="text-[11px] font-black uppercase tracking-wider">{t('voiceTitle')}</span>
                        </div>
                        <span className="text-[9px] bg-red-600/20 text-red-500 px-2 py-0.5 rounded-full font-black animate-pulse">MIC ACTIVE</span>
                      </div>
                      <p className={`text-[10.5px] mb-3.5 leading-relaxed ${style.mutedText}`}>
                        {t('voiceDesc')}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button 
                          onClick={() => handleKeywordSpeak(language === 'vi' ? "cứu tôi" : language === 'en' ? "save me" : "살려줘")}
                          className="bg-[#242933]/60 hover:bg-[#ef4444]/20 border border-red-500/40 p-3 rounded-xl text-[11px] font-bold text-white flex items-center justify-center gap-2 active:scale-95 transition-all text-center"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                          🚨 {t('keywordSave')}
                        </button>
                        <button 
                          onClick={() => handleKeywordSpeak(language === 'vi' ? "giúp tôi" : language === 'en' ? "help me" : "도와줘")}
                          className="bg-[#242933]/60 hover:bg-amber-500/20 border border-amber-500/40 p-3 rounded-xl text-[11px] font-bold text-white flex items-center justify-center gap-2 active:scale-95 transition-all text-center"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                          📢 {t('keywordHelp')}
                        </button>
                      </div>
                    </div>

                    {/* Speech bubble notification */}
                    <AnimatePresence>
                      {showSpeechBubble && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="bg-orange-600 border border-orange-500 text-white rounded-2xl p-4 text-xs font-black flex items-center gap-3 shadow-xl"
                        >
                          <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center font-black animate-spin text-[11px]">🗣️</div>
                          <p>{showSpeechBubble}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* 3-Stage EEG/ECG Real-time Fatigue Gauge Panel */}
                    <div className={`${style.cardBg} p-4 rounded-2xl shadow-lg space-y-3`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Brain size={14} className="text-purple-400" />
                          <span className="text-[11px] font-black uppercase tracking-wider">{t('fatigueTitle')}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${getFatigueStage().bg} ${getFatigueStage().color} border border-current`}>
                          {t('fatigueStatus')}: {getFatigueStage().label}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-[#8a8a8a] font-mono leading-none">
                          <span>안정 (Stable)</span>
                          <span>불안정 (Unstable)</span>
                          <span>위험 (Danger)</span>
                        </div>
                        <div className="h-3 bg-[#121417] rounded-full overflow-hidden flex gap-1 p-0.5">
                          <div className={`h-full rounded-l-full transition-all flex-1 ${worker.sensors.eeg >= 50 && worker.sensors.heartRate <= 105 ? 'bg-green-500 animate-pulse' : 'bg-[#121417]'}`} />
                          <div className={`h-full transition-all flex-1 ${worker.sensors.eeg < 50 && worker.sensors.eeg >= 30 ? 'bg-orange-400 animate-pulse' : 'bg-[#121417]'}`} />
                          <div className={`h-full rounded-r-full transition-all flex-1 ${worker.sensors.eeg < 30 || worker.sensors.heartRate > 120 ? 'bg-red-500 animate-pulse' : 'bg-[#121417]'}`} />
                        </div>
                        <div className="text-[10px] flex justify-between items-center text-[#8a8a8a] pt-1">
                          <span>EEG 지수: <strong className="text-white">{worker.sensors.eeg} uV</strong></span>
                          <span>심박 전조: <strong className="text-white">{worker.sensors.heartRate.toFixed(0)} BPM</strong></span>
                        </div>
                      </div>

                      <div className="bg-[#121417]/50 p-2.5 rounded-xl border border-[#2d323e]/30 space-y-2 text-left">
                        <span className="text-[9px] font-black uppercase tracking-wide text-orange-400 block">임상 시험용 바이오 변동 슬라이더</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-[#8a8a8a] min-w-[50px]">뇌독성인자:</span>
                          <input 
                            type="range" 
                            min="10" 
                            max="100" 
                            value={worker.sensors.eeg}
                            onChange={(e) => {
                              onUpdateWorker?.({
                                sensors: { ...worker.sensors, eeg: Number(e.target.value) }
                              });
                            }}
                            className="flex-1 accent-orange-500 h-1 bg-gray-700 rounded-lg appearance-none"
                          />
                          <span className="text-[10px] font-mono font-bold text-white w-8 text-right">{worker.sensors.eeg}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-[#8a8a8a] min-w-[50px]">전공심박:</span>
                          <input 
                            type="range" 
                            min="50" 
                            max="160" 
                            value={worker.sensors.heartRate}
                            onChange={(e) => {
                              onUpdateWorker?.({
                                sensors: { ...worker.sensors, heartRate: Number(e.target.value) }
                              });
                            }}
                            className="flex-1 accent-orange-500 h-1 bg-gray-700 rounded-lg appearance-none"
                          />
                          <span className="text-[10px] font-mono font-bold text-white w-8 text-right">{worker.sensors.heartRate.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Oxygen and Environmental Safety Gauge Grid Block */}
                    <div className={`${style.cardBg} p-4 rounded-2xl shadow-lg space-y-3`}>
                      <div className="flex items-center justify-between border-b border-[#8a8a8a]/10 pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">🏭</span>
                          <span className="text-[11px] font-black uppercase tracking-wider">{t('gasTitle')}</span>
                        </div>
                        <span className="text-[9px] text-[#8a8a8a] font-mono uppercase">Sensor Grid Array</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        {/* Oxygen Status Meter */}
                        <div className="bg-[#121417]/50 p-3 rounded-xl border border-[#2d323e]/45 flex flex-col justify-between h-[105px] text-left">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-gray-400">{t('o2Label')}</span>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${getO2Stage().bg} ${getO2Stage().color}`}>
                              {getO2Stage().label}
                            </span>
                          </div>
                          <div>
                            <span className="text-xl font-black block text-white">{oxygenLevel.toFixed(1)} <span className="text-xs font-medium text-gray-400">%</span></span>
                            <span className="text-[9px] text-[#8a8a8a] leading-none block">정상범위: 19.5% ~ 23.5%</span>
                          </div>
                        </div>

                        {/* Toxic Gas Status Meter */}
                        <div className="bg-[#121417]/50 p-3 rounded-xl border border-[#2d323e]/45 flex flex-col justify-between h-[105px] text-left">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-gray-400">{t('gasLabel')}</span>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${getGasStage().bg} ${getGasStage().color}`}>
                              {getGasStage().label}
                            </span>
                          </div>
                          <div>
                            <span className="text-xl font-black block text-white">{(gasLevel * 100).toFixed(0)} <span className="text-xs font-medium text-gray-400">ppm</span></span>
                            <span className="text-[9px] text-[#8a8a8a] leading-none block">허용치: 50 ppm 이하</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-[#121417]/40 p-2.5 rounded-xl border border-[#2d323e]/30">
                        <button 
                          onClick={() => {
                            setOxygenLevel(prev => prev > 19 ? 16.5 : 20.9);
                            const isNowDepleted = oxygenLevel > 19;
                            speakLocal(isNowDepleted ? "산소 급강하 상태 검출! 질식 예방 음성 대화 가동." : "산소 가용 감도 정상 대기 복귀.");
                            if (isNowDepleted) {
                              setTimeout(() => triggerAutomaticDialogue(), 1200);
                            }
                          }}
                          className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                            oxygenLevel < 19 ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-transparent border-[#2d323e] text-[#8a8a8a] hover:border-orange-500'
                          }`}
                        >
                          💨 {oxygenLevel < 19 ? '산소 복구' : '산소 유실 시뮬'}
                        </button>
                        <button 
                          onClick={() => {
                            setGasLevel(prev => prev < 0.1 ? 0.45 : 0.01);
                            const isNowLeaking = gasLevel < 0.1;
                            speakLocal(isNowLeaking ? "밀폐 구역 독성 VOC 유출 발생! 의식 점검을 개시합니다." : "가스 연무 유실 청정 상태 완료.");
                            if (isNowLeaking) {
                              setTimeout(() => triggerAutomaticDialogue(), 1200);
                            }
                          }}
                          className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                            gasLevel > 0.1 ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-transparent border-[#2d323e] text-[#8a8a8a] hover:border-orange-500'
                          }`}
                        >
                          ☠️ {gasLevel > 0.1 ? '가스 해소' : '가스 유출 시뮬'}
                        </button>
                      </div>
                    </div>

                    {/* Nearby Hazardous Structures Alert Feed Dashboard */}
                    <div className={`${style.cardBg} p-4 rounded-2xl shadow-lg space-y-3`}>
                      <div className="flex items-center gap-1.5 border-b border-[#8a8a8a]/10 pb-1.5">
                        <AlertTriangle size={15} className="text-orange-500" />
                        <span className="text-[11px] font-black uppercase tracking-wider">{t('hazardTitle')}</span>
                      </div>
                      <p className={`text-[10.5px] leading-relaxed text-left ${style.mutedText}`}>
                        {t('hazardDesc')}
                      </p>

                      <div className="space-y-2">
                        {getNearbyHazards().map((hazard, index) => (
                          <div key={index} className="flex gap-2.5 items-start bg-red-950/20 border border-red-500/10 p-2.5 rounded-xl text-left">
                            <span className="text-xs">⚠️</span>
                            <div className="leading-tight">
                              <span className="text-[11px] font-extrabold text-red-400 block">위험 구조 요인 (지능 반경 25m)</span>
                              <span className="text-[10.5px] text-gray-200">{hazard}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Alarm Suppression Panel (Prevent alarm fatigue) */}
                    <div className={`p-3 rounded-2xl flex justify-between items-center text-xs ${style.badge}`}>
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="font-bold text-[11px]">{t('antiFatigue')}</span>
                        <span className={`text-[10px] ${style.mutedText}`}>
                          {alarmFatigueMitigation ? t('filterActive') : t('filterInactive')}
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          setAlarmFatigueMitigation(!alarmFatigueMitigation);
                          speakLocal(alarmFatigueMitigation ? "알림 필터를 해제합니다. 과도한 중복 유선 소음이 전개될 수 있습니다." : "알람 피로 방지 필터를 정상 연동 전개합니다. 미세 소음 차단.");
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                          alarmFatigueMitigation ? 'bg-orange-600 text-white' : 'bg-transparent border border-[#2d323e]'
                        }`}
                      >
                        {t('toggleFilter')}
                      </button>
                    </div>

                    {/* 4 Square Core Buttons with matching visual icons */}
                    <div className="space-y-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest font-mono block px-1 text-left ${style.mutedText}`}>
                        실시간 헬멧 어블 연동체 4요소 정보
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        
                        {/* EEG */}
                        <button 
                          onClick={() => {
                            setEegActive(!eegActive);
                            speakLocal(eegActive ? "뇌파 계측 대기 전환 완료." : "뇌파 측정 알파 파장 연신 기동.");
                          }}
                          className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between h-[115px] transition-all relative overflow-hidden group ${
                            eegActive ? 'bg-[#f1f5f9]/10 border-orange-500' : 'bg-transparent border-[#2d323e] hover:border-orange-500/40'
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-xl">🧠</span>
                            <span className="text-[8px] font-mono font-black text-[#8a8a8a]">ALPHA-BAND</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-500 block leading-none">뇌파 집중강도</span>
                            <span className="text-base font-black">{eegActive ? '88 uV' : '비동작'}</span>
                            <span className="text-[9px] text-[#8a8a8a] block leading-tight mt-1">집중 및 탈수 피식 감지</span>
                          </div>
                        </button>

                        {/* Heart Rate */}
                        <button 
                          onClick={() => {
                            onUpdateWorker?.({
                              sensors: { ...worker.sensors, heartRate: worker.sensors.heartRate > 120 ? 74 : 145 }
                            });
                          }}
                          className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between h-[115px] transition-all relative overflow-hidden group ${
                            worker.sensors.heartRate > 120 ? 'bg-red-500/15 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-transparent border-[#2d323e] hover:border-orange-500/40'
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-xl animate-pulse">💓</span>
                            <span className="text-[8px] font-mono font-black text-red-400">{worker.sensors.heartRate.toFixed(0)} bpm</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-500 block leading-none">심장 박동수</span>
                            <span className="text-base font-black">
                              {worker.sensors.heartRate.toFixed(0)} <span className="text-xs">BPM</span>
                            </span>
                            <span className="text-[9px] text-[#8a8a8a] block leading-tight mt-1">맥파 자율 전극 연신</span>
                          </div>
                        </button>

                        {/* G-Force */}
                        <button 
                          onClick={() => {
                            setGForce(prev => prev === 1.0 ? 4.2 : 1.0);
                            const highForce = gForce === 1.0;
                            speakLocal(highForce ? "충격량 4.2G 발생! 낙상 정밀 관측을 개시합니다." : "지속 충격 소멸되었습니다.");
                            if (highForce) {
                              setTimeout(() => triggerAutomaticDialogue(), 1200);
                            }
                          }}
                          className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between h-[115px] transition-all relative overflow-hidden group ${
                            gForce > 2.0 ? 'bg-orange-500/10 border-orange-500 animate-bounce' : 'bg-transparent border-[#2d323e] hover:border-orange-500/40'
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-xl">🏃</span>
                            <span className="text-[8px] font-mono font-black text-orange-400">{gForce.toFixed(1)} G</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-500 block leading-none">행동 가속도</span>
                            <span className="text-base font-black">{gForce > 2.0 ? '충격량 경보' : '1.0G 안정'}</span>
                            <span className="text-[9px] text-[#8a8a8a] block leading-tight mt-1">자이로 3축 평정</span>
                          </div>
                        </button>

                        {/* Bluetooth */}
                        <button 
                          onClick={() => {
                            setBluetoothSignal(prev => prev === -42 ? -89 : -42);
                            speakLocal(bluetoothSignal === -42 ? "페어링 감도 약화 수축 우려 발생." : "연동 신호 양호 회귀.");
                          }}
                          className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between h-[115px] transition-all relative overflow-hidden group ${
                            bluetoothSignal < -80 ? 'bg-yellow-500/10 border-yellow-500' : 'bg-transparent border-[#2d323e] hover:border-orange-500/40'
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-xl">📡</span>
                            <span className="text-[8px] font-mono font-black text-[#8a8a8a]">{bluetoothSignal} dBm</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-500 block leading-none">블루투스 감도</span>
                            <span className="text-base font-black">{bluetoothSignal < -80 ? '비콘 신호 약화' : '지상 최우수'}</span>
                            <span className="text-[9px] text-[#8a8a8a] block leading-tight mt-1">신호 굴절 백업 채널</span>
                          </div>
                        </button>

                      </div>
                    </div>

                    {/* Bottom 2 Large Rectangular Callout Buttons */}
                    <div className="space-y-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest font-mono block px-1 text-left ${style.mutedText}`}>
                        HHS 긴급 구조 원클릭 조치
                      </span>
                      <div className="grid grid-cols-2 gap-3.5">
                        {/* SOS Button */}
                        <button 
                          onClick={() => {
                            setDialogueActive(true);
                            setDialogueStep(1);
                            setDialogueCountdown(5);
                            speakLocal("사용자 수동 긴급 호출 전개됩니다. 5초 내 슬라이드 미 해제 시 구조대 일제 전송됩니다.");
                          }}
                          className="bg-red-650 hover:bg-red-700 text-white p-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all h-[52px]"
                        >
                          📞 {t('sosButton')}
                        </button>

                        {/* Report Hazard */}
                        <button 
                          onClick={() => {
                            speakLocal("위험 수동 보고 완료. 인접 근로자에게 비콘 알림이 피드로 전배되었습니다.");
                            setShowSpeechBubble("🚨 관제소 실시간 접수: 'B구역 붕괴 요인 위험 피드 확산 완료'");
                            setTimeout(() => setShowSpeechBubble(null), 3000);
                          }}
                          className="bg-[#242933] border border-[#2d323e] hover:border-orange-500 text-white p-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all h-[52px]"
                        >
                          📢 {t('shareHazard')}
                        </button>
                      </div>
                    </div>

                    {/* First-Aid: CPR Golden Time Guide card */}
                    <div className="p-4 bg-[#161a21]/90 border border-[#2d323e] rounded-2xl shadow-xl">
                      <div className="flex gap-2 items-center mb-2 border-b border-[#2d323e] pb-1.5">
                        <span className="text-base animate-pulse">❤️</span>
                        <span className="text-xs font-black text-white uppercase tracking-wider">
                          {t('cprGuide')}
                        </span>
                      </div>
                      <p className={`text-[11px] leading-relaxed mb-3 text-left ${style.mutedText}`}>
                        사고 목격 직후의 인공호흡 및 연속 흉부 압박은 생존 복귀율을 최고 3배 이상 배가시킵니다. <strong className="text-orange-400">"빠를수록 좋습니다!"</strong>
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2 text-left">
                        <div className="bg-[#121417]/80 p-2.5 rounded-xl border border-[#232731] text-[10px] leading-snug">
                          <span className="text-[9px] font-black text-orange-500 block mb-0.5">1. 의식 확인</span>
                          <span className="text-gray-300">어깨 양쪽 두드리며 여쭙고 호흡 판정</span>
                        </div>
                        <div className="bg-[#121417]/80 p-2.5 rounded-xl border border-[#232731] text-[10px] leading-snug">
                          <span className="text-[9px] font-black text-orange-500 block mb-0.5">2. 도움 요청</span>
                          <span className="text-gray-300">119 동기화 및 자동제세동기 구함</span>
                        </div>
                        <div className="bg-[#121417]/80 p-2.5 rounded-xl border border-[#232731] text-[10px] leading-snug">
                          <span className="text-[9px] font-black text-orange-500 block mb-0.5">3. 흉부 압박</span>
                          <span className="text-gray-300">분당 100~120회, 깊이 5cm로 연속 압박</span>
                        </div>
                      </div>
                    </div>

                    {/* Simulated Action Manual for testing Fall detections */}
                    <div className="flex items-center justify-between p-3.5 bg-red-950/20 rounded-xl border border-red-500/10 text-xs">
                      <span className={`text-[11px] ${style.mutedText}`}>
                        {t('onboardingInfo')}
                      </span>
                      <button 
                        onClick={() => {
                          setSimulateFallTrigger(true);
                          speakLocal("낙상 충격량이 수신되어 비상 대화 루프가 구동됩니다. 의식 점검을 개시합니다.");
                        }}
                        className="bg-red-650 text-white hover:bg-red-700 px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] active:scale-95"
                      >
                        {t('triggerFallSim')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        ) : (
          <motion.div 
            key="research-tab"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="p-4 space-y-6"
          >
            {/* PPT AI & UX REDESIGN REPORT EMBED */}
            <div className="bg-[#1a1d24] border border-[#2d323e] p-5 rounded-2xl space-y-4">
              <div className="flex justify-between items-start border-b border-[#2d323e] pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-orange-500/20 text-orange-400 rounded-lg">
                    <Users size={18} />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">HHS R&D / UX 기획서 보고서</h3>
                    <p className="text-[10px] text-[#8a8a8a] font-mono leading-none mt-1">RESEARCH DECK & WORK ROSTER (TEAM OF 6)</p>
                  </div>
                </div>
                <Badge className="bg-orange-600 text-white text-[9px] font-black">6-TEAM STUDY</Badge>
              </div>

              {/* Roster / Team Work Division */}
              <div className="bg-[#121417] p-3 rounded-xl border border-[#242933]">
                <h4 className="text-xs font-black text-white uppercase tracking-tight mb-2 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  프로젝트 조원 6명 역할 배분 매핑
                </h4>
                <div className="grid grid-cols-3 gap-2 text-[10px] leading-tight">
                  <div className="border border-[#222631] p-2 rounded-lg bg-black/30">
                    <strong className="text-orange-400 block mb-0.5">조원 1 & 2</strong>
                    <span className="text-[#e2e2e2] font-medium">회사 로고 및 PPT AI 재설계, CI 규격 맵 디자인 담당임</span>
                  </div>
                  <div className="border border-[#222631] p-2 rounded-lg bg-black/30">
                    <strong className="text-[#8a8a8a] block mb-0.5">조원 3 & 4</strong>
                    <span className="text-[#e2e2e2] font-medium">음성 인식 대화모드 및 5초 취소 딜레이 UX 모델 설계</span>
                  </div>
                  <div className="border border-[#222631] p-2 rounded-lg bg-black/30">
                    <strong className="text-orange-400 block mb-0.5">조원 5 & 6</strong>
                    <span className="text-[#e2e2e2] font-medium">동료 전파 알림 시스템, GPS 백업 과업 게시판 UI 제작</span>
                  </div>
                </div>
              </div>

              {/* Desk Research Findings */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8a8a8a]" />
                  Problem Hypotheses (검증 전 가설)
                </h4>
                <ul className="text-[11px] text-[#8a8a8a] space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>
                    <strong className="text-white">대응 지연 비용:</strong> 사고 직후의 확인과 구조 요청이 늦어질수록 피해가 커질 수 있으므로, 경보 이후의 확인·전파 흐름을 함께 설계해야 한다는 가설.
                  </li>
                  <li>
                    <strong className="text-white">수동 조작의 한계:</strong> 낙상·협착 상황에서는 작업자가 직접 통화 버튼을 누르지 못할 수 있으므로, 무응답 확인과 주변 동료 전파가 필요하다는 가설.
                  </li>
                  <li>
                    <strong className="text-white">알람 피로:</strong> 잦은 경보는 중요한 알림의 반응률을 낮출 수 있으므로, 주의·위험 단계와 사용자 취소 흐름을 구분해야 한다는 가설.
                  </li>
                </ul>
              </div>

              {/* Field Research (비정형 현장 데이터) */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f97316]" />
                  User Scenarios (인터뷰로 검증할 가설)
                </h4>
                <ul className="text-[11px] text-[#8a8a8a] space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>
                    <strong className="text-white">작업자 시나리오:</strong> 반복되는 오경보가 장비 신뢰를 낮출 수 있다. 평상시에는 조용히 동작하고 위험 단계에서만 강하게 알려야 한다.
                  </li>
                  <li>
                    <strong className="text-white">안전관리자 시나리오:</strong> 실내·지하에서는 위치 신호가 불안정할 수 있다. 센서 좌표뿐 아니라 당일 작업 구역과 작업 내용을 함께 확인해야 한다.
                  </li>
                </ul>
              </div>

              {/* User Journey Map Layout */}
              <div className="bg-[#121417] p-3 rounded-xl border border-[#242933]">
                <h4 className="text-xs font-black text-[#f97316] uppercase tracking-wider mb-2">User Journey Map (사고 기점 3단계 매핑)</h4>
                <div className="space-y-3 divide-y divide-[#2d323e]">
                  <div className="pb-2 text-[10px]">
                    <span className="text-green-400 font-bold block mb-0.5">1단계: 사고 전 (Safe Monitoring)</span>
                    <p className="text-[#8a8a8a] leading-tight">
                      - <strong>사용자 행위:</strong> 안전모 정상 착용, 4종 센서(심박, 뇌파, 가속, 블루투스) 백그라운드 소음 무음 측정.<br />
                      - <strong>시스템 가동:</strong> 가칭 '피로 방지 필터'를 적용하여 미세 이탈 경보는 시각만 경유 통보, 불필요한 청각 연동 기각. GPS 좌표 저하에 대응한 당일 과업 내역 고수.
                    </p>
                  </div>
                  <div className="py-2 text-[10px]">
                    <span className="text-yellow-400 font-bold block mb-0.5">2단계: 사고 중 (Instant Accident Check)</span>
                    <p className="text-[#8a8a8a] leading-tight">
                      - <strong>사용자 행위:</strong> 높은 낙하 충격 발생 또는 임계 심박 폭발 수치 발현.<br />
                      - <strong>시스템 가동:</strong> 5초 간의 자체 해제 기동 대시보드를 선 개설 (불필요한 과대 경보 예방), 기각 실패 시 MAX 기기 볼륨 및 유선 정밀 대화 모드 긴급 스피커 가동. "🗣️ 살려줘/도와줘" 국부 음성 주파수 자율 판독.
                    </p>
                  </div>
                  <div className="pt-2 text-[10px]">
                    <span className="text-red-400 font-bold block mb-0.5">3단계: 사고 후 (Fast Rescue Dispatch)</span>
                    <p className="text-[#8a8a8a] leading-tight">
                      - <strong>사용자 행위:</strong> 대화 모드 내 의사 체크에 따른 생명 유도, 불능 시 무동작 응급 접수.<br />
                      - <strong>시스템 가동:</strong> 인접 작업자와 관리자에게 경보 전파, 응급 대응 가이드와 마지막 확인 작업 구역을 관제 화면에 표시. 실제 외부 신고 연동은 구현하지 않은 시뮬레이션.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HHS SMART HELMET AUDIO DIALOGUE INTERFACES (대화 모드 오버레이) */}
      <AnimatePresence>
        {dialogueActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 text-center"
          >
            {/* Circular Sound Wave Animation */}
            <div className="w-[180px] h-[180px] rounded-full border-4 border-orange-500/80 flex flex-col items-center justify-center relative bg-black shadow-[0_0_50px_rgba(249,115,22,0.4)] mb-6">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ duration: 1.2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-orange-500/30"
              />
              <motion.div 
                animate={{ scale: [1, 1.4, 1] }} 
                transition={{ duration: 1.8, repeat: Infinity }}
                className="absolute inset-0 rounded-full border border-orange-500/10"
              />
              
              <Volume2 size={44} className="text-orange-500 mb-1 animate-bounce" />
              <div className="text-center px-3 z-10">
                <span className="text-[10px] font-mono font-black text-[#8a8a8a] uppercase block tracking-widest">MAX SOUND SPEECHES</span>
                <span className="text-xs text-white font-black">음성 생동 송출중</span>
              </div>
            </div>

            <div className="text-center max-w-sm mb-6">
              <span className="px-3 py-1 bg-red-600 text-white rounded-full text-[9px] font-black uppercase tracking-wider mb-2.5 inline-block animate-pulse">
                HHS SMART DIALOGUE ACTIVE
              </span>
              <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">안전모 스마트 의식 감지 가동</h2>
              <p className="text-[#8a8a8a] text-xs mt-2 leading-relaxed">
                현재 생체 이상 반응이 검출되었습니다. 귀하의 안전 상태 파악을 위하여 안전헬멧 자가 대화 모드가 발원되었습니다.
              </p>
            </div>

            {/* Step Selection Dialogue Trees */}
            <div className="w-full max-w-sm space-y-3.5">
              
              {dialogueStep === 1 ? (
                <>
                  <div className="bg-[#1a1d24] border border-orange-500/30 p-4 rounded-xl text-center space-y-1">
                    <p className="text-xs text-orange-400 font-bold uppercase tracking-wider">응답 유예 대기 잔여 시간</p>
                    <p className="text-3xl font-black font-mono animate-pulse">{dialogueCountdown} <span className="text-xs font-normal">초</span></p>
                    <p className="text-[10px] text-gray-400">무응답 만료 시 자동으로 기절 상태 ('위급' 최고 레벨) 구조 발효.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => {
                        setDialogueStep(2);
                        speakLocal("의사확인이 완료되었습니다. 다친 곳이 있으십니까?");
                      }}
                      className="bg-[#242933] border border-emerald-500/30 hover:border-emerald-500 p-3.5 rounded-xl text-xs font-bold text-white flex flex-col items-center gap-1.5 transition-all text-center"
                    >
                      💚 응! (의식 온전함)
                    </button>
                    <button 
                      onClick={() => {
                        setDialogueStep(3);
                        speakLocal("거동 불능 및 부상 접수. 안전실 및 인근 동료에게 정밀 구호 좌표를 발원합니다.");
                      }}
                      className="bg-[#242933] border border-red-500/30 hover:border-red-500 p-3.5 rounded-xl text-xs font-bold text-white flex flex-col items-center gap-1.5 transition-all text-center"
                    >
                      🚨 아파요 (거동 불가)
                    </button>
                  </div>
                  
                  {/* Cancel helper countdown slider (③) */}
                  <div className="bg-[#121417] p-3 rounded-xl border border-[#20242f] space-y-2">
                    <span className="text-[10px] text-[#8a8a8a] font-bold block">
                      단순 터치 및 기기 오작동 방지용 슬라이드 확인 (확인 시 t('pointsCollected') +100)
                    </span>
                    
                    {/* Slide confirmation lock */}
                    <div className="w-full bg-red-950/20 rounded-full p-1 relative h-12 flex items-center">
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-white/40 font-bold uppercase text-[10px] tracking-wider">드래그하여 알림 취소</span>
                      </div>
                      <div className="absolute left-1 right-1 h-10 bg-[#121417] rounded-full overflow-hidden pointer-events-none">
                        <motion.div 
                          className="h-full bg-emerald-500/30"
                          animate={{ width: `${Math.min(100, Math.max(0, slideValue))}%` }}
                        />
                      </div>
                      <motion.div
                        drag="x"
                        dragConstraints={{ left: 0, right: 180 }}
                        dragElastic={0.05}
                        onDrag={(_, info) => {
                          const percent = (info.point.x / 180) * 100;
                          setSlideValue(percent);
                        }}
                        onDragEnd={() => {
                          if (slideValue >= 85) {
                            setSimulateFallTrigger(false);
                            setDialogueActive(false);
                            onConfirmAlert();
                            setRewardsWallet(p => p + 100);
                            setSlideValue(0);
                            speakLocal("정상 상태 전수 해소 접수. 100 리워드 포인트가 적립되었습니다.");
                            onUpdateWorker?.({
                              status: 'normal',
                              accidentClassification: 'none'
                            });
                          } else {
                            setSlideValue(0);
                          }
                        }}
                        animate={{ x: (Math.min(100, Math.max(0, slideValue)) / 100) * 180 }}
                        transition={slideValue === 0 ? { type: 'spring', damping: 25, stiffness: 200 } : { type: 'just' }}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg z-10"
                      >
                        <ChevronRight className="text-orange-600 animate-pulse" size={20} />
                      </motion.div>
                    </div>

                    {/* Sub-function: Volume down hold (③) */}
                    <div className="border-t border-[#8a8a8a]/10 pt-2 text-left">
                      <span className="text-[9.5px] text-[#8a8a8a] block leading-tight mb-2.5">
                        💡 대기 하위 서브 기능: 소형 음량 Down 물리 버튼을 3초간 Hold하여도 해제 가능합니다.
                      </span>
                      <button 
                        onMouseDown={() => setIsHoldingVolume(true)}
                        onMouseUp={() => setIsHoldingVolume(false)}
                        onMouseLeave={() => setIsHoldingVolume(false)}
                        onTouchStart={() => setIsHoldingVolume(true)}
                        onTouchEnd={() => setIsHoldingVolume(false)}
                        className="w-full py-2.5 bg-orange-600/10 border border-orange-500/40 hover:bg-orange-600 text-white font-black text-[11px] uppercase tracking-wide transition-all active:scale-95 flex flex-col items-center justify-center relative overflow-hidden"
                      >
                        {/* Progress fill */}
                        {isHoldingVolume && (
                          <div 
                            className="absolute left-0 top-0 bottom-0 bg-orange-500/20 transition-all duration-300"
                            style={{ width: `${holdProgress}%` }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                          🔈 {isHoldingVolume ? '볼륨 다운 버튼 홀딩 중...' : '볼륨 다운 버튼 3초간 꾹 누르기'}
                        </span>
                        {isHoldingVolume && (
                          <span className="text-[9px] text-orange-400 relative z-10 font-mono mt-0.5">홀드 중... {holdProgress}%</span>
                        )}
                      </button>
                    </div>

                  </div>
                </>
              ) : dialogueStep === 2 ? (
                <>
                  <div className="bg-[#1a1d24] border border-[#2d323e] p-4 rounded-xl text-center space-y-1.5">
                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">의사 및 응답 감지 완료</p>
                    <p className="text-[11px] text-gray-300">"고심박/낙상은 오경보입니까? 정상 근무로 회수하려면 정상화를 선택하십시오."</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => {
                        setDialogueActive(false);
                        setSimulateFallTrigger(false);
                        onConfirmAlert();
                        setRewardsWallet(p => p + 100);
                        speakLocal("정상 상태 복구 전역 확정. 리워드 100포인트를 적립합니다.");
                        onUpdateWorker?.({
                          status: 'normal',
                          accidentClassification: 'none'
                        });
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl text-xs font-black transition-all text-center flex items-center justify-center gap-1.5 h-12"
                    >
                      ✔️ 정상근무 전환 (취소)
                    </button>
                    <button 
                      onClick={() => {
                        setDialogueStep(3);
                        speakLocal("즉시 소장 및 유선 구조 통보 전송.");
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl text-xs font-black transition-all text-center flex items-center justify-center gap-1.5 h-12"
                    >
                      🚨 긴급 소환 통보
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-red-950/40 border border-red-500/40 p-4 rounded-xl text-center space-y-2 animate-pulse">
                    <div className="flex justify-center">🚑</div>
                    <div>
                      <p className="text-xs text-white font-black uppercase">인명 전파 구조 신호 개시</p>
                      <p className="text-[10px] text-red-300">과태 지연: 즉각적 응대 부재로 '기절 상태' 확치됨.</p>
                      <p className="text-[9.5px] text-gray-400">당일 작업 context: [{editedLocation} {editedFloor}층 {editedTask}] 데이터를 바탕으로 비상 구조 채널 매핑 완료.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setDialogueActive(false);
                      setSimulateFallTrigger(false);
                      onConfirmAlert();
                      speakLocal("경보가 하드 진동 해제되었습니다.");
                      onUpdateWorker?.({
                        status: 'normal',
                        accidentClassification: 'none'
                      });
                    }}
                    className="w-full bg-[#242933] border border-[#2d323e] hover:border-orange-500 text-white p-3.5 rounded-xl text-xs font-black transition-all text-center"
                  >
                    ⏮️ 상황 전면 수동 리셋
                  </button>
                </>
              )}

              {/* Dialogue Log Console Track */}
              <div className="bg-black/60 border border-[#20242f] rounded-xl p-3 h-28 overflow-y-auto font-mono text-[9px] text-[#8a8a8a] text-left space-y-1 custom-scrollbar">
                <span className="text-[#f97316] font-bold block mb-1">■ 대화 안전모 시스템 인터페이스 로그</span>
                {dialogueLogs.map((log, i) => (
                  <div key={i} className="leading-tight">{log}</div>
                ))}
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual GPS shadow input fallback modal */}
      <AnimatePresence>
        {showLocationModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`p-6 rounded-2xl w-full max-w-sm space-y-4 border ${style.cardBg}`}
            >
              <div className="border-b border-[#8a8a8a]/20 pb-2">
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  📍 당일 현장 작업 구역 정보 수동 매핑
                </h3>
                <p className="text-[10px] text-gray-400 mt-1">
                  GPS 교신이 끊어질 터널, 지하 콘크리트 구획의 빠른 구조 추적용 맥락 기반 과업 설정입니다.
                </p>
              </div>

              <div className="space-y-3">
                {/* Location Selection */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">구역 선택 (Zone Area)</label>
                  <select 
                    value={editedLocation} 
                    onChange={(e) => setEditedLocation(e.target.value)}
                    className="w-full bg-[#121417]/90 border border-[#2d323e] rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500"
                  >
                    <option value="A구역 (기자재 수송로)">A구역 (기자재 수송로)</option>
                    <option value="B구역 (콘크리트 기둥)">B구역 (콘크리트 기둥)</option>
                    <option value="C구역 (밀폐 가스실)">C구역 (밀폐 가스실)</option>
                    <option value="D구역 (철골 골조 외곽)">D구역 (철골 골조 외곽)</option>
                    <option value="E구역 (하수 굴착부)">E구역 (하수 굴착부)</option>
                  </select>
                </div>

                {/* Floor Level Select */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">층수 입력 (Floor Level)</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map((fl) => (
                      <button 
                        key={fl}
                        onClick={() => setEditedFloor(fl)}
                        className={`py-1.5 rounded-lg font-bold text-xs ${
                          editedFloor === fl ? 'bg-orange-500 text-white' : 'bg-[#121417] text-gray-400 border border-[#2d323e]'
                        }`}
                      >
                        {fl}F
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Task description typing */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">담당 과업 세부 변경</label>
                  <input 
                    type="text" 
                    value={editedTask}
                    onChange={(e) => setEditedTask(e.target.value)}
                    className="w-full bg-[#121417]/90 border border-[#2d323e] rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500"
                    placeholder="예: 전선 정비, 골조 용접, 고소 용접"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 border-t border-[#8a8a8a]/10 pt-3">
                <button 
                  onClick={() => setShowLocationModal(false)}
                  className="bg-[#121417] text-gray-400 text-xs py-2.5 rounded-xl font-bold border border-[#2d323e] hover:bg-gray-800"
                >
                  취소 (Cancel)
                </button>
                <button 
                  onClick={saveManualLocation}
                  className="bg-orange-500 hover:bg-orange-600 text-[#121417] text-xs py-2.5 rounded-xl font-black"
                >
                  위치 정보 연동 저장
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
