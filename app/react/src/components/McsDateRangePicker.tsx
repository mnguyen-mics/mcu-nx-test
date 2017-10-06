import * as React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Button, DatePicker, Menu, Icon } from 'antd';
import moment from 'moment';

import withTranslations, { TranslationProps } from '../containers/Helpers/withTranslations';

interface McsDateRandeValue {
  rangeType: string;
  lookbackWindow?: moment.Duration;
  from?: moment.Moment;
  to?: moment.Moment;
}

export interface McsDateRangePickerProps {
  values: McsDateRandeValue;
  onChange: (values: McsDateRandeValue) => void;
  format?: string
}

interface McsDateRangePickerState {
  showRangePicker?: boolean;
}

interface Range {
  name: 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS';
  from: moment.Moment,
  to: moment.Moment
}

const { RangePicker } = DatePicker;

const ranges: Range[] = [
  {
    name: 'TODAY',
    from : moment(),
    to: moment().add(1, 'days')
  },
  {
    name: 'YESTERDAY',
    from : moment().subtract(1, 'days'),
    to: moment().add(1, 'days')
  },
  {
    name: 'LAST_7_DAYS',
    from: moment().subtract(7, 'days'), 
    to: moment().add(1, 'days'),
  },
  {
    name: 'LAST_30_DAYS',
    from: moment().subtract(1, 'month'), 
    to: moment().add(1, 'days')
  },
];

class McsDateRangePicker extends React.Component<McsDateRangePickerProps & TranslationProps, McsDateRangePickerState> {

  static defaultProps: Partial<McsDateRangePickerProps> = {
    format: 'YYYY-MM-DD'
  }

  state = {
    showRangePicker: false,
  }

  disableFutureDates(current) {
    return current && current.valueOf() > Date.now();
  }

  getSelectedPresettedRange() {
    const { values, translations, format } = this.props;

    if (values.rangeType === 'absolute') {
      return `${values.from.format(format)} ~ ${values.to.format(format)}`;
    } else if (values.rangeType === 'relative') {
      const selectedRange = ranges.find((range) => {
        const ceil1 = Math.ceil(moment
          .duration({ from: range.from, to: range.to })
          .asSeconds(),
        );

        return ceil1 === Math.ceil(values.lookbackWindow.asSeconds());
      });

      return (selectedRange
        ? translations[selectedRange.name]
        : Math.ceil(values.lookbackWindow.asSeconds()).toString().concat(' ', translations.SECONDS)
      );
    }

    return translations.ERROR;
  }

  handleDatePickerMenuChange = (dates) => {
    const { onChange } = this.props;

    this.setState({ showRangePicker: false });

    onChange({
      rangeType: 'absolute',
      from: dates[0],
      to: dates[1],
      lookbackWindow: moment.duration(dates[1] - dates[0]),
    });
  }

  handleDropdownMenuClick = (e) => {
    const { onChange } = this.props;

    if (e.key === 'CUSTOM') {
      this.setState({
        showRangePicker: true,
      });
      return;
    }

    this.setState({ showRangePicker: false });

    const selectedRange = ranges.find(element => {
      return element.name.toLowerCase() === e.key.toLowerCase();
    });

    onChange({
      lookbackWindow: moment.duration({ to: selectedRange.to, from: selectedRange.from }),
      rangeType: 'relative',
      from: selectedRange.from,
      to: selectedRange.to,
    });
  }

  onDatePickerOpenChange = () => {
    this.setState({
      showRangePicker: false,
    });
  }


  renderRangesDropdown() {
    const { translations } = this.props;

    const menu = (
      <Menu onClick={(key) => this.handleDropdownMenuClick(key)}>
        <Menu.ItemGroup title={translations.LOOKBACK_WINDOW}>
          {
            ranges.map((item) => {
              return (this.getSelectedPresettedRange() === translations[item.name]
                ? null
                : <Menu.Item key={item.name}>{translations[item.name]}</Menu.Item>
              );
            })
          }
          <Menu.Item key="CUSTOM">{translations.CUSTOM}</Menu.Item>
        </Menu.ItemGroup>
      </Menu>
    );

    return (
      <Dropdown overlay={menu} trigger={['click']}>
        <Button>
          <Icon type="calendar" />
          {this.getSelectedPresettedRange()}
          <Icon type="down" />
        </Button>
      </Dropdown>
    );
  }

  render() {
    const { values } = this.props;
    const { showRangePicker } = this.state;

    return showRangePicker === true
      ? <RangePicker
        allowClear={false}
        onChange={this.handleDatePickerMenuChange}
        defaultValue={[values.from, values.to]}
        disabledDate={current => this.disableFutureDates(current)}
        onOpenChange={this.onDatePickerOpenChange}
        open={showRangePicker}
      />
      : this.renderRangesDropdown();
  }
}

export default withTranslations(McsDateRangePicker);
