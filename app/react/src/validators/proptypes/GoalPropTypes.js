import PropTypes from 'prop-types';

const GoalPropTypes = PropTypes.shape({
  id: PropTypes.string,
  organisation_id: PropTypes.string,
  name: PropTypes.string,
  technical_name: PropTypes.number,
  default_goal_value: PropTypes.number,
  goal_value_currency: PropTypes.string,
  new_query_id: PropTypes.string,
  archived: PropTypes.bool
});

export default GoalPropTypes;
