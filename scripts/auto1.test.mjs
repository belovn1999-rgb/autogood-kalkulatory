import test from 'node:test';
import assert from 'node:assert/strict';
import { tokenize, moveRecord, serialize } from '../src/auto1-engine.mjs';
import { textRows, validateOutputText } from '../src/auto1-rules.mjs';

test('operator-like text inside strings and arrays remains literal', () => {
  assert.deepEqual(tokenize('% comment\n[(q Q Do) 20 (nested \\(text\\)) <5144>] TJ /Image Do'),
    ['[(q Q Do) 20 (nested \\(text\\)) <5144>]', 'TJ', '/Image', 'Do']);
  assert.throws(() => tokenize('(unfinished'), /Unterminated/);
  assert.throws(() => tokenize('[12 (text)'), /Unterminated/);
});

test('moving a photo moves its clipping path without rewriting its image', () => {
  const source = { kind: 'image', body: '/Photo Do', matrix: [100, 0, 0, 80, 20, 30],
    clips: [{ matrix: [1, 0, 0, 1, 0, 0], path: '20 30 100 80 re', rule: 'W' }], style: {} };
  const moved = moveRecord(source, 12, 15, 0.5, [20, 30]);
  assert.deepEqual(moved.matrix, [50, 0, 0, 40, 32, 45]);
  assert.deepEqual(moved.clips[0].matrix, [0.5, 0, 0, 0.5, 22, 30]);
  assert.equal(moved.body, '/Photo Do');
  assert.deepEqual(source.matrix, [100, 0, 0, 80, 20, 30]);
  assert.match(serialize(moved), /W n/);
});

test('a video timer and location at the same height remain separate columns', () => {
  const item = (str, x, width) => ({ str, width, height: 10, transform: [10, 0, 0, 10, x, 100] });
  const rows = textRows({ items: [item('FR, Ingrandes', 270, 70), item('0:00 / 0:30', 15, 50)] });
  assert.deepEqual(rows.map(r => r.text), ['0:00 / 0:30', 'FR, Ingrandes']);
});

const report = { pages: [
  { outputPage: 1, requiredRows: ['BMW', 'General', 'General'] },
  { outputPage: null, requiredRows: [] },
  { outputPage: 2, requiredRows: ['Damage summary'] },
] };

test('validation detects missing repeated text and text moved to the wrong page', () => {
  assert.doesNotThrow(() => validateOutputText(['BMW General General', 'Damage summary'], report));
  assert.throws(() => validateOutputText(['BMW General', 'Damage summary'], report), /stronie 1/);
  assert.throws(() => validateOutputText(['BMW General General Damage summary', ''], report), /stronie 2/);
  assert.throws(() => validateOutputText(['BMW General General'], report), /liczba stron/);
});

test('an otherwise complete result still fails if auction content survives', () => {
  assert.throws(() => validateOutputText(['BMW General General Stock number RD123', 'Damage summary'], report), /aukcyjne/);
});
