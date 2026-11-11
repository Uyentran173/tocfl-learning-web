import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const source = JSON.parse(readFileSync(path.join(root, 'data/academy/cc1-source-content.json'), 'utf8'));
const audio = JSON.parse(readFileSync(path.join(root, 'data/academy/cc1-audio-manifest.json'), 'utf8'));
const dialogues = JSON.parse(readFileSync(path.join(root, 'data/academy/cc1-dialogues.json'), 'utf8'));
const vocabulary = JSON.parse(readFileSync(path.join(root, 'data/academy/cc1-vocabulary.json'), 'utf8'));
const grammar = JSON.parse(readFileSync(path.join(root, 'data/academy/cc1-grammar-outline.json'), 'utf8'));
const grammarLessons = JSON.parse(readFileSync(path.join(root, 'data/academy/cc1-grammar.json'), 'utf8'));
const learningLessons = JSON.parse(readFileSync(path.join(root, 'data/academy/cc1-lessons.json'), 'utf8'));
const reviewedTracks = JSON.parse(readFileSync(path.join(root, 'data/academy/cc1-reviewed-content.json'), 'utf8'));

test('Academy script switch renders reviewed CC1 variants and grammar choices correctly', async () => {
  const { academyScriptText } = await import('../lib/academy-script.ts');
  for (const lesson of dialogues.lessons) {
    for (const dialogue of lesson.dialogues) {
      for (const turn of dialogue.turns) {
        assert.equal(academyScriptText(turn.traditional, 'simplified'), turn.simplified, `${lesson.lessonId}: ${turn.traditional}`);
      }
    }
  }
  for (const lesson of vocabulary.lessons) {
    for (const word of lesson.records) {
      assert.equal(academyScriptText(word.traditional, 'simplified'), word.simplified, word.id);
      assert.equal(academyScriptText(word.exampleTraditional, 'simplified'), word.exampleSimplified, `${word.id}: example`);
    }
  }
  for (const lesson of grammarLessons.lessons) {
    for (const point of lesson.points) {
      for (const example of point.examples) {
        assert.equal(academyScriptText(example.chinese, 'simplified'), example.simplified, `${point.id}: example`);
      }
    }
  }
});

test('CC1 Lessons 02–15 retain separate, ordered source content', () => {
  assert.equal(source.publication, 'source-only');
  assert.equal(source.lessons.length, 14);
  assert.deepEqual(source.lessons.map((lesson) => lesson.number), Array.from({ length: 14 }, (_, index) => index + 2));
  const ids = new Set();
  let turns = 0;
  let words = 0;
  for (const lesson of source.lessons) {
    assert.equal(lesson.id, `cc1-v1-l${String(lesson.number).padStart(2, '0')}`);
    assert.equal(lesson.dialogues.length, 2);
    assert.ok(lesson.traditionalTitle);
    for (const dialogue of lesson.dialogues) {
      assert.ok(dialogue.turns.length >= 2);
      for (const turn of dialogue.turns) {
        assert.ok(turn.speaker && turn.traditional);
        turns += 1;
      }
    }
    for (const word of lesson.vocabulary) {
      assert.ok(word.traditional && word.id.startsWith(lesson.id));
      assert.ok(!ids.has(word.id), `duplicate vocabulary id: ${word.id}`);
      ids.add(word.id);
      words += 1;
    }
  }
  assert.equal(turns, 284);
  assert.equal(words, 524);
});

test('grammar outlines stay tied to the correct textbook lesson pages', () => {
  assert.equal(grammar.publication, 'outline');
  assert.equal(grammar.lessons.length, 14);
  const ids = new Set();
  let count = 0;
  for (let index = 0; index < source.lessons.length; index += 1) {
    const lesson = source.lessons[index];
    const nextStart = source.lessons[index + 1]?.sourcePdfStartPage ?? 400;
    const outline = grammar.lessons[index];
    assert.equal(outline.lessonId, lesson.id);
    assert.ok(outline.points.length >= 4);
    for (const point of outline.points) {
      assert.ok(!ids.has(point.id));
      ids.add(point.id);
      assert.ok(point.titleVi);
      assert.ok(point.sourcePdfPage >= lesson.sourcePdfStartPage && point.sourcePdfPage < nextStart);
      count += 1;
    }
  }
  assert.equal(count, 68);
});

test('each source grammar point has teaching content, examples, and a valid check', () => {
  assert.equal(grammarLessons.lessons.length, 14);
  let points = 0;
  for (let index = 0; index < grammar.lessons.length; index += 1) {
    const outline = grammar.lessons[index];
    const authored = grammarLessons.lessons[index];
    assert.equal(authored.lessonId, outline.lessonId);
    assert.equal(authored.points.length, outline.points.length);
    for (let position = 0; position < outline.points.length; position += 1) {
      const point = authored.points[position];
      assert.equal(point.id, outline.points[position].id);
      assert.equal(point.sourcePdfPage, outline.points[position].sourcePdfPage);
      assert.ok(point.explanation.length > 80 && point.commonMistake.length > 20 && point.structure);
      assert.ok(point.examples.length >= 2);
      assert.ok(point.examples.every((example) => example.chinese && example.simplified && example.pinyin && example.meaningVi));
      assert.ok(point.check.options.some((option) => option.id === point.check.correctOptionId));
      points += 1;
    }
  }
  assert.equal(points, 68);
});

test('Chinese dialogue and vocabulary enrichment aligns with original lesson material', () => {
  assert.equal(dialogues.lessons.length, 14);
  assert.equal(vocabulary.lessons.length, 14);
  let reusedVocabulary = 0;
  for (let index = 0; index < source.lessons.length; index += 1) {
    const original = source.lessons[index];
    const dialogue = dialogues.lessons[index];
    const words = vocabulary.lessons[index];
    assert.equal(dialogue.lessonId, original.id);
    assert.equal(words.lessonId, original.id);
    assert.equal(dialogue.dialogues.length, original.dialogues.length);
    for (let group = 0; group < original.dialogues.length; group += 1) {
      assert.deepEqual(dialogue.dialogues[group].turns.map((turn) => [turn.speaker, turn.traditional]), original.dialogues[group].turns.map((turn) => [turn.speaker, turn.traditional]));
      assert.ok(dialogue.dialogues[group].turns.every((turn) => turn.simplified && turn.pinyin && turn.meaningVi));
    }
    assert.deepEqual(words.records.map((word) => [word.id, word.traditional]), original.vocabulary.map((word) => [word.id, word.traditional]));
    for (const word of words.records) {
      assert.ok(word.simplified && word.pinyin && word.meaningVi && word.exampleTraditional && word.exampleSimplified && word.exampleVi, `incomplete word ${word.id}`);
      if (word.canonicalVocabularyId.startsWith('tocfl-')) reusedVocabulary += 1;
    }
  }
  assert.equal(reusedVocabulary, 377);
});

test('verified audio references resolve to published, nonempty lesson tracks', () => {
  const tracks = new Map(audio.tracks.map((track) => [track.id, track]));
  let count = 0;
  for (const lesson of source.lessons) {
    assert.ok(lesson.verifiedAudioTrackIds.length >= 4);
    for (const id of lesson.verifiedAudioTrackIds) {
      const track = tracks.get(id);
      assert.ok(track, `missing manifest track: ${id}`);
      assert.equal(track.lesson, lesson.number);
      assert.equal(track.mappingStatus, 'verified');
      const file = path.join(root, 'public/academy/cc1/audio', `${id}.mp3`);
      assert.ok(existsSync(file), `missing public audio: ${id}`);
      assert.ok(statSync(file).size > 1024, `empty public audio: ${id}`);
      count += 1;
    }
  }
  assert.equal(count, 131);
});

test('all fourteen lessons have distinct, answerable learning activities and verified dialogue audio', async () => {
  const { validateAcademyLessonContent } = await import('../lib/academy-catalog.ts');
  assert.equal(learningLessons.lessons.length, 14);
  for (let index = 0; index < source.lessons.length; index += 1) {
    const original = source.lessons[index];
    const lesson = learningLessons.lessons[index];
    assert.equal(lesson.id, original.id);
    assert.equal(validateAcademyLessonContent(lesson), true, `invalid lesson ${lesson.id}`);
    assert.deepEqual(lesson.vocabulary.wordIds, original.vocabulary.map((word) => word.id));
    assert.deepEqual(lesson.lecture.dialogues.map((dialogue) => dialogue.turns.map((turn) => turn.chinese)), original.dialogues.map((dialogue) => dialogue.turns.map((turn) => turn.traditional)));
    assert.equal(lesson.listening.length, 4);
    assert.equal(lesson.practice.length, 12);
    assert.equal(lesson.assessment.length, 12);
    const practicePrompts = new Set(lesson.practice.map((question) => `${question.prompt}|${question.passage ?? ''}`));
    assert.ok(lesson.assessment.every((question) => !practicePrompts.has(`${question.prompt}|${question.passage ?? ''}`)), `assessment repeats practice in ${lesson.id}`);
    const allQuestions = [...lesson.lecture.checks, ...lesson.grammar.map((point) => point.check), ...lesson.listening, ...lesson.practice, ...lesson.assessment];
    assert.equal(new Set(allQuestions.map((question) => question.id)).size, allQuestions.length, `duplicate question in ${lesson.id}`);
    for (const question of allQuestions) {
      assert.ok(question.options.some((option) => option.id === question.correctOptionId), question.id);
      assert.equal(new Set(question.options.map((option) => option.text)).size, question.options.length, `duplicate option in ${question.id}`);
      if (question.audioTrackId) {
        assert.ok(original.verifiedAudioTrackIds.includes(question.audioTrackId), `wrong lesson audio: ${question.id}`);
        assert.ok(reviewedTracks[question.audioTrackId]?.transcriptTraditional, `missing reviewed transcript: ${question.id}`);
      }
    }
  }
});

test('reviewed dialogue transcripts follow the correct audio track and preserve both scripts', () => {
  assert.equal(Object.keys(reviewedTracks).length, 28);
  for (const lesson of dialogues.lessons) {
    for (let index = 0; index < lesson.dialogues.length; index += 1) {
      const id = `cc1-textbook-${lesson.lessonId.slice(-3)}-t${index === 0 ? '01' : '03'}`;
      const review = reviewedTracks[id];
      const turns = lesson.dialogues[index].turns;
      assert.equal(review?.transcriptTraditional, turns.map((turn) => `${turn.speaker}：${turn.traditional}`).join('\n'));
      assert.equal(review?.transcriptSimplified, turns.map((turn) => `${turn.speaker}：${turn.simplified}`).join('\n'));
      assert.equal(review?.translationVi, turns.map((turn) => `${turn.speaker}: ${turn.meaningVi}`).join('\n'));
    }
  }
});
