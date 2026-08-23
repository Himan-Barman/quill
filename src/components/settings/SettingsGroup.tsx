export function SettingsGroup({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-bold text-[#EAB308] uppercase tracking-widest mb-4 px-2">
        {title}
      </h3>
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
        {children}
      </div>
    </div>
  );
}
