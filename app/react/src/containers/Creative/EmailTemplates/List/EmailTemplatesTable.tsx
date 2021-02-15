import * as React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { RouteComponentProps } from 'react-router';
import {
  TableViewFilters,
} from '../../../../components/TableView/index';
import EmailTestModal from './EmailTestModal';
import { CREATIVE_EMAIL_SEARCH_SETTINGS } from './constants';
import {
  updateSearch,
  parseSearch,
} from '../../../../utils/LocationSearchHelper';
import messagesMap from '../../DisplayAds/List/message';
import CreativeScreenshot from '../../CreativeScreenshot';
import { CampaignRouteParams } from '../../../../models/campaign/CampaignResource';
import { Filters } from '../../../../components/ItemList';
import { EmailTemplateResource } from '../../../../models/creative/CreativeResource';
import {
  ExtendedTableRowSelection,
  ActionsColumnDefinition,
} from '../../../../components/TableView/TableView';
import { EmptyTableView } from '@mediarithmics-private/mcs-components-library';

interface EmailTemplatesTableProps {
  rowSelection: ExtendedTableRowSelection;
  isLoadingEmailTemplates: boolean;
  dataSource: EmailTemplateResource[];
  totalEmailTemplates: number;
  hasEmailTemplates: boolean;
  archiveEmailTemplate: (emailTemplate: EmailTemplateResource) => void;
}

interface State {
  modalVisible: boolean;
  inputValue: string[];
  selectedtemplateId: string;
}

type JoinedProps = EmailTemplatesTableProps &
  RouteComponentProps<CampaignRouteParams> &
  InjectedIntlProps;

class EmailTemplatesTable extends React.Component<JoinedProps, State> {

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      modalVisible: false,
      selectedtemplateId: '',
      inputValue: [],
    };
  }

  updateLocationSearch(params: Filters) {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(
        currentSearch,
        params,
        CREATIVE_EMAIL_SEARCH_SETTINGS,
      ),
    };

    history.push(nextLocation);
  }

  viewTestModal = (template: EmailTemplateResource) => {
    this.setState({ modalVisible: true, selectedtemplateId: template.id });
  };

  handleCancel = () => {
    this.setState({ modalVisible: false, selectedtemplateId: '' });
  };

  editEmailTemplate = (campaign: EmailTemplateResource) => {
    const {
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;

    history.push(`/v2/o/${organisationId}/creatives/email/${campaign.id}/edit`);
  }

  render() {
    const {
      match: {
        params: { organisationId },
      },
      location: { search },
      isLoadingEmailTemplates,
      dataSource,
      totalEmailTemplates,
      hasEmailTemplates,
      archiveEmailTemplate,
      rowSelection,
      intl,
    } = this.props;

    const filter = parseSearch(search, CREATIVE_EMAIL_SEARCH_SETTINGS);

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalEmailTemplates,
      onChange: (page: number, size: number) => {
        this.updateLocationSearch({
          currentPage: page,
          pageSize: size
        });
        if (
          rowSelection &&
          rowSelection.unselectAllItemIds &&
          rowSelection.allRowsAreSelected
        ) {
          rowSelection.unselectAllItemIds();
        }
      },
      onShowSizeChange: (current: number, size: number) =>
        this.updateLocationSearch({
          pageSize: size,
          currentPage: 1,
        }),
    };

    const dataColumns = [
      {
        intlMessage: messagesMap.preview,
        key: 'asset_path',
        isHideable: false,
        className: 'mcs-table-image-col',
        render: (text: string, record: EmailTemplateResource) => (
          <CreativeScreenshot item={record} />
        ),
      },
      {
        intlMessage: messagesMap.name,
        key: 'name',
        isHideable: false,
        render: (text: string, record: any) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/creatives/email/${record.id}/edit`}
          >
            {text}
          </Link>
        ),
      },
      {
        intlMessage: messagesMap.auditStatus,
        key: 'audit_status',
        isHideable: false,
        render: (text: string) => <span>{text}</span>,
      },
      {
        intlMessage: messagesMap.publishedVersion,
        key: 'published_version',
        isHideable: false,
        render: (text: string) => <span>{text}</span>,
      },
    ];

    const actionColumns: Array<
      ActionsColumnDefinition<EmailTemplateResource>
    > = [
      {
        key: 'action',
        actions: () => [
          {
            intlMessage: messagesMap.sendTest,
            callback: this.viewTestModal,
          },
          {
            intlMessage: messagesMap.edit,
            callback: this.editEmailTemplate,
          },
          {
            intlMessage: messagesMap.archive,
            callback: archiveEmailTemplate,
          },
        ],
      },
    ];

    const searchOptions = {
      placeholder: intl.formatMessage(messagesMap.searchPlaceholderEmail),
      onSearch: (value: string) =>
        this.updateLocationSearch({
          keywords: value,
          currentPage: 1,
        }),
      defaultValue: filter.keywords,
    };

    return hasEmailTemplates ? (
      <div className="mcs-table-container">
        <EmailTestModal
          organisationId={this.props.match.params.organisationId}
          isModalVisible={this.state.modalVisible}
          selectedtemplateId={this.state.selectedtemplateId}
          handleCancel={this.handleCancel}
        />
        <TableViewFilters
          columns={dataColumns}
          actionsColumnsDefinition={actionColumns}
          dataSource={dataSource}
          loading={isLoadingEmailTemplates}
          pagination={pagination}
          rowSelection={rowSelection}
          searchOptions={searchOptions}
        />
      </div>
    ) : (
      <EmptyTableView iconType="email" message={intl.formatMessage(messagesMap.noEmailTemplate)} />
    );
  }
}

export default compose<JoinedProps, EmailTemplatesTableProps>(
  withRouter,
  injectIntl,
)(EmailTemplatesTable);
