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
  DATE_SEARCH_SETTINGS
} from '../../../utils/LocationSearchHelper';
import McsMoment from '../../../utils/McsMoment';

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
    this.state = { layout: [], isLoading: false };
    this.onLayoutChange = this.onLayoutChange.bind(this);
  }

  componentWillMount() {
    this.updateLocationSearch({
      from: new McsMoment('now-8d'),
      to: new McsMoment('now-1d')
    });
  }

  onLayoutChange(layout: Layout[]) {
    this.setState({ layout: layout });
  }

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
        DATE_SEARCH_SETTINGS,
      ),
    };

    history.push(nextLocation);
  }

  renderDatePicker() {
    const {
      location: { search },
    } = this.props;

    const { isLoading } = this.state;

    const filter = parseSearch(search, DATE_SEARCH_SETTINGS);

    const values = {
      from: filter.from,
      to: filter.to,
    };

    const onChange = (newValues: McsDateRangeValue): void =>
      this.updateLocationSearch({
        from: newValues.from,
        to: newValues.to,
      });

    return <McsDateRangePicker values={values} onChange={onChange} disabled={isLoading} />;
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

    const filter = parseSearch(search, DATE_SEARCH_SETTINGS) as McsDateRangeValue;

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
          <Col className="text-right">
              {this.renderDatePicker()}
          </Col>
        </Row>}
        <DatamartUsersAnalyticsContent datamartId={datamartId} config={config} dateRange={filter} onChange={this.getLoadingState} />
      </div>
    );
  }
}

export default compose<DatamartAnalysisProps, DatamartAnalysisProps>(withRouter)(DatamartUsersAnalyticsWrapper);
