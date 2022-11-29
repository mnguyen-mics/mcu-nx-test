import * as React from 'react';
import {
  FormInputField,
  FormInput,
  DefaultSelect,
  FormSelectField,
} from '../../../../../components/Form';
import { compose } from 'recompose';
import withValidators, { ValidatorProps } from '../../../../../components/Form/withValidators';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import messages from './messages';

export interface IGeneralInformationProps {
  fieldNamePrefix: string;
  disabled: boolean;
  objects: string[];
}

type Props = IGeneralInformationProps & ValidatorProps & WrappedComponentProps;

class GeneralInformation extends React.Component<Props, {}> {
  public render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
      disabled,
      fieldNamePrefix,
    } = this.props;
    return (
      <div>
        <FormSelectField
          name={`${fieldNamePrefix}.hosting_object_type_name`}
          component={DefaultSelect}
          validate={[isRequired]}
          options={this.props.objects.map(i => {
            return { title: i, value: i };
          })}
          formItemProps={{
            label: formatMessage(messages.labelHostingObjectType),
            required: true,
          }}
          helpToolTipProps={{
            title: formatMessage(messages.tootltipHostingObjectType),
          }}
        />
        <FormInputField
          name={`${fieldNamePrefix}.field_type_name`}
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.labelFieldTypeName),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.labelFieldTypeName),
            disabled,
          }}
          helpToolTipProps={{
            title: formatMessage(messages.tootltipFieldTypeName),
          }}
        />
        <FormInputField
          name={`${fieldNamePrefix}.field_name`}
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.labelFieldName),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.labelFieldName),
            disabled,
          }}
          helpToolTipProps={{
            title: formatMessage(messages.tootltipFieldName),
          }}
        />
        <FormInputField
          name={`${fieldNamePrefix}.query`}
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.labelQuery),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.labelQuery),
            disabled,
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
