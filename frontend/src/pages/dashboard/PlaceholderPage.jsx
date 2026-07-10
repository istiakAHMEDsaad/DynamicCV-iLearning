const PlaceholderPage = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
      <h3 className="text-lg font-semibold text-zinc-700">{title} Module</h3>
      <p className="text-sm text-zinc-500">Development in progress.</p>
    </div>
  );
};

export default PlaceholderPage;
