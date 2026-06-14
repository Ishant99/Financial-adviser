import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("pb-5 border-b border-white/[0.07]", className)}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow text-indigo-400/80 mb-1">{eyebrow}</p>}
          <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-gray-400 max-w-xl">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
