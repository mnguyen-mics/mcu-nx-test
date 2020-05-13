import * as React from 'react';
import { Row } from 'antd';
import { Card } from '@mediarithmics-private/mcs-components-library';
import VisitAnalysis from '../Charts/VisitAnalysis';
import ReportService from '../../../services/ReportService';
import OverviewHeader from '../Common/OverviewHeader';
import NewUsers from '../Charts/NewUsers';
import UsersMap from '../Charts/UsersMap';
import Col from 'antd/lib/grid/col';
import { compose } from 'recompose';
import messages from './messages';
import { withRouter } from 'react-router-dom';
import {
  buildDefaultSearch,
  isSearchValid,
  parseSearch,
  updateSearch,
} from '../../../utils/LocationSearchHelper';
import { ANALYTICS_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import { RouteComponentProps } from 'react-router';
import {
  default as McsDateRangePicker,
  McsDateRangeValue,
} from '../../../components/McsDateRangePicker';
import DeviceType from '../Charts/DeviceType';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import McsMoment from '../../../utils/McsMoment';
import { injectDatamart, InjectedDatamartProps } from '../../Datamart/index';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../Helpers/injectThemeColors';

interface OverviewContentProps {
  isFetchingVisitReport: boolean;
  hasFetchedVisitReport: boolean;
}

type OverviewContentAllProps = OverviewContentProps &
  RouteComponentProps<any> &
  InjectedIntlProps &
  InjectedDatamartProps &
  InjectedThemeColorsProps;

interface OverviewContentState {
  isFetchingVisitReport: boolean;
  hasFetchedVisitReport: boolean;
  visitReportFormFactor: any;
  visitReport: any;
  visitReportCountry: any;
  visitReportPreviousPeriod: any;
  visitReportSignificantDuration: any;
}

class OverviewContent extends React.Component<
  OverviewContentAllProps,
  OverviewContentState
> {
  constructor(props: OverviewContentAllProps) {
    super(props);

    this.state = {
      isFetchingVisitReport: false,
      hasFetchedVisitReport: false,
      visitReportFormFactor: [],
      visitReport: [],
      visitReportCountry: [],
      visitReportPreviousPeriod: [],
      visitReportSignificantDuration: [],
    };
  }

  extractReportObject(headers: string[], row: any[]) {
    const result: { [s: string]: any } = {};
    headers.forEach((header: string, index: number) => {
      result[header] = row[index];
    });
    return result;
  }

  extractReportDataset(report: any): any[] {
    const headers = report.columns_headers;
    return report.rows.map((row: any) => {
      return this.extractReportObject(headers, row);
    });
  }

  extractPreviousPeriod(from: McsMoment, to: McsMoment): any {
    const diff = to.toMoment().diff(from.toMoment());
    const newFrom = new McsMoment(
      from
        .toMoment()
        .subtract(diff)
        .toISOString(),
    );
    const newTo = new McsMoment(
      to
        .toMoment()
        .subtract(diff)
        .toISOString(),
    );
    return { to: newTo, from: newFrom };
  }

  fetchAllData(organisationId: string, datamartId: string, filter: any) {
    const getVisitReport = ReportService.getVisitReport(
      organisationId,
      filter.from,
      filter.to,
      ['datamart_id==' + datamartId],
      undefined,
      undefined,
    );

    const getVisitReportFormFactor = ReportService.getVisitReport(
      organisationId,
      filter.from,
      filter.to,
      ['datamart_id==' + datamartId],
      ['form_factor'],
      undefined,
    );

    const getVisitReportCountry = ReportService.getVisitReport(
      organisationId,
      filter.from,
      filter.to,
      ['datamart_id==' + datamartId],
      ['country'],
      undefined,
    );

    const previousPeriod = this.extractPreviousPeriod(filter.from, filter.to);
    const getVisitReportPreviousPeriod = ReportService.getVisitReport(
      organisationId,
      previousPeriod.from,
      previousPeriod.to,
      ['datamart_id==' + datamartId],
      ['country'],
      undefined,
    );

    const getVisitReportSignificantDuration = ReportService.getVisitReport(
      organisationId,
      filter.from,
      filter.to,
      ['datamart_id==' + datamartId, 'avg_duration>' + 30],
      undefined,
      undefined,
    );

    Promise.all([
      getVisitReport,
      getVisitReportSignificantDuration,
      getVisitReportPreviousPeriod,
      getVisitReportFormFactor,
      getVisitReportCountry,
    ])
      .then((result: any[]) => {
        const visitReport = this.extractReportDataset(
          result[0].data.report_view,
        );
        const visitReportSignificantDuration = this.extractReportDataset(
          result[1].data.report_view,
        );
        const visitReportPreviousReport = this.extractReportDataset(
          result[2].data.report_view,
        );
        const visitReportFormFactor = this.extractReportDataset(
          result[3].data.report_view,
        );
        const visitReportCountry = this.extractReportDataset(
          result[4].data.report_view,
        );
        this.setState(prevState => {
          return {
            ...prevState,
            hasFetchedVisitReport: true,
            visitReport: visitReport,
            visitReportSignificantDuration: visitReportSignificantDuration,
            visitReportPreviousPeriod: visitReportPreviousReport,
            visitReportFormFactor: visitReportFormFactor,
            visitReportCountry: visitReportCountry,
          };
        });
      });

    this.setState(prevState => {
      return {
        ...prevState,
        isFetchingVisitReport: true,
      };
    });
  }

  componentDidMount() {
    const {
      history,
      match: { params: { organisationId } },
      datamart,
    } = this.props;
    const filter = parseSearch(
      history.location.search,
      ANALYTICS_DASHBOARD_SEARCH_SETTINGS,
    );

    if (
      !isSearchValid(
        history.location.search,
        ANALYTICS_DASHBOARD_SEARCH_SETTINGS,
      )
    ) {
      history.replace({
        pathname: history.location.pathname,
        search: buildDefaultSearch(
          history.location.search,
          ANALYTICS_DASHBOARD_SEARCH_SETTINGS,
        ),
        state: { reloadDataSource: true },
      });
    }
    const defaultDatamartId = datamart && datamart.id ? datamart.id : '0';
    this.fetchAllData(organisationId, defaultDatamartId, filter);
  }

  componentWillReceiveProps(nextProps: OverviewContentAllProps) {
    const {
      history,
      match: { params: { organisationId } },
      datamart,
    } = this.props;

    const filter = parseSearch(
      history.location.search,
      ANALYTICS_DASHBOARD_SEARCH_SETTINGS,
    );
    if (
      !isSearchValid(
        history.location.search,
        ANALYTICS_DASHBOARD_SEARCH_SETTINGS,
      )
    ) {
      history.replace({
        pathname: history.location.pathname,
        search: buildDefaultSearch(
          history.location.search,
          ANALYTICS_DASHBOARD_SEARCH_SETTINGS,
        ),
        state: { reloadDataSource: true },
      });
    }

    const defaultDatamartId = datamart && datamart.id ? datamart.id : '0';
    this.fetchAllData(organisationId, defaultDatamartId, filter);
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
        ANALYTICS_DASHBOARD_SEARCH_SETTINGS,
      ),
    };

    history.push(nextLocation);
  }

  renderDatePicker() {
    const { history: { location: { search } } } = this.props;

    const filter = parseSearch(search, ANALYTICS_DASHBOARD_SEARCH_SETTINGS);

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

  render() {
    const { intl: { formatMessage }, colors } = this.props;

    const buttons = this.renderDatePicker();
    return (
      <div>
        <OverviewHeader object={{ name: formatMessage(messages.overview) }} />
        <Row gutter={10} className="table-line">
          <Col span={24}>
            <Card
              buttons={buttons}
              title={formatMessage(messages.visit_analysis)}
            >
              <VisitAnalysis
                hasFetchedVisitReport={this.state.hasFetchedVisitReport}
                reportSignificantDuration={
                  this.state.visitReportSignificantDuration
                }
                report={this.state.visitReport}
              />
            </Card>
          </Col>
        </Row>
        <Row gutter={10} className="table-line">
          <Col span={12}>
            <Card
              buttons={buttons}
              title={formatMessage(messages.new_users_vs_returning)}
            >
              <NewUsers
                hasFetchedVisitReport={this.state.hasFetchedVisitReport}
                report={this.state.visitReport}
                reportPreviousPeriod={this.state.visitReportPreviousPeriod}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card buttons={buttons} title={formatMessage(messages.device_type)}>
              <hr />
              <DeviceType
                hasFetchedVisitReport={this.state.hasFetchedVisitReport}
                report={this.state.visitReportFormFactor}
              />
            </Card>
          </Col>
        </Row>
        <Row gutter={10} className="table-line">
          <Col span={24}>
            <hr />
            <Card buttons={buttons} title={formatMessage(messages.locations)}>
              <hr />
              <UsersMap
                hasFetchedVisitReport={this.state.hasFetchedVisitReport}
                report={this.state.visitReportCountry}
                projection={'times'}
                scale={200}
                colors={colors}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default compose<OverviewContentAllProps, OverviewContentState>(
  withRouter,
  injectIntl,
  injectThemeColors,
  injectDatamart,
)(OverviewContent);
