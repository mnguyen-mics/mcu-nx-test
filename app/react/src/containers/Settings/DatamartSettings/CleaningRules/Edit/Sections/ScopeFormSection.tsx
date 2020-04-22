import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import messages from '../messages';
import {
  FormSection,
  FormSelectField,
  DefaultSelect,
  FormInputField,
  FormInput,
} from '../../../../../../components/Form';
import { OptionProps } from 'antd/lib/select';

interface ScopeFormSectionProps {
  channelOptions: OptionProps[];
}

type Props = ScopeFormSectionProps & InjectedIntlProps;

class ScopeFormSection extends React.Component<Props> {
  render() {
    const {
      intl: { formatMessage },
      channelOptions,
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionScopeSubTitle}
          title={messages.sectionScopeTitle}
        />
        <FormSelectField
          name="activityTypeFilter"
          component={DefaultSelect}
          formItemProps={{
            label: formatMessage(messages.sectionScopeActivityTypeLabel),
            required: false,
          }}
          disabled={true}
          options={[
            { value: 'ALL', title: 'ALL' },
            { value: 'USER_PLATFORM', title: 'USER_PLATFORM' },
            { value: 'TOUCH', title: 'TOUCH' },
            { value: 'SITE_VISIT', title: 'SITE_VISIT' },
            { value: 'APP_VISIT', title: 'APP_VISIT' },
            { value: 'EMAIL', title: 'EMAIL' },
            { value: 'DISPLAY_AD', title: 'DISPLAY_AD' },
            { value: 'STOPWATCH', title: 'STOPWATCH' },
            { value: 'STAGING_AREA', title: 'STAGING_AREA' },
            { value: 'RECOMMENDER', title: 'RECOMMENDER' },
            { value: 'USER_SCENARIO_START', title: 'USER_SCENARIO_START' },
            { value: 'USER_SCENARIO_STOP', title: 'USER_SCENARIO_STOP' },
            {
              value: 'USER_SCENARIO_NODE_ENTER',
              title: 'USER_SCENARIO_NODE_ENTER',
            },
            {
              value: 'USER_SCENARIO_NODE_EXIT',
              title: 'USER_SCENARIO_NODE_EXIT',
            },
          ]}
          helpToolTipProps={{
            title: formatMessage(messages.sectionScopeActivityTypeHelper),
          }}
        />
        <FormSelectField
          name="channelFilter"
          component={DefaultSelect}
          formItemProps={{
            label: formatMessage(messages.sectionScopeChannelLabel),
            required: false,
          }}
          disabled= {true}
          options={channelOptions}
          helpToolTipProps={{
            title: formatMessage(messages.sectionScopeChannelHelper),
          }}
        />
        <FormInputField
          name="eventNameFilter"
          component={FormInput}
          formItemProps={{
            label: formatMessage(messages.sectionScopeEventNameLabel),
            required: false,
          }}
          inputProps={{disabled: true}}
          helpToolTipProps={{
            title: formatMessage(messages.sectionScopeEventNameHelper),
          }}
        />
      </div>
    );
  }
}

export default compose<Props, ScopeFormSectionProps>(injectIntl)(ScopeFormSection);
