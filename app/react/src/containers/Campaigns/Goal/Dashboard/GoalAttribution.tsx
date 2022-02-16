import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import _ from 'lodash';
import ReportService from '../../../../services/ReportService';
import {
  DATE_SEARCH_SETTINGS,
  isSearchValid,
  buildDefaultSearch,
  parseSearch,
  compareSearches,
  updateSearch,
  DateSearchSettings,
} from '../../../../utils/LocationSearchHelper';
import { normalizeReportView, formatMetric } from '../../../../utils/MetricHelper';
import GoalAttributionTable from './GoalAttributionTable';
import { Row, Select } from 'antd';
import messages from './messages';
import {
  MetricsHighlight,
  McsDateRangePicker,
} from '@mediarithmics-private/mcs-components-library';
import { formatSecondsIntoDhmsFormat } from '../../../../utils/DurationHelper';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import {
  convertMessageDescriptorToString,
  mcsDateRangePickerMessages,
} from '../../../../IntlMessages';
import { McsDateRangePickerMessages } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker';

const Option = Select.Option;

export interface GoalAttributionProps {
  attributionModelId: string;
}

type InteractionType = 'POST_VIEW' | 'POST_CLICK';

interface OverallStat {
  interaction_type: InteractionType;
  weighted_conversions: string;
  interaction_to_conversion_duration: string;
}

interface BaseStat {
  interaction_type: InteractionType;
  weighted_conversions: string;
  weighted_value: string;
}

interface SourceStat extends BaseStat {
  marketing_channel: string;
  source: string;
}

interface CampaignStat extends BaseStat {
  campaign_name: string;
  campaign_id: string;
}

interface CreativeStat extends BaseStat {
  creative_name: string;
  creative_id: string;
}

export interface CampaignStatData {
  viewType: 'CAMPAIGN';
  dataSource: CampaignStat[];
}

export interface CreativeStatData {
  viewType: 'CREATIVES';
  dataSource: CreativeStat[];
}

export interface SourceStatData {
  viewType: 'SOURCE';
  dataSource: SourceStat[];
}

interface Filters extends DateSearchSettings {}

const ReportType: Array<'SOURCE' | 'CAMPAIGN' | 'CREATIVES'> = ['SOURCE', 'CAMPAIGN', 'CREATIVES'];

// export type SelectedView = 'SOURCE' | 'CAMPAIGN' | 'CREATIVES';
export type SelectedView = CampaignStatData | CreativeStatData | SourceStatData;

interface GoalAttributionState {
  overall: {
    isLoading: boolean;
    items: OverallStat[];
  };
  detailled: {
    isLoading: boolean;
    data: SelectedView;
    uniq: string[];
  };
}

interface Router {
  organisationId: string;
  goalId: string;
}

type JoinedProps = GoalAttributionProps & RouteComponentProps<Router> & InjectedIntlProps;

class GoalAttribution extends React.Component<JoinedProps, GoalAttributionState> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      overall: {
        isLoading: true,
        items: [],
      },
      detailled: {
        isLoading: true,
        data: {
          dataSource: [],
          viewType: 'SOURCE',
        },
        uniq: [],
      },
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId, goalId },
      },
      attributionModelId,
      history,
      location: { pathname, search },
    } = this.props;

    if (!isSearchValid(search, DATE_SEARCH_SETTINGS)) {
      history.replace(
        {
          pathname: pathname,
          search: buildDefaultSearch(search, DATE_SEARCH_SETTINGS),
        },
        { reloadDataSource: true },
      );
    } else {
      const filter = parseSearch<Filters>(search, DATE_SEARCH_SETTINGS);

      this.fetchOverall(organisationId, goalId, attributionModelId, filter);
      this.fetchDetailled(organisationId, goalId, attributionModelId, filter, ReportType[0]);
    }
  }

  componentDidUpdate(previousProps: JoinedProps) {
    const {
      match: {
        params: { organisationId, goalId },
      },
      history,
      location: { pathname, search },
      attributionModelId,
    } = this.props;

    const {
      match: {
        params: { organisationId: previousOrganisationId, goalId: previousGoalId },
      },
      location: { search: previousSearch },
      attributionModelId: previousAttributionModelId,
    } = previousProps;

    if (
      !compareSearches(search, previousSearch) ||
      organisationId !== previousOrganisationId ||
      goalId !== previousGoalId ||
      attributionModelId !== previousAttributionModelId
    ) {
      if (!isSearchValid(search, DATE_SEARCH_SETTINGS)) {
        history.replace(
          {
            pathname: pathname,
            search: buildDefaultSearch(search, DATE_SEARCH_SETTINGS),
          },
          {
            reloadDataSource: organisationId !== previousOrganisationId,
          },
        );
      } else {
        const filter = parseSearch<Filters>(search, DATE_SEARCH_SETTINGS);
        this.fetchOverall(organisationId, goalId, attributionModelId, filter);
        this.fetchDetailled(
          organisationId,
          goalId,
          attributionModelId,
          filter,
          this.state.detailled.data.viewType,
        );
      }
    }
  }

  fetchOverall = (
    organisationId: string,
    goalId: string,
    attributionModelId: string,
    filters: Filters,
  ) => {
    this.setState({ overall: { isLoading: true, items: [] } });
    return ReportService.getConversionAttributionPerformance(
      organisationId,
      filters.from,
      filters.to,
      [`goal_id==${goalId}`, `attribution_model_id==${attributionModelId}`],
      ['interaction_type'],
      ['weighted_conversions', 'interaction_to_conversion_duration'],
    )
      .then(res => res.data.report_view)
      .then(res =>
        this.setState({
          overall: { isLoading: false, items: normalizeReportView(res) },
        }),
      );
  };

  fetchDetailled = (
    organisationId: string,
    goalId: string,
    attributionModelId: string,
    filters: Filters,
    viewType: string,
  ) => {
    this.setState(
      prevState => {
        return {
          detailled: {
            ...prevState.detailled,
            isLoading: true,
          },
        };
      },
      () => {
        if (viewType === 'SOURCE') {
          this.fetchChannel(organisationId, goalId, attributionModelId, filters);
        } else if (viewType === 'CAMPAIGN') {
          this.fetchCampaign(organisationId, goalId, attributionModelId, filters);
        } else if (viewType === 'CREATIVES') {
          this.fetchCreative(organisationId, goalId, attributionModelId, filters);
        }
      },
    );
  };

  fetchCreative = (
    organisationId: string,
    goalId: string,
    attributionModelId: string,
    filters: Filters,
  ) => {
    return ReportService.getConversionAttributionPerformance(
      organisationId,
      filters.from,
      filters.to,
      [`goal_id==${goalId}`, `attribution_model_id==${attributionModelId}`],
      ['creative_id', 'creative_name', 'interaction_type'],
      ['weighted_conversions', 'weighted_value'],
    )
      .then(res => normalizeReportView(res.data.report_view))
      .then(res => {
        const creativeList = _.uniq(res.map(item => item.creative_id));
        this.setState({
          detailled: {
            isLoading: false,
            data: {
              viewType: 'CREATIVES',
              dataSource: res as CreativeStat[],
            },
            uniq: creativeList,
          },
        });
      });
  };

  fetchChannel = (
    organisationId: string,
    goalId: string,
    attributionModelId: string,
    filters: Filters,
  ) => {
    return ReportService.getConversionAttributionPerformance(
      organisationId,
      filters.from,
      filters.to,
      [`goal_id==${goalId}`, `attribution_model_id==${attributionModelId}`],
      ['marketing_channel', 'source', 'interaction_type'],
      ['weighted_conversions', 'weighted_value'],
    )
      .then(res => normalizeReportView(res.data.report_view))
      .then(res => {
        const channelList = _.uniq(res.map(item => item.marketing_channel));
        this.setState({
          detailled: {
            isLoading: false,
            data: {
              dataSource: res as SourceStat[],
              viewType: 'SOURCE',
            },
            uniq: channelList,
          },
        });
      });
  };

  fetchCampaign = (
    organisationId: string,
    goalId: string,
    attributionModelId: string,
    filters: Filters,
  ) => {
    return ReportService.getConversionAttributionPerformance(
      organisationId,
      filters.from,
      filters.to,
      [`goal_id==${goalId}`, `attribution_model_id==${attributionModelId}`],
      ['campaign_name', 'campaign_id', 'interaction_type'],
      ['weighted_conversions', 'weighted_value'],
    )
      .then(res => normalizeReportView(res.data.report_view))
      .then(res => {
        const CampaignList = _.uniq(res.map(item => item.campaign_id));
        return this.setState({
          detailled: {
            isLoading: false,
            data: {
              dataSource: res as CampaignStat[],
              viewType: 'CAMPAIGN',
            },
            uniq: CampaignList,
          },
        });
      });
  };

  renderDatePicker = () => {
    const {
      history: {
        location: { search },
      },
    } = this.props;

    const filter = parseSearch(search, DATE_SEARCH_SETTINGS);

    const values = {
      from: filter.from,
      to: filter.to,
    };

    const onChange = (newValues: McsDateRangeValue) =>
      this.updateLocationSearch({
        from: newValues.from,
        to: newValues.to,
      });
    const mcsdatePickerMsg = convertMessageDescriptorToString(
      mcsDateRangePickerMessages,
      this.props.intl,
    ) as McsDateRangePickerMessages;

    return (
      <div style={{ marginBottom: 5 }}>
        <McsDateRangePicker
          values={values}
          onChange={onChange}
          messages={mcsdatePickerMsg}
          className='mcs-datePicker_container'
        />
      </div>
    );
  };

  updateLocationSearch = (params: Filters) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, DATE_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    const onChange = (value: string) =>
      this.fetchDetailled(
        this.props.match.params.organisationId,
        this.props.match.params.goalId,
        this.props.attributionModelId,
        parseSearch(this.props.location.search, DATE_SEARCH_SETTINGS),
        value,
      );

    const postViewInteractionDuration = this.state.overall.items.reduce(
      (acc, item) =>
        item.interaction_type === 'POST_VIEW'
          ? acc + parseInt(item.interaction_to_conversion_duration, 10)
          : acc,
      0,
    );

    const postClickInteractionDuration = this.state.overall.items.reduce(
      (acc, item) =>
        item.interaction_type === 'POST_CLICK'
          ? acc + parseInt(item.interaction_to_conversion_duration, 10)
          : acc,
      0,
    );

    const InteractionDuration = Math.max(postViewInteractionDuration, postClickInteractionDuration);

    const metrics = [
      {
        name: formatMessage(messages.weightedConversions),
        value:
          !this.state.overall.isLoading && this.state.overall.items.length
            ? formatMetric(
                this.state.overall.items.reduce(
                  (acc, item) => acc + parseInt(item.weighted_conversions, 10),
                  0,
                ),
                '0,0',
              )
            : '--',
      },
      {
        name: formatMessage(messages.postView),
        value:
          !this.state.overall.isLoading && this.state.overall.items.length
            ? formatMessage(messages.pCpVFormatDuration, {
                value: formatMetric(
                  this.state.overall.items.reduce(
                    (acc, item) =>
                      item.interaction_type === 'POST_VIEW'
                        ? acc + parseInt(item.weighted_conversions, 10)
                        : acc,
                    0,
                  ),
                  '0,0',
                ),
                duration:
                  postViewInteractionDuration && !isNaN(postViewInteractionDuration)
                    ? formatSecondsIntoDhmsFormat(postViewInteractionDuration)
                    : '--',
              })
            : '--',
      },
      {
        name: formatMessage(messages.postClick),
        value:
          !this.state.overall.isLoading && this.state.overall.items.length
            ? formatMessage(messages.pCpVFormatDuration, {
                value: formatMetric(
                  this.state.overall.items.reduce(
                    (acc, item) =>
                      item.interaction_type === 'POST_CLICK'
                        ? acc + parseInt(item.weighted_conversions, 10)
                        : acc,
                    0,
                  ),
                  '0,0',
                ),
                duration:
                  postClickInteractionDuration && !isNaN(postClickInteractionDuration)
                    ? formatSecondsIntoDhmsFormat(postClickInteractionDuration)
                    : '--',
              })
            : '--',
      },
      {
        name: formatMessage(messages.interactionToConversionDuration),
        value:
          !this.state.overall.isLoading && this.state.overall.items.length
            ? InteractionDuration && !isNaN(InteractionDuration)
              ? formatSecondsIntoDhmsFormat(InteractionDuration)
              : '--'
            : '--',
      },
    ];

    return (
      <div>
        <Row className='m-t-10 m-b-10'>
          <MetricsHighlight metrics={metrics} isLoading={this.state.overall.isLoading} />
        </Row>
        <Row>
          <div
            style={{
              display: 'inline-block',
              float: 'right',
              width: '100%',
              marginBottom: '10px',
              marginTop: '10px',
            }}
          >
            <div className='float-right'>{this.renderDatePicker()}</div>
            <div className='float-right m-r-5'>
              <Select defaultValue={'SOURCE'} style={{ width: 120 }} onChange={onChange}>
                {ReportType.map(item => (
                  <Option value={item} key={item}>
                    {formatMessage(messages[item])}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </Row>
        <div>
          <GoalAttributionTable
            dataSource={this.state.detailled.data}
            uniq={this.state.detailled.uniq}
            isLoading={this.state.detailled.isLoading}
          />
        </div>
      </div>
    );
  }
}

export default compose<JoinedProps, GoalAttributionProps>(withRouter, injectIntl)(GoalAttribution);
