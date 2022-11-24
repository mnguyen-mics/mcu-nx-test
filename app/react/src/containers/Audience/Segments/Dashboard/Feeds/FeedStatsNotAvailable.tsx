import { WarningOutlined } from '@ant-design/icons';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

export function FeedStatsNotAvailable() {
  return (
    <div className='mcs-feedStatsNotAvailable'>
      <WarningOutlined className='mcs-feedStatsNotAvailable_icon' />
      <FormattedMessage
        id='feedStatsNotAvailable.title'
        defaultMessage={`The feed require an update to display stats.`}
      />
    </div>
  );
}
