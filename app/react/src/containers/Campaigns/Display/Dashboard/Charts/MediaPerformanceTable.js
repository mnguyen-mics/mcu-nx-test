import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Row, Col } from 'antd';

import { TableView } from '../../../../../components/TableView/index.ts';
import { formatMetric } from '../../../../../utils/MetricHelper';
import McsDateRangePicker from '../../../../../components/McsDateRangePicker.tsx';
import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';

import {
  parseSearch,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';

class MediaPerformanceTable extends Component {

  updateLocationSearch(params) {
    const { history, location: { search: currentSearch, pathname } } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, DISPLAY_DASHBOARD_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  }

  renderDatePicker() {
    const { history: { location: { search } } } = this.props;

    const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

    const values = {
      rangeType: filter.rangeType,
      lookbackWindow: filter.lookbackWindow,
      from: filter.from,
      to: filter.to,
    };

    const onChange = newValues =>
      this.updateLocationSearch({
        rangeType: newValues.rangeType,
        lookbackWindow: newValues.lookbackWindow,
        from: newValues.from,
        to: newValues.to,
      });

    return <McsDateRangePicker values={values} onChange={onChange} />;
  }

  render() {

    const {
      isFetchingMediaStat,
      dataSet,
    } = this.props;

    const renderMetricData = (value, numeralFormat, currency = '') => {
      if (isFetchingMediaStat) {
        return (<i className="mcs-table-cell-loading" />);
      }
      const unlocalizedMoneyPrefix = currency === 'EUR' ? '€ ' : '';
      return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
    };

    const sorter = (a, b, key) => {
      if (a[key] === '-') {
        return -1;
      }
      if (b[key] === '-') {
        return 1;
      }
      return a[key] - b[key];
    };

    const dataColumns = [
      {
        translationKey: 'DISPLAY_NETWORK_NAME',
        key: 'display_network_name',
        isHideable: false,
        render: text => <span>{text}</span>,
      },
      {
        translationKey: 'NAME',
        key: 'media_id',
        isHideable: false,
        render: (text) => <span>{text}</span>,
      },
      {
        translationKey: 'IMPRESSIONS',
        key: 'impressions',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0'),
        sorter: (a, b) => sorter(a, b, 'impressions'),
      },
      {
        translationKey: 'CLICKS',
        key: 'clicks',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0'),
        sorter: (a, b) => sorter(a, b, 'clicks'),
      },
      {
        translationKey: 'CPM',
        key: 'cpm',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0.00', 'EUR'),
        sorter: (a, b) => sorter(a, b, 'cpm'),
      },
      {
        translationKey: 'CTR',
        key: 'ctr',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,00 %'),
        sorter: (a, b) => sorter(a, b, 'ctr'),
      },
      {
        translationKey: 'CPC',
        key: 'cpc',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0.00', 'EUR'),
        sorter: (a, b) => sorter(a, b, 'cpc'),
      },
      {
        translationKey: 'IMPRESSIONS_COST',
        key: 'impressions_cost',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0.00', 'EUR'),
        sorter: (a, b) => sorter(a, b, 'impressions_cost'),
      },
      {
        translationKey: 'CPA',
        key: 'cpa',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0.00', 'EUR'),
        sorter: (a, b) => sorter(a, b, 'cpa'),
      },
    ];


    const columnsDefinitions = {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: [],
    };

    return (
      <Row>
        <Col span={24}>
          <div className="mcs-card-button">{this.renderDatePicker()}</div>
        </Col>
        <Col span={24}>
          <TableView
            columnsDefinitions={columnsDefinitions}
            dataSource={dataSet}
            loading={isFetchingMediaStat}
          />
        </Col>
      </Row>
    );
  }

}

MediaPerformanceTable.propTypes = {
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
  isFetchingMediaStat: PropTypes.bool.isRequired,
  dataSet: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
});

MediaPerformanceTable = connect(
  mapStateToProps,
)(MediaPerformanceTable);


MediaPerformanceTable = withRouter(MediaPerformanceTable);

export default MediaPerformanceTable;
