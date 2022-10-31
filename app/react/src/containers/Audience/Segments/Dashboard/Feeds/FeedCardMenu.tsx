import { PluginCardModalTab, PluginLayout } from '@mediarithmics-private/advanced-components';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { Dropdown, Menu, Modal } from 'antd';
import * as React from 'react';
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { InjectedFeaturesProps, injectFeatures } from '../../../../Features';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { AudienceFeedTyped } from '../../Edit/domain';
import {
  IAudienceSegmentFeedService,
  AudienceFeedType,
} from '../../../../../services/AudienceSegmentFeedService';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import FeedCardModal from './FeedCardModal';

const messages = defineMessages({
  modalTitle: {
    id: 'audienceFeed.modal.title',
    defaultMessage: 'Are you sure you want to continue?',
  },
  modalDescription: {
    id: 'audienceFeed.modal.description',
    defaultMessage: 'Are you sure you want delete this feed? Careful this action cannot be undone.',
  },
  edit: {
    id: 'audienceFeed.card.actions.edit',
    defaultMessage: 'Edit',
  },
  stats: {
    id: 'audienceFeed.card.actions.stats',
    defaultMessage: 'Stats',
  },
  delete: {
    id: 'audienceFeed.card.actions.delete',
    defaultMessage: 'Delete',
  },
});

export interface FeedCardMenuProps {
  feedCardId: string;
  feed: AudienceFeedTyped;
  segmentId: string;
  pluginLayout?: PluginLayout;
  organisationId: string;
  onFeedDelete: (feed: AudienceFeedTyped) => void;
  onFeedUpdate: (newFeed: AudienceFeedTyped) => void;
  setIsLoading: (isLoading: boolean, callback?: () => void) => void;
}

type Props = FeedCardMenuProps &
  InjectedFeaturesProps &
  InjectedNotificationProps &
  InjectedIntlProps &
  RouteComponentProps<{}>;

interface State {
  openedModal: boolean;
  modalTab: PluginCardModalTab;
}

class FeedCardMenu extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceSegmentFeedServiceFactory)
  _audienceSegmentFeedServiceFactory: (
    feedType: AudienceFeedType,
  ) => (segmentId: string) => IAudienceSegmentFeedService;

  private feedService: IAudienceSegmentFeedService;

  private _audienceExternalFeedServiceFactory: (segmentId: string) => IAudienceSegmentFeedService;
  private _audienceTagFeedServiceFactory: (segmentId: string) => IAudienceSegmentFeedService;

  constructor(props: Props) {
    super(props);

    this.state = { openedModal: false, modalTab: 'configuration' };

    this._audienceExternalFeedServiceFactory =
      this._audienceSegmentFeedServiceFactory('EXTERNAL_FEED');
    this._audienceTagFeedServiceFactory = this._audienceSegmentFeedServiceFactory('TAG_FEED');

    if (this.props.feed) {
      this.feedService =
        this.props.feed.type === 'EXTERNAL_FEED'
          ? this._audienceExternalFeedServiceFactory(this.props.segmentId)
          : this._audienceTagFeedServiceFactory(this.props.segmentId);
    }
  }

  removeFeed = () => {
    const {
      intl: { formatMessage },
      feed,
      onFeedDelete,
      notifyError,
      setIsLoading,
    } = this.props;
    const onOk = () => {
      return setIsLoading(true, () => {
        this.feedService
          .deleteAudienceFeed(feed.id)
          .then(r => {
            setIsLoading(false, () => {
              onFeedDelete(feed);
            });
          })
          .catch(err => {
            notifyError(err);
            setIsLoading(false);
          });
      });
    };

    Modal.confirm({
      title: formatMessage(messages.modalTitle),
      content: formatMessage(messages.modalDescription),
      onOk: onOk,
    });
  };

  editFeedDirectly = () => {
    const { organisationId, segmentId, feed } = this.props;
    switch (feed.type) {
      case 'EXTERNAL_FEED':
        return `/v2/o/${organisationId}/audience/segments/${segmentId}/feeds/external/${feed.id}/edit`;
      case 'TAG_FEED':
        return `/v2/o/${organisationId}/audience/segments/${segmentId}/feeds/tag/${feed.id}/edit`;
    }
  };

  editFeed = (tab: PluginCardModalTab) => () => {
    const { pluginLayout, history } = this.props;

    if (!pluginLayout) {
      return history.push(this.editFeedDirectly());
    } else {
      this.setState({ openedModal: true, modalTab: tab });
    }
  };

  closeModal = () => {
    this.setState({ openedModal: false });
  };

  render() {
    const {
      feedCardId,
      feed,
      organisationId,
      segmentId,
      pluginLayout,
      intl: { formatMessage },
      hasFeature,
      onFeedUpdate,
    } = this.props;

    const { openedModal, modalTab } = this.state;

    const popupContainer = () => document.getElementById(feedCardId)!;

    const menu = (
      <Menu className='mcs-menu-antd-customized'>
        <Menu.Item key='0'>
          <a onClick={this.editFeed('configuration')}>{formatMessage(messages.edit)}</a>
        </Menu.Item>
        {hasFeature('audience-feeds_stats') ? (
          <Menu.Item key='1'>
            <a onClick={this.editFeed('stats')}>{formatMessage(messages.stats)}</a>
          </Menu.Item>
        ) : null}
        <Menu.Item key='2'>
          <a onClick={this.removeFeed}>{formatMessage(messages.delete)}</a>
        </Menu.Item>
      </Menu>
    );

    return (
      <div className='mcs-feedCard_topMenu' id={feedCardId}>
        <Dropdown overlay={menu} trigger={['click']} getPopupContainer={popupContainer}>
          <a>
            <McsIcon type='dots' />
          </a>
        </Dropdown>
        <FeedCardModal
          feed={feed}
          pluginLayout={pluginLayout}
          organisationId={organisationId}
          segmentId={segmentId}
          openedModal={openedModal}
          modalTab={modalTab}
          closeModal={this.closeModal}
          onFeedUpdate={onFeedUpdate}
        />
      </div>
    );
  }
}

export default compose<Props, FeedCardMenuProps>(
  withRouter,
  injectFeatures,
  injectNotifications,
  injectIntl,
)(FeedCardMenu);
