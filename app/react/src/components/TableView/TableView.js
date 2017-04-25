import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { Row, Col, Table, Input, DatePicker, Icon, Tag, Tooltip } from 'antd';

const Search = Input.Search;
const { RangePicker } = DatePicker;

class TableView extends Component {

  render() {
    const {
      columns,
      dataSource,
      searchOptions,
      dateRangePickerOptions,
      pagination,
      loading,
      onChange,
      filters,
      filtersElement
    } = this.props;

    const onClickCloseTag = (tag) => {
      return filters.onClickOnClose(tag);
    };

    const displayContent = (item) => {
      return item.icon ? (<span><Icon type={item.icon} /> {item.value}</span>) : (<span>{item.value}</span>);
    };

    const generateTag = (item) => {
      const isLongTag = item.value.length > 20;
      if (item.isClosable === true) {
        const tagElem = (<Tag closable key={item.key} afterClose={() => { onClickCloseTag(item); }} >{ displayContent(item) }</Tag>);
        return isLongTag ? <Tooltip title={item.value}>{tagElem}</Tooltip> : tagElem;
      }
      const tagElem = (<Tag key={item.key} >{ displayContent(item) }</Tag>);
      return isLongTag ? <Tooltip title={item.value}>{tagElem}</Tooltip> : tagElem;
    };

    const filterColmuns = (obj) => {
      if (obj) {
        return obj.visible ? true : false;
      }
      return false;
    };

    const col = columns.filter(filterColmuns);

    return (
      <Row className="mcs-table-container">
        <Row className="mcs-table-header">
          {searchOptions.isEnabled && (<Col span={6}>
            <Search
              placeholder={searchOptions.placeholder}
              className="mcs-search-input"
              defaultValue={searchOptions.defaultValue}
              onSearch={searchOptions.onSearch}
            />
          </Col>)}
          <Col span={18} className="text-right" >
            {dateRangePickerOptions.isEnabled && (<RangePicker
              defaultValue={[moment(dateRangePickerOptions.startDate, dateRangePickerOptions.dateFormat), moment(dateRangePickerOptions.endDate, dateRangePickerOptions.dateFormat)]}
              format={dateRangePickerOptions.dateFormat}
              onChange={dateRangePickerOptions.onChange}
              disabled={dateRangePickerOptions.isRangePickerDisabled}
            />)}
            {filtersElement}
          </Col>
        </Row>
        <Row className={filters.items.length !== 0 ? 'mcs-table-filters' : 'mcs-table-nofilters'}>
          {filters.items.map((tag) => {
            return generateTag(tag);
          })}
        </Row>
        <Row className="mcs-table-body">
          <Col span={24}>
            <Table columns={col} dataSource={dataSource} onChange={onChange} loading={loading} pagination={pagination} />
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
  },
  filtersElement: (<span />)
};

TableView.propTypes = {
  searchOptions: PropTypes.shape({
    isEnabled: PropTypes.bool,
    placeholder: PropTypes.string,
    defaultValue: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    onSearch: PropTypes.func
  }),
  dateRangePickerOptions: PropTypes.shape({
    isEnabled: PropTypes.bool,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    dateFormat: PropTypes.string,
    onChange: PropTypes.func,
    isRangePickerDisabled: PropTypes.bool,
  }),
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  pagination: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onChange: PropTypes.func.isRequired,
  filtersElement: PropTypes.element
};

export default TableView;
