import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import {
  FormSection,
  FormSlider,
  FormSliderField,
} from '../../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../../components/Form/withNormalizer';
import { ABNFormData } from '../domain';

export const messages = defineMessages({
  sectionGeneralTitle: {
    id: 'automation.builder.abnNode.edition.form.generalInfoSection.title',
    defaultMessage: 'General Informations',
  },
  sectionGeneralSubtitle: {
    id: 'automation.builder.abnNode.edition.form.generalInfoSection.subtitle',
    defaultMessage: 'Modify the general information of the ABN Node',
  },
  automationNodeName: {
    id: 'automation.builder.abnNode.form.name',
    defaultMessage: 'Automation Node name',
  },
  branchNumber: {
    id: 'automation.builder.abnNode.split.form.branch.number',
    defaultMessage: 'Branches',
  },
  advancedSection: {
    id: 'automation.builder.abnNode.advanced.section',
    defaultMessage: 'Advanced',
  },
});

interface GeneralInformationFormSectionProps {
  initialValues: Partial<ABNFormData>;
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
      intl: { formatMessage },
      disabled,
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionGeneralSubtitle}
          title={messages.sectionGeneralTitle}
        />

        <div>
          <FormSliderField
            name="branch_number"
            component={FormSlider}
            formItemProps={{
              label: formatMessage(messages.branchNumber),
              required: true,
            }}
            inputProps={{
              min: 2,
              max: 10,
              defaultValue: 2,
              disabled: !!disabled,
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
