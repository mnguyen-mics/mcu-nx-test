import * as React from 'react';
import { Row, Col } from 'antd';
import { compose } from 'recompose';
import messages from '../messages';
import {
  injectThemeColors,
  InjectedThemeColorsProps,
} from '@mediarithmics-private/advanced-components';
import { Index } from '../../../../../utils';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { messagesMap } from '../BlastTable';
import {
  EmptyChart,
  LoadingChart,
  McsDateRangePicker,
  AreaChart,
  LegendChart,
} from '@mediarithmics-private/mcs-components-library';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import { AreaChartProps } from '@mediarithmics-private/mcs-components-library/lib/components/charts/area-chart';
import {
  convertMessageDescriptorToString,
  mcsDateRangePickerMessages,
} from '../../../../../IntlMessages';
import { McsDateRangePickerMessages } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker';

export interface EmailStackedAreaChartProps {
  dateRangeValue: McsDateRangeValue;
  onDateRangeChange: (values: McsDateRangeValue) => void;
  isLoading: boolean;
  emailReport: Array<Index<any>>;
}

type Props = EmailStackedAreaChartProps & WrappedComponentProps & InjectedThemeColorsProps;

class EmailStackedAreaChart extends React.Component<Props> {
  renderStackedAreaCharts() {
    const {
      emailReport,
      isLoading,
      colors,
      intl: { formatMessage },
    } = this.props;

    const stackedAreaPlotProps: AreaChartProps = {
      dataset: emailReport,
      xKey: { key: 'day', mode: 'DAY' },
      format: 'count',
      yKeys: [
        { key: 'email_sent', message: formatMessage(messages.emailSent) },
        { key: 'clicks', message: formatMessage(messages.emailClicks) },
        {
          key: 'impressions',
          message: formatMessage(messages.emailImpressions),
        },
        {
          key: 'email_hard_bounced',
          message: formatMessage(messages.emailHardBounce),
        },
      ],
      colors: [
        colors['mcs-chart-2'],
        colors['mcs-chart-1'],
        colors['mcs-chart-3'],
        colors['mcs-chart-5'],
      ],
    };
    return !isLoading ? <AreaChart {...stackedAreaPlotProps} /> : <LoadingChart />;
  }

  render() {
    const {
      emailReport,
      isLoading,
      colors,
      dateRangeValue,
      onDateRangeChange,
      intl: { formatMessage },
    } = this.props;

    const options = [
      {
        domain: formatMessage(messagesMap.emailSent),
        color: colors['mcs-chart-2'],
      },
      {
        domain: formatMessage(messagesMap.clicks),
        color: colors['mcs-chart-1'],
      },
      {
        domain: formatMessage(messagesMap.impressions),
        color: colors['mcs-chart-3'],
      },
      {
        domain: formatMessage(messagesMap.emailHardBounced),
        color: colors['mcs-chart-5'],
      },
    ];
    const mcsdatePickerMsg = convertMessageDescriptorToString(
      mcsDateRangePickerMessages,
      this.props.intl,
    ) as McsDateRangePickerMessages;
    const chartArea = (
      <div>
        <Row className='mcs-chart-header'>
          <Col span={12}>
            {emailReport.length === 0 && isLoading ? (
              <div />
            ) : (
              <LegendChart identifier='chartLegend' options={options} />
            )}
          </Col>
          <Col span={12}>
            <span className='mcs-card-button'>
              <McsDateRangePicker
                values={dateRangeValue}
                onChange={onDateRangeChange}
                messages={mcsdatePickerMsg}
                className='mcs-datePicker_container'
              />
            </span>
          </Col>
        </Row>
        {emailReport.length === 0 && isLoading ? (
          <EmptyChart title={formatMessage(messagesMap.noEmailStats)} icon='warning' />
        ) : (
          this.renderStackedAreaCharts()
        )}
      </div>
    );

    return chartArea;
  }
}

export default compose<Props, EmailStackedAreaChartProps>(
  injectThemeColors,
  injectIntl,
)(EmailStackedAreaChart);
