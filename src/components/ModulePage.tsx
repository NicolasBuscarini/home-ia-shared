import type { ReactNode } from 'react';

export interface ModulePageProps {
  titleId: string;
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function ModulePage({ titleId, eyebrow, title, description, actions, children }: ModulePageProps) {
  return (
    <div className="module-page">
      <header className="module-header">
        <div className="module-heading">
          <span className="eyebrow">{eyebrow}</span>
          <h2 id={titleId} className="h4 mt-2 mb-1">
            {title}
          </h2>
          {description && <p className="small text-secondary mb-0">{description}</p>}
        </div>
        {actions && <div className="module-actions">{actions}</div>}
      </header>
      <div className="module-body">{children}</div>
    </div>
  );
}

export interface ModuleTab<T extends string> {
  id: T;
  label: string;
  panelId?: string;
}

export interface ModuleTabsProps<T extends string> {
  label: string;
  items: readonly ModuleTab<T>[];
  active: T;
  onChange: (id: T) => void;
}

export function ModuleTabs<T extends string>({ label, items, active, onChange }: ModuleTabsProps<T>) {
  return (
    <div className="module-tabs" role="tablist" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.id}
          id={`module-tab-${item.id}`}
          className={`module-tab${active === item.id ? ' is-active' : ''}`}
          type="button"
          role="tab"
          aria-selected={active === item.id}
          aria-controls={item.panelId}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
