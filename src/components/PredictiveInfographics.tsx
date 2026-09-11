import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Trees, 
  Car, 
  Plane, 
  Home, 
  ShieldAlert, 
  TrendingUp, 
  Activity 
} from 'lucide-react';
import { 
  LatLng, 
  PredictiveInfographicsResponse 
} from '../types';
import { apiGetPredictiveInfographics } from '../services/apiClient';

interface PredictiveInfographicsProps {
  coordinates: LatLng;
  areaHectares: number;
  totalCO2Tons: number;
  locationName?: string;
}

export const PredictiveInfographics: React.FC<PredictiveInfographicsProps> = ({
  coordinates,
  areaHectares,
  totalCO2Tons,
  locationName = 'Coastal Mangrove Sanctuary'
}) => {
  const [data, setData] = useState<PredictiveInfographicsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Species planting allocation ratios (initialized from AI recommendations, editable by user!)
  const [speciesRatios, setSpeciesRatios] = useState<{ [id: string]: number }>({
    'sp-rhizophora': 45,
    'sp-avicennia': 35,
    'sp-sonneratia': 20,
  });

  // Fetch initial predictive models
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    apiGetPredictiveInfographics(
      coordinates[0],
      coordinates[1],
      areaHectares,
      totalCO2Tons
    ).then((res) => {
      if (!isMounted) return;
      setData(res);
      const initialRatios: { [id: string]: number } = {};
      res.speciesRecommendations.forEach((sp) => {
        initialRatios[sp.id] = sp.recommendedRatioPct;
      });
      setSpeciesRatios(initialRatios);
      setIsLoading(false);
    }).catch((err) => {
      console.error('[AegisBlue] Predictive Infographics fetch error:', err);
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [coordinates, areaHectares, totalCO2Tons]);

  // Handle species slider adjustment with 100% normalization
  const handleSliderChange = (changedId: string, newValue: number) => {
    setSpeciesRatios((prev) => {
      const otherKeys = Object.keys(prev).filter((k) => k !== changedId);
      const otherTotal = otherKeys.reduce((sum, k) => sum + prev[k], 0);
      const remaining = 100 - newValue;

      const next = { ...prev, [changedId]: newValue };
      if (otherTotal > 0 && remaining >= 0) {
        otherKeys.forEach((k) => {
          next[k] = Math.round((prev[k] / otherTotal) * remaining);
        });
      } else if (remaining >= 0 && otherKeys.length > 0) {
        const split = Math.floor(remaining / otherKeys.length);
        otherKeys.forEach((k) => {
          next[k] = split;
        });
      }
      return next;
    });
  };

  // Dynamically recalculate 10-year yield and Shannon Diversity based on user's custom species mix
  const dynamicYieldStats = useMemo(() => {
    if (!data) return { yield10Year: 0, baselineDiffPct: 0, shannonIndex: 0, rating: 'Optimal' };

    const speciesList = data.speciesRecommendations;
    let weightedYield = 0;
    const proportions: number[] = [];

    speciesList.forEach((sp) => {
      const ratio = (speciesRatios[sp.id] ?? sp.recommendedRatioPct) / 100;
      weightedYield += ratio * sp.carbonYieldPerHaYear;
      if (ratio > 0) proportions.push(ratio);
    });

    const annualYield = areaHectares * weightedYield;
    const yield10Year = Math.round(annualYield * 10);
    const baselineDiffPct = Math.round(((yield10Year - data.projected10YearYieldTons) / (data.projected10YearYieldTons || 1)) * 100);

    // Shannon Diversity: - sum(p * ln(p))
    const shannon = proportions.length > 0 
      ? -proportions.reduce((acc, p) => acc + p * Math.log(p), 0)
      : 0;
    const normalizedShannon = Math.round(shannon * (3.0 / Math.log(3)) * 100) / 100;

    let rating = 'High Ecological Resilience';
    if (normalizedShannon < 1.8) rating = 'Monoculture Risk (Low Diversity)';
    else if (normalizedShannon < 2.4) rating = 'Moderate Resilience';

    return {
      yield10Year,
      baselineDiffPct,
      shannonIndex: Math.min(3.0, normalizedShannon),
      rating
    };
  }, [data, speciesRatios, areaHectares]);

  if (isLoading || !data) {
    return (
      <div className="glass-panel p-8 rounded-2xl flex items-center justify-center space-x-3 text-cyan-400 animate-pulse">
        <Activity className="w-5 h-5 animate-spin" />
        <span className="font-mono text-sm font-bold">Computing Scientific 3D Partitioning & Species Strategy...</span>
      </div>
    );
  }

  const { partitioning, equivalencies, speciesRecommendations } = data;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Module 3: 3D Carbon Partitioning & Tangible Real-World Impact Badges */}
      <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl space-y-6 border border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-ocean-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">🌊</span>
              <h3 className="text-base sm:text-lg font-black text-white">
                3D Carbon Partitioning & Deep Soil Stock Profile
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              IPCC Wetlands Supplement Model: Blue Carbon reserves <strong className="text-emerald-400 font-semibold">55-65%</strong> of carbon permanently in deep anaerobic sediment strata.
            </p>
          </div>
          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              1,000+ Year Permanence
            </span>
          </div>
        </div>

        {/* 3-Tier Carbon Stock Overview Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-300 font-bold">
            <span className="flex items-center space-x-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
              <span>Canopy Biomass (AGB): {partitioning.aboveGroundPct}%</span>
            </span>
            <span className="flex items-center space-x-1 text-teal-300">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block"></span>
              <span>Root Network (BGB): {partitioning.belowGroundPct}%</span>
            </span>
            <span className="flex items-center space-x-1 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
              <span>Deep Sediment (SOC): {partitioning.soilOrganicPct}%</span>
            </span>
          </div>

          <div className="h-4 w-full bg-ocean-950 rounded-full overflow-hidden flex border border-ocean-700 shadow-inner">
            <div 
              style={{ width: `${partitioning.aboveGroundPct}%` }} 
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500" 
              title={`Above-Ground: ${partitioning.aboveGroundBiomass_tCO2.toLocaleString()} t CO2`}
            />
            <div 
              style={{ width: `${partitioning.belowGroundPct}%` }} 
              className="bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-500" 
              title={`Below-Ground: ${partitioning.belowGroundBiomass_tCO2.toLocaleString()} t CO2`}
            />
            <div 
              style={{ width: `${partitioning.soilOrganicPct}%` }} 
              className="bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500" 
              title={`Deep Soil: ${partitioning.soilOrganicCarbon_tCO2.toLocaleString()} t CO2`}
            />
          </div>
        </div>

        {/* 4 Depth Strata Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {partitioning.depthTiers.map((tier, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-2xl bg-ocean-950/80 border border-ocean-800/80 hover:border-cyan-500/50 transition-all space-y-2 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded">
                  {tier.depth}
                </span>
                <span className="font-mono text-xs text-emerald-400 font-bold">
                  {tier.carbonSharePct}%
                </span>
              </div>
              <div className="font-bold text-slate-100 text-xs truncate" title={tier.layerName}>
                {tier.layerName}
              </div>
              <div className="text-xl font-mono font-black text-white">
                {tier.tonnesCO2.toLocaleString()} <span className="text-[11px] font-normal text-slate-400">t CO₂</span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                {tier.description}
              </p>
            </div>
          ))}
        </div>

        {/* Tangible Impact Equivalency Cards (EPA GHG Equivalencies) */}
        <div className="pt-2 border-t border-ocean-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tangible Real-World Climate Impact Equivalencies</span>
            </h4>
            <span className="text-[10px] font-mono text-slate-400">EPA GHG Equivalencies Model</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Card 1: Cars */}
            <div className="p-3.5 rounded-xl bg-ocean-950/90 border border-ocean-800 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Car className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-lg font-mono font-black text-white">
                  {equivalencies.carsRemovedPerYear.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Gasoline Cars / Year</div>
              </div>
            </div>

            {/* Card 2: Flights */}
            <div className="p-3.5 rounded-xl bg-ocean-950/90 border border-ocean-800 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Plane className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-lg font-mono font-black text-white">
                  {equivalencies.passengerFlightsAvoided.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Passenger Flights Offset</div>
              </div>
            </div>

            {/* Card 3: Homes Clean Powered */}
            <div className="p-3.5 rounded-xl bg-ocean-950/90 border border-ocean-800 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Home className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="text-lg font-mono font-black text-white">
                  {equivalencies.homesCleanPoweredYear.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Homes Powered Clean / Yr</div>
              </div>
            </div>

            {/* Card 4: Storm Surge Reduction */}
            <div className="p-3.5 rounded-xl bg-ocean-950/90 border border-ocean-800 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <div className="text-lg font-mono font-black text-emerald-400">
                  -{equivalencies.stormSurgeWaveReductionMeters}m
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Storm Wave Attenuation</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module 4: Species-Specific Planting & Biodiversity Recommender */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-cyan-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-ocean-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Trees className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base sm:text-lg font-black text-white">
                Restoration Planting Optimizer & Native Species Matrix
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-criteria biological allocation engine tailored to <strong className="text-slate-200">{locationName}</strong> [{coordinates[0].toFixed(2)}°N, {coordinates[1].toFixed(2)}°E]. Adjust ratios below to maximize carbon yield and ecosystem resilience.
            </p>
          </div>
          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
              Adaptive Biomass Optimization
            </span>
          </div>
        </div>

        {/* 3 Native Species Cards with Interactive Ratios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {speciesRecommendations.map((species) => {
            const currentRatio = speciesRatios[species.id] ?? species.recommendedRatioPct;
            return (
              <div 
                key={species.id}
                className="p-5 rounded-2xl bg-ocean-950/80 border border-ocean-800 space-y-4 relative"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-extrabold text-slate-100 text-sm">{species.commonName}</div>
                    <div className="text-[11px] font-serif italic text-cyan-400">{species.scientificName}</div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                    {species.nativeSuitabilityScore}% Match
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-mono">
                  <div className="bg-ocean-900/60 p-2 rounded-lg border border-ocean-800">
                    <div className="text-slate-400 text-[9px]">Carbon Yield</div>
                    <div className="font-bold text-white">+{species.carbonYieldPerHaYear} t/ha/yr</div>
                  </div>
                  <div className="bg-ocean-900/60 p-2 rounded-lg border border-ocean-800">
                    <div className="text-slate-400 text-[9px]">Salinity Barrier</div>
                    <div className="font-bold text-cyan-300">{species.salinityTolerancePsu} PSU</div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed min-h-[44px]">
                  {species.ecosystemRole}
                </p>

                {/* Interactive Ratio Slider */}
                <div className="pt-2 border-t border-ocean-850 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 font-sans">Planting Ratio:</span>
                    <span className="font-bold text-emerald-400">{currentRatio}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    step="5"
                    value={currentRatio}
                    onChange={(e) => handleSliderChange(species.id, Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-ocean-800 rounded-lg"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Recalculation Results Ribbon */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-ocean-950 via-[#03202e] to-ocean-950 border border-emerald-500/40 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                Projected 10-Year Carbon Yield (Simulated Mix):
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
              {dynamicYieldStats.yield10Year.toLocaleString()} <span className="text-xs font-normal text-slate-400">t CO₂e</span>
              {dynamicYieldStats.baselineDiffPct !== 0 && (
                <span className={`text-xs ml-2 font-mono px-2 py-0.5 rounded-full ${
                  dynamicYieldStats.baselineDiffPct > 0 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {dynamicYieldStats.baselineDiffPct > 0 ? `+${dynamicYieldStats.baselineDiffPct}%` : `${dynamicYieldStats.baselineDiffPct}%`} vs standard monoculture
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-6 text-center">
            <div>
              <div className="text-[10px] text-slate-400 font-mono">Shannon Diversity Index</div>
              <div className="text-lg font-black font-mono text-cyan-300">
                {dynamicYieldStats.shannonIndex} <span className="text-[10px] text-slate-400">/ 3.00</span>
              </div>
            </div>
            <div className="h-8 w-px bg-ocean-800"></div>
            <div>
              <div className="text-[10px] text-slate-400 font-mono">Ecosystem Resilience</div>
              <div className="text-xs font-extrabold text-emerald-400">
                {dynamicYieldStats.rating}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
