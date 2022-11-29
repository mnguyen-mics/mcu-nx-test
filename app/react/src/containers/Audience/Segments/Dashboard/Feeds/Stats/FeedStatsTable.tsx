import * as React from 'react';
import { compose } from 'recompose';
import { defineMessages, MessageDescriptor, WrappedComponentProps, injectIntl } from 'react-intl';
import { FeedStatsInfo } from './FeedStats';

const messages: {
  [key: string]: MessageDescriptor;
} = defineMessages({
  tableUpserts: {
    id: 'feed.stats.table.upserts',
    defaultMessage: 'upserts successfully sent to the destination platform',
  },
  tableDeletes: {
    id: 'feed.stats.table.deletes',
    defaultMessage: 'deletes successfully sent to the destination platform',
  },
  tableEligibleIdentifiers: {
    id: 'feed.stats.table.eligibleIdentifiers',
    defaultMessage: 'of the user points have an eligible matching key for the destination platform',
  },
});

interface FeedStatsTableProps {
  stats: FeedStatsInfo;
}

type Props = FeedStatsTableProps & WrappedComponentProps;

class FeedStatsTable extends React.Component<Props> {
  render() {
    const {
      intl: { formatMessage },
      stats,
    } = this.props;

    const eligibleIdentifiersPercentage =
      stats.tableInfo.totalUserPointsHandled !== 0
        ? (1 - stats.tableInfo.totalNoEligibleIdentifier / stats.tableInfo.totalUserPointsHandled) *
          100
        : undefined;
    const classNameEligibleIdentifier = eligibleIdentifiersPercentage
      ? eligibleIdentifiersPercentage > 70
        ? 'mcs-feedStats_table_cell_successNumber'
        : eligibleIdentifiersPercentage > 60
        ? 'mcs-feedStats_table_cell_warningNumber'
        : 'mcs-feedStats_table_cell_errorNumber'
      : 'mcs-feedStats_table_cell_warningNumber';

    return (
      <div className='mcs-feedStats_table'>
        <div className='mcs-feedStats_table_cell'>
          <div className='mcs-feedStats_table_cell_successNumber'>
            {stats.tableInfo.totalSuccessUpserts.toLocaleString('en')}
          </div>
          {formatMessage(messages.tableUpserts)}
        </div>
        <div className='mcs-feedStats_table_cell'>
          <div className='mcs-feedStats_table_cell_errorNumber'>
            {stats.tableInfo.totalSuccessDeletes.toLocaleString('en')}
          </div>
          {formatMessage(messages.tableDeletes)}
        </div>
        <div className='mcs-feedStats_table_cell mcs-feedStats_table_cell_last'>
          <div className={classNameEligibleIdentifier}>
            {`${eligibleIdentifiersPercentage ? eligibleIdentifiersPercentage.toFixed(2) : '-'} %`}
          </div>
          {formatMessage(messages.tableEligibleIdentifiers)}
        </div>
      </div>
    );
  }
}

export default compose<Props, FeedStatsTableProps>(injectIntl)(FeedStatsTable);
