import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import {
  FormInput,
  FormSection,
  FormSelect,
  FormInputField,
  FormSelectField,
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

const { DefaultSelect } = FormSelect;

export interface ObjectNodeSectionProps {
  availableFields: FieldResource[];
  domainObjects: string[];
}

interface ObjectNodeSectionState {
  isListOfObject: boolean;
}

interface MapStateToProps {
  formValues: ObjectNodeFormData;
}

type Props = InjectedIntlProps &
  ValidatorProps &
  NormalizerProps &
  ObjectNodeSectionProps &
  MapStateToProps;

class ObjectNodeSection extends React.Component<Props, ObjectNodeSectionState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isListOfObject: props.availableFields.reduce((acc: boolean, val) => {
        return val.field_type.indexOf('[') > -1 &&
          val.field_type.indexOf(']') > -1
          ? true
          : acc;
      }, false),
    };
  }

  checkIfFieldIsDomainObject = (field: FieldResource) => {
    const { domainObjects } = this.props;
    return domainObjects.reduce((acc: boolean, val) => {
      return field.field_type.indexOf(val) > -1 ? true : acc;
    }, false);
  };

  buildObjectOptions = () => {
    const { availableFields } = this.props;
    const options: Array<{ value: string; title: string }> = [];
    availableFields.forEach(f => {
      if (this.checkIfFieldIsDomainObject(f)) {
        options.push({
          value: f.field_type
            .replace('[', '')
            .replace(']', '')
            .replace('!', '')
            .replace('!', ''),
          title: f.name,
        });
      }
    });
    return options;
  };

  render() {
    const {
      fieldValidators: { isRequired, isValidInteger },
      intl: { formatMessage },
      formValues,
      availableFields,
    } = this.props;
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
            options={this.buildObjectOptions()}
            formItemProps={{
              label: formatMessage(messages.objectNodeFieldLabel),
              required: true,
            }}
            selectProps={{
              defaultValue:
                this.buildObjectOptions() && this.buildObjectOptions()[0].value,
            }}
            helpToolTipProps={{
              title: formatMessage(messages.objectNodeFieldTooltip),
            }}
            small={true}
          />
        </div>
        {formValues &&
        formValues.objectNodeForm &&
        formValues.objectNodeForm.field &&
        availableFields.reduce((acc: boolean, val) => {
          return val.field_type.indexOf(formValues.objectNodeForm.field) > -1 &&
            val.field_type.indexOf('[') > -1 &&
            val.field_type.indexOf(']') > -1
            ? true
            : acc;
        }, false) ? (
          <div>
            <FormInputField
              name="objectNodeForm.minScore"
              component={FormInput}
              validate={[isValidInteger]}
              formItemProps={{
                label: formatMessage(messages.objectNodeMinScoreLabel),
              }}
              inputProps={{
                placeholder: formatMessage(
                  messages.objectNodeMinScorePlaceholder,
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

const mapStateToProps = (state: any) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose<Props, ObjectNodeSectionProps>(
  injectIntl,
  withValidators,
  withNormalizer,
  connect(mapStateToProps),
)(ObjectNodeSection);
