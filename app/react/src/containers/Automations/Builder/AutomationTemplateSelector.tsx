import * as React from 'react';
import { compose } from 'recompose';
import { Layout, Row } from 'antd';
import { defineMessages, FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { FormTitle } from '../../../components/Form';
import ActionBar, { ActionBarProps } from '../../../components/ActionBar';
import { MenuPresentational, MenuList } from '../../../components/FormMenu';
import { QueryInputEvaluationPeriodUnit, QueryInputEvaluationMode } from '../../../models/automations/automations';

export interface AutomationTemplateSelectorProps {
  onSelectTemplate: (type: QueryInputEvaluationMode, n?: number, p?: QueryInputEvaluationPeriodUnit) => void;
  actionbarProps: ActionBarProps;
}


interface State {
  periodic: boolean
}

type Props = AutomationTemplateSelectorProps & InjectedIntlProps

class AutomationTemplateSelector extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      periodic: false
    }
  }

  renderStep1 = () => {

    const {
      onSelectTemplate,
      intl: {
        formatMessage
      }
    } = this.props;

    const onClickOnLive = () => onSelectTemplate('LIVE');
    const onClickOnPeriodic = () => this.setState({periodic: true})

    return (
        <Row className="menu">
          <div className="presentation">
            <MenuPresentational
              title={formatMessage(messages.live)}
              type="user-pixel"
              select={onClickOnLive}
            />
            <div className="separator">
              <FormattedMessage {...messages.or} />
            </div>
            <MenuPresentational
              title={formatMessage(messages.periodic)}
              type="user-query"
              select={onClickOnPeriodic}
            />
          </div>
        </Row>
    )
  }

  renderStep2 = () => {

    const {
      onSelectTemplate,
      intl: {
        formatMessage
      }
    } = this.props;

    const onClickOnPeriodic = (n: number, p: QueryInputEvaluationPeriodUnit) => () => onSelectTemplate('PERIODIC', n , p);

    return (
        <Row className="menu">
          <MenuList title={formatMessage(messages.everyHours)} select={onClickOnPeriodic(1, "HOUR")} />
          <MenuList title={formatMessage(messages.every2Hours)} select={onClickOnPeriodic(2, "HOUR")} />
          <MenuList title={formatMessage(messages.everyDays)} select={onClickOnPeriodic(1, "DAY")} />
          <MenuList title={formatMessage(messages.everyWeeks)} select={onClickOnPeriodic(1, "WEEK")} />
          <MenuList title={formatMessage(messages.everyMonths)} select={onClickOnPeriodic(1, "MONTH")} />
          <MenuList title={formatMessage(messages.everyYears)} select={onClickOnPeriodic(12, "MONTH")} />
        </Row>
    )
  }

  render() {
    const {
      actionbarProps,
    } = this.props;

    const {
      periodic
    } = this.state;
  
    return (
      <Layout>
        <ActionBar {...actionbarProps} />
        <Layout.Content className="mcs-content-container mcs-form-container text-center">
          <FormTitle title={messages.title} subtitle={messages.subTitleStep1} />
          <Row style={{ width: '650px', display: 'inline-block' }}>
            {periodic ? this.renderStep2() : this.renderStep1()}
          </Row>
        </Layout.Content>
      </Layout>
    );
  }
}

export default compose<Props, AutomationTemplateSelectorProps>(
  injectIntl,
)(AutomationTemplateSelector);

const messages = defineMessages({
  title: {
    id: 'automations-template-selector-title',
    defaultMessage: 'Automations Builder',
  },
  subTitleStep1: {
    id: 'automations-template-selector-subtitle-step1',
    defaultMessage: 'Choose your automation type',
  },
  subTitleStep2: {
    id: 'automations-template-selector-subtitle-step2',
    defaultMessage: 'Choose your automation period',
  },
  or: {
    id: 'automations-template-selector-or',
    defaultMessage: 'or',
  },
  live: {
    id: 'automations-template-selector-live',
    defaultMessage: 'Live',
  },
  periodic: {
    id: 'automations-template-selector-periodic',
    defaultMessage: 'Periodic',
  },
  everyHours: {
    id: 'automations-template-selector-periodic-1-hour',
    defaultMessage: 'Every hour',
  },
  every2Hours: {
    id: 'automations-template-selector-periodic-2-hours',
    defaultMessage: 'Every two hours',
  },
  everyDays: {
    id: 'automations-template-selector-periodic-1-day',
    defaultMessage: 'Every day',
  },
  everyWeeks: {
    id: 'automations-template-selector-periodic-1-week',
    defaultMessage: 'Every week',
  },
  everyMonths: {
    id: 'automations-template-selector-periodic-1-month',
    defaultMessage: 'Every month',
  },
  everyYears: {
    id: 'automations-template-selector-periodic-1-year',
    defaultMessage: 'Every year',
  }
});
