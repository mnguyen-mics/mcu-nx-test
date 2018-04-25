import * as React from 'react';
import { Layout, Row } from 'antd';
import { defineMessages, FormattedMessage } from 'react-intl';
import { FormTitle } from '../../../components/Form';
import { MenuList, MenuPresentational } from '../../../components/FormMenu';
import { SegmentType } from '../Segments/Edit/domain';

const { Content } = Layout;

const messages = defineMessages({
  listTitle: {
    id: 'audience.segment.form.segment.type.selector.list.title',
    defaultMessage: 'Segment Types',
  },
  listSubtitle: {
    id: 'audience.segment.form.segment.type.selector.list.subtitle',
    defaultMessage: 'Chose your segment types',
  },
  segmentTypeOr: {
    id: 'audience.segment.form.segment.type.selector.or',
    defaultMessage: 'Or',
  },
  otherSegmentTypes: {
    id: 'audience.segment.form.segment.type.selector.other',
    defaultMessage: 'Other segment types',
  },
});

interface SegmentTypeSelectorProps {
  onSelect: (item: SegmentType) => any;
}

type Props = SegmentTypeSelectorProps;

class SegmentTypeSelector extends React.Component<Props> {
  onSelect = (item: SegmentType) => () => {
    this.props.onSelect(item);
  };

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
                      title={'User List'}
                      type="user-list"
                      select={this.onSelect('USER_LIST')}
                    />
                    <div className="separator">
                      <FormattedMessage {...messages.segmentTypeOr} />
                    </div>
                    <MenuPresentational
                      title={'User Query'}
                      type="user-query"
                      select={this.onSelect('USER_QUERY')}
                    />
                  </div>
                </Row>
                <Row className="intermediate-title">
                  <FormattedMessage {...messages.otherSegmentTypes} />
                </Row>
                <Row className="menu">
                  <MenuList
                    title={'User Pixel'}
                    select={this.onSelect('USER_PIXEL')}
                  />
                </Row>
              </Row>
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

export default SegmentTypeSelector;
