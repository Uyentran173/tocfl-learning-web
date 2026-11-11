import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { mergeGuestProgressValue } from '../lib/progress-merge.ts';

const root = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(readFileSync(path.join(root, 'data/academy/cc1-audio-manifest.json'), 'utf8'));
const report = JSON.parse(readFileSync(path.join(root, 'data/academy/cc1-mapping-report.json'), 'utf8'));

test('CC1 metadata preserves distinct textbook and workbook tracks across all lessons', () => {
  assert.equal(manifest.tracks.length, 222);
  assert.equal(manifest.tracks.filter((track) => track.source === 'textbook').length, 141);
  assert.equal(manifest.tracks.filter((track) => track.source === 'workbook').length, 81);
  assert.equal(new Set(manifest.tracks.map((track) => track.id)).size, 222);
  for (const source of ['textbook', 'workbook']) {
    assert.deepEqual(new Set(manifest.tracks.filter((track) => track.source === source && track.lesson !== null).map((track) => track.lesson)), new Set(Array.from({ length: 15 }, (_, i) => i + 1)));
    const unassigned = manifest.tracks.find((track) => track.id === `cc1-${source}-unassigned-00`);
    assert.equal(unassigned.lesson, null);
    assert.equal(unassigned.mappingStatus, 'pending');
  }
});

test('Verified textbook core tracks retain their printed lesson reference and page', () => {
  const verified = manifest.tracks.filter((track) => track.mappingStatus === 'verified');
  assert.equal(verified.length, 140);
  assert.equal(verified.filter((track) => track.source === 'textbook').length, 60);
  assert.equal(verified.filter((track) => track.source === 'workbook').length, 80);
  for (const track of verified) {
    assert.match(track.activity.referenceCode, new RegExp(`^${String(track.lesson).padStart(2, '0')}-[1-6]$`));
    assert.ok(track.activity.pdfPage > 0);
    assert.ok(track.activity.bookPage > 0);
  }
  for (let lesson = 2; lesson <= 15; lesson++) {
    const core = verified.filter((track) => track.source === 'textbook' && track.lesson === lesson);
    assert.deepEqual(core.map((track) => track.number), [1, 2, 3, 4]);
    assert.deepEqual(core.map((track) => track.activity.labelVi), ['Đối thoại 1', 'Từ vựng 1', 'Đối thoại 2', 'Từ vựng 2']);
    const workbook = manifest.tracks.filter((track) => track.source === 'workbook' && track.lesson === lesson);
    assert.ok(workbook.length >= 5);
    assert.ok(workbook.every((track) => track.mappingStatus === 'verified'));
  }
  assert.equal(verified.find((track) => track.id === 'cc1-textbook-l01-t01').activity.bookPage, 2);
  assert.equal(verified.find((track) => track.id === 'cc1-workbook-l01-t05').activity.itemCount, 5);
  assert.deepEqual(manifest.tracks.filter((track) => track.source === 'textbook' && track.lesson === 1 && track.mappingStatus === 'pending').map((track) => track.originalName), ['01-05.mp3', '01-06.mp3', '01-07.mp3', '01-08.mp3', '01-09.mp3', '01-10.mp3']);
  assert.equal(report.pendingIds.length, 82);
  assert.deepEqual(report.verifiedBySource, { textbook: 60, workbook: 80 });
  assert.equal(report.audioMetadataValidated, 222);
});

test('Only verified tracks are published; staged files match manifest when available locally', () => {
  for (const track of manifest.tracks) {
    const publicFile = path.join(root, 'public/academy/cc1/audio', `${track.id}.mp3`);
    assert.equal(existsSync(publicFile), track.mappingStatus === 'verified', track.id);
    if (track.mappingStatus === 'verified') {
      const data = readFileSync(publicFile);
      assert.equal(data.byteLength, track.bytes, track.id);
      assert.equal(createHash('sha256').update(data).digest('hex'), track.sha256, track.id);
    }
  }
  const staged = path.join(root, '.private/academy/cc1');
  if (!existsSync(staged)) return;
  for (const track of manifest.tracks) {
    const file = path.join(staged, track.privatePath);
    assert.equal(existsSync(file), true, track.id);
    const data = readFileSync(file);
    assert.equal(data.byteLength, track.bytes, track.id);
    assert.equal(createHash('sha256').update(data).digest('hex'), track.sha256, track.id);
  }
});

test('Guest lesson progress merges by stable track ID without discarding conflicting notes', () => {
  const key = 'taiwen-academy:v1:cc1:l01';
  const account = JSON.stringify({ version: 1, selectedTrackId: 'cc1-textbook-l01-t01', listenedIds: ['cc1-textbook-l01-t01'], completedIds: [], responses: { 'cc1-workbook-l01-t02:1': 'B' } });
  const guest = JSON.stringify({ version: 1, selectedTrackId: 'cc1-workbook-l01-t02', listenedIds: ['cc1-workbook-l01-t02'], completedIds: ['cc1-workbook-l01-t02'], responses: { 'cc1-workbook-l01-t02:1': 'A', 'cc1-workbook-l01-t02:2': 'C' } });
  const merged = JSON.parse(mergeGuestProgressValue(key, account, guest));
  assert.deepEqual(new Set(merged.listenedIds), new Set(['cc1-textbook-l01-t01', 'cc1-workbook-l01-t02']));
  assert.deepEqual(merged.completedIds, ['cc1-workbook-l01-t02']);
  assert.equal(merged.responses['cc1-workbook-l01-t02:1'], 'B');
  assert.equal(merged.responses['cc1-workbook-l01-t02:2'], 'C');
  assert.equal(merged.guestResponses['cc1-workbook-l01-t02:1'], 'A');
  assert.deepEqual(JSON.parse(mergeGuestProgressValue(key, JSON.stringify(merged), guest)), merged);
});

test('Academy activity progress resumes by stable activity ID and preserves guest answer conflicts', () => {
  const key = 'taiwen-activity:v1:academy:cc1-v1-l01';
  const account = JSON.stringify({ version: 1, currentActivityId: 'cc1-v1-l01-grammar', completedActivityIds: ['cc1-v1-l01-lecture'], answers: { 'cc1-v1-l01-practice-01': 'b' }, guestAnswers: {} });
  const guest = JSON.stringify({ version: 1, currentActivityId: 'cc1-v1-l01-vocabulary', completedActivityIds: ['cc1-v1-l01-vocabulary'], answers: { 'cc1-v1-l01-practice-01': 'a', 'cc1-v1-l01-assessment-01': 'b' }, guestAnswers: {} });
  const merged = JSON.parse(mergeGuestProgressValue(key, account, guest));
  assert.equal(merged.currentActivityId, 'cc1-v1-l01-grammar');
  assert.deepEqual(new Set(merged.completedActivityIds), new Set(['cc1-v1-l01-lecture', 'cc1-v1-l01-vocabulary']));
  assert.equal(merged.answers['cc1-v1-l01-practice-01'], 'b');
  assert.equal(merged.answers['cc1-v1-l01-assessment-01'], 'b');
  assert.equal(merged.guestAnswers['cc1-v1-l01-practice-01'], 'a');
  assert.deepEqual(JSON.parse(mergeGuestProgressValue(key, JSON.stringify(merged), guest)), merged);
});
