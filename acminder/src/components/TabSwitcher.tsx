interface TabSwitcherProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabSwitcher({ tabs, activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 rounded-[20px] text-body font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
            activeTab === tab
              ? 'bg-dark text-white border border-dark'
              : 'bg-surface text-muted border border-border hover:bg-appbg'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
