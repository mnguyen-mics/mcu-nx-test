import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import messages from '../messages';
import { FormInputField, FormInput } from '../../../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import withNormalizer, { NormalizerProps } from '../../../../../../components/Form/withNormalizer';
import PropertyFields from './Properties';
import { FieldArray, GenericFieldArray, Field } from 'redux-form';
import { FormLinkedTextInputProps } from '../../../../../../components/Form/FormLinkedTextInput';

const PropertyFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  FormLinkedTextInputProps
>;

type Props = InjectedIntlProps & ValidatorProps & NormalizerProps;

class UriMatch extends React.Component<Props> {
  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
    } = this.props;

    return (
      <div>
        <FormInputField
          name='model.pattern'
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.contentUriMatchPatternLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.contentUriMatchPatternPlaceholder),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.contentUriMatchPatternTooltip),
          }}
        />
        <FormInputField
          name='model.event_template.$event_name'
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.contentUriMatchEventNameLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.contentUriMatchEventNamePlaceholder),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.contentUriMatchEventNameTooltip),
          }}
        />
        <PropertyFieldArray
          name='model.event_template.$properties'
          component={PropertyFields}
          formItemProps={{
            label: formatMessage(messages.contentUriMatchPropertyLabel),
            colon: false,
          }}
          leftFormInput={{
            placeholder: formatMessage(messages.contentUriMatchPropertyNamePlaceholder),
          }}
          rightFormInput={{
            placeholder: formatMessage(messages.contentUriMatchPropertyValuePlaceholder),
          }}
        />
      </div>
    );
  }
}

export default compose(injectIntl, withValidators, withNormalizer)(UriMatch);
