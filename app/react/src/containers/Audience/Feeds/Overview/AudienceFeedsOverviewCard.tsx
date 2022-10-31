import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { InjectedIntlProps, injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import { Card } from '@mediarithmics-private/mcs-components-library';
import MetricInfo, { IconColor } from '../../../../components/MetricInfo';
import { FEEDS_SEARCH_SETTINGS } from '../List/constants';
import { updateSearch } from '../../../../utils/LocationSearchHelper';
import { IPluginService } from '../../../../services/PluginService';
import { Spin } from 'antd';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';

type Props = RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps &
  InjectedNotificationProps &
  AudienceFeedsOverviewCardProps;

export type AgggregatesByStatus = { [status in IconColor]?: string };

type AudienceFeedsOverviewCardProps = {
  aggregatesByStatus: AgggregatesByStatus;
  pluginVersionId: string;
  feedType: string;
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
  @lazyInject(TYPES.IPluginService)
  private _pluginService: IPluginService;

  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: true,
    };
  }

  componentDidMount() {
    this.fetchPluginAndLayout();
  }

  fetchPluginAndLayout() {
    const { pluginVersionId, notifyError } = this.props;

    this.setState({ isLoading: true });

    this._pluginService
      .getLocalizedPluginLayoutFromVersionId(pluginVersionId)
      .then(res => {
        const { plugin, layout } = res;
        this._pluginService.getPluginVersion(plugin.id, pluginVersionId).then(pluginVersion => {
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
        });
      })
      .catch(err => {
        notifyError(err);
        this.setState({
          isLoading: false,
        });
      });
  }

  goToFeedsTable =
    (artifactId: string, status: string, feedType: string, versionId: string) => () => {
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
        feedType: [feedType],
        versionId: [versionId],
      };

      const nextLocation = {
        pathname: `/v2/o/${organisationId}/audience/feeds/list`,
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
    const { aggregatesByStatus, pluginVersionId, feedType } = this.props;

    const { artifactId, assetUrl, feedTitle, isLoading, pluginVersionValue } = this.state;

    return (
      <Card className='feed-overview-card-content'>
        {isLoading ? (
          <div className='wrapper loading'>
            <Spin size='large' />
          </div>
        ) : (
          <div className='wrapper'>
            <div className='card-header'>
              {assetUrl ? (
                <img
                  className='image-title'
                  src={`${(window as any).MCS_CONSTANTS.ASSETS_URL}${assetUrl}`}
                />
              ) : (
                <i className='image-title placeholder' />
              )}
            </div>

            <div className='feed-infos'>
              <div className='feed-title'>{feedTitle}</div>
              <div className='feed-version'>{pluginVersionValue}</div>
            </div>

            <div className='feed-metrics'>
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
                    onClick={this.goToFeedsTable(
                      artifactId || '',
                      status,
                      feedType,
                      pluginVersionId,
                    )}
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
  injectNotifications,
)(AudienceFeedsOverviewCard);
