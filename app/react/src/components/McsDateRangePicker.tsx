import * as React from 'react';
import { Button, DatePicker, Menu, Icon } from 'antd';
import moment from 'moment';
import { ClickParam } from 'antd/lib/menu';
import { Dropdown } from '../components/PopupContainers';
import withTranslations, { TranslationProps } from '../containers/Helpers/withTranslations';
import McsMoment, { convertMcsDateToMoment } from '../utils/McsMoment';

export interface McsDateRangeValue {
  from: McsMoment;
  to: McsMoment;
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
  from: string;
  to: string;
}

const { RangePicker } = DatePicker;

const ranges: Range[] = [
  {
    name: 'TODAY',
    from : 'now',
    to: 'now',
  },
  {
    name: 'YESTERDAY',
    from : 'now-1d',
    to: 'now-1d',
  },
  {
    name: 'LAST_7_DAYS',
    from: 'now-7d',
    to: 'now',
  },
  {
    name: 'LAST_30_DAYS',
    from: 'now-30d',
    to: 'now',
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

    const selectedRange = ranges.find((range) => {
      return range.from === values.from.raw() && range.to ===  values.to.raw();
    });

    if (selectedRange) {
      return translations[selectedRange.name];
    }
    return `${convertMcsDateToMoment(values.from.raw())!.format(format)} ~ ${convertMcsDateToMoment(values.to.raw())!.format(format)}`;

  }

  handleDatePickerMenuChange = (dates: [moment.Moment, moment.Moment]) => {
    const { onChange } = this.props;

    this.setState({ showRangePicker: false });

    onChange({
      from: new McsMoment(dates[0].format('YYYY-MM-DD')),
      to: new McsMoment(dates[1].format('YYYY-MM-DD')),
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
      from: new McsMoment(selectedRange!.from),
      to:  new McsMoment(selectedRange!.to),
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
    const fromMoment = values.from.toMoment();
    const toMoment = values.to.toMoment();
    return showRangePicker === true
      ? (
          <RangePicker
            allowClear={false}
            onChange={this.handleDatePickerMenuChange}
            defaultValue={[fromMoment, toMoment]}
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
