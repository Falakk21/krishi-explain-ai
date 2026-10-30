import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CloudSun, BarChart3, HelpCircle, ShieldCheck,
  CheckCircle, ArrowUpRight, Compass, LineChart, Cpu, Lightbulb,
  AlertTriangle, RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DemoBadge } from '../components/DemoBadge';

export const Home: React.FC = () => {
  const { demoMode, isBackendOnline } = useApp();

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-mint/50 via-cream to-cream pt-12 pb-20 border-b border-sage/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mint text-forest-dark border border-sage/60 text-xs font-bold uppercase tracking-wider shadow-subtle">
                <span className="w-2 h-2 rounded-full bg-forest animate-ping inline-block" />
                <span>CLIMATE INSIGHTS FOR RESILIENT AGRICULTURE</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-forest-dark tracking-tight leading-[1.15]">
                Climate Changes. <br />
                Crops Respond. <br />
                <span className="text-forest underline decoration-sage/60 decoration-wavy decoration-2">Farmers Plan Ahead.</span>
              </h1>

              <p className="text-base sm:text-lg text-charcoal/85 max-w-2xl leading-relaxed">
                Understand how temperature, rainfall, and changing environmental conditions may influence
                agricultural productivity. Explore crop vulnerability, see which factors shape yield estimates,
                and discover evidence-based adaptation strategies.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/assessment"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-white bg-forest hover:bg-forest-dark shadow-card hover:shadow-elevated transition-all duration-200 active:scale-95"
                >
                  <span>Analyze Crop Impact</span>
                  <ArrowRight className="w-5 h-5 text-sage-light" />
                </Link>

                <Link
                  to="/explainability"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-forest-dark bg-white hover:bg-mint border border-sage/50 shadow-subtle hover:shadow-card transition-all duration-200"
                >
                  <span>Explore Crop Insights</span>
                  <ArrowUpRight className="w-4 h-4 text-forest" />
                </Link>
              </div>

              {/* Status pill */}
              <div className="flex items-center gap-3 pt-2 text-xs text-muted">
                <DemoBadge
                  isDemo={demoMode || !isBackendOnline}
                />
                <span>Rabi Wheat Benchmark • Punjab, India</span>
              </div>
            </div>

            {/* Right Agricultural & Climate Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl bg-white p-6 shadow-elevated border border-sage/40 overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-mint rounded-bl-full -z-0 opacity-70" />
                
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 relative z-10">
                  <div>
                    <span className="text-xs font-semibold text-muted uppercase">Agro-Climatic Intelligence</span>
                    <h3 className="text-lg font-bold text-forest-dark">Punjab Rabi Wheat</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-mint text-forest border border-sage">
                    Triticum aestivum
                  </span>
                </div>

                {/* Simulated Visual Insights */}
                <div className="py-5 space-y-4 relative z-10">
                  <div className="p-3.5 rounded-2xl bg-cream border border-sage/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
                        <CloudSun className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-muted font-medium">Terminal Heat Anomaly</div>
                        <div className="text-sm font-bold text-charcoal">+2.8°C March Surge</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-risk px-2 py-0.5 rounded bg-red-50 border border-red-200">
                      -0.34 t/ha
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-cream border border-sage/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sage/20 flex items-center justify-center text-forest-dark">
                        <LineChart className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-muted font-medium">Predicted Yield</div>
                        <div className="text-sm font-bold text-forest-dark">4.42 tonnes / ha</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-forest-dark px-2 py-0.5 rounded bg-mint border border-sage">
                      Factors Explained
                    </span>
                  </div>

                  {/* Micro Waterfall preview */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-medium text-muted">
                      <span>Baseline: 5.25 t/ha</span>
                      <span>Output: 4.42 t/ha</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
                      <div className="bg-forest h-full" style={{ width: '65%' }} title="Baseline Retention" />
                      <div className="bg-risk h-full" style={{ width: '20%' }} title="Heat & Drought Penalty" />
                      <div className="bg-green-600 h-full" style={{ width: '15%' }} title="Other Factor Contributions" />
                    </div>
                  </div>
                </div>

                {/* Footer Insight */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-charcoal/80">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-forest" />
                    <span>Clear Factor Insights</span>
                  </span>
                  <Link to="/explainability" className="text-forest font-semibold hover:underline flex items-center gap-1">
                    <span>View Waterfall</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* The Core Problem & Solution */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-8 sm:p-12 border border-sage/40 shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-risk">Understanding Climate Risk</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-dark">
                Clear Climate Insights for Farmers & Agronomists
              </h2>
              <p className="text-sm sm:text-base text-charcoal/80 leading-relaxed">
                A yield estimate is more useful when you can see the climate factors behind it. Explore how terminal
                March heat, irregular winter showers, and low soil moisture relate to changing wheat yields.
              </p>
              <p className="text-sm sm:text-base text-charcoal/80 leading-relaxed">
                Understanding these patterns can help farmers and policy-makers consider appropriate responses.
                KrishiExplain brings historical climate and crop information together with practical adaptation guidance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-red-50/70 border border-red-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                  ✕
                </div>
                <h4 className="font-bold text-sm text-red-950">Unexplained Yield Estimate</h4>
                <p className="text-xs text-red-900/80 leading-relaxed">
                  A number alone does not show whether heat, rainfall, or moisture patterns are associated with the estimate.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-mint border border-sage space-y-2">
                <div className="w-8 h-8 rounded-lg bg-forest text-white flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <h4 className="font-bold text-sm text-forest-dark">Climate Factors Explained</h4>
                <p className="text-xs text-forest-dark/90 leading-relaxed">
                  See how observed climate conditions relate to a yield estimate and consider responses such as early-sown heat-tolerant varieties.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-cream border border-sage/40 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h4 className="font-bold text-sm text-forest-dark">Transparent Baselines</h4>
                <p className="text-xs text-charcoal/80 leading-relaxed">
                  Compare estimates with regional historical yields (Punjab mean ~4.8–5.2 t/ha) for added context.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-cream border border-sage/40 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h4 className="font-bold text-sm text-forest-dark">Causality Boundaries</h4>
                <p className="text-xs text-charcoal/80 leading-relaxed">
                  Climate patterns can inform decisions, but do not by themselves prove biological cause and effect.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Four Core Feature Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-forest">Agricultural Climate Insights</span>
          <h2 className="text-3xl font-extrabold text-forest-dark">
            Complete Agro-Climatic Intelligence Platform
          </h2>
          <p className="text-sm text-muted">
            Explore historical climate records, estimate crop impacts, and find practical adaptation strategies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl bg-white border border-sage/40 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-mint flex items-center justify-center text-forest">
                <CloudSun className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-forest-dark">1. Climate Intelligence</h3>
              <p className="text-xs text-charcoal/80 leading-relaxed">
                Explore observed temperature, terminal heat, rainfall, and yield records for 22 Punjab districts from 1997–2014.
              </p>
            </div>
            <Link to="/dashboard" className="mt-4 pt-3 border-t border-gray-100 text-xs font-bold text-forest hover:underline flex items-center gap-1">
              <span>View Climate Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl bg-white border border-sage/40 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-mint flex items-center justify-center text-forest">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-forest-dark">2. Crop Impact Assessment</h3>
              <p className="text-xs text-charcoal/80 leading-relaxed">
                Estimate Rabi wheat yield using climate conditions and district information.
              </p>
            </div>
            <Link to="/assessment" className="mt-4 pt-3 border-t border-gray-100 text-xs font-bold text-forest hover:underline flex items-center gap-1">
              <span>Run Assessment Form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl bg-white border border-sage/40 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-mint flex items-center justify-center text-forest">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-forest-dark">3. Climate Factor Insights</h3>
              <p className="text-xs text-charcoal/80 leading-relaxed">
                See how each climate factor contributes to the yield estimate with interactive charts.
              </p>
            </div>
            <Link to="/explainability" className="mt-4 pt-3 border-t border-gray-100 text-xs font-bold text-forest hover:underline flex items-center gap-1">
              <span>View Factor Contributions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-2xl bg-white border border-sage/40 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-mint flex items-center justify-center text-forest">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-forest-dark">4. Adaptation Insights</h3>
              <p className="text-xs text-charcoal/80 leading-relaxed">
                Receive rule-based, peer-reviewed agronomic adaptation options tailored to identified vulnerability factors (PAU & ICAR-IIWBR).
              </p>
            </div>
            <Link to="/adaptation" className="mt-4 pt-3 border-t border-gray-100 text-xs font-bold text-forest hover:underline flex items-center gap-1">
              <span>Inspect Adaptation Actions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* How It Works Step Journey */}
      <section className="bg-mint/40 py-16 border-y border-sage/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-forest">From Climate to Farm Decisions</span>
            <h2 className="text-3xl font-extrabold text-forest-dark">The KrishiExplain Journey</h2>
            <p className="text-xs sm:text-sm text-charcoal/70">
              Explore climate records, understand crop impacts, and consider practical responses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-white border border-sage/40 shadow-subtle relative flex flex-col items-center text-center space-y-2">
              <span className="w-7 h-7 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h4 className="font-bold text-sm text-forest-dark">Climate Data</h4>
              <p className="text-xs text-muted leading-tight">
                NASA POWER climate data and Punjab wheat yield records from a public APY data mirror (1997–2014).
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-white border border-sage/40 shadow-subtle relative flex flex-col items-center text-center space-y-2">
              <span className="w-7 h-7 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h4 className="font-bold text-sm text-forest-dark">Yield Estimate</h4>
              <p className="text-xs text-muted leading-tight">
                Estimate Punjab Rabi wheat yield from historical climate conditions and district records.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-white border border-forest/60 shadow-card relative flex flex-col items-center text-center space-y-2 ring-2 ring-forest/20">
              <span className="w-7 h-7 rounded-full bg-forest-dark text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h4 className="font-bold text-sm text-forest-dark">Factor Contributions</h4>
              <p className="text-xs text-muted leading-tight">
                See how climate factors are associated with the estimated yield.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-white border border-sage/40 shadow-subtle relative flex flex-col items-center text-center space-y-2">
              <span className="w-7 h-7 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center">
                4
              </span>
              <h4 className="font-bold text-sm text-forest-dark">Risk Insights</h4>
              <p className="text-xs text-muted leading-tight">
                Quantifies terminal heat wave, rainfall anomaly, and moisture stress risks.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-5 rounded-2xl bg-white border border-sage/40 shadow-subtle relative flex flex-col items-center text-center space-y-2">
              <span className="w-7 h-7 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center">
                5
              </span>
              <h4 className="font-bold text-sm text-forest-dark">Informed Actions</h4>
              <p className="text-xs text-muted leading-tight">
                Evidence-based agronomic recommendations and downloadable assessment PDF.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-forest-dark text-cream p-8 sm:p-14 text-center space-y-6 shadow-elevated relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-forest rounded-full blur-3xl opacity-50 -z-0" />
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Understand Climate Impact on Agriculture?
            </h2>
            <p className="text-sm sm:text-base text-cream/80 leading-relaxed">
              Run a Punjab wheat assessment, explore the factors associated with the estimate,
              or compare hypothetical climate scenarios.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                to="/assessment"
                className="px-6 py-3.5 rounded-xl font-bold text-forest-dark bg-white hover:bg-cream shadow-card transition-all duration-200"
              >
                Launch Impact Assessment
              </Link>
              <Link
                to="/simulator"
                className="px-6 py-3.5 rounded-xl font-bold text-white bg-forest hover:bg-forest-light border border-sage/40 transition-all duration-200"
              >
                Try What-If Simulator
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
