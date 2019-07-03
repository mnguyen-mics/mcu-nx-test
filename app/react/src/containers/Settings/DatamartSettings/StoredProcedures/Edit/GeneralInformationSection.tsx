import * as React from 'react';
import { FormInputField, FormInput } from '../../../../../components/Form';
import { compose } from 'recompose';
import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from "./messages"

export interface IGeneralInformationProps {}

type Props = IGeneralInformationProps & ValidatorProps & InjectedIntlProps;

class GeneralInformation extends React.Component<Props, any> {
  public render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
    } = this.props;
    return (
      <div>
        <FormInputField
          name="hosting_object_type_name"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.labelHostingObjectType),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.labelHostingObjectType),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.tootltipHostingObjectType),
          }}
        />
        <FormInputField
          name="field_type_name"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.labelFieldTypeName),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.labelFieldTypeName),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.tootltipFieldTypeName),
          }}
        />
        <FormInputField
          name="field_name"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.labelFieldName),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.labelFieldName),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.tootltipFieldName),
          }}
        />
        <FormInputField
          name="query"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.labelQuery),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.labelQuery),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.tootltipQuery),
          }}
        />
      </div>
    );
  }
}

export default compose<Props, IGeneralInformationProps>(
  withValidators,
  injectIntl,
)(GeneralInformation);
