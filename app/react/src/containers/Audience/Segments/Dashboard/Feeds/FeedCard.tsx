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
import PluginService from '../../../../../services/PluginService';
import PluginCardModal, { PluginCardModalProps } from '../../../../Plugin/Edit/PluginCard/PluginCardModal'
import { PluginLayout } from '../../../../../models/plugin/PluginLayout';
import { PropertyResourceShape } from '../../../../../models/plugin';
import { withRouter, RouteComponentProps } from 'react-router';
import AudienceSegmentFeedService from '../../../../../services/AudienceSegmentFeedService';

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
  opened?: boolean;
  pluginLayout?: PluginLayout;
  isLoadingCard: boolean;
  pluginProperties?: PropertyResourceShape[];
  initialValue?: { plugin: any, properties: any }
}

const FeedCardModal = PluginCardModal as React.ComponentClass<PluginCardModalProps<AudienceExternalFeedTyped | AudienceTagFeedTyped>>

type Props = FeedCardProps & InjectedNotificationProps & InjectedIntlProps & RouteComponentProps<{}>;

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
  feedService: AudienceSegmentFeedService;
  // @lazyInject(TYPES.IAudienceSegmentService)
  // private _audienceSegmentService: IAudienceSegmentService;


  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      isLoadingCard: true,
      opened: false,
      pluginProperties: []
    }

    if (this.props.feed) {
      this.feedService = new AudienceSegmentFeedService(this.props.segmentId, this.props.feed.type);
    }
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
                pluginLayout: resultPluginLayout,
                isLoading: false
              });
            }
          })
        }
      }).catch(() => this.setState({ isLoading: false }));
  }

  // fetch pluginLayout to render image and title

  renderActionButton = () => {
    const {
      feed,
      onFeedUpdate,
      notifyError,
      intl,
    } = this.props;

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

      this.setState({ isLoading: true })
      return this.feedService.updateAudienceFeed(feed.id, newFormattedFeed)
        .then(res => res.data)
        .then(res => {
          this.setState({ isLoading: false }, () => {
            onFeedUpdate({ ...res, type: 'EXTERNAL_FEED' })
          })

        })
        .catch(err => {
          this.setState({ isLoading: false })
          notifyError(err)
        })
    }

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
        return (
          <div className="fake-button-styleless-height" />
        );
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

  getPluginProperties = () => {
    const {
      feed,
    } = this.props;


    return PluginService.findPluginFromVersionId(feed.version_id)
      .then(res => PluginService.getPluginVersionProperty(res.data.id, res.data.current_version_id!))
      .then(res => this.setState({ pluginProperties: res.data }))

  }

  getInitialValues = () => {
    const { feed } = this.props;


    return this.feedService.getAudienceFeedProperty(feed.id)
      .then((res) => this.setState({ initialValue: { plugin: feed, properties: res.data.reduce((acc, val) => ({ ...acc, [val.technical_name]: { value: val.value } }), {}) } }))
  }

  updatePropertiesValue = (
    properties: PropertyResourceShape[],
    organisationId: string,
    pluginInstanceId: string,
  ) => {
    const updatePromise = this.feedService.updatePluginInstanceProperty

    const propertiesPromises: Array<Promise<any>> = [];
    properties.forEach(item => {
      propertiesPromises.push(
        updatePromise(
          organisationId,
          pluginInstanceId,
          item.technical_name,
          item,
        ),
      );
    });
    return Promise.all(propertiesPromises);
  };

  saveOrCreatePluginInstance = (
    pluginInstance: AudienceTagFeedTyped | AudienceExternalFeedTyped,
    properties: PropertyResourceShape[],
  ) => {

    const {
      notifyError,
      organisationId
    } = this.props;

    // if edition update and redirect
    const editPromise = this.feedService.updatePluginInstance
    this.setState({ isLoadingCard: true });
    const {
      type,
      version_value,
      version_id,
      status,
      ...newPluginInstance
    } = pluginInstance;

    return editPromise(pluginInstance.id!, newPluginInstance).then(() => {
      return this.updatePropertiesValue(
        properties,
        organisationId,
        pluginInstance.id!
      );
    }).then(() => {
      this.setState({ isLoadingCard: false, opened: false })
    })
      .catch((err: any) => {
        notifyError(err);
        this.setState({ isLoadingCard: false });
      });

  };

  render() {
    const {
      feed,
      onFeedDelete,
      segmentId,
      organisationId,
      notifyError,
      history,
      intl
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
        return this.setState({ isLoading: true }, () => this.feedService.deleteAudienceFeed(feed.id)
          .then(r => {
            this.setState({ isLoading: false })
            onFeedDelete(feed)
          })
          .catch(err => {
            this.setState({ isLoading: false })
            notifyError(err)
          })
        )
      }


      Modal.confirm({
        title: intl.formatMessage(messages.modalTitle),
        content: intl.formatMessage(messages.modalDescription),
        onOk: onOk,
      });
    };

    if (isLoading) {
      return <FeedPlaceholder />;
    }
    const openModal = () => {
      if (!this.state.pluginLayout) {
        return history.push(editFeed());
      } else {
        this.setState({ opened: true })
        this.setState({ isLoadingCard: true })
        return Promise.all([
          this.getPluginProperties(),
          this.getInitialValues(),
        ])
          .then(() => this.setState({ isLoadingCard: false }))
          .catch((err) => { notifyError(err); this.setState({ opened: false }) })
      }

    }

    const menu = (
      <Menu>
        <Menu.Item key="0">
          <a onClick={openModal}>{intl.formatMessage(messages.edit)}</a>
        </Menu.Item>
        <Menu.Item key="1">
          <a onClick={removeFeed}>{intl.formatMessage(messages.delete)}</a>
        </Menu.Item>
      </Menu>
    );

    const popupContainer = () => document.getElementById(this.id)!
    const onClose = () => this.setState({ opened: false })

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
        {this.state.opened && this.state.pluginLayout && this.state.pluginProperties && <FeedCardModal
          editionMode={true}
          disableFields={(feed.status === 'ACTIVE' || feed.status === 'PUBLISHED')}
          initialValues={this.state.initialValue}
          isLoading={this.state.isLoadingCard}
          onClose={onClose}
          opened={!!this.state.opened}
          organisationId={organisationId}
          plugin={feed}
          pluginLayout={this.state.pluginLayout!}
          pluginProperties={this.state.pluginProperties!}
          pluginVersionId={feed.version_id}
          save={this.saveOrCreatePluginInstance}
        />}
      </Card >
    );
  }
}

export default compose<Props, FeedCardProps>(
  withRouter,
  injectIntl,
  injectNotifications,
)(FeedCard);
