import * as React from 'react';
import { compose } from 'recompose';
import { Layout, Row } from 'antd';
import { defineMessages, FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { FormTitle } from '../../../components/Form';
import ActionBar, { ActionBarProps } from '../../../components/ActionBar';
import { QueryInputEvaluationPeriodUnit } from '../../../models/automations/automations';
import { injectFeatures, InjectedFeaturesProps } from '../../Features';
import { AutomationSelectedType } from './AutomationBuilderPage';
import { MenuList } from '@mediarithmics-private/mcs-components-library';

export interface AutomationTemplateSelectorProps {
  onSelectTemplate: (type: AutomationSelectedType, n?: number, p?: QueryInputEvaluationPeriodUnit) => void;
  actionbarProps: ActionBarProps;
  disableReactToEvent: boolean;
}


interface State {
  periodic: boolean
}

type Props = AutomationTemplateSelectorProps
  & InjectedIntlProps
  & InjectedFeaturesProps;

class AutomationTemplateSelector extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      periodic: false
    }
  }

  renderSelectionAutomationType = () => {

    const {
      onSelectTemplate,
      intl: {
        formatMessage
      },
      hasFeature,
      disableReactToEvent,
    } = this.props;

    const onClickOnLive = () => onSelectTemplate('LIVE');
    const onClickOnReactToEvent = () => onSelectTemplate('REACT_TO_EVENT');
    const onClicOnSegmentEntry = () => onSelectTemplate('ON_SEGMENT_ENTRY');
    const onClicOnSegmentExit = () => onSelectTemplate('ON_SEGMENT_EXIT');
    const onClickOnPeriodic = () => this.setState({ periodic: true })

    return (
      <Row className="mcs-selector_container">
        <Row className="menu">
          <MenuList
            title={
              hasFeature('automations-wizard-react-to-event')
                ? formatMessage(messages.reactToAnEvent)
                : formatMessage(messages.live)
            }
            subtitles={
              hasFeature('automations-wizard-react-to-event') && disableReactToEvent
                ? [formatMessage(messages.reactToAnEventDisabled)]
                : undefined
            }
            select={
              hasFeature('automations-wizard-react-to-event')
                ? onClickOnReactToEvent :
                onClickOnLive}
            disabled={hasFeature('automations-wizard-react-to-event') ? disableReactToEvent : false}
          />
          {
            this.props.hasFeature('automations-on-segment-entry') &&
            <MenuList
              title={formatMessage(messages.onSegmentEntry)}
              select={onClicOnSegmentEntry}
            />

          }
          {
            this.props.hasFeature('automations-on-segment-exit') &&
            <MenuList
              title={formatMessage(messages.onSegmentExit)}
              select={onClicOnSegmentExit}
            />
          }

        </Row>

        <div>
          <Row className="intermediate-title">
            <FormattedMessage {...messages.advanced} />
          </Row>
          <Row className="menu">
            {hasFeature('automations-wizard-react-to-event') && <MenuList
              title={formatMessage(messages.live)}
              select={onClickOnLive}
            />
            }
            <MenuList
              title={formatMessage(messages.periodic)}
              select={onClickOnPeriodic}
            />
          </Row>
        </div>

      </Row>
    )
  }

  renderSelectionPeriod = () => {

    const {
      onSelectTemplate,
      intl: {
        formatMessage
      }
    } = this.props;

    const onClickOnPeriodic = (n: number, p: QueryInputEvaluationPeriodUnit) => () => onSelectTemplate('PERIODIC', n, p);

    return (
      <Row className="mcs-selector_container">
        <Row className="menu">
          <MenuList title={formatMessage(messages.everyHours)} select={onClickOnPeriodic(1, "HOUR")} />
          <MenuList title={formatMessage(messages.every2Hours)} select={onClickOnPeriodic(2, "HOUR")} />
          <MenuList title={formatMessage(messages.everyDays)} select={onClickOnPeriodic(1, "DAY")} />
          <MenuList title={formatMessage(messages.everyWeeks)} select={onClickOnPeriodic(1, "WEEK")} />
          <MenuList title={formatMessage(messages.everyMonths)} select={onClickOnPeriodic(1, "MONTH")} />
          <MenuList title={formatMessage(messages.everyYears)} select={onClickOnPeriodic(12, "MONTH")} />
        </Row>
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
          {periodic
            ? this.renderSelectionPeriod()
            : this.renderSelectionAutomationType()
          }
        </Layout.Content>
      </Layout>
    );
  }
}

export default compose<Props, AutomationTemplateSelectorProps>(
  injectIntl,
  injectFeatures,
)(AutomationTemplateSelector);

const messages = defineMessages({
  title: {
    id: 'automations-template-selector-title',
    defaultMessage: 'Automations Builder',
  },
  advanced: {
    id: 'automations-template-selector-advanced',
    defaultMessage: 'Advanced',
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
  onSegmentEntry: {
    id: 'automations-template-selector-on-segment-entry',
    defaultMessage: 'On Segment Entry',
  },
  onSegmentExit: {
    id: 'automations-template-selector-on-segment-exit',
    defaultMessage: 'On Segment Exit',
  },
  reactToAnEvent: {
    id: 'automations-template-selector-reactToAnEvent',
    defaultMessage: 'React to an Event',
  },
  reactToAnEventDisabled: {
    id: 'automations-template-selector-reactToAnEvent-disabled',
    defaultMessage: 'Invalid configured schema - Please contact your support contact to enable it.',
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
  },
});
