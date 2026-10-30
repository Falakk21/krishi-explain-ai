import React, { useState } from 'react';
import {
  Lightbulb, ShieldCheck, AlertTriangle, ExternalLink, Filter,
  Thermometer, CloudRain, Droplets, BookOpen, CheckCircle
} from 'lucide-react';
import { AdaptationStrategy } from '../types';

const STRATEGIES: AdaptationStrategy[] = [
  {
    risk_factor: "Terminal Heat Stress",
    strategy_title: "Shift Sowing Window to Early Rabi (Late October)",
    action_summary: "Advance wheat sowing dates from mid-November to October 25 – November 5 using designated long-duration heat-resilient cultivars.",
    why_relevant: "Aligns the critical anthesis and grain-milking phase with cooler late-February meteorological conditions, avoiding high-intensity March heatwaves (>31°C).",
    favorable_conditions: "Early harvesting and field evacuation of preceding Kharif crop (such as short-duration PR-126 paddy or cotton); adequate seed-bed moisture.",
    practical_limitations: "Higher risk of early-season pink stem borer and armyworm infestation requiring scout monitoring; not possible after long-duration basmati varieties.",
    credible_source: "ICAR-Indian Institute of Wheat and Barley Research (IIWBR) Karnal, Advisory 2023.",
    is_rule_based: true
  },
  {
    risk_factor: "Terminal Heat Stress",
    strategy_title: "Deploy Climate-Resilient Cultivars (DBW-187, DBW-303, PBW-824)",
    action_summary: "Replace legacy thermosensitive varieties with bio-fortified, heat-tolerant certified varieties with superior stay-green traits.",
    why_relevant: "Possesses deeper root architecture, higher cell membrane thermostability, and enhanced post-anthesis assimilate translocation under elevated canopy temperatures.",
    favorable_conditions: "Availability of certified foundation seed from Punjab State Seed Corporation (PUNSEED) or KVKs.",
    practical_limitations: "Cultivars require strict adherence to high-fertility management (including split nitrogen applications) to express full genetic potential.",
    credible_source: "Punjab Agricultural University (PAU) Package of Practices for Rabi Crops.",
    is_rule_based: true
  },
  {
    risk_factor: "Terminal Heat Stress",
    strategy_title: "Canopy Evaporative Cooling via Portable Sprinklers",
    action_summary: "Apply light sprinkler irrigations (20–25 mm depth) during midday hours when March ambient air temperatures cross 32°C.",
    why_relevant: "Generates microclimatic evaporative cooling, suppressing crop canopy temperatures by 2.0 to 3.5°C and reducing grain shrivelling.",
    favorable_conditions: "Availability of operational portable sprinkler sets and reliable electricity/solar tube-well pressure.",
    practical_limitations: "Higher labor demand; strictly prohibited during gusty wind conditions (>20 km/h) to prevent crop lodging.",
    credible_source: "PAU Department of Climate Change and Agricultural Meteorology.",
    is_rule_based: true
  },
  {
    risk_factor: "Drought & Moisture Deficit",
    strategy_title: "Happy Seeder Residue Mulching (In-Situ Moisture Retention)",
    action_summary: "Sow directly into standing combine-harvested paddy straw without burning or preliminary tillage using the Happy Seeder or Super Seeder.",
    why_relevant: "Surface paddy residue mulch conserves 30–45 mm of soil moisture, reduces soil evaporation, and buffers topsoil against extreme temperature fluctuations.",
    favorable_conditions: "Even spreading of paddy straw by Super-SMS attached combine harvesters; soil moisture at field capacity during drilling.",
    practical_limitations: "Requires 15–20% higher initial nitrogen top-dressing to prevent temporary microbial nitrogen immobilization.",
    credible_source: "CGIAR Research Program on Climate Change, Agriculture and Food Security (CCAFS).",
    is_rule_based: true
  },
  {
    risk_factor: "Drought & Moisture Deficit",
    strategy_title: "Tensiometer-Guided Irrigation at Critical Phenological Stages",
    action_summary: "Anchor irrigation events strictly to tensiometer soil water suction thresholds (matric potential between -0.4 and -0.5 bar) and critical growth stages.",
    why_relevant: "Prevents sub-optimal vegetative water deficit while reducing overall tube-well power consumption and groundwater extraction by 20–25%.",
    favorable_conditions: "Levelled fields (preferably laser land-levelled) ensuring uniform hydraulic infiltration.",
    practical_limitations: "Requires farmers to monitor tensiometer gauges regularly; in light sandy soils, water status changes rapidly.",
    credible_source: "PAU Ludhiana Water Technology Centre Technical Bulletin.",
    is_rule_based: true
  },
  {
    risk_factor: "Excess Rain & Lodging",
    strategy_title: "Plant Growth Regulator (PGR) Application in High-Vegetative Fields",
    action_summary: "Foliar spray Chlormequat chloride (Lihocin @ 0.2%) + Tebuconazole (Folicur @ 0.1%) at first node and flag leaf stages in lodging-prone fields.",
    why_relevant: "Shortens and thickens basal internodes, improving stem mechanical breaking strength against sudden March wind and rainstorms.",
    favorable_conditions: "Luxuriant vegetative canopy receiving high basal urea fertilization on heavy-textured loam soils.",
    practical_limitations: "Must be sprayed at exact physiological milestones; late applications after heading can shorten earhead length.",
    credible_source: "Directorate of Wheat Development, Ministry of Agriculture & Farmers Welfare, India.",
    is_rule_based: true
  },
  {
    risk_factor: "Agro-Meteorological Preparedness",
    strategy_title: "Block-Level Agromet Advisory Integration (Meghdoot / Damini)",
    action_summary: "Subscribe to twice-weekly district/block weather forecasts provided by the IMD Gramin Krishi Mausam Sewa (GKMS).",
    why_relevant: "Offers 5-day predictive alerts for Western Disturbance arrival, allowing tactical postponement of irrigation or fertilizer broadcasting.",
    favorable_conditions: "Universal accessibility via smartphones, SMS alerts, and regional Krishi Vigyan Kendra WhatsApp channels.",
    practical_limitations: "Convective micro-storms can occasionally cause localized downpours that escape regional grid forecasting.",
    credible_source: "India Meteorological Department (IMD) - Ministry of Earth Sciences.",
    is_rule_based: true
  }
];

export const AdaptationInsights: React.FC = () => {
  const [selectedRisk, setSelectedRisk] = useState<string>("All");

  const filterOptions = ["All", "Terminal Heat Stress", "Drought & Moisture Deficit", "Excess Rain & Lodging", "Agro-Meteorological Preparedness"];

  const filteredStrategies = selectedRisk === "All"
    ? STRATEGIES
    : STRATEGIES.filter((s) => s.risk_factor === selectedRisk);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sage/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-forest">Resilience Framework</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-mint text-forest border border-sage">
              Rule-Based Agronomy
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-forest-dark tracking-tight">
            From Insight to Action: Climate Adaptation Strategies
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Evidence-based agronomic pathways tailored to specific climate vulnerability vectors in Punjab wheat ecosystems.
          </p>
        </div>
      </div>

      {/* Advisory Banner */}
      <div className="p-5 rounded-2xl bg-cream border border-sage/50 flex items-start gap-3 shadow-subtle">
        <ShieldCheck className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-forest-dark">Transparency Notice on Recommendations</h4>
          <p className="text-xs text-charcoal/85 leading-relaxed">
            All adaptation recommendations below are rule-based agronomic strategies compiled from verified publications of the
            Punjab Agricultural University (PAU) and the ICAR-Indian Institute of Wheat and Barley Research (IIWBR).
            Suitability depends on local soil classification, irrigation infrastructure, and farm management. Always consult local Krishi Vigyan Kendras (KVKs).
          </p>
        </div>
      </div>

      {/* Risk Factor Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-forest flex-shrink-0 mr-1" />
        {filterOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setSelectedRisk(opt)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              selectedRisk === opt
                ? 'bg-forest text-white border-forest shadow-xs'
                : 'bg-white hover:bg-cream text-charcoal border-sage/40'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStrategies.map((strat, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white border border-sage/40 shadow-card hover:shadow-elevated transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-mint text-forest-dark border border-sage/50">
                  {strat.risk_factor}
                </span>
                <span className="text-[11px] font-semibold text-muted bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                  Peer-Reviewed Rule
                </span>
              </div>

              <h3 className="text-lg font-bold text-forest-dark leading-snug">
                {strat.strategy_title}
              </h3>

              <div className="p-3 rounded-xl bg-cream/70 border border-sage/30 text-xs font-medium text-charcoal">
                {strat.action_summary}
              </div>

              <div className="space-y-2 text-xs text-charcoal/80 leading-relaxed pt-1">
                <div>
                  <b className="text-forest-dark">Why It Helps:</b> {strat.why_relevant}
                </div>
                <div>
                  <b className="text-forest-dark">Favorable Conditions:</b> {strat.favorable_conditions}
                </div>
                <div className="text-risk/90">
                  <b className="text-risk">Practical Limitations:</b> {strat.practical_limitations}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-muted">
              <span><b>Source:</b> {strat.credible_source}</span>
              <CheckCircle className="w-4 h-4 text-forest" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
