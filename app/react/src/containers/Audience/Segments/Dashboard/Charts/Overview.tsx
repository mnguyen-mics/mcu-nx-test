import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { Row, Col } from 'antd';
import { RouteComponentProps } from 'react-router';
import { compose } from 'recompose';

import {
  EmptyCharts,
  LoadingChart,
} from '../../../../../components/EmptyCharts/index';
import McsDateRangePicker, {
  McsDateRangeValue,
} from '../../../../../components/McsDateRangePicker';
import { StackedAreaPlot } from '../../../../../components/StackedAreaPlot';
import { LegendChart } from '../../../../../components/LegendChart';

import { SEGMENT_QUERY_SETTINGS, AudienceReport } from '../constants';

import {
  updateSearch,
  parseSearch,
} from '../../../../../utils/LocationSearchHelper';

import messages from '../messages';
import { TranslationProps } from '../../../../Helpers/withTranslations';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../../Helpers/injectThemeColors';
import { injectIntl, InjectedIntlProps } from 'react-intl';

const StackedAreaPlotJS = StackedAreaPlot as any;

interface OverviewProps {
  isFetching: boolean;
  dataSource: AudienceReport;
}

type Props = OverviewProps &
  TranslationProps &
  InjectedThemeColorsProps &
  InjectedIntlProps &
  RouteComponentProps<{
    organisationId: string;
    segmentId: string;
  }>;

class Overview extends React.Component<Props> {
  updateLocationSearch(params: McsDateRangeValue) {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, SEGMENT_QUERY_SETTINGS),
    };

    history.push(nextLocation);
  }

  renderDatePicker() {
    const { location: { search } } = this.props;

    const filter = parseSearch(search, SEGMENT_QUERY_SETTINGS);

    const values = {
      from: filter.from,
      to: filter.to,
    };

    const onChange = (newValues: McsDateRangeValue) =>
      this.updateLocationSearch({
        from: newValues.from,
        to: newValues.to,
      });

    return <McsDateRangePicker values={values} onChange={onChange} />;
  }

  renderStackedAreaCharts() {
    const { dataSource, isFetching, colors } = this.props;

    const optionsForChart = {
      xKey: 'day',
      yKeys: [
        { key: 'user_points', message: messages.userPoints },
        { key: 'user_accounts', message: messages.userAccounts },
        { key: 'emails', message: messages.emails },
        { key: 'desktop_cookie_ids', message: messages.desktopCookieId },
      ],
      colors: [
        colors['mcs-warning'],
        colors['mcs-info'],
        colors['mcs-success'],
        colors['mcs-error'],
      ],
    };
    return !isFetching ? (
      <StackedAreaPlotJS
        identifier="StackedAreaChartEmailOverview"
        dataset={dataSource}
        options={optionsForChart}
      />
    ) : (
      <LoadingChart />
    );
  }

  render() {
    const {
      dataSource,
      isFetching,
      colors,
      intl,
    } = this.props;

    const options = [
      {
        domain: intl.formatMessage(messages.userPoints),
        color: colors['mcs-warning'],
      },
      {
        domain: intl.formatMessage(messages.userAccounts),
        color: colors['mcs-info'],
      },
      {
        domain: intl.formatMessage(messages.emails),
        color: colors['mcs-success'],
      },
      {
        domain: intl.formatMessage(messages.desktopCookieId),
        color: colors['mcs-error'],
      },
    ];

    return (
      <div>
        <Row className="mcs-chart-header">
          <Col span={12}>
            {dataSource.length === 0 && !isFetching ? (
              <div />
            ) : (
              <LegendChart identifier="LegendOverview" options={options} />
            )}
          </Col>
          <Col span={12}>
            <span className="mcs-card-button">{this.renderDatePicker()}</span>
          </Col>
        </Row>
        {dataSource.length === 0 && !isFetching ? (
          <EmptyCharts title={intl.formatMessage(messages.noAdditionDeletion)} />
        ) : (
          this.renderStackedAreaCharts()
        )}
      </div>
    );
  }
}

export default compose<Props, OverviewProps>(
  withRouter,
  injectIntl,
  injectThemeColors,
)(Overview);
