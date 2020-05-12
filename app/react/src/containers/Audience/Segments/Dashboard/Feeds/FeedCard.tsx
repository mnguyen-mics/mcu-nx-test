import * as React from 'react';
import cuid from 'cuid';
import { Card } from '@mediarithmics-private/mcs-components-library';
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
import { Modal, Dropdown, Menu, Tooltip } from 'antd';
import { injectIntl, InjectedIntlProps, defineMessages, InjectedIntl } from 'react-intl';
import { IPluginService } from '../../../../../services/PluginService';
import PluginCardModal, {
  PluginCardModalProps,
} from '../../../../Plugin/Edit/PluginCard/PluginCardModal';
import { PluginLayout } from '../../../../../models/plugin/PluginLayout';
import { PropertyResourceShape } from '../../../../../models/plugin';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectFeatures, InjectedFeaturesProps } from '../../../../Features';
import { PluginCardModalTab } from '../../../../Plugin/Edit/PluginCard/PluginCardModalContent';
import { withValidators } from '../../../../../components/Form';
import { ValidatorProps } from '../../../../../components/Form/withValidators';
import {
  IAudienceSegmentFeedService,
  AudienceFeedType,
} from '../../../../../services/AudienceSegmentFeedService';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { FeedStatsUnit, getFeedStatsUnit, FeedStatsCounts } from '../../../../../utils/FeedsStatsReportHelper';

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
  exportedUserPointsCount?: number;
  exportedUserIdentifiersCount?: number;
}

type FeedStatsDisplayStatus = "LOADING" | "READY" | "READY-NO-DATA";

interface FeedCardState {
  isLoading: boolean;
  cardHeaderTitle?: string;
  cardHeaderThumbnail?: string;
  opened?: boolean;
  modalTab: PluginCardModalTab;
  pluginLayout?: PluginLayout;
  isLoadingCard: boolean;
  pluginProperties?: PropertyResourceShape[];
  initialValue?: { plugin: any; properties: any };
}

const FeedCardModal = PluginCardModal as React.ComponentClass<
  PluginCardModalProps<AudienceExternalFeedTyped | AudienceTagFeedTyped>
>;

type Props = FeedCardProps &
  InjectedNotificationProps &
  InjectedIntlProps &
  InjectedFeaturesProps &
  ValidatorProps &
  RouteComponentProps<{}>;

const messages = defineMessages({
  modalTitle: {
    id: 'audienceFeed.modal.title',
    defaultMessage: 'Are you sure you want to continue ?',
  },
  modalDescription: {
    id: 'audienceFeed.modal.description',
    defaultMessage:
      'Are you sure you want delete this feed ? Careful this action cannot be undone.',
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
  stats: {
    id: 'audienceFeed.card.actions.stats',
    defaultMessage: 'Stats (BETA)',
  },
  inTheLast7Days: {
    id: 'audienceFeed.card.inTheLast7Days',
    defaultMessage: 'In the last 7 days... (BETA)',
  },
  view: {
    id: 'audienceFeed.card.actions.view',
    defaultMessage: 'View',
  },
  delete: {
    id: 'audienceFeed.card.actions.delete',
    defaultMessage: 'Delete',
  },
  loadingStats: {
    id: 'audienceFeed.card.loadingStats',
    defaultMessage: 'Loading stats...',
  },
  nothingSent: {
    id: 'audienceFeed.card.nothingSent',
    defaultMessage: 'Nothing was sent',
  },
  userPointsSent: {
    id: 'audienceFeed.card.userPointsSent',
    defaultMessage: 'user points sent',
  },
  identifiersSent: {
    id: 'audienceFeed.card.identifiersSent',
    defaultMessage: 'identifiers (cookies, mobile IDs) sent',
  },
  feedModalNameFieldLabel: {
    id: 'audience.segment.feed.card.create.nameField.label',
    defaultMessage: 'Name',
  },
  feedModalNameFieldTitle: {
    id: 'audience.segment.feed.card.create.nameField.title',
    defaultMessage: 'The name used to identify this feed.',
  },
  feedModalNameFieldTitleWarning: {
    id: 'audience.segment.feed.card.create.nameField.title.warning',
    defaultMessage: "Warning: This name is only used in the platform, it won't be visible on the external system.",
  },
  feedModalNameFieldPlaceholder: {
    id: 'audience.segment.feed.card.create.nameField.placeholder',
    defaultMessage: 'Name',
  },
});

class FeedCard extends React.Component<Props, FeedCardState> {
  id: string = cuid();

  @lazyInject(TYPES.IAudienceSegmentFeedServiceFactory)
  _audienceSegmentFeedServiceFactory: (
    feedType: AudienceFeedType,
  ) => (segmentId: string) => IAudienceSegmentFeedService;

  private feedService: IAudienceSegmentFeedService;

  private _audienceExternalFeedServiceFactory: (
    segmentId: string,
  ) => IAudienceSegmentFeedService;
  private _audienceTagFeedServiceFactory: (
    segmentId: string,
  ) => IAudienceSegmentFeedService;

  @lazyInject(TYPES.IPluginService)
  private _pluginService: IPluginService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      isLoadingCard: true,
      opened: false,
      modalTab: 'configuration',
      pluginProperties: [],
    };

    this._audienceExternalFeedServiceFactory = this._audienceSegmentFeedServiceFactory(
      'EXTERNAL_FEED',
    );
    this._audienceTagFeedServiceFactory = this._audienceSegmentFeedServiceFactory(
      'TAG_FEED',
    );

    if (this.props.feed) {
      this.feedService =
        this.props.feed.type === 'EXTERNAL_FEED'
          ? this._audienceExternalFeedServiceFactory(this.props.segmentId)
          : this._audienceTagFeedServiceFactory(this.props.segmentId);
    }
  }

  componentDidMount() {
    const { feed } = this.props;

    this._pluginService
      .findPluginFromVersionId(feed.version_id)
      .then(res => {
        if (
          res !== null &&
          res.status !== 'error' &&
          res.data.current_version_id
        ) {
          this._pluginService
            .getLocalizedPluginLayout(res.data.id, res.data.current_version_id)
            .then(resultPluginLayout => {
              if (resultPluginLayout !== null) {
                this.setState({
                  cardHeaderTitle: resultPluginLayout.metadata.display_name,
                  cardHeaderThumbnail:
                    resultPluginLayout.metadata.small_icon_asset_url,
                  pluginLayout: resultPluginLayout,
                  isLoading: false,
                });
              }
            });
        }
      })
      .catch(() => this.setState({ isLoading: false }));
  }

  // fetch pluginLayout to render image and title

  renderActionButton = () => {
    const { feed, onFeedUpdate, notifyError, intl } = this.props;

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

      this.setState({ isLoading: true });
      return this.feedService
        .updateAudienceFeed(feed.id, newFormattedFeed)
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
        return <div className="feedcard-placeholder" />;
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
    const { feed } = this.props;

    return this._pluginService
      .findPluginFromVersionId(feed.version_id)
      .then(res =>
        this._pluginService.getPluginVersionProperty(
          res.data.id,
          res.data.current_version_id!,
        ),
      )
      .then(res => this.setState({ pluginProperties: res.data }));
  };

  getInitialValues = () => {
    const { feed } = this.props;

    return this.feedService.getAudienceFeedProperty(feed.id).then(res =>
      this.setState({
        initialValue: {
          plugin: feed,
          properties: res.data.reduce(
            (acc, val) => ({
              ...acc,
              [val.technical_name]: { value: val.value },
            }),
            {},
          ),
        },
      }),
    );
  };

  updatePropertiesValue = (
    properties: PropertyResourceShape[],
    organisationId: string,
    pluginInstanceId: string,
  ) => {
    const updatePromise = this.feedService.updatePluginInstanceProperty;

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
    name?: string,
  ) => {
    const { notifyError, organisationId, onFeedUpdate } = this.props;

    // if edition update and redirect
    const editPromise = this.feedService.updatePluginInstance;
    this.setState({ isLoadingCard: true });
    const {
      type,
      version_value,
      version_id,
      status,
      ...newPluginInstance
    } = pluginInstance;

    return editPromise(pluginInstance.id!, name ? { ...newPluginInstance, name: name } : newPluginInstance)
      .then(() => {
        return this.updatePropertiesValue(
          properties,
          organisationId,
          pluginInstance.id!,
        );
      })
      .then(() => {
        this.setState({ isLoadingCard: false, opened: false });
        onFeedUpdate(name ? { ...pluginInstance, name: name } : pluginInstance)
      })
      .catch((err: any) => {
        notifyError(err);
        this.setState({ isLoadingCard: false });
      });
  };

  getFeedStatsDisplayStatus(counts: FeedStatsCounts): FeedStatsDisplayStatus {

    // If the count is null, the stat request is not complete yet
    if (counts.exportedUserIdentifiersCount == null && counts.exportedUserPointsCount == null) return "LOADING";
    // If both counts are 0, we'll display a message to tell that nothing was sent
    else if (counts.exportedUserIdentifiersCount === 0 && counts.exportedUserPointsCount === 0) return "READY-NO-DATA";
    else return "READY";
  }

  getFeedStatsDisplayMsg(intl: InjectedIntl, status: FeedStatsDisplayStatus, unit: FeedStatsUnit, counts: FeedStatsCounts): string {

    switch (status) {
      case "LOADING":
        return intl.formatMessage(messages.loadingStats);
      case "READY-NO-DATA":
        return intl.formatMessage(messages.nothingSent);
      case "READY":
        switch (unit) {
          case "USER_POINTS":
            return `${counts.exportedUserPointsCount ? counts.exportedUserPointsCount.toLocaleString() : '-'} ${intl.formatMessage(messages.userPointsSent)}`;
          case "USER_IDENTIFIERS":
            return `${counts.exportedUserIdentifiersCount ? counts.exportedUserIdentifiersCount.toLocaleString() : '-'} ${intl.formatMessage(messages.identifiersSent)}`;
          // Should not happen
          default:
            return "error";
        }
      default:
        return "error";
    }
  }

  render() {
    const {
      feed,
      onFeedDelete,
      segmentId,
      organisationId,
      exportedUserPointsCount,
      exportedUserIdentifiersCount,
      notifyError,
      hasFeature,
      history,
      intl,
      fieldValidators: {
        isRequired
      },
      intl: {
        formatMessage,
      },
    } = this.props;

    const { isLoading, cardHeaderTitle, cardHeaderThumbnail } = this.state;

    const editFeed = () => {
      switch (feed.type) {
        case 'EXTERNAL_FEED':
          return `/v2/o/${organisationId}/audience/segments/${segmentId}/feeds/external/${feed.id}/edit`;
        case 'TAG_FEED':
          return `/v2/o/${organisationId}/audience/segments/${segmentId}/feeds/tag/${feed.id}/edit`;
      }
    };

    const removeFeed = () => {
      const onOk = () => {
        return this.setState({ isLoading: true }, () =>
          this.feedService
            .deleteAudienceFeed(feed.id)
            .then(r => {
              this.setState({ isLoading: false });
              onFeedDelete(feed);
            })
            .catch(err => {
              this.setState({ isLoading: false });
              notifyError(err);
            }),
        );
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
    const openModal = (tab: PluginCardModalTab) => () => {
      if (!this.state.pluginLayout) {
        return history.push(editFeed());
      } else {
        this.setState({ opened: true, isLoadingCard: true, modalTab: tab });
        return Promise.all([
          this.getPluginProperties(),
          this.getInitialValues(),
        ])
          .then(() => this.setState({ isLoadingCard: false }))
          .catch(err => {
            notifyError(err);
            this.setState({ opened: false });
          });
      }
    };

    const menu = (
      <Menu>
        <Menu.Item key="0">
          <a onClick={openModal('configuration')}>
            {intl.formatMessage(messages.edit)}
          </a>
        </Menu.Item>
        {hasFeature('audience-feeds_stats') ? (
          <Menu.Item key="1">
            <a onClick={openModal('stats')}>
              {intl.formatMessage(messages.stats)}
            </a>
          </Menu.Item>
        ) : null}
        <Menu.Item key="2">
          <a onClick={removeFeed}>{intl.formatMessage(messages.delete)}</a>
        </Menu.Item>
      </Menu>
    );

    const popupContainer = () => document.getElementById(this.id)!;
    const onClose = () => this.setState({ opened: false });


    const counts: FeedStatsCounts = { exportedUserPointsCount, exportedUserIdentifiersCount };
    const feedStatsStatus = this.getFeedStatsDisplayStatus(counts);
    const feedStatsUnit = getFeedStatsUnit(feed);
    const feedStatsDisplayMsg = this.getFeedStatsDisplayMsg(intl, feedStatsStatus, feedStatsUnit, counts);

    return (
      <Card className="hoverable-card actionable-card compact feed-card">
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
              {
                feed.name &&
                <div className="feed-name">
                  {feed.name}
                </div>
              }
              <div className="plugin-name">
                {cardHeaderTitle
                  ? cardHeaderTitle
                  : feed.artifact_id}
              </div>
            </div>
          </div>
          <div className="content">
            <div className="content-left">
              <McsIcon type="status" className={this.generateStatusColor()} />{' '}
              {feed.status}
            </div>
            {hasFeature('audience-feeds_stats') && (
              <div className="content-right">
                {feedStatsDisplayMsg}{' '}
                <Tooltip placement="topRight" title={intl.formatMessage(messages.inTheLast7Days)}>
                  {' '}
                  <McsIcon style={{ marginRight: '0px' }} type="info" />
                </Tooltip>
              </div>
            )}
          </div>
          <div className="actions">{this.renderActionButton()}</div>
        </div>
        {this.state.opened &&
          this.state.pluginLayout &&
          this.state.pluginProperties && (
            <FeedCardModal
              editionMode={true}
              disableFields={
                feed.status === 'ACTIVE' || feed.status === 'PUBLISHED'
              }
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
              selectedTab={this.state.modalTab}
              feedStatsUnit={feedStatsUnit}
              nameField={{
                label: formatMessage(messages.feedModalNameFieldLabel),
                title: <div>
                  {formatMessage(messages.feedModalNameFieldTitle)}
                  <br />
                  <b>{formatMessage(messages.feedModalNameFieldTitleWarning)}</b>
                </div>,
                placeholder: formatMessage(messages.feedModalNameFieldPlaceholder),
                display: true,
                disabled: feed.status === 'ACTIVE' || feed.status === 'PUBLISHED',
                value: feed.name,
                validator: [isRequired]
              }}
            />
          )}
      </Card>
    );
  }
}

export default compose<Props, FeedCardProps>(
  withRouter,
  injectIntl,
  injectFeatures,
  injectNotifications,
  withValidators
)(FeedCard);
