import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Button, DatePicker, Menu, Icon } from 'antd';
import moment from 'moment';

import { withTranslations } from '../../containers/Helpers';

const { RangePicker } = DatePicker;

const ranges = [{
  name: 'TODAY',
  dateRange: [moment(), moment()]
}, {
  name: 'YESTERDAY',
  dateRange: [moment().subtract(1, 'days'), moment()]
}, {
  name: 'LAST_7_DAYS',
  dateRange: [moment().subtract(7, 'days'), moment()]
}, {
  name: 'LAST_30_DAYS',
  dateRange: [moment().subtract(1, 'month'), moment()]
}];

const format = 'YYYY-MM-DD';

class McsDateRangePicker extends Component {

  constructor(props) {
    super(props);
    this.handleDropdownMenuClick = this.handleDropdownMenuClick.bind(this);
    this.handleDatePickerMenuChange = this.handleDatePickerMenuChange.bind(this);
    this.onDatePickerOpenChange = this.onDatePickerOpenChange.bind(this);
    this.state = {
      showRangePicker: false,
    };
  }

  handleDropdownMenuClick(e) {
    const {
      onChange
    } = this.props;

    if (e.key === 'CUSTOM') {
      this.setState({
        showRangePicker: true
      });
      return;
    }

    this.setState({
      showRangePicker: false,
    });

    const selectedRange = ranges.find(element => {
      return element.name.toLowerCase() === e.key.toLowerCase();
    });

    onChange({
      lookbackWindow: moment.duration(selectedRange.dateRange[1] - selectedRange.dateRange[0]),
      rangeType: 'relative',
      from: selectedRange.dateRange[0],
      to: selectedRange.dateRange[1]
    });
  }

  handleDatePickerMenuChange(dates) {
    const {
      onChange
    } = this.props;
    this.setState({
      showRangePicker: false,
    });
    onChange({
      rangeType: 'absolute',
      from: dates[0],
      to: dates[1],
      lookbackWindow: moment.duration(dates[1] - dates[0]),
    });
  }

  onDatePickerOpenChange() {
    this.setState({
      showRangePicker: false,
    });
  }

  getSelectedPresettedRange() {
    const {
      values,
      translations
    } = this.props;

    if (values.rangeType === 'absolute') {
      return `${values.from.format(format)} ~ ${values.to.format(format)}`;
    } else if (values.rangeType === 'relative') {

      const selectedRange = ranges.find((range) => {
        return Math.ceil(moment.duration(range.dateRange[1] - range.dateRange[0]).asSeconds()) === Math.ceil(values.lookbackWindow.asSeconds());
      });
      return selectedRange ? translations[selectedRange.name] : Math.ceil(values.lookbackWindow.asSeconds()).toString().concat(' ', translations.SECONDS);
    }
    return translations.ERROR;
  }


  renderRangesDropdown() {
    const {
      translations
    } = this.props;

    const menu = (
      <Menu onClick={(key) => this.handleDropdownMenuClick(key)}>
        <Menu.ItemGroup title={translations.LOOKBACK_WINDOW}>
          {
            ranges.map((item) => {
              return this.getSelectedPresettedRange() === translations[item.name] ? null : (<Menu.Item key={item.name}>{translations[item.name]}</Menu.Item>);
            })
          }
          <Menu.Item key="CUSTOM">{translations.CUSTOM}</Menu.Item>
        </Menu.ItemGroup>
      </Menu>
    );

    return (
      <Dropdown overlay={menu} trigger={['click']}>
        <Button>
          <Icon type="calendar" /> {this.getSelectedPresettedRange()} <Icon type="down" />
        </Button>
      </Dropdown>
    );
  }

  disableFutureDates(current) {
    return current && current.valueOf() > Date.now();
  }

  render() {
    const {
      values
    } = this.props;

    const {
      showRangePicker,
    } = this.state;

    return showRangePicker === true ? (<RangePicker
      allowClear={false}
      onChange={this.handleDatePickerMenuChange}
      defaultValue={[values.from, values.to]}
      disabledDate={current => this.disableFutureDates(current)}
      onOpenChange={this.onDatePickerOpenChange}
      open={showRangePicker}
    />) : this.renderRangesDropdown();
  }
}


McsDateRangePicker.propTypes = {
  values: PropTypes.shape({
    rangeType: PropTypes.string,
    lookbackWindow: PropTypes.object,
    from: PropTypes.object,
    to: PropTypes.object
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  translations: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

McsDateRangePicker = withTranslations(McsDateRangePicker);

export default McsDateRangePicker;
