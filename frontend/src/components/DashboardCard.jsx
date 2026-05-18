const DashboardCard = ({ title, value, icon: Icon, accent = "brand", subtitle }) => {
  const accents = {
    brand: "bg-purple-400/10 text-purple-100 ring-purple-300/20",
    coral: "bg-pink-400/10 text-pink-100 ring-pink-300/20",
    mint: "bg-violet-400/10 text-violet-100 ring-violet-300/20",
    slate: "bg-fuchsia-400/10 text-fuchsia-100 ring-fuchsia-300/20"
  };

  return (
    <div className="panel dashboard-card group p-5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-950/30">
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
