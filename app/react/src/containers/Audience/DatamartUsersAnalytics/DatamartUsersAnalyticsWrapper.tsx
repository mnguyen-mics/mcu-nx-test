import * as React from 'react';
import { Layout } from 'react-grid-layout';
import DatamartUsersAnalyticsContent, { DashboardConfig } from './DatamartUsersAnalyticsContent';
import { Row, Col } from 'antd';
import McsDateRangePicker, { McsDateRangeValue } from '../../../components/McsDateRangePicker';
import { compose } from 'recompose';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  parseSearch,
  updateSearch
} from '../../../utils/LocationSearchHelper';
import McsMoment from '../../../utils/McsMoment';
// import SegmentFilter from './components/SegmentFilter';
import { DATAMART_USERS_ANALYTICS_SETTING } from '../Segments/Dashboard/constants';

interface DatamartAnalysisProps {
  title?: string;
  subTitle?: string;
  datamartId: string;
  config: DashboardConfig[];
  showFilter?: boolean;
}

interface State {
  layout: Layout[];
  isLoading: boolean;
}

type JoinedProp = RouteComponentProps & DatamartAnalysisProps;

class DatamartUsersAnalyticsWrapper extends React.Component<JoinedProp, State> {
  constructor(props: JoinedProp) {
    super(props);
    this.state = { 
      layout: [], 
      isLoading: false,
    };
    this.onSegmentFilterChange = this.onSegmentFilterChange.bind(this);
    this.updateLocationSearch = this.updateLocationSearch.bind(this);
    this.onAllUserFilterChange = this.onAllUserFilterChange.bind(this);
  }

  componentWillMount() {
    this.updateLocationSearch({
      from: new McsMoment('now-8d'),
      to: new McsMoment('now-1d'),
      segments: [],
      allusers: true
    });
  }

  onLayoutChange(layout: Layout[]) {
    this.setState({ layout: layout });
  }

  updateLocationSearch(params: any) {
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

  onSegmentFilterChange(newValues: string[]) {
    this.updateLocationSearch({
      segments: newValues
    });
  }

  onAllUserFilterChange(status: boolean) {
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
      config, 
      showFilter,
      location: { search } } = this.props;

    // const { isLoading } = this.state;

    const filter = parseSearch(search, DATAMART_USERS_ANALYTICS_SETTING) as McsDateRangeValue;

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
        { showFilter && <Row>
          {/* <SegmentFilter 
            className={ isLoading ? 'mcs-datamartUsersAnalytics_segmentFilter _is_disabled' : 'mcs-datamartUsersAnalytics_segmentFilter'} 
            onChange={this.onSegmentFilterChange}
            onToggleAllUsersFilter={this.onAllUserFilterChange}
          /> */}
          <Col className="text-right" offset={6}>
              {this.renderDatePicker()}
          </Col>
        </Row>}
        <DatamartUsersAnalyticsContent datamartId={datamartId} config={config} dateRange={filter} onChange={this.getLoadingState} />
      </div>
    );
  }
}

export default compose<DatamartAnalysisProps, DatamartAnalysisProps>(withRouter)(DatamartUsersAnalyticsWrapper);
