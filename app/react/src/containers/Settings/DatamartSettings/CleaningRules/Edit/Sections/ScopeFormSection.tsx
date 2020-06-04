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
import { CleaningRuleType } from '../../../../../../models/cleaningRules/CleaningRules';

interface ScopeFormSectionProps {
  options: OptionProps[];
  cleaningRuleType: CleaningRuleType;
}

type Props = ScopeFormSectionProps & InjectedIntlProps;

class ScopeFormSection extends React.Component<Props> {
  render() {
    const {
      intl: { formatMessage },
      options,
      cleaningRuleType
    } = this.props;

    return cleaningRuleType === 'USER_EVENT_CLEANING_RULE' ? (
      <div>
        <FormSection
          subtitle={messages.sectionScopeUserEventSubTitle}
          title={messages.sectionScopeTitle}
        />
        <FormSelectField
          name="activityTypeFilter"
          component={DefaultSelect}
          formItemProps={{
            label: formatMessage(messages.sectionScopeActivityTypeLabel),
            required: false,
          }}
          options={[
            { value: '', title: formatMessage(messages.sectionScopeActivityTypeAllTypes)},
            { value: 'SITE_VISIT', title: 'SITE_VISIT' },
            { value: 'APP_VISIT', title: 'APP_VISIT' },
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
          options={options}
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
          helpToolTipProps={{
            title: formatMessage(messages.sectionScopeEventNameHelper),
          }}
        />
      </div>
    ) : (
      <div>
        <FormSection
          subtitle={messages.sectionScopeUserProfileSubTitle}
          title={messages.sectionScopeTitle}
        />
        <FormSelectField
          name="userProfileCleaningRule.compartment_filter"
          component={DefaultSelect}
          formItemProps={{
            label: formatMessage(messages.sectionScopeCompartmentLabel),
            required: false,
          }}
          options={options}
          helpToolTipProps={{
            title: formatMessage(messages.sectionScopeCompartmentHelper),
          }}
        />
      </div>
    );
  }
}

export default compose<Props, ScopeFormSectionProps>(injectIntl)(ScopeFormSection);
