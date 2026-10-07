import { useMemo, useState } from 'react';
import ProcessMap, { type LayerVisibility } from './components/ProcessMap';
import DetailDrawer, { type Selection } from './components/DetailDrawer';
import { DeptGrid, WorkflowPanel } from './components/Departments';
import { BatchTracker, TroublePanel } from './components/Operations';
import { CalcGrid, GlossaryGrid } from './components/Tools';
import { DEPARTMENTS, deptById } from './data/departments';
import { CONNECTIONS } from './data/connections';
import { BATCHES, GLOSSARY } from './data/content';
import type { Mode } from './data/types';

interface Hit {
  title: string;
  sub: string;
  run: () => void;
}

export default function App() {
  const [mode, setMode] = useState<Mode>('beginner');
  const [visible, setVisible] = useState<LayerVisibility>({ material: true, info: true, support: true, feedback: true });
  const [sel, setSel] = useState<Selection>(null);
  const [query, setQuery] = useState('');
  const [glossFilter, setGlossFilter] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(''), 2200);
  };

  const toggle = (k: keyof LayerVisibility) => setVisible((v) => ({ ...v, [k]: !v[k] }));

  const openDept = (id: string) => {
    try { deptById(id); setSel({ kind: 'dept', id }); } catch { /* noop */ }
  };

  const hits: Hit[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: Hit[] = [];
    DEPARTMENTS.forEach((d) =>
      (d.name + ' ' + d.short).toLowerCase().includes(q) &&
      out.push({ title: `${d.icon} ${d.name}`, sub: 'Department — click to open', run: () => openDept(d.id) }));
    GLOSSARY.forEach(([t, , , w]) =>
      (t + ' ' + w).toLowerCase().includes(q) &&
      out.push({ title: t, sub: `Glossary — ${w}`, run: () => {
        setGlossFilter(t);
        document.getElementById('glossary')?.scrollIntoView({ behavior: 'smooth' });
      } }));
    CONNECTIONS.forEach((c, i) =>
      (`${c.label} ${c.what.join(' ')}`).toLowerCase().includes(q) &&
      out.push({ title: `${deptById(c.from).short} → ${deptById(c.to).short}: ${c.label}`, sub: `${c.type} flow`, run: () => setSel({ kind: 'conn', index: i }) }));
    Object.entries(BATCHES).forEach(([id, b]) =>
      (`${id} ${b.fabric} ${b.colour}`).toLowerCase().includes(q) &&
      out.push({ title: `Batch ${id} — ${b.fabric}`, sub: 'Follow-a-batch demo', run: () => {
        document.getElementById('batch')?.scrollIntoView({ behavior: 'smooth' });
      } }));
    return out.slice(0, 8);
  }, [query]);

  const setModeAndToast = (m: Mode) => {
    setMode(m);
    showToast(m === 'beginner' ? 'Beginner mode: simplified wording' : 'Professional mode: full technical detail');
  };

  const scrollTo = (hash: string) => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      <a className="skip-link" href="#main">Skip to main content</a>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">TF</div>
            <div>
              <div className="brand-title">TexFlow · Dyeing Unit</div>
              <div className="brand-sub">Interactive training guide</div>
            </div>
          </div>
          <nav className="topnav" aria-label="Primary">
            <a href="#map-section" className="nav-link" onClick={(e) => { e.preventDefault(); scrollTo('#map-section'); }}>Process Map</a>
            <a href="#departments" className="nav-link" onClick={(e) => { e.preventDefault(); scrollTo('#departments'); }}>Departments</a>
            <a href="#batch" className="nav-link" onClick={(e) => { e.preventDefault(); scrollTo('#batch'); }}>Batches</a>
            <a href="#calc" className="nav-link" onClick={(e) => { e.preventDefault(); scrollTo('#calc'); }}>Tools</a>
          </nav>
          <div className="topbar-controls">
            <div className="search-wrap">
              <input type="search" placeholder="Search GSM, steam, recipe…" aria-label="Global search"
                value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
              {!!hits.length && (
                <div className="search-results">
                  {hits.map((h, i) => (
                    <button key={i} onClick={() => { h.run(); setQuery(''); }}>
                      <b>{h.title}</b><br /><small>{h.sub}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mode-toggle" role="group" aria-label="Experience mode">
              <button className={`mode-btn${mode === 'beginner' ? ' active' : ''}`} aria-pressed={mode === 'beginner'} onClick={() => setModeAndToast('beginner')}>Beginner</button>
              <button className={`mode-btn${mode === 'pro' ? ' active' : ''}`} aria-pressed={mode === 'pro'} onClick={() => setModeAndToast('pro')}>Professional</button>
            </div>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="hero">
          <div className="hero-text">
            <p className="eyebrow">Dyeing unit · Grey fabric to finished cloth</p>
            <h1>How a textile dyeing unit works, step by step.</h1>
            <p className="lede">Follow grey fabric from store to finished cloth. See who does what, what moves between departments, and where quality decisions are made.</p>
            <ol className="howto">
              <li><b><span className="n">1</span>Explore the map</b>Click a department or arrow to see details.</li>
              <li><b><span className="n">2</span>Open a department</b>Inputs, machines, checks and common issues.</li>
              <li><b><span className="n">3</span>Trace a batch</b>Walk one lot from grey to approval.</li>
            </ol>
            <div className="hero-actions">
              <button className="btn primary" onClick={() => scrollTo('#map-section')}>Start with the process map</button>
              <button className="btn ghost" onClick={() => scrollTo('#batch')}>Follow a sample batch</button>
            </div>
            <p className="disclaimer">Training visualization. Actual routes vary by fibre, machine, dye class and factory SOP.</p>
          </div>
          <div className="hero-side" aria-label="Unit at a glance">
            <h3>Unit at a glance</h3>
            <div className="stat"><span className="stat-n">{DEPARTMENTS.length}</span><span className="stat-l">Departments in this unit</span></div>
            <div className="stat"><span className="stat-n">4</span><span className="stat-l">Flow types: material, information, support, feedback</span></div>
            <div className="stat"><span className="stat-n">{Object.keys(BATCHES).length}</span><span className="stat-l">Sample batches to trace</span></div>
            <div className="stat"><span className="stat-n">5</span><span className="stat-l">Shop-floor calculators</span></div>
          </div>
        </section>

        <section id="map-section" className="panel map-panel">
          <div className="panel-head">
            <div>
              <p className="section-eyebrow">01 — Process map</p>
              <h2>Fabric flow through the unit</h2>
              <p className="panel-desc">Grey fabric moves top to bottom. Side departments support it. Click a box for department detail, click an arrow to see what moves across it.</p>
            </div>
            <div className="map-toolbar">
              <label className="flow-toggle"><span className="dot" style={{ background: '#334155' }} /><input type="checkbox" checked={visible.material} onChange={() => toggle('material')} /> Material</label>
              <label className="flow-toggle"><span className="dot" style={{ background: '#2563eb' }} /><input type="checkbox" checked={visible.info} onChange={() => toggle('info')} /> Information</label>
              <label className="flow-toggle"><span className="dot" style={{ background: '#0e7490' }} /><input type="checkbox" checked={visible.support} onChange={() => toggle('support')} /> Support</label>
              <label className="flow-toggle"><span className="dot" style={{ background: '#b91c1c' }} /><input type="checkbox" checked={visible.feedback} onChange={() => toggle('feedback')} /> Feedback</label>
            </div>
          </div>
          <div className="map-layout">
            <ProcessMap visible={visible} onDept={openDept} onConn={(index) => setSel({ kind: 'conn', index })} />
            <aside className="legend" aria-label="Visual legend">
              <h3>How to read the map</h3>
              <ul>
                <li><span className="sw sw-mat" /> Material — fabric moves</li>
                <li><span className="sw sw-info" /> Information — recipe, report</li>
                <li><span className="sw sw-sup" /> Support — utilities, repair</li>
                <li><span className="sw sw-fb" /> Feedback — fail → correction</li>
                <li><span className="sw sw-node" /> Department — click to open</li>
              </ul>
              <div className="cat-key">
                <span className="cat production">Production</span>
                <span className="cat lab">Laboratory</span>
                <span className="cat quality">Quality</span>
                <span className="cat eng">Engineering</span>
                <span className="cat downstream">Downstream</span>
              </div>
            </aside>
          </div>
        </section>

        <DeptGrid mode={mode} onDept={openDept} />
        <WorkflowPanel />
        <BatchTracker />
        <TroublePanel />
        <CalcGrid />
        <GlossaryGrid externalFilter={glossFilter} onClearExternal={() => setGlossFilter('')} />

        <footer className="footer">
          <p><strong>TexFlow</strong> · Dyeing unit training guide. Sections: Spinning · Knitting · Weaving · <strong>Dyeing</strong> · Printing · Garments · Testing.</p>
          <p className="muted small">Content lives in <code>src/data/*</code> — departments, flows, batches and glossary.</p>
        </footer>
      </main>

      <DetailDrawer sel={sel} mode={mode} onClose={() => setSel(null)} onDept={openDept} />
      {glossFilter && (
        <button className="btn small" style={{ position: 'fixed', bottom: 64, left: '50%', transform: 'translateX(-50%)', zIndex: 60 }}
          onClick={() => setGlossFilter('')}>Clear glossary filter ✕</button>
      )}
      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
    </>
  );
}
