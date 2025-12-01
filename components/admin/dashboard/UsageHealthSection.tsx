import DashboardCard from "./DashboardCard";

type UsageHealthSectionProps = {
  totalFeedbackInPeriod: number;
  feedbackLast7Days: number;
};

const UsageHealthSection = ({
  totalFeedbackInPeriod,
  feedbackLast7Days,
}: UsageHealthSectionProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">Uso e stato generale</h3>
        <p className="mt-1 text-sm text-gray-500">Panoramica dell'attività di feedback</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DashboardCard
          title="Feedback nel periodo"
          value={totalFeedbackInPeriod}
          description="Totale voti ricevuti"
        />
        <DashboardCard
          title="Feedback negli ultimi 7 giorni"
          value={feedbackLast7Days}
          description="Attività recente"
        />
      </div>
    </div>
  );
};

export default UsageHealthSection;
