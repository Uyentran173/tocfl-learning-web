import { createSupabaseBrowserClient } from "./supabase/client";
import { accountProgressEntries, accountProgressKey, clearProgressPending, guestProgressEntries, markProgressPending, pendingProgressKeys, progressRevision, setProgressRevision } from "./progress-storage";
import { parseLearnedPool } from "./learned-vocabulary";
import { mergeGuestProgressValue } from "./progress-merge";
import type { PracticeAnnotation } from "./practice-annotations";
import type { ExamSession } from "./session";
import { parsePersonalizedSets, personalizedSetsKey } from "./personalized-sets";

export type ProgressEntry = { key: string; value: string };
export type TestAttemptRow = {
  test_id: string;
  started_at: string;
  mode: string;
  script: string;
  scope: string;
  correct: number;
  total: number;
  earned_points: number;
  max_points: number;
  listening_correct: number | null;
  reading_correct: number | null;
  completed_at: string;
};

const mergedKey = (userId: string) => `taiwen-guest-merged:v1:${userId}`;
export class ProgressConflictError extends Error {
  constructor(readonly storageKey: string) { super("Progress was changed on another device."); }
}
const safeParse = (value: string): unknown => { try { return JSON.parse(value); } catch { return null; } };
function progressCategory(key: string) {
  if (key === "tocfl-learned-vocabulary-v2") return "vocabulary";
  if (key.startsWith("tocfl-exam-v3:")) return "test";
  if (key.startsWith("tocfl-practice-annotations:v1:")) return "annotation";
  if (key.startsWith("taiwen-activity:v1:") || key.startsWith("taiwen-academy:v1:")) return "activity";
  return "vocabulary_progress";
}

function bandForTestId(testId: string): string | null {
  if (testId.startsWith("novice-test-")) return "novice";
  const match = /^band-([abc])-test-/.exec(testId);
  return match ? match[1].toUpperCase() : null;
}

async function materializeEntry(userId: string, key: string, value: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase chưa được cấu hình.");
  const parsed = safeParse(value);
  if (key === personalizedSetsKey) {
    const sets = parsePersonalizedSets(parsed);
    const { data: existing, error: listError } = await supabase.from("personalized_vocabulary_sets").select("set_id").eq("user_id", userId);
    if (listError) throw listError;
    const retained = new Set(sets.map((item) => item.id));
    const stale = (existing ?? []).map((item: { set_id: string }) => item.set_id).filter((id: string) => !retained.has(id));
    if (stale.length) {
      const { error: deleteError } = await supabase.from("personalized_vocabulary_sets").delete().eq("user_id", userId).in("set_id", stale);
      if (deleteError) throw deleteError;
    }
    if (sets.length) {
      const { error } = await supabase.from("personalized_vocabulary_sets").upsert(sets.map((item) => ({
        user_id: userId, set_id: item.id, config: item.options, words: item.result.words,
        created_at: item.savedAt, updated_at: new Date().toISOString(),
      })), { onConflict: "user_id,set_id" });
      if (error) throw error;
    }
  } else if (key === "tocfl-learned-vocabulary-v2") {
    const pool = parseLearnedPool(parsed);
    const rows = [
      ...pool.words.map((word) => ({ user_id: userId, vocabulary_id: word.vocabularyId, source_record_id: word.sourceRecordId, band: word.band, level: word.level, mastery_status: word.masteryStatus, learned_at: word.learnedAt, last_reviewed_at: word.lastReviewedAt, correct_count: word.correctCount, wrong_count: word.wrongCount, removed: false, word_data: word })),
      ...pool.removedIds.map((id) => ({ user_id: userId, vocabulary_id: id, source_record_id: null, band: null, level: null, mastery_status: null, learned_at: null, last_reviewed_at: null, correct_count: 0, wrong_count: 0, removed: true, word_data: {} })),
    ];
    if (rows.length) {
      const { error } = await supabase.from("learned_vocabulary").upsert(rows, { onConflict: "user_id,vocabulary_id" });
      if (error) throw error;
    }
  } else if (key.startsWith("tocfl-exam-v3:")) {
    const session = parsed as ExamSession | null;
    if (session && session.testId === key.slice("tocfl-exam-v3:".length) && Number.isFinite(session.startedAt)) {
      const result = session.status === "submitted" ? session.result : null;
      const row = {
        user_id: userId, test_id: session.testId, band: bandForTestId(session.testId), started_at: new Date(session.startedAt).toISOString(),
        mode: session.mode ?? "practice", script: session.script ?? "traditional", scope: session.scope ?? "full",
        correct: result?.correct ?? 0, total: result ? result.correct + result.incorrect + result.unanswered : 0,
        earned_points: result?.earnedPoints ?? 0, max_points: result?.maxPoints ?? 0,
        listening_correct: result?.sections.listening.total ? result.sections.listening.correct : null,
        reading_correct: result?.sections.reading.total ? result.sections.reading.correct : null,
        result_data: result, answers: session.answers,
        completed_at: result ? new Date(session.submittedAt ?? session.startedAt).toISOString() : null,
        status: session.status, current_index: Math.max(0, session.currentIndex),
        active_section: session.activeSection ?? null,
        deadline_at: session.deadlineAt > 0 ? new Date(session.deadlineAt).toISOString() : null,
        remaining_seconds: Math.max(0, session.remainingSeconds),
        section_completed: session.sectionCompleted, updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("test_attempts").upsert(row, { onConflict: "user_id,test_id,started_at" });
      if (error) throw error;
    }
  } else if (key.startsWith("tocfl-practice-annotations:v1:")) {
    const [, , testId, script] = key.split(":");
    const list = Array.isArray(parsed) ? parsed as PracticeAnnotation[] : [];
    const { error: removeError } = await supabase.from("practice_annotations").delete().eq("user_id", userId).eq("test_id", testId).eq("script", script);
    if (removeError) throw removeError;
    if (list.length) {
      const rows = list.filter((item) => item && typeof item.id === "string").map((item) => ({
        user_id: userId, test_id: testId, script, question_id: item.questionId,
        anchor_id: item.id, highlighted: item.highlighted, note: item.note ?? null, anchor_data: item,
      }));
      if (rows.length) {
        const { error } = await supabase.from("practice_annotations").insert(rows);
        if (error) throw error;
      }
    }
  } else if (key.startsWith("taiwen-activity:v1:") || key.startsWith("taiwen-academy:v1:")) {
    const { error } = await supabase.from("activity_progress").upsert({
      user_id: userId, activity_key: key, activity_data: parsed,
    }, { onConflict: "user_id,activity_key" });
    if (error) throw error;
  } else {
    const { error } = await supabase.from("vocabulary_progress").upsert({
      user_id: userId, progress_key: key, progress_data: parsed,
    }, { onConflict: "user_id,progress_key" });
    if (error) throw error;
  }
}

export async function syncProgressEntry(userId: string, key: string, value: string | null) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;
  markProgressPending(userId, key);
  const { data: nextRevision, error: documentError } = await supabase.rpc("write_progress_document", {
    p_storage_key: key, p_category: progressCategory(key), p_payload: value,
    p_expected_revision: progressRevision(userId, key),
  });
  if (documentError) {
    if (documentError.code === "P0001" && documentError.message.includes("progress_conflict")) throw new ProgressConflictError(key);
    throw documentError;
  }
  if (typeof nextRevision !== "number" || !Number.isSafeInteger(nextRevision)) throw new Error("Invalid progress revision.");
  setProgressRevision(userId, key, nextRevision);
  if (value === null) {
    if (key === personalizedSetsKey) {
      const { error } = await supabase.from("personalized_vocabulary_sets").delete().eq("user_id", userId);
      if (error) throw error;
    } else if (key.startsWith("tocfl-exam-v3:")) {
      const { error } = await supabase.from("test_attempts").delete().eq("user_id", userId)
        .eq("test_id", key.slice("tocfl-exam-v3:".length)).eq("status", "in-progress");
      if (error) throw error;
    } else if (key.startsWith("tocfl-practice-annotations:v1:")) {
      const [, , testId, script] = key.split(":");
      const { error: annotationError } = await supabase.from("practice_annotations").delete().eq("user_id", userId).eq("test_id", testId).eq("script", script);
      if (annotationError) throw annotationError;
    } else if (key.startsWith("taiwen-activity:v1:") || key.startsWith("taiwen-academy:v1:")) {
      const { error: activityError } = await supabase.from("activity_progress").delete().eq("user_id", userId).eq("activity_key", key);
      if (activityError) throw activityError;
    } else if (key.startsWith("tocfl-band-vocabulary-progress-v1") || key.startsWith("tocfl-vocabulary-learned-v1")) {
      const { error: vocabularyError } = await supabase.from("vocabulary_progress").delete().eq("user_id", userId).eq("progress_key", key);
      if (vocabularyError) throw vocabularyError;
    }
  } else {
    // The document is the durable source used to hydrate the existing learning UI.
    await materializeEntry(userId, key, value);
  }
  if (window.localStorage.getItem(accountProgressKey(userId, key)) === value) clearProgressPending(userId, key);
}

export async function loadAccountProgress(userId: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;
  const unsynced = new Set(pendingProgressKeys(userId));
  const cloudKeys = new Set<string>();
  for (let start = 0; ; start += 500) {
    const { data, error } = await supabase.from("progress_documents").select("storage_key,payload,revision,deleted").eq("user_id", userId).order("storage_key").range(start, start + 499);
    if (error) throw error;
    for (const row of data ?? []) {
      cloudKeys.add(row.storage_key);
      if (unsynced.has(row.storage_key)) continue;
      setProgressRevision(userId, row.storage_key, row.revision);
      if (row.deleted) window.localStorage.removeItem(accountProgressKey(userId, row.storage_key));
      else window.localStorage.setItem(accountProgressKey(userId, row.storage_key), row.payload);
    }
    if ((data?.length ?? 0) < 500) break;
  }
  for (const { key } of accountProgressEntries(userId)) {
    // Preserve older per-account device data that predates cloud syncing.
    if (!cloudKeys.has(key) && !unsynced.has(key)) markProgressPending(userId, key);
  }
  for (const key of pendingProgressKeys(userId)) {
    const value = window.localStorage.getItem(accountProgressKey(userId, key));
    await syncProgressEntry(userId, key, value);
  }
}

export async function resolveProgressConflict(userId: string, key: string, choice: "cloud" | "device") {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase chưa được cấu hình.");
  const { data, error } = await supabase.from("progress_documents")
    .select("payload,revision,deleted").eq("user_id", userId).eq("storage_key", key).maybeSingle();
  if (error) throw error;
  setProgressRevision(userId, key, data?.revision ?? 0);
  if (choice === "cloud") {
    if (data && !data.deleted) window.localStorage.setItem(accountProgressKey(userId, key), data.payload);
    else window.localStorage.removeItem(accountProgressKey(userId, key));
    clearProgressPending(userId, key);
    return;
  }
  await syncProgressEntry(userId, key, window.localStorage.getItem(accountProgressKey(userId, key)));
}

export function guestProgressSignature(): string {
  const entries = guestProgressEntries();
  let hash = 2166136261;
  for (const entry of entries) for (const char of entry.key + entry.value) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return `${entries.length}:${hash >>> 0}`;
}
function hasGuestProgress(entry: ProgressEntry): boolean {
  const value = safeParse(entry.value);
  if (Array.isArray(value)) return value.length > 0;
  if (!value || typeof value !== "object") return false;
  if (entry.key === "tocfl-learned-vocabulary-v2") {
    const pool = parseLearnedPool(value);
    return pool.words.length + pool.removedIds.length > 0;
  }
  return Object.keys(value).length > 0;
}
export function guestProgressNeedsMigration(userId: string) {
  return guestProgressEntries().some(hasGuestProgress) && window.localStorage.getItem(mergedKey(userId)) !== guestProgressSignature();
}

export async function migrateGuestProgress(userId: string) {
  const entries = guestProgressEntries();
  for (const { key, value } of entries) {
    if (key.startsWith("taiwen-activity:v1:")) {
      // Keep guest activity as its own stable contribution so repeating a merge
      // cannot double-count rounds already recorded by the account.
      const guestActivityKey = key.replace("taiwen-activity:v1:", "taiwen-activity:v1:guest-copy:");
      window.localStorage.setItem(accountProgressKey(userId, guestActivityKey), value);
      markProgressPending(userId, guestActivityKey);
      await syncProgressEntry(userId, guestActivityKey, value);
      continue;
    }
    const accountValue = window.localStorage.getItem(accountProgressKey(userId, key));
    if (key.startsWith("tocfl-exam-v3:") && accountValue) {
      await materializeEntry(userId, key, value); // Keep a historical guest result without replacing the active account session.
      continue;
    }
    const merged = mergeGuestProgressValue(key, accountValue, value);
    window.localStorage.setItem(accountProgressKey(userId, key), merged);
    markProgressPending(userId, key);
    await syncProgressEntry(userId, key, merged);
  }
  // The guest copy remains untouched. Mark this exact snapshot to avoid prompting on each visit.
  window.localStorage.setItem(mergedKey(userId), guestProgressSignature());
}

export function savedAccountProgress(userId: string) { return accountProgressEntries(userId); }

export async function loadTestHistory(userId: string): Promise<TestAttemptRow[]> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("test_attempts").select("test_id,started_at,mode,script,scope,correct,total,earned_points,max_points,listening_correct,reading_correct,completed_at").eq("user_id", userId).eq("status", "submitted").order("completed_at", { ascending: false }).limit(100);
  if (error) throw error;
  return data ?? [];
}
