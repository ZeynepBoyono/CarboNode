import { Header } from '@/components/Header'
import { EcoProfileCard } from '@/components/EcoProfileCard'
import { EcoTokenCard } from '@/components/EcoTokenCard'
import { GlobalStats } from '@/components/GlobalStats'
import { WalletGate } from '@/components/WalletGate'
import { EcoPartners } from '@/components/EcoPartners'
import { CollectionMap } from '@/components/CollectionMap'
import { QRRoadmap } from '@/components/QRRoadmap'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050e05]">
      <Header />

      {/* Hero */}
      <section className="text-center pt-12 pb-8 px-4">
        <div className="inline-flex items-center gap-2 bg-green-950/60 border border-green-800/40
                        text-green-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-slow" />
          Monad Testnet — Live
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
          Carbon<span className="text-green-400">Node</span>
        </h1>
        <p className="text-gray-400 text-base max-w-lg mx-auto leading-relaxed">
          Geri dönüşüm ve toplu taşıma eylemlerini zincire yaz,{' '}
          <span className="text-green-400 font-medium">ECO Token</span> kazan ve
          çevreci itibarını inşa et.
        </p>
      </section>

      {/* Global Stats Bar */}
      <GlobalStats />

      {/* Eco Partner Companies */}
      <EcoPartners />

      {/* Section Divider */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="border-t border-green-900/20" />
      </div>

      {/* Collection Points Map */}
      <CollectionMap />

      {/* Section Divider */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="border-t border-green-900/20" />
      </div>

      {/* QR Code Roadmap */}
      <QRRoadmap />

      {/* Section Divider */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="border-t border-green-900/20" />
      </div>

      {/* Main Dashboard */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">Kontrol Paneli</h2>
          <p className="text-gray-400 text-sm">Cüzdanını bağla, ekolojik profilini ve tokenlarını yönet.</p>
        </div>
        <WalletGate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EcoProfileCard />
            <EcoTokenCard />
          </div>
        </WalletGate>
      </section>

      {/* Hakkımızda */}
      <section className="max-w-5xl mx-auto px-4 py-10 text-center">
        <div className="border-t border-green-900/20 mb-8" />
        <h2 className="text-2xl font-bold text-white mb-2">Hakkımızda</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
          CarboNode, çevre bilincini artırmak ve sürdürülebilir yaşamı teşvik etmek amacıyla geliştirilmiştir.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <div className="bg-green-950/40 border border-green-800/30 rounded-xl px-6 py-4">
            <p className="text-green-400 font-semibold text-sm">Zeynep Boyono</p>
            <a href="mailto:boyonozeynep@gmail.com" className="text-gray-400 text-xs hover:text-green-400 transition-colors">
              boyonozeynep@gmail.com
            </a>
          </div>
          <div className="bg-green-950/40 border border-green-800/30 rounded-xl px-6 py-4">
            <p className="text-green-400 font-semibold text-sm">Hatice Kübra Tontuş</p>
            <a href="mailto:haticekubratontus@gmail.com" className="text-gray-400 text-xs hover:text-green-400 transition-colors">
              haticekubratontus@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-600 text-xs pb-8">
        CarboNode · ReFi Carbon Tracker · Monad Hackathon MVP
      </footer>
    </main>
  )
}
