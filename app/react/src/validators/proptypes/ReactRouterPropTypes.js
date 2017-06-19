// See react router v4 documentation for more info
import PropTypes from 'prop-types';

const MatchPropTypes = PropTypes.shape({
  params: PropTypes.objectOf(PropTypes.string),
  isExact: PropTypes.bool,
  path: PropTypes.string,
  url: PropTypes.string
});

export default {
  MatchPropTypes
};
