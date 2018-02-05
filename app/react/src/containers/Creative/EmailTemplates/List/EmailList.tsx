import * as React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Modal } from 'antd';
import { compose } from 'recompose';

import {
  TableViewFilters,
  EmptyTableView,
} from '../../../../components/TableView/index';
import EmailTestModal from './EmailTestModal';

import * as CreativeEmailsActions from '../../../../state/Creatives/Emails/actions';

import { CREATIVE_EMAIL_SEARCH_SETTINGS } from './constants';
import {
  updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../../utils/LocationSearchHelper';

import {
  getEmailTemplates,
  isFetchingEmailTemplates,
  hasEmailTemplates,
  getEmailTemplatesTotal,
} from '../../../../state/Creatives/Emails/selectors';
import CreativeScreenshot from '../../CreativeScreenshot';
import { CampaignRouteParams } from '../../../../models/campaign/CampaignResource';
import { RouteComponentProps } from 'react-router';
import { Filters } from '../../../../components/ItemList';
import { EmailTemplateResource } from '../../../../models/creative/CreativeResource';
import { withTranslations } from '../../../Helpers/index';
import { TranslationProps } from '../../../Helpers/withTranslations';
import { injectIntl } from 'react-intl';

interface CreativeEmailsTableProps {
  rowSelection: {
    selectedRowKeys: string[];
    onChange: (selectedRowKeys: string[]) => void;
    unselectAllItemIds: () => void;
  };
}

interface MapDispatchToProps {
  fetchCreativeEmails: (
    organisationId: string,
    filter: Filters,
    bool?: boolean,
  ) => void;
  archiveCreativeEmails: (campaignId: string) => any;
  resetCreativeEmails: () => void;
}

interface MapStateToProps extends TranslationProps {
  hasCreativeEmails: boolean;
  isFetchingCreativeEmails: boolean;
  dataSource: object[]; // type better
  totalCreativeEmails: number;
}

interface CreativeEmailsTableState {
  modalVisible: boolean;
  inputValue: string[];
  selectedtemplateId: string;
}

type JoinedProps = CreativeEmailsTableProps &
  RouteComponentProps<CampaignRouteParams> &
  TranslationProps &
  MapStateToProps &
  MapDispatchToProps;

class CreativeEmailsTable extends React.Component<
  JoinedProps,
  CreativeEmailsTableState
> {
  constructor(props: JoinedProps) {
    super(props);
    this.updateLocationSearch = this.updateLocationSearch.bind(this);
    this.archiveCreativeEmails = this.archiveCreativeEmails.bind(this);
    this.editCreativeEmails = this.editCreativeEmails.bind(this);
    this.state = {
      modalVisible: false,
      selectedtemplateId: '',
      inputValue: [],
    };
  }

  componentDidMount() {
    const {
      history,
      location: { search, pathname },
      match: { params: { organisationId } },
      fetchCreativeEmails,
    } = this.props;

    if (!isSearchValid(search, CREATIVE_EMAIL_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, CREATIVE_EMAIL_SEARCH_SETTINGS),
        state: { reloadDataSource: true },
      });
    } else {
      const filter = parseSearch(search, CREATIVE_EMAIL_SEARCH_SETTINGS);
      fetchCreativeEmails(organisationId, filter, true);
    }
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const {
      location: { search },
      match: { params: { organisationId } },
      history,
      fetchCreativeEmails,
    } = this.props;

    const {
      location: { pathname: nextPathname, search: nextSearch, state },
      match: { params: { organisationId: nextOrganisationId } },
    } = nextProps;

    const checkEmptyDataSource = state && state.reloadDataSource;

    if (
      !compareSearches(search, nextSearch) ||
      organisationId !== nextOrganisationId
    ) {
      if (!isSearchValid(nextSearch, CREATIVE_EMAIL_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(
            nextSearch,
            CREATIVE_EMAIL_SEARCH_SETTINGS,
          ),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
        });
      } else {
        const filter = parseSearch(nextSearch, CREATIVE_EMAIL_SEARCH_SETTINGS);
        fetchCreativeEmails(nextOrganisationId, filter, checkEmptyDataSource);
      }
    }
  }

  componentWillUnmount() {
    this.props.resetCreativeEmails();
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

  render() {
    const {
      match: { params: { organisationId } },
      location: { search },
      isFetchingCreativeEmails,
      dataSource,
      totalCreativeEmails,
      hasCreativeEmails,
      rowSelection,
    } = this.props;

    const filter = parseSearch(search, CREATIVE_EMAIL_SEARCH_SETTINGS);

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalCreativeEmails,
      onChange: (page: number) =>
        this.updateLocationSearch({
          currentPage: page,
        }),
      onShowSizeChange: (current: number, size: number) =>
        this.updateLocationSearch({
          pageSize: size,
          currentPage: 1,
        }),
    };

    const dataColumns = [
      {
        translationKey: 'PREVIEW',
        key: 'asset_path',
        isHideable: false,
        className: 'mcs-table-image-col',
        render: (
          text: string,
          record: any, // check type
        ) => <CreativeScreenshot item={record} />,
      },
      {
        translationKey: 'NAME',
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
        translationKey: 'AUDIT_STATUS',
        key: 'audit_status',
        isHideable: false,
        render: (text: string) => <span>{text}</span>,
      },
      {
        translationKey: 'PUBLISHED_VERSION',
        key: 'published_version',
        isHideable: false,
        render: (text: string) => <span>{text}</span>,
      },
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'SEND_TEST',
            callback: this.viewTestModal,
          },
          {
            translationKey: 'EDIT',
            callback: this.editCreativeEmails,
          },
          {
            translationKey: 'ARCHIVE',
            callback: this.archiveCreativeEmails,
          },
        ],
      },
    ];

    return hasCreativeEmails ? (
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
          loading={isFetchingCreativeEmails}
          pagination={pagination}
          rowSelection={rowSelection}
        />
      </div>
    ) : (
      <EmptyTableView iconType="email" text="EMPTY_CREATIVES_EMAIL" />
    );
  }

  editCreativeEmails(campaign: EmailTemplateResource) {
    const { match: { params: { organisationId } }, history } = this.props;

    history.push(`/v2/o/${organisationId}/creatives/email/${campaign.id}/edit`);
  }

  archiveCreativeEmails(campaign: EmailTemplateResource) {
    const {
      match: { params: { organisationId } },
      location: { search },
      archiveCreativeEmails,
      fetchCreativeEmails,
      translations,
    } = this.props;

    const filter = parseSearch(search, CREATIVE_EMAIL_SEARCH_SETTINGS);

    Modal.confirm({
      title: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_TITLE,
      content: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_BODY,
      iconType: 'exclamation-circle',
      okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
      cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
      onOk() {
        return archiveCreativeEmails(campaign.id).then(() => {
          fetchCreativeEmails(organisationId, filter);
        });
      },
      onCancel() {
        //
      },
    });
  }
}

const mapStateToProps = (state: MapStateToProps) => ({
  translations: state.translations,
  hasCreativeEmails: hasEmailTemplates(state),
  isFetchingCreativeEmails: isFetchingEmailTemplates(state),
  dataSource: getEmailTemplates(state),
  totalCreativeEmails: getEmailTemplatesTotal(state),
});

const mapDispatchToProps = {
  fetchCreativeEmails: CreativeEmailsActions.fetchCreativeEmails.request,
  // archiveCreativeEmails: CreativeEmailsActions.archiveCreativeEmails,
  resetCreativeEmails: CreativeEmailsActions.resetCreativeEmails,
};

export default compose<JoinedProps, CreativeEmailsTableProps>(
  withRouter,
  withTranslations,
  injectIntl,
  connect(mapStateToProps, mapDispatchToProps),
)(CreativeEmailsTable);
