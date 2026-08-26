import PropTypes from 'prop-types';

function WeatherBackground({ theme }) {
  const style = {
    '--weather-background-image': `url("${theme.background}")`,
    '--weather-overlay-image': theme.overlay ? `url("${theme.overlay}")` : 'none',
    '--weather-overlay-opacity': theme.overlayOpacity,
  };

  return (
    <div
      aria-hidden="true"
      className={`weather-background weather-background--${theme.id}`}
      style={style}
    >
      <div className="weather-background__image" />
      {theme.overlay && <div className="weather-background__overlay" />}
      <div className="weather-background__effect" />
      <div className="weather-background__contrast" />
    </div>
  );
}

WeatherBackground.propTypes = {
  theme: PropTypes.shape({
    background: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    overlay: PropTypes.string,
    overlayOpacity: PropTypes.number.isRequired,
  }).isRequired,
};

export default WeatherBackground;
