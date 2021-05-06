import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import messages from './messages';
import { CustomActionAutomationFormData } from '../domain';
import { DefaultSelect, FormSelectField, FormSection } from '../../../../../../components/Form';
import { compose } from 'recompose';
import { ExtendedCustomActionInformation } from './CustomActionAutomationForm';
import { DefaultOptionProps } from '../../../../../../components/Form/FormSelect/DefaultSelect';

interface GeneralInformationFormSectionProps {
  initialValues: Partial<CustomActionAutomationFormData>;
  extendedCustomActionsInformation: ExtendedCustomActionInformation[];
  organisationId: string;
  disabled?: boolean;
}

type Props = GeneralInformationFormSectionProps & InjectedIntlProps & ValidatorProps;

class GeneralInformationFormSection extends React.Component<Props> {
  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
      disabled,
      extendedCustomActionsInformation,
    } = this.props;

    const options: DefaultOptionProps[] = extendedCustomActionsInformation.map(
      extendedCustomActionInformation => ({
        value: extendedCustomActionInformation.customAction.id,
        title: extendedCustomActionInformation.customAction.name,
      }),
    );

    const tooltip = (
      <span>
        {formatMessage(messages.pluginInstanceTooltip)}
        &nbsp;
        <a href='https://developer.mediarithmics.com/' target='_blank'>
          {formatMessage(messages.developerDocumentation)}
        </a>
        . &nbsp;
      </span>
    );

    return (
      <div>
        <FormSection title={messages.sectionGeneralConfigurationTitle} />
        <div>
          <FormSelectField
            name='customActionId'
            component={DefaultSelect}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.pluginInstanceLabel),
              required: true,
            }}
            helpToolTipProps={{ title: tooltip }}
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
