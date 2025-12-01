type DashboardCardProps = {
  title: string;
  value: string | number;
  description: string;
};

const DashboardCard = ({ title, value, description }: DashboardCardProps) => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
  );
};

export default DashboardCard;
