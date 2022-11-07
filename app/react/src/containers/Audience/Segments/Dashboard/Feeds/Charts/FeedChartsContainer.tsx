import * as React from 'react';
import { compose } from 'recompose';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import { AudienceFeedTyped } from '../../../Edit/domain';
import FeedCumulativeChart from './FeedCumulativeChart';
import FeedChart from './FeedChart';
import { InjectedIntlProps, injectIntl } from 'react-intl';

interface FeedChartsContainerProps {
  feed: AudienceFeedTyped;
  title?: React.ReactNode;
  dateRange: McsDateRangeValue;
}

type Props = FeedChartsContainerProps & InjectedIntlProps;

class FeedChartsContainer extends React.Component<Props> {
  render() {
    const { feed, title, dateRange } = this.props;
    return (
      <div>
        <div className='mcs-pluginModal_feedChart_container mcs-feedLineChart'>
          <FeedCumulativeChart feed={feed} />
        </div>
        <div className='mcs-pluginModal_feedChart_container'>
          <FeedChart
            title={title}
            feedId={feed.id}
            organisationId={feed.organisation_id}
            dateRange={dateRange}
          />
        </div>
      </div>
    );
  }
}

export default compose<Props, FeedChartsContainerProps>(injectIntl)(FeedChartsContainer);
