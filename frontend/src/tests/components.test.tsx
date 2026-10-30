import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { DemoBadge } from '../components/DemoBadge';
import { RiskIndicatorBadge } from '../components/RiskIndicatorBadge';
import { AppProvider } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

describe('Frontend Components Test Suite', () => {
  it('renders DemoBadge correctly in demo mode', () => {
    render(<DemoBadge isDemo={true} />);
    expect(screen.getByText(/DEMO DATA/i)).toBeInTheDocument();
  });

  it('renders DemoBadge correctly in real model mode', () => {
    render(<DemoBadge isDemo={false} />);
    expect(screen.getByText(/HISTORICAL-DATA ESTIMATE/i)).toBeInTheDocument();
  });

  it('renders RiskIndicatorBadge with proper severity styling and score', () => {
    const indicator = {
      category: "Terminal Heat Stress",
      level: "High" as const,
      score: 75.0,
      description: "Severe heatwave days observed.",
      threshold_info: "Threshold: >31°C"
    };
    render(<RiskIndicatorBadge indicator={indicator} />);
    expect(screen.getByText("Terminal Heat Stress")).toBeInTheDocument();
    expect(screen.getByText(/high/i)).toBeInTheDocument();
    expect(screen.getByText(/Severe heatwave days observed/i)).toBeInTheDocument();
  });

  it('renders Navbar with all core navigation links', () => {
    render(
      <AppProvider>
        <BrowserRouter>
          <>
            <Navbar />
            <Footer />
          </>
        </BrowserRouter>
      </AppProvider>
    );

    expect(screen.getAllByText(/KrishiExplain/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Climate Dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Impact Assessment/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Crop Factor Insights/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Climate Simulator/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Adaptation Insights/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: /^About$/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Python|FastAPI|Scikit-learn|SHAP|React|Vite/i)).not.toBeInTheDocument();
    for (const path of ['/', '/dashboard', '/assessment', '/explainability', '/simulator', '/adaptation']) {
      expect(screen.getAllByRole('link').some((link) => link.getAttribute('href') === path)).toBe(true);
    }
  });
});
