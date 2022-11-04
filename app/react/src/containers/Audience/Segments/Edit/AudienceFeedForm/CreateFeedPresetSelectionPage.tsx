import * as React from 'react';
import { Layout, Row, Col } from 'antd';
import { FormTitle } from '../../../../../components/Form';
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl';
import { AudienceFeedType } from '../../../../../services/AudienceSegmentFeedService';
import { compose } from 'recompose';
import { EditContentLayout } from '../../../../../components/Layout';
import { IPluginService } from '../../../../../services/PluginService';
import { PluginResource, LayoutablePlugin } from '../../../../../models/Plugins';
import { PluginCard, PluginCardModal } from '@mediarithmics-private/advanced-components';
import { Loading } from '../../../../../components';
import { PropertyResourceShape } from '../../../../../models/plugin';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import withValidators, { ValidatorProps } from '../../../../../components/Form/withValidators';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';

type CreateFeedPresetSelectionPageProps = {
  feedType: AudienceFeedType;
  breadcrumbPaths: React.ReactNode[];
  onClose: () => void;
  onPresetSave: (feedType: AudienceFeedType) => void;
};

type Props = CreateFeedPresetSelectionPageProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps &
  ValidatorProps;

interface LayoutablePluginWithProperties extends LayoutablePlugin {
  plugin_properties?: PropertyResourceShape[];
}

interface State {
  plugins: LayoutablePlugin[];
  isLoading: boolean;
  selectedPlugin?: LayoutablePluginWithProperties;
}

class CreateFeedPresetSelectionPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IPluginService)
  private _pluginService: IPluginService;

  constructor(props: Props) {
    super(props);

    this.state = {
      plugins: [],
      isLoading: true,
    };
  }

  componentDidMount() {
    this.getPluginsList();
  }

  getPluginsList() {
    this.setState({ isLoading: true }, () => {
      this._pluginService
        .getPlugins({
          plugin_type:
            this.props.feedType === 'EXTERNAL_FEED'
              ? 'AUDIENCE_SEGMENT_EXTERNAL_FEED'
              : 'AUDIENCE_SEGMENT_TAG_FEED',
        })
        .then(res => res.data)
        .then((pluginsResponse: PluginResource[]) => {
          const promises = pluginsResponse.reduce((plugins, plugin) => {
            if (!plugin.current_version_id) return plugins;

            return [
              ...plugins,
              Promise.all([
                this._pluginService.getPluginVersionProperties(
                  plugin.id,
                  plugin.current_version_id,
                ),
                this._pluginService.getLocalizedPluginLayout(plugin.id, plugin.current_version_id),
              ]).then(response => {
                const properties = response[0].data;
                let layout = response[1];

                if (layout) {
                  layout = {
                    ...layout,
                    sections: layout.sections.map(pluginLayoutSection => {
                      return {
                        ...pluginLayoutSection,
                        fields: pluginLayoutSection.fields.map(field => {
                          return {
                            ...field,
                            required: false,
                          };
                        }),
                      };
                    }),
                  };
                }

                const result: LayoutablePluginWithProperties = {
                  ...plugin,
                  plugin_properties: properties,
                  plugin_layout: layout || undefined,
                };

                return result;
              }),
            ];
          }, [] as LayoutablePluginWithProperties[]);

          Promise.all(promises).then(layoutablePluginWithProperties => {
            this.setState({
              plugins: layoutablePluginWithProperties,
              isLoading: false,
            });
          });
        })
        .catch(() => {
          this.setState({ isLoading: false });
        });
    });
  }

  onSelect(plugin: LayoutablePlugin) {
    this.setState({
      selectedPlugin: plugin,
    });
  }

  modalSave = (
    pluginValue: any,
    propertiesValue: PropertyResourceShape[],
    name?: string,
    description?: string,
  ) => {
    const {
      feedType,
      onPresetSave,
      match: {
        params: { organisationId },
      },
    } = this.props;
    const { selectedPlugin } = this.state;

    if (selectedPlugin && selectedPlugin.current_version_id && selectedPlugin.plugin_type && name)
      this._pluginService
        .createPluginPreset(selectedPlugin.id, selectedPlugin.current_version_id, {
          organisation_id: organisationId,
          name: name,
          description: description,
          plugin_type: selectedPlugin.plugin_type,
          properties: propertiesValue,
        })
        .then(() => {
          this.modalOnClose();
          onPresetSave(feedType);
        })
        .catch(() => {
          onPresetSave(feedType);
        });
  };

  modalOnClose = () => {
    this.setState({
      selectedPlugin: undefined,
    });
  };

  renderPluginCards() {
    const cards = this.state.plugins
      .filter(layoutablePlugin => layoutablePlugin && layoutablePlugin.plugin_layout)
      .map(layoutablePlugin => {
        const onPluginSelect = () => this.onSelect(layoutablePlugin);
        return (
          !!layoutablePlugin.plugin_layout && (
            <Col
              key={
                layoutablePlugin.id +
                (layoutablePlugin.plugin_preset ? '-' + layoutablePlugin.plugin_preset.id : '')
              }
              span={4}
              className='text-center'
            >
              <PluginCard plugin={layoutablePlugin} onSelect={onPluginSelect} hoverable={true} />
            </Col>
          )
        );
      })
      .filter(a => !!a);

    const array = [];
    const size = 6;

    while (cards.length > 0) array.push(cards.splice(0, size));

    return array.map((arr, i) => (
      <Row
        key={i}
        style={{ marginTop: 30, marginBottom: 40 }}
        // type={'flex'}
        gutter={40}
      >
        {arr}
      </Row>
    ));
  }

  render() {
    const {
      match: {
        params: { organisationId },
      },
      feedType,
      breadcrumbPaths,
      onClose,
      intl: { formatMessage },
      fieldValidators: { isRequired },
    } = this.props;

    const { selectedPlugin } = this.state;

    const title =
      feedType === 'EXTERNAL_FEED'
        ? messages.createExternalFeedPresetTitle
        : messages.createTagFeedPresetTitle;

    const subtitle =
      feedType === 'EXTERNAL_FEED'
        ? messages.createExternalFeedPresetSubtitle
        : messages.createTagFeedPresetSubtitle;

    return (
      <EditContentLayout pathItems={breadcrumbPaths} formId='createPreset' onClose={onClose}>
        {this.state.isLoading ? (
          <Loading isFullScreen={true} />
        ) : (
          <Layout className='mcs-content-container mcs-form-container ant-layout-content'>
            <FormTitle title={title} subtitle={subtitle} />
            <div>{this.renderPluginCards()}</div>
            {selectedPlugin &&
              selectedPlugin.current_version_id &&
              selectedPlugin.plugin_layout &&
              selectedPlugin.plugin_properties && (
                <PluginCardModal
                  isPresetCreation={true}
                  onClose={this.modalOnClose}
                  organisationId={organisationId}
                  opened={!!selectedPlugin}
                  plugin={selectedPlugin}
                  save={this.modalSave}
                  pluginProperties={selectedPlugin.plugin_properties}
                  disableFields={false}
                  pluginLayout={selectedPlugin.plugin_layout}
                  pluginVersionId={selectedPlugin.current_version_id}
                  editionMode={false}
                  isLoading={false}
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
                    disabled: false,
                    validator: [isRequired],
                  }}
                  descriptionField={{
                    label: formatMessage(messages.feedModalDescriptionFieldLabel),
                    title: formatMessage(messages.feedModalDescriptionFieldTitle),
                    placeholder: formatMessage(messages.feedModalDescriptionFieldPlaceholder),
                    display: true,
                    disabled: false,
                    validator: [isRequired],
                  }}
                  selectedTab='configuration'
                />
              )}
          </Layout>
        )}
      </EditContentLayout>
    );
  }
}

export default compose<Props, CreateFeedPresetSelectionPageProps>(
  withRouter,
  injectIntl,
  withValidators,
)(CreateFeedPresetSelectionPage);

const messages = defineMessages({
  createExternalFeedPresetTitle: {
    id: 'audience.segment.externalFeed.createPreset.title',
    defaultMessage: 'Preset creation',
  },
  createExternalFeedPresetSubtitle: {
    id: 'audience.segment.externalFeed.createPreset.subtitle',
    defaultMessage: 'Choose the server side connector to create a preset from',
  },
  createTagFeedPresetTitle: {
    id: 'audience.segment.tagFeed.createPreset.title',
    defaultMessage: 'Preset creation',
  },
  createTagFeedPresetSubtitle: {
    id: 'audience.segment.tagFeed.createPreset.subtitle',
    defaultMessage: 'Choose the client side connector to create a preset from',
  },
  feedModalNameFieldLabel: {
    id: 'audience.segment.feed.createPreset.nameField.label',
    defaultMessage: 'Name',
  },
  feedModalNameFieldTitle: {
    id: 'audience.segment.feed.createPreset.nameField.title',
    defaultMessage:
      'The name that will be used to identify this feed preset and the feeds created with it.',
  },
  feedModalNameFieldPlaceholder: {
    id: 'audience.segment.feed.createPreset.nameField.placeholder',
    defaultMessage: 'Name',
  },
  feedModalDescriptionFieldLabel: {
    id: 'audience.segment.feed.createPreset.descriptionField.label',
    defaultMessage: 'Description',
  },
  feedModalDescriptionFieldTitle: {
    id: 'audience.segment.feed.createPreset.descriptionField.title',
    defaultMessage:
      'A description of the feed preset to help understand what this preset is about.',
  },
  feedModalDescriptionFieldPlaceholder: {
    id: 'audience.segment.feed.createPreset.descriptionField.placeholder',
    defaultMessage: 'Description',
  },
  feedModalNameFieldTitleWarning: {
    id: 'audience.segment.feed.preset.create.nameField.title.warning',
    defaultMessage:
      "Warning: This name is only used in the platform, it won't be visible on the external system.",
  },
});
