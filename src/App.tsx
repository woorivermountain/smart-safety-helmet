/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { MOCK_WORKERS, getRandomSensorData } from './mockData';
import { Worker, AlertType } from './types';
import UserView from './components/UserView';
import ManagerView from './components/ManagerView';
import LoginView from './components/LoginView';
import OnboardingFlow from './components/OnboardingFlow';
import { Button } from '@/components/ui/button';
import { Users, User, LogOut } from 'lucide-react';

export default function App() {
  const [workers, setWorkers] = useState<Worker[]>(MOCK_WORKERS);
  const [viewMode, setViewMode] = useState<'manager' | 'user'>('manager');
  const [currentUserId, setCurrentUserId] = useState<string>('1');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  // Simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkers(prevWorkers => 
        prevWorkers.map(worker => ({
          ...worker,
          sensors: getRandomSensorData(worker.sensors)
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerAlert = useCallback((workerId: string, alertTypes: AlertType[]) => {
    setWorkers(prev => prev.map(w => 
      w.id === workerId 
        ? { ...w, activeAlerts: alertTypes, status: 'emergency' as const } 
        : w
    ));
  }, []);

  const handleTriggerBulkAlert = useCallback((location: string, alertTypes: AlertType[], floor?: number) => {
    setWorkers(prev => prev.map(w => 
      w.location === location && (floor === undefined || w.floor === floor)
        ? { ...w, activeAlerts: alertTypes } 
        : w
    ));
  }, []);

  const handleConfirmAlert = useCallback((workerId: string) => {
    setWorkers(prev => prev.map(w => 
      w.id === workerId 
        ? { 
            ...w, 
            activeAlerts: [], 
            status: 'normal' as const,
            logs: [
              { 
                id: Math.random().toString(36).substr(2, 9), 
                timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19), 
                type: 'status', 
                message: `작업자 확인: 알림 해제` 
              },
              ...w.logs
            ]
          } 
        : w
    ));
  }, []);

  const handleResolveAlert = useCallback((workerId: string, comment: string) => {
    setWorkers(prev => prev.map(w => 
      w.id === workerId 
        ? { 
            ...w, 
            activeAlerts: [], 
            status: 'normal' as const,
            logs: [
              { 
                id: Math.random().toString(36).substr(2, 9), 
                timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19), 
                type: 'comment', 
                message: `관리자 조치: ${comment}` 
              },
              ...w.logs
            ]
          } 
        : w
    ));
  }, []);

  const handleRemoveWorker = useCallback((workerId: string) => {
    setWorkers(prev => prev.filter(w => w.id !== workerId));
  }, []);

  const handleAddWorker = useCallback((newWorkerData: { name: string; location: string; floor: number; customTask: string }) => {
    setWorkers(prev => {
      const numericIds = prev.map(w => parseInt(w.id, 10)).filter(id => !isNaN(id));
      const nextId = (numericIds.length > 0 ? Math.max(...numericIds) + 1 : prev.length + 1).toString();
      const newWorker: Worker = {
        id: nextId,
        name: newWorkerData.name,
        status: 'normal',
        sensors: {
          heartRate: 72 + Math.floor(Math.random() * 8),
          eeg: 80 + Math.floor(Math.random() * 10),
          temp: 36.5 + (Math.random() * 0.4),
          oxygen: 98 + Math.floor(Math.random() * 3),
          gas: 0.01 + (Math.random() * 0.02),
          helmetWorn: true,
          isFalling: false,
          eyeMovement: true,
        },
        activeAlerts: [],
        isConnected: true,
        location: newWorkerData.location,
        floor: newWorkerData.floor,
        battery: 100,
        customTask: newWorkerData.customTask,
        accidentClassification: 'none',
        logs: [
          {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
            type: 'status',
            message: `작업자 신규 등록: ${newWorkerData.name} - ${newWorkerData.location} ${newWorkerData.floor}층 [${newWorkerData.customTask}]`
          }
        ]
      };
      return [...prev, newWorker];
    });
  }, []);

  const handleUpdateWorker = useCallback((workerId: string, updatedFields: Partial<Worker>) => {
    setWorkers(prev => prev.map(w => 
      w.id === workerId ? { ...w, ...updatedFields } : w
    ));
  }, []);

  const handleLogin = (mode: 'manager' | 'user') => {
    setViewMode(mode);
    setIsLoggedIn(true);
    setOnboardingCompleted(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setOnboardingCompleted(false);
  };

  const handleOnboardingComplete = () => {
    setOnboardingCompleted(true);
  };

  const currentUser = workers.find(w => w.id === currentUserId) || workers[0];

  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} />;
  }

  if (!onboardingCompleted) {
    return <OnboardingFlow mode={viewMode} onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Floating Action Menu */}
      <div className="fixed bottom-6 right-6 z-[100] flex gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-full bg-gray-900/80 backdrop-blur border border-white/10 text-white/50 hover:text-white px-4 h-10 shadow-2xl"
          onClick={handleLogout}
        >
          <LogOut size={16} className="mr-2" />
          시스템 로그아웃
        </Button>
      </div>

      {viewMode === 'manager' ? (
        <ManagerView 
          workers={workers} 
          onTriggerAlert={handleTriggerAlert} 
          onTriggerBulkAlert={handleTriggerBulkAlert}
          onResolveAlert={handleResolveAlert}
          onRemoveWorker={handleRemoveWorker}
          onAddWorker={handleAddWorker}
        />
      ) : (
        <UserView 
          worker={currentUser} 
          onConfirmAlert={() => handleConfirmAlert(currentUser.id)} 
          onUpdateWorker={(fields) => handleUpdateWorker(currentUser.id, fields)}
        />
      )}
    </div>
  );
}
