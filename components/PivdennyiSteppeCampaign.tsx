import React, { useState, useEffect, useRef } from "react";

const ENERGY_BLUE = "#0057B7";
const UKRAINIAN_YELLOW = "#FFD700";

type GalleryImage = {
  id: string;
  label: string;
  src: string;
  alt: string;
};

const crisisImages: GalleryImage[] = [
  {
    id: "infrastructure",
    label: "Targeted grid strikes",
    src: "/assets/images/1000013854.png",
    alt: "Burning and damaged energy infrastructure.",
  },
  {
    id: "housing",
    label: "Destroyed civilian housing",
    src: "/assets/images/1000013860.png",
    alt: "Damaged residential buildings and solar panels in a yard.",
  },
];

const technicalImages: GalleryImage[] = [
  {
    id: "mast",
    label: "Motionless wind airfoil in the steppe",
    src: "/assets/images/1000013859-technical-mast.png",
    alt: "Tall motionless wind turbine mast in the steppe landscape.",
  },
  {
    id: "diagram",
    label: "Vortex-induced vibration diagram",
    src: "/assets/images/1000013856.png",
    alt: "Diagram of vortex-induced vibration on a mast from wind flow.",
  },
];

const RevealOnScroll: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {children}
    </div>
  );
};

export const PivdennyiSteppeCampaign: React.FC = () => {
  const [activeCrisisImage, setActiveCrisisImage] = useState<string>(crisisImages[0].id);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/assets/images/1000013853.png')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-slate-950/80 to-slate-950" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32 flex flex-col gap-10">
          <div className="max-w-3xl">
            <p className="tracking-[0.25em] uppercase text-xs sm:text-sm text-slate-300 mb-4">
              WSUA • VFU • SWUF
            </p>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              Pivdennyi Stepovyi Shkvall:
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--ukr-yellow)] to-[var(--energy-blue)]">
                Harvesting the Force of the Steppe.
              </span>
            </h1>
            <p className="mt-5 text-base sm:text-lg md:text-xl text-slate-200/90 font-serif max-w-2xl">
              A 6‑month initiative deploying “solid‑state” hybrid energy to power critical
              infrastructure in rural Mykolaiv—when the grid is silent and the wells must run.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <button
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-full text-sm sm:text-base font-semibold shadow-lg shadow-sky-500/30 border border-sky-400/60"
              style={{
                background: `linear-gradient(135deg, ${ENERGY_BLUE}, ${UKRAINIAN_YELLOW})`,
                color: "#020617",
              }}
            >
              Donate to VFU
            </button>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md font-serif">
              0% VAT / duty‑free status on energy equipment means{" "}
              <span className="font-semibold text-sky-300">~20% more of your gift</span> reaches
              the field.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 space-y-20 lg:space-y-24">
        {/* Crisis Block */}
        <section className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900 border border-slate-800">
              {crisisImages.map((img) => (
                <img
                  key={img.id}
                  src={img.src}
                  alt={img.alt}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                    activeCrisisImage === img.id ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </div>
            <div className="flex gap-3">
              {crisisImages.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveCrisisImage(img.id)}
                  className={`flex-1 text-xs sm:text-sm px-3 py-2 rounded-full border transition ${
                    activeCrisisImage === img.id
                      ? "border-[var(--ukr-yellow)] bg-[var(--ukr-yellow)]/10 text-[var(--ukr-yellow)]"
                      : "border-slate-700 text-slate-300 hover:border-slate-400"
                  }`}
                >
                  {img.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              The Grid Has Been Shattered.
            </h2>
            <p className="text-sm sm:text-base text-slate-200 font-serif">
              In the southern steppe of Mykolaiv, targeted strikes have torn through substations,
              transmission lines, and distribution hubs. Villages that once depended on a single
              centralized utility spine now face blackout nights, dry taps, and silent radios.
            </p>
            <p className="text-sm sm:text-base text-slate-200 font-serif">
              Diesel generators roar in short, expensive bursts—consuming scarce fuel, announcing
              their presence with noise and exhaust, and failing whenever logistics break down. They
              are a bridge, not a backbone.
            </p>
            <p className="text-sm sm:text-base text-slate-200 font-serif">
              Pivdennyi Stepovyi Shkvall replaces that fragile model with a{" "}
              <span className="font-semibold text-[var(--ukr-yellow)]">
                silent, motionless “solid‑state” hybrid system
              </span>{" "}
              designed to keep village wells pumping and communication hubs powered—
              even when the grid is gone and the road in is cut.
            </p>
          </div>
        </section>

        {/* Technical Innovation */}
        <section className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Solid-State Resilience.
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-200 font-serif max-w-xl">
                Instead of spinning blades and high‑maintenance gearboxes, Shkvall harvests the
                vortex‑induced vibration of a slender mast—transforming the constant wind of the
                steppe into reliable, low‑profile power.
              </p>
            </div>
            <div className="text-xs sm:text-sm text-slate-400 font-mono">
              5kW wind • 2kW solar • 10kWh storage
            </div>
          </div>

          <RevealOnScroll>
            <div className="grid md:grid-cols-3 gap-6">
              {technicalImages.map((img) => (
                <div
                  key={img.id}
                  className="relative overflow-hidden rounded-2xl bg-slate-900/70 border border-slate-800"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-56 w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">
                      Technical Visual
                    </p>
                    <p className="text-sm font-semibold">{img.label}</p>
                  </div>
                </div>
              ))}

              <div className="md:col-span-1 flex flex-col justify-between rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 space-y-4">
                <h3 className="text-lg font-semibold">Hybrid Architecture</h3>
                <ul className="text-sm text-slate-200 font-serif space-y-2">
                  <li>
                    • Direct‑drive linear alternators eliminate complex mechanical assemblies.
                  </li>
                  <li>
                    • Coupled with monocrystalline solar for seasonal peak loads in July/August.
                  </li>
                  <li>
                    • Lithium iron phosphate storage for deep‑cycle, 24/7 well and comms loads.
                  </li>
                </ul>
                <p className="text-xs text-slate-400">
                  Engineered for continuous operation in high‑gust, debris‑laden environments where
                  conventional turbines fail.
                </p>
              </div>
            </div>
          </RevealOnScroll>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 flex flex-col">
              <h3 className="text-sm font-semibold text-[var(--ukr-yellow)] mb-2">
                Primary: 5kW Motionless Wind Airfoil
              </h3>
              <p className="text-sm text-slate-200 font-serif flex-1">
                Silent mast‑based system tuned to steppe wind regimes, with no exposed blades and
                no routine lubrication schedule—ideal for village operators and constrained
                maintenance.
              </p>
              <p className="mt-3 text-xs text-slate-400 font-mono">Silent • Zero‑maintenance</p>
            </div>
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 flex flex-col">
              <h3 className="text-sm font-semibold text-sky-300 mb-2">
                Augmentation: 2kW Solar PV
              </h3>
              <p className="text-sm text-slate-200 font-serif flex-1">
                High‑efficiency monocrystalline array sized for peak insolation months, flattening
                demand curves for pumps and village Wi‑Fi during long summer days.
              </p>
              <p className="mt-3 text-xs text-slate-400 font-mono">Peak power • July / August</p>
            </div>
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 flex flex-col">
              <h3 className="text-sm font-semibold text-sky-200 mb-2">
                Storage: 10kWh LiFePO4 Bank
              </h3>
              <p className="text-sm text-slate-200 font-serif flex-1">
                Deep‑cycle lithium iron phosphate storage with integrated BMS provides continuous
                24/7 operation for village water wells and communication hubs through multi‑day
                outages.
              </p>
              <p className="mt-3 text-xs text-slate-400 font-mono">24/7 power • Water wells</p>
            </div>
          </div>
        </section>

        {/* Community & Impact */}
        <section className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
            <img
              src="/assets/images/1000010816-community-church.png"
              alt="Rural church at sunset in Mykolaiv oblast."
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300 mb-1">
                Rural Mykolaiv
              </p>
              <p className="text-sm font-semibold">
                A village church, a well house, and a mast on the horizon.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Powering Wells. Holding the Line.
            </h2>
            <p className="text-sm sm:text-base text-slate-200 font-serif">
              Each Shkvall unit anchors around a{" "}
              <span className="font-semibold text-[var(--ukr-yellow)]">village water well pump</span>{" "}
              and a{" "}
              <span className="font-semibold text-sky-300">community communication hub</span>—
              keeping clean water, radio, and internet online when everything else goes dark.
            </p>
            <p className="text-sm sm:text-base text-slate-200 font-serif">
              Wells mean dignity, hygiene, and resilience. Comms mean coordination with
              volunteers, medics, and territorial defense, as well as lifelines to displaced
              families abroad.
            </p>
            <p className="text-sm sm:text-base text-slate-200 font-serif">
              Your support turns the relentless wind of the steppe into a quiet shield for the most
              exposed villages on Ukraine’s southern front.
            </p>
          </div>
        </section>

        {/* Donation Tiers */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Choose Your Impact Tier.
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-200 font-serif max-w-xl">
                Every tier locks in a specific, field‑ready component of a Shkvall system. Together,
                they build complete village‑scale resilience.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <DonationCard
              label="$50 – The Steppe Warrior"
              description="Funds a rugged hybrid charge controller, converting chaotic rural grids and wild steppe wind into stable DC power."
            />
            <DonationCard
              label="$250 – The Solar Cossack"
              description="Deploys a 400W monocrystalline panel, adding quiet peak‑sun power to keep pumps and routers online."
            />
            <DonationCard
              label="$1,000 – The Energy Hetman"
              description="Builds a 5kWh LiFePO4 battery bank—deep‑cycle storage that rides through long blackouts."
            />
            <DonationCard
              label="$4,500 – The Stribog"
              description="Sponsors an entire 5kW motionless wind unit, turning the steppe wind itself into a village‑scale lifeline."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
              <span className="px-3 py-1 rounded-full border border-slate-700 bg-slate-900/60">
                <span className="font-semibold">VFU</span> • Fiscal Sponsor
              </span>
              <span className="px-3 py-1 rounded-full border border-slate-700 bg-slate-900/60">
                <span className="font-semibold">WSUA</span> • Project Lead
              </span>
              <span className="px-3 py-1 rounded-full border border-slate-700 bg-slate-900/60">
                <span className="font-semibold">SWUF</span> • UA Implementation
              </span>
            </div>

            <button
              className="w-full md:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-sky-500/30 border border-sky-400/60"
              style={{
                background: `linear-gradient(135deg, ${ENERGY_BLUE}, ${UKRAINIAN_YELLOW})`,
                color: "#020617",
              }}
            >
              Donate to VFU
            </button>
          </div>

          <div className="text-xs sm:text-sm text-slate-400 font-serif">
            <span className="font-semibold text-[var(--ukr-yellow)]">
              0% VAT / Duty‑Free Energy Equipment:
            </span>{" "}
            All core system components qualify for VAT and duty exemptions under current Ukrainian
            humanitarian energy provisions—delivering an estimated{" "}
            <span className="font-semibold text-sky-300">+20% real impact</span> on every donor
            dollar.
          </div>
        </div>
      </footer>

      {/* Mobile sticky donate button */}
      <div className="fixed inset-x-0 bottom-0 z-40 sm:hidden pointer-events-none">
        <div className="max-w-lg mx-auto px-4 pb-4">
          <button
            className="pointer-events-auto w-full inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold shadow-xl shadow-sky-500/40 border border-sky-400/60"
            style={{
              background: `linear-gradient(135deg, ${ENERGY_BLUE}, ${UKRAINIAN_YELLOW})`,
              color: "#020617",
            }}
          >
            Donate to VFU
          </button>
        </div>
      </div>
    </div>
  );
};

type DonationCardProps = {
  label: string;
  description: string;
};

const DonationCard: React.FC<DonationCardProps> = ({ label, description }) => {
  return (
    <button
      type="button"
      className="group relative text-left rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 sm:px-5 sm:py-5 shadow-[0_0_0_1px_rgba(15,23,42,1)] hover:shadow-[0_0_0_1px_rgba(148,163,184,0.7)] transition-all duration-200 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.45),transparent_55%),radial-gradient(circle_at_bottom,_rgba(250,204,21,0.4),transparent_55%)] pointer-events-none" />
      <div className="relative space-y-3">
        <p className="text-sm font-semibold text-slate-50">{label}</p>
        <p className="text-xs sm:text-sm text-slate-200 font-serif">{description}</p>
        <p className="text-[11px] uppercase tracking-[0.2em] text-sky-300">
          Tap to pledge component
        </p>
      </div>
    </button>
  );
};

export default PivdennyiSteppeCampaign;

