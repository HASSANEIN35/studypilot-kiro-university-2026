import { useState, useEffect } from 'react';
import { validateAvailableMinutes } from '../../lib/validation';

interface StudyTimeSetterProps {
  value: number;
  onChange: (minutes: number) => void;
}

export function StudyTimeSetter({ value, onChange }: StudyTimeSetterProps) {
  const [inputValue, setInputValue] = useState(String(value));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleChange = (newValue: string) => {
    setInputValue(newValue);
    const numValue = parseInt(newValue, 10);
    
    if (isNaN(numValue)) {
      setError('Please enter a valid number');
      return;
    }
    
    const validationErrors = validateAvailableMinutes(numValue);
    if (validationErrors.length > 0) {
      setError(validationErrors[0].message);
    } else {
      setError(null);
      onChange(numValue);
    }
  };

  const handleBlur = () => {
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < 15) {
      setInputValue('15');
      onChange(15);
      setError(null);
    } else if (numValue > 720) {
      setInputValue('720');
      onChange(720);
      setError(null);
    }
  };

  const increment = () => {
    const newValue = Math.min(720, value + 15);
    setInputValue(String(newValue));
    setError(null);
    onChange(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(15, value - 15);
    setInputValue(String(newValue));
    setError(null);
    onChange(newValue);
  };

  return (
    <div className="study-time-setter">
      <label htmlFor="study-time" className="study-time-label">
        Available study time today:
      </label>
      <div className="study-time-input-group">
        <button
          type="button"
          className="btn-icon-time"
          onClick={decrement}
          aria-label="Decrease time by 15 minutes"
          disabled={value <= 15}
        >
          −
        </button>
        <input
          id="study-time"
          type="number"
          className={`study-time-input ${error ? 'input-error' : ''}`}
          value={inputValue}
          onChange={e => handleChange(e.target.value)}
          onBlur={handleBlur}
          min={15}
          max={720}
          aria-describedby={error ? 'study-time-error' : undefined}
          aria-invalid={!!error}
        />
        <span className="study-time-unit">min</span>
        <button
          type="button"
          className="btn-icon-time"
          onClick={increment}
          aria-label="Increase time by 15 minutes"
          disabled={value >= 720}
        >
          +
        </button>
      </div>
      {error && (
        <span id="study-time-error" className="error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}