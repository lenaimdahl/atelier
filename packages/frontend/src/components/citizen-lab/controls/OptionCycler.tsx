import "src/components/citizen-lab/shared.css";
import "src/components/citizen-lab/controls/OptionCycler.css";

interface OptionCyclerProps {
  label: string;
  value: string;
  previousLabel: string;
  nextLabel: string;
  onPrevious: () => void;
  onNext: () => void;
}

export function OptionCycler({
  label,
  value,
  previousLabel,
  nextLabel,
  onPrevious,
  onNext,
}: OptionCyclerProps) {
  return (
    <div className="option-cycler">
      <span className="control-label">{label}</span>
      <div className="option-cycler-controls">
        <button type="button" aria-label={previousLabel} onClick={onPrevious}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="m12 4-6 6 6 6" />
          </svg>
        </button>
        <span aria-live="polite">{value}</span>
        <button type="button" aria-label={nextLabel} onClick={onNext}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="m8 4 6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}