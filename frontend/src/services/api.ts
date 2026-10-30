import {
  ClimateInput, AssessmentResponse, ExplanationResponse,
  ScenarioInput, SimulationResult, ClimateSeriesResponse,
  MetadataResponse, SystemHealth
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const api = {
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getMetadata(): Promise<MetadataResponse> {
    const res = await fetch(`${API_BASE_URL}/metadata`);
    if (!res.ok) throw new Error('Failed to fetch metadata');
    return res.json();
  },

  async getClimateSeries(district: string = 'Ludhiana', startYear = 1997, endYear = 2014): Promise<ClimateSeriesResponse> {
    const res = await fetch(
      `${API_BASE_URL}/climate?district=${encodeURIComponent(district)}&start_year=${startYear}&end_year=${endYear}`
    );
    if (!res.ok) throw new Error('Failed to fetch climate series');
    return res.json();
  },

  async assessImpact(input: ClimateInput, forceDemo = false): Promise<AssessmentResponse> {
    const res = await fetch(`${API_BASE_URL}/assess?force_demo=${forceDemo}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Assessment computation failed');
    }
    return res.json();
  },

  async getExplanation(sampleInput?: ClimateInput, forceDemo = false): Promise<ExplanationResponse> {
    const res = await fetch(`${API_BASE_URL}/explain?force_demo=${forceDemo}`, {
      method: 'POST',
      ...(sampleInput && {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleInput),
      }),
    });
    if (!res.ok) throw new Error('Failed to fetch explanation');
    return res.json();
  },

  async simulateScenario(scenario: ScenarioInput, forceDemo = false): Promise<SimulationResult> {
    const res = await fetch(`${API_BASE_URL}/simulate?force_demo=${forceDemo}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenario),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Simulation computation failed');
    }
    return res.json();
  },

  async downloadReportPdf(assessment: AssessmentResponse): Promise<Blob> {
    const res = await fetch(`${API_BASE_URL}/report/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessment),
    });
    if (!res.ok) throw new Error('Failed to generate PDF report');
    return res.blob();
  }
};
