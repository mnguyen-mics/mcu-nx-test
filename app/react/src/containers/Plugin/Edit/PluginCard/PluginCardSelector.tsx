import * as React from 'react';
import { injectIntl, InjectedIntlProps, FormattedMessage, defineMessages } from 'react-intl';
import { Layout, Row, Col } from 'antd';
import PluginCard from './PluginCard';
import { LayoutablePlugin } from '../../../../models/Plugins';
import { FormTitle } from '../../../../components/Form';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import { InjectedFeaturesProps, injectFeatures } from '../../../Features';

const { Content } = Layout;

const titleMessages: {
  [key: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  presetTitle: {
    id: 'plugin.preset.list.default.title',
    defaultMessage: 'Presets',
  },
  presetSubtitle: {
    id: 'plugin.preset.list.default.subtitle',
    defaultMessage: 'Add a pre-configured Plugin.',
  },
});

interface PluginCardSelectorProps<T> {
  onSelect: (item: T) => void;
  onPresetDelete: (item: T) => void;
  availablePresetLayouts: T[];
  pluginPresetListTitle?: FormattedMessage.MessageDescriptor;
  pluginPresetListSubTitle?: FormattedMessage.MessageDescriptor;
  availablePluginLayouts: T[];
  pluginListTitle: FormattedMessage.MessageDescriptor;
  pluginListSubTitle: FormattedMessage.MessageDescriptor;
}

type Props<T> = PluginCardSelectorProps<T> &
  RouteComponentProps<{ organisationId: string }> &
  InjectedFeaturesProps;

class PluginCardSelector<T extends LayoutablePlugin> extends React.Component<
  Props<T> & InjectedIntlProps
> {
  renderPluginCards = (layouts: T[]) => {
    const cards = layouts
      .map(layoutablePlugin => {
        const onPluginSelect = () => this.props.onSelect(layoutablePlugin);
        const onPresetDelete = () => this.props.onPresetDelete(layoutablePlugin);
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
              <PluginCard
                plugin={layoutablePlugin}
                onSelect={onPluginSelect}
                onPresetDelete={onPresetDelete}
                hoverable={true}
              />
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
  };

  render() {
    const {
      availablePluginLayouts,
      pluginListTitle,
      pluginListSubTitle,
      availablePresetLayouts,
      pluginPresetListTitle,
      pluginPresetListSubTitle,
    } = this.props;

    return (
      <Layout>
        <div className='edit-layout ant-layout'>
          <Layout>
            <Content className='mcs-content-container mcs-form-container'>
              {availablePresetLayouts.length > 0 && this.props.hasFeature('plugins-presets') && (
                <div>
                  <FormTitle
                    title={pluginPresetListTitle || titleMessages.presetTitle}
                    subtitle={pluginPresetListSubTitle || titleMessages.presetSubtitle}
                  />
                  {this.renderPluginCards(availablePresetLayouts)}
                </div>
              )}
              <div>
                <FormTitle title={pluginListTitle} subtitle={pluginListSubTitle} />
              </div>
              {this.renderPluginCards(availablePluginLayouts)}
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

export default compose<Props<LayoutablePlugin>, PluginCardSelectorProps<LayoutablePlugin>>(
  injectIntl,
  withRouter,
  injectFeatures,
)(PluginCardSelector);
