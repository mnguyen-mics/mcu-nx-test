import * as React from 'react';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Layout, Row } from 'antd';

import { PluginResource } from '../../../models/Plugins';
import { FormTitle } from '../../../components/Form';
import { MenuList } from '../../../components/FormMenu';

const { Content } = Layout;

interface PluginEditSelectorProps<T> {
  onSelect: (item: T) => void;
  availablePlugins: T[];
  listTitle: FormattedMessage.MessageDescriptor;
  listSubTitle: FormattedMessage.MessageDescriptor;
}

class PluginEditSelector<T extends PluginResource> extends React.Component<PluginEditSelectorProps<T> & InjectedIntlProps> {

  onSelect = (item: T) => () => {
    this.props.onSelect(item);
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
            <Content className="mcs-content-container mcs-form-container text-center">
              <FormTitle
                title={listTitle}
                subtitle={listSubTitle}
              />
              <Row style={{ width: '650px', display: 'inline-block' }}>
                <Row className="menu">
                  {this.props.availablePlugins.map(item => {
                    return <MenuList
                      title={item.artifact_id}
                      key={item.id}
                      select={this.onSelect(item)}
                    />;
                  })}
                </Row>
              </Row>
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

export default injectIntl(PluginEditSelector);
