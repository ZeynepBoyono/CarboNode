'use client'

const steps = [
    {
        step: '01',
        icon: '📍',
        title: 'Toplama Noktası Bul',
        desc: 'Yukarıdaki haritadan veya CarboNode mobil uygulamasından sana en yakın onaylı toplama noktasını seç. Her noktada bir fiziksel QR kod tabelası bulunur.',
        where: ['AVM girişleri', 'Metro istasyonları', 'Belediye parkları', 'Alışveriş caddeleri'],
        color: 'green',
    },
    {
        step: '02',
        icon: '📱',
        title: 'QR Kodu Tara',
        desc: 'Telefon kameranı veya herhangi bir QR okuyucu uygulamasını aç. Tabeladaki QR kodu tara — tarayıcında CarboNode\'un eylem kayıt sayfası açılır.',
        where: ['iPhone Kamera', 'Android Kamera', 'QR & Barcode Scanner', 'Google Lens'],
        color: 'blue',
    },
    {
        step: '03',
        icon: '🦊',
        title: 'Cüzdanını Bağla',
        desc: 'Açılan sayfada "Cüzdanı Bağla" butonuna bas. MetaMask, WalletConnect veya Rainbow desteklenir. Monad Testnet ağında olduğundan emin ol.',
        where: ['MetaMask', 'WalletConnect', 'Rainbow Wallet', 'Coinbase Wallet'],
        color: 'purple',
    },
    {
        step: '04',
        icon: '⛓️',
        title: 'Eylemi Zincire Yaz',
        desc: 'Geri dönüştürdüğün malzeme türünü ve miktarını seç. CarboNode akıllı sözleşmesi eylemi Monad blokzincirinde imzalatır — düşük gas, anlık onay.',
        where: ['Kağıt / Karton', 'Plastik', 'Cam', 'Metal', 'Elektronik'],
        color: 'emerald',
    },
    {
        step: '05',
        icon: '🌿',
        title: 'ECO Token Kazan',
        desc: 'İşlem onaylandıktan saniyeler içinde ECO token\'lar cüzdanına yatırılır. Biriken tokenları DeFi protokollerinde kullanabilir veya karbon kredisine çevirebilirsin.',
        where: ['Anında cüzdana', 'Karbon kredisine çevir', 'DeFi\'de stake et', 'Partner alışverişi'],
        color: 'cyan',
    },
]

const colorMap: Record<string, { ring: string; badge: string; text: string; dot: string; line: string }> = {
    green: { ring: 'border-green-700/50', badge: 'bg-green-950/80 text-green-400 border-green-800/50', text: 'text-green-400', dot: 'bg-green-500', line: 'bg-green-900/60' },
    blue: { ring: 'border-blue-700/50', badge: 'bg-blue-950/80 text-blue-400 border-blue-800/50', text: 'text-blue-400', dot: 'bg-blue-500', line: 'bg-blue-900/60' },
    purple: { ring: 'border-purple-700/50', badge: 'bg-purple-950/80 text-purple-400 border-purple-800/50', text: 'text-purple-400', dot: 'bg-purple-500', line: 'bg-purple-900/60' },
    emerald: { ring: 'border-emerald-700/50', badge: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/50', text: 'text-emerald-400', dot: 'bg-emerald-500', line: 'bg-emerald-900/60' },
    cyan: { ring: 'border-cyan-700/50', badge: 'bg-cyan-950/80 text-cyan-400 border-cyan-800/50', text: 'text-cyan-400', dot: 'bg-cyan-500', line: 'bg-cyan-900/60' },
}

export function QRRoadmap() {
    return (
        <section className="max-w-5xl mx-auto px-4 py-10">
            {/* Section Header */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-green-950/60 border border-green-800/40
                        text-green-400 text-xs font-medium px-3 py-1.5 rounded-full mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Nasıl Çalışır?
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">QR ile ECO Kazan</h2>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                    5 basit adımda geri dönüşüm eyleminizi Monad blokzincirinde kaydedin
                    ve anında ECO Token kazanın.
                </p>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b
                        from-green-800/60 via-cyan-800/40 to-transparent hidden md:block" />

                <div className="flex flex-col gap-6">
                    {steps.map((s, i) => {
                        const c = colorMap[s.color]
                        return (
                            <div key={s.step} className="relative flex gap-5 md:gap-6">
                                {/* Step Number Circle */}
                                <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-2xl
                                 bg-[#0b1a0b] border-2 ${c.ring}
                                 flex flex-col items-center justify-center gap-0.5`}>
                                    <span className="text-xl leading-none">{s.icon}</span>
                                    <span className={`text-[10px] font-bold ${c.text}`}>{s.step}</span>
                                </div>

                                {/* Content Card */}
                                <div className={`flex-1 bg-[#0b1a0b] border ${c.ring}
                                 rounded-2xl p-5 transition-all duration-300
                                 hover:bg-[#0f200f] hover:-translate-y-0.5`}>
                                    <h3 className={`font-bold text-base text-white mb-1.5`}>
                                        {s.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-3">{s.desc}</p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2">
                                        {s.where.map((w) => (
                                            <span key={w}
                                                className={`text-xs px-2.5 py-1 rounded-full border ${c.badge}`}>
                                                {w}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-10 text-center bg-[#0b1a0b] border border-green-900/40 rounded-2xl p-6">
                <p className="text-lg font-bold text-white mb-1">Hemen Başla 🚀</p>
                <p className="text-gray-400 text-sm mb-4">
                    Yakındaki toplama noktasına git, QR'ı tara ve ilk ECO token'ını kazan.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-green-400">
                        <span>✓</span><span>Ücretsiz kayıt</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                        <span>✓</span><span>Anlık ödül</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                        <span>✓</span><span>Zincir kanıtı</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                        <span>✓</span><span>Monad gas&apos;ı düşük</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
