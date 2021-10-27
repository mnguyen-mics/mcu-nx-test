import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { getFormValues, FieldArray, GenericFieldArray, Field } from 'redux-form';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import withNormalizer, { NormalizerProps } from '../../../../../../components/Form/withNormalizer';
import messages from '../../messages';
import {
  FormInput,
  FormSection,
  FormInputField,
  FormTextArea,
  FormTextAreaField,
} from '../../../../../../components/Form';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { FORM_ID } from '../MlAlgorithmForm';

import PropertyFields from '../../../../../../components/Form/FormProperties';

import { FormLinkedTextInputProps } from '../../../../../../components/Form/FormLinkedTextInput';
import { MlAlgorithmFormData } from '../../domain';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';

interface MapStateToProps {
  formValues: MlAlgorithmFormData;
}

type Props = InjectedIntlProps & ValidatorProps & NormalizerProps & MapStateToProps;

const PropertyFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  FormLinkedTextInputProps
>;

class GeneralFormSection extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const {
      fieldValidators: { isRequired, isCharLengthLessThan },
      intl: { formatMessage },
    } = this.props;

    return (
      <div>
        <FormSection
          title={messages.sectionTitleGeneral}
          subtitle={messages.sectionSubTitleGeneral}
        />

        <div>
          <FormInputField
            name='mlAlgorithm.name'
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.labelMlAlgorithmName),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(messages.labelMlAlgorithmName),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.tooltipMlAlgorithmName),
            }}
          />
          <FormTextAreaField
            name='mlAlgorithm.description'
            component={FormTextArea}
            validate={[isCharLengthLessThan(255), isRequired]}
            formItemProps={{
              label: formatMessage(messages.description),
            }}
            inputProps={{
              placeholder: formatMessage(messages.labelMlAlgorithmDescription),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.labelMlAlgorithmDescription),
            }}
          />

          <PropertyFieldArray
            name='mlAlgorithmVariablesKeyValues'
            component={PropertyFields}
            formItemProps={{ label: formatMessage(messages.mlVariableLabel), colon: false }}
            leftFormInput={{
              placeholder: formatMessage(messages.mlVariableKeyPlaceholder),
            }}
            rightFormInput={{
              placeholder: formatMessage(messages.mlVariableValuePlaceholder),
            }}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose(
  injectIntl,
  withValidators,
  withNormalizer,
  connect(mapStateToProps),
)(GeneralFormSection);
