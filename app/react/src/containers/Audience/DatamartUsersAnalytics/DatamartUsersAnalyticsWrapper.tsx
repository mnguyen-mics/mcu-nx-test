import * as React from 'react';
import { Layout } from 'react-grid-layout';
import DatamartUsersAnalyticsContent, {
  DashboardConfig,
} from './DatamartUsersAnalyticsContent';
import { Row, Col } from 'antd';
import McsDateRangePicker, {
  McsDateRangeValue,
} from '../../../components/McsDateRangePicker';
import { compose } from 'recompose';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  parseSearch,
  updateSearch,
  DateSearchSettings,
  SegmentsSearchSettings,
  AllUsersSettings,
  isSearchValid,
  buildDefaultSearch,
  convertTimestampToDayNumber,
} from '../../../utils/LocationSearchHelper';
import SegmentFilter from './components/SegmentFilter';
import { DATAMART_USERS_ANALYTICS_SETTING } from '../Segments/Dashboard/constants';
import { LabeledValue } from 'antd/lib/select';
import ContentHeader from '../../../components/ContentHeader';
import McsMoment from '../../../utils/McsMoment';

interface State {
  layout: Layout[];
  refresh: boolean;
  isLoading: boolean;
}

export interface DatamartUsersAnalyticsWrapperProps {
  pageTitle?: string;
  title?: string;
  subTitle?: string;
  datamartId: string;
  organisationId: string;
  config: DashboardConfig[];
  showFilter?: boolean;
  showDateRangePicker?: boolean;
  comparisonStartDate?: number;
  disableAllUserFilter?: boolean;
  defaultSegment?: LabeledValue;
}

type FILTERS = DateSearchSettings | SegmentsSearchSettings | AllUsersSettings;

type JoinedProp = RouteComponentProps<{ segmentId?: string }> &
  DatamartUsersAnalyticsWrapperProps;

class DatamartUsersAnalyticsWrapper extends React.Component<JoinedProp, State> {
  constructor(props: JoinedProp) {
    super(props);
    this.state = {
      layout: [],
      refresh: false,
      isLoading: false,
    };
  }

  componentDidMount() {
    this.setInitialParams();
  }

  componentDidUpdate(prevProps: JoinedProp) {
    const {
      location: { search, pathname },
      history,
    } = this.props;

    if (prevProps.location.search !== search) {
      if (!isSearchValid(search, DATAMART_USERS_ANALYTICS_SETTING)) {
        history.replace({
          pathname: pathname,
          search: buildDefaultSearch(search, DATAMART_USERS_ANALYTICS_SETTING),
        });
      }
    }
  }

  setInitialParams = () => {
    const {
      location: { search, pathname },
      history,
      defaultSegment,
      disableAllUserFilter,
      comparisonStartDate,
    } = this.props;
    const nextLocation = {
      pathname: pathname,
      search: updateSearch(search, {
        allusers: disableAllUserFilter ? false : true,
        segments: defaultSegment ? [defaultSegment.key] : [],
        from: new McsMoment(
          `now-${
            comparisonStartDate
              ? convertTimestampToDayNumber(comparisonStartDate)
              : '8'
          }d`,
        ),
        to: new McsMoment('now-1d'),
      }),
    };
    if (!isSearchValid(search, DATAMART_USERS_ANALYTICS_SETTING)) {
      history.replace(nextLocation);
    }
  };

  updateLocationSearch = (params: FILTERS) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(
        currentSearch,
        params,
        DATAMART_USERS_ANALYTICS_SETTING,
      ),
    };

    history.push(nextLocation);
  };

  renderDatePicker() {
    const {
      location: { search },
      comparisonStartDate,
    } = this.props;

    const { isLoading } = this.state;

    const filter = parseSearch(search, DATAMART_USERS_ANALYTICS_SETTING);

    const values = {
      from: filter.from,
      to: filter.to,
    };

    const onChange = (newValues: McsDateRangeValue): void =>
      this.updateLocationSearch({
        from: newValues.from,
        to: newValues.to,
      });

    return (
      <McsDateRangePicker
        values={values}
        onChange={onChange}
        disabled={isLoading}
        excludeToday={true}
        startDate={comparisonStartDate}
      />
    );
  }

  onSegmentFilterChange = (newValues: string[]) => {
    this.updateLocationSearch({
      segments: newValues,
    });
  };

  onAllUserFilterChange = (status: boolean) => {
    this.updateLocationSearch({
      allusers: status,
    });
  };

  getLoadingState = (isLoading: boolean) => this.setState({ isLoading });

  render() {
    const {
      title,
      subTitle,
      datamartId,
      organisationId,
      config,
      showFilter,
      showDateRangePicker,
      disableAllUserFilter,
      defaultSegment,
      pageTitle,
      location: { search },
    } = this.props;

    const { isLoading, refresh } = this.state;

    const filter = parseSearch(search, DATAMART_USERS_ANALYTICS_SETTING);
    return (
      <div className={'mcs-datamartUsersAnalytics'}>
        <Row>
          <Col span={12}>
            {pageTitle && <ContentHeader title={pageTitle} size={'large'} />}
          </Col>
        </Row>
        {!refresh && (
          <Row>
            {showFilter && (
              <SegmentFilter
                className={
                  isLoading
                    ? 'mcs-datamartUsersAnalytics_segmentFilter _is_disabled'
                    : 'mcs-datamartUsersAnalytics_segmentFilter'
                }
                onChange={this.onSegmentFilterChange}
                onToggleAllUsersFilter={this.onAllUserFilterChange}
                datamartId={datamartId}
                organisationId={organisationId}
                disableAllUserFilter={disableAllUserFilter}
                defaultSegment={defaultSegment}
              />
            )}
            {showDateRangePicker && (
              <Col className="text-right" offset={6}>
                {this.renderDatePicker()}
              </Col>
            )}
          </Row>
        )}
        <Row>
          <Col span={12}>
            {title && (
              <div>
                <div className={'mcs-datamartUsersAnalytics_title'}>
                  {title}
                </div>
                <div className={'mcs-datamartUsersAnalytics_subTitle'}>
                  {subTitle}
                </div>
              </div>
            )}
          </Col>
        </Row>
        {!refresh && (
          <DatamartUsersAnalyticsContent
            datamartId={datamartId}
            config={config}
            dateRange={{ from: filter.from, to: filter.to }}
            onChange={this.getLoadingState}
          />
        )}
      </div>
    );
  }
}

export default compose<
  DatamartUsersAnalyticsWrapperProps,
  DatamartUsersAnalyticsWrapperProps
>(withRouter)(DatamartUsersAnalyticsWrapper);
