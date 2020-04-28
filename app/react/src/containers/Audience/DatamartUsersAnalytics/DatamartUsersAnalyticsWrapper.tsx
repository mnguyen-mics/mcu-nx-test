import * as React from 'react';
import { Layout } from 'react-grid-layout';
import DatamartUsersAnalyticsContent, { DashboardConfig } from './DatamartUsersAnalyticsContent';
import { Row, Col } from 'antd';
import McsDateRangePicker, { McsDateRangeValue } from '../../../components/McsDateRangePicker';
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
  compareSearches
} from '../../../utils/LocationSearchHelper';
import SegmentFilter from './components/SegmentFilter';
import { DATAMART_USERS_ANALYTICS_SETTING } from '../Segments/Dashboard/constants';

interface DatamartAnalysisProps {
  title?: string;
  subTitle?: string;
  datamartId: string;
  organisationId: string;
  config: DashboardConfig[];
  showFilter?: boolean;
}

interface State {
  layout: Layout[];
  refresh: boolean;
  isLoading: boolean;
}


type FILTERS = DateSearchSettings | SegmentsSearchSettings | AllUsersSettings

type JoinedProp = RouteComponentProps & DatamartAnalysisProps;

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
    const {
      history,
      location: { search, pathname },
    } = this.props;

    if (!isSearchValid(search, DATAMART_USERS_ANALYTICS_SETTING)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, DATAMART_USERS_ANALYTICS_SETTING),
      });
    }
  }

  // Should be replaced by getDerivedStateFromProps hook after react lib update
  UNSAFE_componentWillReceiveProps(nextProps: JoinedProp) {
    const {
      location: { search },
      history,
    } = this.props;

    const {
      location: { pathname: nextPathname, search: nextSearch },
    
    } = nextProps;

    if (!compareSearches(search, nextSearch)) {
      if (!isSearchValid(nextSearch, DATAMART_USERS_ANALYTICS_SETTING)) {
        this.setState({refresh: true});
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(
            nextSearch,
            DATAMART_USERS_ANALYTICS_SETTING,
          ),
        });
        setTimeout(()=> {
          this.setState({refresh: false})
        }, 500);
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
      search: updateSearch(
        currentSearch,
        params,
        DATAMART_USERS_ANALYTICS_SETTING,
      ),
    };

    history.push(nextLocation);
  }

  renderDatePicker() {
    const {
      location: { search },
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

    return <McsDateRangePicker values={values} onChange={onChange} disabled={isLoading} excludeToday={true} />;
  }

  onSegmentFilterChange = (newValues: string[]) => {
    this.updateLocationSearch({
      segments: newValues
    });
  }

  onAllUserFilterChange = (status: boolean) => {
    this.updateLocationSearch({
      allusers: status
    });
  }

  getLoadingState = (isLoading: boolean) => this.setState({isLoading})


  render() {
    const { 
      title, 
      subTitle, 
      datamartId,
      organisationId, 
      config, 
      showFilter,
      location: { search } } = this.props;

    const { isLoading, refresh } = this.state;

    const filter = parseSearch(search, DATAMART_USERS_ANALYTICS_SETTING);
    return (

      <div className={'mcs-datamartUsersAnalytics'}>
        <Row>
          <Col span={12}>
            {
              title && <div>
                <div className={'mcs-datamartUsersAnalytics_title'}>{title}</div>
                <div className={'mcs-datamartUsersAnalytics_subTitle'}>{subTitle}</div>
              </div>}
          </Col>
        </Row>
        { !refresh && showFilter && <Row>
          <SegmentFilter 
            className={ isLoading ? 'mcs-datamartUsersAnalytics_segmentFilter _is_disabled' : 'mcs-datamartUsersAnalytics_segmentFilter'} 
            onChange={this.onSegmentFilterChange}
            onToggleAllUsersFilter={this.onAllUserFilterChange}
            datamartId={datamartId}
            organisationId={organisationId}
          />
          <Col className="text-right" offset={6}>
              {this.renderDatePicker()}
          </Col>
        </Row>}
        {!refresh && <DatamartUsersAnalyticsContent datamartId={datamartId} config={config} dateRange={{from: filter.from, to: filter.to}} onChange={this.getLoadingState} />}
      </div>
    );
  }
}

export default compose<DatamartAnalysisProps, DatamartAnalysisProps>(withRouter)(DatamartUsersAnalyticsWrapper);
