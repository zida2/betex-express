/**
 * Reusable Form Field Component
 */

import React from 'react';
import '../styles/FormField.css';

const FormField = ({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  options = [],
  maxLength,
  min,
  max,
  step,
  help,
  rows
}) => {
  const fieldId = `field-${name}`;

  const handleChange = (e) => {
    onChange({
      target: {
        name,
        value: e.target.value
      }
    });
  };

  return (
    <div className="form-field">
      {label && (
        <label htmlFor={fieldId} className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}

      {type === 'select' ? (
        <select
          id={fieldId}
          name={name}
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          className={`form-input form-select ${error ? 'error' : ''}`}
          required={required}
        >
          <option value="">Sélectionner...</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={fieldId}
          name={name}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`form-input form-textarea ${error ? 'error' : ''}`}
          required={required}
          rows={rows || 3}
          maxLength={maxLength}
        />
      ) : (
        <input
          id={fieldId}
          type={type}
          name={name}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`form-input ${error ? 'error' : ''}`}
          required={required}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
        />
      )}

      {error && <p className="form-error">{error}</p>}
      {help && !error && <p className="form-help">{help}</p>}
    </div>
  );
};

export default FormField;
