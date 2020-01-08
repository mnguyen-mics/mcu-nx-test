import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl, FormattedMessage, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import AudienceSegmentFeedService from '../../../../services/AudienceSegmentFeedService';
import { Status, StatusEnum } from '../../../../models/Plugins';
import AudienceFeedsOverviewCard from './AudienceFeedsOverviewCard';
import { FeedAggregationRequest, FeedAggregationResponseRow } from '../../../../models/audiencesegment';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { Loading } from '../../../../components';
import { EmptyTableView } from '../../../../components/TableView';

type Props = RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps &
  InjectedNotificationProps;

type AggregatesByStatus = { [status in Status]?: string };

type StatusAggregatesByPluginVersion = {
  [pluginVersionId: string]: {aggregation: AggregatesByStatus, feedType:string};
 
};

type Aggregation = {
  rowAggregation: FeedAggregationResponseRow;
  feedType: string
}

interface State {
  feedsAggregationMetrics: {
    aggregates: StatusAggregatesByPluginVersion;
    isLoading: boolean;
  };
}

const messages: {
  [key: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  noData: {
    id: 'audience.feeds.overview.nodata',
    defaultMessage: 'No feeds found.\nTo add one, please go to a segment page and click on “Add a Feed".',
  },
});

class AudienceFeedsOverview extends React.Component<Props, State> {
  externalfeedService: AudienceSegmentFeedService;
  tagfeedService: AudienceSegmentFeedService;

  constructor(props: Props) {
    super(props);
    this.state = {
      feedsAggregationMetrics: {
        aggregates: {},
        isLoading: true,
      },
    };

    this.externalfeedService = new AudienceSegmentFeedService('', 'EXTERNAL_FEED');
    this.tagfeedService = new AudienceSegmentFeedService('', 'TAG_FEED');
  }

  componentDidMount() {
    this.fetchFeedsAggregationMetrics();
  }

  componentDidUpdate(prevProps: Props) {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    if (organisationId !== prevProps.match.params.organisationId) {
      this.setState({
        feedsAggregationMetrics: {
          aggregates: {},
          isLoading: true,
        },
      });
      this.fetchFeedsAggregationMetrics();
    }
  }

  fetchFeedsAggregationMetrics() {
    const {
      match: {
        params: { organisationId },
      },
      notifyError,
    } = this.props;

    this.setState({
      feedsAggregationMetrics: { aggregates: {}, isLoading: true },
    });

    const body: FeedAggregationRequest = {
      primary_dimension: 'PLUGIN_VERSION_ID',
      secondary_dimension: 'STATUS',
      metric: 'FEED_COUNT',
      organisation_id: organisationId,
      order_by: {
        sort_value: 'PRIMARY_DIMENSION',
      },
      max_results: 100,
    };

    const externalFeedsAggregates = this.externalfeedService
    .getFeedsAggregationMetrics(body);

    const tagFeedsAggregates = this.tagfeedService
    .getFeedsAggregationMetrics(body);

    Promise.all([externalFeedsAggregates, tagFeedsAggregates])
      .then(responses => {
        const tmpAggregates: StatusAggregatesByPluginVersion = {};
        const externalTypedFeed: Aggregation[] = responses[0].data.rows.map(ra => {
          const aggregation = { rowAggregation: ra , feedType: 'EXTERNAL_FEED' };
          return aggregation as Aggregation;
        });
        const tagTypedFeed: Aggregation[] = responses[1].data.rows.map(ra => {
          const aggregation = { rowAggregation: ra , feedType: 'TAG_FEED' };
          return aggregation as Aggregation;
        });
        externalTypedFeed.concat(tagTypedFeed).map(agg => {
          const pluginVersionId = agg.rowAggregation.primary_dimension_value.value;
          
          const tmpStatusAggregate: AggregatesByStatus = {};
          agg.rowAggregation.cells.map(cell => {
            const dimensionValue = cell.secondary_dimension_value.value;
            if (dimensionValue in StatusEnum)
              tmpStatusAggregate[dimensionValue as Status] = cell.metric_value;
          });
          tmpAggregates[pluginVersionId] = {aggregation:tmpStatusAggregate, feedType:agg.feedType};
        });

        this.setState({
          feedsAggregationMetrics: {
            aggregates: tmpAggregates,
            isLoading: false,
          },
        });
      })
      .catch(err => {
        notifyError(err);

        this.setState({
          feedsAggregationMetrics: { aggregates: {}, isLoading: false },
        });
      });
  }

  render() {
    const { feedsAggregationMetrics } = this.state;

    return feedsAggregationMetrics.isLoading ? (
      <Loading className="loading-full-screen full-height" />
    ) : Object.keys(feedsAggregationMetrics.aggregates).length > 0 ? (
      <div className="feed-overview">
        {Object.keys(feedsAggregationMetrics.aggregates).map(
          pluginVersionId => {
            const obj = feedsAggregationMetrics.aggregates[pluginVersionId];
            return (
              <div
                className="feed-overview-card"
                key={`card-${pluginVersionId}`}
              >
                <AudienceFeedsOverviewCard
                  pluginVersionId={pluginVersionId}
                  aggregatesByStatus={obj.aggregation}
                  feedType={obj.feedType}
                />
              </div>
            );
          },
        )}
      </div>
    ) : (
      <EmptyTableView
        iconType={'users'}
        intlMessage={messages.noData}
      />
    );
  }
}

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectNotifications,
)(AudienceFeedsOverview);
