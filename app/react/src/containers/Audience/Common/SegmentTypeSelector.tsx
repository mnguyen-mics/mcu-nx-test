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
  segmentTypesToDisplay: Array<{ title: string; value: SegmentType }>;
}

type Props = SegmentTypeSelectorProps;

class SegmentTypeSelector extends React.Component<Props> {
  onSelect = (item: SegmentType, expertQuery: boolean = false) => () => {
    this.props.onSelect(item);
  };

  render() {
    const { segmentTypesToDisplay } = this.props;
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
                      title={'User Query'}
                      type="user-query"
                      select={this.onSelect('USER_QUERY')}
                    />
                    <div className="separator">
                      <FormattedMessage {...messages.segmentTypeOr} />
                    </div>
                    <MenuPresentational
                      title={'User List'}
                      type="user-list"
                      select={this.onSelect('USER_LIST')}
                    />
                  </div>
                </Row>
                {segmentTypesToDisplay.length > 0 && (
                  <div>
                    <Row className="intermediate-title">
                      <FormattedMessage {...messages.otherSegmentTypes} />
                    </Row>
                    <Row className="menu">
                      {segmentTypesToDisplay.map(item => {
                        return (
                          <MenuList
                            key={item.value}
                            title={item.title}
                            select={this.onSelect(item.value)}
                          />
                        );
                      })}
                    </Row>
                  </div>
                )}
              </Row>
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

export default SegmentTypeSelector;
