import * as React from 'react';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import FeedChart from '../Charts/FeedChart';
import FeedCumulativeChart from '../Charts/FeedCumulativeChart';
import { AudienceFeedTyped } from '../../../Edit/domain';
import { compose } from 'recompose';
import { InjectedFeaturesProps, injectFeatures } from '../../../../../Features';
import { FeedStatsNotAvailable } from '../FeedStatsNotAvailable';

export type FeedTroublehshootingProps = {
  title?: React.ReactNode;
  feed: AudienceFeedTyped;
  dateRange: McsDateRangeValue;
};

type Props = FeedTroublehshootingProps & InjectedFeaturesProps;

class FeedTroublehshooting extends React.Component<Props, {}> {
  render() {
    const { title, feed, dateRange, hasFeature } = this.props;

    if (hasFeature(`feed-stats_disable_${feed.group_id}_${feed.artifact_id}`))
      return <FeedStatsNotAvailable />;

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
}

export default compose<Props, FeedTroublehshootingProps>(injectFeatures)(FeedTroublehshooting);
