import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import messages from '../messages';
import { connect } from 'react-redux';
import { getFormInitialValues } from 'redux-form';
import { ButtonStyleless, McsIcon } from '../../../../../components';
import {
  FormInput,
  FormSection,
  AddonSelect,
  FormInputField,
  FormAddonSelectField,
  FormAlert,
} from '../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../components/Form/withNormalizer';
import { withRouter, RouteComponentProps } from 'react-router';
import {
  EditDisplayCampaignRouteMatchParam,
  DisplayCampaignFormData,
} from '../domain';
import { FORM_ID } from '../DisplayCampaignForm';

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
  displayWarning: boolean;
}

class GeneralFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { displayAdvancedSection: false, displayWarning: false };
  }

  toggleAdvancedSection = () => {
    this.setState({
      displayAdvancedSection: !this.state.displayAdvancedSection,
    });
  };

  warningOnTokenChange = () => {
    const { initialFormValues } = this.props;
    const technicalName =
      initialFormValues &&
      initialFormValues.campaign &&
      initialFormValues.campaign.technical_name;
    this.setState({
      displayWarning: !!technicalName,
    });
  };

  render() {
    const {
      fieldNormalizer: { normalizeInteger },
      fieldValidators: { isRequired, isNotZero, isValidFloat, isValidInteger },
      intl: { formatMessage },
      match: {
        params: { campaignId },
      },
    } = this.props;

    const { displayWarning } = this.state;

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
              label: formatMessage(messages.contentSectionGeneralRow1Label),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(
                messages.contentSectionGeneralRow1Placeholder,
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
                messages.contentSectionGeneralAdvancedPartRow2Label,
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
                messages.contentSectionGeneralAdvancedPartRow3Label,
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
                messages.contentSectionGeneralAdvancedPartRow4Label,
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
                messages.contentSectionGeneralAdvancedPartRow5Label,
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
                      title: formatMessage(
                        messages.contentSectionGeneralRow5OptionDAY,
                      ),
                    },
                    {
                      value: 'WEEK',
                      title: formatMessage(
                        messages.contentSectionGeneralRow5OptionWEEK,
                      ),
                    },
                    {
                      value: 'MONTH',
                      title: formatMessage(
                        messages.contentSectionGeneralRow5OptionMONTH,
                      ),
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
          <ButtonStyleless
            className="optional-section-title"
            onClick={this.toggleAdvancedSection}
          >
            <McsIcon type="settings" />
            <span className="step-title">
              {formatMessage(messages.contentSectionGeneralAdvancedPartTitle)}
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
            {displayWarning &&
              campaignId && (
                <div>
                  <FormAlert
                    iconType="warning"
                    type="warning"
                    message={formatMessage(messages.warningOnTokenEdition)}
                  />
                  <br />
                </div>
              )}
            <FormInputField
              name="campaign.technical_name"
              component={FormInput}
              formItemProps={{
                label: formatMessage(
                  messages.contentSectionGeneralAdvancedPartRow1Label,
                ),
              }}
              inputProps={{
                placeholder: formatMessage(
                  messages.contentSectionGeneralAdvancedPartRow1Placeholder,
                ),
                onFocus: this.warningOnTokenChange,
              }}
              helpToolTipProps={{
                title: formatMessage(
                  messages.contentSectionGeneralAdvancedPartRow1Tooltip,
                ),
              }}
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
  connect((state: any) => ({
    initialFormValues: getFormInitialValues(FORM_ID)(state),
  })),
)(GeneralFormSection);
