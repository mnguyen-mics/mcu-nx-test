import { PropTypes } from 'react';

const PathPropTypes = PropTypes.arrayOf(
  PropTypes.shape(
    { name: PropTypes.string,
      url: PropTypes.string }));

export default PathPropTypes;
