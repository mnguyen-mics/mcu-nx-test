import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Dropdown, Button, DatePicker, Menu, Icon } from 'antd';
import moment from 'moment';

const { RangePicker } = DatePicker;

const ranges = [{
  name: 'TODAY',
  duration: [moment(), moment()]
}, {
  name: 'YESTERDAY',
  duration: [moment().subtract(1, 'days'), moment()]
}, {
  name: 'LAST_7_DAYS',
  duration: [moment().subtract(7, 'days'), moment()]
}, {
  name: 'LAST_30_DAYS',
  duration: [moment().subtract(1, 'month'), moment()]
}];

const format = 'YYYY-MM-DD';

class McsDateRangePicker extends Component {

  constructor(props) {
    super(props);
    this.handleDropdownMenuClick = this.handleDropdownMenuClick.bind(this);
    this.handleDatePickerMenuChange = this.handleDatePickerMenuChange.bind(this);
    this.onDatePickerOpenChange = this.onDatePickerOpenChange.bind(this);
    this.state = {
      isCustom: false,
      isOpen: false
    };
  }

  handleDropdownMenuClick(e) {
    if (e.key === 'CUSTOM') {
      return this.setState({
        isCustom: true,
        isOpen: true
      });
    }
    const {
      onChange
    } = this.props;
    this.setState({
      isCustom: false,
      isOpen: false
    });
    const selectedRange = ranges.find(element => {
      return element.name.toLowerCase() === e.key.toLowerCase();
    });
    return onChange({
      lookbackWindow: moment.duration(selectedRange.duration[1] - selectedRange.duration[0]),
      rangeType: 'relative',
      from: selectedRange.duration[0],
      to: selectedRange.duration[1]
    });
  }

  handleDatePickerMenuChange(dates) {
    const {
      onChange
    } = this.props;
    this.setState({
      isCustom: false,
      isOpen: false
    });
    return onChange({
      rangeType: 'absolute',
      from: dates[0],
      to: dates[1],
      lookbackWindow: moment.duration(dates[1] - dates[0]),
    });
  }

  onDatePickerOpenChange() {
    this.setState({
      isCustom: false,
      isOpen: false
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
      let selectedRange;
      ranges.forEach((range) => {
        if (Math.round(moment.duration(range.duration[1] - range.duration[0], 'milliseconds').asSeconds()) === Math.round(values.lookbackWindow.asSeconds())) {
          selectedRange = range;
        }
      });
      return selectedRange ? translations[selectedRange.name] : Math.round(values.lookbackWindow.asSeconds()).toString().concat(' ', translations.SECONDS);
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
      isCustom,
      isOpen,
    } = this.state;

    return isCustom === true ? (<RangePicker
      allowClear={false}
      onChange={this.handleDatePickerMenuChange}
      value={[values.from, values.to]}
      disabledDate={current => this.disableFutureDates(current)}
      onOpenChange={this.onDatePickerOpenChange}
      open={isOpen}
    />) : this.renderRangesDropdown();
  }
}


McsDateRangePicker.propTypes = {
  values: PropTypes.shape({
    rangeType: PropTypes.string.isRequired,
    lookbackWindow: PropTypes.object,
    from: PropTypes.object,
    to: PropTypes.object
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  translations: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
  translations: state.translationsState.translations
});

const mapDispatchToProps = {};

McsDateRangePicker = connect(
  mapStateToProps,
  mapDispatchToProps
)(McsDateRangePicker);


export default McsDateRangePicker;
