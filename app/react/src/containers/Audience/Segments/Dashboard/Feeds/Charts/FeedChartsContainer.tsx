import * as React from 'react';
import { compose } from 'recompose';
import { AudienceFeedTyped } from '../../../Edit/domain';
import FeedCumulativeChart from './FeedCumulativeChart';
import { InjectedIntlProps, injectIntl } from 'react-intl';

interface FeedChartsContainerProps {
  feed: AudienceFeedTyped;
}

type Props = FeedChartsContainerProps & InjectedIntlProps;

class FeedChartsContainer extends React.Component<Props> {
  render() {
    const { feed } = this.props;
    return (
      <div className='mcs-pluginModal_feedChart_container mcs-feedLineChart'>
        <FeedCumulativeChart feed={feed} />
      </div>
    );
  }
}

export default compose<Props, FeedChartsContainerProps>(injectIntl)(FeedChartsContainer);
