
export type AlertType = 'vibration' | 'sound' | 'flash';

export interface SensorData {
  heartRate: number;
  eeg: number; // 0-100 (concentration/activity)
  temp: number;
  oxygen: number;
  gas: number;
  helmetWorn: boolean;
  isFalling: boolean;
  eyeMovement: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'alert' | 'status' | 'comment';
  message: string;
}

export interface Worker {
  id: string;
  name: string;
  status: 'normal' | 'warning' | 'emergency';
  sensors: SensorData;
  activeAlerts: AlertType[];
  isConnected: boolean;
  location: string;
  floor: number;
  logs: LogEntry[];
  battery?: number;
  customTask?: string;
  accidentClassification?: 'critical' | 'emergency' | 'minor' | 'none';
}

export type TabType = 'dashboard' | 'workers' | 'map' | 'logs' | 'settings';

export interface GlobalState {
  workers: Worker[];
  currentUserMode: 'manager' | 'user';
  selectedWorkerId: string;
}
