import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import lodash from 'lodash';
import Link from 'react-router/lib/Link';
import { Modal } from 'antd';

import { TableView } from '../../../../components/TableView';

import * as CreativeEmailsActions from '../../../../state/Creatives/Emails/actions';

import {
  CREATIVE_EMAILS_LIST_SETTINGS,

  updateQueryWithParams,
  deserializeQuery
} from '../../RouteQuerySelector';

import {
  getTableDataSource
 } from '../../../../state/Creatives/Emails/selectors';

class CreativeEmailsTable extends Component {

  constructor(props) {
    super(props);
    this.updateQueryParams = this.updateQueryParams.bind(this);
    this.archiveCreativeEmails = this.archiveCreativeEmails.bind(this);
    this.editCreativeEmails = this.editCreativeEmails.bind(this);
  }

  componentDidMount() {
    const {
      activeWorkspace: {
        organisationId
      },
      query,

      fetchCreativeEmails
    } = this.props;

    const filter = deserializeQuery(query, CREATIVE_EMAILS_LIST_SETTINGS);
    fetchCreativeEmails(organisationId, filter);
  }

  componentWillReceiveProps(nextProps) {
    const {
      query,
      activeWorkspace: {
        workspaceId
      },

      fetchCreativeEmails
    } = this.props;

    const {
      query: nextQuery,
      activeWorkspace: {
        workspaceId: nextWorkspaceId,
        organisationId
      },
    } = nextProps;

    if (!lodash.isEqual(query, nextQuery) || workspaceId !== nextWorkspaceId) {
      const filter = deserializeQuery(nextQuery, CREATIVE_EMAILS_LIST_SETTINGS);
      fetchCreativeEmails(organisationId, filter);
    }
  }

  componentWillUnmount() {
    this.props.resetCreativeEmailsTable();
  }

  updateQueryParams(params) {
    const {
      router,
      query: currentQuery
    } = this.props;

    const location = router.getCurrentLocation();
    router.replace({
      pathname: location.pathname,
      query: updateQueryWithParams(currentQuery, params, CREATIVE_EMAILS_LIST_SETTINGS)
    });
  }

  render() {
    const {
      query,
      activeWorkspace: {
        workspaceId
      },
      isFetchingCreativeEmails,
      dataSource,
      totalCreativeEmails
    } = this.props;

    const filter = deserializeQuery(query, CREATIVE_EMAILS_LIST_SETTINGS);

    const pagination = {
      currentPage: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalCreativeEmails,
      onChange: (page) => this.updateQueryParams({
        currentPage: page
      }),
      onShowSizeChange: (current, size) => this.updateQueryParams({
        pageSize: size
      })
    };


    const dataColumns = [
      {
        translationKey: 'PREVIEW',
        key: 'asset_path',
        isHiddable: false,
        className: 'mcs-table-image-col',
        render: (text, record) => <div className="mics-small-thumbnail"><a target="_blank" rel="noreferrer noopener" href={`https://ads.mediarithmics.com/ads/screenshot?rid=${record.id}`} ><span className="thumbnail-helper" /><img src={`https://ads.mediarithmics.com/ads/screenshot?rid=${record.id}`} alt={record.name} /></a></div>
      },
      {
        translationKey: 'NAME',
        key: 'name',
        isHiddable: false,
        render: (text, record) => <Link className="mcs-campaigns-link" to={`/${workspaceId}/creatives/display-ad/default-editor/edit/${record.id}`}>{text}</Link>
      },
      {
        translationKey: 'AUDIT_STATUS',
        key: 'audit_status',
        isHiddable: false,
        render: (text) => <span>{text}</span>
      },
      {
        translationKey: 'PUBLISHED_VERSION',
        key: 'published_version',
        isHiddable: false,
        render: (text) => <span>{text}</span>
      }
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.editCreativeEmails
          }, {
            translationKey: 'ARCHIVE',
            callback: this.archiveCreativeEmails
          }
        ]
      }
    ];

    const columnsDefinitions = {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: actionColumns
    };

    return (<TableView
      columnsDefinitions={columnsDefinitions}
      dataSource={dataSource}
      loading={isFetchingCreativeEmails}
      onChange={() => {}}
      pagination={pagination}
    />);

  }

  editCreativeEmails(campaign) {
    const {
      activeWorkspace: {
        workspaceId
      },
      router
    } = this.props;

    router.push(`/${workspaceId}/creatives/display-ad/default-editor/edit/${campaign.id}`);
  }

  archiveCreativeEmails(campaign) {
    const {
      activeWorkspace: {
        organisationId
      },
      archiveCreativeEmails,
      fetchCreativeEmails,
      translations,
      query
    } = this.props;

    const filter = deserializeQuery(query, CREATIVE_EMAILS_LIST_SETTINGS);

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
      onCancel() { },
    });
  }

}

CreativeEmailsTable.defaultProps = {
  archiveCreativeEmails: () => { }
};

CreativeEmailsTable.propTypes = {
  router: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  query: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

  isFetchingCreativeEmails: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalCreativeEmails: PropTypes.number.isRequired,

  fetchCreativeEmails: PropTypes.func.isRequired,
  archiveCreativeEmails: PropTypes.func.isRequired,
  resetCreativeEmailsTable: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  activeWorkspace: state.sessionState.activeWorkspace,
  query: ownProps.router.location.query,
  translations: state.translationsState.translations,

  isFetchingCreativeEmails: state.creativeEmailsTable.creativeEmailsApi.isFetching,
  dataSource: getTableDataSource(state),
  totalCreativeEmails: state.creativeEmailsTable.creativeEmailsApi.total,
});

const mapDispatchToProps = {
  fetchCreativeEmails: CreativeEmailsActions.fetchCreativeEmails.request,
  // archiveCreativeEmails: CreativeEmailsActions.archiveCreativeEmails,
  resetCreativeEmailsTable: CreativeEmailsActions.resetCreativeEmailsTable
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreativeEmailsTable);
