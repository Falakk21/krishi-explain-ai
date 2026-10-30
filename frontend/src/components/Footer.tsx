import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-forest-dark text-cream border-t border-forest/80 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-forest/40">
          
          {/* Brand & Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center text-sage-light">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                KrishiExplain <span className="text-sage text-sm font-semibold">AI</span>
              </span>
            </div>
            <p className="text-xs text-cream/80 leading-relaxed">
              Explore climate trends, understand crop impacts, and find practical ways to support resilient farming.
            </p>
            <p className="text-[11px] text-sage italic">
              "Climate Insights. Stronger Harvests. Resilient Agriculture."
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs text-cream/70">
              <li>
                <Link to="/" className="hover:text-sage transition-colors">Home Landing</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-sage transition-colors">Climate Dashboard</Link>
              </li>
              <li>
                <Link to="/assessment" className="hover:text-sage transition-colors">Crop Impact Assessment</Link>
              </li>
              <li>
                <Link to="/explainability" className="hover:text-sage transition-colors">Crop Factor Insights</Link>
              </li>
              <li>
                <Link to="/simulator" className="hover:text-sage transition-colors">Climate What-If Simulator</Link>
              </li>
              <li>
                <Link to="/adaptation" className="hover:text-sage transition-colors">Adaptation Insights</Link>
              </li>
            </ul>
          </div>

          {/* Official Data Sources */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Data Provenance</h4>
            <ul className="space-y-2 text-xs text-cream/70">
              <li>
                <a
                  href="https://power.larc.nasa.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-sage transition-colors"
                >
                  <span>NASA POWER Meteorology</span>
                  <ExternalLink className="w-3 h-3 text-sage" />
                </a>
              </li>
              <li>
                <a
                  href="https://mausam.imd.gov.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-sage transition-colors"
                >
                  <span>India Meteorological Dept (IMD)</span>
                  <ExternalLink className="w-3 h-3 text-sage" />
                </a>
              </li>
              <li>
                <a
                  href="https://desagri.gov.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-sage transition-colors"
                >
                  <span>DES Agri (Ministry of Agriculture)</span>
                  <ExternalLink className="w-3 h-3 text-sage" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.fao.org/faostat/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-sage transition-colors"
                >
                  <span>FAOSTAT Global Benchmarks</span>
                  <ExternalLink className="w-3 h-3 text-sage" />
                </a>
              </li>
            </ul>
          </div>

          {/* Transparency & Disclaimer */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sage" />
              <span>Scientific Disclaimer</span>
            </h4>
            <p className="text-[11px] text-cream/75 leading-relaxed mb-3">
              Yield estimates are for information and decision support, not guarantees. Factor contributions describe
              patterns in the available records and do not prove cause and effect. Please confirm recommendations with
              local agricultural extension officers.
            </p>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-cream/60 gap-4">
          <p>© {new Date().getFullYear()} KrishiExplain AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
