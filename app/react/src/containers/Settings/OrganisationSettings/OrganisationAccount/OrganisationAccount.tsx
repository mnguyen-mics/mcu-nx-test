import * as React from 'react';
import { Layout, Descriptions, Upload, Spin, Image, Tag } from 'antd';
import { FormattedMessage, injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { reduxForm, InjectedFormProps } from 'redux-form';
import {
  MicsReduxState,
  IdentityProviderResource,
  lazyInject,
  TYPES,
  IIdentityProviderService,
  IOrganisationService,
} from '@mediarithmics-private/advanced-components';
import { RouteComponentProps, withRouter } from 'react-router';
import { Loading } from '@mediarithmics-private/mcs-components-library';
import { OrganisationResource } from '@mediarithmics-private/advanced-components/lib/models/organisation/organisation';
import { getLogo, putLogo } from '../../../../redux/Session/actions';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';

const { Content } = Layout;

const messages = defineMessages({
  pageTitle: {
    id: 'settings.organisation.organisationAccount.organisationProfile',
    defaultMessage: 'Organisation Profile',
  },
  generalInformationSectionTitle: {
    id: 'settings.organisation.organisationAccount.generalInformation.title',
    defaultMessage: 'General Information',
  },
  organisationProfile: {
    id: 'settings.organisation.organisationAccount.profile',
    defaultMessage: 'Organisation Profile',
  },
  organisationName: {
    id: 'settings.organisation.organisationAccount.generalInformation.name',
    defaultMessage: 'Organisation Name',
  },
  organisationLogo: {
    id: 'settings.organisation.organisationAccount.generalInformation.logo',
    defaultMessage: 'Organisation Logo',
  },
  uploadImage: {
    id: 'settings.organisation.organisationAccount.generalInformation.logo.uploadImageMessage',
    defaultMessage: 'Upload image',
  },
  logoNotFound: {
    id: 'settings.organisation.organisationAccount.generalInformation.logo.logoNotFound',
    defaultMessage: 'Logo not found',
  },
  logoError: {
    id: 'settings.organisation.organisationAccount.generalInformation.logo.error.upload',
    defaultMessage:
      'The logo file should be a PNG with a maximum size of 200kB. Please make sure the file you have selected meets those criterias.',
  },
  logoTooltip: {
    id: 'settings.organisation.organisationAccount.generalInformation.logo.tooltip',
    defaultMessage: 'The logo file should be a PNG with a maximum size of 200kB.',
  },
  authenticationSectionTitle: {
    id: 'settings.organisation.organisationAccount.authentication.title',
    defaultMessage: 'Authentication',
  },
  identityProviderNameTitle: {
    id: 'settings.organisation.organisationAccount.authentication.identityProvider.name',
    defaultMessage: 'Identity Provider Name',
  },
  defaultIdpName: {
    id: 'settings.organisation.organisationAccount.authentication.identityProvider.name.defaultName',
    defaultMessage: 'mediarithmics',
  },
  identityProviderDescriptionTitle: {
    id: 'settings.organisation.organisationAccount.authentication.identityProvider.description',
    defaultMessage: 'Description',
  },
  defaultIdpDescription: {
    id: 'settings.organisation.organisationAccount.authentication.identityProvider.description.defaultDescription',
    defaultMessage:
      'This is the default authentication workflow, using emails and passwords managed by our platform.',
  },
  identityProviderSsoServiceUrlTitle: {
    id: 'settings.organisation.organisationAccount.authentication.identityProvider.ssoServiceUrl',
    defaultMessage: 'Single Sign-On Service URL',
  },
  identityProviderEntityIdTitle: {
    id: 'settings.organisation.organisationAccount.authentication.identityProvider.entityId',
    defaultMessage: 'Identifier (Entity ID)',
  },
  identityProviderRedirectUrlTitle: {
    id: 'settings.organisation.organisationAccount.authentication.identityProvider.redirectUrl',
    defaultMessage: 'Redirect URI/Reply URL',
  },
});
export interface OrganisationAccountProps {
  organisationName: string;
}

export interface EditableLogoStoreProps {
  getLogoRequest: (a: { organisationId: string }) => void;
  putLogoRequest: (a: { organisationId: string; file: any }) => void;
  isUploadingLogo: boolean;
  logoUrl: string;
}

type Props = OrganisationAccountProps &
  EditableLogoStoreProps &
  InjectedNotificationProps &
  InjectedIntlProps &
  InjectedFormProps<{ organisation_name: string }> &
  RouteComponentProps<{ organisationId: string }>;

interface State {
  isLoading: boolean;
  organisation?: OrganisationResource;
  identityProvider?: IdentityProviderResource;
}

class OrganisationAccount extends React.Component<Props, State> {
  @lazyInject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;
  @lazyInject(TYPES.IIdentityProviderService)
  private _identityProviderService: IIdentityProviderService;

  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: true,
    };
  }

  componentDidMount() {
    this.fetchLogoAndOrganisationAndIdentityProvider();
  }

  componentDidUpdate(previousProps: Props) {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;
    const {
      match: {
        params: { organisationId: previousOrganisationId },
      },
    } = previousProps;

    if (organisationId !== previousOrganisationId) {
      this.fetchLogoAndOrganisationAndIdentityProvider();
    }
  }

  fetchOrganisation = (): Promise<OrganisationResource | undefined> => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    return this._organisationService
      .getOrganisation(organisationId)
      .then(resOrg => {
        return resOrg.data;
      })
      .catch(_err => {
        return Promise.resolve(undefined);
      });
  };

  fetchIdentityProvider = (): Promise<IdentityProviderResource | undefined> => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    return this._identityProviderService
      .getIdentityProviderAssociatedToOrganisation(organisationId)
      .then(resIdp => {
        return resIdp.data;
      })
      .catch(_err => {
        return Promise.resolve(undefined);
      });
  };

  fetchLogoAndOrganisationAndIdentityProvider = () => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    this.setState({ isLoading: true }, () => {
      this.props.getLogoRequest({ organisationId });

      Promise.all([this.fetchOrganisation(), this.fetchIdentityProvider()]).then(resPromises => {
        this.setState({
          isLoading: false,
          organisation: resPromises[0],
          identityProvider: resPromises[1],
        });
      });
    });
  };

  onChangeLogo = (options: any): void => {
    const {
      match: {
        params: { organisationId },
      },
      putLogoRequest,
      notifyError,
      intl,
    } = this.props;

    const file = options.file;
    if (file.type !== 'image/png' || (file.size && file.size / 1000 > 200)) {
      notifyError({
        status: 'error',
        error: intl.formatMessage(messages.logoError),
      });
    } else {
      putLogoRequest({ organisationId, file });
    }
  };

  render() {
    const {
      intl: { formatMessage },
      logoUrl,
    } = this.props;
    const { isLoading, identityProvider, organisation } = this.state;

    if (isLoading) {
      return <Loading isFullScreen={true} />;
    }

    return (
      <div className='ant-layout'>
        <Content className='mcs-content-container mcs-organisation-account'>
          <div className='mcs-card-header mcs-card-title'>
            <span className='mcs-card-title'>
              <FormattedMessage {...messages.pageTitle} />
            </span>
          </div>
          <hr className='mcs-separator' />
          {organisation ? (
            <Descriptions title={formatMessage(messages.generalInformationSectionTitle)} column={1}>
              <Descriptions.Item label={formatMessage(messages.organisationName)}>
                {organisation.name}
              </Descriptions.Item>
              <Descriptions.Item label={formatMessage(messages.organisationLogo)}>
                <div className='mcs-settings-edit-logo'>
                  <Upload
                    className='mcs-logo'
                    accept='.png'
                    customRequest={this.onChangeLogo}
                    showUploadList={false}
                    listType='picture'
                  >
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt={formatMessage(messages.logoNotFound)}
                        preview={{
                          visible: false,
                          mask: <FormattedMessage {...messages.uploadImage} />,
                        }}
                      />
                    ) : (
                      <Spin />
                    )}
                  </Upload>
                </div>
              </Descriptions.Item>
            </Descriptions>
          ) : null}

          {identityProvider ? (
            <Descriptions title={formatMessage(messages.authenticationSectionTitle)} column={1}>
              <Descriptions.Item label={formatMessage(messages.identityProviderNameTitle)}>
                <div className='mcs-identity-provider-name-and-type'>
                  <div className='mcs-identity-provider-name'>{identityProvider.name}</div>
                  <Tag color={'cyan'}>{identityProvider.provider_type}</Tag>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label={formatMessage(messages.identityProviderDescriptionTitle)}>
                {identityProvider.description}
              </Descriptions.Item>
              <Descriptions.Item label={formatMessage(messages.identityProviderSsoServiceUrlTitle)}>
                {identityProvider.sso_service_url}
              </Descriptions.Item>
              <Descriptions.Item label={formatMessage(messages.identityProviderEntityIdTitle)}>
                {identityProvider.entity_id}
              </Descriptions.Item>
              <Descriptions.Item label={formatMessage(messages.identityProviderRedirectUrlTitle)}>
                {identityProvider.redirect_url}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Descriptions title={formatMessage(messages.authenticationSectionTitle)} column={1}>
              <Descriptions.Item label={formatMessage(messages.identityProviderNameTitle)}>
                <div className='mcs-identity-provider-name-and-type'>
                  <div className='mcs-identity-provider-name'>
                    {formatMessage(messages.defaultIdpName)}
                  </div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label={formatMessage(messages.identityProviderDescriptionTitle)}>
                {formatMessage(messages.defaultIdpDescription)}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Content>
      </div>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  initialValues: state.session.workspace,
  isUploadingLogo: state.session.isUploadingLogo,
  logoUrl: state.session.logoUrl,
});

const mapDispatchToProps = {
  getLogoRequest: getLogo.request,
  putLogoRequest: putLogo.request,
};

export default compose<OrganisationAccountProps, {}>(
  injectIntl,
  withRouter,
  injectNotifications,
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: 'organisationProfileEdit',
  }),
)(OrganisationAccount);
