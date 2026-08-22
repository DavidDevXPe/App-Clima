import { useId, useState } from 'react';
import PropTypes from 'prop-types';

const MIN_CITY_LENGTH = 2;
const MAX_CITY_LENGTH = 80;

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4 4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function SearchForm({ disabled, onSearch }) {
  const [city, setCity] = useState('');
  const [validationError, setValidationError] = useState('');
  const inputId = useId();
  const hintId = useId();
  const errorId = useId();

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalizedCity = city.trim().replace(/\s+/g, ' ');

    if (normalizedCity.length < MIN_CITY_LENGTH) {
      setValidationError('Escribe al menos dos caracteres.');
      return;
    }

    setValidationError('');
    onSearch(normalizedCity);
  };

  const describedBy = validationError ? `${hintId} ${errorId}` : hintId;

  return (
    <form className="search-form" noValidate onSubmit={handleSubmit} role="search">
      <label htmlFor={inputId}>Buscar por ciudad</label>
      <div className="search-form__controls">
        <input
          aria-describedby={describedBy}
          aria-invalid={Boolean(validationError)}
          autoComplete="address-level2"
          disabled={disabled}
          enterKeyHint="search"
          id={inputId}
          maxLength={MAX_CITY_LENGTH}
          onChange={(event) => {
            setCity(event.target.value);
            if (validationError) setValidationError('');
          }}
          placeholder="Ej. Lima, Cusco o Madrid"
          spellCheck="false"
          type="search"
          value={city}
        />
        <button className="button button--primary" disabled={disabled} type="submit">
          <SearchIcon />
          Buscar
        </button>
      </div>
      <p className="search-form__hint" id={hintId}>
        Puedes incluir el país para obtener un resultado más preciso.
      </p>
      {validationError && (
        <p className="form-error" id={errorId} role="alert">
          {validationError}
        </p>
      )}
    </form>
  );
}

SearchForm.propTypes = {
  disabled: PropTypes.bool.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default SearchForm;
