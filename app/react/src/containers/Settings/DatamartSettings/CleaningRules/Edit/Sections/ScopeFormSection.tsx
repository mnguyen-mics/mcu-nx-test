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
