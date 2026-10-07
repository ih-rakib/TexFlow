import { useState } from 'react';
import { DEPARTMENTS, CATEGORY_META } from '../data/departments';
import { WORKFLOWS } from '../data/content';
import { deptById } from '../data/departments';
import type { Category, Mode } from '../data/types';

const FILTERS: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'production', label: 'Production' },
  { id: 'laboratory', label: 'Laboratory' },
  { id: 'quality', label: 'Quality' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'downstream', label: 'Downstream' },
];

const catClass = (c: Category) =>
  c === 'laboratory' ? 'lab' : c === 'quality' ? 'quality' : c === 'engineering' ? 'eng' : c === 'downstream' ? 'downstream' : 'production';

export function DeptGrid({ mode, onDept }: { mode: Mode; onDept: (id: string) => void }) {
  const [cat, setCat] = useState<Category | 'all'>('all');
  return (
    <section id="departments" className="panel">
      <div className="panel-head">
        <div>
          <p className="section-eyebrow">02 — Departments</p>
          <h2>Who does what</h2>
          <p className="panel-desc">Each department in the unit. Select a card for inputs, machines, checks and common issues.</p>
        </div>
        <div className="filter-row" role="group" aria-label="Filter departments">
          {FILTERS.map((f) => (
            <button key={f.id} className={`chip${cat === f.id ? ' active' : ''}`} onClick={() => setCat(f.id)}>{f.label}</button>
          ))}
        </div>
      </div>
      <div className="dept-grid">
        {DEPARTMENTS.filter((d) => cat === 'all' || d.cat === cat || (cat === 'production' && d.cat === 'entry')).map((d) => (
          <button key={d.id} className="dept-card" data-cat={d.cat} onClick={() => onDept(d.id)}>
            <span className={`cat ${catClass(d.cat)}`}>{CATEGORY_META[d.cat].label}</span>
            <h3>{d.name}</h3>
            <p>{mode === 'beginner' ? d.beginner : d.pro}</p>
            <div className="meta">Output: {d.outputs[0]}<br />Equipment: {d.equipment[0]}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

export function WorkflowPanel() {
  const [key, setKey] = useState('dyeing');
  const wf = WORKFLOWS[key];
  return (
    <section id="workflows" className="panel">
      <p className="section-eyebrow">03 — Workflows</p>
      <h2>Standard sequence per department</h2>
      <p className="panel-desc">Typical step order. Actual steps vary by fibre, machine and factory SOP.</p>
      <div className="wf-layout">
        <div className="wf-tabs" role="tablist" aria-label="Workflow selector">
          {Object.keys(WORKFLOWS).map((k) => (
            <button key={k} role="tab" className={k === key ? 'active' : ''} onClick={() => setKey(k)}>
              {deptById(k).short}
            </button>
          ))}
        </div>
        <div className="wf-body">
          <ol className="wf-steps">
            {wf.steps.map((s, i) => (
              <li key={i} data-n={i + 1} className={/PASS|FAIL|—/.test(s[0]) ? 'decision' : ''}>
                <div><b>{s[0]}</b><small>{s[1]}</small></div>
              </li>
            ))}
          </ol>
          <div className="wf-meta"><b>Note:</b> {wf.meta}<br />
            <span className="muted small">Process may vary according to fibre, fabric construction, dye class, machine, customer requirement and factory SOP.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
