import * as React from 'react';
import {
  IdentityProviderResource,
  lazyInject,
  TYPES,
  IIdentityProviderService,
  injectWorkspace,
} from '@mediarithmics-private/advanced-components';
import { OrganisationResource } from '@mediarithmics-private/advanced-components/lib/models/organisation/organisation';
import { FormattedMessage, defineMessages, InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { Loading, TableViewFilters } from '@mediarithmics-private/mcs-components-library';
import { Layout, Row } from 'antd';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { InjectedWorkspaceProps } from '../../../Datamart';

const { Content } = Layout;

const messages = defineMessages({
  name: {
    id: 'settings.organisation.identityProviders.table.column.name',
    defaultMessage: 'Name',
  },
  type: {
    id: 'settings.organisation.identityProviders.table.column.type',
    defaultMessage: 'Type',
  },
  status: {
    id: 'settings.organisation.identityProviders.table.column.status',
    defaultMessage: 'Status',
  },
  organisationName: {
    id: 'settings.organisation.identityProviders.table.column.organisationName',
    defaultMessage: 'Organisation Name',
  },
  idpName: {
    id: 'settings.organisation.identityProviders.table.column.identityProviderName',
    defaultMessage: 'Identity provider name',
  },
  identityProvidersTitle: {
    id: 'settings.organisation.identityProviders.table.identityProviders.title',
    defaultMessage: 'Identity providers',
  },
  associationOrganisationsTitle: {
    id: 'settings.organisation.identityProviders.table.associatedOrganisations.title',
    defaultMessage: 'Associations organisations and identity providers',
  },
  associationOrganisationsSubtitle: {
    id: 'settings.organisation.identityProviders.table.associatedOrganisations.subtitle',
    defaultMessage:
      "An association means that the users of the organisation will be redirected to a selected identity provider during their authentication. The identity provider will be considered as active for the organisation. If an organisation isn't associated with a custom identity provider, it will be assigned to mediarithmics identity provider by default.",
  },
});

type Props = InjectedNotificationProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedWorkspaceProps;

interface IdentityProviderWithAssociatedOrganisations {
  identityProvider: IdentityProviderResource;
  associatedOrganisations: OrganisationResource[];
}

interface OrganisationWithAssociatedIdentityProvider {
  organisation: OrganisationResource;
  associatedIdentityProvider: IdentityProviderResource;
}

interface State {
  isLoading: boolean;
  idpsWithOrgs: IdentityProviderWithAssociatedOrganisations[];
}

class IdentityProviders extends React.Component<Props, State> {
  @lazyInject(TYPES.IIdentityProviderService)
  private _identityProviderService: IIdentityProviderService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      idpsWithOrgs: [],
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId: communityId },
      },
      workspace,
    } = this.props;

    if (workspace.organisation_id === workspace.community_id)
      this.fetchIdentityProviders(communityId);
    else this.makeEmptyState();
  }

  componentDidUpdate(previousProps: Props) {
    const {
      match: {
        params: { organisationId: previousCommunityId },
      },
    } = previousProps;
    const {
      match: {
        params: { organisationId },
      },
      workspace,
    } = this.props;

    if (previousCommunityId !== organisationId) {
      if (workspace.organisation_id === workspace.community_id)
        this.fetchIdentityProviders(organisationId);
      else this.makeEmptyState();
    }
  }

  makeEmptyState = () => {
    this.setState({ isLoading: false, idpsWithOrgs: [] });
  };

  fetchIdentityProviders = (communityId: string) => {
    const { notifyError } = this.props;
    this.setState({ isLoading: true }, () => {
      this._identityProviderService
        .getCommunityIdentityProviders(communityId)
        .then(resIdps => {
          const idps = resIdps.data;

          const idpsPromises = idps.map(idp => {
            return this._identityProviderService
              .getOrganisationsAssociatedToIdentityProvider(communityId, idp.id)
              .then(resOrgs => {
                const idpWithOrgs: IdentityProviderWithAssociatedOrganisations = {
                  identityProvider: idp,
                  associatedOrganisations: resOrgs.data,
                };
                return idpWithOrgs;
              })
              .catch(err => {
                notifyError(err);
                const idpWithOrgs: IdentityProviderWithAssociatedOrganisations = {
                  identityProvider: idp,
                  associatedOrganisations: [],
                };
                return idpWithOrgs;
              });
          });

          Promise.all(idpsPromises).then(idpsWithOrgs => {
            this.setState({ isLoading: false, idpsWithOrgs: idpsWithOrgs });
          });
        })
        .catch(err => {
          notifyError(err);
          this.setState({ isLoading: false, idpsWithOrgs: [] });
        });
    });
  };

  fromIdpsWithOrgsToOrgsWithIdp = (
    idpsWithOrgs: IdentityProviderWithAssociatedOrganisations[],
  ): OrganisationWithAssociatedIdentityProvider[] => {
    return idpsWithOrgs.reduce<OrganisationWithAssociatedIdentityProvider[]>(
      (
        acc: OrganisationWithAssociatedIdentityProvider[],
        curValue: IdentityProviderWithAssociatedOrganisations,
      ) => {
        return acc.concat(
          curValue.associatedOrganisations.map(org => {
            return {
              organisation: org,
              associatedIdentityProvider: curValue.identityProvider,
            } as OrganisationWithAssociatedIdentityProvider;
          }),
        );
      },
      [],
    );
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;
    const { isLoading, idpsWithOrgs } = this.state;

    if (isLoading) {
      return <Loading isFullScreen={true} />;
    }

    const orgsWithIdps = this.fromIdpsWithOrgsToOrgsWithIdp(idpsWithOrgs);

    const firstTableDataColumns: Array<
      DataColumnDefinition<IdentityProviderWithAssociatedOrganisations>
    > = [
      {
        title: formatMessage(messages.name),
        key: 'name',
        isHideable: false,
        sorter: (
          a: IdentityProviderWithAssociatedOrganisations,
          b: IdentityProviderWithAssociatedOrganisations,
        ) => {
          return a.identityProvider.name.localeCompare(b.identityProvider.name);
        },
        render: (text: string, record: IdentityProviderWithAssociatedOrganisations) => {
          return record.identityProvider.name;
        },
      },
      {
        title: formatMessage(messages.type),
        key: 'type',
        isHideable: false,
        sorter: (
          a: IdentityProviderWithAssociatedOrganisations,
          b: IdentityProviderWithAssociatedOrganisations,
        ) => {
          return a.identityProvider.provider_type.localeCompare(b.identityProvider.provider_type);
        },
        render: (text: string, record: IdentityProviderWithAssociatedOrganisations) => {
          return record.identityProvider.provider_type;
        },
      },
      {
        title: formatMessage(messages.status),
        key: 'status',
        isHideable: false,
        sorter: (
          a: IdentityProviderWithAssociatedOrganisations,
          b: IdentityProviderWithAssociatedOrganisations,
        ) => {
          return a.identityProvider.status.localeCompare(b.identityProvider.status);
        },
        render: (text: string, record: IdentityProviderWithAssociatedOrganisations) => {
          return record.identityProvider.status;
        },
      },
    ];

    const secondTableDataColumns: Array<
      DataColumnDefinition<OrganisationWithAssociatedIdentityProvider>
    > = [
      {
        title: formatMessage(messages.organisationName),
        key: 'organisation_name',
        isHideable: false,
        sorter: (
          a: OrganisationWithAssociatedIdentityProvider,
          b: OrganisationWithAssociatedIdentityProvider,
        ) => {
          return a.organisation.name.localeCompare(b.organisation.name);
        },
        render: (text: string, record: OrganisationWithAssociatedIdentityProvider) => {
          return record.organisation.name;
        },
      },
      {
        title: formatMessage(messages.idpName),
        key: 'idp_name',
        isHideable: false,
        sorter: (
          a: OrganisationWithAssociatedIdentityProvider,
          b: OrganisationWithAssociatedIdentityProvider,
        ) => {
          return a.associatedIdentityProvider.name.localeCompare(b.associatedIdentityProvider.name);
        },
        render: (text: string, record: OrganisationWithAssociatedIdentityProvider) => {
          return record.associatedIdentityProvider.name;
        },
      },
      {
        title: formatMessage(messages.type),
        key: 'type',
        isHideable: false,
        sorter: (
          a: OrganisationWithAssociatedIdentityProvider,
          b: OrganisationWithAssociatedIdentityProvider,
        ) => {
          return a.associatedIdentityProvider.provider_type.localeCompare(
            b.associatedIdentityProvider.provider_type,
          );
        },
        render: (text: string, record: OrganisationWithAssociatedIdentityProvider) => {
          return record.associatedIdentityProvider.provider_type;
        },
      },
    ];

    return (
      <div className='ant-layout'>
        <Content className='mcs-content-container'>
          <Row className='mcs-table-container'>
            <div className='mcs-card-header mcs-card-title'>
              <span className='mcs-card-title'>
                <FormattedMessage {...messages.identityProvidersTitle} />
              </span>
            </div>
            <hr className='mcs-separator' />
            <TableViewFilters
              pagination={false}
              columns={firstTableDataColumns}
              dataSource={idpsWithOrgs}
            />
          </Row>
          <Row className='mcs-table-container'>
            <div className='mcs-card-header'>
              <div className='mcs-card-title'>
                <FormattedMessage {...messages.associationOrganisationsTitle} />
              </div>
              <FormattedMessage {...messages.associationOrganisationsSubtitle} />
            </div>
            <hr className='mcs-separator' />
            <TableViewFilters
              pagination={false}
              columns={secondTableDataColumns}
              dataSource={orgsWithIdps}
            />
          </Row>
        </Content>
      </div>
    );
  }
}

export default compose<Props, {}>(
  injectIntl,
  injectWorkspace,
  injectNotifications,
  withRouter,
)(IdentityProviders);
