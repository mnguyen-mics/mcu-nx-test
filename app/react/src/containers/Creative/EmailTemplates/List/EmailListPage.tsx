import * as React from 'react';
import { Layout, message } from 'antd';
import { compose } from 'recompose';
import { connect } from 'react-redux';

import EmailActionBar from './EmailActionBar';
import EmailList from './EmailList';
import { CampaignRouteParams } from '../../../../models/campaign/CampaignResource';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import CreativeService, {
  GetCreativesOptions,
} from '../../../../services/CreativeService';
import { InjectDrawerProps } from '../../../../components/Drawer/injectDrawer';
import { injectDrawer } from '../../../../components/Drawer/index';
import {
  getEmailTemplates,
  isFetchingEmailTemplates,
  hasEmailTemplates,
  getEmailTemplatesTotal,
} from '../../../../state/Creatives/Emails/selectors';
import {
  parseSearch,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';
import { CREATIVE_EMAIL_SEARCH_SETTINGS } from './constants';
import * as CreativeEmailsActions from '../../../../state/Creatives/Emails/actions';
import { TranslationProps } from '../../../Helpers/withTranslations';
import { Filters } from '../../../../components/ItemList';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';

const messages = defineMessages({
  archiveSuccess: {
    id: 'archive.email.success.msg',
    defaultMessage: 'Email templates successfully archived',
  },
});

const { Content } = Layout;

export interface MapDispatchToProps {
  fetchCreativeEmails: (
    organisationId: string,
    filter: Filters,
    bool?: boolean,
  ) => void;
  resetCreativeEmails: () => void;
}

export interface MapStateToProps extends TranslationProps {
  hasCreativeEmails: boolean;
  isFetchingCreativeEmails: boolean;
  dataSource: object[]; // type better
  totalCreativeEmails: number;
}

interface EmailListPageState {
  selectedRowKeys: string[];
  isArchiveModalVisible: boolean;
  allRowsAreSelected: boolean;
}

type JoinedProps = InjectedIntlProps &
  MapStateToProps &
  MapDispatchToProps &
  InjectDrawerProps &
  InjectedNotificationProps &
  RouteComponentProps<CampaignRouteParams>;

class EmailListPage extends React.Component<JoinedProps, EmailListPageState> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      isArchiveModalVisible: false,
      allRowsAreSelected: false,
    };
  }
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
      totalCreativeEmails,
      match: { params: { organisationId } },
      notifyError,
    } = this.props;
    const options: GetCreativesOptions = {
      creative_type: 'EMAIL_TEMPLATE',
      archived: false,
      max_results: totalCreativeEmails, // not mandatory
    };
    const allEmailTemplatesIds: string[] = [];
    return CreativeService.getEmailTemplates(organisationId, options)
      .then(apiResp => {
        apiResp.data.forEach((emailTemplateResource, index) => {
          allEmailTemplatesIds.push(emailTemplateResource.id);
        });
        return allEmailTemplatesIds;
      })
      .catch(err => {
        notifyError(err);
      });
  };

  redirectAndNotify = () => {
    const {
      location: { search, pathname, state },
      history,
      intl,
      match: { params: { organisationId } },
      dataSource,
    } = this.props;
    const filter = parseSearch(search, CREATIVE_EMAIL_SEARCH_SETTINGS);
    if (dataSource.length === 1 && filter.currentPage !== 1) {
      const newFilter = {
        ...filter,
        currentPage: 1,
      };
      this.props.fetchCreativeEmails(organisationId, filter, true);
      history.push({
        pathname: pathname,
        search: updateSearch(search, newFilter),
        state: state,
      });
    } else {
      this.props.fetchCreativeEmails(organisationId, filter, true);
    }

    this.setState({
      isArchiveModalVisible: false,
      selectedRowKeys: [],
    });
    message.success(intl.formatMessage(messages.archiveSuccess));
  };

  makeArchiveAction = (emailTemplateIds: string[]) => {
    return Promise.all(
      emailTemplateIds.map(emailTemplateId => {
        return CreativeService.getEmailTemplate(emailTemplateId)
          .then(apiResp => apiResp.data)
          .then(emailTemplateData => {
            return CreativeService.updateEmailTemplate(emailTemplateId, {
              ...emailTemplateData,
              archived: true,
            });
          });
      }),
    ).then(() => {
      this.redirectAndNotify();
    });
  };

  handleOk = () => {
    const { selectedRowKeys, allRowsAreSelected } = this.state;

    if (allRowsAreSelected) {
      return this.getAllEmailTemplatesIds().then(
        (allTemplatesIds: string[]) => {
          this.makeArchiveAction(allTemplatesIds);
        },
      );
    } else {
      return this.makeArchiveAction(selectedRowKeys);
    }
  };

  render() {
    const { selectedRowKeys } = this.state;
    const {
      hasCreativeEmails,
      isFetchingCreativeEmails,
      dataSource,
      totalCreativeEmails,
      fetchCreativeEmails,
      resetCreativeEmails,
    } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      selectAllItemIds: this.selectAllItemIds,
      unselectAllItemIds: this.unselectAllItemIds,
    };

    const multiEditProps = {
      archiveEmails: this.archiveEmails,
      isArchiveModalVisible: this.state.isArchiveModalVisible,
      handleOk: this.handleOk,
      handleCancel: this.handleCancel,
    };

    const reduxProps = {
      hasCreativeEmails,
      isFetchingCreativeEmails,
      dataSource,
      totalCreativeEmails,
      fetchCreativeEmails,
      resetCreativeEmails,
    };

    return (
      <div className="ant-layout">
        <EmailActionBar
          rowSelection={rowSelection}
          multiEditProps={multiEditProps}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <EmailList rowSelection={rowSelection} {...reduxProps} />
          </Content>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: MapStateToProps) => ({
  hasCreativeEmails: hasEmailTemplates(state),
  isFetchingCreativeEmails: isFetchingEmailTemplates(state),
  dataSource: getEmailTemplates(state),
  totalCreativeEmails: getEmailTemplatesTotal(state),
});

const mapDispatchToProps = {
  fetchCreativeEmails: CreativeEmailsActions.fetchCreativeEmails.request,
  resetCreativeEmails: CreativeEmailsActions.resetCreativeEmails,
};
export default compose<JoinedProps, {}>(
  withRouter,
  injectIntl,
  injectDrawer,
  injectNotifications,
  connect(mapStateToProps, mapDispatchToProps),
)(EmailListPage);
