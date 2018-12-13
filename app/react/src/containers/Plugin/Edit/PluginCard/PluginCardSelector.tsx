import * as React from 'react';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Layout, Row, Col } from 'antd';
import PluginCard from './PluginCard';
import { LayoutablePlugin } from '../../../../models/Plugins';
import { FormTitle } from '../../../../components/Form';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';


const { Content } = Layout;

interface PluginCardSelectorProps<T> {
  onSelect: (item: T) => void;
  availablePlugins: T[];
  listTitle: FormattedMessage.MessageDescriptor;
  listSubTitle: FormattedMessage.MessageDescriptor;
}

type Props<T> = PluginCardSelectorProps<T> & RouteComponentProps<{ organisationId: string }>

class PluginCardSelector<T extends LayoutablePlugin> extends React.Component<Props<T> & InjectedIntlProps> {

  renderCards = () => {
    const {
      availablePlugins,
      match: { params: { organisationId } }
    } = this.props;


    const plugins = availablePlugins.map(plugin => {
      const onPluginSelect = () => this.props.onSelect(plugin);
      return !!plugin.plugin_layout && (
        <Col key={plugin.id} span={4} className="text-center" >
          <PluginCard plugin={plugin} organisationId={organisationId} onSelect={onPluginSelect} hoverable={true} />
        </Col>
      )
    }).filter(a => !!a)

    const array = [];
    const size = 6;

    while (plugins.length > 0)
      array.push(plugins.splice(0, size))

    return array.map((arr, i) => <Row key={i} style={{ marginTop: 40 }} type={'flex'} gutter={40}>{arr}</Row>)
  }

  render() {
    const {
      listTitle,
      listSubTitle,

    } = this.props;

    return (
      <Layout>
        <div
          className="edit-layout ant-layout"
        >
          <Layout>
            <Content className="mcs-content-container mcs-form-container">
              <FormTitle
                title={listTitle}
                subtitle={listSubTitle}
              />

              {this.renderCards()}
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

export default compose<Props<LayoutablePlugin>, PluginCardSelectorProps<LayoutablePlugin>>(
  injectIntl,
  withRouter
)(PluginCardSelector);
