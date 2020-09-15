import * as React from 'react';
import { getFormInitialValues } from 'redux-form';
import { connect } from 'react-redux';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';

import {
  FormSection,
  FormInput,
  FormAlertInput,
  withValidators,
  FormInputField,
  FormAlertInputField,
} from '../../../../components/Form';
import messages from '../../DisplayAds/Edit/messages';
import { ValidatorProps } from '../../../../components/Form/withValidators';
import {
  DisplayCreativeFormData,
  DISPLAY_CREATIVE_FORM,
  isDisplayAdResource,
  EditDisplayCreativeRouteMatchParams,
} from '../../DisplayAds/Edit/domain';
import { McsIcon } from '../../../../components';
import { Button } from '@mediarithmics-private/mcs-components-library';
import { RouteComponentProps } from 'react-router';
import { MicsReduxState } from '../../../../utils/ReduxHelper';

interface MapStateProps {
  initialValue: DisplayCreativeFormData;
}

export interface GeneralFormSectionProps {
  small?: boolean;
}

type Props = ValidatorProps &
  GeneralFormSectionProps &
  InjectedIntlProps &
  MapStateProps &
  RouteComponentProps<EditDisplayCreativeRouteMatchParams>;

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

  render() {
    const {
      intl: { formatMessage },
      fieldValidators: { isRequired },
      initialValue: { creative },
      small
    } = this.props;

    let isDisabled = false;

    if (isDisplayAdResource(creative)) {
      isDisabled =
        creative.audit_status === 'AUDIT_PASSED' ||
        creative.audit_status === 'AUDIT_PENDING';
    }

    return (
      <div>
        <FormSection
          title={messages.creativeSectionGeneralTitle}
          subtitle={messages.creativeSectionGeneralSubTitle}
        />
        <FormInputField
          name="creative.name"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(
              messages.creativeCreationGeneralNameFieldTitle,
            ),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(
              messages.creativeCreationGeneralNameFieldPlaceHolder,
            ),
            disabled: isDisabled,
          }}
          helpToolTipProps={{
            title: formatMessage(
              messages.creativeCreationGeneralNameFieldHelper,
            ),
          }}
          small={small}
        />
        
      
        <div>
          <Button
            className="optional-section-title"
            onClick={this.toggleAdvancedSection}
          >
            <McsIcon type="settings" />
            <span className="step-title">
              {formatMessage(messages.advanced)}
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
              name="creative.technical_name"
              component={FormAlertInput}
              formItemProps={{
                label: formatMessage(
                  messages.creativeCreationAdvancedTechnicalFieldTitle,
                ),
              }}
              inputProps={{
                placeholder: formatMessage(
                  messages.creativeCreationAdvancedTechnicalFieldPlaceholder,
                ),
                disabled: isDisabled,
              }}
              helpToolTipProps={{
                title: formatMessage(
                  messages.creativeCreationAdvancedTechnicalFieldTooltip,
                ),
              }}
              iconType="warning"
              type="warning"
              message={formatMessage(messages.warningOnTokenEdition)}
              small={small}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default compose<Props, GeneralFormSectionProps>(
  injectIntl,
  withValidators,
  connect((state: MicsReduxState, ownProps: Props) => ({
    initialValue: getFormInitialValues(DISPLAY_CREATIVE_FORM)(
      state,
    ) as DisplayCreativeFormData,
  })),
)(GeneralFormSection);
