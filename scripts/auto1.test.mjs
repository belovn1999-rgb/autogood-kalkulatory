import test from 'node:test';
import assert from 'node:assert/strict';
import { tokenize, moveRecord, serialize } from '../src/auto1-engine.mjs';
import { textRows, validateOutputText, makeCover, planPage } from '../src/auto1-rules.mjs';

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
  { sourcePage: 1, outputPage: 1, requiredRows: ['BMW', 'General', 'General'] },
  { sourcePage: 2, outputPage: null, requiredRows: [] },
  { sourcePage: 3, outputPage: 2, requiredRows: ['Damage summary'] },
] };

test('verification names the source pages that lost text instead of rejecting the file', () => {
  assert.deepEqual(validateOutputText(['BMW General General', 'Damage summary'], report), { lost: [], auction: [] });
  assert.deepEqual(validateOutputText(['BMW General', 'Damage summary'], report).lost, [1]);
  assert.deepEqual(validateOutputText(['BMW General General Damage summary', ''], report).lost, [3]);
  assert.deepEqual(validateOutputText(['BMW General General'], report).lost, [1, 3]);
});

test('surviving auction content marks the page for review, it does not discard the result', () => {
  const check = validateOutputText(['BMW General General Stock number RD123', 'Damage summary'], report);
  assert.deepEqual(check.auction, [1]);
  assert.deepEqual(check.lost, []);
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

// AUTO1 re-wraps the same blocks at different points in every report, so a
// page is judged by what its rows say rather than by where the break landed.
const word = (str, x, y, width = str.length * 5, height = 10.5) => ({ str, width, height, transform: [1, 0, 0, 1, x, y] });
const sheet = (items) => ({ rows: textRows({ items }), text: items.map((item) => item.str).join('\n') });
const model = (records = []) => ({ records, resources: {}, width: 594.96, height: 841.92 });
const rebuiltCover = { records: [], requiredRows: [] };

test('a wrapped and an unwrapped logistics page are both dropped', () => {
  const whole = sheet([word('Enjoy free parking for up to 12 calendar days after the car is moved to a pickup location. Thereafter, a fee of €15 per day applies.', 60, 700, 400)]);
  const tail = sheet([word('location. Thereafter, a fee of €15 per day applies.', 60, 700, 200)]);
  const withSteps = sheet([word('1. Payment of invoices for the car and transport are done', 60, 700, 250), word('Delivery time is shown in working days', 60, 660, 200)]);
  for (const page of [whole, tail, withSteps]) {
    const plan = planPage(2, model(), page, rebuiltCover, 4);
    assert.deepEqual(plan.records, [], `expected ${page.text.slice(0, 20)}... to be dropped`);
    assert.equal(plan.reason, 'auction-block');
  }
});

test('photos on a logistics page survive while the logistics text does not', () => {
  const photo = { kind: 'image', box: [40, 500, 300, 700] };
  const page = sheet([word('Delivery to my address', 60, 300, 120), word('€468', 300, 300, 30)]);
  const plan = planPage(2, model([photo]), page, rebuiltCover, 4);
  assert.deepEqual(plan.records, [photo]);
  assert.deepEqual(plan.requiredRows, []);
});

test('the legal footer is dropped whether AUTO1 prints it as one line or four', () => {
  const spread = sheet([word('Copyright © 2026 Auto1.com', 60, 40, 120), word('Privacy', 260, 40, 40),
    word('Terms and Conditions', 400, 40, 90), word('Imprint', 540, 40, 40)]);
  const joined = sheet([word('Copyright © 2026 Auto1.com Privacy Terms and Conditions Imprint', 60, 40, 400)]);
  for (const page of [spread, joined]) assert.equal(planPage(11, model(), page, rebuiltCover, 4).reason, 'legal-only');
});

test('an unfamiliar page in the report body keeps everything it has', () => {
  const page = sheet([word('SOMETHING AUTO1 HAS NEVER PRINTED BEFORE', 60, 700, 250)]);
  const records = [{ kind: 'text', anchor: [60, 700], box: [60, 700, 310, 710], style: {} }];
  const plan = planPage(6, model(records), page, rebuiltCover, 4);
  assert.deepEqual(plan.records, records);
  assert.ok(plan.requiredRows.includes('SOMETHING AUTO1 HAS NEVER PRINTED BEFORE'), 'unknown text must be required to survive');
});
