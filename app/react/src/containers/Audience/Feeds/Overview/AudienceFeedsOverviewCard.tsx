import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  InjectedIntlProps,
  injectIntl,
  defineMessages,
  FormattedMessage,
} from 'react-intl';
import { compose } from 'recompose';
import { Card } from '../../../../components/Card';
import MetricInfo, { IconColor } from '../../../../components/Card/MetricInfo';
import { FEEDS_SEARCH_SETTINGS } from '../List/constants';
import { updateSearch } from '../../../../utils/LocationSearchHelper';
import PluginService from '../../../../services/PluginService';
import { Spin } from 'antd';

type Props = RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps &
  AudienceFeedsOverviewCardProps;

export type AgggregatesByStatus = { [status in IconColor]?: string };

type AudienceFeedsOverviewCardProps = {
  aggregatesByStatus: AgggregatesByStatus;
  pluginVersionId: string;
};

interface State {
  isLoading: boolean;
  artifactId?: string;
  assetUrl?: string;
  feedTitle?: string;
  pluginVersionValue?: string;
}

const metricStatusMessages: {
  [key in IconColor]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  ACTIVE: {
    id: 'audience.feeds.overview.card.status.live',
    defaultMessage: 'Live',
  },
  PAUSED: {
    id: 'audience.feeds.overview.card.status.paused',
    defaultMessage: 'Paused',
  },
  INITIAL: {
    id: 'audience.feeds.overview.card.status.initial',
    defaultMessage: 'Initial',
  },
});

const tooltipStatusMessages: {
  [key in IconColor]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  ACTIVE: {
    id: 'audience.feeds.overview.card.metric.tooltip.live',
    defaultMessage: 'View all related live feeds',
  },
  PAUSED: {
    id: 'audience.feeds.overview.card.metric.tooltip.paused',
    defaultMessage: 'View all related paused feeds',
  },
  INITIAL: {
    id: 'audience.feeds.overview.card.metric.tooltip.initial',
    defaultMessage: 'View all related feeds in initial state',
  },
});

class AudienceFeedsOverviewCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: true,
    };
  }

  componentDidMount() {
    const {} = this.props;

    this.fetchPluginAndLayout();
  }

  fetchPluginAndLayout() {
    const { pluginVersionId } = this.props;
    PluginService.getLocalizedPluginLayoutFromVersionId(pluginVersionId)
      .then(res => {
        const { plugin, layout } = res;
        PluginService.getPluginVersion(plugin.id, pluginVersionId).then(
          pluginVersion => {
            if (layout) {
              this.setState({
                feedTitle: layout.metadata.display_name,
                pluginVersionValue: pluginVersion.data.version_id,
                assetUrl: layout.metadata.small_icon_asset_url,
                artifactId: plugin.artifact_id,
                isLoading: false,
              });
            } else {
              this.setState({
                feedTitle: plugin.artifact_id,
                artifactId: plugin.artifact_id,
                pluginVersionValue: pluginVersion.data.version_id,
                isLoading: false,
              });
            }
          },
        );
      })

      .catch(() =>
        this.setState({
          isLoading: false,
        }),
      );
  }

  goToFeedsTable = (artifactId: string, status: string) => () => {
    const {
      match: {
        params: { organisationId },
      },
      history,
      location: { search: currentSearch },
    } = this.props;

    const params = {
      artifactId: [artifactId],
      status: [status],
    };

    const pathname = `/v2/o/${organisationId}/audience/feeds`;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, FEEDS_SEARCH_SETTINGS),
    };

    return history.push(nextLocation);
  };

  getIconType = (status: IconColor) => {
    switch (status) {
      case 'ACTIVE':
        return 'play';
      case 'INITIAL':
        return 'status';
      case 'PAUSED':
        return 'pause';
      default:
        return 'status';
    }
  };

  render() {
    const { aggregatesByStatus, pluginVersionId } = this.props;

    const {
      artifactId,
      assetUrl,
      feedTitle,
      isLoading,
      pluginVersionValue,
    } = this.state;

    return (
      <Card className="feed-overview-card-content">
        {isLoading ? (
          <div className="wrapper loading">
            <Spin size="large" />
          </div>
        ) : (
          <div className="wrapper">
            <div className="card-header">
              {assetUrl ? (
                <img
                  className="image-title"
                  src={`${(window as any).MCS_CONSTANTS.ASSETS_URL}${assetUrl}`}
                />
              ) : (
                <div>
                  <i className="image-title placeholder" />
                </div>
              )}
            </div>

            <div className="feed-infos">
              <div className="feed-title">{feedTitle}</div>
              <div className="feed-version">{pluginVersionValue}</div>
            </div>

            <div className="feed-metrics">
              {['ACTIVE', 'PAUSED', 'INITIAL'].map(status => {
                const typedStatus = status as IconColor;
                return (
                  <MetricInfo
                    key={`card-${pluginVersionId}-${status}`}
                    color={typedStatus}
                    iconType={this.getIconType(typedStatus)}
                    message={metricStatusMessages[typedStatus]}
                    metricValue={aggregatesByStatus[typedStatus] || '0'}
                    tooltipMessage={tooltipStatusMessages[typedStatus]}
                    onClick={this.goToFeedsTable(artifactId || '', status)}
                  />
                );
              })}
            </div>
          </div>
        )}
      </Card>
    );
  }
}

export default compose<Props, AudienceFeedsOverviewCardProps>(
  withRouter,
  injectIntl,
)(AudienceFeedsOverviewCard);
