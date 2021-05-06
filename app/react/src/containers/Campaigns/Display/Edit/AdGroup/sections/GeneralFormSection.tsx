import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import messages from '../../messages';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import withNormalizer, { NormalizerProps } from '../../../../../../components/Form/withNormalizer';
import {
  FormInput,
  FormAlertInput,
  FormSection,
  AddonSelect,
  FormInputField,
  FormAlertInputField,
  FormAddonSelectField,
  FormDateRangePickerField,
} from '../../../../../../components/Form';
import { Button, McsIcon } from '@mediarithmics-private/mcs-components-library';
import FormDateRangePicker from '../../../../../../components/Form/FormDateRangePicker';
import { formatAdGroupProperty } from '../../../../Display/messages';

type Props = InjectedIntlProps & ValidatorProps & NormalizerProps;

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
          subtitle={messages.sectionSubtitleGeneral}
          title={messages.sectionTitleGeneral}
        />

        <div>
          <FormInputField
            name='adGroup.name'
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(formatAdGroupProperty('name').message),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(messages.contentSectionGeneralRow1Placeholder),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.contentSectionGeneralRow1Tooltip),
            }}
          />

          <FormInputField
            name='adGroup.total_budget'
            component={FormInput}
            validate={[isValidFloat, isNotZero]}
            formItemProps={{
              label: formatMessage(formatAdGroupProperty('total_budget').message),
            }}
            inputProps={{
              suffix: <span>€</span>,
              placeholder: formatMessage(messages.contentSectionGeneralRow3Placeholder),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.contentSectionGeneralRow3Tooltip),
            }}
          />

          <FormInputField
            name='adGroup.max_budget_per_period'
            component={FormInput}
            validate={[isValidFloat, isNotZero]}
            formItemProps={{
              label: formatMessage(formatAdGroupProperty('max_budget_per_period').message),
            }}
            inputProps={{
              suffix: <span>€</span>,
              addonAfter: (
                <FormAddonSelectField
                  name='adGroup.max_budget_period'
                  component={AddonSelect}
                  options={[
                    {
                      value: 'DAY',
                      title: 'DAY',
                      children: formatAdGroupProperty('max_budget_period', 'DAY').formattedValue,
                    },
                    {
                      value: 'WEEK',
                      title: 'WEEK',
                      children: formatAdGroupProperty('max_budget_period', 'WEEK').formattedValue,
                    },
                    {
                      value: 'MONTH',
                      title: 'MONTH',
                      children: formatAdGroupProperty('max_budget_period', 'MONTH').formattedValue,
                    },
                  ]}
                />
              ),
              placeholder: formatMessage(messages.contentSectionGeneralRow2Placeholder),
              style: { width: '100%' },
            }}
            helpToolTipProps={{
              title: formatMessage(messages.contentSectionGeneralRow2Tooltip),
            }}
          />

          <FormDateRangePickerField
            name='adGroup'
            component={FormDateRangePicker}
            startDateFieldName='start_date'
            endDateFieldName='end_date'
            unixTimestamp={true}
            allowPastDate={false}
            formItemProps={{
              label: formatMessage(formatAdGroupProperty('duration').message),
            }}
            startDatePickerProps={{
              // placeholder: formatMessage(
              //   formatAdGroupProperty('start_date').message,
              // ),
              style: { width: '100%' },
            }}
            endDatePickerProps={{
              // placeholder: formatMessage(
              //   formatAdGroupProperty('end_date').message,
              // ),
              style: { width: '100%' },
            }}
            helpToolTipProps={{
              placement: 'right',
              title: formatMessage(messages.contentSectionGeneralRow4Tooltip),
            }}
          />

          <FormInputField
            name='adGroup.max_bid_price'
            component={FormInput}
            validate={[isValidFloat, isNotZero]}
            formItemProps={{
              label: formatMessage(formatAdGroupProperty('max_bid_price').message),
            }}
            inputProps={{
              suffix: <span>€</span>,
              placeholder: formatMessage(messages.contentSectionGeneralRow5Placeholder),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.contentSectionGeneralRow5Tooltip),
            }}
          />
        </div>

        <div>
          <Button
            className='optional-section-title clickable-on-hover'
            onClick={this.toggleAdvancedSection}
          >
            <McsIcon type='settings' />
            <span className='step-title'>
              {formatMessage(messages.contentSectionGeneralAdvancedPartTitle)}
            </span>
            <McsIcon type='chevron' />
          </Button>

          <div
            className={
              !this.state.displayAdvancedSection ? 'hide-section' : 'optional-section-content'
            }
          >
            <FormAlertInputField
              name='adGroup.technical_name'
              component={FormAlertInput}
              formItemProps={{
                label: formatMessage(formatAdGroupProperty('technical_name').message),
              }}
              inputProps={{
                placeholder: formatMessage(messages.contentSectionGeneralRow8Placeholder),
              }}
              helpToolTipProps={{
                title: formatMessage(messages.contentSectionGeneralRow8Tooltip),
              }}
              iconType='warning'
              type='warning'
              message={formatMessage(messages.warningOnTokenEdition)}
            />

            <FormInputField
              name='adGroup.total_impression_capping'
              component={FormInput}
              normalize={normalizeInteger}
              validate={[isValidInteger]}
              formItemProps={{
                label: formatMessage(formatAdGroupProperty('total_impression_capping').message),
              }}
              inputProps={{
                placeholder: formatMessage(messages.contentSectionGeneralRow6Placeholder),
              }}
              helpToolTipProps={{
                title: formatMessage(messages.contentSectionGeneralRow6Tooltip),
              }}
            />

            <FormInputField
              name='adGroup.per_day_impression_capping'
              component={FormInput}
              normalize={normalizeInteger}
              validate={[isValidInteger]}
              formItemProps={{
                label: formatMessage(formatAdGroupProperty('per_day_impression_capping').message),
              }}
              inputProps={{
                placeholder: formatMessage(messages.contentSectionGeneralRow7Placeholder),
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

export default compose(injectIntl, withValidators, withNormalizer)(GeneralFormSection);
