import * as React from 'react';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import FeedChart from '../Charts/FeedChart';
import FeedCumulativeChart from '../Charts/FeedCumulativeChart';
import { AudienceFeedTyped } from '../../../Edit/domain';

export type FeedTroublehshootingProps = {
  title?: React.ReactNode;
  feed: AudienceFeedTyped;
  dateRange: McsDateRangeValue;
};

export default function FeedTroublehshooting(props: FeedTroublehshootingProps) {
  const { title, feed, dateRange } = props;
  return (
    <div>
      <div className='mcs-pluginModal_feedChart_container mcs-feedLineChart'>
        <FeedCumulativeChart feed={feed} />
      </div>
      <FeedChart
        title={title}
        feedId={feed.id}
        organisationId={feed.organisation_id}
        dateRange={dateRange}
      />
    </div>
  );
}
