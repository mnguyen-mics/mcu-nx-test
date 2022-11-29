import * as React from 'react';
import { compose } from 'recompose';
import { WrappedComponentProps, injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import {
  FormInput,
  FormSection,
  FormInputField,
  FormSelectField,
  DefaultSelect,
} from '../../../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import withNormalizer, { NormalizerProps } from '../../../../../../components/Form/withNormalizer';
import { formatDisplayCampaignProperty } from '../../../../../Campaigns/Display/messages';
import messages from '../../../../../Campaigns/Display/Edit/messages';
import { Spin } from 'antd';
import { EmailRouterResource } from '../../../../../../models/campaign/email';
import { ConsentResource } from '../../../../../../models/consent';
import { EmailCampaignAutomationFormData } from '../domain';
import { lazyInject } from '../../../../../../config/inversify.config';
import { IConsentService } from '../../../../../../services/ConsentService';
import { IEmailRouterService } from '../../../../../../services/Library/EmailRoutersService';
import { TYPES } from '../../../../../../constants/types';
import { Link } from 'react-router-dom';

export const formMessages = defineMessages({
  sectionGeneralTitle: {
    id: 'automation.builder.node.emailCampaignForm.generalInfoSection.title',
    defaultMessage: 'Description',
  },
  sectionGeneralSubtitle: {
    id: 'automation.builder.node.emailCampaignForm.general.subtitle',
    defaultMessage: 'This action allows you to send an email to the user who goes through it.',
  },
  sectionGeneralConfigurationTitle: {
    id: 'automation.builder.node.emailCampaignForm.generalInfoSection.configuration.title',
    defaultMessage: 'Configuration',
  },
  automationNodeName: {
    id: 'automation.builder.node.emailCampaignForm.name',
    defaultMessage: 'Automation Node name',
  },
  emailEditorRouterSelectLabel: {
    id: 'automation.builder.step.select.label.router',
    defaultMessage: 'Router',
  },
  emailEditorRouterSelectHelper: {
    id: 'automation.builder.emailEditor.step.select.helper.router',
    defaultMessage:
      'Choose a router for your campaign. A Router is basically a channel through which you will send your email. You can configure your email routers in your {campaignSettings}.',
  },
  campaignSettings: {
    id: 'automation.builder.emailEditor.step.select.helper.router.campaignSettings',
    defaultMessage: 'campaigns settings',
  },
  emailEditorProviderSelectLabel: {
    id: 'automation.builder.emailEditor.step.select.label.provider',
    defaultMessage: 'Provider',
  },
  emailEditorProviderSelectHelper: {
    id: 'automation.builder.emailEditor.step.select.helper.provider',
    defaultMessage:
      'A Provider helps you target users who have given you explicit consent to email targeting. Get in touch with your support contact to update your providers list.',
  },
});

interface State {
  routers: EmailRouterResource[];
  fetchingRouters: boolean;
  consents: ConsentResource[];
  fetchingConsents: boolean;
}

interface GeneralInformationFormSectionProps {
  initialValues: Partial<EmailCampaignAutomationFormData>;
  organisationId: string;
  disabled?: boolean;
}

type Props = GeneralInformationFormSectionProps &
  WrappedComponentProps &
  ValidatorProps &
  NormalizerProps;

class GeneralInformationFormSection extends React.Component<Props, State> {
  @lazyInject(TYPES.IConsentService)
  private _consentService: IConsentService;

  @lazyInject(TYPES.IEmailRouterService)
  private _emailRouterService: IEmailRouterService;
  constructor(props: Props) {
    super(props);
    this.state = {
      routers: [],
      fetchingRouters: false,
      consents: [],
      fetchingConsents: false,
    };
  }

  componentDidMount() {
    this.setState({ fetchingRouters: true, fetchingConsents: true });
    this._emailRouterService.getEmailRouters(this.props.organisationId).then(routersResponse => {
      this._consentService.getConsents(this.props.organisationId).then(consentResponse => {
        this.setState({
          fetchingRouters: false,
          routers: routersResponse.data,
          fetchingConsents: false,
          consents: consentResponse.data,
        });
      });
    });
  }

  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
      organisationId,
      disabled,
    } = this.props;

    const routerHelpTooltipTitle = (
      <FormattedMessage
        {...formMessages.emailEditorRouterSelectHelper}
        values={{
          campaignSettings: (
            <Link to={`/v2/o/${organisationId}/settings/campaigns/email_routers`} target='_blank'>
              <FormattedMessage {...formMessages.campaignSettings} />
            </Link>
          ),
        }}
      />
    );

    return (
      <div>
        <FormSection
          subtitle={formMessages.sectionGeneralSubtitle}
          title={formMessages.sectionGeneralTitle}
        />
        <FormSection title={formMessages.sectionGeneralConfigurationTitle} />

        <div>
          <FormInputField
            name='campaign.name'
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(formatDisplayCampaignProperty('name').message),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(messages.campaignFormPlaceholderCampaignName),
              disabled: !!disabled,
            }}
            helpToolTipProps={{
              title: formatMessage(messages.contentSectionGeneralRow1Tooltip),
            }}
            small={true}
          />

          <FormSelectField
            name='routerFields[0].model.email_router_id'
            component={DefaultSelect}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(formMessages.emailEditorRouterSelectLabel),
              required: true,
            }}
            selectProps={{
              notFoundContent: this.state.fetchingRouters ? <Spin size='small' /> : null,
            }}
            options={this.state.routers.map(router => ({
              value: router.id,
              title: router.name,
            }))}
            helpToolTipProps={{
              title: routerHelpTooltipTitle,
            }}
            small={true}
            disabled={!!disabled}
          />

          <FormSelectField
            name='blastFields[0].model.consentFields[0].model.consent_id'
            component={DefaultSelect}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(formMessages.emailEditorProviderSelectLabel),
              required: true,
            }}
            selectProps={{
              notFoundContent: this.state.fetchingConsents ? <Spin size='small' /> : null,
              disabled: !!disabled,
            }}
            options={this.state.consents.map(consent => ({
              value: consent.id,
              title: consent.technical_name,
            }))}
            helpToolTipProps={{
              title: formatMessage(formMessages.emailEditorProviderSelectHelper),
            }}
            small={true}
            disabled={!!disabled}
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
