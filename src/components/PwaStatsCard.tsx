'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

type Stats = {
  total: number;
  ios: number;
  android: number;
  android_app: number;
  desktop: number;
  active_7d: number;
  active_30d: number;
  new_7d: number;
};

export default function PwaStatsCard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    createClient()
      .rpc('pwa_stats')
      .single()
      .then(({ data, error }) => {
        if (error) setError(true);
        else setStats(data as Stats);
      });
  }, []);

  if (error) return <p className="text-sm text-stone-500">No se pudieron cargar las estadísticas.</p>;
  if (!stats) return <p className="text-sm text-stone-400">Cargando…</p>;

  const items = [
    { label: 'Dispositivos detectados desde el 28/09', value: stats.total, strong: true },
    { label: 'Activos últimos 7 días', value: stats.active_7d },
    { label: 'Nuevos esta semana', value: stats.new_7d },
    { label: 'iPhone', value: stats.ios },
    { label: 'Android (web)', value: stats.android },
    { label: 'Android (Play Store)', value: stats.android_app },
    { label: 'Computadora', value: stats.desktop },
  ];

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="mb-4 text-base font-medium text-stone-700">Uso real de la app</h2>
      <div
        className="mb-3 rounded-xl border p-5"
        style={{ background: 'rgba(45,69,48,0.07)', borderColor: 'rgba(45,69,48,0.2)' }}
      >
        <p className="mb-1 text-xs uppercase tracking-wider" style={{ color: 'rgba(45,69,48,0.65)' }}>
          Personas que usan la app
        </p>
        <p className="font-serif text-5xl tabular-nums" style={{ color: '#2D4530' }}>
          <AnimatedCounter to={Number(stats.active_30d) || 0} />
        </p>
        <p className="mt-1 text-xs text-stone-500">Activos últimos 30 días</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((it) => (
          <div
            key={it.label}
            className="rounded-xl border p-4"
            style={
              it.strong
                ? { background: 'rgba(45,69,48,0.05)', borderColor: 'rgba(45,69,48,0.15)' }
                : { background: '#fafaf9', borderColor: '#f5f5f4' }
            }
          >
            <p
              className="mb-1 text-[10px] uppercase tracking-wider"
              style={{ color: it.strong ? 'rgba(45,69,48,0.55)' : '#a8a29e' }}
            >
              {it.label}
            </p>
            <p
              className={`font-serif tabular-nums ${it.strong ? 'text-3xl' : 'text-2xl'}`}
              style={{ color: it.strong ? '#2D4530' : '#292524' }}
            >
              <AnimatedCounter to={Number(it.value) || 0} />
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-stone-400">
        Cuenta dispositivos que abren la app instalada. Empezó a medir el día que se activó.
      </p>
    </section>
  );
}
