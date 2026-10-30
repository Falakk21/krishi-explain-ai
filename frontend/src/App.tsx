import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { ClimateDashboard } from './pages/ClimateDashboard';
import { ImpactAssessment } from './pages/ImpactAssessment';
import { ExplainableAI } from './pages/ExplainableAI';
import { ClimateSimulator } from './pages/ClimateSimulator';
import { AdaptationInsights } from './pages/AdaptationInsights';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-cream text-charcoal">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<ClimateDashboard />} />
              <Route path="/assessment" element={<ImpactAssessment />} />
              <Route path="/explainability" element={<ExplainableAI />} />
              <Route path="/simulator" element={<ClimateSimulator />} />
              <Route path="/adaptation" element={<AdaptationInsights />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
