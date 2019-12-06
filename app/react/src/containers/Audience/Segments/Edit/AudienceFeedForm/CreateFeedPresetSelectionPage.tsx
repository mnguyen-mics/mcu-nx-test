import * as React from 'react';
import { Layout } from 'antd';
import { FormTitle } from '../../../../../components/Form';
import { defineMessages } from 'react-intl';
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

type CreateFeedPresetSelectionPageProps = {
  feedType: AudienceFeedType;
  breadcrumbPaths: Path[];
  onClose: () => void;
};

type Props = CreateFeedPresetSelectionPageProps;

type State = {
  plugins: LayoutablePlugin[];
  isLoading: boolean;
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
        .then((response: PluginResource[]) => {
          const pluginsWithLayouts = response.reduce(
            (filteredPlugins, pResourceWoutLayout) => {
              if (!pResourceWoutLayout.current_version_id)
                return filteredPlugins;

              return [
                ...filteredPlugins,
                PluginService.getLocalizedPluginLayout(
                  pResourceWoutLayout.id,
                  pResourceWoutLayout.current_version_id,
                ).then(resultPluginLayout => {
                  return Promise.resolve({
                    ...pResourceWoutLayout,
                    plugin_layout:
                      resultPluginLayout !== null
                        ? resultPluginLayout
                        : undefined,
                  });
                }),
              ];
            },
            [],
          );

          Promise.all(pluginsWithLayouts).then(availablePluginsResponse => {
            this.setState({
              plugins: availablePluginsResponse,
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
    return;
  }

  renderPluginCards() {
    return this.state.plugins.map(layoutablePlugin => {
      if (!layoutablePlugin || !layoutablePlugin.plugin_layout) return;

      const onPluginSelect = () => this.onSelect(layoutablePlugin);
      return (
        <div
          key={layoutablePlugin.id}
          style={{
            maxHeight: '340px',
            maxWidth: '300px',
            minWidth: '300px',
            padding: '20px',
          }}
        >
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
    const { feedType, breadcrumbPaths, onClose } = this.props;

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
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                margin: '-20px',
                paddingTop: '30px',
              }}
            >
              {this.renderPluginCards()}
            </div>
          </Layout>
        )}
      </EditContentLayout>
    );
  }
}

export default compose<Props, CreateFeedPresetSelectionPageProps>()(
  CreateFeedPresetSelectionPage,
);

const messages = defineMessages({
  createExternalFeedPresetTitle: {
    id: 'audience.segment.externalFeed.create.title',
    defaultMessage: 'Preset creation',
  },
  createExternalFeedPresetSubtitle: {
    id: 'audience.segment.externalFeed.create.subtitle',
    defaultMessage:
      'Choose the server side connector to create a preset from',
  },
  createTagFeedPresetTitle: {
    id: 'audience.segment.tagFeed.create.title',
    defaultMessage: 'Preset creation',
  },
  createTagFeedPresetSubtitle: {
    id: 'audience.segment.tagFeed.create.subtitle',
    defaultMessage: 'Choose the client side connector to create a preset from',
  },
});
