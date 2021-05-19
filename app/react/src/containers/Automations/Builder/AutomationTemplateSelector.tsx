import * as React from 'react';
import { compose } from 'recompose';
import { Layout, Row } from 'antd';
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl';
import { FormTitle } from '../../../components/Form';
import { injectFeatures, InjectedFeaturesProps } from '../../Features';
import { AutomationSelectedType } from './AutomationBuilderPage';
import { MenuList, Actionbar } from '@mediarithmics-private/mcs-components-library';
import { ActionbarProps } from '@mediarithmics-private/mcs-components-library/lib/components/action-bar';

export interface AutomationTemplateSelectorProps {
  onSelectTemplate: (type: AutomationSelectedType) => void;
  actionbarProps: ActionbarProps;
  disableReactToEvent: boolean;
}

type Props = AutomationTemplateSelectorProps & InjectedIntlProps & InjectedFeaturesProps;

class AutomationTemplateSelector extends React.Component<Props> {
  renderSelectionAutomationType = () => {
    const {
      onSelectTemplate,
      intl: { formatMessage },
      disableReactToEvent,
    } = this.props;

    const onClickOnReactToEvent = () => onSelectTemplate('REACT_TO_EVENT');
    const onClicOnSegmentEntry = () => onSelectTemplate('ON_SEGMENT_ENTRY');
    const onClicOnSegmentExit = () => onSelectTemplate('ON_SEGMENT_EXIT');

    return (
      <Row className='mcs-selector_container'>
        <Row className='menu'>
          <MenuList
            className='mcs-menu-list-reactToEvent'
            title={formatMessage(messages.reactToAnEvent)}
            subtitles={
              disableReactToEvent ? [formatMessage(messages.reactToAnEventDisabled)] : undefined
            }
            select={onClickOnReactToEvent}
            disabled={disableReactToEvent}
          />
          {this.props.hasFeature('automations-on-segment-entry') && (
            <MenuList
              className='mcs-menu-list-onSegmentEntry'
              title={formatMessage(messages.onSegmentEntry)}
              select={onClicOnSegmentEntry}
            />
          )}
          {this.props.hasFeature('automations-on-segment-exit') && (
            <MenuList
              className='mcs-menu-list-onSegmentExit'
              title={formatMessage(messages.onSegmentExit)}
              select={onClicOnSegmentExit}
            />
          )}
        </Row>
      </Row>
    );
  };

  render() {
    const { actionbarProps } = this.props;

    return (
      <Layout>
        <Actionbar {...actionbarProps} />
        <Layout.Content className='mcs-content-container mcs-form-container text-center'>
          <FormTitle title={messages.title} subtitle={messages.subTitle} />
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
  subTitle: {
    id: 'automations-template-selector-subtitle-step1',
    defaultMessage: 'Choose your automation type',
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
});
