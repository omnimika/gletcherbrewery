import { Badge } from "@/components/ui/feedback";
import {
  WORKFLOW_STATUS_LABELS_RU,
  type WorkflowStatus,
} from "@/server/staff/contracts";

const tones: Record<
  WorkflowStatus,
  "navy" | "red" | "new" | "muted"
> = {
  new: "new",
  in_progress: "navy",
  waiting: "muted",
  done: "muted",
  spam: "red",
};

export function WorkflowBadge({ status }: { status: string }) {
  const known = status as WorkflowStatus;
  const label = WORKFLOW_STATUS_LABELS_RU[known] ?? status;
  const tone = tones[known] ?? "muted";
  return <Badge tone={tone}>{label}</Badge>;
}
