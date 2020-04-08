import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import messages from '../../messages';
import { ButtonStyleless, McsIcon } from '../../../../../../components';
import {
  FormInput,
  FormAlertInput,
  FormSection,
  FormInputField,
  FormAlertInputField,
} from '../../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../../components/Form/withNormalizer';
import { withRouter, RouteComponentProps } from 'react-router';
import { EditDisplayCampaignRouteMatchParam } from '../../domain';
import { formatDisplayCampaignProperty } from '../../../../Display/messages';

type Props = InjectedIntlProps &
  ValidatorProps &
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
      fieldValidators: { isRequired },
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
