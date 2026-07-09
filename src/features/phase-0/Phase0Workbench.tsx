import { useMemo, useState } from "react";
import { RecordCard } from "../../components/RecordCard";
import { StatusBadge } from "../../components/StatusBadge";
import { Phase0JudgementCard } from "./Phase0JudgementCard";
import { createPhase0Judgement } from "./phase0-heuristics";
import type {
  Phase0JudgementDraft,
  Phase0MessyRecord,
  Phase0PossibleKind,
  Phase0Confidence,
  Phase0SuggestedNextStep,
} from "./phase0-types";

const kindOptions: Array<{ value: Phase0PossibleKind; label: string }> = [
  { value: "help_request_candidate", label: "求助候選" },
  { value: "site_status_candidate", label: "地點狀態候選" },
  { value: "task_candidate", label: "任務候選" },
  { value: "assignment_candidate", label: "人員指派候選" },
  { value: "announcement_candidate", label: "公告候選" },
  { value: "unknown", label: "候選類型待判斷" },
];

const confidenceOptions: Array<{ value: Phase0Confidence; label: string }> = [
  { value: "low", label: "低" },
  { value: "medium", label: "中" },
  { value: "high", label: "高" },
];

const nextStepOptions: Array<{
  value: Phase0SuggestedNextStep;
  label: string;
}> = [
  { value: "keep_raw", label: "先保留原始資訊" },
  { value: "ask_for_more_info", label: "補問來源或現場資訊" },
  { value: "send_to_human_review", label: "交給人工確認" },
  { value: "create_candidate_report", label: "建立候選通報" },
  { value: "create_site_update_suggestion", label: "建立地點更新建議" },
  { value: "do_not_use_yet", label: "暫時不要使用" },
];

function draftFromRecord(record: Phase0MessyRecord): Phase0JudgementDraft {
  return {
    ...createPhase0Judgement(record),
    humanReviewNote: "請確認來源是否能提供更多現場細節。",
  };
}

function DraftEditor({
  record,
  draft,
  onSave,
  onDelete,
}: {
  record: Phase0MessyRecord;
  draft: Phase0JudgementDraft | undefined;
  onSave: (draft: Phase0JudgementDraft) => void;
  onDelete: () => void;
}) {
  const [editingDraft, setEditingDraft] = useState<Phase0JudgementDraft>(
    draft ?? draftFromRecord(record),
  );

  function updateDraftField<K extends keyof Phase0JudgementDraft>(
    key: K,
    value: Phase0JudgementDraft[K],
  ) {
    setEditingDraft((prev) => ({ ...prev, [key]: value }));
  }

  function resetDraft() {
    setEditingDraft(draftFromRecord(record));
  }

  const draftStatusText = draft
    ? "已建立草稿，請繼續補上判斷依據。"
    : "尚未建立整理草稿，可從下方表單開始。";

  return (
    <section className="draft-editor">
      <div className="draft-editor__header">
        <h3>編輯整理草稿</h3>
        <p>{draftStatusText}</p>
      </div>
      <div className="draft-editor__fields">
        <label>
          候選類型
          <select
            value={editingDraft.possibleKind}
            onChange={(event) =>
              updateDraftField(
                "possibleKind",
                event.target.value as Phase0PossibleKind,
              )
            }
          >
            {kindOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          信心程度
          <select
            value={editingDraft.confidence}
            onChange={(event) =>
              updateDraftField(
                "confidence",
                event.target.value as Phase0Confidence,
              )
            }
          >
            {confidenceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          下一步
          <select
            value={editingDraft.suggestedNextStep}
            onChange={(event) =>
              updateDraftField(
                "suggestedNextStep",
                event.target.value as Phase0SuggestedNextStep,
              )
            }
          >
            {nextStepOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          依據 / 證據
          <textarea
            value={editingDraft.evidence.join("\n")}
            onChange={(event) =>
              updateDraftField(
                "evidence",
                event.target.value
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean),
              )
            }
          />
        </label>

        <label>
          卡住的地方
          <textarea
            value={editingDraft.blockers.join("\n")}
            onChange={(event) =>
              updateDraftField(
                "blockers",
                event.target.value
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean),
              )
            }
          />
        </label>

        <label>
          需要人工確認的備註
          <textarea
            value={editingDraft.humanReviewNote ?? ""}
            onChange={(event) =>
              updateDraftField("humanReviewNote", event.target.value)
            }
          />
        </label>
      </div>

      <div className="draft-editor__actions">
        <button type="button" onClick={() => onSave(editingDraft)}>
          儲存草稿
        </button>
        <button type="button" onClick={resetDraft}>
          重設成安全預設
        </button>
        <button type="button" onClick={onDelete}>
          刪除草稿
        </button>
      </div>
      <p className="draft-editor__hint">
        草稿儲存在頁面狀態中；這只是 Phase 0 的操作範例，不代表正式整理後資料。
      </p>
    </section>
  );
}

export function Phase0Workbench({
  records,
  selectedRecordId,
  onSelect,
}: {
  records: Phase0MessyRecord[];
  selectedRecordId: string;
  onSelect: (recordId: string) => void;
}) {
  const selectedRecord =
    records.find((record) => record.id === selectedRecordId) ?? records[0];

  const initialDraftIds = [
    "M-001",
    "M-003",
    "M-006",
    "M-008",
    "M-009",
    "M-010",
  ];

  const [drafts, setDrafts] = useState<Record<string, Phase0JudgementDraft>>(
    () =>
      Object.fromEntries(
        records
          .filter((record) => initialDraftIds.includes(record.id))
          .map((record) => [record.id, draftFromRecord(record)]),
      ),
  );

  const selectedDraft = drafts[selectedRecord.id];

  function saveDraft(draft: Phase0JudgementDraft) {
    setDrafts((previous) => ({
      ...previous,
      [selectedRecord.id]: draft,
    }));
  }

  function deleteDraft() {
    setDrafts((previous) => {
      const nextDrafts = { ...previous };
      delete nextDrafts[selectedRecord.id];
      return nextDrafts;
    });
  }

  const draftCount = Object.keys(drafts).length;

  const safetyBoundary = useMemo(
    () => createPhase0Judgement(selectedRecord),
    [selectedRecord],
  );

  return (
    <div className="workbench">
      <div className="workbench__intro">
        <p className="eyebrow">整理工作台</p>
        <h2>第一階段的成功不是分類正確，而是把為什麼現在還不能判斷說清楚。</h2>
        <p>
          這裡先只標示安全邊界，真正的候選判斷要由小組和 coding agent
          補上；這不是 runtime LLM 分析，也不是正式資料模型。
        </p>
        <p>請 agent 加上建立、編輯、刪除或重設整理草稿。</p>
      </div>

      <div className="workbench__layout">
        <aside className="workbench__queue" aria-label="選擇原始資訊">
          {records.map((record) => (
            <button
              className={record.id === selectedRecord.id ? "active" : ""}
              key={record.id}
              type="button"
              onClick={() => onSelect(record.id)}
            >
              <span>{record.id}</span>
              <StatusBadge status={record.verificationStatus} />
            </button>
          ))}
        </aside>

        <div className="workbench__main">
          <RecordCard record={selectedRecord} />

          <Phase0JudgementCard
            judgement={safetyBoundary}
            record={selectedRecord}
          />

          <DraftEditor
            key={`${selectedRecord.id}:${selectedDraft ? "saved" : "new"}`}
            draft={selectedDraft}
            onDelete={deleteDraft}
            onSave={saveDraft}
            record={selectedRecord}
          />
        </div>

      </div>
    </div>
  );
}
