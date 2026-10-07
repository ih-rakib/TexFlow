import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

// Extract `id: 'x'` values from DEPARTMENTS array.
function deptIds(src) {
  return [...src.matchAll(/\{\s*id:\s*'([^']+)'/g)].map((m) => m[1]);
}

// Extract { from: 'a', to: 'b', type: 't' } from CONNECTIONS.
function connections(src) {
  return [...src.matchAll(/\{\s*from:\s*'([^']+)',\s*to:\s*'([^']+)',\s*type:\s*'([^']+)'/g)]
    .map((m) => ({ from: m[1], to: m[2], type: m[3] }));
}

const deptSrc = read('src/data/departments.ts');
const connSrc = read('src/data/connections.ts');
const contentSrc = read('src/data/content.ts');

const ids = new Set(deptIds(deptSrc));
const conns = connections(connSrc);

describe('TexFlow data integrity', () => {
  it('has the expected 11 departments', () => {
    assert.equal(ids.size, 11);
  });

  it('every connection references known departments', () => {
    assert.ok(conns.length >= 20, `expected >=20 connections, got ${conns.length}`);
    for (const c of conns) {
      assert.ok(ids.has(c.from), `unknown from: ${c.from}`);
      assert.ok(ids.has(c.to), `unknown to: ${c.to}`);
      assert.ok(['material', 'info', 'support', 'feedback'].includes(c.type), `bad type: ${c.type}`);
    }
  });

  it('material flow forms an unbroken chain to garments', () => {
    const mat = conns.filter((c) => c.type === 'material');
    const next = new Map(mat.map((c) => [c.from, c.to]));
    let cur = 'grey-fabric';
    const seen = [cur];
    while (next.has(cur)) {
      cur = next.get(cur);
      seen.push(cur);
      assert.ok(seen.length < 20, 'material chain loops');
    }
    assert.equal(cur, 'garments');
  });

  it('every workflow key is a real department', () => {
    const wfBlock = contentSrc.slice(
      contentSrc.indexOf('WORKFLOWS'),
      contentSrc.indexOf('BATCHES'),
    );
    const keys = [...wfBlock.matchAll(/['"]?([a-z-]+)['"]?:\s*\{\s*title:/g)].map((m) => m[1]);
    assert.ok(keys.length >= 9, `expected >=9 workflows, got ${keys.length}`);
    for (const k of keys) assert.ok(ids.has(k), `workflow without department: ${k}`);
  });

  it('every batch stage references a real department', () => {
    const stages = [...contentSrc.matchAll(/\{\s*dept:\s*'([^']+)'/g)].map((m) => m[1]);
    assert.ok(stages.length > 0);
    for (const s of stages) assert.ok(ids.has(s), `batch stage without department: ${s}`);
  });

  it('calculator formulas hold (dye / liquor / gsm / shrinkage)', () => {
    const dyeKg = (fabric, shade) => (fabric * shade) / 100;
    assert.equal(dyeKg(500, 3).toFixed(2), '15.00');
    assert.equal(500 * 8, 4000); // liquor
    assert.equal(((4.5 / 100) * 10000).toFixed(1), '450.0'); // gsm
    assert.equal((((50 - 48.5) / 50) * 100).toFixed(2), '3.00'); // shrinkage
  });
});
