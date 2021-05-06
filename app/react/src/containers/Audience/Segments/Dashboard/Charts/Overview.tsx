import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { Row, Col } from 'antd';
import { RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl';
import { SEGMENT_QUERY_SETTINGS, AudienceReport } from '../constants';
import { updateSearch, parseSearch } from '../../../../../utils/LocationSearchHelper';
import messages from '../messages';
import injectThemeColors, { InjectedThemeColorsProps } from '../../../../Helpers/injectThemeColors';
import { DatamartWithMetricResource } from '../../../../../models/datamart/DatamartResource';
import {
  EmptyChart,
  LoadingChart,
  McsDateRangePicker,
  StackedAreaPlot,
} from '@mediarithmics-private/mcs-components-library';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import chroma from 'chroma-js';
import { StackedAreaPlotProps } from '@mediarithmics-private/mcs-components-library/lib/components/charts/time-based-charts/stacked-area-plot';

interface OverviewProps {
  isFetching: boolean;
  dataSource: AudienceReport;
  datamarts?: DatamartWithMetricResource[];
  datamartId?: string;
}

type Props = OverviewProps &
  InjectedThemeColorsProps &
  InjectedIntlProps &
  RouteComponentProps<{
    organisationId: string;
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
    const {
      location: { search },
    } = this.props;

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

    return <McsDateRangePicker values={values} onChange={onChange} excludeToday={true} />;
  }

  renderStackedAreaCharts() {
    const {
      dataSource,
      isFetching,
      colors,
      datamarts,
      datamartId,
      intl: { formatMessage },
    } = this.props;
    const metrics =
      dataSource && dataSource[0]
        ? Object.keys(dataSource[0]).filter(
            el => el !== 'day' && el !== 'user_point_additions' && el !== 'user_point_deletions',
          )
        : [];

    const datamart = datamarts && datamarts.find(dm => dm.id === datamartId);

    const chartColors = [
      colors['mcs-warning'],
      colors['mcs-info'],
      colors['mcs-success'],
      colors['mcs-error'],
      colors['mcs-highlight'],
      colors['mcs-primary'],
      colors['mcs-normal'],
    ];

    // a security in the case we have more metrics than colors
    if (chartColors.length < metrics.length) {
      let i = chartColors.length;
      for (i = chartColors.length; i < metrics.length; i++) {
        chartColors.push(chroma.random().hex());
      }
    }

    const stackedAreaPlotProps: StackedAreaPlotProps = {
      dataset: dataSource as any,
      options: {
        xKey: { key: 'day', mode: 'DAY' },
        yKeys: metrics.map(metric => {
          return {
            key: metric,
            message:
              this.getMetricsDisplayName(metric, datamart) || formatMessage(messagesMap[metric]),
          };
        }),
        colors: chartColors,
      },
    };
    return !isFetching ? <StackedAreaPlot {...stackedAreaPlotProps} /> : <LoadingChart />;
  }

  getMetricsDisplayName = (metric: string, datamart?: DatamartWithMetricResource) => {
    const metricName =
      datamart && datamart.audience_segment_metrics.find(el => el.technical_name === metric);
    return metricName ? metricName.display_name : undefined;
  };

  render() {
    const { dataSource, isFetching, intl } = this.props;

    return (
      <div>
        <Row className='mcs-chart-header'>
          <Col span={12}>
            <div />
          </Col>
          <Col span={12}>
            <span className='mcs-card-button'>{this.renderDatePicker()}</span>
          </Col>
        </Row>
        {dataSource.length === 0 && !isFetching ? (
          <EmptyChart title={intl.formatMessage(messages.noAdditionDeletion)} icon='warning' />
        ) : (
          this.renderStackedAreaCharts()
        )}
      </div>
    );
  }
}

export default compose<Props, OverviewProps>(withRouter, injectIntl, injectThemeColors)(Overview);

const messagesMap: {
  [metric: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  user_points: {
    id: 'segment.user_points',
    defaultMessage: 'User Points',
  },
  user_accounts: {
    id: 'segment.user_accounts',
    defaultMessage: 'Accounts',
  },
  emails: {
    id: 'segment.emails',
    defaultMessage: 'Emails',
  },
  desktop_cookie_ids: {
    id: 'segment.desktop_cookie_ids',
    defaultMessage: 'Display Cookies',
  },
  user_point_additions: {
    id: 'segment.user_point_additions',
    defaultMessage: 'User Point Additions',
  },
  user_point_deletions: {
    id: 'segment.user_point_deletions',
    defaultMessage: 'User Point Deletions',
  },
  mobile_ad_ids: {
    id: 'segment.mobile_ad_ids',
    defaultMessage: 'Mobile Ad Ids',
  },
  mobile_cookie_ids: {
    id: 'segment.mobile_cookie_ids',
    defaultMessage: 'Mobile Cookie Ids',
  },
});
