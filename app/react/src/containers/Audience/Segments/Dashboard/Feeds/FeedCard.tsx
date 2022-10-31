import * as React from 'react';
import cuid from 'cuid';
import { Card } from '@mediarithmics-private/mcs-components-library';
import { AudienceFeedTyped } from '../../Edit/domain';
import FeedCardPlaceholder from './FeedCardPlaceholder';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { compose } from 'recompose';
import { IPluginService } from '../../../../../services/PluginService';
import { PluginCardModalTab } from '@mediarithmics-private/advanced-components';
import { PluginLayout } from '../../../../../models/plugin/PluginLayout';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { injectFeatures, InjectedFeaturesProps } from '../../../../Features';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import FeedCardTitle from './FeedCardTitle';
import FeedCardMenu from './FeedCardMenu';
import FeedCardContent from './FeedCardContent';
import { FeedCardStats } from './FeedCardList';

export interface FeedCardProps {
  feed: AudienceFeedTyped;
  onFeedUpdate: (newFeed: AudienceFeedTyped) => void;
  onFeedDelete: (feed: AudienceFeedTyped) => void;
  segmentId: string;
  organisationId: string;
  feedCardStats?: FeedCardStats;
}

export type FeedStatsDisplayStatus = 'LOADING' | 'READY' | 'READY-NO-DATA';

export type FeedCardComponent = 'FeedCard' | 'FeedCardTitle' | 'FeedCardMenu' | 'FeedCardContent';

interface FeedCardState {
  opened?: boolean;
  modalTab: PluginCardModalTab;
  pluginLayout?: PluginLayout;
  isLoadingCard: boolean;
}

type Props = FeedCardProps &
  InjectedNotificationProps &
  InjectedFeaturesProps &
  RouteComponentProps<{}>;

class FeedCard extends React.Component<Props, FeedCardState> {
  id: string = cuid();

  @lazyInject(TYPES.IPluginService)
  private _pluginService: IPluginService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoadingCard: true,
      opened: false,
      modalTab: 'configuration',
    };
  }

  componentDidMount() {
    const { feed } = this.props;
    this.setState({ isLoadingCard: true }, () => {
      this._pluginService
        .getLocalizedPluginLayoutFromVersionId(feed.version_id)
        .then(resPluginWithLayout => {
          this.setState({ pluginLayout: resPluginWithLayout.layout, isLoadingCard: false });
        })
        .catch(() => this.setState({ isLoadingCard: false }));
    });
  }

  setIsLoading = (isLoading: boolean, callback?: () => void) => {
    this.setState({ isLoadingCard: isLoading }, callback);
  };

  render() {
    const { feed, onFeedUpdate, onFeedDelete, segmentId, organisationId, feedCardStats } =
      this.props;

    const { pluginLayout, isLoadingCard } = this.state;

    if (isLoadingCard) {
      return <FeedCardPlaceholder />;
    }

    return (
      <Card className='mcs-feed-card'>
        <div>
          <div className='mcs-feedCard_header'>
            <FeedCardTitle feed={feed} pluginLayout={pluginLayout} />
            <FeedCardMenu
              feedCardId={this.id}
              feed={feed}
              segmentId={segmentId}
              pluginLayout={pluginLayout}
              organisationId={organisationId}
              onFeedDelete={onFeedDelete}
              onFeedUpdate={onFeedUpdate}
              setIsLoading={this.setIsLoading}
            />
          </div>
          <FeedCardContent
            feed={feed}
            segmentId={segmentId}
            feedCardStats={feedCardStats}
            onFeedUpdate={onFeedUpdate}
            pluginLayout={pluginLayout}
            organisationId={organisationId}
          />
        </div>
      </Card>
    );
  }
}

export default compose<Props, FeedCardProps>(
  withRouter,
  injectFeatures,
  injectNotifications,
)(FeedCard);
