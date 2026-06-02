import { CheckCircle2, CircleDashed } from "lucide-react";

const steps = [
  { key: "submitted", label: "Submitted" },
  { key: "under-review", label: "Under Review" },
  { key: "survey-scheduled", label: "Survey Scheduled" },
  { key: "approved", label: "Approved" },
  { key: "paid", label: "Paid" }
];

const statusRank = {
  submitted: 0,
  "under-review": 1,
  "survey-scheduled": 2,
  approved: 3,
  rejected: 3,
  paid: 4,
  settled: 4
};

const ClaimTrackingTimeline = ({ claim }) => {
  const activeRank = statusRank[claim?.status] ?? 0;

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-5">
      {steps.map((step, index) => {
        const done = activeRank >= index;
        return (
          <div key={step.key} className={`rounded-md border px-3 py-2 ${done ? "border-emerald-300/24 bg-emerald-400/10" : "border-white/10 bg-white/[0.035]"}`}>
            <div className="flex items-center gap-2">
              {done ? <CheckCircle2 size={15} className="text-emerald-200" /> : <CircleDashed size={15} className="text-white/35" />}
              <span className={`text-xs font-bold ${done ? "text-emerald-100" : "text-white/42"}`}>{step.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ClaimTrackingTimeline;
