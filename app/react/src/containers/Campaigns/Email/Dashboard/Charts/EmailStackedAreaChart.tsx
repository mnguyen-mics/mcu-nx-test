import * as React from 'react';
import { Row, Col } from 'antd';
import { compose } from 'recompose';
import McsDateRangePicker, {
  McsDateRangeValue,
} from '../../../../../components/McsDateRangePicker';
import StackedAreaPlot from '../../../../../components/Charts/TimeBased/StackedAreaPlot';
import { LegendChart } from '../../../../../components/LegendChart';
import messages from '../messages';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../../Helpers/injectThemeColors';
import { Index } from '../../../../../utils';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { messagesMap } from '../BlastTable';
import { EmptyChart, LoadingChart } from '@mediarithmics-private/mcs-components-library';

export interface EmailStackedAreaChartProps {
  dateRangeValue: McsDateRangeValue;
  onDateRangeChange: (values: McsDateRangeValue) => void;
  isLoading: boolean;
  emailReport: Array<Index<any>>;
}

type Props = EmailStackedAreaChartProps &
  InjectedIntlProps &
  InjectedThemeColorsProps;

class EmailStackedAreaChart extends React.Component<Props> {
  renderStackedAreaCharts() {
    const { emailReport, isLoading, colors } = this.props;

    const optionsForChart = {
      xKey: 'day',
      yKeys: [
        { key: 'email_sent', message: messages.emailSent },
        { key: 'clicks', message: messages.emailClicks },
        { key: 'impressions', message: messages.emailImpressions },
        { key: 'email_hard_bounced', message: messages.emailHardBounce },
      ],
      colors: [
        colors['mcs-warning'],
        colors['mcs-info'],
        colors['mcs-success'],
        colors['mcs-error'],
      ],
    };
    return !isLoading ? (
      <StackedAreaPlot
        dataset={emailReport}
        options={optionsForChart}
      />
    ) : (
      <LoadingChart />
    );
  }

  render() {
    const {
      emailReport,
      isLoading,
      colors,
      dateRangeValue,
      onDateRangeChange,
      intl,
    } = this.props;

    const options = [
      {
        domain: intl.formatHTMLMessage(messagesMap.emailSent),
        color: colors['mcs-warning'],
      },
      {
        domain: intl.formatHTMLMessage(messagesMap.clicks),
        color: colors['mcs-info'],
      },
      {
        domain: intl.formatHTMLMessage(messagesMap.impressions),
        color: colors['mcs-success'],
      },
      {
        domain: intl.formatHTMLMessage(messagesMap.emailHardBounced),
        color: colors['mcs-error'],
      },
    ];

    const chartArea = (
      <div>
        <Row className="mcs-chart-header">
          <Col span={12}>
            {emailReport.length === 0 && isLoading ? (
              <div />
            ) : (
              <LegendChart identifier="chartLegend" options={options} />
            )}
          </Col>
          <Col span={12}>
            <span className="mcs-card-button">
              <McsDateRangePicker
                values={dateRangeValue}
                onChange={onDateRangeChange}
              />
            </span>
          </Col>
        </Row>
        {emailReport.length === 0 && isLoading ? (
          <EmptyChart title={intl.formatMessage(messagesMap.noEmailStats)} icon='warning' />
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
