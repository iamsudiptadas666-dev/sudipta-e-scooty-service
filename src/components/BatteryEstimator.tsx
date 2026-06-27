import { useState, useEffect } from "react";
import { Battery, Sliders, Info, ShoppingBag, Gauge, Weight, Mountain, Zap } from "lucide-react";
import { Language } from "../translations";

interface BatteryEstimatorProps {
  lang: Language;
}

export default function BatteryEstimator({ lang }: BatteryEstimatorProps) {
  const isBng = lang === "bn";

  // State variables for the estimator
  const [voltage, setVoltage] = useState<number>(60);
  const [capacity, setCapacity] = useState<number>(40);
  const [speed, setSpeed] = useState<number>(35); // km/h
  const [loadWeight, setLoadWeight] = useState<number>(120); // kg (rider + cargo)
  const [terrain, setTerrain] = useState<string>("flat"); // flat, slope, hilly
  const [motorPower, setMotorPower] = useState<number>(1500); // Watts

  // Calculation outputs
  const [energyCapacity, setEnergyCapacity] = useState<number>(2400); // Wh
  const [consumptionRate, setConsumptionRate] = useState<number>(24); // Wh/km
  const [minRange, setMinRange] = useState<number>(80);
  const [maxRange, setMaxRange] = useState<number>(120);

  useEffect(() => {
    // 1. Calculate energy capacity (Wh = V * Ah)
    const wh = voltage * capacity;
    setEnergyCapacity(wh);

    // 2. Base consumption rate (Wh/km) based on speed and motor power
    // Standard electric scooter consumes 20 Wh/km at low speed (25 km/h) with 250W motor.
    let baseConsumption = 20;

    // Speed factor: consumption increases non-linearly with speed
    if (speed <= 25) {
      baseConsumption = 18;
    } else if (speed <= 35) {
      baseConsumption = 22;
    } else if (speed <= 50) {
      baseConsumption = 28;
    } else {
      baseConsumption = 36;
    }

    // Motor size factor
    if (motorPower > 1000) {
      baseConsumption += 2.5;
    } else if (motorPower > 500) {
      baseConsumption += 1;
    }

    // Weight factor: +1 Wh/km for every 20kg over 60kg
    const weightExcess = Math.max(0, loadWeight - 60);
    const weightFactor = weightExcess * 0.05; // 1 Wh/km per 20kg

    // Terrain multiplier
    let terrainMultiplier = 1.0;
    if (terrain === "slope") {
      terrainMultiplier = 1.25;
    } else if (terrain === "hilly") {
      terrainMultiplier = 1.5;
    }

    // Final average consumption rate
    const calculatedConsumption = (baseConsumption + weightFactor) * terrainMultiplier;
    setConsumptionRate(Number(calculatedConsumption.toFixed(1)));

    // Range calculation: total Wh / consumption rate
    // Range window: +/- 20% to account for variations
    const avgRange = wh / calculatedConsumption;
    const calculatedMin = Math.round(avgRange * 0.85);
    const calculatedMax = Math.round(avgRange * 1.15);

    setMinRange(calculatedMin);
    setMaxRange(calculatedMax);
  }, [voltage, capacity, speed, loadWeight, terrain, motorPower]);

  return (
    <div id="battery-estimator-panel" className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-inner">
      <div className="flex items-center gap-2.5 mb-5">
        <Battery className="w-5 h-5 text-emerald-600 animate-pulse" />
        <h4 className="font-display font-semibold text-slate-800 text-lg">
          {isBng ? "স্মার্ট ব্যাটারি রেঞ্জ ও মাইলেজ ক্যালকুলেটর" : "Smart Battery Range & Mileage Estimator"}
        </h4>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Section (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <h5 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2 mb-2">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              {isBng ? "ব্যাটারির বিবরণ সেট করুন" : "Set Battery Specifications"}
            </h5>

            {/* Voltage & Capacity Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  ⚡ {isBng ? "ভোল্টেজ (Voltage)" : "Voltage (V)"}
                </label>
                <select
                  value={voltage}
                  onChange={(e) => setVoltage(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={48}>48V</option>
                  <option value={60}>60V ({isBng ? "প্যান্থার স্ট্যান্ডার্ড" : "Panther Standard"})</option>
                  <option value={72}>72V</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  🔋 {isBng ? "অ্যাম্পিয়ার-আওয়ার" : "Capacity (Ah)"}
                </label>
                <select
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={20}>20 Ah</option>
                  <option value={24}>24 Ah</option>
                  <option value={30}>30 Ah</option>
                  <option value={32}>32 Ah ({isBng ? "লেড-অ্যাসিড অপশন" : "Lead-Acid Spec"})</option>
                  <option value={34}>34 Ah</option>
                  <option value={40}>40 Ah ({isBng ? "সুপার রেঞ্জ" : "Super Range Lithium"})</option>
                </select>
              </div>
            </div>
          </div>

          {/* Real-world Variables Slider Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <h5 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2 mb-2">
              <Gauge className="w-3.5 h-3.5 text-blue-600" />
              {isBng ? "বাস্তব চালনা পরিবেশ ভ্যারিয়েবল" : "Real-World Riding Variables"}
            </h5>

            {/* Speed Slider */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-semibold text-slate-500">
                  ⚡ {isBng ? "গড় গতিবেগ" : "Average Riding Speed"}
                </span>
                <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {speed} km/h
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="65"
                step="5"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {speed <= 25 ? (isBng ? "ইকো মোড (ধীর ও স্থির)" : "Eco Mode: High Efficiency") : speed <= 45 ? (isBng ? "সিটি মোড (স্ট্যান্ডার্ড রাইডিং)" : "City Mode: Steady Ride") : (isBng ? "স্পোর্টস মোড (অতিরিক্ত ড্রেন)" : "Sports Mode: Heavy Power Draw")}
              </span>
            </div>

            {/* Load Weight Slider */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-semibold text-slate-500">
                  ⚖️ {isBng ? "মোট লোড ওজন (চালক + মালামাল)" : "Total Load Weight"}
                </span>
                <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {loadWeight} kg
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="200"
                step="10"
                value={loadWeight}
                onChange={(e) => setLoadWeight(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {isBng ? "* স্ট্যান্ডার্ড ড্রাইভিং লোড ৬০ কেজি পরিমাপিত" : "* Standard solo testing measured at 60 kg load"}
              </span>
            </div>

            {/* Terrain and Motor power grid */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  ⛰️ {isBng ? "রাস্তার ধরণ (Terrain)" : "Road Terrain"}
                </label>
                <select
                  value={terrain}
                  onChange={(e) => setTerrain(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="flat">🛣️ {isBng ? "সমতল রাস্তা" : "Flat Plain Roads"}</option>
                  <option value="slope">📈 {isBng ? "হালকা ঢাল" : "Gentle Slopes"}</option>
                  <option value="hilly">⛰️ {isBng ? "খাড়া পাহাড়ি পথ" : "Steep Hilly Roads"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  ⚙️ {isBng ? "মোটর পাওয়ার" : "Motor Power (Watts)"}
                </label>
                <select
                  value={motorPower}
                  onChange={(e) => setMotorPower(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value={250}>250W BLDC Hub</option>
                  <option value={1000}>1000W BLDC</option>
                  <option value={1500}>1500W High Efficiency</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results & Math Section (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {/* Estimated Range Meter Card */}
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-5 rounded-2xl shadow-md flex-1 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-emerald-300 font-bold block mb-1">
                ⚡ {isBng ? "আনুমানিক রিয়াল-টাইম মাইলেজ" : "Predicted Real-World Range"}
              </span>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-4xl md:text-5xl font-mono font-extrabold text-emerald-400">
                  {minRange} - {maxRange}
                </span>
                <span className="text-xl font-bold text-slate-300">km</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                {isBng
                  ? "আপনার সেট করা কাস্টম স্পেসিফিকেশন ও বাস্তব পরিবেশ অনুযায়ী পরিমাপিত কিলোমিটার রেঞ্জ উইন্ডো।"
                  : "Estimated distance interval based on custom specs, load patterns, and thermal environments."}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-emerald-800/60 text-xs space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>🔋 {isBng ? "মোট শক্তি ক্ষমতা" : "Energy Capacity"}:</span>
                <strong className="font-mono text-emerald-300">{(energyCapacity / 1000).toFixed(1)} kWh ({energyCapacity} Wh)</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>📉 {isBng ? "আনুমানিক কনসাম্পশন" : "Est. Consumption"}:</span>
                <strong className="font-mono text-emerald-300">{consumptionRate} Wh/km</strong>
              </div>
            </div>
          </div>

          {/* Sudipta Math Explanation Box */}
          <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <Info className="w-4 h-4 text-amber-500 shrink-0" />
              <span>📚 {isBng ? "হিসাবের গণিত (The Math)" : "The Math Behind It"}</span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              {isBng ? (
                <>
                  ব্যাটারির মোট শক্তি ক্ষমতা বের করার সূত্র:{" "}
                  <code className="bg-slate-50 px-1 py-0.5 font-mono text-indigo-600 font-bold rounded">
                    {voltage}V × {capacity}Ah = {energyCapacity} Wh
                  </code>{" "}
                  ({(energyCapacity / 1000).toFixed(1)} kWh)। সাধারণত মানসম্মত বৈদুতিক স্কুটার প্রতি কিলোমিটারে{" "}
                  <strong className="text-slate-800 font-semibold">২০ থেকে ৩০ ওয়াট-আওয়ার (Wh/km)</strong> শক্তি খরচ করে, যা থেকে এই মাইলেজ রেঞ্জ নির্ণয় করা হয়।
                </>
              ) : (
                <>
                  The energy capacity is formulated as:{" "}
                  <code className="bg-slate-50 px-1 py-0.5 font-mono text-indigo-600 font-semibold rounded">
                    {voltage}V × {capacity}Ah = {energyCapacity} Wh
                  </code>{" "}
                  ({(energyCapacity / 1000).toFixed(1)} kWh). Standard electric two-wheelers consume about{" "}
                  <strong className="text-slate-800 font-semibold">20 to 30 Wh/km</strong>, establishing these exact bounds.
                </>
              )}
            </p>

            {/* Browse External Platforms */}
            <div className="pt-2 border-t border-slate-50 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
              <span>{isBng ? "অথরাইজড ব্যাটারি চেক করুন:" : "Explore verified batteries on:"}</span>
              <a
                href="https://www.amazon.in/s?k=60v+lithium+battery+for+electric+scooter"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-orange-600 hover:underline bg-orange-50 px-2 py-0.5 rounded-md"
              >
                <ShoppingBag className="w-3 h-3 text-orange-600" />
                Amazon.in
              </a>
              <a
                href="https://dir.indiamart.com/search.mp?ss=60v+electric+scooter+battery"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-teal-600 hover:underline bg-teal-50 px-2 py-0.5 rounded-md"
              >
                IndiaMart
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
