'use client';

import dynamic from 'next/dynamic';

const OpenStreetMapViewClient = dynamic(() => import('./open-street-map-view-client'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', minHeight: 320, borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8faff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Loading map...</p>
    </div>
  ),
});

export default function OpenStreetMapView(props) {
  return <OpenStreetMapViewClient {...props} />;
}
