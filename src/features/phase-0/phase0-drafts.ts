import { createPhase0Judgement } from "./phase0-heuristics";
import type { Phase0JudgementDraft, Phase0MessyRecord } from "./phase0-types";

export function draftFromRecord(
  record: Phase0MessyRecord,
): Phase0JudgementDraft {
  return {
    ...createPhase0Judgement(record),
    reviewOutcome: "candidate_pending",
    humanReviewNote: "請確認來源是否能提供更多現場細節。",
  };
}
