import * as React from 'react';
import { GoalResource } from '../../../../models/goal/index';
import TitleAndStatusHeader from '../../../../components/TitleAndStatusHeader';

interface GoalHeaderProps {
  object?: GoalResource;
}

const GoalHeader: React.SFC<GoalHeaderProps> = props => {

  const {
    object,
  } = props;

  return object && object.name ? (
    <div className="mcs-campaign-header">
      <TitleAndStatusHeader
        headerTitle={object.name}
        headerAttributes={[]}
      />
    </div>
    ) : (
      <div className="mcs-campaign-header">
        <i className="mcs-table-cell-loading-large" />
      </div>);

};

export default GoalHeader;