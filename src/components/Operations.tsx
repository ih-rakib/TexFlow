import { useState } from 'react';
import { BATCHES, TROUBLES } from '../data/content';
import { deptById } from '../data/departments';

export function BatchTracker() {
  const ids = Object.keys(BATCHES);
  const [batchId, setBatchId] = useState(ids[0]);
  const [stageIdx, setStageIdx] = useState(0);
  const [traceIdx, setTraceIdx] = useState(BATCHES[ids[0]].trace.length - 1);
  const b = BATCHES[batchId];
  const s = b.stages[Math.min(stageIdx, b.stages.length - 1)];

  const pick = (id: string) => {
    setBatchId(id);
    setStageIdx(0);
    setTraceIdx(BATCHES[id].trace.length - 1);
  };

  return (
    <section id="batch" className="panel">
      <p className="section-eyebrow">04 — Batch walkthrough</p>
      <h2>Follow a sample batch <span className="pill">sample data</span></h2>
      <p className="panel-desc">Pick a batch and step through each stage — department, machine, checks and approvals.</p>
      <div className="batch-controls">
        <label>Sample batch{' '}
          <select value={batchId} onChange={(e) => pick(e.target.value)}>
            {ids.map((id) => (
              <option key={id} value={id}>{id} · {BATCHES[id].fabric} · {BATCHES[id].colour} · {BATCHES[id].order}</option>
            ))}
          </select>
        </label>
        <div className="stepper-nav">
          <button className="btn small" onClick={() => setStageIdx((i) => Math.max(0, i - 1))}>← Prev stage</button>
          <button className="btn small" onClick={() => setStageIdx((i) => Math.min(b.stages.length - 1, i + 1))}>Next stage →</button>
        </div>
      </div>
      <div className="timeline">
        {b.stages.map((st, i) => (
          <button key={i} className={`t-step${i === stageIdx ? ' active' : ''}${i < stageIdx ? ' done' : ''}`} onClick={() => setStageIdx(i)}>
            <b>{st.title}</b><br /><small>{st.status} · {st.date}</small>
          </button>
        ))}
      </div>
      <div className="batch-detail">
        <h3>{s.title} — {b.fabric}</h3>
        <div className="kv">
          <div><b>Batch</b>{batchId} · {b.order}</div>
          <div><b>Department</b>{(() => { try { return deptById(s.dept).name; } catch { return s.dept; } })()}</div>
          <div><b>Status</b>{s.status}</div>
          <div><b>Date</b>{s.date}</div>
          <div><b>Machine / recipe</b>{b.machine} · {b.recipe}</div>
          <div><b>Detail</b>{s.info}</div>
        </div>
        <p className="muted small">Support involved: Chemical Lab (recipe), Maintenance (machine health), Central Engineering (utilities), Physical Lab + Quality (tests &amp; decision).</p>
      </div>
      <h3 className="sub-h">Traceability chain</h3>
      <p className="muted">Move forward and backward. A quality failure traces back to batch → machine → recipe → lab → grey lot.</p>
      <div className="trace-chain">
        {b.trace.map((t, i) => (
          <span key={i} style={{ display: 'contents' }}>
            {i > 0 && <span className="trace-arrow">→</span>}
            <button className={`trace-node${i === traceIdx ? ' active' : ''}`} onClick={() => setTraceIdx(i)}>
              {t[0]}<br /><b>{t[1]}</b>
            </button>
          </span>
        ))}
      </div>
      <div className="trace-detail">
        <b>{b.trace[traceIdx][0]}: {b.trace[traceIdx][1]}</b> — step {traceIdx + 1} of {b.trace.length}.{' '}
        {/FAIL|REWORK/i.test(b.trace[traceIdx][1])
          ? 'Backward trace: Quality → Dyeing machine → Recipe → Chemical Lab → Grey lot.'
          : 'Move forward / backward to audit traceability.'}
      </div>
    </section>
  );
}

export function TroublePanel() {
  const [key, setKey] = useState('shade');
  return (
    <section id="trouble" className="panel">
      <p className="section-eyebrow">05 — Troubleshooting</p>
      <h2>When quality fails, where does it loop back?</h2>
      <p className="panel-desc">Select a failure to see the correction loop step by step.</p>
      <div className="trouble-grid">
        <div className="trouble-tabs" role="tablist" aria-label="Failure scenarios">
          {Object.entries(TROUBLES).map(([k, v]) => (
            <button key={k} role="tab" className={k === key ? 'active' : ''} onClick={() => setKey(k)}>{v.title}</button>
          ))}
        </div>
        <ol className="wf-steps">
          {TROUBLES[key].steps.map((s, i) => (
            <li key={i} data-n={i + 1}><div><b>{s[0]}</b><small>{s[1]}</small></div></li>
          ))}
        </ol>
      </div>
      <div className="compare-box">
        <h3>Maintenance vs Central Engineering</h3>
        <div className="compare-cols">
          <div><h4>Maintenance — machines</h4>
            <ul><li>Preventive &amp; breakdown maintenance</li><li>Repairs, machine availability</li><li>Equipment troubleshooting</li><li>Serves Batch, Dyeing, Finishing, Lab equipment</li></ul>
          </div>
          <div><h4>Central Engineering — utilities</h4>
            <ul><li>Electricity, steam, water, compressed air</li><li>Cooling, boiler utilities, pumps, HVAC</li><li>Energy &amp; utility systems</li><li>Serves the entire dyeing unit</li></ul>
          </div>
        </div>
        <p className="muted small">Responsibilities vary by factory — org structures differ.</p>
      </div>
    </section>
  );
}
