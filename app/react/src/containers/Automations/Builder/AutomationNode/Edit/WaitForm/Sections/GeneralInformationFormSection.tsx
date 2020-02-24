import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import {
  FormInput,
  FormSection,
  FormInputField,
  FormAddonSelectField,
  AddonSelect,
} from '../../../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../../../components/Form/withNormalizer';
import { DefaultFormData } from '../../domain';

export const messages = defineMessages({
  sectionGeneralTitle: {
    id: 'automation.builder.node.waitNodeForm.general.title',
    defaultMessage: 'General Informations',
  },
  sectionGeneralSubtitle: {
    id: 'automation.builder.node.waitNodeForm.general.subtitle',
    defaultMessage: 'Modify the general information of the node',
  },
  durationTitle: {
    id: 'automation.builder.node.waitNodeForm.duration.title',
    defaultMessage: "Duration"
  },
  durationSubtitle: {
    id: 'automation.builder.node.waitNodeForm.duration.subtitle',
    defaultMessage: 'Time to wait before moving to the next node.'
  },
  durationPlaceholder: {
    id: 'automation.builder.node.waitNodeForm.duration.placeholder',
    defaultMessage: 'Enter the duration'
  },
  durationUnitHours: {
    id: 'automation.builder.node.waitNodeForm.duration.unit.hours',
    defaultMessage: "Hours",
  },
  durationUnitDays: {
    id: 'automation.builder.node.waitNodeForm.duration.unit.days',
    defaultMessage: "Days",
  },
});

interface GeneralInformationFormSectionProps {
  initialValues: Partial<DefaultFormData>;
  disabled?: boolean;
}

type Props = GeneralInformationFormSectionProps &
  InjectedIntlProps &
  ValidatorProps &
  NormalizerProps;

interface State {
  displayAdvancedSection: boolean;
}

class GeneralInformationFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { displayAdvancedSection: false };
  }

  toggleAdvancedSection = () => {
    this.setState({
      displayAdvancedSection: !this.state.displayAdvancedSection,
    });
  };

  render() {
    const {
      fieldValidators: { isRequired, isValidInteger, isNotZero },
      intl: { formatMessage },
      disabled
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionGeneralSubtitle}
          title={messages.sectionGeneralTitle}
        />

        <FormInputField
          name="wait_duration.value"
          component={FormInput}
          validate={[isRequired, isValidInteger, isNotZero]}
          formItemProps={{
            label: formatMessage(messages.durationTitle),
            required: true,
          }}
          inputProps={{
            disabled: !!disabled,
            placeholder: formatMessage(messages.durationPlaceholder),
            addonAfter: (
              <FormAddonSelectField
                name="wait_duration.unit"
                component={AddonSelect}
                disabled={disabled}
                options={[
                  {
                    key: 'hours',
                    value: 'hours',
                    title: formatMessage(messages.durationUnitHours)
                  },
                  {
                    key: 'days',
                    value: 'days',
                    title: formatMessage(messages.durationUnitDays)
                  },
                ]}
              />
            ),
            style: { width: '100%' },
          }}
          helpToolTipProps={{
            title: formatMessage(messages.durationSubtitle),
          }}
          small={true}
        />
      </div>
    );
  }
}

export default compose<Props, GeneralInformationFormSectionProps>(
  injectIntl,
  withValidators,
  withNormalizer,
)(GeneralInformationFormSection);
