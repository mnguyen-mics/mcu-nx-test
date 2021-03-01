import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import messages from '../../messages';
import { Button, McsIcon } from '@mediarithmics-private/mcs-components-library';
import {
  FormInput,
  FormAlertInput,
  FormSection,
  AddonSelect,
  FormInputField,
  FormAlertInputField,
  FormAddonSelectField,
} from '../../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../../components/Form/withNormalizer';
import { withRouter, RouteComponentProps } from 'react-router';
import {
  EditDisplayCampaignRouteMatchParam,
  DisplayCampaignFormData,
} from '../../domain';
import { formatDisplayCampaignProperty } from '../../../../Display/messages';

interface MapStateToProps {
  initialFormValues: Partial<DisplayCampaignFormData>;
}

type Props = InjectedIntlProps &
  ValidatorProps &
  MapStateToProps &
  NormalizerProps &
  RouteComponentProps<EditDisplayCampaignRouteMatchParam>;

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
      fieldNormalizer: { normalizeInteger },
      fieldValidators: { isRequired, isNotZero, isValidFloat, isValidInteger },
      intl: { formatMessage },
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionSubtitle1}
          title={messages.sectionTitle1}
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
            }}
            helpToolTipProps={{
              title: formatMessage(messages.contentSectionGeneralRow1Tooltip),
            }}
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
            }}
            helpToolTipProps={{
              title: formatMessage(
                messages.contentSectionGeneralAdvancedPartRow2Tooltip,
              ),
            }}
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
            }}
            helpToolTipProps={{
              title: formatMessage(
                messages.contentSectionGeneralAdvancedPartRow3Tooltip,
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
                      title: 'DAY',
                      children: formatDisplayCampaignProperty(
                        'max_budget_period',
                        'DAY',
                      ).formattedValue,
                    },
                    {
                      value: 'WEEK',
                      title: 'WEEK',
                      children: formatDisplayCampaignProperty(
                        'max_budget_period',
                        'WEEK',
                      ).formattedValue,
                    },
                    {
                      value: 'MONTH',
                      title: 'MONTH',
                      children: formatDisplayCampaignProperty(
                        'max_budget_period',
                        'MONTH',
                      ).formattedValue,
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
        </div>

        <div>
          <Button
            className="optional-section-title"
            onClick={this.toggleAdvancedSection}
          >
            <McsIcon type="settings" />
            <span className="step-title">
              {formatMessage(messages.contentSectionGeneralAdvancedPartTitle)}
            </span>
            <McsIcon type="chevron" />
          </Button>

          <div
            className={
              !this.state.displayAdvancedSection
                ? 'hide-section'
                : 'optional-section-content'
            }
          >
            <FormAlertInputField
              name="campaign.technical_name"
              component={FormAlertInput}
              formItemProps={{
                label: formatMessage(
                  formatDisplayCampaignProperty('technical_name').message,
                ),
              }}
              inputProps={{
                placeholder: formatMessage(
                  messages.contentSectionGeneralAdvancedPartRow1Placeholder,
                ),
              }}
              helpToolTipProps={{
                title: formatMessage(
                  messages.contentSectionGeneralAdvancedPartRow1Tooltip,
                ),
              }}
              iconType="warning"
              type="warning"
              message={formatMessage(messages.warningOnTokenEdition)}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  injectIntl,
  withValidators,
  withNormalizer,
  withRouter,
)(GeneralFormSection);
