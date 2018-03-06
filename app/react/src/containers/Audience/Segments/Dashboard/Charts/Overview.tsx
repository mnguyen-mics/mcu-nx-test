import * as React from 'react';
import { connect } from 'react-redux';
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

import { SEGMENT_QUERY_SETTINGS } from '../constants';

import {
  updateSearch,
  parseSearch,
} from '../../../../../utils/LocationSearchHelper';

import { getAudienceSegmentPerformance } from '../../../../../state/Audience/Segments/selectors';

import messages from '../messages';
import { TranslationProps } from '../../../../Helpers/withTranslations';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../../Helpers/injectThemeColors';

const StackedAreaPlotJS = StackedAreaPlot as any;

interface MapStateToProps {
  hasFetchedAudienceStat: boolean;
  dataSource: any;
}

type OverviewProps = MapStateToProps &
  TranslationProps &
  InjectedThemeColorsProps &
  RouteComponentProps<{
    organisationId: string;
    segmentId: string;
  }>;

class Overview extends React.Component<OverviewProps> {
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
    const { dataSource, hasFetchedAudienceStat, colors } = this.props;

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
    return hasFetchedAudienceStat ? (
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
      translations,
      dataSource,
      hasFetchedAudienceStat,
      colors,
    } = this.props;

    const options = [
      {
        domain: translations['user_points'.toUpperCase()],
        color: colors['mcs-warning'],
      },
      {
        domain: translations['user_accounts'.toUpperCase()],
        color: colors['mcs-info'],
      },
      {
        domain: translations['emails'.toUpperCase()],
        color: colors['mcs-success'],
      },
      {
        domain: translations['desktop_cookie_ids'.toUpperCase()],
        color: colors['mcs-error'],
      },
    ];

    return (
      <div>
        <Row className="mcs-chart-header">
          <Col span={12}>
            {dataSource.length === 0 && hasFetchedAudienceStat ? (
              <div />
            ) : (
              <LegendChart identifier="LegendOverview" options={options} />
            )}
          </Col>
          <Col span={12}>
            <span className="mcs-card-button">{this.renderDatePicker()}</span>
          </Col>
        </Row>
        {dataSource.length === 0 && hasFetchedAudienceStat ? (
          <EmptyCharts title={translations.NO_EMAIL_STATS} />
        ) : (
          this.renderStackedAreaCharts()
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  translations: state.translations,
  hasFetchedAudienceStat:
    state.audienceSegmentsTable.performanceReportSingleApi.hasFetched,
  dataSource: getAudienceSegmentPerformance(state),
});

export default compose<{}, {}>(
  withRouter,
  connect(mapStateToProps),
  injectThemeColors,
)(Overview);
