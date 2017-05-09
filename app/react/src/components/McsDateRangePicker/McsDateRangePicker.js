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

const format = 'DD/MM/YYYY';

class McsDateRangePicker extends Component {

  constructor(props) {
    super(props);
    this.handleMenuClick = this.handleMenuClick.bind(this);
    this.handleMenuChange = this.handleMenuChange.bind(this);
    this.state = {
      isCustom: false,
      isOpen: false
    };
  }

  handleMenuClick(e) {
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
      rangeType: 'relative'
    });
  }

  handleMenuChange(dates) {
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
      to: dates[1]
    });
  }

  getSelectedPresettedRange() {
    const {
      values,
      translations
    } = this.props;

    if (values.rangeType === 'absolute') {
      return translations.FROM.concat(' ', values.from.format(format), ' ', translations.TO, ' ', values.to.format(format));
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
      <Menu onClick={(key) => this.handleMenuClick(key)}>
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
        <Button style={{ marginLeft: 8 }}>
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
      onChange={this.handleMenuChange}
      value={[values.from, values.to]}
      disabledDate={current => this.disableFutureDates(current)}
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
