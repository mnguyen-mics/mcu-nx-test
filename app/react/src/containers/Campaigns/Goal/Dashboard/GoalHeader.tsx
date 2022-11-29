import * as React from 'react';
import { GoalResource } from '../../../../models/goal/index';
import { ContentHeader } from '@mediarithmics-private/mcs-components-library';

interface GoalHeaderProps {
  goal?: GoalResource;
}

const GoalHeader: React.SFC<GoalHeaderProps> = props => {
  const { goal } = props;

  return (
    <div className='mcs-campaign-header'>
      <ContentHeader title={goal ? goal.name : ''} loading={goal && goal.name ? false : true} />
    </div>
  );
};

export default GoalHeader;
