"use client";

import { useState } from "react";
import type { OpportunityReview } from "@/Domain/Opportunities/CustomerOpportunity";
import styles from "./Dashboard.module.css";

export interface ReviewActionProps {
  opportunityId: string;
  canReview: boolean;
}

export function ReviewAction({ opportunityId, canReview }: ReviewActionProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function submit(decision: OpportunityReview["decision"]) {
    setStatus("saving");
    setMessage(null);
    try {
      const response = await fetch(
        `/api/cdi/opportunities/${opportunityId}/review`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ decision }),
        },
      );
      const body = (await response.json()) as {
        message?: string;
        opportunity?: { status: string };
      };
      if (!response.ok)
        throw new Error(body.message ?? "Review could not be saved");
      setStatus("saved");
      setMessage(
        `Recorded as ${body.opportunity?.status?.toLowerCase() ?? "reviewed"}.`,
      );
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Review could not be saved",
      );
    }
  }

  if (!canReview) {
    return <p className={styles.reviewNotice}>Approver role required</p>;
  }

  return (
    <div className={styles.reviewArea}>
      <div className={styles.reviewButtons}>
        <button
          disabled={status === "saving"}
          onClick={() => submit("APPROVE")}
          type="button"
        >
          Accept recommendation
        </button>
        <button
          disabled={status === "saving"}
          onClick={() => submit("HOLD")}
          type="button"
        >
          Hold
        </button>
        <button
          disabled={status === "saving"}
          onClick={() => submit("REJECT")}
          type="button"
        >
          Reject
        </button>
      </div>
      {message ? (
        <p
          className={
            status === "error" ? styles.reviewError : styles.reviewSuccess
          }
          role="status"
        >
          {message}
        </p>
      ) : (
        <p className={styles.reviewNotice}>
          Records a review only; no downstream limit is changed.
        </p>
      )}
    </div>
  );
}
