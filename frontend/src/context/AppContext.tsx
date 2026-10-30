import React, { createContext, useContext, useState, useEffect } from 'react';
import { AssessmentResponse, ClimateInput } from '../types';
import { api } from '../services/api';

export const DEFAULT_DEMO_INPUT: ClimateInput = {
  country: "India",
  state: "Punjab",
  district: "Ludhiana",
  crop: "Wheat (Rabi)",
  growing_season: "Rabi (Nov - Apr)",
  assessment_year: 2024,
  irrigation_type: "Canal & Tubewell (Assured)",
  avg_temperature: 17.3,
  max_temperature: 36.6,
  rainfall_mm: 78.3,
  humidity_pct: 37.7,
  soil_moisture_pct: 38.6,
  heat_wave_days: 18
};

interface AppContextType {
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  currentAssessment: AssessmentResponse | null;
  setCurrentAssessment: (val: AssessmentResponse | null) => void;
  isBackendOnline: boolean;
  refreshHealth: () => Promise<void>;
  sampleDemoInput: ClimateInput;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [currentAssessment, setCurrentAssessment] = useState<AssessmentResponse | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);

  const refreshHealth = async () => {
    try {
      const health = await api.getHealth();
      setIsBackendOnline(true);
      if (health.demo_mode) {
        setDemoMode(true);
      }
    } catch {
      setIsBackendOnline(false);
    }
  };

  useEffect(() => {
    refreshHealth();
    const interval = setInterval(refreshHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider
      value={{
        demoMode,
        setDemoMode,
        currentAssessment,
        setCurrentAssessment,
        isBackendOnline,
        refreshHealth,
        sampleDemoInput: DEFAULT_DEMO_INPUT
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
