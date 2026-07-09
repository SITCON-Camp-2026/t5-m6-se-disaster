import { StatusBadge } from "../../components/StatusBadge";
import type { Phase0JudgementDraft, Phase0MessyRecord } from "./phase0-types";

const reviewOutcomeLabels: Record<
  Phase0JudgementDraft["reviewOutcome"],
  string
> = {
  raw: "原始回報",
  candidate_pending: "候選結果（待確認）",
  verified_action: "已驗證可行動",
};

export function Phase0FinalResults({
  records,
  drafts,
  finalStateMessage,
}: {
  records: Phase0MessyRecord[];
  drafts: Record<string, Phase0JudgementDraft>;
  finalStateMessage: string;
}) {
  const draftedRecords = records.filter((record) => drafts[record.id]);
  const verifiedRecords = draftedRecords.filter(
    (record) => drafts[record.id].reviewOutcome === "verified_action",
  );
  const pendingRecords = draftedRecords.filter(
    (record) => drafts[record.id].reviewOutcome !== "verified_action",
  );

  return (
    <div className="final-results">
      <div className="panel__header">
        <div>
          <h2>最終成果</h2>
          <p>
            第二頁的儲存草稿、重設成安全預設和刪除草稿會直接影響這裡的呈現。
            這代表你現在的操作已經決定了哪些資料保留為草稿；被刪除的草稿不會出現在這裡。
          </p>
        </div>
        <p>{finalStateMessage}</p>
      </div>

      {draftedRecords.length === 0 ? (
        <p className="empty-state">
          目前沒有已儲存草稿；請回到整理工作台建立候選結果。
        </p>
      ) : (
        <>
          <section className="final-results__section">
            <h3>已驗證可行動</h3>
            {verifiedRecords.length === 0 ? (
              <p>目前沒有已驗證可行動的資料。</p>
            ) : (
              <div className="final-results__grid">
                {verifiedRecords.map((record) => (
                  <article
                    key={record.id}
                    className="record-card final-results__card"
                  >
                    <div className="record-card__header">
                      <div>
                        <h3>{record.id}</h3>
                        <p className="final-results__summary">
                          已驗證可行動
                        </p>
                      </div>
                      <StatusBadge status={record.verificationStatus} />
                    </div>

                    <p>{record.rawText}</p>

                    <div className="record-card__meta">
                      <span>{reviewOutcomeLabels[drafts[record.id].reviewOutcome]}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="final-results__section">
            <h3>候選結果（待確認）</h3>
            {pendingRecords.length === 0 ? (
              <p>目前沒有待確認候選結果。</p>
            ) : (
              <div className="final-results__grid">
                {pendingRecords.map((record) => (
                  <article
                    key={record.id}
                    className="record-card final-results__card"
                  >
                    <div className="record-card__header">
                      <div>
                        <h3>{record.id}</h3>
                        <p className="final-results__summary">
                          候選結果，尚未驗證可行動
                        </p>
                      </div>
                      <StatusBadge status={record.verificationStatus} />
                    </div>

                    <p>{record.rawText}</p>

                    <div className="record-card__meta">
                      <span>{reviewOutcomeLabels[drafts[record.id].reviewOutcome]}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
