import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import {
  FormInput,
  FormSection,
  FormInputField,
  FormAddonSelectField,
  AddonSelect,
} from '../../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../../components/Form/withNormalizer';
import {
  formatDisplayCampaignProperty,
  formatAdGroupProperty,
} from '../../../../../Campaigns/Display/messages';
import messages from '../../../../../Campaigns/Display/Edit/messages';
import { DisplayCampaignAutomationFormData } from '../domain';

export const formMessages = defineMessages({
  sectionGeneralTitle: {
    id: 'automation.builder.node.displayCampaignForm.generalInfoSection.title',
    defaultMessage: 'General information',
  },
  sectionGeneralSubtitle: {
    id: 'automation.builder.node.displayCampaignForm.general.subtitle',
    defaultMessage: 'Modify the general information of your display campaign',
  },
  automationNodeName: {
    id: 'automation.builder.node.displayCampaignForm.name',
    defaultMessage: 'Automation Node name',
  },
  advancedSection: {
    id: 'automation.builder.node.displayCampaignForm.advanced.section',
    defaultMessage: 'Advanced',
  },
});

interface GeneralInformationFormSectionProps {
  initialValues: Partial<DisplayCampaignAutomationFormData>;
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
      fieldNormalizer: { normalizeInteger },
      fieldValidators: { isRequired, isNotZero, isValidFloat, isValidInteger },
      intl: { formatMessage },
      disabled,
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={formMessages.sectionGeneralSubtitle}
          title={formMessages.sectionGeneralTitle}
        />

        <div>
          <FormInputField
            name="campaign.name"
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(
                formatDisplayCampaignProperty('name').message,
              ),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(
                messages.campaignFormPlaceholderCampaignName,
              ),
              disabled: disabled,
            }}
            helpToolTipProps={{
              title: formatMessage(messages.contentSectionGeneralRow1Tooltip),
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
                formatDisplayCampaignProperty('per_day_impression_capping')
                  .message,
              ),
            }}
            inputProps={{
              placeholder: formatMessage(
                messages.contentSectionGeneralAdvancedPartRow3Placeholder,
              ),
              disabled: disabled,
            }}
            helpToolTipProps={{
              title: formatMessage(
                messages.contentSectionGeneralAdvancedPartRow3Tooltip,
              ),
            }}
            small={true}
          />

          <FormInputField
            name="campaign.total_impression_capping"
            component={FormInput}
            normalize={normalizeInteger}
            validate={[isValidInteger]}
            formItemProps={{
              label: formatMessage(
                formatDisplayCampaignProperty('total_impression_capping')
                  .message,
              ),
            }}
            inputProps={{
              placeholder: formatMessage(
                messages.contentSectionGeneralAdvancedPartRow2Placeholder,
              ),
              disabled: disabled,
            }}
            helpToolTipProps={{
              title: formatMessage(
                messages.contentSectionGeneralAdvancedPartRow2Tooltip,
              ),
            }}
            small={true}
          />

          <FormInputField
            name="campaign.total_budget"
            component={FormInput}
            validate={[isValidFloat, isNotZero, isRequired]}
            formItemProps={{
              label: formatMessage(
                formatDisplayCampaignProperty('total_budget').message,
              ),
              required: true,
            }}
            inputProps={{
              suffix: <span>€</span>,
              placeholder: formatMessage(
                messages.contentSectionGeneralAdvancedPartRow4Placeholder,
              ),
              disabled: disabled,
            }}
            helpToolTipProps={{
              title: formatMessage(
                messages.contentSectionGeneralAdvancedPartRow4Tooltip,
              ),
            }}
            small={true}
          />

          <FormInputField
            name="campaign.max_budget_per_period"
            component={FormInput}
            validate={[isValidFloat, isNotZero, isRequired]}
            formItemProps={{
              label: formatMessage(
                formatDisplayCampaignProperty('max_budget_per_period').message,
              ),
              required: true,
            }}
            inputProps={{
              disabled: disabled,
              suffix: <span>€</span>,
              addonAfter: (
                <FormAddonSelectField
                  name="campaign.max_budget_period"
                  component={AddonSelect}
                  options={[
                    {
                      value: 'DAY',
                      key: 'DAY',
                      children: formatDisplayCampaignProperty(
                        'max_budget_period',
                        'DAY',
                      ).formattedValue,
                    },
                    {
                      value: 'WEEK',
                      key: 'WEEK',
                      children: formatDisplayCampaignProperty(
                        'max_budget_period',
                        'WEEK',
                      ).formattedValue,
                    },
                    {
                      value: 'MONTH',
                      key: 'MONTH',
                      children: formatDisplayCampaignProperty(
                        'max_budget_period',
                        'MONTH',
                      ).formattedValue,
                    },
                  ]}
                  selectProps={{
                    disabled: disabled,
                  }}
                  disabled={disabled}
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
            small={true}
          />

          <FormInputField
            name="adGroupFields[0].model.adGroup.max_bid_price"
            component={FormInput}
            validate={[isValidFloat, isNotZero, isRequired]}
            formItemProps={{
              label: formatMessage(
                formatAdGroupProperty('max_bid_price').message,
              ),
              required: true,
            }}
            inputProps={{
              suffix: <span>€</span>,
              placeholder: formatMessage(
                messages.contentSectionGeneralRow5Placeholder,
              ),
              disabled: disabled,
            }}
            helpToolTipProps={{
              title: formatMessage(messages.contentSectionGeneralRow5Tooltip),
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
