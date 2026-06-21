const DashboardCard = ({ title, value, icon: Icon, accent = "brand", subtitle }) => {
  const accents = {
    brand: "bg-blue-50 text-blue-700 ring-blue-100",
    coral: "bg-amber-50 text-amber-700 ring-amber-100",
    mint: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    slate: "bg-slate-100 text-slate-700 ring-slate-200"
  };

  return (
    <div className="panel dashboard-card group p-5 transition duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label">{title}</p>
          <p className="mt-3 text-3xl font-black text-ink">{value}</p>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-md shadow-sm ring-1 transition group-hover:scale-105 ${accents[accent]}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
