import * as React from 'react';
import { Layout } from 'react-grid-layout';
import DatamartUsersAnalyticsContent from './DatamartUsersAnalyticsContent';
import { Row, Col } from 'antd';
import { compose } from 'recompose';
import { RouteComponentProps, withRouter } from 'react-router-dom';
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
import { ContentHeader, McsDateRangePicker } from '@mediarithmics-private/mcs-components-library';
import McsMoment from '../../../utils/McsMoment';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import {
  convertMessageDescriptorToString,
  mcsDateRangePickerMessages,
} from '../../../IntlMessages';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { McsDateRangePickerMessages } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker';
import { DatamartUsersAnalyticsWrapperProps } from '@mediarithmics-private/advanced-components/lib/models/dashboards/dashboardsModel';

interface State {
  layout: Layout[];
  refresh: boolean;
  isLoading: boolean;
}

export type FILTERS = DateSearchSettings | SegmentsSearchSettings | AllUsersSettings;

type JoinedProp = RouteComponentProps<{ segmentId?: string }> &
  DatamartUsersAnalyticsWrapperProps &
  WrappedComponentProps;

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

  setInitialParams = () => {
    const {
      location: { search, pathname },
      history,
      defaultSegment,
      disableAllUserFilter,
      comparisonStartDate,
    } = this.props;

    const queryParms = {
      allusers: disableAllUserFilter ? false : true,
      segments: defaultSegment ? [defaultSegment.key] : [],
      from: comparisonStartDate
        ? new McsMoment(`now-${convertTimestampToDayNumber(comparisonStartDate)}d`)
        : new McsMoment('now-8d'),
      to: new McsMoment('now-1d'),
    };

    const nextLocation = {
      pathname: pathname,
      search: updateSearch(search, queryParms),
    };

    if (!isSearchValid(search, DATAMART_USERS_ANALYTICS_SETTING)) {
      history.replace(nextLocation);
    }
  };

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

  updateLocationSearch = (params: FILTERS) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, DATAMART_USERS_ANALYTICS_SETTING),
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
    const mcsdatePickerMsg = convertMessageDescriptorToString(
      mcsDateRangePickerMessages,
      this.props.intl,
    ) as McsDateRangePickerMessages;
    return (
      <McsDateRangePicker
        values={values}
        onChange={onChange}
        disabled={isLoading}
        excludeToday={true}
        startDate={comparisonStartDate}
        messages={mcsdatePickerMsg}
        className='mcs-datePicker_container'
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
      segmentToAggregate,
      location: { search },
    } = this.props;

    const { isLoading, refresh } = this.state;

    const filter = parseSearch(search, DATAMART_USERS_ANALYTICS_SETTING);
    return (
      <div className={'mcs-datamartUsersAnalytics'}>
        <Row>
          <Col span={12}>{pageTitle && <ContentHeader title={pageTitle} size={'large'} />}</Col>
        </Row>
        {!refresh && (
          <Row justify='space-between'>
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
              <Col className='text-right' offset={6}>
                {this.renderDatePicker()}
              </Col>
            )}
          </Row>
        )}
        <Row>
          <Col span={12}>
            {title && (
              <div>
                <div className={'mcs-datamartUsersAnalytics_title'}>{title}</div>
                <div className={'mcs-datamartUsersAnalytics_subTitle'}>{subTitle}</div>
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
            segmentToAggregate={segmentToAggregate}
          />
        )}
      </div>
    );
  }
}

export default compose<DatamartUsersAnalyticsWrapperProps, DatamartUsersAnalyticsWrapperProps>(
  withRouter,
  injectIntl,
)(DatamartUsersAnalyticsWrapper);
