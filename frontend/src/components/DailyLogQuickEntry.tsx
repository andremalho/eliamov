import React, { useEffect, useState } from 'react';
import { dailyLogApi, DailyLog, UpsertDailyLogInput } from '../services/dailyLog.api';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

const today = () => new Date().toISOString().split('T')[0];

const DOT_COLORS = {
  energy: '#F59E0B',
  mood: '#7C3AED',
  sleep: '#3B82F6',
  anxiety: '#EF4444',
  irritability: '#F97316',
  concentration: '#22C55E',
};

const SYMPTOM_LEVELS = [
  { label: 'Nao', value: null as number | null },
  { label: 'Leve', value: 1 },
  { label: 'Moderado', value: 3 },
  { label: 'Intenso', value: 5 },
];

function Dots({ value, onChange, color, count = 5 }: { value: number | null; onChange: (v: number) => void; color: string; count?: number }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {Array.from({ length: count }, (_, i) => i + 1).map(n => (
        <button key={n} onClick={() => onChange(n)} style={{
          width: 26, height: 26, borderRadius: '50%',
          border: value !== null && value >= n ? `2px solid ${color}` : '2px solid #E5E7EB',
          background: value !== null && value >= n ? `${color}20` : '#fff',
          cursor: 'pointer', transition: 'all 0.15s',
        }} />
      ))}
    </div>
  );
}

function SymptomToggle({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {SYMPTOM_LEVELS.map((sl, i) => (
        <button key={i} onClick={() => onChange(sl.value)} style={{
          padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 500,
          border: value === sl.value ? '1.5px solid #7C3AED' : '1px solid #E5E7EB',
          background: value === sl.value ? '#F5F3FF' : '#fff',
          color: value === sl.value ? '#7C3AED' : '#6B7280',
          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
        }}>{sl.label}</button>
      ))}
    </div>
  );
}

function BoolToggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8,
      border: value ? '1.5px solid #7C3AED' : '1px solid #E5E7EB',
      background: value ? '#F5F3FF' : '#fff', cursor: 'pointer',
      fontSize: 12, color: value ? '#7C3AED' : '#6B7280', fontWeight: 500,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {value && <Check size={12} />} {label}
    </button>
  );
}

function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <button onClick={onToggle} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
        padding: '8px 0', border: 'none', background: 'none', cursor: 'pointer',
        fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: "'DM Sans', sans-serif",
      }}>
        {title} {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>{children}</div>}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, color: '#374151' }}>{label}</span>
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
      <div style={{ background: '#F0FDF4', borderRadius: 14, border: '1px solid #BBF7D0', padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={16} color="#16A34A" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#166534' }}>Registrado hoje</span>
          {existing.energyLevel && <span style={{ fontSize: 12, color: '#6B7280' }}>Energia {existing.energyLevel}/5</span>}
          {existing.moodScore && <span style={{ fontSize: 12, color: '#6B7280' }}>Humor {existing.moodScore}/5</span>}
        </div>
        <button onClick={() => setEditing(true)} style={{ fontSize: 12, color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Editar</button>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 18, marginBottom: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1F2937', margin: '0 0 14px' }}>Como voce esta hoje?</h3>

      {saved && <div style={{ background: '#DCFCE7', color: '#166534', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>Registro salvo com sucesso!</div>}

      <Section title="Bem-estar" open={openSections.wellbeing} onToggle={() => toggleSection('wellbeing')}>
        <Row label="Energia"><Dots value={energy} onChange={setEnergy} color={DOT_COLORS.energy} /></Row>
        <Row label="Humor"><Dots value={mood} onChange={setMood} color={DOT_COLORS.mood} /></Row>
        <Row label="Sono (horas)">
          <input type="number" min={0} max={12} value={sleepHours ?? ''} onChange={e => setSleepHours(e.target.value ? Number(e.target.value) : null)}
            style={{ width: 60, padding: '4px 8px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, textAlign: 'center' }} />
        </Row>
        <Row label="Qualidade do sono"><Dots value={sleepQuality} onChange={setSleepQuality} color={DOT_COLORS.sleep} /></Row>
      </Section>

      <Section title="Sintomas fisicos" open={openSections.physical} onToggle={() => toggleSection('physical')}>
        <Row label="Dor pelvica"><SymptomToggle value={pelvicPain} onChange={setPelvicPain} /></Row>
        <Row label="Cefaleia"><SymptomToggle value={headache} onChange={setHeadache} /></Row>
        <Row label="Inchaco"><SymptomToggle value={bloating} onChange={setBloating} /></Row>
        <Row label="Dor nas mamas"><SymptomToggle value={breastTenderness} onChange={setBreastTenderness} /></Row>
        <Row label="Lombalgia"><SymptomToggle value={backPain} onChange={setBackPain} /></Row>
        <Row label="Nausea"><SymptomToggle value={nausea} onChange={setNausea} /></Row>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
          <BoolToggle value={spotting} onChange={setSpotting} label="Manchas" />
          <BoolToggle value={hotFlashes} onChange={setHotFlashes} label="Ondas de calor" />
          <BoolToggle value={nightSweats} onChange={setNightSweats} label="Suor noturno" />
        </div>
      </Section>

      <Section title="Sintomas psicologicos" open={openSections.psych} onToggle={() => toggleSection('psych')}>
        <Row label="Ansiedade"><Dots value={anxiety} onChange={setAnxiety} color={DOT_COLORS.anxiety} /></Row>
        <Row label="Irritabilidade"><Dots value={irritability} onChange={setIrritability} color={DOT_COLORS.irritability} /></Row>
        <Row label="Concentracao"><Dots value={concentration} onChange={setConcentration} color={DOT_COLORS.concentration} /></Row>
      </Section>

      <div style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Observacoes</span>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Como foi seu dia?" style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" }} />
      </div>

      <button onClick={handleSave} disabled={saving} style={{
        width: '100%', padding: 12, borderRadius: 12, border: 'none',
        background: '#7C3AED', color: '#fff', fontSize: 14, fontWeight: 600,
        cursor: 'pointer', opacity: saving ? 0.6 : 1, fontFamily: "'DM Sans', sans-serif",
      }}>{saving ? 'Salvando...' : 'Salvar registro do dia'}</button>
    </div>
  );
}
