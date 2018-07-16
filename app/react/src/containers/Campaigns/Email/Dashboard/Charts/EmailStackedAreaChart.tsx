import * as React from 'react';
import { Row, Col } from 'antd';
import { compose } from 'recompose';

import {
  EmptyCharts,
  LoadingChart,
} from '../../../../../components/EmptyCharts';
import McsDateRangePicker, {
  McsDateRangeValue,
} from '../../../../../components/McsDateRangePicker';
import { StackedAreaPlot } from '../../../../../components/StackedAreaPlot';
import { LegendChart } from '../../../../../components/LegendChart';
import messages from '../messages';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../../Helpers/injectThemeColors';
import withTranslations, {
  TranslationProps,
} from '../../../../Helpers/withTranslations';
import { Index } from '../../../../../utils';

export interface EmailStackedAreaChartProps {
  dateRangeValue: McsDateRangeValue;
  onDateRangeChange: (values: McsDateRangeValue) => void;
  isLoading: boolean;
  emailReport: Array<Index<any>>;
}

type Props = EmailStackedAreaChartProps &
  InjectedThemeColorsProps &
  TranslationProps;

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
        identifier="StackedAreaChartEmailOverview"
        dataset={emailReport}
        options={optionsForChart}
      />
    ) : (
      <LoadingChart />
    );
  }

  render() {
    const {
      translations,
      emailReport,
      isLoading,
      colors,
      dateRangeValue,
      onDateRangeChange,
    } = this.props;

    const options = [
      {
        domain: translations['email_sent'.toUpperCase()],
        color: colors['mcs-warning'],
      },
      {
        domain: translations['clicks'.toUpperCase()],
        color: colors['mcs-info'],
      },
      {
        domain: translations['impressions'.toUpperCase()],
        color: colors['mcs-success'],
      },
      {
        domain: translations['email_hard_bounced'.toUpperCase()],
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
          <EmptyCharts title={translations.NO_EMAIL_STATS} />
        ) : (
          this.renderStackedAreaCharts()
        )}
      </div>
    );

    return chartArea;
  }
}

export default compose<Props, EmailStackedAreaChartProps>(
  withTranslations,
  injectThemeColors,
)(EmailStackedAreaChart);
