import * as React from 'react';
import { compose } from 'recompose';
import { WrappedComponentProps, injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import { FormSection, FormSlider, FormSliderField } from '../../../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import withNormalizer, { NormalizerProps } from '../../../../../../components/Form/withNormalizer';
import { ABNFormData } from '../domain';

export const messages = defineMessages({
  sectionGeneralTitle: {
    id: 'automation.builder.abnNode.edition.form.generalInfoSection.title',
    defaultMessage: 'Description',
  },
  sectionGeneralSubtitle: {
    id: 'automation.builder.abnNode.edition.form.generalInfoSection.subtitle',
    defaultMessage: `Using {split}, you can split the flow of users going
    through in any number of branches. For example, if you split the flow
    into 2 branches, half the users will go through the first branch and the other
    half will take the second branch.
    `,
  },
  split: {
    id: 'automation.builder.abnNode.edition.form.generalInfoSection.subtitle.split',
    defaultMessage: 'Split',
  },
  sectionGeneralConfigurationTitle: {
    id: 'automation.builder.abnNode.edition.form.generalInfoSection.configuration.title',
    defaultMessage: 'Configuration',
  },
  automationNodeName: {
    id: 'automation.builder.abnNode.form.name',
    defaultMessage: 'Automation Node name',
  },
  branchNumber: {
    id: 'automation.builder.abnNode.split.form.branch.number',
    defaultMessage: 'Number of branches to split the flow into',
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
  WrappedComponentProps &
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

    const sectionGeneralSubtitle = {
      ...messages.sectionGeneralSubtitle,
      values: {
        split: (
          <span className='mcs-automation_nodeName'>
            <FormattedMessage {...messages.split} />
          </span>
        ),
      },
    };

    return (
      <div>
        <FormSection subtitle={sectionGeneralSubtitle} title={messages.sectionGeneralTitle} />
        <FormSection title={messages.sectionGeneralConfigurationTitle} />
        <div>
          <FormSliderField
            name='branch_number'
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
