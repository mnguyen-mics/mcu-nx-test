import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import {
  FormInput,
  FormSection,
  FormInputField,
  FormAddonSelectField,
  AddonSelect,
} from '../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../components/Form/withNormalizer';
import { AutomationNodeFormData } from './domain';
import formatDisplayCampaignProperty from '../../../../../messages/campaign/display/displayCampaignMessages';
import messages from '../../../../Campaigns/Display/Edit/messages';
import formatAdGroupProperty from '../../../../../messages/campaign/display/adgroupMessages';

export const formMessages = defineMessages({
  sectionGeneralTitle: {
    id: 'automation.builder.node.edition.form.general.title',
    defaultMessage: 'Global parameters',
  },
  sectionGeneralSubtitle: {
    id: 'automation.builder.node.edition.form.general.subtitle',
    defaultMessage: 'Modify the global paramaters of your display campaign',
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

interface DisplayCampaignFormSectionProps {
  initialValues: Partial<AutomationNodeFormData>;
}

type Props = DisplayCampaignFormSectionProps &
  InjectedIntlProps &
  ValidatorProps &
  NormalizerProps;

interface State {
  displayAdvancedSection: boolean;
}

class DisplayCampaignFormSection extends React.Component<Props, State> {
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
      fieldNormalizer: { normalizeInteger },
      fieldValidators: { isRequired, isNotZero, isValidFloat, isValidInteger },
      intl: { formatMessage },
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={formMessages.sectionGeneralSubtitle}
          title={formMessages.sectionGeneralTitle}
        />

        <div className="automation-node-form">
          <FormInputField
            name="automationNode.name"
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(formMessages.automationNodeName),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(formMessages.automationNodeName),
            }}
            small={true}
          />

          <FormInputField
            name="campaign.per_day_impression_capping"
            component={FormInput}
            normalize={normalizeInteger}
            validate={[isValidInteger]}
            formItemProps={{
              label: formatMessage(
                formatDisplayCampaignProperty('per_day_impression_capping').message,
              ),
            }}
            inputProps={{
              placeholder: formatMessage(
                messages.contentSectionGeneralAdvancedPartRow3Placeholder,
              ),
            }}
            helpToolTipProps={{
              title: formatMessage(
                messages.contentSectionGeneralAdvancedPartRow3Tooltip,
              ),
            }}
          />

          <FormInputField
            name="campaign.total_impression_capping"
            component={FormInput}
            normalize={normalizeInteger}
            validate={[isValidInteger]}
            formItemProps={{
              label: formatMessage(
                formatDisplayCampaignProperty('total_impression_capping').message,
              ),
            }}
            inputProps={{
              placeholder: formatMessage(
                messages.contentSectionGeneralAdvancedPartRow2Placeholder,
              ),
            }}
            helpToolTipProps={{
              title: formatMessage(
                messages.contentSectionGeneralAdvancedPartRow2Tooltip,
              ),
            }}
          />

          <FormInputField
            name="campaign.total_budget"
            component={FormInput}
            validate={[isValidFloat, isNotZero]}
            formItemProps={{
              label: formatMessage(
                formatDisplayCampaignProperty('total_budget').message,
              ),
            }}
            inputProps={{
              suffix: <span>€</span>,
              placeholder: formatMessage(
                messages.contentSectionGeneralAdvancedPartRow4Placeholder,
              ),
            }}
            helpToolTipProps={{
              title: formatMessage(
                messages.contentSectionGeneralAdvancedPartRow4Tooltip,
              ),
            }}
          />

          <FormInputField
            name="campaign.max_budget_per_period"
            component={FormInput}
            validate={[isValidFloat, isNotZero]}
            formItemProps={{
              label: formatMessage(
                formatDisplayCampaignProperty('max_budget_per_period').message,
              ),
            }}
            inputProps={{
              suffix: <span>€</span>,
              addonAfter: (
                <FormAddonSelectField
                  name="campaign.max_budget_period"
                  component={AddonSelect}
                  options={[
                    {
                      value: 'DAY',
                      children: formatDisplayCampaignProperty('max_budget_period', 'DAY').formattedValue,
                    },
                    {
                      value: 'WEEK',
                      children: formatDisplayCampaignProperty('max_budget_period', 'WEEK').formattedValue,
                    },
                    {
                      value: 'MONTH',
                      children: formatDisplayCampaignProperty('max_budget_period', 'MONTH').formattedValue,
                    },
                  ]}
                />
              ),
              placeholder: formatMessage(
                messages.contentSectionGeneralAdvancedPartRow5Placeholder,
              ),
              style: { width: '100%' },
            }}
            helpToolTipProps={{
              title: formatMessage(
                messages.contentSectionGeneralAdvancedPartRow5Tooltip,
              ),
            }}
          />
    
          <FormInputField
            name="adGroup.total_budget"
            component={FormInput}
            validate={[isValidFloat, isNotZero]}
            formItemProps={{
              label: formatMessage(formatAdGroupProperty('total_budget').message),
            }}
            inputProps={{
              suffix: <span>€</span>,
              placeholder: formatMessage(
                messages.contentSectionGeneralRow3Placeholder,
              ),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.contentSectionGeneralRow3Tooltip),
            }}
          />

          <FormInputField
            name="adGroup.max_budget_per_period"
            component={FormInput}
            validate={[isValidFloat, isNotZero]}
            formItemProps={{
              label: formatMessage(formatAdGroupProperty('max_budget_per_period').message),
            }}
            inputProps={{
              suffix: <span>€</span>,
              addonAfter: (
                <FormAddonSelectField
                  name="adGroup.max_budget_period"
                  component={AddonSelect}
                  options={[
                    {
                      value: 'DAY',
                      children: formatAdGroupProperty('max_budget_period', 'DAY').formattedValue,
                    },
                    {
                      value: 'WEEK',
                      children: formatAdGroupProperty('max_budget_period', 'WEEK').formattedValue,
                    },
                    {
                      value: 'MONTH',
                      children: formatAdGroupProperty('max_budget_period', 'MONTH').formattedValue,
                    },
                  ]}
                />
              ),
              placeholder: formatMessage(
                messages.contentSectionGeneralRow2Placeholder,
              ),
              style: { width: '100%' },
            }}
            helpToolTipProps={{
              title: formatMessage(messages.contentSectionGeneralRow2Tooltip),
            }}
          />

          <FormInputField
            name="adGroup.max_bid_price"
            component={FormInput}
            validate={[isValidFloat, isNotZero]}
            formItemProps={{
              label: formatMessage(formatAdGroupProperty('max_bid_price').message),
            }}
            inputProps={{
              suffix: <span>€</span>,
              placeholder: formatMessage(
                messages.contentSectionGeneralRow5Placeholder,
              ),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.contentSectionGeneralRow5Tooltip),
            }}
          />

        </div>
      </div>
    );
  }
}

export default compose<Props, DisplayCampaignFormSectionProps>(
  injectIntl,
  withValidators,
  withNormalizer,
)(DisplayCampaignFormSection);
