import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Row, Col, Table, Icon, Input, DatePicker, Dropdown, Menu } from 'antd';
import * as CampaignsTableViewActions from './redux/CampaignsTableViewActions';

const Search = Input.Search;
const { RangePicker } = DatePicker;

const menu = (
  <Menu>
    <Menu.Item key="0">
      <a href="#/">Edit</a>
    </Menu.Item>
    <Menu.Item key="1">
      <a href="#/">Archive</a>
    </Menu.Item>
  </Menu>
);

const columns = [{
  title: 'Status',
  dataIndex: 'status',
  key: 'status',
}, {
  title: 'Name',
  dataIndex: 'name',
  key: 'name',
  render: (text, record) => (
    <a>{text}</a>
  )
}, {
  title: 'Imp.',
  dataIndex: 'impressions',
  key: 'impression',
  render: (text, record) => {
    if (!text) {
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
  render: (text, record) => {
    if (!text) {
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
  render: (text, record) => {
    if (!text) {
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
  render: (text, record) => {
    if (!text) {
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
  render: (text, record) => {
    if (!text) {
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
  render: (text, record) => {
    if (!text) {
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
  render: (text, record) => {
    if (!text) {
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
    <Dropdown overlay={menu} trigger={['click']}>
      <a className="ant-dropdown-link">
        <Icon type="down" />
      </a>
    </Dropdown>
  ),
}];


const dateFormat = 'DD/MM/YYYY';
const twentyDaysAgo = moment(moment().subtract(20, 'days').calendar()).format(dateFormat);
const now = moment(new Date()).format(dateFormat);
console.log(twentyDaysAgo, now);

function onChange(date, dateString) {
  console.log(date, dateString);
}


class CampaignTableView extends Component {

  constructor(props) {
    super(props);
    this.fetchCampaignsPerformanceWithProps = this.fetchCampaignsPerformanceWithProps.bind(this);
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
      isFetching
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
    moment().subtract(10, 'days').calendar();
    return (
      <Row>
        <Row>
          {isSearchEnabled && (<Col span={12}>
            <Search
              placeholder="input search text"
              style={{ width: 200 }}
              onSearch={(value) => { return this.searchThroughTable(value, campaigns); }}
            />
          </Col>)}
          {isDateRangePickerEnabled && (<Col span={12} style={{ textAlign: 'right' }}>
            <RangePicker
              defaultValue={[moment(twentyDaysAgo, dateFormat), moment(now, dateFormat)]}
              format={dateFormat}
              onChange={onChange}
            />
          </Col>)}
        </Row>
        <Row>
          <Col span={24} style={{ padding: '20px 10px' }}>
            <Table columns={columns} dataSource={campaigns} onChange={this.handleChange} loading={isFetching} pagination={{ size: 'small', showSizeChanger: true }} />
          </Col>
        </Row>
      </Row>
    );
  }

  searchThroughTable(value) {
    const {
      campaigns,
      searchCampaigns
    } = this.props;

    return searchCampaigns(campaigns, value);
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
      return objetTemp;
    });
  }

  fetchCampaignsWithProps(props) {
    const {
      fetchCampaigns,
      fetchCampaignsPerformance
    } = this.props;

    const first_result = 0; // eslint-disable-line camelcase
    const max_results = 300; // eslint-disable-line camelcase
    const campaign_type = 'DISPLAY'; // eslint-disable-line camelcase
    const organisation_id = 1042; // eslint-disable-line camelcase

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

    const dimension = ''; // eslint-disable-line camelcase
    const end_date = '2017-04-6'; // eslint-disable-line camelcase
    const filters = 'organisation%3D%3D1042'; // eslint-disable-line camelcase
    const metrics = ['impressions', 'clicks', 'cpm', 'ctr', 'cpc', 'impressions_cost', 'cpa']; // eslint-disable-line camelcase
    const organisation_id = 1042; // eslint-disable-line camelcase
    const start_date = '2017-03-16'; // eslint-disable-line camelcase

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
  campaignsPerformance: PropTypes.shape({ report_view: PropTypes.shape({ items_per_page: PropTypes.number, total_items: PropTypes.number, columns_headers: PropTypes.array, rows: PropTypes.array }) }).isRequired
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
  isFetchingCampaignsPerformance: state.campaignsState.isFetchingCampaignsPerformance
});

const mapDispatchToProps = {
  fetchCampaigns: CampaignsTableViewActions.fetchCampaigns,
  fetchCampaignsPerformance: CampaignsTableViewActions.fetchCampaignsPerformance,
  searchCampaigns: PropTypes.func.isRequired,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignTableView);

