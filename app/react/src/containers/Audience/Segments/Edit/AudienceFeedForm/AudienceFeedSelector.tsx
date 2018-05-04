import * as React from 'react';
import { Layout, Row } from 'antd';
import { FormTitle } from '../../../../../components/Form';
import { defineMessages, FormattedMessage } from 'react-intl';
import { MenuPresentational } from '../../../../../components/FormMenu';

const { Content } = Layout;

export interface AudienceFeedSelectorProps {
  onSelect: (feedType: FeedType) => void;
}

const messages = defineMessages({
  listTitle: {
    id: 'audience.segment.form.segment.type.selector.list.title',
    defaultMessage: 'Feed Types',
  },
  listSubtitle: {
    id: 'audience.segment.form.segment.type.selector.list.subtitle',
    defaultMessage: 'Chose your feed types. Tags will display a pixel to all your users within your segment and external feed will transfer them from server to server.',
  },
  segmentTypeOr: {
    id: 'audience.segment.form.segment.type.selector.or',
    defaultMessage: 'Or',
  },
});

export type FeedType = 'tag' | 'external'

class AudienceFeedSelector extends React.Component<AudienceFeedSelectorProps> {
  onSelect = (feedType: FeedType) => () => {
    this.props.onSelect(feedType)
  }

  render() {
    return (
      <Layout>
        <div className="edit-layout ant-layout">
          <Layout>
            <Content className="mcs-content-container mcs-form-container text-center">
              <FormTitle
                title={messages.listTitle}
                subtitle={messages.listSubtitle}
              />
              <Row style={{ width: '650px', display: 'inline-block' }}>
                <Row className="menu">
                  <div className="presentation">
                    <MenuPresentational
                      title={'External Feed'}
                      type="data"
                      select={this.onSelect('external')}
                    />
                    <div className="separator">
                      <FormattedMessage {...messages.segmentTypeOr} />
                    </div>
                    <MenuPresentational
                      title={'Tag Feed'}
                      type="code"
                      select={this.onSelect('tag')}
                    />
                  </div>
                </Row>
              </Row>
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

export default AudienceFeedSelector
