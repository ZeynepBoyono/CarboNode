'use client'

const partners = [
    {
        id: 1,
        name: 'Vestel Enerji',
        category: 'Yenilenebilir Enerji',
        icon: '⚡',
        color: 'yellow',
        desc: 'Güneş ve rüzgar enerji çözümleri ile Türkiye\'nin enerji dönüşümüne öncülük ediyor.',
        eco: '+8 ECO/kWh',
    },
    {
        id: 2,
        name: 'EkoRoots',
        category: 'Sürdürülebilir Tarım',
        icon: '🌱',
        color: 'green',
        desc: 'Organik tarım ve karbon emici toprak yöntemiyle gıda üretimini sürdürülebilir kılıyor.',
        eco: '+5 ECO/kg',
    },
    {
        id: 3,
        name: 'GreenWave Lojistik',
        category: 'Elektrikli Taşımacılık',
        icon: '🚛',
        color: 'blue',
        desc: 'Tamamen elektrikli araç filosuyla son kilometre teslimatında karbon sıfır hedefliyor.',
        eco: '+6 ECO/km',
    },
    {
        id: 4,
        name: 'Doğa Temiz Tek.',
        category: 'Atık Yönetimi',
        icon: '♻️',
        color: 'emerald',
        desc: 'Akıllı atık sınıflandırma sistemleriyle geri dönüşüm oranını %90\'a çıkarıyor.',
        eco: '+10 ECO/ton',
    },
    {
        id: 5,
        name: 'SolarTek TR',
        category: 'Güneş Enerjisi',
        icon: '☀️',
        color: 'orange',
        desc: 'Çatı güneş paneli kurulumunu yaygınlaştırarak enerji bağımsızlığını destekliyor.',
        eco: '+7 ECO/panel',
    },
    {
        id: 6,
        name: 'BioCarbon Labs',
        category: 'Karbon Yakalama',
        icon: '🧪',
        color: 'purple',
        desc: 'Biyoteknoloji tabanlı karbon yakalama sistemleriyle atmosferden CO₂ uzaklaştırıyor.',
        eco: '+15 ECO/ton CO₂',
    },
    {
        id: 7,
        name: 'EcoFiber Tekstil',
        category: 'Sürd. Tekstil',
        icon: '🧵',
        color: 'pink',
        desc: 'Geri dönüştürülmüş plastik şişelerden üretilen kumaşlarla moda çevrim içine alıyor.',
        eco: '+4 ECO/kg',
    },
    {
        id: 8,
        name: 'AquaClean Su',
        category: 'Su Arıtma',
        icon: '💧',
        color: 'cyan',
        desc: 'İleri teknoloji su arıtma sistemleriyle endüstriyel suyu yeniden kullanıma kazandırıyor.',
        eco: '+3 ECO/m³',
    },
    {
        id: 9,
        name: 'ReforTech Orman',
        category: 'Ormancılık',
        icon: '🌳',
        color: 'lime',
        desc: 'Drone destekli ağaçlandırma projeleriyle bozulmuş orman ekosistemlerini yeniden kuruyor.',
        eco: '+12 ECO/ağaç',
    },
    {
        id: 10,
        name: 'GreenBuild Yapı',
        category: 'Yeşil Bina',
        icon: '🏗️',
        color: 'teal',
        desc: 'LEED sertifikalı yeşil bina tasarımlarıyla inşaat sektörünün karbon ayak izini azaltıyor.',
        eco: '+9 ECO/m²',
    },
]

const colorMap: Record<string, { border: string; badge: string; text: string; glow: string }> = {
    yellow: { border: 'border-yellow-800/50', badge: 'bg-yellow-950/60 text-yellow-400', text: 'text-yellow-400', glow: 'group-hover:border-yellow-700/60' },
    green: { border: 'border-green-800/50', badge: 'bg-green-950/60 text-green-400', text: 'text-green-400', glow: 'group-hover:border-green-700/60' },
    blue: { border: 'border-blue-800/50', badge: 'bg-blue-950/60 text-blue-400', text: 'text-blue-400', glow: 'group-hover:border-blue-700/60' },
    emerald: { border: 'border-emerald-800/50', badge: 'bg-emerald-950/60 text-emerald-400', text: 'text-emerald-400', glow: 'group-hover:border-emerald-700/60' },
    orange: { border: 'border-orange-800/50', badge: 'bg-orange-950/60 text-orange-400', text: 'text-orange-400', glow: 'group-hover:border-orange-700/60' },
    purple: { border: 'border-purple-800/50', badge: 'bg-purple-950/60 text-purple-400', text: 'text-purple-400', glow: 'group-hover:border-purple-700/60' },
    pink: { border: 'border-pink-800/50', badge: 'bg-pink-950/60 text-pink-400', text: 'text-pink-400', glow: 'group-hover:border-pink-700/60' },
    cyan: { border: 'border-cyan-800/50', badge: 'bg-cyan-950/60 text-cyan-400', text: 'text-cyan-400', glow: 'group-hover:border-cyan-700/60' },
    lime: { border: 'border-lime-800/50', badge: 'bg-lime-950/60 text-lime-400', text: 'text-lime-400', glow: 'group-hover:border-lime-700/60' },
    teal: { border: 'border-teal-800/50', badge: 'bg-teal-950/60 text-teal-400', text: 'text-teal-400', glow: 'group-hover:border-teal-700/60' },
}

export function EcoPartners() {
    return (
        <section className="max-w-5xl mx-auto px-4 py-10">
            {/* Section Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-green-950/60 border border-green-800/40
                        text-green-400 text-xs font-medium px-3 py-1.5 rounded-full mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Onaylı Ortaklar
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Çevreci Şirket Ağı</h2>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                    CarboNode protokolüne entegre, sürdürülebilirlik taahhüdünü zincire yazan öncü şirketler.
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                {partners.map((p) => {
                    const c = colorMap[p.color]
                    return (
                        <div
                            key={p.id}
                            className={`group relative bg-[#0b1a0b] border ${c.border} ${c.glow}
                          rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300
                          hover:bg-[#0f200f] hover:-translate-y-0.5`}
                        >
                            {/* Icon + Name */}
                            <div className="flex items-center gap-3">
                                <div className="text-2xl w-10 h-10 flex items-center justify-center
                                bg-black/30 rounded-xl border border-white/5">
                                    {p.icon}
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm leading-tight">{p.name}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.badge} mt-0.5 inline-block`}>
                                        {p.category}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-gray-400 text-xs leading-relaxed flex-1">{p.desc}</p>

                            {/* ECO Reward */}
                            <div className={`flex items-center gap-1.5 text-xs font-medium ${c.text}`}>
                                <span>🌿</span>
                                <span>{p.eco} ödül</span>
                            </div>

                            {/* Verified badge */}
                            <div className="absolute top-3 right-3">
                                <div className="w-5 h-5 rounded-full bg-green-500/10 border border-green-600/30
                                flex items-center justify-center" title="CarboNode Onaylı">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                        <path d="M5 13l4 4L19 7" stroke="#22c55e" strokeWidth="3"
                                            strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
