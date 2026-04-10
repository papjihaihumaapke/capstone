interface TabSwitcherProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabSwitcher({ tabs, activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div className="flex w-full bg-surface rounded-2xl p-1 border border-border mb-6">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            activeTab === tab
              ? 'bg-primary text-white shadow-blue'
              : 'text-textSecondary hover:text-textPrimary'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
