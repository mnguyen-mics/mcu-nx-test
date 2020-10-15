import * as React from 'react';
import { compose } from 'recompose';
import { Layout, Row } from 'antd';
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl';
import { FormTitle } from '../../../components/Form';
import { QueryInputEvaluationPeriodUnit } from '../../../models/automations/automations';
import { injectFeatures, InjectedFeaturesProps } from '../../Features';
import { AutomationSelectedType } from './AutomationBuilderPage';
import { MenuList, Actionbar } from '@mediarithmics-private/mcs-components-library';
import { ActionbarProps } from '@mediarithmics-private/mcs-components-library/lib/components/action-bar';

export interface AutomationTemplateSelectorProps {
  onSelectTemplate: (type: AutomationSelectedType, n?: number, p?: QueryInputEvaluationPeriodUnit) => void;
  actionbarProps: ActionbarProps;
  disableReactToEvent: boolean;
}

type Props = AutomationTemplateSelectorProps
  & InjectedIntlProps
  & InjectedFeaturesProps;

class AutomationTemplateSelector extends React.Component<Props> {

  renderSelectionAutomationType = () => {

    const {
      onSelectTemplate,
      intl: {
        formatMessage
      },
      hasFeature,
      disableReactToEvent,
    } = this.props;

    const onClickOnReactToEvent = () => onSelectTemplate('REACT_TO_EVENT');
    const onClicOnSegmentEntry = () => onSelectTemplate('ON_SEGMENT_ENTRY');
    const onClicOnSegmentExit = () => onSelectTemplate('ON_SEGMENT_EXIT');

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
            select={onClickOnReactToEvent}
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
      </Row>
    )
  }

  render() {
    const {
      actionbarProps,
    } = this.props;

    return (
      <Layout>
        <Actionbar {...actionbarProps} />
        <Layout.Content className="mcs-content-container mcs-form-container text-center">
          <FormTitle title={messages.title} subtitle={messages.subTitleStep1} />
          {this.renderSelectionAutomationType()}
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
