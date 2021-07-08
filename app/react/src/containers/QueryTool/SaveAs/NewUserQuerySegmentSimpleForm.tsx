import * as React from 'react';
import {
  reduxForm,
  InjectedFormProps,
  ConfigProps,
  FieldArray,
  GenericFieldArray,
  Field,
} from 'redux-form';
import { Omit } from 'react-router';
import { Form } from '@ant-design/compatible';
import { Button, McsIcon } from '@mediarithmics-private/mcs-components-library';
import {
  FormBoolean,
  AddonSelect,
  FormInputField,
  FormInput,
  withValidators,
  withNormalizer,
  FormAddonSelectField,
  FormBooleanField,
} from '../../../components/Form';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { ValidatorProps } from '../../../components/Form/withValidators';
import { NormalizerProps } from '../../../components/Form/withNormalizer';
import ProcessingActivitiesFormSection, {
  ProcessingActivitiesFormSectionProps,
} from '../../Settings/DatamartSettings/Common/ProcessingActivitiesFormSection';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import { ProcessingActivityFieldModel } from '../../Settings/DatamartSettings/Common/domain';

export interface NewUserQuerySimpleFormData {
  name: string;
  technical_name?: string;
  defaultLifetime?: string;
  defaultLifetimeUnit: 'days' | 'weeks' | 'months';
  persisted: boolean;
  processingActivities: ProcessingActivityFieldModel[];
}

const initialFormData: Partial<NewUserQuerySimpleFormData> = {
  defaultLifetimeUnit: 'days',
  persisted: true,
  processingActivities: [],
};

export const FORM_ID = 'userQuerySegmentSimpleForm';

const ProcessingActivitiesFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  ProcessingActivitiesFormSectionProps
>;

interface State {
  displayAdvancedSection: boolean;
}

export interface FormProps
  extends Omit<ConfigProps<NewUserQuerySimpleFormData, FormProps>, 'form'> {}

type Props = FormProps &
  InjectedFeaturesProps &
  InjectedIntlProps &
  ValidatorProps &
  NormalizerProps;

class NewUserQuerySegmentSimleForm extends React.Component<
  Props & InjectedFormProps<NewUserQuerySimpleFormData, Props>,
  State
> {
  constructor(props: Props & InjectedFormProps<NewUserQuerySimpleFormData, Props>) {
    super(props);
    this.state = {
      displayAdvancedSection: false,
    };
  }

  renderProcessingActivitiesSection = () => {
    const { hasFeature, change } = this.props;
    if (hasFeature('datamart-user_choices')) {
      const genericFieldArrayProps = {
        formChange: change,
        rerenderOnEveryChange: true,
      };
      return (
        <ProcessingActivitiesFieldArray
          name='processingActivities'
          component={ProcessingActivitiesFormSection}
          initialProcessingSelectionsForWarning={undefined}
          processingsAssociatedType={'SEGMENT'}
          modalMode={true}
          {...genericFieldArrayProps}
        />
      );
    }
    return <div />;
  };

  render() {
    const { fieldValidators, intl, handleSubmit } = this.props;

    const toggleAdvancedSection = () =>
      this.setState({
        displayAdvancedSection: !this.state.displayAdvancedSection,
      });

    return (
      <Form className='edit-layout ant-layout' layout='vertical' onSubmit={handleSubmit}>
        <div className='mcs-form-container' style={{ paddingTop: '0px' }}>
          <FormInputField
            name='name'
            component={FormInput}
            validate={[fieldValidators.isRequired]}
            formItemProps={{
              label: intl.formatMessage(messages.segmentNameLabel),
              required: true,
            }}
            inputProps={{
              className: 'mcs-newUserQuerySegmentSimpleForm_name_input',
              placeholder: intl.formatMessage(messages.segmentNamePlaceHolder),
            }}
            helpToolTipProps={{
              title: intl.formatMessage(messages.segmentNameTooltip),
            }}
            small={true}
          />
          {this.renderProcessingActivitiesSection()}
          <Button className='optional-section-title' onClick={toggleAdvancedSection}>
            <McsIcon type='settings' />
            <span className='step-title'>
              {intl.formatMessage(messages.segmentAdvancedButtonLabel)}
            </span>
            <McsIcon type='chevron' />
          </Button>
          {this.state.displayAdvancedSection && (
            <div>
              <div className='optional-section-content'>
                <FormInputField
                  name='technical_name'
                  component={FormInput}
                  formItemProps={{
                    label: intl.formatMessage(messages.segmentTechinicalNameLabel),
                  }}
                  inputProps={{
                    placeholder: intl.formatMessage(messages.segmentTechinicalNamePlaceholder),
                  }}
                  helpToolTipProps={{
                    title: intl.formatMessage(messages.segmentTechinicalNameTooltip),
                  }}
                  small={true}
                />
              </div>
              <FormInputField
                name='defaultLifetime'
                component={FormInput}
                validate={[fieldValidators.isValidInteger, fieldValidators.isNotZero]}
                formItemProps={{
                  label: intl.formatMessage(messages.segmentDefaultLifetimeLabel),
                }}
                inputProps={{
                  addonAfter: (
                    <FormAddonSelectField
                      name='defaultLifetimeUnit'
                      component={AddonSelect}
                      options={[
                        {
                          value: 'days',
                          title: intl.formatMessage(messages.segmentDefaultLifetimeOptionDAY),
                        },
                        {
                          value: 'weeks',
                          title: intl.formatMessage(messages.segmentDefaultLifetimeOptionWEEK),
                        },
                        {
                          value: 'months',
                          title: intl.formatMessage(messages.segmentDefaultLifetimeOptionMONTH),
                        },
                      ]}
                    />
                  ),
                  placeholder: intl.formatMessage(messages.segmentDefaultLifetimePlaceholder),
                  style: { width: '100%' },
                }}
                helpToolTipProps={{
                  title: intl.formatMessage(messages.segmentDefaultLifetimeTooltip),
                }}
                small={true}
              />
              <FormBooleanField
                name='persisted'
                component={FormBoolean}
                formItemProps={{
                  label: intl.formatMessage(messages.segmentPersistedLabel),
                  hasMarginBottom: true,
                }}
                helpToolTipProps={{
                  title: intl.formatMessage(messages.segmentPersistedTooltip),
                }}
                small={true}
              />
              <FormBooleanField
                name='paused'
                component={FormBoolean}
                formItemProps={{
                  label: intl.formatMessage(messages.segmentPausedLabel),
                  hasMarginBottom: true,
                }}
                helpToolTipProps={{
                  title: intl.formatMessage(messages.segmentPausedTooltip),
                }}
                small={true}
              />
            </div>
          )}
        </div>
      </Form>
    );
  }
}

export default compose<Props, FormProps>(
  injectIntl,
  withValidators,
  injectFeatures,
  withNormalizer,
  reduxForm({
    form: FORM_ID,
    initialValues: initialFormData,
  }),
)(NewUserQuerySegmentSimleForm);

const messages = defineMessages({
  segmentNameLabel: {
    id: 'query.saveas.segment.name.label',
    defaultMessage: 'Name',
  },
  segmentNamePlaceHolder: {
    id: 'query.saveas.segment.name.placeholder',
    defaultMessage: 'Audience Segment Name',
  },
  segmentNameTooltip: {
    id: 'query.saveas.segment.name.helper',
    defaultMessage: 'Give your Audience Segment a name to find it back on the segment screen.',
  },
  segmentAdvancedButtonLabel: {
    id: 'query.saveas.segment.advanced',
    defaultMessage: 'Advanced',
  },
  segmentDefaultLifetimeLabel: {
    id: 'query.saveas.segment.defaultlifetime.label',
    defaultMessage: 'Default lifetime',
  },
  segmentDefaultLifetimePlaceholder: {
    id: 'query.saveas.segment.defaultlifetime.placeholder',
    defaultMessage: 'Default lifetime',
  },
  segmentDefaultLifetimeOptionDAY: {
    id: 'query.saveas.segment.defaultlifetime.optionDAY',
    defaultMessage: 'Days',
  },
  segmentDefaultLifetimeOptionWEEK: {
    id: 'query.saveas.segment.defaultlifetime.optionWEEK',
    defaultMessage: 'Weeks',
  },
  segmentDefaultLifetimeOptionMONTH: {
    id: 'query.saveas.segment.defaultlifetime.optionMONTH',
    defaultMessage: 'Months',
  },
  segmentDefaultLifetimeTooltip: {
    id: 'query.saveas.segment.defaultlifetime.tooltip',
    defaultMessage: 'Use the Default lifetime expiration',
  },
  segmentTechinicalNameLabel: {
    id: 'query.saveas.segment.technicalname.label',
    defaultMessage: 'Technical Name',
  },
  segmentTechinicalNamePlaceholder: {
    id: 'query.saveas.segment.technicalname.placeholder',
    defaultMessage: 'Technical Name',
  },
  segmentTechinicalNameTooltip: {
    id: 'query.saveas.segment.technicalname.tooltip',
    defaultMessage: 'Use the Technical Name for custom integration',
  },
  segmentPersistedLabel: {
    id: 'query.saveas.segment.persisted.title',
    defaultMessage: 'Persisted',
  },
  segmentPersistedTooltip: {
    id: 'query.saveas.segment.persisted.helper',
    defaultMessage:
      'A persisted segment can be used in a campaign whereas a non persisted serves as analytics',
  },
  segmentPausedLabel: {
    id: 'query.saveas.segment.paused.title',
    defaultMessage: 'Paused',
  },
  segmentPausedTooltip: {
    id: 'query.saveas.segment.paused.helper',
    defaultMessage:
      'When a segment is paused, all related processings (statistics, user insertions and deletions) are stopped.',
  },
});
