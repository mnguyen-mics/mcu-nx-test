import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
// import { ButtonStyleless, McsIcon } from '../../../../../components';
import {
  FormInput,
  FormSection,
  FormInputField,
  FormSlider,
  FormSliderField,
} from '../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../components/Form/withNormalizer';
import { AutomationNodeFormData } from './domain';

export const messages = defineMessages({
  sectionGeneralTitle: {
    id: 'automation.builder.node.edition.form.general.title',
    defaultMessage: 'General Informations',
  },
  sectionGeneralSubtitle: {
    id: 'automation.builder.node.edition.form.general.subtitle',
    defaultMessage: 'Lorem ipsum',
  },
  loremIpsum: {
    id: 'lorem.ipsum',
    defaultMessage: 'Lorem Ipsum',
  },
  automationNodeName: {
    id: 'automation.builder.node.form.name',
    defaultMessage: 'Automation Node name',
  },
  branchNumber: {
    id: 'automation.builder.split.node.form.branch.number',
    defaultMessage: 'Branchs',
  },
  advancedSection: {
    id: 'automation.builder.node.advanced.section',
    defaultMessage: 'Advanced',
  },
});

interface GeneralFormSectionProps {
  initialValues: Partial<AutomationNodeFormData>;
}

type Props = GeneralFormSectionProps &
  InjectedIntlProps &
  ValidatorProps &
  NormalizerProps;

interface State {
  displayAdvancedSection: boolean;
}

class GeneralFormSection extends React.Component<Props, State> {
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
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionGeneralSubtitle}
          title={messages.sectionGeneralTitle}
        />

        <div className="automation-node-form">
          <FormInputField
            name="automationNode.name"
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.automationNodeName),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(messages.automationNodeName),
            }}
            small={true}
          />

          {this.props.initialValues.automationNode !== undefined &&
            this.props.initialValues.automationNode.branch_number !==
              undefined && (
              <FormSliderField
                name="automationNode.branch_number"
                component={FormSlider}
                formItemProps={{
                  label: formatMessage(messages.branchNumber),
                  required: true,
                }}
                inputProps={{
                  min: 2,
                  max: 10,
                }}
              />
            )}
        </div>

        {/* <div>
          <ButtonStyleless
            className="optional-section-title"
            onClick={this.toggleAdvancedSection}
          >
            <McsIcon type="settings" />
            <span className="step-title">
              {formatMessage(messages.advancedSection)}
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
              name="automationNode.technical_name"
              component={FormInput}
              formItemProps={{
                label: formatMessage(messages.loremIpsum),
              }}
              inputProps={{
                placeholder: formatMessage(messages.loremIpsum),
              }}
              helpToolTipProps={{
                title: formatMessage(messages.loremIpsum),
              }}
              small={true}
            />
          </div>
        </div> */}
      </div>
    );
  }
}

export default compose<Props, GeneralFormSectionProps>(
  injectIntl,
  withValidators,
  withNormalizer,
)(GeneralFormSection);
