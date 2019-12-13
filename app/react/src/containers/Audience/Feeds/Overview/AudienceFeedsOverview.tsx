import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import AudienceSegmentFeedService from '../../../../services/AudienceSegmentFeedService';
import { Status, StatusEnum } from '../../../../models/Plugins';
import { Spin } from 'antd';
import AudienceFeedsOverviewCard from './AudienceFeedsOverviewCard';
import { FeedAggregationRequest } from '../../../../models/audiencesegment';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';

type Props = RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps &
  InjectedNotificationProps;

type AggregatesByStatus = { [status in Status]?: string };

type StatusAggregatesByPluginVersion = {
  [pluginVersionId: string]: AggregatesByStatus;
};

interface State {
  feedsAggregationMetrics: {
    aggregates: StatusAggregatesByPluginVersion;
    isLoading: boolean;
  };
}

class AudienceFeedsOverview extends React.Component<Props, State> {
  feedService: AudienceSegmentFeedService;

  constructor(props: Props) {
    super(props);
    this.state = {
      feedsAggregationMetrics: {
        aggregates: {},
        isLoading: true,
      },
    };

    this.feedService = new AudienceSegmentFeedService('', 'EXTERNAL_FEED');
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

    this.feedService
      .getFeedsAggregationMetrics(body)
      .then(response => {
        const tmpAggregates: StatusAggregatesByPluginVersion = {};

        response.data.rows.map(responseRow => {
          const pluginVersionId = responseRow.primary_dimension_value.value;
          const tmpStatusAggregate: AggregatesByStatus = {};
          responseRow.cells.map(cell => {
            const dimensionValue = cell.secondary_dimension_value.value;
            if (dimensionValue in StatusEnum)
              tmpStatusAggregate[dimensionValue as Status] = cell.metric_value;
          });
          tmpAggregates[pluginVersionId] = tmpStatusAggregate;
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

    return (
      <div className="feed-overview">
        {feedsAggregationMetrics.isLoading ? (
          <Spin size="small" />
        ) : (
          Object.keys(feedsAggregationMetrics.aggregates).map(
            pluginVersionId => {
              const obj = feedsAggregationMetrics.aggregates[pluginVersionId];
              return (
                <div
                  className="feed-overview-card"
                  key={`card-${pluginVersionId}`}
                >
                  <AudienceFeedsOverviewCard
                    pluginVersionId={pluginVersionId}
                    aggregatesByStatus={obj}
                  />
                </div>
              );
            },
          )
        )}
      </div>
    );
  }
}

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectNotifications,
)(AudienceFeedsOverview);
