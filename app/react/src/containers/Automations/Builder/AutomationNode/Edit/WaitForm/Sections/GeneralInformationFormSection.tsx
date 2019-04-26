import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import {
  FormInput,
  FormSection,
  FormInputField,
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
    id: 'automation.builder.node.edition.form.general.title',
    defaultMessage: 'General Informations',
  },
  sectionGeneralSubtitle: {
    id: 'automation.builder.node.edition.form.general.subtitle',
    defaultMessage: 'Modify the general information of the node',
  },
  automationNodeName: {
    id: 'automation.builder.node.form.name',
    defaultMessage: 'Automation Node name',
  },
  automationNodeBranch: {
    id: 'automation.builder.node.form.wait.branch_number',
    defaultMessage: 'Timeout',
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
      fieldValidators: { isRequired, isValidInteger },
      intl: { formatMessage },
      disabled
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionGeneralSubtitle}
          title={messages.sectionGeneralTitle}
        />

        <div className="automation-node-form">
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

          <FormInputField
            name="timeout"
            component={FormInput}
            validate={[isRequired, isValidInteger]}
            formItemProps={{
              label: formatMessage(messages.automationNodeBranch),
              required: true,
            }}
            inputProps={{
              type: 'number',
              disabled: !!disabled
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
)(GeneralInformationFormSection);
