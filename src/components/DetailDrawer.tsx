import { CATEGORY_META, deptById } from '../data/departments';
import { CONNECTIONS } from '../data/connections';
import { FLOW_STYLE } from './flowStyle';
import type { Mode } from '../data/types';

export type Selection = { kind: 'dept'; id: string } | { kind: 'conn'; index: number } | null;

interface Props {
  sel: Selection;
  mode: Mode;
  onClose: () => void;
  onDept: (id: string) => void;
}

export default function DetailDrawer({ sel, mode, onClose, onDept }: Props) {
  if (!sel) return null;
  let body: React.ReactNode = null;

  if (sel.kind === 'dept') {
    const d = deptById(sel.id);
    const desc = mode === 'beginner' ? d.beginner : d.pro;
    const conns = CONNECTIONS.map((c, i) => ({ c, i })).filter(({ c }) => c.from === d.id || c.to === d.id);
    body = (
      <>
        <span className="tag" style={{ background: CATEGORY_META[d.cat].color }}>{CATEGORY_META[d.cat].label}</span>
        <h2>{d.icon} {d.name}</h2>
        <p>{desc}</p>
        {mode === 'beginner'
          ? <p className="muted small">Professional detail available — switch to <b>Professional</b> mode (top right).</p>
          : <p className="muted small">Beginner summary: {d.beginner}</p>}
        <h4>Inputs → Outputs</h4>
        <ul><li><b>In:</b> {d.inputs.join('; ')}</li><li><b>Out:</b> {d.outputs.join('; ')}</li></ul>
        <h4>Main responsibilities</h4>
        <ul>{d.responsibilities.map((x) => <li key={x}>{x}</li>)}</ul>
        <h4>Key process</h4>
        <p className="muted">{d.processes.join(' · ')}</p>
        <h4>Machines / equipment</h4>
        <ul>{d.equipment.map((x) => <li key={x}>{x}</li>)}</ul>
        <h4>Key parameters</h4>
        <p>{d.params.map((p) => <code key={p}>{p} </code>)}</p>
        <h4>Common problems</h4>
        <ul>{d.problems.map((x) => <li key={x}>{x}</li>)}</ul>
        <h4>Connected departments ({conns.length})</h4>
        <ul>{conns.map(({ c, i }) => {
          const o = c.from === d.id ? c.to : c.from;
          const dir = c.from === d.id ? '→' : '←';
          return <li key={i}><b>{dir} {deptById(o).short}</b> <span className="muted">[{c.type}] {c.label}</span></li>;
        })}</ul>
      </>
    );
  } else {
    const c = CONNECTIONS[sel.index];
    const f = deptById(c.from);
    const t = deptById(c.to);
    body = (
      <>
        <span className="tag" style={{ background: FLOW_STYLE[c.type].color }}>{c.type.toUpperCase()} FLOW</span>
        <h2>{f.short} → {t.short}</h2>
        <p className="muted">{c.label}</p>
        <h4>What is transferred?</h4>
        <ul>{c.what.map((x) => <li key={x}>{x}</li>)}</ul>
        <h4>Why?</h4><p>{c.why}</p>
        <h4>Next step</h4><p>{c.next}</p>
        <p>
          <button className="btn small" onClick={() => onDept(t.id)}>Open {t.short} →</button>
        </p>
      </>
    );
  }

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <aside className="drawer" aria-label="Detail panel">
        <button className="drawer-close" onClick={onClose} aria-label="Close panel">✕</button>
        {body}
      </aside>
    </>
  );
}
