import { useRef, useState, useEffect } from 'react';

const LENGTH = 6;

export default function OtpInput({ value = '', onChange, disabled = false, error = false }) {
  const [digits, setDigits] = useState(() =>
    Array.from({ length: LENGTH }, (_, i) => value[i] || '')
  );
  const inputs = useRef([]);

  // Sync outward value back when parent resets (e.g. form.reset())
  useEffect(() => {
    if (value === '') {
      setDigits(Array(LENGTH).fill(''));
    }
  }, [value]);

  const emit = (next) => onChange(next.join(''));

  const handleChange = (e, idx) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = char;
    setDigits(next);
    emit(next);
    if (char && idx < LENGTH - 1) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      if (digits[idx]) {
        const next = [...digits];
        next[idx] = '';
        setDigits(next);
        emit(next);
      } else if (idx > 0) {
        inputs.current[idx - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < LENGTH - 1) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    const next = Array.from({ length: LENGTH }, (_, i) => pasted[i] || '');
    setDigits(next);
    emit(next);
    const focusIdx = Math.min(pasted.length, LENGTH - 1);
    inputs.current[focusIdx]?.focus();
  };

  const handleFocus = (e) => e.target.select();

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => (inputs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          onFocus={handleFocus}
          className={`
            w-11 h-12 text-center text-lg font-bold border-2 rounded-lg bg-white
            focus:outline-none transition-colors duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-300'
              : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
            }
            ${digit ? 'border-primary-400 bg-primary-50 text-primary-700' : 'text-gray-900'}
          `}
        />
      ))}
    </div>
  );
}
