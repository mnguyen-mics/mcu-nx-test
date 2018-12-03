import * as React from 'react';
import cuid from 'cuid';
import { Card } from '../../../../../components/Card';
import {
  AudienceExternalFeedTyped,
  AudienceTagFeedTyped,
} from '../../Edit/domain';
import { McsIcon, ButtonStyleless } from '../../../../../components';
import FeedPlaceholder from './FeedPlaceholder';
import { Status } from '../../../../../models/Plugins';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { compose } from 'recompose';
import { Modal, Dropdown, Menu } from 'antd';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { Link } from 'react-router-dom';
import PluginService from '../../../../../services/PluginService';
import { IAudienceSegmentService } from '../../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';

export interface FeedCardProps {
  feed: AudienceExternalFeedTyped | AudienceTagFeedTyped;
  onFeedUpdate: (
    newFeed: AudienceExternalFeedTyped | AudienceTagFeedTyped,
  ) => void;
  onFeedDelete: (
    feed: AudienceExternalFeedTyped | AudienceTagFeedTyped,
  ) => void;
  segmentId: string;
  organisationId: string;
}

interface FeedCardState {
  isLoading: boolean;
  cardHeaderTitle?: string;
  cardHeaderThumbnail?: string;
}

type Props = FeedCardProps & InjectedNotificationProps & InjectedIntlProps;

const messages = defineMessages({
  modalTitle: {
    id: 'audienceFeed.modal.title',
    defaultMessage: 'Are you sure you want to continue ?',
  },
  modalDescription: {
    id: 'audienceFeed.modal.description',
    defaultMessage:
      'Are you sure you want delete this feed ? Carefull this action cannot be undone.',
  },
  pause: {
    id: 'audienceFeed.status.actions.pause',
    defaultMessage: 'Pause',
  },
  activate: {
    id: 'audienceFeed.status.actions.activate',
    defaultMessage: 'Activate',
  },
  resume: {
    id: 'audienceFeed.status.actions.resume',
    defaultMessage: 'Resume',
  },
  edit: {
    id: 'audienceFeed.card.actions.edit',
    defaultMessage: 'Edit',
  },
  view: {
    id: 'audienceFeed.card.actions.view',
    defaultMessage: 'View',
  },
  delete: {
    id: 'audienceFeed.card.actions.delete',
    defaultMessage: 'Delete',
  },
});

class FeedCard extends React.Component<Props, FeedCardState> {
  id: string = cuid();
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  componentDidMount() {
    const {
      feed
    } = this.props;

    PluginService.findPluginFromVersionId(feed.version_id)
      .then(res => {
        if (res !== null && res.status !== "error" && res.data.current_version_id) {
          PluginService.getLocalizedPluginLayout(
            res.data.id,
            res.data.current_version_id
          ).then(resultPluginLayout => {
            if (resultPluginLayout !== null) {
              this.setState({
                cardHeaderTitle: resultPluginLayout.metadata.display_name,
                cardHeaderThumbnail: resultPluginLayout.metadata.small_icon_asset_url,
              });
            }
          });
        }
    });
  }

  // fetch pluginLayout to render image and title

  renderActionButton = () => {
    const { feed, onFeedUpdate, segmentId, notifyError, intl } = this.props;

    const editFeed = () => {
      const { type, ...formattedFeed } = feed;
      const nextBestAction = this.getNextBestAction();
      let newFormattedFeed = formattedFeed;
      if (nextBestAction !== null) {
        newFormattedFeed = {
          ...formattedFeed,
          status: nextBestAction,
        };
      }

      if (feed.type === 'EXTERNAL_FEED') {
        this.setState({ isLoading: true });
        return this._audienceSegmentService
          .updateAudienceExternalFeeds(segmentId, feed.id, newFormattedFeed)
          .then(res => res.data)
          .then(res => {
            this.setState({ isLoading: false }, () => {
              onFeedUpdate({ ...res, type: 'EXTERNAL_FEED' });
            });
          })
          .catch(err => {
            this.setState({ isLoading: false });
            notifyError(err);
          });
      }
      if (feed.type === 'TAG_FEED') {
        this.setState({ isLoading: true });
        return this._audienceSegmentService
          .updateAudienceTagFeeds(segmentId, feed.id, newFormattedFeed)
          .then(res => res.data)
          .then(res => {
            this.setState({ isLoading: false }, () => {
              onFeedUpdate({ ...res, type: 'TAG_FEED' });
            });
          })
          .catch(err => {
            this.setState({ isLoading: false });
            notifyError(err);
          });
      }
      return;
    };

    switch (feed.status) {
      case 'ACTIVE':
        return (
          <ButtonStyleless onClick={editFeed}>
            {intl.formatMessage(messages.pause)}
          </ButtonStyleless>
        );
      case 'INITIAL':
        return (
          <ButtonStyleless onClick={editFeed}>
            {intl.formatMessage(messages.activate)}
          </ButtonStyleless>
        );
      case 'PAUSED':
        return (
          <ButtonStyleless onClick={editFeed}>
            {intl.formatMessage(messages.resume)}
          </ButtonStyleless>
        );
      case 'PUBLISHED':
        return null;
    }
  };

  generateStatusColor = () => {
    const { feed } = this.props;

    switch (feed.status) {
      case 'ACTIVE':
        return 'mcs-campaigns-status-active';
      case 'INITIAL':
        return 'mcs-campaigns-status-pending';
      case 'PAUSED':
        return 'mcs-campaigns-status-paused';
      case 'PUBLISHED':
        return 'mcs-campaigns-status-pending';
    }
  };

  getNextBestAction = (): Status | null => {
    const { feed } = this.props;

    switch (feed.status) {
      case 'ACTIVE':
        return 'PAUSED';
      case 'INITIAL':
        return 'ACTIVE';
      case 'PAUSED':
        return 'ACTIVE';
      case 'PUBLISHED':
        return null;
    }
  };

  render() {
    const {
      feed,
      onFeedDelete,
      segmentId,
      organisationId,
      notifyError,
      intl,
    } = this.props;

    const { isLoading, cardHeaderTitle, cardHeaderThumbnail } = this.state;

    const editFeed = () => {
      switch (feed.type) {
        case 'EXTERNAL_FEED':
          return `/v2/o/${organisationId}/audience/segments/${segmentId}/feeds/external/${
            feed.id
          }/edit`;
        case 'TAG_FEED':
          return `/v2/o/${organisationId}/audience/segments/${segmentId}/feeds/tag/${
            feed.id
          }/edit`;
      }
    };

    const removeFeed = () => {
      const onOk = () => {
        if (feed.type === 'EXTERNAL_FEED') {
          return this.setState({ isLoading: true }, () =>
            this._audienceSegmentService
              .deleteAudienceExternalFeeds(segmentId, feed.id)
              .then(r => {
                this.setState({ isLoading: false });
                onFeedDelete(feed);
              })
              .catch(err => {
                this.setState({ isLoading: false });
                notifyError(err);
              }),
          );
        }
        if (feed.type === 'TAG_FEED') {
          return this.setState({ isLoading: true }, () =>
            this._audienceSegmentService
              .deleteAudienceTagFeeds(segmentId, feed.id)
              .then(r => {
                this.setState({ isLoading: false });
                onFeedDelete(feed);
              })
              .catch(err => {
                this.setState({ isLoading: false });
                notifyError(err);
              }),
          );
        }
        return;
      };

      Modal.confirm({
        title: intl.formatMessage(messages.modalTitle),
        content: intl.formatMessage(messages.modalDescription),
        onOk: onOk,
      });
    };

    if (isLoading) {
      return <FeedPlaceholder />;
    }

    const menu = (
      <Menu>
        <Menu.Item key="0">
          <Link to={editFeed()}>{intl.formatMessage(messages.edit)}</Link>
        </Menu.Item>
        <Menu.Item key="1">
          <a onClick={removeFeed}>{intl.formatMessage(messages.delete)}</a>
        </Menu.Item>
      </Menu>
    );

    const popupContainer = () => document.getElementById(this.id)!;

    return (
      <Card className="hoverable-card actionable-card compact feed-card">
        <hr />
        <div className="top-menu" id={this.id}>
          <Dropdown
            overlay={menu}
            trigger={['click']}
            getPopupContainer={popupContainer}
          >
            <a>
              <McsIcon type="dots" />
            </a>
          </Dropdown>
        </div>
        <div className="wrapper">
          <div className="card-header">
            {cardHeaderThumbnail ? (
              <img
                className="image-title"
                src={`${
                  (window as any).MCS_CONSTANTS.ASSETS_URL
                  }${cardHeaderThumbnail}`}
              />
            ) : (
              undefined
            )}
            <div className="title">
              {cardHeaderTitle ? cardHeaderTitle : feed.artifact_id}
            </div>
          </div>
          <div className="content">
            <div>
              <McsIcon type="status" className={this.generateStatusColor()} />{' '}
              {feed.status}
            </div>
          </div>
          <div className="actions">{this.renderActionButton()}</div>
        </div>
      </Card>
    );
  }
}

export default compose<Props, FeedCardProps>(
  injectIntl,
  injectNotifications,
)(FeedCard);
