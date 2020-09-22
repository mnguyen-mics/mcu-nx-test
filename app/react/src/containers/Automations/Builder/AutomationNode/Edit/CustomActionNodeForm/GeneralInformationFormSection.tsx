import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';
import messages from './messages';
import { CustomActionAutomationFormData } from '../domain';
import {
  DefaultSelect,
  FormSelectField,
  FormInput,
  FormInputField,
  FormSection,
} from '../../../../../../components/Form';
import { compose } from 'recompose';
import { ExtendedPluginInformation } from './CustomActionAutomationForm';
import { OptionProps } from 'antd/lib/select';

interface GeneralInformationFormSectionProps {
  initialValues: Partial<CustomActionAutomationFormData>;
  extendedPluginsInformation: ExtendedPluginInformation[];
  organisationId: string;
  disabled?: boolean;
}

type Props = GeneralInformationFormSectionProps &
  InjectedIntlProps &
  ValidatorProps;

class GeneralInformationFormSection extends React.Component<Props> {
  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
      disabled,
      extendedPluginsInformation,
    } = this.props;

    const options: OptionProps[] = extendedPluginsInformation.map(
      extendedPluginInformation => ({
        value: extendedPluginInformation.plugin.id,
        title: extendedPluginInformation.pluginLayout
          ? extendedPluginInformation.pluginLayout.metadata.display_name
          : extendedPluginInformation.plugin.name ||
            extendedPluginInformation.plugin.artifact_id,
      }),
    );

    return (
      <div>
        <FormSection title={messages.sectionGeneralTitle} />
        <div>
          <FormInputField
            name="name"
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.customActionNameTitle),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(messages.customActionNamePlaceholder),
              disabled: !!disabled,
            }}
            small={true}
          />
          <FormSelectField
            name="pluginId"
            component={DefaultSelect}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.pluginVersionLabel),
              required: true,
            }}
            options={options}
            small={true}
            disabled={!!disabled}
          />
        </div>
      </div>
    );
  }
}

export default compose<Props, GeneralInformationFormSectionProps>(
  injectIntl,
  withValidators,
)(GeneralInformationFormSection);
