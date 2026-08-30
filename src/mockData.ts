
import { Worker, SensorData } from './types';

const NAMES = ['홍길동', '김철수', '이영희', '박지민', '최수호', '정다은', '강민재', '윤서연', '임도윤', '한지우', '오세진', '서미경', '권태현', '황보라', '안준우', '송지효', '전우치', '심청이', '임꺽정', '장길산'];
const ZONES = ['A구역', 'B구역', 'C구역', 'D구역', 'E구역'];

export const MOCK_WORKERS: Worker[] = NAMES.map((name, index) => {
  const zone = ZONES[index % ZONES.length];
  const floor = (index % 3) + 1; // 1, 2, 3층
  const tasks = ['용접 작업', '전선 점검', '철골 조립', '안전 시설 설치', '유기용제 분사', '도장 가공'];
  const customTask = tasks[index % tasks.length];
  const battery = Math.floor(20 + Math.random() * 80); // 20% to 100%
  const accidentClassification: 'critical' | 'emergency' | 'minor' | 'none' = 
    index === 0 ? 'critical' : index === 2 ? 'emergency' : index % 5 === 0 ? 'minor' : 'none';
  
  return {
    id: `${index + 1}`,
    name,
    status: index === 0 ? 'emergency' : index === 2 ? 'emergency' : index % 5 === 0 ? 'warning' : 'normal',
    sensors: {
      heartRate: index === 0 ? 145 : 70 + Math.random() * 20,
      eeg: index === 0 ? 15 : 60 + Math.random() * 30,
      temp: 36.5 + Math.random(),
      oxygen: index === 0 ? 92 : 96 + Math.random() * 4,
      gas: Math.random() * 0.05,
      helmetWorn: Math.random() > 0.1,
      isFalling: index === 0 || index === 2,
      eyeMovement: Math.random() > 0.05,
    },
    activeAlerts: (index === 0 || index === 2) ? ['vibration', 'sound', 'flash'] : [],
    isConnected: index === 3 ? false : Math.random() > 0.05, // force index 3 as disconnected for clear notification check
    location: zone,
    floor: floor,
    battery,
    customTask,
    accidentClassification,
    logs: [
      { id: 'l1', timestamp: '2026-04-10 12:00:00', type: 'status', message: '작업 시작' },
      { id: 'l2', timestamp: '2026-04-10 13:15:00', type: 'status', message: '현장 도착' }
    ]
  };
});

export const getRandomSensorData = (current: SensorData): SensorData => {
  return {
    ...current,
    heartRate: Math.max(60, Math.min(160, current.heartRate + (Math.random() * 4 - 2))),
    eeg: Math.max(0, Math.min(100, current.eeg + (Math.random() * 10 - 5))),
    temp: Math.max(35, Math.min(40, current.temp + (Math.random() * 0.2 - 0.1))),
    oxygen: Math.max(85, Math.min(100, current.oxygen + (Math.random() * 2 - 1))),
    gas: Math.max(0, Math.min(1, current.gas + (Math.random() * 0.02 - 0.01))),
  };
};
