import PropTypes from 'prop-types';

const statusMessages = {
  loading: 'Consultando las condiciones meteorológicas…',
  locating: 'Obteniendo tu ubicación de forma segura…',
};

function StatusNotice({ error, hasData, onRetry, status }) {
  if (status === 'error' && error) {
    return (
      <div className="status-notice status-notice--error glass-panel" role="alert">
        <div>
          <strong>No pudimos actualizar el clima</strong>
          <p>{error}</p>
          {hasData && (
            <p className="status-notice__context">
              Se mantienen visibles los últimos datos recibidos.
            </p>
          )}
        </div>
        <button className="button button--compact" onClick={onRetry} type="button">
          Reintentar
        </button>
      </div>
    );
  }

  if (status === 'loading' || status === 'locating') {
    return (
      <div className={`status-notice status-notice--${status} glass-panel`} role="status">
        <span className="status-notice__spinner" aria-hidden="true" />
        <span>{statusMessages[status]}</span>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <p className="sr-only" role="status">
        Condiciones meteorológicas actualizadas.
      </p>
    );
  }

  return null;
}

StatusNotice.propTypes = {
  error: PropTypes.string,
  hasData: PropTypes.bool.isRequired,
  onRetry: PropTypes.func.isRequired,
  status: PropTypes.oneOf(['error', 'idle', 'loading', 'locating', 'success']).isRequired,
};

export default StatusNotice;
