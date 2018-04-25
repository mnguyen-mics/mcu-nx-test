import * as React from 'react';
import { InjectedIntlProps, injectIntl, FormattedMessage } from 'react-intl';
import {
  FormInput,
  FormSection,
  FormInputField,
  FormSelectField,
  DefaultSelect,
  FormAddonSelectField,
  AddonSelect,
  FormCheckbox,
  FormCheckboxField,
} from '../../../../../components/Form';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../components/Form/withNormalizer';
import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import { compose } from 'recompose';
import messages from '../messages';
import { getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { FORM_ID, ObjectNodeFormData } from '../domain';
import { FieldResource } from '../../../../../models/datamart/graphdb/RuntimeSchema';
import { SelectValue } from 'antd/lib/select';
import { frequencyModeMessageMap } from '../../messages';

export interface ObjectNodeSectionProps {
  objectTypeFields: FieldResource[];
  onSelect: (value: SelectValue) => void;
}

interface MapStateToProps {
  formValues: ObjectNodeFormData;
}

type Props = InjectedIntlProps &
  ValidatorProps &
  NormalizerProps &
  ObjectNodeSectionProps &
  MapStateToProps;

class ObjectNodeSection extends React.Component<Props> {
  buildOptions = () => {
    const { objectTypeFields } = this.props;
    return objectTypeFields.map(otf => ({
      title: otf.name,
      value: otf.name,
    }));
  };

  render() {
    const {
      fieldValidators: { isRequired, isValidInteger },
      intl: { formatMessage },
      formValues,
      objectTypeFields,
      onSelect,
    } = this.props;

    const showEnableFrequency = !!(
      formValues.objectNodeForm.field &&
      objectTypeFields
        .find(otf => formValues.objectNodeForm.field === otf.name)!
        .field_type.startsWith('[')
    );
    const showFrequency = formValues.frequency.enabled;

    return (
      <div>
        <FormSection
          subtitle={messages.objectNodeSubTitle}
          title={messages.objectNodeTitle}
        />

        <div>
          <FormSelectField
            name="objectNodeForm.field"
            component={DefaultSelect}
            validate={[isRequired]}
            options={this.buildOptions()}
            formItemProps={{
              label: formatMessage(messages.objectNodeFieldLabel),
              required: true,
            }}
            helpToolTipProps={{
              title: formatMessage(messages.objectNodeFieldTooltip),
            }}
            selectProps={{
              onSelect,
            }}
            small={true}
          />
        </div>
        {showEnableFrequency && (
          <FormCheckboxField name="frequency.enabled" component={FormCheckbox} className="field-label m-b-20">
            <FormattedMessage
              id="queryDocument.objectNode.freqency.enabled"
              defaultMessage="I want to add a frequency"
            />
          </FormCheckboxField>
        )}
        {showFrequency ? (
          <div>
            <FormInputField
              name="frequency.value"
              component={FormInput}
              validate={[isValidInteger]}
              formItemProps={{
                label: formatMessage(messages.objectNodeMinScoreLabel),
              }}
              inputProps={{
                placeholder: formatMessage(
                  messages.objectNodeMinScorePlaceholder,
                ),
                type: 'number',
                addonBefore: (
                  <FormAddonSelectField
                    name="frequency.mode"
                    component={AddonSelect}
                    options={[
                      {
                        value: 'AT_LEAST',
                        title: formatMessage(frequencyModeMessageMap.AT_LEAST),
                      },
                      {
                        value: 'AT_MOST',
                        title: formatMessage(frequencyModeMessageMap.AT_MOST),
                        disabled: true,
                      },
                    ]}
                  />
                ),
                addonAfter: <FormattedMessage 
                  id="queryDocument.objectNode.freqency.time" 
                  defaultMessage="times" 
                />
              }}
              helpToolTipProps={{
                title: formatMessage(messages.objectNodeMinScoreTooltip),
              }}
              small={true}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose<Props, ObjectNodeSectionProps>(
  injectIntl,
  withValidators,
  withNormalizer,
  connect(mapStateToProps),
)(ObjectNodeSection);
