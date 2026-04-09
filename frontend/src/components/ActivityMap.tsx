import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ActivityMapProps {
  polyline: string | null | undefined;
  height?: number;
}

/** Decode a Google-encoded polyline string into [lat, lng] pairs. */
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

export default function ActivityMap({ polyline, height = 250 }: ActivityMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || !polyline) return;

    // Prevent re-initialising on the same container
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const coords = decodePolyline(polyline);
    if (coords.length === 0) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const line = L.polyline(coords, { color: '#6366f1', weight: 3 }).addTo(map);
    map.fitBounds(line.getBounds(), { padding: [20, 20] });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [polyline]);

  if (!polyline) {
    return (
      <div
        style={{
          height,
          borderRadius: 12,
          background: 'var(--surface, #f3f4f6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span className="muted small">Sem mapa disponível</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ height, borderRadius: 12, overflow: 'hidden' }}
    />
  );
}
