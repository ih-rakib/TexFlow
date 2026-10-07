import { useMemo, useState } from 'react';
import { GLOSSARY } from '../data/content';

interface CalcDef {
  id: string;
  title: string;
  desc: string;
  formula: string;
  inputs: { key: string; label: string; def: number }[];
  run: (v: Record<string, number>) => string;
}

const CALCS: CalcDef[] = [
  { id: 'dye', title: 'Dye % → dye weight', desc: 'How much dye powder for a lot?', formula: 'Dye (kg) = fabric × shade% ÷ 100',
    inputs: [{ key: 'fabric', label: 'Fabric weight (kg)', def: 500 }, { key: 'shade', label: 'Dye shade %', def: 3 }],
    run: (v) => { const r = v.fabric * v.shade / 100; return `INPUT: ${v.fabric} kg × ${v.shade}%\nCALCULATION: ${v.fabric} × ${v.shade} ÷ 100\nRESULT: ${r.toFixed(2)} kg (${(r * 1000).toFixed(0)} g)`; } },
  { id: 'liquor', title: 'Liquor quantity (M:L)', desc: 'Bath volume from liquor ratio.', formula: 'Liquor (L) = fabric × ratio',
    inputs: [{ key: 'fabric', label: 'Fabric weight (kg)', def: 500 }, { key: 'lr', label: 'Liquor ratio (e.g. 8 for 1:8)', def: 8 }],
    run: (v) => { const r = v.fabric * v.lr; return `INPUT: ${v.fabric} kg @ 1:${v.lr}\nCALCULATION: ${v.fabric} × ${v.lr}\nRESULT: ${r.toFixed(0)} litres`; } },
  { id: 'chem', title: 'Chemical dosage (g/L)', desc: 'Chemical weight from bath concentration.', formula: 'Chemical (g) = liquor × dosage',
    inputs: [{ key: 'liq', label: 'Liquor volume (L)', def: 4000 }, { key: 'dos', label: 'Dosage (g/L)', def: 2 }],
    run: (v) => { const r = v.liq * v.dos; return `INPUT: ${v.liq} L × ${v.dos} g/L\nCALCULATION: ${v.liq} × ${v.dos}\nRESULT: ${r.toFixed(0)} g (${(r / 1000).toFixed(2)} kg)`; } },
  { id: 'gsm', title: 'GSM from sample', desc: 'Fabric areal density.', formula: 'GSM = weight ÷ area × 10,000',
    inputs: [{ key: 'wt', label: 'Sample weight (g)', def: 4.5 }, { key: 'area', label: 'Sample area (cm², 100 = cutter)', def: 100 }],
    run: (v) => { const r = v.area ? (v.wt / v.area) * 10000 : 0; return `INPUT: ${v.wt} g / ${v.area} cm²\nCALCULATION: ${v.wt} ÷ ${v.area} × 10000\nRESULT: ${r.toFixed(1)} GSM`; } },
  { id: 'shrink', title: 'Shrinkage %', desc: 'Dimensional change after wash.', formula: 'Shrinkage % = (before − after) ÷ before × 100',
    inputs: [{ key: 'before', label: 'Length before (cm)', def: 50 }, { key: 'after', label: 'Length after (cm)', def: 48.5 }],
    run: (v) => { const r = v.before ? ((v.before - v.after) / v.before) * 100 : 0; return `INPUT: ${v.before} → ${v.after} cm\nCALCULATION: (${v.before} − ${v.after}) ÷ ${v.before} × 100\nRESULT: ${r.toFixed(2)} % ${r > 0 ? '(shrinkage)' : '(growth)'}`; } },
];

function CalcCard({ def }: { def: CalcDef }) {
  const [vals, setVals] = useState<Record<string, number>>(() =>
    Object.fromEntries(def.inputs.map((i) => [i.key, i.def])));
  const out = useMemo(() => {
    try { return def.run(vals); } catch { return 'Check inputs.'; }
  }, [def, vals]);
  return (
    <div className="calc-card">
      <h3>{def.title}</h3>
      <p className="muted small">{def.desc}</p>
      <div className="calc-formula">Formula: <code>{def.formula}</code></div>
      {def.inputs.map((i) => (
        <label key={i.key}>{i.label}
          <input type="number" step="any" value={vals[i.key]}
            onChange={(e) => setVals((v) => ({ ...v, [i.key]: parseFloat(e.target.value) || 0 }))} />
        </label>
      ))}
      <div className="calc-out"><b>INPUT → FORMULA → CALCULATION → RESULT</b>{'\n'}{out}{'\n\n'}Educational — follow approved recipes/SOPs in production.</div>
    </div>
  );
}

export function CalcGrid() {
  return (
    <section id="calc" className="panel">
      <p className="section-eyebrow">06 — Calculators</p>
      <h2>Shop-floor calculators <span className="pill">educational</span></h2>
      <p className="panel-desc">Each result shows input, formula, calculation and result. Always follow approved recipes and SOPs in production.</p>
      <div className="calc-grid">{CALCS.map((c) => <CalcCard key={c.id} def={c} />)}</div>
    </section>
  );
}

export function GlossaryGrid({ externalFilter, onClearExternal }: { externalFilter: string; onClearExternal?: () => void }) {
  const [q, setQ] = useState('');
  const needle = (externalFilter || q).toLowerCase();
  const hits = GLOSSARY.filter(([t]) => t.toLowerCase().includes(needle));
  const value = externalFilter || q;
  return (
    <section id="glossary" className="panel">
      <div className="panel-head">
        <div><p className="section-eyebrow">07 — Glossary</p><h2>Key terms</h2><p className="panel-desc">Plain meaning, technical meaning, where it is used, and which department owns it.</p></div>
        <input type="search" placeholder="Filter glossary… e.g. pH" aria-label="Filter glossary"
          value={value}
          onChange={(e) => {
            if (externalFilter && onClearExternal) onClearExternal();
            setQ(e.target.value);
          }} />
      </div>
      {externalFilter && <p className="muted small">Filtered by global search: “{externalFilter}”.</p>}
      <div className="gloss-grid">
        {hits.map(([t, simple, tech, where, depts]) => (
          <div key={t} className="gloss-card">
            <h3>{t}</h3>
            <p><b>Simple:</b> {simple}</p>
            <p className="tech"><b>Technical:</b> {tech}</p>
            <div className="use"><b>Where used:</b> {where}<br /><b>Departments:</b> {depts}</div>
          </div>
        ))}
        {!hits.length && <p className="muted">No terms match.</p>}
      </div>
    </section>
  );
}
