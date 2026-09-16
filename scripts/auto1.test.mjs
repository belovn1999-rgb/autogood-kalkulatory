import test from 'node:test';
import assert from 'node:assert/strict';
import { tokenize, moveRecord, serialize } from '../src/auto1-engine.mjs';
import { textRows, validateOutputText, makeCover } from '../src/auto1-rules.mjs';

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

// Real coordinates from an AUTO1 report where the field list ran the "Car
// location" label to the very bottom of page 1, pushing its value onto page
// 2, and where the (long) car name is centred left of the value column.
test('a cover survives a location value that overflows onto the next page, and a long centred title', () => {
  const BASE_WIDTH = 594.96, BASE_HEIGHT = 841.92;
  const wordItem = (str, x, y, width, height) => ({ str, width, height, transform: [1, 0, 0, 1, x, y] });
  const page0Rows = textRows({ items: [
    wordItem('Build', 262.8, 562.2, 26.6, 11.25), wordItem('year', 293.5, 562.2, 21.9, 11.25), wordItem(':', 314.6, 562.2, 4.9, 11.25),
    wordItem('2018', 426.0, 562.2, 25.7, 11.25),
    wordItem('Opel', 219.7, 761.7, 33.6, 16.5), wordItem('Insignia', 261.4, 761.7, 58.1, 16.5), wordItem('Grand', 327.6, 761.7, 45.9, 16.5),
    wordItem('Sport', 381.3, 761.7, 39.4, 16.5), wordItem('2.0', 428.6, 761.7, 19.8, 16.5), wordItem('CDTI', 456.3, 761.7, 33.2, 16.5), wordItem('Exclusive', 497.5, 761.7, 65.7, 16.5),
    wordItem('Car', 259.0, 29.7, 15.6, 10.5), wordItem('location', 280.1, 29.7, 44.2, 10.5),
  ] });
  const page1Rows = textRows({ items: [wordItem('DE,', 259.0, 816.4, 15.4, 10.5), wordItem('Hemau', 277.9, 816.4, 40.1, 10.5)] });
  const models = [
    { records: [{ kind: 'image', box: [10, 100, 300, 700] }], resources: {}, width: BASE_WIDTH, height: BASE_HEIGHT },
    { records: [], resources: {}, width: BASE_WIDTH, height: BASE_HEIGHT },
  ];
  const data = [{ rows: page0Rows }, { rows: page1Rows }];
  const cover = makeCover(models, data, 'Opel Insignia Grand Sport 2.0 CDTI Exclusive');
  assert.deepEqual(cover.locationContinuation.map((c) => c.pageIndex), [1]);
  assert.deepEqual(cover.requiredRows.filter((t) => t === 'Hemau'), ['Hemau']);
  assert.ok(cover.requiredRows.includes('Opel'), 'long centred title must still be recognised');
});
