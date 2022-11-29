import {
  PluginCardModal,
  PluginCardModalProps,
  PluginCardModalTab,
  PluginLayout,
  withValidators,
} from '@mediarithmics-private/advanced-components';
import { PropertyResourceShape } from '@mediarithmics-private/advanced-components/lib/models/plugin';
import * as React from 'react';
import { defineMessages, WrappedComponentProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { AudienceFeedTyped } from '../../Edit/domain';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IPluginService } from '../../../../../services/PluginService';
import { ValidatorProps } from '@mediarithmics-private/advanced-components/lib/components/form/withValidators';
import {
  IAudienceSegmentFeedService,
  AudienceFeedType,
} from '../../../../../services/AudienceSegmentFeedService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import McsMoment from '../../../../../utils/McsMoment';
import FeedTroublehshooting from './Troubleshooting/FeedTroubleshooting';
import FeedStats from './Stats/FeedStats';

const messages = defineMessages({
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
    defaultMessage:
      "Warning: This name is only used in the platform, it won't be visible on the external system.",
  },
  feedModalNameFieldPlaceholder: {
    id: 'audience.segment.feed.card.create.nameField.placeholder',
    defaultMessage: 'Name',
  },
});

const Modal = PluginCardModal as React.ComponentClass<PluginCardModalProps<AudienceFeedTyped>>;

export interface FeedCardModalProps {
  openedModal: boolean;
  modalTab: PluginCardModalTab;
  feed: AudienceFeedTyped;
  organisationId: string;
  segmentId: string;
  pluginLayout?: PluginLayout;
  closeModal: () => void;
  onFeedUpdate: (newFeed: AudienceFeedTyped) => void;
}

type Props = FeedCardModalProps &
  WrappedComponentProps &
  InjectedNotificationProps &
  ValidatorProps;

interface State {
  isLoading: boolean;
  pluginProperties?: PropertyResourceShape[];
  initialValue?: { plugin: any; properties: any };
}

class FeedCardModal extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceSegmentFeedServiceFactory)
  _audienceSegmentFeedServiceFactory: (
    feedType: AudienceFeedType,
  ) => (segmentId: string) => IAudienceSegmentFeedService;

  private feedService: IAudienceSegmentFeedService;

  private _audienceExternalFeedServiceFactory: (segmentId: string) => IAudienceSegmentFeedService;
  private _audienceTagFeedServiceFactory: (segmentId: string) => IAudienceSegmentFeedService;

  @lazyInject(TYPES.IPluginService)
  private _pluginService: IPluginService;

  constructor(props: Props) {
    super(props);

    const { segmentId, feed } = props;

    this.state = {
      isLoading: false,
      pluginProperties: [],
      initialValue: undefined,
    };

    this._audienceExternalFeedServiceFactory =
      this._audienceSegmentFeedServiceFactory('EXTERNAL_FEED');
    this._audienceTagFeedServiceFactory = this._audienceSegmentFeedServiceFactory('TAG_FEED');

    if (feed) {
      this.feedService =
        feed.type === 'EXTERNAL_FEED'
          ? this._audienceExternalFeedServiceFactory(segmentId)
          : this._audienceTagFeedServiceFactory(segmentId);
    }
  }

  componentDidMount() {
    const { notifyError, closeModal } = this.props;
    this.setState({ isLoading: true }, () => {
      return Promise.all([this.getPluginProperties(), this.getInitialValues()])
        .then(() => this.setState({ isLoading: false }))
        .catch(err => {
          notifyError(err);
          this.setState({ isLoading: false });
          closeModal();
        });
    });
  }

  getPluginProperties = () => {
    const { feed } = this.props;

    return this._pluginService
      .findPluginFromVersionId(feed.version_id)
      .then(res =>
        this._pluginService.getPluginVersionProperties(res.data.id, res.data.current_version_id!),
      )
      .then(res => this.setState({ pluginProperties: res.data }));
  };

  getInitialValues = () => {
    const { feed } = this.props;

    return this.feedService.getAudienceFeedProperties(feed.id).then(res =>
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
        updatePromise(organisationId, pluginInstanceId, item.technical_name, item),
      );
    });
    return Promise.all(propertiesPromises);
  };

  saveOrCreatePluginInstance = (
    pluginInstance: AudienceFeedTyped,
    properties: PropertyResourceShape[],
    name?: string,
    description?: string,
    activate?: boolean,
  ) => {
    const { notifyError, organisationId, onFeedUpdate, closeModal } = this.props;

    // if edition update and redirect
    const editPromise = this.feedService.updatePluginInstance;
    this.setState({ isLoading: true });
    const { type, version_value, version_id, status, ...newPluginInstance } = pluginInstance;

    return editPromise(
      pluginInstance.id!,
      name ? { ...newPluginInstance, name: name } : newPluginInstance,
    )
      .then(() => {
        return this.updatePropertiesValue(properties, organisationId, pluginInstance.id!);
      })
      .then(() => {
        if (!activate) return Promise.resolve(undefined);
        return this.feedService.updateAudienceFeed(pluginInstance.id, {
          ...pluginInstance,
          status: 'ACTIVE',
        });
      })
      .then(() => {
        this.setState({ isLoading: false }, () => {
          closeModal();
          onFeedUpdate(
            name
              ? {
                  ...pluginInstance,
                  name: name,
                  status: activate ? 'ACTIVE' : pluginInstance.status,
                }
              : { ...pluginInstance, status: activate ? 'ACTIVE' : pluginInstance.status },
          );
        });
      })
      .catch((err: any) => {
        notifyError(err);
        this.setState({ isLoading: false });
      });
  };

  render() {
    const {
      feed,
      pluginLayout,
      intl: { formatMessage },
      openedModal,
      closeModal,
      modalTab,
      organisationId,
      fieldValidators: { isRequired },
    } = this.props;

    const { isLoading, initialValue, pluginProperties } = this.state;

    return openedModal && pluginLayout && pluginProperties ? (
      <Modal
        editionMode={true}
        disableFields={feed.status === 'ACTIVE' || feed.status === 'PUBLISHED'}
        initialValues={initialValue}
        isLoading={isLoading}
        onClose={closeModal}
        opened={openedModal}
        organisationId={organisationId}
        plugin={{
          ...feed,
          plugin_type:
            feed.type === 'EXTERNAL_FEED'
              ? 'AUDIENCE_SEGMENT_EXTERNAL_FEED'
              : 'AUDIENCE_SEGMENT_TAG_FEED',
        }}
        pluginLayout={pluginLayout}
        pluginProperties={pluginProperties}
        pluginVersionId={feed.version_id}
        save={this.saveOrCreatePluginInstance}
        selectedTab={modalTab}
        pluginChart={<FeedStats feed={feed} />}
        troubleshootingTab={
          <FeedTroublehshooting
            feed={feed}
            dateRange={{
              from: new McsMoment('now-7d'),
              to: new McsMoment('now'),
            }}
          />
        }
        nameField={{
          label: formatMessage(messages.feedModalNameFieldLabel),
          title: (
            <div>
              {formatMessage(messages.feedModalNameFieldTitle)}
              <br />
              <b>{formatMessage(messages.feedModalNameFieldTitleWarning)}</b>
            </div>
          ),
          placeholder: formatMessage(messages.feedModalNameFieldPlaceholder),
          display: true,
          disabled: feed.status === 'ACTIVE' || feed.status === 'PUBLISHED',
          value: feed.name,
          validator: [isRequired],
        }}
      />
    ) : null;
  }
}

export default compose<Props, FeedCardModalProps>(
  injectIntl,
  injectNotifications,
  withValidators,
)(FeedCardModal);
