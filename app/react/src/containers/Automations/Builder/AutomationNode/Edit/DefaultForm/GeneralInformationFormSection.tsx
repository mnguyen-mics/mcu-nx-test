import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import {
  FormInput,
  FormSection,
  FormInputField,
} from '../../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../../components/Form/withNormalizer';
import { DefaultFormData } from '../domain';

export const messages = defineMessages({
  sectionGeneralTitle: {
    id: 'automation.builder.node.defaultForm.generalInfoSection.title',
    defaultMessage: 'General Information',
  },
  sectionGeneralSubtitle: {
    id: 'automation.builder.node.defaultForm.general.subtitle',
    defaultMessage: 'Modify the general information of the node',
  },
  automationNodeName: {
    id: 'automation.builder.node.defaultForm.name',
    defaultMessage: 'Automation Node name',
  },
  advancedSection: {
    id: 'automation.builder.node.defaultForm.advanced.section',
    defaultMessage: 'Advanced',
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
      fieldValidators: { isRequired },
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
          name="name"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.automationNodeName),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.automationNodeName),
            disabled: !!disabled
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
