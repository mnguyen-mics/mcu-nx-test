import * as React from 'react';
import {
  IdentityProviderResource,
  lazyInject,
  TYPES,
  IIdentityProviderService,
  injectWorkspace,
} from '@mediarithmics-private/advanced-components';
import { FormattedMessage, defineMessages, WrappedComponentProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { McsIcon, TableViewFilters } from '@mediarithmics-private/mcs-components-library';
import { Button, Drawer, Modal } from 'antd';
import {
  ActionDefinition,
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { InjectedWorkspaceProps } from '../../../Datamart';
import IdentityProviderForm from './IdentityProviderForm';
import { Subject, Subscription } from 'rxjs';
import { ACTION_AUTHORIZATIONS } from '../../../../common/authorizations/ActionAuthorizations';

interface IdentityProviderSettingsProps {
  newIdentityProviderSubject?: Subject<IdentityProviderResource>;
}

type Props = IdentityProviderSettingsProps &
  InjectedNotificationProps &
  WrappedComponentProps &
  InjectedWorkspaceProps;

// We don't store in the back the mics identity provider but for more comprehensibility we display a fake one on the front
export const FakeMicsIdentityProvider: IdentityProviderResource = {
  id: 'fake',
  name: 'mediarithmics standard login',
  community_id: '',
  provider_type: 'SAML_V2_0',
  metadata_xml_url: '',
  entity_id: 'string',
  status: 'LIVE',
  created_ts: 1,
  created_by: '',
  last_modified_ts: 1,
  last_modified_by: '0',
  archived: false,
};

interface State {
  isLoading: boolean;
  identityProviders: IdentityProviderResource[];
  selectedIdentityProviderId?: string;
  isIdentityProviderFormDrawerVisible: boolean;
}

class IdentityProviders extends React.Component<Props, State> {
  @lazyInject(TYPES.IIdentityProviderService)
  private _identityProviderService: IIdentityProviderService;

  private newIdentityProviderSubscription?: Subscription;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      identityProviders: [],
      isIdentityProviderFormDrawerVisible: false,
    };
  }

  componentDidMount() {
    const {
      newIdentityProviderSubject,
      workspace: { community_id },
    } = this.props;

    this.newIdentityProviderSubscription = newIdentityProviderSubject?.subscribe(() => {
      this.setState({
        isIdentityProviderFormDrawerVisible: false,
        selectedIdentityProviderId: undefined,
      });
      this.fetchIdentityProviders(this.props.workspace.community_id);
    });

    this.fetchIdentityProviders(community_id);
  }

  componentDidUpdate(previousProps: Props) {
    const {
      workspace: { community_id: previousCommunityId },
    } = previousProps;

    const {
      workspace: { community_id },
    } = this.props;

    if (community_id !== previousCommunityId) {
      this.setState({
        identityProviders: [],
        selectedIdentityProviderId: undefined,
        isIdentityProviderFormDrawerVisible: false,
      });
      this.fetchIdentityProviders(community_id);
    }
  }

  componentWillUnmount() {
    this.newIdentityProviderSubscription?.unsubscribe();
  }

  fetchIdentityProviders = (communityId: string) => {
    const { notifyError } = this.props;
    this.setState({ isLoading: true }, () => {
      this._identityProviderService
        .getCommunityIdentityProviders(communityId, { archived: false })
        .then(({ data: identityProviders }) =>
          this.setState({
            isLoading: false,
            identityProviders: [FakeMicsIdentityProvider].concat(identityProviders),
          }),
        )
        .catch(err => {
          notifyError(err);
          this.setState({ isLoading: false, identityProviders: [] });
        });
    });
  };

  render() {
    const {
      intl: { formatMessage },
      workspace: { community_id, role },
      newIdentityProviderSubject,
      notifyError,
    } = this.props;

    const {
      isLoading,
      identityProviders,
      isIdentityProviderFormDrawerVisible,
      selectedIdentityProviderId,
    } = this.state;

    const identityProviderTableDataColumns: Array<DataColumnDefinition<IdentityProviderResource>> =
      [
        {
          title: formatMessage(messages.id),
          key: 'id',
          sorter: (a: IdentityProviderResource, b: IdentityProviderResource) => {
            return a.id.localeCompare(b.id);
          },
          render: (text: string, record: IdentityProviderResource) => {
            return record.id === FakeMicsIdentityProvider.id ? '-' : record.id;
          },
        },
        {
          title: formatMessage(messages.name),
          key: 'name',
          sorter: (a: IdentityProviderResource, b: IdentityProviderResource) => {
            return a.name.localeCompare(b.name);
          },
          render: (text: string, record: IdentityProviderResource) => {
            return record.name;
          },
        },
        {
          title: formatMessage(messages.type),
          key: 'type',
          sorter: (a: IdentityProviderResource, b: IdentityProviderResource) => {
            return a.provider_type.localeCompare(b.provider_type);
          },
          render: (text: string, record: IdentityProviderResource) => {
            return record.id === FakeMicsIdentityProvider.id ? '-' : record.provider_type;
          },
        },
        {
          title: formatMessage(messages.status),
          key: 'status',
          sorter: (a: IdentityProviderResource, b: IdentityProviderResource) => {
            return a.status.localeCompare(b.status);
          },
          render: (text: string, record: IdentityProviderResource) => {
            return record.id === FakeMicsIdentityProvider.id ? '-' : record.status;
          },
        },
      ];

    const identityProviderTableActionColumns: Array<
      ActionsColumnDefinition<IdentityProviderResource>
    > = [
      {
        key: 'action',
        actions: record => {
          const actions: Array<ActionDefinition<IdentityProviderResource>> = [
            {
              message: formatMessage(messages.editActionIDP),
              disabled: record.id === FakeMicsIdentityProvider.id,
              callback: () => {
                this.setState({
                  isIdentityProviderFormDrawerVisible: true,
                  selectedIdentityProviderId: record.id,
                });
              },
            },
          ];

          if (record.status != 'LIVE') {
            actions.push({
              message: formatMessage(messages.deleteActionIDP),
              disabled: record.id === FakeMicsIdentityProvider.id,
              callback: () => {
                Modal.warning({
                  title: formatMessage(messages.deleteActionIDPModalTitle),
                  onOk: () => {
                    this._identityProviderService
                      .deleteIdentityProvider(record.community_id, record.id)
                      .catch(error => {
                        notifyError(error);
                      })
                      .then(() => {
                        this.fetchIdentityProviders(community_id);
                      });
                  },
                  okCancel: true,
                });
              },
            });
          }

          return actions;
        },
      },
    ];

    return (
      <div className='ant-layout'>
        <div className='mcs-card-header mcs-card-title'>
          <span className='mcs-card-title'>
            <FormattedMessage {...messages.identityProvidersTitle} />
          </span>
          {ACTION_AUTHORIZATIONS.CREATE_IDENTITY_PROVIDER.includes(role) && (
            <div className='mcs-card-button'>
              <Button
                key='new'
                type='primary'
                className='mcs-primary'
                htmlType='submit'
                onClick={() => this.setState({ isIdentityProviderFormDrawerVisible: true })}
              >
                <McsIcon type='plus' />
                <FormattedMessage {...messages.newIdentityProvider} />
              </Button>
              <Drawer
                className='mcs-identityProviderList_drawer'
                width='800'
                bodyStyle={{ padding: '0' }}
                title={
                  <FormattedMessage
                    id='identityProviders.drawer.identityProviderForm.title'
                    defaultMessage={`Identity Providers > {mode} Identity Provider`}
                    values={{ mode: selectedIdentityProviderId ? 'Edit' : 'Add' }}
                  />
                }
                placement={'right'}
                closable={true}
                onClose={() =>
                  this.setState({
                    isIdentityProviderFormDrawerVisible: false,
                    selectedIdentityProviderId: undefined,
                  })
                }
                visible={isIdentityProviderFormDrawerVisible}
                destroyOnClose={true}
              >
                <IdentityProviderForm
                  newIdentityProviderSubject={newIdentityProviderSubject}
                  identityProviderId={selectedIdentityProviderId}
                />
              </Drawer>
            </div>
          )}
        </div>
        <TableViewFilters
          pagination={false}
          columns={identityProviderTableDataColumns}
          actionsColumnsDefinition={identityProviderTableActionColumns}
          dataSource={identityProviders}
          loading={isLoading}
        />
      </div>
    );
  }
}

export default compose<Props, IdentityProviderSettingsProps>(
  injectIntl,
  injectWorkspace,
  injectNotifications,
)(IdentityProviders);

const messages = defineMessages({
  id: {
    id: 'settings.organisation.identityProviderList.table.column.ID',
    defaultMessage: 'ID',
  },
  name: {
    id: 'settings.organisation.identityProviderList.table.column.name',
    defaultMessage: 'Name',
  },
  type: {
    id: 'settings.organisation.identityProviderList.table.column.type',
    defaultMessage: 'Type',
  },
  status: {
    id: 'settings.organisation.identityProviderList.table.column.status',
    defaultMessage: 'Status',
  },
  editActionIDP: {
    id: 'settings.organisation.identityProviderList.table.column.actions.edit',
    defaultMessage: 'Edit',
  },
  deleteActionIDP: {
    id: 'settings.organisation.identityProviderList.table.column.actions.delete',
    defaultMessage: 'Delete',
  },
  deleteActionIDPModalTitle: {
    id: 'settings.organisation.identityProviderList.table.column.actions.delete.modal.title',
    defaultMessage: 'Are you sure you want to delete this identity provider ?',
  },
  identityProvidersTitle: {
    id: 'settings.organisation.identityProviderList.table.identityProviderList.title',
    defaultMessage: 'Available identity providers',
  },
  newIdentityProvider: {
    id: 'settings.organisation.identityProviderList.table.identityProviderList.new',
    defaultMessage: 'New Identity Provider',
  },
});
