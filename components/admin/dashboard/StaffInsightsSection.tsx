type StaffMember = {
  employeeId: string;
  name: string;
  role: string;
  teamName: string | null;
  averageRating: number;
  feedbackCount: number;
};

type StaffInsightsSectionProps = {
  topStaff: StaffMember[];
  staffToMonitor: StaffMember[];
};

const StaffInsightsSection = ({
  topStaff,
  staffToMonitor,
}: StaffInsightsSectionProps) => {
  const StaffList = ({
    title,
    staff,
    emptyMessage,
  }: {
    title: string;
    staff: StaffMember[];
    emptyMessage: string;
  }) => (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5 lg:p-6">
      <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
      {staff.length === 0 ? (
        <div className="mt-6 py-8 text-center">
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {staff.map((member) => (
            <li
              key={member.employeeId}
              className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-600">{member.role}</p>
                {member.teamName && (
                  <p className="mt-1 text-xs text-gray-500">Team: {member.teamName}</p>
                )}
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {member.averageRating.toFixed(1)} / 3
                </p>
                <p className="text-xs text-gray-500">{member.feedbackCount} feedback</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">Insights sul personale</h3>
        <p className="mt-1 text-sm text-gray-500">Migliori performance e aree di miglioramento</p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StaffList
          title="Top staff nel periodo"
          staff={topStaff}
          emptyMessage="Non ci sono ancora abbastanza dati sui membri dello staff nel periodo selezionato."
        />
        <StaffList
          title="Staff da monitorare"
          staff={staffToMonitor}
          emptyMessage="Non ci sono ancora abbastanza dati sui membri dello staff nel periodo selezionato."
        />
      </div>
    </div>
  );
};

export default StaffInsightsSection;
