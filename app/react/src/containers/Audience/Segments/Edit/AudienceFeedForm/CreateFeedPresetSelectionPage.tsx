import * as React from 'react';
import { Layout } from 'antd';
import { FormTitle } from '../../../../../components/Form';
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl';
import { AudienceFeedType } from '../../../../../services/AudienceSegmentFeedService';
import { compose } from 'recompose';
import { Path } from '../../../../../components/ActionBar';
import { EditContentLayout } from '../../../../../components/Layout';
import PluginService from '../../../../../services/PluginService';
import {
  PluginResource,
  LayoutablePlugin,
} from '../../../../../models/Plugins';
import PluginCard from '../../../../Plugin/Edit/PluginCard/PluginCard';
import { Loading } from '../../../../../components';
import PluginCardModal from '../../../../Plugin/Edit/PluginCard/PluginCardModal';
import { PropertyResourceShape } from '../../../../../models/plugin';
import { withRouter, RouteComponentProps } from 'react-router';

type CreateFeedPresetSelectionPageProps = {
  feedType: AudienceFeedType;
  breadcrumbPaths: Path[];
  onClose: () => void;
};

type Props = CreateFeedPresetSelectionPageProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps;

interface LayoutablePluginWithProperties extends LayoutablePlugin {
  plugin_properties?: PropertyResourceShape[];
}

type State = {
  plugins: LayoutablePlugin[];
  isLoading: boolean;
  selectedPlugin?: LayoutablePluginWithProperties;
};

class CreateFeedPresetSelectionPage extends React.Component<Props, State> {
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
      PluginService.getPlugins({
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
                PluginService.getPluginVersionProperty(
                  plugin.id,
                  plugin.current_version_id,
                ),
                PluginService.getLocalizedPluginLayout(
                  plugin.id,
                  plugin.current_version_id,
                ),
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
      match: {
        params: { organisationId },
      },
    } = this.props;
    const { selectedPlugin } = this.state;

    if (
      selectedPlugin &&
      selectedPlugin.current_version_id &&
      selectedPlugin.plugin_type &&
      name
    )
      PluginService.createPluginPreset(
        selectedPlugin.id,
        selectedPlugin.current_version_id,
        {
          organisation_id: organisationId,
          name: name,
          description: description,
          plugin_type: selectedPlugin.plugin_type,
          properties: propertiesValue,
        },
      ).then(() => {
        this.modalOnClose();
      });
  };

  modalOnClose = () => {
    this.setState({
      selectedPlugin: undefined,
    });
  };

  renderPluginCards() {
    return this.state.plugins.map(layoutablePlugin => {
      if (!layoutablePlugin || !layoutablePlugin.plugin_layout) return;

      const onPluginSelect = () => this.onSelect(layoutablePlugin);
      return (
        <div key={layoutablePlugin.id} className="plugin-card-wrapper">
          <PluginCard
            plugin={layoutablePlugin}
            onSelect={onPluginSelect}
            hoverable={true}
          />
        </div>
      );
    });
  }

  render() {
    const {
      match: {
        params: { organisationId },
      },
      feedType,
      breadcrumbPaths,
      onClose,
      intl: {
        formatMessage
      }
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
      <EditContentLayout
        paths={breadcrumbPaths}
        formId="createPreset"
        onClose={onClose}
      >
        {this.state.isLoading ? (
          <Loading className="loading-full-screen" />
        ) : (
          <Layout className="mcs-content-container mcs-form-container ant-layout-content">
            <FormTitle title={title} subtitle={subtitle} />
            <div className="plugin-card-container">
              {this.renderPluginCards()}
            </div>
            {selectedPlugin &&
              selectedPlugin.current_version_id &&
              selectedPlugin.plugin_layout &&
              selectedPlugin.plugin_properties && (
                <PluginCardModal
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
                    title: formatMessage(messages.feedModalNameFieldTitle),
                    placeholder: formatMessage(messages.feedModalNameFieldPlaceholder),
                    display: true,
                    disabled: false
                  }}
                  descriptionField={{ 
                    label: formatMessage(messages.feedModalDescriptionFieldLabel),
                    title: formatMessage(messages.feedModalDescriptionFieldTitle),
                    placeholder: formatMessage(messages.feedModalDescriptionFieldPlaceholder),
                    display: true,
                    disabled: false
                  }}
                  selectedTab="configuration"
                />
              )}
          </Layout>
        )}
      </EditContentLayout>
    );
  }
}

export default compose<Props, CreateFeedPresetSelectionPageProps>(withRouter, injectIntl)(
  CreateFeedPresetSelectionPage,
);

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
    defaultMessage: 'The name that will be used to identify this feed preset and the feeds created with it.',
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
    defaultMessage: 'A description of the feed preset to help understand what this preset is about.',
  },
  feedModalDescriptionFieldPlaceholder: {
    id: 'audience.segment.feed.createPreset.descriptionField.placeholder',
    defaultMessage: 'Description',
  },
});
