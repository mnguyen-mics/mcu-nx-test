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
  getEmailTemplatesTotal,
} from '../../../../state/Creatives/Emails/selectors';
import { EmailTemplateResource } from '../../../../models/creative/CreativeResource';
import {
  parseSearch,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';
import { CREATIVE_EMAIL_SEARCH_SETTINGS } from './constants';

const messages = defineMessages({
  archiveSuccess: {
    id: 'archive.email.success.msg',
    defaultMessage: 'Email templates successfully archived',
  },
});

const { Content } = Layout;

interface EmailListPageProps {}

interface EmailListPageState {
  selectedRowKeys: string[];
  isArchiveModalVisible: boolean;
  allRowsAreSelected: boolean;
}

interface MapStateToProps {
  totalEmailTemplate: number;
  dataSource: EmailTemplateResource[];
}

type JoinedProps = EmailListPageProps &
  InjectedIntlProps &
  MapStateToProps &
  InjectDrawerProps &
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

  handleOk = () => {
    const { selectedRowKeys, allRowsAreSelected } = this.state;

    const {
      location: { search, pathname, state },
      history,
      intl,
      totalEmailTemplate,
      match: { params: { organisationId } },
    } = this.props;

    const filter = parseSearch(search, CREATIVE_EMAIL_SEARCH_SETTINGS);

    if (allRowsAreSelected) {
      const options: GetCreativesOptions = {
        creative_type: 'EMAIL_TEMPLATE',
        archived: false,
        max_results: totalEmailTemplate, // not mandatory
      };
      const emailtemplateIds: string[] = [];
      return CreativeService.getEmailTemplates(organisationId, options).then(
        apiResp => {
          apiResp.data.forEach((emailTemplateResource, index) => {
            emailtemplateIds.push(emailTemplateResource.id);
          });
          return Promise.all(
            emailtemplateIds.map(creativeId => {
              CreativeService.getEmailTemplate(creativeId)
                .then(apiResponse => apiResponse.data)
                .then(emailData => {
                  CreativeService.updateEmailTemplate(creativeId, {
                    ...emailData,
                    archived: true,
                  });
                });
            }),
          ).then(() => {
            if (filter.currentPage !== 1) {
              const newFilter = {
                ...filter,
                currentPage: 1,
              };
              history.push({
                pathname: pathname,
                search: updateSearch(search, newFilter),
                state: state,
              });
            } else {
              window.location.reload();
            }

            this.setState({
              isArchiveModalVisible: false,
              selectedRowKeys: [],
            });
            message.success(intl.formatMessage(messages.archiveSuccess));
          });
        },
      );
    } else {
      return Promise.all(
        selectedRowKeys.map(creativeId => {
          CreativeService.getEmailTemplate(creativeId)
            .then(apiResp => apiResp.data)
            .then(emailData => {
              CreativeService.updateEmailTemplate(creativeId, {
                ...emailData,
                archived: true,
              });
            });
        }),
      ).then(() => {
        if (filter.currentPage !== 1) {
          const newFilter = {
            ...filter,
            currentPage: 1,
          };
          history.push({
            pathname: pathname,
            search: updateSearch(search, newFilter),
            state: state,
          });
        } else {
          // setTimeout is used in order to see message.success when archiving on page 1
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }

        this.setState({
          isArchiveModalVisible: false,
          selectedRowKeys: [],
        });
        message.success(intl.formatMessage(messages.archiveSuccess));
      });
    }
  };

  render() {
    const { selectedRowKeys } = this.state;
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

    return (
      <div className="ant-layout">
        <EmailActionBar
          rowSelection={rowSelection}
          multiEditProps={multiEditProps}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <EmailList rowSelection={rowSelection} />
          </Content>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: MapStateToProps) => ({
  totalEmailTemplate: getEmailTemplatesTotal(state),
  dataSource: getEmailTemplates(state),
});

export default compose<JoinedProps, EmailListPageProps>(
  withRouter,
  injectIntl,
  injectDrawer,
  connect(mapStateToProps, undefined),
)(EmailListPage);
