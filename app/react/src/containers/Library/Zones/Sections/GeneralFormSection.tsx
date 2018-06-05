import * as React from 'react';
import { FormSection, FormInput, FormInputField } from '../../../../components/Form';
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import withValidators, {
  ValidatorProps,
} from '../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../components/Form/withNormalizer';

import { ButtonStyleless, McsIcon } from '../../../../components';
import FormModalWrapper from '../../../../components/BlurredModal/FormModalWrapper';

export interface GeneralFormSectionProps {
  onClose: () => void;
  formId: string;
}

const messages = defineMessages({
  title: {
    id: 'edit.zone.general.title',
    defaultMessage: 'General Information'
  },
  labelZoneName: {
    id: 'edit.zone.general.name.label',
    defaultMessage: 'Zone Name'
  },
  placeholderZoneName: {
    id: 'edit.zone.general.name.placeholder',
    defaultMessage: 'Zone Name'
  },
  tooltipZoneName: {
    id: 'edit.zone.general.name.tooltip',
    defaultMessage: 'Give your zone a name so you can find it back in your campaign settings.'
  },
  submit: {
    id: 'edit.zone.step2.submit',
    defaultMessage: 'Save your Zone'
  },
  advanced: {
    id: 'edit.zone.general.advanced',
    defaultMessage: 'Advanced'
  },
  labeZoneTechnicalName: {
    id: 'edit.zone.general.technical_name.label',
    defaultMessage: 'Technical Name'
  },
  placeholderZoneTechnicalName: {
    id: 'edit.zone.general.technical_name.placeholder',
    defaultMessage: 'Technical Name'
  },
  tooltipZoneTechnicalName: {
    id: 'edit.zone.general.technical_name.tooltip',
    defaultMessage: 'Give your zone a technical name so you can find it using APIs.'
  },
})

type Props = GeneralFormSectionProps & InjectedIntlProps & NormalizerProps & ValidatorProps;

interface State {
  displayAdvancedSection: boolean;
}

class GeneralFormSection extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      displayAdvancedSection: false,
    }
  }

  toggleAdvancedSection = () => {
    this.setState({
      displayAdvancedSection: !this.state.displayAdvancedSection,
    });
  };

  render() {
    const {
      intl: {
        formatMessage
      },
      fieldValidators: { isRequired },
      onClose,
      formId
    } = this.props;

    return (
      <FormModalWrapper
        formId={formId}
        onClose={onClose}
        message={messages.submit}
      >
        <div>
          <FormSection
            title={messages.title}
            subtitle={messages.title}
          />
          <div>
            <FormInputField
              name="name"
              component={FormInput}
              validate={[isRequired]}
              formItemProps={{
                label: formatMessage(messages.labelZoneName),
                required: true,
              }}
              inputProps={{
                placeholder: formatMessage(messages.placeholderZoneName),
              }}
              helpToolTipProps={{
                title: formatMessage(messages.tooltipZoneName),
              }}
            />
          </div>
          <div>
            <ButtonStyleless
              className="optional-section-title clickable-on-hover"
              onClick={this.toggleAdvancedSection}
            >
              <McsIcon type="settings" />
              <span className="step-title">
                {formatMessage(messages.advanced)}
              </span>
              <McsIcon type="chevron" />
            </ButtonStyleless>

            <div
              className={
                !this.state.displayAdvancedSection
                  ? 'hide-section'
                  : 'optional-section-content'
              }
            >
              <FormInputField
                name="technical_name"
                component={FormInput}
                formItemProps={{
                  label: formatMessage(messages.labeZoneTechnicalName),
                }}
                inputProps={{
                  placeholder: formatMessage(messages.placeholderZoneTechnicalName),
                }}
                helpToolTipProps={{
                  title: formatMessage(messages.tooltipZoneTechnicalName),
                }}
              />
            </div>
          </div>
        </div>
      </FormModalWrapper>
    );
  }
}

export default compose<Props, GeneralFormSectionProps>(
  injectIntl,
  withValidators,
  withNormalizer
)(GeneralFormSection);