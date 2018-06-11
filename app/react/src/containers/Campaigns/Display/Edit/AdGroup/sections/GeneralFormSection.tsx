import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import messages from '../../messages';
import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../../components/Form/withNormalizer';
import {
  FormInput,
  FormSection,
  AddonSelect,
  FormInputField,
  FormAddonSelectField,
  FormDateRangePickerField,
  FormAlert,
} from '../../../../../../components/Form';
import { ButtonStyleless, McsIcon } from '../../../../../../components';
import FormDateRangePicker from '../../../../../../components/Form/FormDateRangePicker';
import { EditAdGroupRouteMatchParam, AdGroupFormData } from '../domain';
import { connect } from 'react-redux';
import { getFormInitialValues } from 'redux-form';
import { FORM_ID } from '../AdGroupForm';

interface MapStateToProps {
  initialFormValues: Partial<AdGroupFormData>;
}

type Props = InjectedIntlProps &
  ValidatorProps &
  MapStateToProps &
  NormalizerProps &
  RouteComponentProps<EditAdGroupRouteMatchParam>;

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
      initialFormValues.adGroup &&
      initialFormValues.adGroup.technical_name;
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
        params: { adGroupId },
      },
    } = this.props;

    const { displayWarning } = this.state;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionSubtitleGeneral}
          title={messages.sectionTitleGeneral}
        />

        <div>
          <FormInputField
            name="adGroup.name"
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.labelAdGroupName),
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
            name="adGroup.total_budget"
            component={FormInput}
            validate={[isValidFloat, isNotZero]}
            formItemProps={{
              label: formatMessage(messages.contentSectionGeneralRow3Label),
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
              label: formatMessage(messages.contentSectionGeneralRow2Label),
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
                      title: formatMessage(
                        messages.contentSectionGeneralRow2OptionDAY,
                      ),
                    },
                    {
                      value: 'WEEK',
                      title: formatMessage(
                        messages.contentSectionGeneralRow2OptionWEEK,
                      ),
                    },
                    {
                      value: 'MONTH',
                      title: formatMessage(
                        messages.contentSectionGeneralRow2OptionMONTH,
                      ),
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

          <FormDateRangePickerField
            name="adGroup"
            component={FormDateRangePicker}
            startDateFieldName="start_date"
            endDateFieldName="end_date"
            unixTimestamp={true}
            allowPastDate={false}
            formItemProps={{
              label: formatMessage(messages.contentSectionGeneralRow4Label),
            }}
            startDatePickerProps={{
              placeholder: formatMessage(
                messages.contentSectionGeneralRow4Placeholder1,
              ),
              style: { width: '100%' },
            }}
            endDatePickerProps={{
              placeholder: formatMessage(
                messages.contentSectionGeneralRow4Placeholder2,
              ),
              style: { width: '100%' },
            }}
            helpToolTipProps={{
              placement: 'right',
              title: formatMessage(messages.contentSectionGeneralRow4Tooltip),
            }}
          />

          <FormInputField
            name="adGroup.max_bid_price"
            component={FormInput}
            validate={[isValidFloat, isNotZero]}
            formItemProps={{
              label: formatMessage(messages.contentSectionGeneralRow5Label),
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

        <div>
          <ButtonStyleless
            className="optional-section-title clickable-on-hover"
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
              adGroupId && (
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
              name="adGroup.technical_name"
              component={FormInput}
              formItemProps={{
                label: formatMessage(messages.contentSectionGeneralRow8Label),
              }}
              inputProps={{
                placeholder: formatMessage(
                  messages.contentSectionGeneralRow8Placeholder,
                ),
                onFocus: this.warningOnTokenChange,
              }}
              helpToolTipProps={{
                title: formatMessage(messages.contentSectionGeneralRow8Tooltip),
              }}
            />

            <FormInputField
              name="adGroup.total_impression_capping"
              component={FormInput}
              normalize={normalizeInteger}
              validate={[isValidInteger]}
              formItemProps={{
                label: formatMessage(messages.contentSectionGeneralRow6Label),
              }}
              inputProps={{
                placeholder: formatMessage(
                  messages.contentSectionGeneralRow6Placeholder,
                ),
              }}
              helpToolTipProps={{
                title: formatMessage(messages.contentSectionGeneralRow6Tooltip),
              }}
            />

            <FormInputField
              name="adGroup.per_day_impression_capping"
              component={FormInput}
              normalize={normalizeInteger}
              validate={[isValidInteger]}
              formItemProps={{
                label: formatMessage(messages.contentSectionGeneralRow7Label),
              }}
              inputProps={{
                placeholder: formatMessage(
                  messages.contentSectionGeneralRow7Placeholder,
                ),
              }}
              helpToolTipProps={{
                title: formatMessage(messages.contentSectionGeneralRow7Tooltip),
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
