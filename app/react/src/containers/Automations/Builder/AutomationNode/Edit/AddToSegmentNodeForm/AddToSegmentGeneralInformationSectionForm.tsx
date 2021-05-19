import * as React from 'react';
import { AddToSegmentAutomationFormData } from '../domain';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { ValidatorProps } from '../../../../../../components/Form/withValidators';
import { compose } from 'recompose';
import withNormalizer, { NormalizerProps } from '../../../../../../components/Form/withNormalizer';
import {
  withValidators,
  FormSection,
  FormInput,
  FormInputField,
  FormAddonSelectField,
  AddonSelect,
} from '../../../../../../components/Form';

interface GeneralInformationFormSectionProps {
  initialValues: Partial<AddToSegmentAutomationFormData>;
  organisationId: string;
  disabled?: boolean;
}

type Props = GeneralInformationFormSectionProps &
  InjectedIntlProps &
  ValidatorProps &
  NormalizerProps;

class AddToSegmentGeneralInformationFormSection extends React.Component<Props> {
  render() {
    const {
      fieldValidators: { isRequired, isValidInteger, isNotZero },
      intl: { formatMessage },
      disabled,
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionGeneralSubtitle}
          title={messages.sectionGeneralTitle}
        />
        <FormSection title={messages.sectionGeneralConfigurationTitle} />
        <div className='mcs-addToSegmentSectionForm'>
          <FormInputField
            name='audienceSegmentName'
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.audienceSegmentNameTitle),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(messages.audienceSegmentNamePlaceholder),
              disabled: !!disabled,
              className: 'mcs-audienceSegmentName',
            }}
            helpToolTipProps={{
              title: formatMessage(messages.audienceSegmentNameSubtitle),
            }}
            small={true}
          />
          <FormInputField
            name='ttl.value'
            component={FormInput}
            validate={[isValidInteger, isNotZero]}
            formItemProps={{
              label: formatMessage(messages.audienceSegmentTTLTitle),
            }}
            inputProps={{
              disabled: disabled,
              placeholder: formatMessage(messages.audienceSegmentTTLPlaceholder),
              className: 'mcs-ttlValue',
              addonAfter: (
                <FormAddonSelectField
                  name='ttl.unit'
                  component={AddonSelect}
                  disabled={disabled}
                  options={[
                    {
                      value: 'days',
                      key: 'days',
                      title: formatMessage(messages.audienceSegmentTTLUnitDays),
                    },
                    {
                      value: 'weeks',
                      key: 'weeks',
                      title: formatMessage(messages.audienceSegmentTTLUnitWeeks),
                    },
                    {
                      value: 'months',
                      key: 'months',
                      title: formatMessage(messages.audienceSegmentTTLUnitMonths),
                    },
                  ]}
                />
              ),
              style: { width: '100%' },
            }}
            helpToolTipProps={{
              title: formatMessage(messages.audienceSegmentTTLSubtitle),
            }}
            small={true}
          />
        </div>
      </div>
    );
  }
}

export default compose<Props, GeneralInformationFormSectionProps>(
  injectIntl,
  withValidators,
  withNormalizer,
)(AddToSegmentGeneralInformationFormSection);

export const messages = defineMessages({
  sectionGeneralTitle: {
    id: 'automation.builder.node.addToSegmentForm.general.title',
    defaultMessage: 'Description',
  },
  sectionGeneralSubtitle: {
    id: 'automation.builder.node.addToSegmentForm.general.subtitle',
    defaultMessage: 'The action allows you to add users to a segment.',
  },
  sectionGeneralConfigurationTitle: {
    id: 'automation.builder.node.addToSegmentForm.general.configuration.title',
    defaultMessage: 'Configuration',
  },
  automationNodeName: {
    id: 'automation.builder.node.addToSegmentForm.name',
    defaultMessage: 'Automation node name',
  },
  audienceSegmentNameTitle: {
    id: 'automation.builder.node.addToSegmentForm.name.title',
    defaultMessage: 'Segment Name',
  },
  audienceSegmentNameSubtitle: {
    id: 'automation.builder.node.addToSegmentForm.name.subtitle',
    defaultMessage:
      'The segment name will help you identify it on the different screens. Make it as memorable as you want your results to be!',
  },
  audienceSegmentNamePlaceholder: {
    id: 'automation.builder.node.addToSegmentForm.name.placeholder',
    defaultMessage: 'Segment Name',
  },
  audienceSegmentTTLTitle: {
    id: 'automation.builder.node.addToSegmentForm.ttl.title',
    defaultMessage: 'Time to live in segment',
  },
  audienceSegmentTTLSubtitle: {
    id: 'automation.builder.node.addToSegmentForm.ttl.subtitle',
    defaultMessage: 'The time that users will be in the segment for (empty means forever).',
  },
  audienceSegmentTTLPlaceholder: {
    id: 'automation.builder.node.addToSegmentForm.ttl.placeholder',
    defaultMessage: 'Time to live',
  },
  audienceSegmentTTLUnitDays: {
    id: 'automation.builder.node.addToSegmentForm.ttl.unit.days',
    defaultMessage: 'Days',
  },
  audienceSegmentTTLUnitWeeks: {
    id: 'automation.builder.node.addToSegmentForm.ttl.unit.weeks',
    defaultMessage: 'Weeks',
  },
  audienceSegmentTTLUnitMonths: {
    id: 'automation.builder.node.addToSegmentForm.ttl.unit.months',
    defaultMessage: 'Months',
  },
});
