import * as React from 'react';
import { Layout, Row } from 'antd';
import { defineMessages, FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { FormTitle } from '../../../../components/Form';
import { MenuList, MenuPresentational } from '@mediarithmics-private/mcs-components-library';
import { QueryLanguage, DatamartResource } from '../../../../models/datamart/DatamartResource';
import { GoalTriggerType } from '../../../../models/goal/GoalResource';

const { Content } = Layout;

const messages = defineMessages({
  listTitle: {
    id: 'goal.form.trigger.type.selector.list.title',
    defaultMessage: 'Goal Trigger Types',
  },
  listSubtitle: {
    id: 'goal.form.trigger.type.selector.list.subtitle',
    defaultMessage: 'Choose your goal trigger type',
  },
  segmentTypeOr: {
    id: 'goal.form.trigger.type.selector.or',
    defaultMessage: 'Or',
  },
  otherSegmentTypes: {
    id: 'goal.form.trigger.type.selector.other',
    defaultMessage: 'Other trigger types',
  },
  triggerQuery: {
    id: 'goal.form.trigger.type.query',
    defaultMessage: 'Trigger via Query',
  },
  triggerExpertQuery: {
    id: 'goal.form.trigger.type.expert-query',
    defaultMessage: 'Trigger via Expert Query',
  },
  triggerPixel: {
    id: 'goal.form.trigger.type.pixel',
    defaultMessage: 'Trigger via Pixel',
  },
});

interface GoalTriggerTypeSelectorProps {
  onSelect: (triggerType: GoalTriggerType, queryLanguage?: QueryLanguage) => void;
  datamart: DatamartResource;
}

type Props = GoalTriggerTypeSelectorProps & InjectedIntlProps;

class GoalTriggerTypeSelector extends React.Component<Props> {
  render() {
    const { onSelect, datamart, intl } = this.props;

    const handleOnSelect = (triggerType: GoalTriggerType, queryLanguage?: QueryLanguage) => () =>
      onSelect(triggerType, queryLanguage);
    return (
      <Layout>
        <div className='edit-layout ant-layout'>
          <Layout>
            <Content className='mcs-content-container mcs-form-container text-center'>
              <FormTitle title={messages.listTitle} subtitle={messages.listSubtitle} />
              <Row className='mcs-selector_container mcs-goalTriggerTypeSelector'>
                <Row className='menu'>
                  <div className='presentation'>
                    <MenuPresentational
                      title={intl.formatMessage(messages.triggerQuery)}
                      type='user-query'
                      select={handleOnSelect('QUERY', 'JSON_OTQL')}
                    />
                    <div className='separator'>
                      <FormattedMessage {...messages.segmentTypeOr} />
                    </div>
                    <MenuPresentational
                      title={intl.formatMessage(messages.triggerPixel)}
                      type='user-pixel'
                      select={handleOnSelect('PIXEL')}
                    />
                  </div>
                </Row>
                {datamart.storage_model_version !== 'v201506' && (
                  <div>
                    <Row className='intermediate-title'>
                      <FormattedMessage {...messages.otherSegmentTypes} />
                    </Row>
                    <Row className='menu'>
                      <MenuList
                        title={intl.formatMessage(messages.triggerExpertQuery)}
                        select={handleOnSelect('QUERY', 'OTQL')}
                      />
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

export default injectIntl(GoalTriggerTypeSelector);
