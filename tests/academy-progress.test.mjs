import test from 'node:test';
import assert from 'node:assert/strict';
import {
  academyProgressKeyForLesson,
  emptyAcademyProgressForLesson,
  parseAcademyLessonProgress,
} from '../lib/academy-progress.ts';

test('academy progress is isolated by stable lesson ID', () => {
  const first = 'cc1-v1-l01';
  const second = 'cc1-v1-l02';
  assert.notEqual(academyProgressKeyForLesson(first), academyProgressKeyForLesson(second));
  assert.equal(emptyAcademyProgressForLesson(second).currentActivityId, 'cc1-v1-l02-lecture');
  const saved = JSON.stringify({
    version: 1,
    currentActivityId: 'cc1-v1-l01-grammar',
    completedActivityIds: ['cc1-v1-l01-vocabulary', 'cc1-v1-l02-lecture'],
    answers: { 'cc1-v1-l01-assessment-01': 'b' },
    script: 'simplified',
  });
  const parsed = parseAcademyLessonProgress(saved, second);
  assert.equal(parsed.currentActivityId, 'cc1-v1-l02-lecture');
  assert.deepEqual(parsed.completedActivityIds, ['cc1-v1-l02-lecture']);
  assert.equal(parsed.script, 'simplified');
});

test('listening completion and resume remain attached to the same lesson', () => {
  const lessonId = 'cc1-v1-l08';
  const saved = JSON.stringify({ version: 1, currentActivityId: `${lessonId}-listening`, completedActivityIds: [`${lessonId}-lecture`, `${lessonId}-listening`, 'cc1-v1-l09-listening'], answers: { [`${lessonId}-listening-1-1`]: 'c' }, script: 'traditional' });
  const parsed = parseAcademyLessonProgress(saved, lessonId);
  assert.equal(parsed.currentActivityId, `${lessonId}-listening`);
  assert.deepEqual(parsed.completedActivityIds, [`${lessonId}-lecture`, `${lessonId}-listening`]);
  assert.equal(parsed.answers[`${lessonId}-listening-1-1`], 'c');
});
