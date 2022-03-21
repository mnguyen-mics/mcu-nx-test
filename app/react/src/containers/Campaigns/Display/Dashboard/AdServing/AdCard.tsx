import * as React from 'react';
import { Row, Col } from 'antd';
import {
  Card,
  EmptyChart,
  LoadingChart,
  DoubleStackedAreaChart,
  McsDateRangePicker,
  LegendChart,
} from '@mediarithmics-private/mcs-components-library';
import { AdInfoResource } from '../../../../../models/campaign/display';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import {
  updateSearch,
  parseSearch,
  compareSearches,
  isSearchValid,
  buildDefaultSearch,
} from '../../../../../utils/LocationSearchHelper';
import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import messages from '../messages';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import McsMoment from '../../../../../utils/McsMoment';
import {
  injectThemeColors,
  InjectedThemeColorsProps,
} from '@mediarithmics-private/advanced-components';
import ReportService from '../../../../../services/ReportService';
import { makeCancelable } from '../../../../../utils/ApiHelper';
import { CancelablePromise } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { normalizeReportView } from '../../../../../utils/MetricHelper';
import { Index } from '../../../../../utils';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import {
  convertMessageDescriptorToString,
  mcsDateRangePickerMessages,
} from '../../../../../IntlMessages';
import { McsDateRangePickerMessages } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker';

const LegendChartTS = LegendChart as any;

export interface AdCardProps {
  ad: AdInfoResource;
  adGroupId: string;
  dateRange?: McsDateRangeValue;
}

interface Stats {
  impressions: string;
  clicks: string;
}

interface State {
  dataSource: Stats[];
  loading: boolean;
}

type Props = AdCardProps &
  RouteComponentProps<{ organisationId: string; campaignId: string }> &
  InjectedIntlProps &
  InjectedThemeColorsProps;

class AdCard extends React.Component<Props, State> {
  cancelablePromises: Array<CancelablePromise<any>> = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      dataSource: [],
      loading: true,
    };
  }

  componentDidMount() {
    const {
      ad,
      adGroupId,
      match: {
        params: { organisationId, campaignId },
      },
      history,
      location: { search, pathname },
      dateRange,
    } = this.props;

    if (dateRange) {
      this.fetchData(organisationId, campaignId, adGroupId, ad.id, dateRange.from, dateRange.to);
    } else if (!isSearchValid(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS),
        state: { reloadDataSource: true },
      });
    } else {
      const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);
      this.fetchData(organisationId, campaignId, adGroupId, ad.id, filter.from, filter.to);
    }
  }

  componentDidUpdate(previousProps: Props) {
    const {
      ad,
      adGroupId,
      match: {
        params: { organisationId, campaignId },
      },
      location: { search },
    } = this.props;

    const {
      ad: previousAd,
      match: {
        params: { organisationId: previousOrganisationId, campaignId: previousCampaignId },
      },
      location: { search: previousSearch },
    } = previousProps;

    if (
      ad.id !== previousAd.id ||
      organisationId !== previousOrganisationId ||
      !compareSearches(search, previousSearch) ||
      campaignId !== previousCampaignId
    ) {
      const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);
      this.fetchData(organisationId, campaignId, adGroupId, ad.id, filter.from, filter.to);
    }
  }

  filterValueForCampaign = (normalizedReport: Index<any>, campaignId: string) => {
    return normalizedReport.filter((item: any) => item.campaign_id.toString() === campaignId);
  };

  fetchData = (
    organisationId: string,
    campaignId: string,
    adGroupId: string,
    adId: string,
    from: McsMoment,
    to: McsMoment,
  ) => {
    const lookbackWindow = to.toMoment().unix() - from.toMoment().unix();
    const dimensions =
      lookbackWindow > 172800 ? ['day', 'campaign_id'] : ['day,hour_of_day', 'campaign_id'];
    const getAdPerf = makeCancelable(
      ReportService.getAdDeliveryReport(
        organisationId,
        from,
        to,
        [
          ['campaign_id', campaignId],
          ['sub_campaign_id', adGroupId],
          ['message_id', adId],
        ],
        dimensions,
      ),
    );
    this.cancelablePromises.push(getAdPerf);
    this.setState({ loading: true });
    getAdPerf.promise
      .then(res =>
        this.filterValueForCampaign(normalizeReportView(res.data.report_view), campaignId),
      )
      .then(res => {
        const t = res as any;
        this.setState({
          loading: false,
          dataSource: t,
        });
      });
  };

  updateLocationSearch(params: McsDateRangeValue) {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, DISPLAY_DASHBOARD_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  }

  renderDatePicker() {
    const {
      location: { search },
    } = this.props;

    const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

    const values = {
      from: filter.from,
      to: filter.to,
    };

    const onChange = (newValues: McsDateRangeValue): void =>
      this.updateLocationSearch({
        from: newValues.from,
        to: newValues.to,
      });
    const mcsdatePickerMsg = convertMessageDescriptorToString(
      mcsDateRangePickerMessages,
      this.props.intl,
    ) as McsDateRangePickerMessages;
    return (
      <McsDateRangePicker
        values={values}
        onChange={onChange}
        messages={mcsdatePickerMsg}
        className='mcs-datePicker_container'
      />
    );
  }

  createLegend() {
    const {
      intl: { formatMessage },
    } = this.props;
    const legends = [
      {
        key: 'impressions',
        domain: formatMessage(messages.impressions),
      },
      {
        key: 'clicks',
        domain: formatMessage(messages.clicks),
      },
    ];

    return legends;
  }

  renderChart() {
    const { colors } = this.props;
    const { dataSource } = this.state;

    const optionsForChart = {
      xKey: 'day',
      yKeys: [
        { key: 'clicks', message: messages.clicks.defaultMessage || '' },
        { key: 'impressions', message: messages.impressions.defaultMessage || '' },
      ],
      colors: [colors['mcs-warning'], colors['mcs-info']],
      isDraggable: true,
      onDragEnd: (values: string[]) => {
        this.updateLocationSearch({
          from: new McsMoment(values[0]),
          to: new McsMoment(values[1]),
        });
      },
    };

    return (
      <div style={{ display: 'flex' }}>
        <DoubleStackedAreaChart
          dataset={dataSource as any}
          options={optionsForChart}
          style={{ flex: '1' }}
        />
      </div>
    );
  }

  public render() {
    const {
      ad,
      intl: { formatMessage },
      colors,
    } = this.props;
    const { dataSource, loading } = this.state;
    const title = ad.name;

    const legendOptions = [
      {
        key: 'clicks',
        domain: formatMessage(messages.clicks),
        color: colors['mcs-warning'],
      },
      {
        key: 'impressions',
        domain: formatMessage(messages.impressions),
        color: colors['mcs-info'],
      },
    ];
    const legends = this.createLegend();

    return (
      <Card title={title} buttons={<span>{this.renderDatePicker()}</span>}>
        <hr />
        <Row className='mcs-chart-header'>
          <Col span={12}>
            {dataSource && dataSource.length === 0 && loading ? (
              <div />
            ) : (
              <LegendChartTS
                identifier={`chartLegend-${ad.id}`}
                options={legendOptions}
                legends={legends}
              />
            )}
          </Col>
        </Row>
        {loading ? <LoadingChart /> : null}
        {!dataSource.length && !loading ? (
          <EmptyChart title={formatMessage(messages.noStatAvailable)} icon='warning' />
        ) : null}
        {dataSource.length && !loading ? this.renderChart() : null}
      </Card>
    );
  }
}

export default compose<Props, AdCardProps>(withRouter, injectIntl, injectThemeColors)(AdCard);
