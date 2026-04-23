'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Leaflet default icon fix (Next.js asset issue)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const makeIcon = (color: string) =>
    L.divIcon({
        className: '',
        html: `<div style="
      width:28px; height:28px; border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      background:${color}; border:3px solid rgba(255,255,255,0.25);
      box-shadow:0 2px 8px rgba(0,0,0,0.5);
    "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30],
    })

const icons = {
    green: makeIcon('#22c55e'),
    blue: makeIcon('#3b82f6'),
    yellow: makeIcon('#eab308'),
    red: makeIcon('#ef4444'),
}

const points = [
    { id: 1, lat: 41.0082, lng: 28.9784, name: 'Beyoğlu Merkez Noktası', type: 'green', items: ['Kağıt', 'Karton', 'Plastik'], eco: '+10 ECO' },
    { id: 2, lat: 41.0136, lng: 29.0125, name: 'Kadıköy İskele Noktası', type: 'blue', items: ['Elektronik Atık', 'Pil'], eco: '+20 ECO' },
    { id: 3, lat: 41.0451, lng: 29.0082, name: 'Üsküdar Meydan Noktası', type: 'yellow', items: ['Organik Atık', 'Kompost'], eco: '+8 ECO' },
    { id: 4, lat: 40.9876, lng: 29.0286, name: 'Bağcılar AVM Noktası', type: 'red', items: ['Tekstil', 'Giysi'], eco: '+6 ECO' },
    { id: 5, lat: 41.0633, lng: 28.9980, name: 'Sarıyer Sahil Noktası', type: 'green', items: ['Cam', 'Metal', 'Plastik'], eco: '+12 ECO' },
    { id: 6, lat: 41.0197, lng: 28.9350, name: 'Fatih Metro İstasyonu', type: 'blue', items: ['Elektronik', 'Kablo'], eco: '+18 ECO' },
    { id: 7, lat: 41.0380, lng: 29.0500, name: 'Ataşehir Park Noktası', type: 'yellow', items: ['Organik', 'Bahçe Atığı'], eco: '+7 ECO' },
    { id: 8, lat: 40.9900, lng: 28.8700, name: 'Bahçelievler Noktası', type: 'green', items: ['Kağıt', 'Metal', 'Cam'], eco: '+11 ECO' },
    { id: 9, lat: 41.0720, lng: 29.0200, name: 'Beykoz Orman Noktası', type: 'green', items: ['Plastik', 'Cam', 'Kağıt'], eco: '+9 ECO' },
    { id: 10, lat: 41.0020, lng: 28.9500, name: 'Zeytinburnu Noktası', type: 'red', items: ['Tekstil', 'Deri Atık'], eco: '+5 ECO' },
    { id: 11, lat: 41.0580, lng: 28.8900, name: 'Eyüpsultan Meydan', type: 'yellow', items: ['Organik', 'Kompost'], eco: '+8 ECO' },
    { id: 12, lat: 40.9770, lng: 29.1100, name: 'Maltepe Sahil Noktası', type: 'blue', items: ['Elektronik', 'Pil', 'Kablo'], eco: '+22 ECO' },
    { id: 13, lat: 41.0300, lng: 28.8400, name: 'Küçükçekmece Merkezi', type: 'green', items: ['Plastik', 'Cam', 'Metal'], eco: '+10 ECO' },
    { id: 14, lat: 41.1050, lng: 29.0650, name: 'Beykuz Köy Noktası', type: 'yellow', items: ['Organik Atık'], eco: '+6 ECO' },
    { id: 15, lat: 41.0000, lng: 29.1500, name: 'Pendik Metro Noktası', type: 'blue', items: ['Elektronik', 'Beyaz Eşya'], eco: '+25 ECO' },
]

const typeLabels: Record<string, string> = {
    green: 'Genel Geri Dönüşüm',
    blue: 'Elektronik Atık',
    yellow: 'Organik Atık',
    red: 'Tekstil',
}

export default function CollectionMapInner() {
    return (
        <MapContainer
            center={[41.015, 29.0]}
            zoom={11}
            style={{ width: '100%', height: '100%', background: '#050e05' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {points.map((p) => (
                <Marker
                    key={p.id}
                    position={[p.lat, p.lng]}
                    icon={icons[p.type as keyof typeof icons]}
                >
                    <Popup>
                        <div style={{
                            fontFamily: 'Inter, system-ui, sans-serif',
                            minWidth: '180px',
                            background: '#0b1a0b',
                            color: '#f1f5f9',
                            borderRadius: '10px',
                            padding: '2px 0',
                        }}>
                            <p style={{ fontWeight: 700, marginBottom: '4px', color: '#22c55e' }}>
                                {p.name}
                            </p>
                            <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                                {typeLabels[p.type]}
                            </p>
                            <div style={{ fontSize: '11px', color: '#cbd5e1', marginBottom: '6px' }}>
                                {p.items.map((item) => (
                                    <span key={item} style={{
                                        display: 'inline-block',
                                        background: '#132213',
                                        border: '1px solid #1a3a1a',
                                        borderRadius: '20px',
                                        padding: '2px 8px',
                                        margin: '2px 2px 0 0',
                                    }}>{item}</span>
                                ))}
                            </div>
                            <p style={{ fontSize: '12px', fontWeight: 700, color: '#4ade80' }}>
                                🌿 {p.eco}
                            </p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}
