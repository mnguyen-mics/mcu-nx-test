import * as React from 'react';
import { Layout, message, Modal } from 'antd';
import { compose } from 'recompose';
import EmailTemplatesActionBar from './EmailTemplatesActionBar';
import EmailTemplatesTable from './EmailTemplatesTable';
import { CampaignRouteParams } from '../../../../models/campaign/CampaignResource';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, StaticContext, withRouter } from 'react-router';
import { CreativesOptions, ICreativeService } from '../../../../services/CreativeService';
import { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import { injectDrawer } from '../../../../components/Drawer/index';
import {
  parseSearch,
  updateSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../../utils/LocationSearchHelper';
import { CREATIVE_EMAIL_SEARCH_SETTINGS } from './constants';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { executeTasksInSequence, Task } from '../../../../utils/PromiseHelper';
import { EmailTemplateResource } from '../../../../models/creative/CreativeResource';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { Index } from '../../../../utils';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';
import messages from '../../DisplayAds/List/message';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Content } = Layout;

interface State {
  selectedRowKeys: string[];
  isArchiveModalVisible: boolean;
  allRowsAreSelected: boolean;
  isArchiving: boolean;
  isLoadingEmailTemplates: boolean;
  dataSource: EmailTemplateResource[];
  totalEmailTemplates: number;
  hasEmailTemplates: boolean;
}

type JoinedProps = InjectedIntlProps &
  InjectedDrawerProps &
  InjectedNotificationProps &
  RouteComponentProps<CampaignRouteParams, StaticContext, { reloadDataSource?: boolean }>;

class EmailTemplatesPage extends React.Component<JoinedProps, State> {
  @lazyInject(TYPES.ICreativeService)
  private _creativeService: ICreativeService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      isArchiveModalVisible: false,
      allRowsAreSelected: false,
      isArchiving: false,
      isLoadingEmailTemplates: false,
      dataSource: [],
      totalEmailTemplates: 0,
      hasEmailTemplates: true,
    };
  }

  componentDidMount() {
    const {
      history,
      location: { search, pathname },
      match: {
        params: { organisationId },
      },
    } = this.props;

    if (!isSearchValid(search, CREATIVE_EMAIL_SEARCH_SETTINGS)) {
      history.replace(
        {
          pathname: pathname,
          search: buildDefaultSearch(search, CREATIVE_EMAIL_SEARCH_SETTINGS),
        },
        { reloadDataSource: true },
      );
    } else {
      const filter = parseSearch(search, CREATIVE_EMAIL_SEARCH_SETTINGS);
      this.fetchCreativeEmails(organisationId, filter, true);
    }
  }

  componentDidUpdate(previousProps: JoinedProps) {
    const {
      location: { pathname, search, state },
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;

    const {
      location: { search: previousSearch },
      match: {
        params: { organisationId: previousOrganisationId },
      },
    } = previousProps;

    const checkEmptyDataSource = state && state.reloadDataSource;

    if (!compareSearches(search, previousSearch) || organisationId !== previousOrganisationId) {
      if (!isSearchValid(search, CREATIVE_EMAIL_SEARCH_SETTINGS)) {
        history.replace(
          {
            pathname: pathname,
            search: buildDefaultSearch(search, CREATIVE_EMAIL_SEARCH_SETTINGS),
          },
          { reloadDataSource: organisationId !== previousOrganisationId },
        );
      } else {
        const filter = parseSearch(search, CREATIVE_EMAIL_SEARCH_SETTINGS);
        this.fetchCreativeEmails(organisationId, filter, checkEmptyDataSource);
      }
    }
  }

  fetchCreativeEmails = (organisationId: string, filter: Index<any>, init: boolean = false) => {
    this.setState({
      isLoadingEmailTemplates: true,
    });
    let options: CreativesOptions = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      archived: filter.archived,
    };

    if (filter.keywords) {
      options = {
        ...options,
        keywords: filter.keywords,
      };
    }
    this._creativeService.getEmailTemplates(organisationId, options).then(result => {
      const data = result.data;
      const emailTemplatesById = normalizeArrayOfObject(data, 'id');
      this.setState({
        dataSource: Object.keys(emailTemplatesById).map(id => {
          return {
            ...emailTemplatesById[id],
          };
        }),
        isLoadingEmailTemplates: false,
        hasEmailTemplates: init ? result.count !== 0 : true,
        totalEmailTemplates: result.total || 0,
      });
    });
  };

  onSelectChange = (selectedRowKeys: string[]) => {
    this.setState({ selectedRowKeys });
  };
  selectAllItemIds = (selected: boolean = true) => {
    this.setState({
      allRowsAreSelected: true,
    });
  };

  unselectAllItemIds = () => {
    this.setState({
      selectedRowKeys: [],
      allRowsAreSelected: false,
    });
  };

  archiveEmails = () => {
    this.showModal();
  };

  showModal = () => {
    this.setState({
      isArchiveModalVisible: true,
    });
  };

  handleCancel = () => {
    this.setState({
      isArchiveModalVisible: false,
    });
  };

  getAllEmailTemplatesIds = () => {
    const {
      match: {
        params: { organisationId },
      },
      notifyError,
    } = this.props;

    const { totalEmailTemplates } = this.state;

    const options: CreativesOptions = {
      type: 'EMAIL_TEMPLATE',
      archived: false,
      max_results: totalEmailTemplates, // mandatory
    };
    return this._creativeService
      .getEmailTemplates(organisationId, options)
      .then(apiResp => apiResp.data.map(emailTemplateResource => emailTemplateResource.id))
      .catch(err => {
        notifyError(err);
      });
  };

  redirectAndNotify = () => {
    const {
      location: { search, pathname, state },
      history,
      intl,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const filter = parseSearch(search, CREATIVE_EMAIL_SEARCH_SETTINGS);

    const { dataSource } = this.state;

    if (dataSource.length === 1 && filter.currentPage !== 1) {
      const newFilter = {
        ...filter,
        currentPage: 1,
      };
      this.fetchCreativeEmails(organisationId, filter, true);
      history.push(
        {
          pathname: pathname,
          search: updateSearch(search, newFilter),
        },
        state,
      );
    } else {
      this.fetchCreativeEmails(organisationId, filter, true);
    }

    this.setState({
      isArchiveModalVisible: false,
      selectedRowKeys: [],
    });
    message.success(intl.formatMessage(messages.archiveEmailSuccess));
  };

  makeArchiveAction = (emailTemplateIds: string[]) => {
    this.setState({
      isArchiving: true,
    });
    const tasks: Task[] = [];
    emailTemplateIds.forEach(emailTemplateId => {
      tasks.push(() => {
        return this._creativeService
          .getEmailTemplate(emailTemplateId)
          .then(apiResp => apiResp.data)
          .then(emailTemplateData => {
            return this._creativeService.updateEmailTemplate(emailTemplateId, {
              ...emailTemplateData,
              archived: true,
            });
          });
      });
    });
    executeTasksInSequence(tasks).then(() => {
      this.redirectAndNotify();
      this.setState({
        isArchiving: false,
      });
    });
  };

  archiveCreativeEmail = (email: EmailTemplateResource) => {
    const {
      match: {
        params: { organisationId },
      },
      location: { search, pathname, state },
      history,
      intl,
    } = this.props;

    const { dataSource } = this.state;

    const filter = parseSearch(search, CREATIVE_EMAIL_SEARCH_SETTINGS);

    const fetchDataSource = () => {
      this.fetchCreativeEmails(organisationId, filter, true);
    };

    const updateEmailTemplate = () => {
      return this._creativeService.updateEmailTemplate(email.id, {
        ...email,
        archived: true,
      });
    };

    Modal.confirm({
      title: intl.formatMessage(messages.creativeModalConfirmArchivedTitle),
      content: intl.formatMessage(messages.creativeModalConfirmArchivedContent),
      icon: <ExclamationCircleOutlined />,
      okText: intl.formatMessage(messages.creativeModalConfirmArchivedOk),
      cancelText: intl.formatMessage(messages.cancelText),
      onOk() {
        updateEmailTemplate().then(() => {
          if (dataSource.length === 1 && filter.currentPage !== 1) {
            const newFilter = {
              ...filter,
              currentPage: filter.currentPage - 1,
            };
            fetchDataSource();

            history.replace(
              {
                pathname: pathname,
                search: updateSearch(search, newFilter),
              },
              state,
            );
          }
          fetchDataSource();
        });
      },
      onCancel() {
        //
      },
    });
  };

  handleOk = () => {
    const { selectedRowKeys, allRowsAreSelected } = this.state;

    if (allRowsAreSelected) {
      return this.getAllEmailTemplatesIds().then((allTemplatesIds: string[]) => {
        this.makeArchiveAction(allTemplatesIds);
      });
    } else {
      return this.makeArchiveAction(selectedRowKeys);
    }
  };

  unsetAllItemsSelectedFlag = () => {
    this.setState({
      allRowsAreSelected: false,
    });
  };

  render() {
    const {
      selectedRowKeys,
      allRowsAreSelected,
      dataSource,
      totalEmailTemplates,
      hasEmailTemplates,
      isLoadingEmailTemplates,
    } = this.state;

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      allRowsAreSelected: allRowsAreSelected,
      selectAllItemIds: this.selectAllItemIds,
      unselectAllItemIds: this.unselectAllItemIds,
      onSelectAll: this.unsetAllItemsSelectedFlag,
      onSelect: this.unsetAllItemsSelectedFlag,
    };

    const multiEditProps = {
      archiveEmails: this.archiveEmails,
      isArchiveModalVisible: this.state.isArchiveModalVisible,
      handleOk: this.handleOk,
      handleCancel: this.handleCancel,
      isArchiving: this.state.isArchiving,
    };

    return (
      <div className='ant-layout'>
        <EmailTemplatesActionBar rowSelection={rowSelection} multiEditProps={multiEditProps} />
        <div className='ant-layout'>
          <Content className='mcs-content-container'>
            <EmailTemplatesTable
              rowSelection={rowSelection}
              dataSource={dataSource}
              archiveEmailTemplate={this.archiveCreativeEmail}
              hasEmailTemplates={hasEmailTemplates}
              isLoadingEmailTemplates={isLoadingEmailTemplates}
              totalEmailTemplates={totalEmailTemplates}
            />
          </Content>
        </div>
      </div>
    );
  }
}

export default compose<JoinedProps, {}>(
  withRouter,
  injectIntl,
  injectDrawer,
  injectNotifications,
)(EmailTemplatesPage);
