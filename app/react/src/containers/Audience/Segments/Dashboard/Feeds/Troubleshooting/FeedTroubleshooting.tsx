import * as React from 'react';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import FeedChart from '../Charts/FeedChart';

export type FeedTroublehshootingProps = {
  title?: React.ReactNode;
  feedId: string;
  organisationId: string;
  dateRange: McsDateRangeValue;
};

export default function FeedTroublehshooting(props: FeedTroublehshootingProps) {
  const { title, feedId, organisationId, dateRange } = props;
  return (
    <FeedChart
      title={title}
      feedId={feedId}
      organisationId={organisationId}
      dateRange={dateRange}
    />
  );
}
