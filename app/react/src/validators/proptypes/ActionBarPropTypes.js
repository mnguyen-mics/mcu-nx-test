import PropTypes from 'prop-types';

const PathPropTypes = PropTypes.arrayOf(
  PropTypes.shape({
    name: PropTypes.string,
    url: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]),
  })
);

export default PathPropTypes;
