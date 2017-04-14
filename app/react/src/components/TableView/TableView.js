import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { Row, Col, Table, Input, DatePicker } from 'antd';

const Search = Input.Search;
const { RangePicker } = DatePicker;

class TableView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      inputVisible: false,
      inputValue: '',
      modalVisible: false,
    };
  }

  render() {
    const {
      columns,
      dataSource,
      searchOptions,
      dateRangePickerOptions,
      pagination,
      loading,
      onChange
    } = this.props;

    return (
      <Row className="mcs-table-container">
        <Row className="mcs-table-header">
          {searchOptions.isEnabled && (<Col span={12}>
            <Search
              placeholder={searchOptions.placeholder}
              className="mcs-search-input"
              onSearch={(value) => searchOptions.onSearch(value)}
            />
          </Col>)}
          {dateRangePickerOptions.isEnabled && (<Col span={12} className="text-right" >
            <RangePicker
              defaultValue={[moment(dateRangePickerOptions.startDate, dateRangePickerOptions.dateFormat), moment(dateRangePickerOptions.endDate, dateRangePickerOptions.dateFormat)]}
              format={dateRangePickerOptions.dateFormat}
              onChange={dateRangePickerOptions.onChange}
              disabled={dateRangePickerOptions.isRangePickerDisabled}
            />
          </Col>)}
        </Row>
        <Row className="mcs-table-body">
          <Col span={24}>
            <Table columns={columns} dataSource={dataSource} onChange={onChange} loading={loading} pagination={pagination} />
          </Col>
        </Row>
      </Row>
    );
  }

}

TableView.defaultProps = {
  searchOptions: {
    isEnabled: false
  },
  dateRangePickerOptions: {
    isEnabled: false
  },
  pagination: {
    size: 'small',
    showSizeChanger: true
  }
};

TableView.propTypes = {
  searchOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  dateRangePickerOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  pagination: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onChange: PropTypes.func.isRequired
};

TableView.defaultProps = {
  isSearchEnabled: false,
  isDateRangePickerEnabled: false
};

export default TableView;
