import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Row, Col } from 'antd';
import messages from '../messages';
import { TableView } from '../../../../../components/TableView';
import { formatMetric } from '../../../../../utils/MetricHelper';
import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';

import {
  parseSearch,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';
import { McsDateRangePicker } from '@mediarithmics-private/mcs-components-library';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';

export interface MediaPerformance {
  display_network_name: string;
  impressions_cost: string;
  impressions: string;
  media_id: string;
  clicks: string;
  cpm: string;
  ctr: string;
  cpc: string;
  cpa: string;
}

interface MediaPerformanceTableProps {
  isFetchingMediaStat: boolean;
  dataSet?: MediaPerformance[];
}

interface RouterProps {
  organisationId: string;
  campaignId: string;
  adGroupId: string;
}

type JoinedProps = RouteComponentProps<RouterProps> &
  MediaPerformanceTableProps &
  InjectedIntlProps;

class MediaPerformanceTable extends React.Component<JoinedProps> {
  updateLocationSearch(params: McsDateRangeValue) {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(
        currentSearch,
        params,
        DISPLAY_DASHBOARD_SEARCH_SETTINGS,
      ),
    };

    history.push(nextLocation);
  }

  renderDatePicker() {
    const {
      history: {
        location: { search },
      },
    } = this.props;

    const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

    const values = {
      rangeType: filter.rangeType,
      lookbackWindow: filter.lookbackWindow,
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

  render() {
    const {
      isFetchingMediaStat,
      dataSet,
      intl: { formatMessage },
    } = this.props;

    const renderMetricData = (
      value: string | number,
      numeralFormat: string,
      currency: string = '',
    ) => {
      if (isFetchingMediaStat) {
        return <i className="mcs-table-cell-loading" />;
      }
      const unlocalizedMoneyPrefix = currency === 'EUR' ? '€ ' : '';
      return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
    };

    const sorter = (
      a: MediaPerformance,
      b: MediaPerformance,
      key: keyof MediaPerformance,
    ) => {
      if (a[key] === '-') {
        return -1;
      }
      if (b[key] === '-') {
        return 1;
      }
      return parseFloat(a[key]) - parseFloat(b[key]);
    };

    const dataColumns = [
      {
        intlMessage: messages.displayNetworkName,
        key: 'display_network_name',
        isHideable: false,
        render: (text: string) =>
          text ? (
            <span>{text}</span>
          ) : (
            <span>
              {formatMessage(messages.displayNetworkNameUncategorized)}
            </span>
          ),
      },
      {
        intlMessage: messages.name,
        key: 'media_id',
        isHideable: false,
        render: (text: string) => <span>{text}</span>,
      },
      {
        intlMessage: messages.format,
        key: 'format',
        isHideable: false,
        render: (text: string) => <span>{text}</span>,
      },
      {
        intlMessage: messages.impressions,
        key: 'impressions',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0'),
        sorter: (a: MediaPerformance, b: MediaPerformance) =>
          sorter(a, b, 'impressions'),
      },
      {
        intlMessage: messages.clicks,
        key: 'clicks',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0'),
        sorter: (a: MediaPerformance, b: MediaPerformance) =>
          sorter(a, b, 'clicks'),
      },
      {
        intlMessage: messages.cpm,
        key: 'cpm',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0.00', 'EUR'),
        sorter: (a: MediaPerformance, b: MediaPerformance) =>
          sorter(a, b, 'cpm'),
      },
      {
        intlMessage: messages.ctr,
        key: 'ctr',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) =>
          renderMetricData(parseFloat(text) / 100, '0.000 %'),
        sorter: (a: MediaPerformance, b: MediaPerformance) =>
          sorter(a, b, 'ctr'),
      },
      {
        intlMessage: messages.cpc,
        key: 'cpc',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0.00', 'EUR'),
        sorter: (a: MediaPerformance, b: MediaPerformance) =>
          sorter(a, b, 'cpc'),
      },
      {
        intlMessage: messages.impressions_cost,
        key: 'impressions_cost',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0.00', 'EUR'),
        sorter: (a: MediaPerformance, b: MediaPerformance) =>
          sorter(a, b, 'impressions_cost'),
      },
      // TODO UNCOMMENT WHEN BACKEND IS FIXED
      // {
      //   intlMessage: messages.cpa,
      //   key: 'cpa',
      //   isVisibleByDefault: true,
      //   isHideable: true,
      //   render: (text: string) => renderMetricData(text, '0,0.00', 'EUR'),
      //   sorter: (a: MediaPerformance, b: MediaPerformance) => sorter(a, b, 'cpa'),
      // },
    ];

    return (
      <Row>
        <Col span={24}>
          <div className="mcs-card-button">{this.renderDatePicker()}</div>
        </Col>
        <Col span={24}>
          <TableView
            columns={dataColumns}
            dataSource={dataSet}
            loading={isFetchingMediaStat}
          />
        </Col>
      </Row>
    );
  }
}

export default compose<JoinedProps, MediaPerformanceTableProps>(
  injectIntl,
  withRouter,
)(MediaPerformanceTable);
