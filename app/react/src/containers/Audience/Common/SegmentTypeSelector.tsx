import * as React from 'react';
import { Layout, Row } from 'antd';
import { defineMessages, FormattedMessage } from 'react-intl';
import { FormTitle } from '../../../components/Form';
import { MenuList, MenuPresentational } from '@mediarithmics-private/mcs-components-library';
import { AudienceSegmentType } from '../../../models/audiencesegment';
import { QueryLanguage } from '../../../models/datamart/DatamartResource';

const { Content } = Layout;

const messages = defineMessages({
  listTitle: {
    id: 'audience.segments.form.segmentTypeSelector.title',
    defaultMessage: 'Segment Types',
  },
  listSubtitle: {
    id: 'audience.segments.form.segmentTypeSelector.subtitle',
    defaultMessage: 'Choose your segment type',
  },
  segmentTypeOr: {
    id: 'audience.segments.form.segmentTypeSelector.or',
    defaultMessage: 'Or',
  },
  otherSegmentTypes: {
    id: 'audience.segments.form.segmentTypeSelector.other',
    defaultMessage: 'Other segment types',
  },
});

interface SegmentTypeSelectorProps {
  onSelect: (item: AudienceSegmentType, queryLanguage: QueryLanguage) => any;
  segmentTypesToDisplay: Array<{ title: string; value: AudienceSegmentType }>;
}

type Props = SegmentTypeSelectorProps;

class SegmentTypeSelector extends React.Component<Props> {
  onSelect = (item: AudienceSegmentType, expertQuery: boolean = false) => () => {
    this.props.onSelect(item, expertQuery ? 'OTQL' : 'JSON_OTQL');
  };

  render() {
    const { segmentTypesToDisplay } = this.props;
    return (
      <Layout>
        <div className='edit-layout ant-layout'>
          <Layout>
            <Content className='mcs-content-container mcs-form-container text-center'>
              <FormTitle title={messages.listTitle} subtitle={messages.listSubtitle} />
              <Row className='mcs-selector_container'>
                <Row className='menu'>
                  <div className='presentation'>
                    <MenuPresentational
                      title={'User Query'}
                      type='user-query'
                      select={this.onSelect('USER_QUERY')}
                    />
                    <div className='separator'>
                      <FormattedMessage {...messages.segmentTypeOr} />
                    </div>
                    <MenuPresentational
                      title={'User List'}
                      type='user-list'
                      select={this.onSelect('USER_LIST')}
                    />
                  </div>
                </Row>
                {segmentTypesToDisplay.length > 0 && (
                  <div>
                    <Row className='intermediate-title'>
                      <FormattedMessage {...messages.otherSegmentTypes} />
                    </Row>
                    <Row className='menu'>
                      {segmentTypesToDisplay.map(item => {
                        return (
                          <MenuList
                            className={`mcs-segmentTypeSelector_${item.title.replace(/\s/g, '')}`}
                            key={item.value}
                            title={item.title}
                            select={this.onSelect(item.value, true)}
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
