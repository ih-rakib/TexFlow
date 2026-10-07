import { useState } from 'react';
import { DEPARTMENTS, CATEGORY_META, deptById } from '../data/departments';
import { CONNECTIONS } from '../data/connections';
import type { FlowType } from '../data/types';

export interface LayerVisibility {
  material: boolean;
  info: boolean;
  support: boolean;
  feedback: boolean;
}

interface Props {
  visible: LayerVisibility;
  onDept: (id: string) => void;
  onConn: (index: number) => void;
}

const FLOW_STYLE: Record<FlowType, { w: number; dash: string; marker: string; color: string }> = {
  material: { w: 3.6, dash: '', marker: 'arrMat', color: '#334155' },
  info: { w: 2.4, dash: '7 5', marker: 'arrInfo', color: '#2563eb' },
  support: { w: 2.4, dash: '2 4', marker: 'arrSup', color: '#0e7490' },
  feedback: { w: 2.4, dash: '8 5', marker: 'arrFb', color: '#b91c1c' },
};

function edgeGeom(from: string, to: string, type?: string) {
  const A = deptById(from).pos;
  const B = deptById(to).pos;
  const ax = A.x + A.w / 2;
  const ay = A.y + A.h / 2;
  const bx = B.x + B.w / 2;
  const by = B.y + B.h / 2;
  const dx = bx - ax;
  const dy = by - ay;
  let x1 = ax;
  let y1 = ay;
  let x2 = bx;
  let y2 = by;
  if (Math.abs(dx) > Math.abs(dy)) {
    x1 = ax + Math.sign(dx) * (A.w / 2);
    y1 = ay + dy * 0.15;
    x2 = bx - Math.sign(dx) * (B.w / 2);
    y2 = by - dy * 0.1;
  } else {
    y1 = ay + Math.sign(dy) * (A.h / 2);
    x1 = ax + dx * 0.1;
    y2 = by - Math.sign(dy) * (B.h / 2);
    x2 = bx - dx * 0.1;
  }
  // Long vertical feedback that would cut through a department box
  // is rerouted via the right gutter so the line never crosses a node.
  if (type === 'feedback' && Math.abs(x2 - x1) < 60 && Math.abs(y2 - y1) > 140) {
    const gx = 857;
    const my = (y1 + y2) / 2;
    const d = `M${x1},${y1} L${gx},${y1} L${gx},${y2} L${x2},${y2}`;
    return { d, lx: gx, ly: my };
  }
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const d =
    Math.abs(dx) > Math.abs(dy)
      ? `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`
      : `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`;
  // Place labels beside the line with generous clearance.
  // Vertical edges: pill sits to the right of the line. Others: pill sits above it.
  const vertical = Math.abs(dx) < 60;
  const lx = vertical ? Math.max(x1, x2) + 96 : mx;
  const ly = vertical ? my : my - 18;
  return { d, lx, ly };
}

function labelWidth(label: string) {
  return Math.max(88, label.length * 8.2 + 32);
}

// Small manual nudges for labels whose midpoints would otherwise sit on
// top of each other in the side gutters.
const LABEL_NUDGE: Record<string, [number, number]> = {
  'maintenance->dyeing': [0, 26],
  'quality->chemical-lab': [0, -26],
  'chemical-lab->dyeing': [-16, 0],
  'central-eng->dyeing': [12, -10],
  'chemical-lab->batch': [0, -10],
};

export default function ProcessMap({ visible, onDept, onConn }: Props) {
  const [zoom, setZoom] = useState(1);

  return (
    <div>
      <div className="zoom-group" role="group" aria-label="Map zoom" style={{ marginBottom: 8 }}>
        <button className="btn small" onClick={() => setZoom((z) => Math.min(2.2, +(z + 0.15).toFixed(2)))} aria-label="Zoom in">+</button>
        <button className="btn small" onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.15).toFixed(2)))} aria-label="Zoom out">−</button>
        <button className="btn small" onClick={() => setZoom(1)}>Reset</button>
        <span className="muted small">Zoom {Math.round(zoom * 100)}%</span>
      </div>
      <div className="map-canvas-wrap">
        <svg id="processMap" viewBox="0 0 1280 1180" role="img" aria-label="Interactive dyeing unit process map">
          <defs>
            <marker id="arrMat" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#334155" />
            </marker>
            <marker id="arrInfo" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#2563eb" />
            </marker>
            <marker id="arrSup" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#0e7490" />
            </marker>
            <marker id="arrFb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#b91c1c" />
            </marker>
          </defs>
          <g transform={`translate(640 590) scale(${zoom}) translate(-640 -590)`}>
            {/* Flow lines sit below the department boxes */}
            {(Object.keys(FLOW_STYLE) as FlowType[]).map((t) => (
              <g key={`line-${t}`} style={{ display: visible[t] ? undefined : 'none' }}>
                {CONNECTIONS.map((c, i) => {
                  if (c.type !== t) return null;
                  const s = FLOW_STYLE[c.type];
                  const { d } = edgeGeom(c.from, c.to, c.type);
                  return (
                    <g key={i} className="flow-edge" onClick={(e) => { e.stopPropagation(); onConn(i); }}>
                      <path d={d} stroke={s.color} strokeWidth={s.w + 8} opacity={0} fill="none" />
                      <path d={d} stroke={s.color} strokeWidth={s.w} fill="none"
                        strokeDasharray={s.dash || undefined} markerEnd={`url(#${s.marker})`} opacity={0.95} />
                    </g>
                  );
                })}
              </g>
            ))}
            <g>
              {DEPARTMENTS.map((d) => {
                const { x, y, w, h } = d.pos;
                const col = (CATEGORY_META[d.cat] ?? CATEGORY_META.production).color;
                const stroke = d.central ? '#14365d' : d.decision ? '#b91c1c' : '#c4d0df';
                const fill = d.central ? '#eff4fb' : '#ffffff';
                const sub = (CATEGORY_META[d.cat]?.label ?? '') + (d.central ? ' · CORE' : '') + (d.decision ? ' · GATE' : '');
                return (
                  <g key={d.id} className="dept-node" tabIndex={0} role="button" aria-label={`${d.name} — open details`}
                    onClick={(e) => { e.stopPropagation(); onDept(d.id); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDept(d.id); } }}>
                    <title>{`${d.name} — open details`}</title>
                    <rect x={x} y={y} width={w} height={h} rx={12} fill={fill} stroke={stroke} strokeWidth={d.central ? 2.2 : 1.6} />
                    <rect x={x} y={y} width={w} height={8} rx={4} fill={col} />
                    <text x={x + w / 2} y={y + 38} textAnchor="middle" fontSize={22} fontWeight={700} fill="#14365d">{d.short}</text>
                    <text x={x + w / 2} y={y + 60} textAnchor="middle" fontSize={13} fontWeight={700} letterSpacing={0.6} fill="#5d6b82">
                      {sub.toUpperCase()}
                    </text>
                    <text x={x + w / 2} y={y + h - 16} textAnchor="middle" fontSize={14} fill="#334155">
                      {d.params.slice(0, 2).join('  ·  ')}
                    </text>
                  </g>
                );
              })}
            </g>
            {/* Labels sit above boxes so they are never hidden */}
            {(Object.keys(FLOW_STYLE) as FlowType[]).map((t) => (
              <g key={`label-${t}`} style={{ display: visible[t] ? undefined : 'none' }}>
                {CONNECTIONS.map((c, i) => {
                  if (c.type !== t) return null;
                  const s = FLOW_STYLE[c.type];
                  const g = edgeGeom(c.from, c.to, c.type);
                  const nudge = LABEL_NUDGE[`${c.from}->${c.to}`] ?? [0, 0];
                  const lx = g.lx + nudge[0];
                  const ly = g.ly + nudge[1];
                  const w = labelWidth(c.label);
                  return (
                    <g key={i} className="flow-label" onClick={(e) => { e.stopPropagation(); onConn(i); }}>
                      <title>{`${c.label} — click for details`}</title>
                      <rect x={lx - w / 2} y={ly - 16} width={w} height={32} rx={16} fill="#ffffff" stroke={s.color} strokeWidth={1.8} />
                      <text x={lx} y={ly + 6} textAnchor="middle" fontSize={15} fontWeight={700} fill="#0f172a">{c.label}</text>
                    </g>
                  );
                })}
              </g>
            ))}
          </g>
        </svg>
        <p className="map-hint">Click a box for department detail · click an arrow to see what moves across it.</p>
      </div>
    </div>
  );
}
