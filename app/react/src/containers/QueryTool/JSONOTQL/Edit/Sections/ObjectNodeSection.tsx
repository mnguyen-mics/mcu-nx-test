import * as React from 'react';
import { InjectedIntlProps, injectIntl, FormattedMessage } from 'react-intl';
import lodash from 'lodash';
import {
  FormInput,
  FormSection,
  FormInputField,
  FormSelectField,
  DefaultSelect,
  FormCheckbox,
  FormCheckboxField,
} from '../../../../../components/Form';
import withNormalizer, { NormalizerProps } from '../../../../../components/Form/withNormalizer';
import withValidators, { ValidatorProps } from '../../../../../components/Form/withValidators';
import { compose } from 'recompose';
import messages from '../messages';
import { getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { FORM_ID, ObjectNodeFormData } from '../domain';
import {
  ObjectLikeTypeInfoResource,
  FieldInfoResource,
} from '../../../../../models/datamart/graphdb/RuntimeSchema';
import { SelectValue } from 'antd/lib/select';
import { frequencyModeMessageMap } from '../../messages';
import { typesTrigger } from '../../domain';
import { MicsReduxState } from '../../../../../utils/ReduxHelper';

export interface ObjectNodeSectionProps {
  objectTypeFields: FieldInfoResource[];
  onSelect: (value: SelectValue) => void;
  isTrigger: boolean;
  objectType: ObjectLikeTypeInfoResource;
  selectedObjectType?: ObjectLikeTypeInfoResource;
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
      title: otf.decorator && otf.decorator.hidden === false ? otf.decorator.label : otf.name,
      value: otf.name,
    }));
  };

  triggerModeFrequency(
    objectType: ObjectLikeTypeInfoResource,
    selectedObjectType: ObjectLikeTypeInfoResource,
  ): boolean {
    if (objectType.name === 'UserPoint') {
      return !lodash
        .flatMap(selectedObjectType.directives, d => {
          return d.arguments.map(a =>
            Object.values(typesTrigger).includes(a.value.replace(/[^a-zA-Z]+/g, '')),
          );
        })
        .reduce((acc: boolean, val: boolean) => acc || val, false);
    } else {
      return true;
    }
  }

  render() {
    const {
      fieldValidators: { isRequired, isValidInteger },
      intl: { formatMessage },
      formValues,
      onSelect,
      isTrigger,
      objectType,
      selectedObjectType,
    } = this.props;

    const showFrenquencyTrigger = isTrigger
      ? selectedObjectType && this.triggerModeFrequency(objectType, selectedObjectType)
      : true;

    const showEnableFrequency = !!(
      formValues.objectNodeForm.field &&
      objectType.fields
        .find(otf => formValues.objectNodeForm.field === otf.name)!
        .field_type.startsWith('[') &&
      showFrenquencyTrigger
    );
    const showFrequency = formValues.frequency.enabled;

    return (
      <div className='mcs-objectNodeSection'>
        <FormSection subtitle={messages.objectNodeSubTitle} title={messages.objectNodeTitle} />

        <div>
          <FormSelectField
            name='objectNodeForm.field'
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
              className: 'mcs-objectNodeSection_select',
            }}
            small={true}
          />
        </div>
        {showEnableFrequency && (
          <FormCheckboxField
            name='frequency.enabled'
            component={FormCheckbox}
            className='field-label m-b-20 mcs-objectNodeSection_checkbox'
          >
            <FormattedMessage
              id='queryTool.queryDocument.objectNode.frequency.enabled'
              defaultMessage='I want to add a frequency'
            />
          </FormCheckboxField>
        )}
        {showFrequency ? (
          <div>
            <FormInputField
              name='frequency.value'
              component={FormInput}
              validate={[isValidInteger]}
              formItemProps={{
                label: formatMessage(messages.objectNodeMinScoreLabel),
              }}
              inputProps={{
                className: 'mcs-objectNodeSection_frequency_value',
                placeholder: formatMessage(messages.objectNodeMinScorePlaceholder),
                type: 'number',
                addonBefore: <FormattedMessage {...frequencyModeMessageMap.AT_LEAST} />,
                addonAfter: (
                  <FormattedMessage
                    id='queryTool.queryDocument.objectNode.freqency.time'
                    defaultMessage='times'
                  />
                ),
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

const mapStateToProps = (state: MicsReduxState) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose<Props, ObjectNodeSectionProps>(
  injectIntl,
  withValidators,
  withNormalizer,
  connect(mapStateToProps),
)(ObjectNodeSection);
