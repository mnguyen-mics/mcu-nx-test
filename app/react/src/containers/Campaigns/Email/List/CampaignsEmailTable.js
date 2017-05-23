import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Icon, Modal, Tooltip } from 'antd';
import { FormattedMessage } from 'react-intl';

import { TableView, EmptyTableView } from '../../../../components/TableView';
import { McsIcons } from '../../../../components/McsIcons';

import * as CampaignsEmailActions from '../../../../state/Campaigns/Email/actions';

import { EMAIL_SEARCH_SETTINGS } from './constants';

import {
  updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearchs
} from '../../../../utils/LocationSearchHelper';

import { formatMetric } from '../../../../utils/MetricHelper';
import { campaignStatuses } from '../../constants';
import { getTableDataSource } from '../../../../state/Campaigns/Email/selectors';

class CampaignsEmailTable extends Component {

  constructor(props) {
    super(props);
    this.updateLocationSearch = this.updateLocationSearch.bind(this);
    this.archiveCampaign = this.archiveCampaign.bind(this);
    this.editCampaign = this.editCampaign.bind(this);
  }

  componentDidMount() {
    const {
      history,
      location: {
        search,
        pathname
      },
      match: {
        params: {
          organisationId
        }
      },
      loadCampaignsEmailDataSource
    } = this.props;

    if (!isSearchValid(search, EMAIL_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, EMAIL_SEARCH_SETTINGS),
        state: { reloadDataSource: true }
      });
    } else {
      const filter = parseSearch(search, EMAIL_SEARCH_SETTINGS);
      loadCampaignsEmailDataSource(organisationId, filter, true);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      location: {
        search
      },
      match: {
        params: {
          organisationId
        }
      },
      history,
      loadCampaignsEmailDataSource
    } = this.props;

    const {
      location: {
        pathname: nextPathname,
        search: nextSearch,
        state
      },
      match: {
        params: {
          organisationId: nextOrganisationId
        }
      }
    } = nextProps;

    const checkEmptyDataSource = state && state.reloadDataSource;

    if (!compareSearchs(search, nextSearch) || organisationId !== nextOrganisationId) {
      if (!isSearchValid(nextSearch, EMAIL_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, EMAIL_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== nextOrganisationId }
        });
      } else {
        const filter = parseSearch(nextSearch, EMAIL_SEARCH_SETTINGS);
        loadCampaignsEmailDataSource(nextOrganisationId, filter, checkEmptyDataSource);
      }
    }
  }

  componentWillUnmount() {
    this.props.resetCampaignsEmailTable();
  }

  updateLocationSearch(params) {
    const {
      history,
      location: {
        search: currentSearch,
        pathname
      }
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, EMAIL_SEARCH_SETTINGS)
    };

    history.push(nextLocation);
  }

  render() {
    const {
      match: {
        params: {
          organisationId
        }
      },
      location: {
        search
      },
      translations,
      isFetchingCampaignsEmail,
      isFetchingCampaignsStat,
      dataSource,
      totalCampaignsEmail,
      hasEmailCampaigns,
    } = this.props;

    const filter = parseSearch(search, EMAIL_SEARCH_SETTINGS);

    const searchOptions = {
      isEnabled: true,
      placeholder: translations.SEARCH_CAMPAIGNS_EMAIL,
      onSearch: value => this.updateLocationSearch({
        keywords: value
      }),
      defaultValue: filter.keywords
    };

    const dateRangePickerOptions = {
      isEnabled: true,
      onChange: (values) => this.updateLocationSearch({
        rangeType: values.rangeType,
        lookbackWindow: values.lookbackWindow,
        from: values.from,
        to: values.to,
      }),
      values: {
        rangeType: filter.rangeType,
        lookbackWindow: filter.lookbackWindow,
        from: filter.from,
        to: filter.to
      }
    };

    const columnsVisibilityOptions = {
      isEnabled: true
    };

    const pagination = {
      currentPage: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalCampaignsEmail,
      onChange: (page) => this.updateLocationSearch({
        currentPage: page
      }),
      onShowSizeChange: (current, size) => this.updateLocationSearch({
        pageSize: size
      })
    };

    const renderMetricData = (value, numeralFormat, currency = '') => {
      if (isFetchingCampaignsStat) {
        return (<i className="mcs-loading" />); // (<span>loading...</span>);
      }
      const unlocalizedMoneyPrefix = currency === 'EUR' ? '€ ' : '';
      return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
    };

    const dataColumns = [
      {
        translationKey: 'STATUS',
        key: 'status',
        isHiddable: false,
        render: text => <Tooltip placement="top" title={translations[text]}><span className={`mcs-campaigns-status-${text.toLowerCase()}`}><McsIcons type="status" /></span></Tooltip>
      },
      {
        translationKey: 'NAME',
        key: 'name',
        isHiddable: false,
        render: (text, record) => <Link className="mcs-campaigns-link" to={`/v2/o/${organisationId}/campaigns/email/report/${record.id}/basic`}>{text}</Link>
      },
      {
        translationKey: 'EMAIL_SENT',
        key: 'email_sent',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0')
      },
      {
        translationKey: 'EMAIL_HARD_BOUNCED',
        key: 'email_hard_bounced',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0')
      },
      {
        translationKey: 'EMAIL_SOFT_BOUNCED',
        key: 'email_soft_bounced',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0')
      },
      {
        translationKey: 'CLICKS',
        key: 'clicks',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0')
      },
      {
        translationKey: 'IMPRESSIONS',
        key: 'impressions',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0')
      }
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.editCampaign
          }, {
            translationKey: 'ARCHIVE',
            callback: this.archiveCampaign
          }
        ]
      }
    ];

    const statusItems = campaignStatuses.map(status => ({ key: status, value: status }));

    const filtersOptions = [
      {
        name: 'status',
        displayElement: (<div><FormattedMessage id="STATUS" /> <Icon type="down" /></div>),
        menuItems: {
          handleMenuClick: value => {
            this.updateLocationSearch({
              statuses: value.status.map(item => item.value)
            });
          },
          selectedItems: filter.statuses.map(status => ({ key: status, value: status })),
          items: statusItems
        }
      }
    ];

    const columnsDefinitions = {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: actionColumns
    };

    return (hasEmailCampaigns) ? (<TableView
      columnsDefinitions={columnsDefinitions}
      dataSource={dataSource}
      loading={isFetchingCampaignsEmail}
      onChange={() => {}}
      searchOptions={searchOptions}
      dateRangePickerOptions={dateRangePickerOptions}
      filtersOptions={filtersOptions}
      columnsVisibilityOptions={columnsVisibilityOptions}
      pagination={pagination}
    />) : (<EmptyTableView icon="email" text="EMPTY_EMAILS" />);

  }

  editCampaign(campaign) {
    const {
      match: {
        params: {
          organisationId
        }
      },
      history
    } = this.props;

    history.push(`/v2/o/${organisationId}/campaigns/email/report/${campaign.id}/basic`);
  }

  archiveCampaign(campaign) {
    const {
      match: {
        params: {
          organisationId
        }
      },
      location: {
        search
      },
      archiveCampaignEmail,
      loadCampaignsEmailDataSource,
      translations
    } = this.props;

    const filter = parseSearch(search, EMAIL_SEARCH_SETTINGS);

    Modal.confirm({
      title: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_TITLE,
      content: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_BODY,
      iconType: 'exclamation-circle',
      okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
      cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
      onOk() {
        return archiveCampaignEmail(campaign.id).then(() => {
          loadCampaignsEmailDataSource(organisationId, filter);
        });
      },
      onCancel() { },
    });
  }

}

CampaignsEmailTable.defaultProps = {
  archiveCampaignEmail: () => {}
};

CampaignsEmailTable.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,

  hasEmailCampaigns: PropTypes.bool.isRequired,
  isFetchingCampaignsEmail: PropTypes.bool.isRequired,
  isFetchingCampaignsStat: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalCampaignsEmail: PropTypes.number.isRequired,

  loadCampaignsEmailDataSource: PropTypes.func.isRequired,
  archiveCampaignEmail: PropTypes.func,
  resetCampaignsEmailTable: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  translations: state.translations,

  hasEmailCampaigns: state.campaignsEmailTable.campaignsEmailApi.hasItems,
  isFetchingCampaignsEmail: state.campaignsEmailTable.campaignsEmailApi.isFetching,
  isFetchingCampaignsStat: state.campaignsEmailTable.deliveryReportApi.isFetching,
  dataSource: getTableDataSource(state),
  totalCampaignsEmail: state.campaignsEmailTable.campaignsEmailApi.total,
});

const mapDispatchToProps = {
  loadCampaignsEmailDataSource: CampaignsEmailActions.loadCampaignsEmailDataSource,
  // archiveCampaignEmail: CampaignEmailAction.archiveCampaignEmail,
  resetCampaignsEmailTable: CampaignsEmailActions.resetCampaignsEmailTable,
};

CampaignsEmailTable = connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignsEmailTable);

CampaignsEmailTable = withRouter(CampaignsEmailTable);

export default CampaignsEmailTable;
