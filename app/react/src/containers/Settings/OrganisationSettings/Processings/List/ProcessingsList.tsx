import * as React from 'react';
import { Layout, Button, Modal } from 'antd';
import ItemList, { Filters } from '../../../../../components/ItemList';
import messages from '../messages';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import settingsMessages from '../../../messages';
import { PAGINATION_SEARCH_SETTINGS } from '../../../../../utils/LocationSearchHelper';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { IOrganisationService } from '../../../../../services/OrganisationService';
import { TYPES } from '../../../../../constants/types';
import { DataListResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { RouteComponentProps, withRouter } from 'react-router';
import { lazyInject } from '../../../../../config/inversify.config';
import { compose } from 'recompose';
import { injectWorkspace, InjectedWorkspaceProps } from '../../../../Datamart';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { ProcessingResource } from '../../../../../models/processing';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';

const { Content } = Layout;

interface RouterProps {
  organisationId: string;
}

type Props = RouteComponentProps<RouterProps> &
  InjectedNotificationProps &
  InjectedWorkspaceProps &
  InjectedIntlProps;

interface ProcessingPageState {
  loading: boolean;
  isVisibleCommunityModal: boolean;
  isVisibleDeleteModal: boolean;
  processingIdToBeDeleted?: string;
  data: ProcessingResource[];
  total: number;
}

class ProcessingsList extends React.Component<Props, ProcessingPageState> {
  @lazyInject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;

  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      data: [],
      total: 0,
      isVisibleCommunityModal: false,
      isVisibleDeleteModal: false,
      processingIdToBeDeleted: undefined,
    };
  }

  authorizeEditActions = (): boolean => {
    const {
      workspace: { role },
    } = this.props;

    return !(role === 'EDITOR' || role === 'READER');
  };

  fetchProcessings = (organisationId: string, filter: Filters) => {
    const { notifyError } = this.props;

    this.setState({ loading: true }, () => {
      this._organisationService
        .getOrganisation(organisationId)
        .then(res => res.data.community_id)
        .then(communityId => {
          const options = {
            ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
          };
          return this._organisationService
            .getProcessings(communityId, options)
            .then((results: DataListResponse<ProcessingResource>) => {
              this.setState({
                loading: false,
                data: results.data,
                total: results.total || results.count,
              });
              return results;
            });
        })
        .catch(err => {
          this.setState({
            loading: false,
            data: [],
            total: 0,
          });
          notifyError(err);
        });
    });
  };

  hasRightToPerformActionsOnProcessing = (): boolean => {
    const {
      workspace: { community_id, organisation_id },
    } = this.props;

    if (community_id !== organisation_id) {
      this.setState({ isVisibleCommunityModal: true });
      return false;
    }
    return true;
  };

  editProcessing = (processing: ProcessingResource): void => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;
    if (this.hasRightToPerformActionsOnProcessing()) {
      history.push(
        `/v2/o/${organisationId}/settings/organisation/processings/${processing.id}/edit`,
      );
    }
  };

  archiveProcessing = (processing: ProcessingResource): void => {
    const {
      match: {
        params: { organisationId },
      },
      history,
      notifyError,
    } = this.props;

    if (this.hasRightToPerformActionsOnProcessing()) {
      this._organisationService
        .archiveProcessing(processing.community_id, processing.id)
        .then(() => {
          history.push(`/v2/o/${organisationId}/settings/organisation/processings`);
        })
        .catch(err => {
          notifyError(err);
        });
    }
  };

  deleteProcessing = (processing: ProcessingResource): void => {
    if (this.hasRightToPerformActionsOnProcessing()) {
      this.setState({
        isVisibleDeleteModal: true,
        processingIdToBeDeleted: processing.id,
      });
    }
  };

  deleteProcessingConfirmed = () => {
    // It has been checked previously that the organisationId is in fact the communityId
    const {
      match: {
        params: { organisationId },
      },
      history,
      notifyError,
    } = this.props;
    const { processingIdToBeDeleted } = this.state;

    if (processingIdToBeDeleted)
      this._organisationService
        .deleteProcessing(organisationId, processingIdToBeDeleted)
        .then(() => {
          this.closeDeleteModal();
          history.push(`/v2/o/${organisationId}/settings/organisation/processings`);
        })
        .catch(err => {
          this.closeDeleteModal();
          notifyError(err);
        });
  };

  closeCommunityModal = () => {
    this.setState({ isVisibleCommunityModal: false });
  };

  closeDeleteModal = () => {
    this.setState({ isVisibleDeleteModal: false }, () => {
      this.setState({ processingIdToBeDeleted: undefined });
    });
  };

  onClickCommunityModal = () => {
    const {
      history,
      workspace: { community_id },
    } = this.props;

    this.setState({
      isVisibleCommunityModal: false,
    });

    history.push(`/v2/o/${community_id}/settings/organisation/processings`);
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      history,
      intl: { formatMessage },
    } = this.props;

    const { isVisibleCommunityModal, isVisibleDeleteModal, processingIdToBeDeleted } = this.state;

    const authorizeEditActions = this.authorizeEditActions();

    const dataColumnsDefinition: Array<DataColumnDefinition<ProcessingResource>> = [
      {
        title: formatMessage(messages.id),
        key: 'id',
        isHideable: false,
      },
      {
        title: formatMessage(messages.name),
        key: 'name',
        isHideable: false,
      },
      {
        title: formatMessage(messages.purpose),
        key: 'purpose',
        isHideable: false,
      },
      {
        title: formatMessage(messages.legalBasis),
        key: 'legal_basis',
        isHideable: false,
      },
      {
        title: formatMessage(messages.technicalName),
        key: 'technical_name',
        isHideable: false,
      },
      {
        title: formatMessage(messages.token),
        key: 'token',
        isHideable: false,
      },
    ];

    const emptyTable: {
      iconType: McsIconType;
      message: string;
    } = {
      iconType: 'settings',
      message: formatMessage(messages.emptyProcessings),
    };

    const actionColumns: Array<ActionsColumnDefinition<ProcessingResource>> | undefined =
      authorizeEditActions
        ? [
            {
              key: 'action',
              actions: () => [
                {
                  message: formatMessage(messages.editProcessing),
                  callback: this.editProcessing,
                },
                {
                  message: formatMessage(messages.archiveProcessing),
                  callback: this.archiveProcessing,
                },
                {
                  message: formatMessage(messages.deleteProcessing),
                  callback: this.deleteProcessing,
                },
              ],
            },
          ]
        : undefined;

    const createProcessing = () => {
      if (this.hasRightToPerformActionsOnProcessing()) {
        history.push(`/v2/o/${organisationId}/settings/organisation/processings/create`);
      }
    };

    const button = authorizeEditActions ? (
      <span className='mcs-card-button'>
        <Button key='create' type='primary' onClick={createProcessing}>
          <FormattedMessage {...messages.newProcessing} />
        </Button>
      </span>
    ) : undefined;

    const additionnalComponent = (
      <div>
        <div className='mcs-card-header mcs-card-title'>
          <span className='mcs-card-title'>
            <FormattedMessage {...settingsMessages.processingActivities} />
          </span>
          {button}
        </div>
        <hr className='mcs-separator' />
      </div>
    );

    return (
      <div className='ant-layout mcs-modal_container'>
        <Content className='mcs-content-container'>
          <ItemList
            className='mcs-processingsList_processingTable'
            fetchList={this.fetchProcessings}
            dataSource={this.state.data}
            loading={this.state.loading}
            total={this.state.total}
            columns={dataColumnsDefinition}
            actionsColumnsDefinition={actionColumns}
            pageSettings={PAGINATION_SEARCH_SETTINGS}
            emptyTable={emptyTable}
            additionnalComponent={additionnalComponent}
          />
        </Content>
        <Modal // Community modal
          visible={isVisibleCommunityModal}
          onOk={this.onClickCommunityModal}
          onCancel={this.closeCommunityModal}
        >
          {isVisibleCommunityModal && formatMessage(messages.communityModalMessage)}
        </Modal>
        <Modal // Confirm delete modal
          visible={isVisibleDeleteModal}
          onOk={this.deleteProcessingConfirmed}
          onCancel={this.closeDeleteModal}
        >
          {formatMessage(messages.deleteModalMessage)} {`${processingIdToBeDeleted}.`}
        </Modal>
      </div>
    );
  }
}

export default compose(
  withRouter,
  injectWorkspace,
  injectIntl,
  injectNotifications,
)(ProcessingsList);
