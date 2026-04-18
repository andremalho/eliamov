import React, { useEffect, useState } from 'react';
import { dailyLogApi, DailyLog, UpsertDailyLogInput } from '../services/dailyLog.api';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

const today = () => new Date().toISOString().split('T')[0];

/** Tons Lunar Bloom por dimensão (semântica preservada) */
const DOT_COLORS = {
  energy: '#C9A977',         // brass — vitalidade
  mood: '#D97757',           // terracotta — afeto
  sleep: '#9CA89A',          // sage — repouso
  anxiety: '#8B3A2F',        // oxide — alerta
  irritability: '#B85A3D',   // terracotta deep — fricção
  concentration: '#14161F',  // ink — foco
};

const SYMPTOM_LEVELS = [
  { label: 'Não', value: null as number | null },
  { label: 'Leve', value: 1 },
  { label: 'Moderado', value: 3 },
  { label: 'Intenso', value: 5 },
];

function Dots({ value, onChange, color, count = 5 }: { value: number | null; onChange: (v: number) => void; color: string; count?: number }) {
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {Array.from({ length: count }, (_, i) => i + 1).map(n => {
        const active = value !== null && value >= n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`Nível ${n}`}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: `1.5px solid ${active ? color : 'rgba(20,22,31,0.14)'}`,
              background: active ? color : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
              padding: 0,
            }}
          />
        );
      })}
    </div>
  );
}

function SymptomToggle({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {SYMPTOM_LEVELS.map((sl, i) => {
        const active = value === sl.value;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(sl.value)}
            style={{
              padding: '5px 10px',
              border: `1px solid ${active ? '#14161F' : 'rgba(20,22,31,0.12)'}`,
              background: active ? '#14161F' : 'transparent',
              color: active ? '#F5EFE6' : 'rgba(20,22,31,0.68)',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.02em',
              cursor: 'pointer',
              fontFamily: "'Figtree', sans-serif",
              transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {sl.label}
          </button>
        );
      })}
    </div>
  );
}

function BoolToggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        border: `1px solid ${value ? '#14161F' : 'rgba(20,22,31,0.12)'}`,
        background: value ? '#14161F' : 'transparent',
        cursor: 'pointer',
        fontSize: 12,
        color: value ? '#F5EFE6' : 'rgba(20,22,31,0.68)',
        fontWeight: 500,
        letterSpacing: '0.01em',
        fontFamily: "'Figtree', sans-serif",
        transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {value && <Check size={12} />} {label}
    </button>
  );
}

function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14, borderBottom: '1px solid rgba(20,22,31,0.06)' }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '12px 0',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#14161F',
          fontFamily: "'Figtree', sans-serif",
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#D97757' }} aria-hidden />
          {title}
        </span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 6, paddingBottom: 16 }}>{children}</div>}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span
        style={{
          fontSize: 13,
          color: 'rgba(20,22,31,0.78)',
          fontFamily: "'Figtree', sans-serif",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

export function DailyLogQuickEntry() {
  const [existing, setExisting] = useState<DailyLog | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const [energy, setEnergy] = useState<number | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);

  const [pelvicPain, setPelvicPain] = useState<number | null>(null);
  const [headache, setHeadache] = useState<number | null>(null);
  const [bloating, setBloating] = useState<number | null>(null);
  const [breastTenderness, setBreastTenderness] = useState<number | null>(null);
  const [backPain, setBackPain] = useState<number | null>(null);
  const [nausea, setNausea] = useState<number | null>(null);
  const [spotting, setSpotting] = useState(false);
  const [hotFlashes, setHotFlashes] = useState(false);
  const [nightSweats, setNightSweats] = useState(false);

  const [anxiety, setAnxiety] = useState<number | null>(null);
  const [irritability, setIrritability] = useState<number | null>(null);
  const [concentration, setConcentration] = useState<number | null>(null);

  const [notes, setNotes] = useState('');

  const [openSections, setOpenSections] = useState({ wellbeing: true, physical: false, psych: false });
  const toggleSection = (s: 'wellbeing' | 'physical' | 'psych') => setOpenSections(prev => ({ ...prev, [s]: !prev[s] }));

  const populateFromLog = (log: DailyLog) => {
    setEnergy(log.energyLevel); setMood(log.moodScore);
    setSleepHours(log.sleepHours); setSleepQuality(log.sleepQuality);
    setPelvicPain(log.pelvicPain); setHeadache(log.headache);
    setBloating(log.bloating); setBreastTenderness(log.breastTenderness);
    setBackPain(log.backPain); setNausea(log.nausea);
    setSpotting(log.spotting); setHotFlashes(log.hotFlashes); setNightSweats(log.nightSweats);
    setAnxiety(log.anxiety); setIrritability(log.irritability); setConcentration(log.concentration);
    setNotes(log.notes ?? '');
  };

  useEffect(() => {
    dailyLogApi.today().then(log => {
      if (log) { setExisting(log); populateFromLog(log); }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data: UpsertDailyLogInput = {
        logDate: today(),
        energyLevel: energy ?? undefined, moodScore: mood ?? undefined,
        sleepHours: sleepHours ?? undefined, sleepQuality: sleepQuality ?? undefined,
        pelvicPain: pelvicPain ?? undefined, headache: headache ?? undefined,
        bloating: bloating ?? undefined, breastTenderness: breastTenderness ?? undefined,
        backPain: backPain ?? undefined, nausea: nausea ?? undefined,
        anxiety: anxiety ?? undefined, irritability: irritability ?? undefined,
        concentration: concentration ?? undefined,
        spotting, hotFlashes, nightSweats,
        notes: notes || undefined,
      };
      const result = await dailyLogApi.upsert(data);
      setExisting(result);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  if (loading) return null;

  if (existing && !editing) {
    return (
      <div
        style={{
          background: '#FDFAF3',
          border: '1px solid rgba(20,22,31,0.08)',
          borderLeft: '2px solid #9CA89A',
          padding: '14px 18px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          fontFamily: "'Figtree', sans-serif",
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Check size={16} color="#9CA89A" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#14161F', letterSpacing: '0.02em' }}>
            Registrado hoje
          </span>
          {existing.energyLevel && (
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.14em',
                color: 'rgba(20,22,31,0.55)',
              }}
            >
              Energia {existing.energyLevel}/5
            </span>
          )}
          {existing.moodScore && (
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.14em',
                color: 'rgba(20,22,31,0.55)',
              }}
            >
              Humor {existing.moodScore}/5
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          style={{
            fontSize: 11,
            color: '#14161F',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontFamily: "'Figtree', sans-serif",
            textDecoration: 'underline',
            textUnderlineOffset: 3,
            textDecorationColor: '#D97757',
            padding: 0,
          }}
        >
          Editar
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#FDFAF3',
        border: '1px solid rgba(20,22,31,0.08)',
        padding: 22,
        marginBottom: 16,
        fontFamily: "'Figtree', sans-serif",
        color: '#14161F',
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: '#D97757',
          marginBottom: 10,
        }}
      >
        ● Diário de hoje
      </div>
      <h3
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 22,
          fontWeight: 450,
          letterSpacing: '-0.015em',
          color: '#14161F',
          margin: '0 0 20px',
          lineHeight: 1.15,
        }}
      >
        Como você está <span style={{ fontStyle: 'italic', color: '#B85A3D' }}>hoje</span>?
      </h3>

      {saved && (
        <div
          style={{
            background: 'rgba(156,168,154,0.12)',
            borderLeft: '2px solid #9CA89A',
            color: '#5B6B5C',
            padding: '10px 14px',
            fontSize: 12.5,
            marginBottom: 16,
            letterSpacing: '0.02em',
          }}
        >
          Registro salvo com sucesso.
        </div>
      )}

      <Section title="Bem-estar" open={openSections.wellbeing} onToggle={() => toggleSection('wellbeing')}>
        <Row label="Energia"><Dots value={energy} onChange={setEnergy} color={DOT_COLORS.energy} /></Row>
        <Row label="Humor"><Dots value={mood} onChange={setMood} color={DOT_COLORS.mood} /></Row>
        <Row label="Sono (horas)">
          <input
            type="number"
            min={0}
            max={12}
            value={sleepHours ?? ''}
            onChange={e => setSleepHours(e.target.value ? Number(e.target.value) : null)}
            style={{
              width: 64,
              padding: '6px 10px',
              border: '1px solid rgba(20,22,31,0.12)',
              borderRadius: 2,
              fontSize: 14,
              textAlign: 'center',
              background: '#FFFCF5',
              color: '#14161F',
              fontFamily: "'Figtree', sans-serif",
              outline: 'none',
            }}
          />
        </Row>
        <Row label="Qualidade do sono"><Dots value={sleepQuality} onChange={setSleepQuality} color={DOT_COLORS.sleep} /></Row>
      </Section>

      <Section title="Sintomas físicos" open={openSections.physical} onToggle={() => toggleSection('physical')}>
        <Row label="Dor pélvica"><SymptomToggle value={pelvicPain} onChange={setPelvicPain} /></Row>
        <Row label="Cefaleia"><SymptomToggle value={headache} onChange={setHeadache} /></Row>
        <Row label="Inchaço"><SymptomToggle value={bloating} onChange={setBloating} /></Row>
        <Row label="Dor nas mamas"><SymptomToggle value={breastTenderness} onChange={setBreastTenderness} /></Row>
        <Row label="Lombalgia"><SymptomToggle value={backPain} onChange={setBackPain} /></Row>
        <Row label="Náusea"><SymptomToggle value={nausea} onChange={setNausea} /></Row>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
          <BoolToggle value={spotting} onChange={setSpotting} label="Manchas" />
          <BoolToggle value={hotFlashes} onChange={setHotFlashes} label="Ondas de calor" />
          <BoolToggle value={nightSweats} onChange={setNightSweats} label="Suor noturno" />
        </div>
      </Section>

      <Section title="Sintomas psicológicos" open={openSections.psych} onToggle={() => toggleSection('psych')}>
        <Row label="Ansiedade"><Dots value={anxiety} onChange={setAnxiety} color={DOT_COLORS.anxiety} /></Row>
        <Row label="Irritabilidade"><Dots value={irritability} onChange={setIrritability} color={DOT_COLORS.irritability} /></Row>
        <Row label="Concentração"><Dots value={concentration} onChange={setConcentration} color={DOT_COLORS.concentration} /></Row>
      </Section>

      <div style={{ marginBottom: 20, marginTop: 6 }}>
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(20,22,31,0.55)',
            display: 'block',
            marginBottom: 8,
          }}
        >
          Observações
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="Como foi seu dia?"
          style={{
            width: '100%',
            padding: '12px 14px',
            border: '1px solid rgba(20,22,31,0.12)',
            borderRadius: 2,
            fontSize: 13.5,
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
            background: '#FFFCF5',
            color: '#14161F',
            fontFamily: "'Figtree', sans-serif",
            lineHeight: 1.5,
            transition: 'border-color 0.25s',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#14161F')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(20,22,31,0.12)')}
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        style={{
          width: '100%',
          padding: 16,
          border: 'none',
          borderRadius: 2,
          background: saving ? 'rgba(20,22,31,0.5)' : '#14161F',
          color: '#F5EFE6',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          cursor: saving ? 'default' : 'pointer',
          fontFamily: "'Figtree', sans-serif",
          transition: 'background 0.3s ease',
        }}
        onMouseEnter={(e) => { if (!saving) (e.currentTarget as HTMLElement).style.background = '#D97757'; }}
        onMouseLeave={(e) => { if (!saving) (e.currentTarget as HTMLElement).style.background = '#14161F'; }}
      >
        {saving ? 'Salvando…' : 'Salvar registro do dia'}
      </button>
    </div>
  );
}
