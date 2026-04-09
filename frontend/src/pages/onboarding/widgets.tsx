import React from 'react';
import { Option, OptionGroup, IconOption } from './options';
import { Icon } from '../../components/icons';

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

type Cols = 2 | 3 | 4 | undefined;
const gridClass = (columns: Cols) =>
  columns ? `chip-grid chip-grid-${columns}` : 'chip-grid';

export const ChipMulti: React.FC<{
  options: Option[];
  value: string[];
  onChange: (next: string[]) => void;
  exclusiveOption?: string;
  columns?: Cols;
}> = ({ options, value, onChange, exclusiveOption, columns }) => {
  const toggle = (v: string) => {
    if (exclusiveOption && v === exclusiveOption) {
      onChange([exclusiveOption]);
      return;
    }
    const next = value.filter((x) => x !== exclusiveOption);
    if (next.includes(v)) {
      onChange(next.filter((x) => x !== v));
    } else {
      onChange([...next, v]);
    }
  };
  return (
    <div className={gridClass(columns)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`chip ${value.includes(o.value) ? 'active' : ''}`}
          onClick={() => toggle(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
};

export const ChipSingle: React.FC<{
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  columns?: Cols;
}> = ({ options, value, onChange, columns }) => (
  <div className={gridClass(columns)}>
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        className={`chip ${value === o.value ? 'active' : ''}`}
        onClick={() => onChange(o.value)}
      >
        {o.label}
      </button>
    ))}
  </div>
);

export const Checklist: React.FC<{
  options: Option[];
  value: string;
  onChange: (v: string) => void;
}> = ({ options, value, onChange }) => {
  return (
    <div className="checklist-single">
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            className={`checklist-item ${selected ? 'active' : ''}`}
            onClick={() => onChange(o.value)}
            aria-pressed={selected}
          >
            <span className={`checklist-box ${selected ? 'checked' : ''}`}>
              {selected && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export const ChecklistGrouped: React.FC<{
  groups: OptionGroup[];
  value: string[];
  onChange: (next: string[]) => void;
}> = ({ groups, value, onChange }) => {
  const toggle = (v: string) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  };
  return (
    <div className="checklist-grouped">
      {groups.map((group) => (
        <div key={group.title} className="checklist-group">
          <div className="checklist-group-title">{group.title}</div>
          <div className="checklist-items">
            {group.options.map((o) => {
              const selected = value.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  className={`checklist-item ${selected ? 'active' : ''}`}
                  onClick={() => toggle(o.value)}
                  aria-pressed={selected}
                >
                  <span className={`checklist-box ${selected ? 'checked' : ''}`}>
                    {selected && <CheckIcon />}
                  </span>
                  <span>{o.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

interface OptionItem {
  value: string;
  label: string;
  desc?: string;
}

export const OptionList: React.FC<{
  options: OptionItem[];
  value: string;
  onChange: (v: string) => void;
}> = ({ options, value, onChange }) => (
  <div className="option-list">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        className={`option ${value === o.value ? 'active' : ''}`}
        onClick={() => onChange(o.value)}
      >
        <strong>{o.label}</strong>
        {o.desc && <span className="muted small">{o.desc}</span>}
      </button>
    ))}
  </div>
);

export const IconGrid: React.FC<{
  options: IconOption[];
  value: string[];
  onChange: (next: string[]) => void;
  columns?: 2 | 3 | 4;
}> = ({ options, value, onChange, columns = 2 }) => {
  const toggle = (v: string) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  };
  return (
    <div className={`icon-grid icon-grid-${columns}`}>
      {options.map((o) => {
        const selected = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            className={`icon-tile ${selected ? 'active' : ''}`}
            onClick={() => toggle(o.value)}
            aria-pressed={selected}
          >
            <span className="icon-tile-icon">
              <Icon name={o.icon} size={24} />
            </span>
            <span className="icon-tile-label">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export const Field: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <label className="field">
    <span className="field-label">{label}</span>
    {children}
    {hint && <span className="field-hint">{hint}</span>}
  </label>
);

export const FieldGroup: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <div className="field">
    <div className="field-label">{label}</div>
    {hint && <div className="field-hint">{hint}</div>}
    <div style={{ marginTop: 8 }}>{children}</div>
  </div>
);
