import { BADGES } from '../data/badges';

interface BadgeProps {
    id: string;
    showCriteria?: boolean; // Optional, defaults to false as per user request to start with just name
}

export function Badge({ id }: BadgeProps) {
    const badgeDefinition = BADGES[id];

    if (!badgeDefinition) return null;

    const { name, icon: Icon, colors } = badgeDefinition;

    return (
        <div className={`
      inline-flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition-all hover:scale-105 select-none
      ${colors.bg} ${colors.text} ${colors.border}
      ${colors.darkBg} ${colors.darkText} ${colors.darkBorder}
    `}>
            <div className={`p-1 rounded-full bg-white/50 dark:bg-black/20 ${colors.icon}`}>
                <Icon size={14} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold tracking-wide whitespace-nowrap">
                {name}
            </span>
        </div>
    );
}
