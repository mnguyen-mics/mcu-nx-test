import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import {
  FormInput,
  FormSection,
  FormInputField,
  FormSelectField,
  DefaultSelect,
} from '../../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../../components/Form/withNormalizer';
import formatDisplayCampaignProperty from '../../../../../../messages/campaign/display/displayCampaignMessages';
import messages from '../../../../../Campaigns/Display/Edit/messages';
import { Spin } from 'antd';
import { EmailRouterResource } from '../../../../../../models/campaign/email';
import EmailRoutersService from '../../../../../../services/Library/EmailRoutersService';
import { ConsentResource } from '../../../../../../models/consent';
import ConsentService from '../../../../../../services/ConsentService';
import { EmailCampaignAutomationFormData } from '../domain';

export const formMessages = defineMessages({
  sectionGeneralTitle: {
    id: 'automation.builder.node.edition.form.general.title',
    defaultMessage: 'General information',
  },
  sectionGeneralSubtitle: {
    id: 'automation.builder.node.edition.form.general.subtitle',
    defaultMessage: 'Modify the general information of your email campaign',
  },
  automationNodeName: {
    id: 'automation.builder.node.form.name',
    defaultMessage: 'Automation Node name',
  },
  emailEditorRouterSelectLabel: {
    id: 'emailEditor.step.select.label.router',
    defaultMessage: 'Router',
  },
  emailEditorRouterSelectHelper: {
    id: 'emailEditor.step.select.helper.router',
    defaultMessage:
      'Choose your Router. A Router is basically a channel through which you will send your email.',
  },
  emailEditorProviderSelectLabel: {
    id: 'emailEditor.step.select.label.provider',
    defaultMessage: 'Provider',
  },
  emailEditorProviderSelectHelper: {
    id: 'emailEditor.step.select.helper.provider',
    defaultMessage:
      'A Provider helps you target the user that have given you an explicit consent on being targeted by email',
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
}

type Props = GeneralInformationFormSectionProps &
  InjectedIntlProps &
  ValidatorProps &
  NormalizerProps;

class GeneralInformationFormSection extends React.Component<Props, State> {
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
    EmailRoutersService.getEmailRouters(this.props.organisationId).then(
      routersResponse => {
        ConsentService.getConsents(this.props.organisationId).then(
          consentResponse => {
            this.setState({
              fetchingRouters: false,
              routers: routersResponse.data,
              fetchingConsents: false,
              consents: consentResponse.data,
            });
          },
        );
      },
    );
  }

  render() {
    const {
      fieldValidators: { isRequired },
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
            small={true}
          />

          <FormSelectField
            name="routerFields[0].model.email_router_id"
            component={DefaultSelect}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(formMessages.emailEditorRouterSelectLabel),
              required: true,
            }}
            selectProps={{
              notFoundContent: this.state.fetchingRouters ? (
                <Spin size="small" />
              ) : null,
            }}
            options={this.state.routers.map(router => ({
              value: router.id,
              title: router.name,
            }))}
            helpToolTipProps={{
              title: formatMessage(formMessages.emailEditorRouterSelectHelper),
            }}
            small={true}
          />

          <FormSelectField
            name="blastFields[0].model.consentFields[0].model.consent_id"
            component={DefaultSelect}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(formMessages.emailEditorProviderSelectLabel),
              required: true,
            }}
            selectProps={{
              notFoundContent: this.state.fetchingConsents ? (
                <Spin size="small" />
              ) : null,
            }}
            options={this.state.consents.map(consent => ({
              value: consent.id,
              title: consent.technical_name,
            }))}
            helpToolTipProps={{
              title: formatMessage(
                formMessages.emailEditorProviderSelectHelper,
              ),
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
