import * as React from 'react';
import {
  lazyInject,
  TYPES,
  IIdentityProviderService,
  injectWorkspace,
  IdentityProviderResource,
  IOrganisationService,
} from '@mediarithmics-private/advanced-components';
import { defineMessages, FormattedMessage, WrappedComponentProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { InjectedWorkspaceProps } from '../../../Datamart';
import { Button, Form, Select, Table } from 'antd';
import { OrganisationResource } from '@mediarithmics-private/advanced-components/lib/models/organisation/organisation';
import { ColumnsType } from 'antd/lib/table';
import { FilterDropdownProps } from 'antd/lib/table/interface';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { FakeMicsIdentityProvider } from './IdentityProviderList';
import Search from 'antd/lib/input/Search';
import { notifyError } from '../../../../redux/Notifications/actions';
import { Subject, Subscription } from 'rxjs';
import { ACTION_AUTHORIZATIONS } from '../../../../common/authorizations/ActionAuthorizations';

const { Option } = Select;

export interface IdentityProviderAssociationListProps {
  newIdentityProviderSubject?: Subject<IdentityProviderResource>;
}

type Props = IdentityProviderAssociationListProps &
  InjectedNotificationProps &
  WrappedComponentProps &
  InjectedWorkspaceProps;

type Association = {
  organisation: OrganisationResource;
  identityProvider: IdentityProviderResource;
};

interface State {
  mode: 'READ' | 'EDIT';
  identityProviders: IdentityProviderResource[];
  organisations: OrganisationResource[];
  selectedIdentityProviderId?: string;
  associations: Association[];
  newAssociations: Association[];
  isLoading: boolean;
  filters: {
    organisation?: string;
    identityProvider?: string;
  };
}

class IdentityProviderAssociationList extends React.Component<Props, State> {
  @lazyInject(TYPES.IIdentityProviderService)
  private _identityProviderService: IIdentityProviderService;

  @lazyInject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;

  private newIdentityProviderSubscription?: Subscription;

  constructor(props: Props) {
    super(props);
    this.state = {
      mode: 'READ',
      isLoading: true,
      identityProviders: [],
      organisations: [],
      filters: {},
      associations: [],
      newAssociations: [],
    };
  }

  componentDidMount() {
    const { newIdentityProviderSubject } = this.props;

    this.newIdentityProviderSubscription = newIdentityProviderSubject?.subscribe(
      newIdentityProviderSubject => {
        this.fetchAssociations();
      },
    );

    this.fetchAssociations();
  }

  componentDidUpdate(prevProp: Props) {
    if (prevProp.workspace.community_id != this.props.workspace.community_id)
      this.fetchAssociations();
  }

  componentWillUnmount() {
    this.newIdentityProviderSubscription?.unsubscribe();
  }

  fetchAssociations() {
    const {
      workspace: { community_id },
      notifyError,
    } = this.props;

    this.setState({ isLoading: true });

    const pIdentityProviders = this._identityProviderService
      .getCommunityIdentityProviders(community_id, { archived: false })
      .then(({ data: identityProviders }) => identityProviders);

    const pOrganisations: (accu: OrganisationResource[]) => Promise<OrganisationResource[]> = (
      accu: OrganisationResource[],
    ) => {
      return this._organisationService
        .getOrganisations(community_id, { first_result: accu.length, max_results: 200 })
        .then(({ data: organisations, total }) => {
          accu.push(...organisations);
          if (!total || accu.length >= total) return accu;
          else return pOrganisations(accu);
        });
    };

    Promise.all([pIdentityProviders, pOrganisations([])])
      .then(([identityProviders, organisations]) => {
        const associations: Association[] = [];

        Promise.all(
          identityProviders.map(identityProvider =>
            this._identityProviderService
              .getOrganisationsAssociatedToIdentityProvider(community_id, identityProvider.id, {
                max_results: 500,
              })
              .then(({ data: organisationsLinkToIDP }) => {
                return {
                  identityProvider: identityProvider,
                  organisations: organisationsLinkToIDP,
                };
              }),
          ),
        ).then(assoByIDP => {
          organisations.map(organisation => {
            const identityProviderAssociated = assoByIDP.find(
              ({ identityProvider, organisations }) => {
                if (organisations.find(o => o.id === organisation.id)) return true;
                return false;
              },
            )?.identityProvider;

            associations.push({
              organisation,
              identityProvider: identityProviderAssociated || FakeMicsIdentityProvider,
            });
          });
          this.setState({
            associations: associations,
            newAssociations: [],
            identityProviders,
            organisations,
            isLoading: false,
          });
        });
      })
      .catch(error => {
        notifyError(error);
        this.setState({
          associations: [],
          newAssociations: [],
          identityProviders: [],
          organisations: [],
          isLoading: false,
        });
      });
  }

  onSelectIdentityProviderChange =
    (currentAssociation: Association) => (newIdentityProviderId: string) => {
      const { newAssociations, identityProviders } = this.state;
      const newAssociation = {
        ...currentAssociation,
        identityProvider:
          identityProviders.find(i => i.id === newIdentityProviderId) || FakeMicsIdentityProvider,
      };

      // clean previous new association for same org
      const newAssociationAlreadyPresentForOrgIndex = newAssociations.findIndex(
        a => a.organisation.id === currentAssociation.organisation.id,
      );

      const updatedNewAssociations = newAssociations;
      if (newAssociationAlreadyPresentForOrgIndex >= 0)
        newAssociations.splice(newAssociationAlreadyPresentForOrgIndex, 1);

      // If same as current it's not a new associations
      if (currentAssociation.identityProvider.id !== newIdentityProviderId)
        updatedNewAssociations.push(newAssociation);

      this.setState({
        newAssociations: updatedNewAssociations,
      });
    };

  save = () => {
    const { associations, newAssociations } = this.state;

    if (newAssociations.length === 0) return this.setState({ mode: 'READ' });

    const pNewAssociations = newAssociations.map(newAssociation => {
      const isDissociation = newAssociation.identityProvider.id === FakeMicsIdentityProvider.id;
      const method = isDissociation
        ? this._identityProviderService.dissociateIdentityProviderFromOrganisation
        : this._identityProviderService.associateIdentityProviderToOrganisation;

      return method(
        newAssociation.organisation.id,
        isDissociation
          ? associations.find(a => a.organisation.id === newAssociation.organisation.id)
              ?.identityProvider.id!
          : newAssociation.identityProvider.id,
      );
    });

    Promise.all(pNewAssociations)
      .then(() => {
        this.setState({ mode: 'READ' });
        this.fetchAssociations();
      })
      .catch(error => {
        notifyError(error);
        this.setState({ mode: 'READ' });
        this.fetchAssociations();
      });
  };

  render() {
    const {
      intl: { formatMessage },
      workspace: { role },
    } = this.props;
    const { mode, associations, newAssociations, filters, identityProviders, isLoading } =
      this.state;

    const filterDropdown =
      (fieldToFilter: 'organisation' | 'identityProvider', placeholder?: string) =>
      (filterDropdownProps: FilterDropdownProps) =>
        (
          <Search
            style={{ width: 300 }} // inline as it's in a portal
            allowClear={true}
            placeholder={placeholder}
            onSearch={value => {
              filterDropdownProps.confirm();
              const newFilters = this.state.filters;
              newFilters[fieldToFilter] = value;
              this.setState({
                filters: newFilters,
              });
            }}
          />
        );

    const columns: ColumnsType<Association> = [
      {
        title: formatMessage(messages.tableColumnOrganisationHeader),
        sorter: { compare: (a1, a2) => a1.organisation.name.localeCompare(a2.organisation.name) },
        filterDropdown: filterDropdown(
          'organisation',
          formatMessage(messages.tableColumnOrganisationHeader),
        ),
        filteredValue: !!filters.organisation ? [true] : undefined,
        render: (text: string, record: Association) => {
          return (
            <span>
              {record.organisation.name}
              &nbsp;
              <span className='mcs-identityProviderAssociationList_table_row_organisation_id'>
                {record.organisation.id}
              </span>
            </span>
          );
        },
      },
      {
        title: formatMessage(messages.tableColumnIdentityProviderHeader),
        sorter: {
          compare: (a1, a2) => a1.identityProvider.name.localeCompare(a2.identityProvider.name),
        },
        filterDropdown: filterDropdown(
          'identityProvider',
          formatMessage(messages.tableColumnIdentityProviderHeader),
        ),
        filteredValue: !!filters.identityProvider ? [true] : undefined,
        render: (text: string, record: Association) => {
          if (mode === 'READ') return record.identityProvider.name;

          const newAssociationIdentityProviderId = newAssociations.find(
            a => a.organisation.id === record.organisation.id,
          )?.identityProvider.id;

          return (
            <Select
              key={record.organisation.id}
              className='mcs-identityProviderAssociationList_select'
              defaultValue={newAssociationIdentityProviderId || record.identityProvider.id}
              onChange={this.onSelectIdentityProviderChange(record)}
              bordered={false}
            >
              <Option key={FakeMicsIdentityProvider.id} value={FakeMicsIdentityProvider.id}>
                {FakeMicsIdentityProvider.name}
              </Option>
              {identityProviders.map(idp => (
                <Option key={idp.id} value={idp.id}>
                  {idp.name}
                </Option>
              ))}
            </Select>
          );
        },
      },
    ];

    const filteredAssociations = associations.filter(({ organisation, identityProvider }) => {
      if (!!filters.organisation && !!filters.identityProvider)
        return (
          (organisation.id.includes(filters.organisation) ||
            organisation.name.toLowerCase().includes(filters.organisation.toLowerCase())) &&
          identityProvider.name
            .toLocaleLowerCase()
            .includes(filters.identityProvider.toLocaleLowerCase())
        );
      else if (!!filters.organisation)
        return (
          organisation.id.includes(filters.organisation) ||
          organisation.name.toLowerCase().includes(filters.organisation.toLowerCase())
        );
      else if (!!filters.identityProvider)
        return identityProvider.name
          .toLocaleLowerCase()
          .includes(filters.identityProvider.toLocaleLowerCase());

      return true;
    });

    return (
      <Form className='mcs-identityProviderAssociationList ant-layout'>
        <div className='mcs-card-header'>
          <div className='mcs-card-title'>
            <FormattedMessage {...messages.title} />
            {ACTION_AUTHORIZATIONS.ASSOCIATE_IDENTITY_PROVIDER.includes(role) && (
              <span className='mcs-identityProviderAssociationList_buttons mcs-card-button'>
                {mode === 'EDIT' && (
                  <Button
                    key='cancel'
                    type='link'
                    className='mcs-primary'
                    onClick={() => this.setState({ mode: 'READ', newAssociations: [] })}
                    block
                  >
                    <FormattedMessage {...messages.cancel} />
                  </Button>
                )}
                &nbsp;
                <Button
                  key='new'
                  type='primary'
                  className='mcs-primary'
                  htmlType='submit'
                  onClick={mode === 'EDIT' ? this.save : () => this.setState({ mode: 'EDIT' })}
                  disabled={isLoading}
                >
                  {mode === 'READ' ? <LockOutlined /> : <UnlockOutlined />}
                  {mode === 'READ' ? (
                    <FormattedMessage {...messages.edit} />
                  ) : (
                    <FormattedMessage {...messages.save} />
                  )}
                </Button>
              </span>
            )}
          </div>
          <FormattedMessage {...messages.subtitle} />
        </div>
        <Table
          className='mcs-identityProviderAssociationList_table'
          rowKey='id'
          columns={columns}
          dataSource={filteredAssociations}
          pagination={{ position: ['bottomRight'], size: 'small' }}
          loading={isLoading}
        />
      </Form>
    );
  }
}

export default compose<Props, IdentityProviderAssociationListProps>(
  injectIntl,
  injectWorkspace,
  injectNotifications,
)(IdentityProviderAssociationList);

const messages = defineMessages({
  title: {
    id: 'identityProviderAssociationList.title',
    defaultMessage: 'Associations of identity providers to organisations',
  },
  subtitle: {
    id: 'identityProviderAssociationList.subtitle',
    defaultMessage:
      'An association means that the users of the organisation will be redirected to a selected identity provider during their authentication. The identity provider will be considered as active for the organisation.',
  },
  edit: {
    id: 'identityProviderAssociationList.edit',
    defaultMessage: 'Edit',
  },
  save: {
    id: 'identityProviderAssociationList.save',
    defaultMessage: 'Save',
  },
  cancel: {
    id: 'identityProviderAssociationList.cancel',
    defaultMessage: 'Cancel',
  },
  tableColumnIDHeader: {
    id: 'identityProviderAssociationList.table.column.header.id',
    defaultMessage: 'ID',
  },
  tableColumnOrganisationHeader: {
    id: 'identityProviderAssociationList.table.column.header.organisation',
    defaultMessage: 'Organisation',
  },
  tableColumnIdentityProviderHeader: {
    id: 'identityProviderAssociationList.table.column.header.identityProvider',
    defaultMessage: 'Identity provider',
  },
});
