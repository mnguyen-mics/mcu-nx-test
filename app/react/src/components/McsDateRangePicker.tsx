import * as React from 'react';
import { Dropdown, Button, DatePicker, Menu, Icon } from 'antd';
import moment from 'moment';
import { ClickParam } from 'antd/lib/menu';

import withTranslations, { TranslationProps } from '../containers/Helpers/withTranslations';

export interface McsDateRangeValue {
  rangeType: string;
  lookbackWindow?: moment.Duration;
  from?: moment.Moment;
  to?: moment.Moment;
}

export interface McsDateRangePickerProps {
  values: McsDateRangeValue;
  onChange: (values: McsDateRangeValue) => void;
  format?: string;
}

interface McsDateRangePickerState {
  showRangePicker?: boolean;
}

interface Range {
  name: 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS';
  from: moment.Moment;
  to: moment.Moment;
}

const { RangePicker } = DatePicker;

const currentTimeStampInt = parseInt(moment().format('X'), 10); // radix is needed
const numberOfSecondsInOneDay = 3600 * 24;

const ranges: Range[] = [
  {
    name: 'TODAY',
    from : moment.unix(currentTimeStampInt).startOf('day'),
    to: moment.unix(currentTimeStampInt + numberOfSecondsInOneDay).startOf('day'),
  },
  {
    name: 'YESTERDAY',
    from : moment.unix(currentTimeStampInt - numberOfSecondsInOneDay).startOf('day'),
    to: moment.unix(currentTimeStampInt).startOf('day'),
  },
  {
    name: 'LAST_7_DAYS',
    from: moment.unix(currentTimeStampInt - (7 * numberOfSecondsInOneDay)).startOf('day'),
    to: moment.unix(currentTimeStampInt + numberOfSecondsInOneDay).startOf('day'),
  },
  {
    name: 'LAST_30_DAYS',
    from: moment.unix(currentTimeStampInt - (30 * numberOfSecondsInOneDay)).startOf('day'),
    to: moment.unix(currentTimeStampInt + numberOfSecondsInOneDay).startOf('day'),
  },
];

class McsDateRangePicker extends React.Component<McsDateRangePickerProps & TranslationProps, McsDateRangePickerState> {

  static defaultProps: Partial<McsDateRangePickerProps> = {
    format: 'YYYY-MM-DD',
  };

  state = {
    showRangePicker: false,
  };

  disableFutureDates(current: moment.Moment) {
    return current && current.valueOf() > Date.now();
  }

  getSelectedPresettedRange() {
    const { values, translations, format } = this.props;

    if (values.rangeType === 'absolute') {
      return `${values.from!.format(format)} ~ ${values.to!.format(format)}`;
    } else if (values.rangeType === 'relative') {
      const selectedRange = ranges.find((range) => {
        const ceil1 = Math.ceil(moment
          .duration({ from: range.from, to: range.to })
          .asSeconds(),
        );
        return (ceil1 === Math.ceil(values.lookbackWindow!.asSeconds())
          && (range.to.unix() === (values.to ? values.to.unix() : null)));
      });

      return (selectedRange
        ? translations[selectedRange.name]
        : Math.ceil(values.lookbackWindow!.asSeconds()).toString().concat(' ', translations.SECONDS)
      );
    }

    return translations.ERROR;
  }

  handleDatePickerMenuChange = (dates: [moment.Moment, moment.Moment]) => {
    const { onChange } = this.props;

    this.setState({ showRangePicker: false });

    onChange({
      rangeType: 'absolute',
      from: dates[0],
      to: dates[1],
      lookbackWindow: moment.duration({from: dates[0], to: dates[1]}),
    });
  }

  handleDropdownMenuClick = (param: ClickParam) => {
    const { onChange } = this.props;

    if (param.key === 'CUSTOM') {
      this.setState({
        showRangePicker: true,
      });
      return;
    }

    this.setState({ showRangePicker: false });

    const selectedRange = ranges.find(element => {
      return element.name.toLowerCase() === param.key.toLowerCase();
    });

    onChange({
      lookbackWindow: moment.duration({ to: selectedRange!.to, from: selectedRange!.from }),
      rangeType: 'relative',
      from: selectedRange!.from,
      to: selectedRange!.to,
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
      <Menu onClick={this.handleDropdownMenuClick}>
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
      ? (
          <RangePicker
            allowClear={false}
            onChange={this.handleDatePickerMenuChange}
            defaultValue={[values.from!, values.to!]}
            disabledDate={this.disableFutureDates}
            onOpenChange={this.onDatePickerOpenChange}
            open={showRangePicker}
          />
        )
      : this.renderRangesDropdown();
  }
}

// TODO replace any with correct type
export default withTranslations(McsDateRangePicker) as any;
