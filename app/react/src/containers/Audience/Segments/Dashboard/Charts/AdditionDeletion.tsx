import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Row, Col } from 'antd';
import { compose } from 'recompose';

import {
  EmptyCharts,
  LoadingChart,
} from '../../../../../components/EmptyCharts/index';
import McsDateRangePicker, {
  McsDateRangeValue,
} from '../../../../../components/McsDateRangePicker';
import { StackedBarCharts } from '../../../../../components/BarCharts/index';
import { LegendChart } from '../../../../../components/LegendChart';
import messages from '../messages';

import { SEGMENT_QUERY_SETTINGS } from '../constants';

import {
  updateSearch,
  parseSearch,
} from '../../../../../utils/LocationSearchHelper';

import { getAudienceSegmentPerformance } from '../../../../../state/Audience/Segments/selectors';
import { TranslationProps } from '../../../../Helpers/withTranslations';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../../Helpers/injectThemeColors';
import { RouteComponentProps } from 'react-router';

const StackedBarChartsJS = StackedBarCharts as any;

interface MapStateToProps {
  hasFetchedAudienceStat: boolean;
  dataSource: any[];
}

type AdditionDeletionProps = MapStateToProps &
  InjectedThemeColorsProps &
  TranslationProps &
  RouteComponentProps<{}>;

class AdditionDeletion extends React.Component<AdditionDeletionProps> {
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

    const formattedDataSource = dataSource.map(item => {
      return {
        ...item,
        user_point_deletions: -item.user_point_deletions,
      };
    });

    const optionsForChart = {
      xKey: 'day',
      yKeys: [
        { key: 'user_point_additions', message: messages.userPointAddition },
        { key: 'user_point_deletions', message: messages.userPointDeletion },
      ],
      colors: [colors['mcs-success'], colors['mcs-error']],
    };
    return hasFetchedAudienceStat ? (
      <StackedBarChartsJS
        identifier="StackedBarCharAdditionDeletion"
        dataset={formattedDataSource}
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
        domain: translations['user_point_additions'.toUpperCase()],
        color: colors['mcs-success'],
      },
      {
        domain: translations['user_point_deletions'.toUpperCase()],
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
              <LegendChart
                identifier="LegendAdditionDeletion"
                options={options}
              />
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
)(AdditionDeletion);
