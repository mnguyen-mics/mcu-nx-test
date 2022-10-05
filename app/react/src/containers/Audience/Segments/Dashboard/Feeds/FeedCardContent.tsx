import * as React from 'react';
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl';
import { AudienceFeedTyped } from '../../Edit/domain';
import { compose } from 'recompose';
import { InjectedFeaturesProps, injectFeatures } from '../../../../Features';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import {
  IAudienceSegmentFeedService,
  AudienceFeedType,
} from '../../../../../services/AudienceSegmentFeedService';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { Button } from '@mediarithmics-private/mcs-components-library';
import { Status } from '../../../../../models/Plugins';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { IExternalFeedSessionService } from '../../../../../services/ExternalFeedSessionService';
import { ExternalFeedSession } from '../../../../../models/ExternalFeedSession';

const messages = defineMessages({
  pause: {
    id: 'audienceFeed.status.actions.pause',
    defaultMessage: 'Pause',
  },
  activate: {
    id: 'audienceFeed.status.actions.activate',
    defaultMessage: 'Activate',
  },
  retry: {
    id: 'audienceFeed.status.actions.retry',
    defaultMessage: 'Retry',
  },
  notRunning: {
    id: 'audienceFeed.card.state.notRunning',
    defaultMessage: 'Not running',
  },
  willStartSendingData: {
    id: 'audienceFeed.card.state.willStartSendingData',
    defaultMessage: 'Target created, will start sending data soon',
  },
  errorDestinationSegment: {
    id: 'audienceFeed.card.state.errorDestinationSegment',
    defaultMessage: 'Error creating destination segment',
  },
  activatingState: {
    id: 'audienceFeed.card.state.activating',
    defaultMessage: 'Creating segment on destination',
  },
  initialLoadingSession: {
    id: 'audienceFeed.card.state.initialLoadingSession',
    defaultMessage: 'Sending data for all users in the segment',
  },
  liveSession: {
    id: 'audienceFeed.card.state.liveSession',
    defaultMessage: 'Sending updates when users enter or leave',
  },
  nbProcessingsLastWeek: {
    id: 'audienceFeed.card.stats.nbProcessings',
    defaultMessage: '{count} lines processed last week',
  },
  errorDetails: {
    id: 'audienceFeed.card.stats.errorDetails',
    defaultMessage: 'Error details',
  },
});

export interface FeedCardContentProps {
  feed: AudienceFeedTyped;
  segmentId: string;
  exportedUserPointsCount?: number;
  exportedUserIdentifiersCount?: number;
  onFeedUpdate: (newFeed: AudienceFeedTyped) => void;
}

type Props = FeedCardContentProps &
  InjectedIntlProps &
  InjectedFeaturesProps &
  InjectedNotificationProps;

interface State {
  currentFeedSession?: ExternalFeedSession;
  isLoading: Boolean;
  showActivatingState: Boolean;
}

class FeedCardContent extends React.Component<Props, State> {
  @lazyInject(TYPES.IExternalFeedSessionService)
  private _externalFeedSessionService: IExternalFeedSessionService;

  @lazyInject(TYPES.IAudienceSegmentFeedServiceFactory)
  _audienceSegmentFeedServiceFactory: (
    feedType: AudienceFeedType,
  ) => (segmentId: string) => IAudienceSegmentFeedService;

  private feedService: IAudienceSegmentFeedService;

  private _audienceExternalFeedServiceFactory: (segmentId: string) => IAudienceSegmentFeedService;
  private _audienceTagFeedServiceFactory: (segmentId: string) => IAudienceSegmentFeedService;

  constructor(props: Props) {
    super(props);
    this._audienceExternalFeedServiceFactory =
      this._audienceSegmentFeedServiceFactory('EXTERNAL_FEED');
    this._audienceTagFeedServiceFactory = this._audienceSegmentFeedServiceFactory('TAG_FEED');

    if (this.props.feed) {
      this.feedService =
        this.props.feed.type === 'EXTERNAL_FEED'
          ? this._audienceExternalFeedServiceFactory(this.props.segmentId)
          : this._audienceTagFeedServiceFactory(this.props.segmentId);
    }

    this.state = { isLoading: false, showActivatingState: false };
  }

  componentDidMount() {
    const { feed } = this.props;

    if (feed.type === 'EXTERNAL_FEED' && feed.status === 'ACTIVE') this.fetchLastFeedSession();
  }

  componentDidUpdate(prevProps: Props) {
    const { feed: prevFeed } = prevProps;
    const { feed } = this.props;

    if (feed.id !== prevFeed.id && feed.type === 'EXTERNAL_FEED' && feed.status === 'ACTIVE')
      this.fetchLastFeedSession();
  }

  fetchLastFeedSession = () => {
    const { feed, segmentId, notifyError } = this.props;

    if (feed.type === 'EXTERNAL_FEED') {
      this.setState({ isLoading: true }, () => {
        this._externalFeedSessionService
          .getExternalFeedSessions(segmentId, feed.id, {
            open: true,
          })
          .then(feedSessionsRes => {
            const sortedFeedSessions = feedSessionsRes.data.sort(
              (a, b) => b.open_date - a.open_date,
            );
            const lastFeedSession =
              sortedFeedSessions.length !== 0 ? sortedFeedSessions[0] : undefined;
            this.setState({ currentFeedSession: lastFeedSession, isLoading: false });
          })
          .catch(err => {
            notifyError(err);
            this.setState({ currentFeedSession: undefined, isLoading: false });
          });
      });
    }
  };

  renderActionButton = () => {
    const {
      feed,
      onFeedUpdate,
      notifyError,
      intl: { formatMessage },
    } = this.props;

    const editFeed = () => {
      const { type, ...formattedFeed } = feed;
      const actualStatus = feed.status;
      const nextBestAction = this.getNextBestAction();
      const newFormattedFeed =
        nextBestAction !== null
          ? {
              ...formattedFeed,
              status: nextBestAction,
            }
          : formattedFeed;

      this.setState(
        {
          isLoading: true,
          showActivatingState: actualStatus === 'INITIAL' || actualStatus === 'PAUSED',
        },
        () => {
          return this.feedService
            .updateAudienceFeed(feed.id, newFormattedFeed)
            .then(res => {
              this.setState({ isLoading: false, showActivatingState: false }, () => {
                onFeedUpdate({ ...res.data, type: 'EXTERNAL_FEED' });
              });
            })
            .catch(err => {
              notifyError(err);
              this.setState({ isLoading: false, showActivatingState: false });
            });
        },
      );
    };

    switch (feed.status) {
      case 'ACTIVE':
      case 'PUBLISHED':
        return <Button onClick={editFeed}>{formatMessage(messages.pause)}</Button>;
      case 'INITIAL':
      case 'PAUSED':
        return <Button onClick={editFeed}>{formatMessage(messages.activate)}</Button>;
      case 'ERROR':
        return <Button onClick={editFeed}>{formatMessage(messages.retry)}</Button>;
    }
  };

  getNextBestAction = (): Status | null => {
    const { feed } = this.props;

    if (
      (feed.status === 'INITIAL' && feed.type === 'EXTERNAL_FEED') ||
      (feed.status === 'PAUSED' && feed.type === 'EXTERNAL_FEED') ||
      (feed.status === 'ERROR' && feed.type === 'EXTERNAL_FEED') ||
      (feed.status === 'PAUSED' && feed.type === 'TAG_FEED')
    ) {
      return 'ACTIVE';
    } else if (
      (feed.status === 'PUBLISHED' && feed.type === 'EXTERNAL_FEED') ||
      (feed.status === 'ACTIVE' && feed.type === 'EXTERNAL_FEED') ||
      (feed.status === 'ACTIVE' && feed.type === 'TAG_FEED')
    ) {
      return 'PAUSED';
    } else return null;
  };

  getFeedStatusIcon = () => {
    const { feed } = this.props;
    const { currentFeedSession } = this.state;

    switch (feed.status) {
      case 'PUBLISHED':
        return (
          <div className='mcs-feedCard_stateIcons'>
            <CheckCircleOutlined />
            <ClockCircleOutlined className='mcs-feedCard_stateRightIcon' />
          </div>
        );
      case 'ERROR':
        return (
          <CloseCircleOutlined className='mcs-feedCard_stateIcon mcs-feedCard_stateIcon_error' />
        );
      case 'ACTIVE':
        return (
          <div className='mcs-feedCard_stateIcons'>
            <CheckCircleOutlined />
            {currentFeedSession?.status === 'INITIAL_LOADING' ? (
              <SyncOutlined className='mcs-feedCard_stateRightIcon' />
            ) : (
              <CheckCircleOutlined className='mcs-feedCard_stateRightIcon' />
            )}
          </div>
        );
      case 'INITIAL':
      case 'PAUSED':
        return null;
    }
  };

  getFeedStatusText = () => {
    const {
      feed,
      intl: { formatMessage },
    } = this.props;
    const { currentFeedSession } = this.state;

    switch (feed.status) {
      case 'INITIAL':
      case 'PAUSED':
        return formatMessage(messages.notRunning);
      case 'PUBLISHED':
        return formatMessage(messages.willStartSendingData);
      case 'ERROR':
        return formatMessage(messages.errorDestinationSegment);
      case 'ACTIVE':
        return formatMessage(
          currentFeedSession?.status === 'INITIAL_LOADING'
            ? messages.initialLoadingSession
            : messages.liveSession,
        );
    }
  };

  getFeedCardStats = () => {
    const {
      feed,
      intl: { formatMessage },
      exportedUserIdentifiersCount,
    } = this.props;

    switch (feed.status) {
      case 'ACTIVE':
        const nbProcessings = exportedUserIdentifiersCount
          ? exportedUserIdentifiersCount.toLocaleString('en')
          : '-';
        return (
          <div className='mcs-feedCard_content_stats'>
            {formatMessage(messages.nbProcessingsLastWeek, {
              count: nbProcessings,
            })}
          </div>
        );

      case 'ERROR':
        return (
          <div className='mcs-feedCard_content_stats mcs-feedCard_content_stats_error'>
            {formatMessage(messages.errorDetails)}
          </div>
        );
      default:
        return null;
    }
  };

  render() {
    const {
      feed,
      intl: { formatMessage },
    } = this.props;
    const { isLoading, showActivatingState } = this.state;

    if (showActivatingState) {
      return (
        <div className='mcs-feedCard_content'>
          <SyncOutlined className='mcs-feedCard_stateIcon' />
          <div className='mcs-feedCard_content_description'>
            <div className='mcs-feedCard_content_status'>
              {formatMessage(messages.activatingState)}
            </div>
            <div className='mcs-feedCard_content_statsAndAction'>
              <div className='mcs-feedCard_content_action mcs-feedCard_content_action_blankPlaceholder' />
            </div>
          </div>
        </div>
      );
    } else if (isLoading) {
      return (
        <div className='mcs-feedCard_content'>
          <div className='mcs-feedCard_content_description'>
            <div className='mcs-feedCard_content_status mcs-feedCard_content_status_placeholder' />
            <div className='mcs-feedCard_content_statsAndAction'>
              <div className='mcs-feedCard_content_action mcs-feedCard_content_action_placeholder' />
            </div>
          </div>
        </div>
      );
    } else
      return (
        <div className='mcs-feedCard_content'>
          {this.getFeedStatusIcon()}
          <div className='mcs-feedCard_content_description'>
            <div
              className={`mcs-feedCard_content_status ${
                feed.status === 'ERROR' ? 'mcs-feedCard_content_status_error' : ''
              }`}
            >
              {this.getFeedStatusText()}
            </div>
            <div className='mcs-feedCard_content_statsAndAction'>
              {this.getFeedCardStats()}
              <div
                className={`mcs-feedCard_content_action ${
                  feed.status === 'ERROR' ? 'mcs-feedCard_content_action_error' : ''
                }`}
              >
                {this.renderActionButton()}
              </div>
            </div>
          </div>
        </div>
      );
  }
}

export default compose<Props, FeedCardContentProps>(
  injectNotifications,
  injectIntl,
  injectFeatures,
)(FeedCardContent);
