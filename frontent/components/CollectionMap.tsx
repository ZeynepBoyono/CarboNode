'use client'

import dynamic from 'next/dynamic'

// Leaflet SSR devre dışı — window bağımlılığı nedeniyle
const MapInner = dynamic(() => import('./CollectionMapInner'), { ssr: false })

export function CollectionMap() {
    return (
        <section className="max-w-5xl mx-auto px-4 py-10">
            {/* Section Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-green-950/60 border border-green-800/40
                        text-green-400 text-xs font-medium px-3 py-1.5 rounded-full mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Canlı Harita
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Toplama Noktaları</h2>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                    Sana en yakın geri dönüşüm ve karbon eylem noktasını bul. Pin'e tıklayarak
                    kabul edilen malzemeleri ve ECO ödül miktarını gör.
                </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 mb-5">
                {[
                    { icon: '🟢', label: 'Genel Geri Dönüşüm' },
                    { icon: '🔵', label: 'Elektronik Atık' },
                    { icon: '🟡', label: 'Organik Atık' },
                    { icon: '🔴', label: 'Tekstil' },
                ].map((l) => (
                    <div key={l.label}
                        className="flex items-center gap-1.5 bg-[#0b1a0b] border border-green-900/30
                          rounded-full px-3 py-1 text-xs text-gray-400">
                        <span>{l.icon}</span>
                        <span>{l.label}</span>
                    </div>
                ))}
            </div>

            {/* Map container */}
            <div className="rounded-2xl overflow-hidden border border-green-900/40 shadow-xl shadow-black/50"
                style={{ height: '460px' }}>
                <MapInner />
            </div>

            <p className="text-center text-gray-600 text-xs mt-3">
                * Toplama noktaları örnek amaçlıdır. Gerçek konumlar yakında eklenecek.
            </p>
        </section>
    )
}
