import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Row, Col, Table, Icon, Input, DatePicker, Dropdown, Menu, Modal } from 'antd';
import * as CampaignsTableViewActions from './redux/CampaignsTableViewActions';
import * as sessionActions from '../../services/session/SessionActions';

const Search = Input.Search;
const { RangePicker } = DatePicker;
const confirm = Modal.confirm;

const dateFormat = 'DD/MM/YYYY';
const twentyDaysAgo = moment(moment().subtract(20, 'days').calendar()).format(dateFormat);
const now = moment(new Date()).format(dateFormat);


class CampaignTableView extends Component {

  constructor(props) {
    super(props);
    this.fetchCampaignsWithProps = this.fetchCampaignsWithProps.bind(this);
    this.fetchCampaignsPerformanceWithProps = this.fetchCampaignsPerformanceWithProps.bind(this);
    this.onDateRangeChange = this.onDateRangeChange.bind(this);
    this.archiveCampaign = this.archiveCampaign.bind(this);
    this.state = {
      inputVisible: false,
      startDate: twentyDaysAgo,
      endDate: now,
      inputValue: '',
      modalVisible: false,
    };
  }

  componentDidMount() {
    this.fetchCampaignsWithProps();
  }

  render() {
    const {
      campaigns,
      campaignsPerformance,
      isSearchEnabled,
      isDateRangePickerEnabled,
      isFetching,
      isFetchingCampaignsPerformance,
      hasSearched,
      filteredCampaigns,
    } = this.props;

    campaigns.sort((a, b) => {
      if (a.name.toUpperCase() < b.name.toUpperCase()) {
        return -1;
      }
      if (a.name.toUpperCase() > b.name.toUpperCase()) {
        return 1;
      }
      return 0;
    });

    campaigns.sort((a, b) => {
      if (a.status.toUpperCase() < b.status.toUpperCase()) {
        return -1;
      }
      if (a.status.toUpperCase() > b.status.toUpperCase()) {
        return 1;
      }
      return 0;
    });

    this.formatCampaigns(campaigns, campaignsPerformance.report_view);

    return (
      <Row className="mcs-table-container">
        <Row className="mcs-table-header">
          {isSearchEnabled && (<Col span={12}>
            <Search
              placeholder="Search Display Campaigns"
              className="mcs-search-input"
              onSearch={(value) => { return this.searchThroughTable(value); }}
            />
          </Col>)}
          {isDateRangePickerEnabled && (<Col span={12} style={{ textAlign: 'right' }}>
            <RangePicker
              defaultValue={[moment(twentyDaysAgo, dateFormat), moment(now, dateFormat)]}
              format={dateFormat}
              onChange={this.onDateRangeChange}
              disabled={isFetchingCampaignsPerformance}
            />
          </Col>)}
        </Row>
        <Row className="mcs-table-body">
          <Col span={24} style={{ padding: '20px 10px' }}>
            <Table columns={this.renderCol()} dataSource={hasSearched ? filteredCampaigns : campaigns} onChange={this.handleChange} loading={isFetching} pagination={{ size: 'small', showSizeChanger: true }} />
          </Col>
        </Row>
      </Row>
    );
  }

  renderCol() {
    const {
      activeWorkspace: {
        workspaceId
      },
      isFetchingCampaignsPerformance
    } = this.props;

    const columns = [{
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    }, {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a href={`#/${workspaceId}/campaigns/display/report/${record.id}/basic`}>{text}</a>
      )
    }, {
      title: 'Imp.',
      dataIndex: 'impressions',
      key: 'impression',
      render: (text) => {
        if (!text || isFetchingCampaignsPerformance) {
          return (<span>loading...</span>);
        }
        if (text === '-') {
          return text;
        }
        return text;
      }
    }, {
      title: 'Clicks.',
      dataIndex: 'clicks',
      key: 'clicks',
      render: (text) => {
        if (!text || isFetchingCampaignsPerformance) {
          return (<span>loading...</span>);
        }
        if (text === '-') {
          return text;
        }
        return Math.round(text * 100) / 100;
      }
    }, {
      title: 'Spent',
      dataIndex: 'impressions_cost',
      key: 'spent',
      render: (text) => {
        if (!text || isFetchingCampaignsPerformance) {
          return (<span>loading...</span>);
        }
        if (text === '-') {
          return text;
        }
        return Math.round(text * 100) / 100;
      }
    }, {
      title: 'CPM',
      dataIndex: 'cpm',
      key: 'cpm',
      render: (text) => {
        if (!text || isFetchingCampaignsPerformance) {
          return (<span>loading...</span>);
        }
        if (text === '-') {
          return text;
        }
        return Math.round(text * 100) / 100;
      }
    }, {
      title: 'CTR',
      dataIndex: 'ctr',
      key: 'ctr',
      render: (text) => {
        if (!text || isFetchingCampaignsPerformance) {
          return (<span>loading...</span>);
        }
        if (text === '-') {
          return text;
        }
        return Math.round(text * 100) / 100;
      }
    }, {
      title: 'CPC',
      dataIndex: 'cpc',
      key: 'cpc',
      render: (text) => {
        if (!text || isFetchingCampaignsPerformance) {
          return (<span>loading...</span>);
        }
        if (text === '-') {
          return text;
        }
        return Math.round(text * 100) / 100;
      }
    }, {
      title: 'CPA',
      dataIndex: 'cpa',
      key: 'cpa',
      render: (text) => {
        if (!text || isFetchingCampaignsPerformance) {
          return (<span>loading...</span>);
        }
        if (text === '-') {
          return text;
        }
        return Math.round(text * 100) / 100;
      }
    }, {
      key: 'action',
      render: (text, record) => (
        <Dropdown overlay={this.renderColMenu(workspaceId, record)} trigger={['click']}>
          <a className="ant-dropdown-link">
            <Icon type="down" />
          </a>
        </Dropdown>
      ),
    }];

    return columns;
  }

  renderColMenu(workspace, record) {
    let editUrl;
    switch (record.editor_artifact_id) {
      case 'default-editor':
        editUrl = `#/${workspace}/campaigns/display/expert/edit/${record.id}`;
        break;
      case 'external-campaign-editor':
        editUrl = `#/${workspace}/campaigns/display/external/edit/${record.id}`;
        break;
      case 'keywords-targeting-editor':
        editUrl = `#/${workspace}/campaigns/display/keywords/${record.id}`;
        break;
      default:
        break;
    }

    return (
      <Menu onClick={(item) => { if (item.key === '1') { this.archiveCampaign(record.id); } }}>
        <Menu.Item key="0">
          <a href={editUrl}>Edit</a>
        </Menu.Item>
        <Menu.Item key="1">
          <a>Archive</a>
        </Menu.Item>
      </Menu>
    );
  }

  archiveCampaign(id) {
    const {
      deleteCampaigns,
    } = this.props;
    const it = this;
    confirm({
      title: 'Are you sure you want to archive this campaign?',
      content: 'By archiving the campaign all its activities will be suspended. You\'ll be able to recover it from the archived campaign filter.',
      iconType: 'exclamation-circle',
      okText: 'Archive Now',
      cancelText: 'Cancel',
      onOk() {
        return deleteCampaigns(id).then(() => { it.fetchCampaignsWithProps(); });
      },
      onCancel() {},
    });
  }

  onDateRangeChange(date) {
    this.setState({
      startDate: date[0],
      endDate: date[1],
    });
    this.fetchCampaignsPerformanceWithProps();
  }

  searchThroughTable(value) {
    const {
      searchCampaigns
    } = this.props;

    searchCampaigns(value);
  }

  formatCampaigns(campaigns, campaignsPerformance) {
    const newArray = [];
    campaignsPerformance.rows.map((row, index) => {
      const newObject = {};
      let i = 0;
      campaignsPerformance.columns_headers.forEach((value) => {
        if (row[i]) {
          newObject[value] = row[i];
        } else {
          newObject[value] = '-';
        }
        i += 1;
      });
      return newArray.push(newObject);
    });

    campaigns.map((campaign, index) => {
      const objectToAdd = newArray.find((element) => {
        return element.campaign_id === campaign.id;
      });
      const objetTemp = Object.assign(campaign, objectToAdd);
      campaignsPerformance.columns_headers.forEach((value) => {
        if (!campaign[value]) {
          objetTemp[value] = '-';
        }
      });
      objetTemp.key = campaign.id;
      return objetTemp;
    });
  }

  fetchCampaignsWithProps(props) {
    const {
      fetchCampaigns,
      activeWorkspace: {
        organisationId
      },
    } = this.props;
    const first_result = 0; // eslint-disable-line camelcase
    const max_results = 300; // eslint-disable-line camelcase
    const campaign_type = 'DISPLAY'; // eslint-disable-line camelcase
    const organisation_id = organisationId; // eslint-disable-line camelcase

    const params = {
      first_result,
      max_results,
      campaign_type,
      organisation_id
    };

    if (props) {
      Object.keys(props).forEach(key => {
        params[key] = props[key];
      });
    }

    fetchCampaigns(params).then(this.fetchCampaignsPerformanceWithProps());

  }

  fetchCampaignsPerformanceWithProps(props) {

    const {
      fetchCampaignsPerformance,
    } = this.props;

    const {
      startDate,
      endDate
    } = this.state;

    const startD = moment(startDate, dateFormat).format('YYYY-MM-DD');
    const endD = moment(endDate, dateFormat).format('YYYY-MM-DD');

    const dimension = ''; // eslint-disable-line camelcase
    const end_date = endD; // eslint-disable-line camelcase
    const filters = 'organisation%3D%3D1042'; // eslint-disable-line camelcase
    const metrics = ['impressions', 'clicks', 'cpm', 'ctr', 'cpc', 'impressions_cost', 'cpa']; // eslint-disable-line camelcase
    const organisation_id = 1042; // eslint-disable-line camelcase
    const start_date = startD; // eslint-disable-line camelcase

    const params = {
      dimension,
      end_date,
      filters,
      metrics,
      organisation_id,
      start_date
    };

    if (props) {
      Object.keys(props).forEach(key => {
        params[key] = props[key];
      });
    }
    return fetchCampaignsPerformance(params);

  }

}

CampaignTableView.propTypes = {
  isSearchEnabled: PropTypes.bool,
  isDateRangePickerEnabled: PropTypes.bool,
  isFetching: PropTypes.bool.isRequired,
  campaigns: PropTypes.arrayOf(PropTypes.object).isRequired,
  fetchCampaigns: PropTypes.func.isRequired,
  searchCampaigns: PropTypes.func.isRequired,
  fetchCampaignsPerformance: PropTypes.func.isRequired,
  isFetchingCampaignsPerformance: PropTypes.bool.isRequired,
  campaignsPerformance: PropTypes.shape({ report_view: PropTypes.shape({ items_per_page: PropTypes.number, total_items: PropTypes.number, columns_headers: PropTypes.array, rows: PropTypes.array }) }).isRequired,
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  hasSearched: PropTypes.bool.isRequired,
  filteredCampaigns: PropTypes.arrayOf(PropTypes.object).isRequired,
  deleteCampaigns: PropTypes.func.isRequired,
};

CampaignTableView.defaultProps = {
  isSearchEnabled: false,
  isDateRangePickerEnabled: false
};

const mapStateToProps = state => ({
  campaigns: state.campaignsState.campaigns,
  campaignsPerformance: state.campaignsState.campaignsPerformance,
  filteredCampaign: state.campaignsState.filteredCampaign,
  isFetching: state.campaignsState.isFetching,
  isFetchingCampaignsPerformance: state.campaignsState.isFetchingCampaignsPerformance,
  activeWorkspace: state.sessionState.activeWorkspace,
  hasSearched: state.campaignsState.hasSearched,
  filteredCampaigns: state.campaignsState.filteredCampaigns,
});

const mapDispatchToProps = {
  fetchCampaigns: CampaignsTableViewActions.fetchCampaigns,
  fetchCampaignsPerformance: CampaignsTableViewActions.fetchCampaignsPerformance,
  searchCampaigns: CampaignsTableViewActions.searchCampaigns,
  deleteCampaigns: CampaignsTableViewActions.deleteCampaigns,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignTableView);

/*
¨*<CampaignsTableView isSearchEnabled isDateRangePickerEnabled filters={[]} />
*/
