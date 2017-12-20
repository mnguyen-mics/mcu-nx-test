import * as React from 'react';
import { Row } from 'antd';
import Card from '../../../components/Card/Card';
import VisitAnalysis from '../Charts/VisitAnalysis';
import ReportService from '../../../services/ReportService';
import DashboardHeader from '../Common/DashboardHeader';
import NewUsers from '../Charts/NewUsers';
import Col from 'antd/lib/grid/col';
import {compose} from "recompose";
import {withRouter} from 'react-router-dom';
import {parseSearch, updateSearch} from '../../../utils/LocationSearchHelper';
import {ANALYTICS_DASHBOARD_SEARCH_SETTINGS} from '../constants';
import {RouteComponentProps} from 'react-router';
import {default as McsDateRangePicker, McsDateRangeValue} from '../../../components/McsDateRangePicker';
import DeviceType from '../Charts/DeviceType';

interface OverviewContentProps {
  isFetchingVisitReport: boolean;
  hasFetchedVisitReport: boolean;
}

interface RouterMatchParams {
  organisationId: string;
  campaignId: string;
}

type OverviewContentAllProps = OverviewContentProps & RouteComponentProps<RouterMatchParams>;

interface OverviewContentState {
  isFetchingVisitReport: boolean;
  hasFetchedVisitReport: boolean;
  isFetchingVisitReportFormFactor: boolean;
  hasFetchedVisitReportFormFactor: boolean;
  visitReportFormFactor: any;
  visitReport: any;
}

class OverviewContent extends React.Component<OverviewContentAllProps, OverviewContentState> {

    constructor(props: OverviewContentAllProps) {
        super(props);

        this.state = {
          visitReportFormFactor: [],
          visitReport: [],
          isFetchingVisitReport: false,
          hasFetchedVisitReport: false,
          isFetchingVisitReportFormFactor: false,
          hasFetchedVisitReportFormFactor: false,
        };
    }

    extractReportObject(headers: string[], row: any[]) {
        const result: {[ s: string ]: any} = {};
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

      this.setState((prevState) => {
        return {
          ...prevState,
          isFetchingVisitReport: true,
        };
      });

      getVisitReport.then((response: any) => {
        this.setState((prevState) => {
          const dataset = this.extractReportDataset(response.data.report_view);
          return {
            ...prevState,
            isFetchingVisitReport: false,
            hasFetchedVisitReport: true,
            visitReport: dataset,
          };
        });
      }).catch(console.error);

      getVisitReportFormFactor.then((response: any) => {
        this.setState((prevState) => {
          const dataset = this.extractReportDataset(response.data.report_view);
          return {
            ...prevState,
            isFetchingVisitReportFormFactor: false,
            hasFetchedVisitReportFormFactor: true,
            visitReportFormFactor: dataset,
          };
        });
      });
    }

    componentDidMount() {
      const { history: { location: { search } } } = this.props;
      const filter = parseSearch(search, ANALYTICS_DASHBOARD_SEARCH_SETTINGS);
      this.fetchAllData('1', '1048', filter);
    }

    componentWillReceiveProps(nextProps: OverviewContentAllProps) {
      const { history: { location: { search } } } = nextProps;
      const filter = parseSearch(search, ANALYTICS_DASHBOARD_SEARCH_SETTINGS);
      this.fetchAllData('1', '1048', filter);
    }

    updateLocationSearch(params: McsDateRangeValue) {
      const { history, location: { search: currentSearch, pathname } } = this.props;

      const nextLocation = {
        pathname,
        search: updateSearch(currentSearch, params, ANALYTICS_DASHBOARD_SEARCH_SETTINGS),
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
      const buttons = this.renderDatePicker();
      return (
        <div>
          <DashboardHeader object={{ name: 'Overview' }} translationKey="CAMPAIGN" />
          <Row gutter={10} className="table-line">
            <Col span={24}>
              <Card buttons={buttons} title={'Visit analysis'} >
                <VisitAnalysis
                  hasFetchedVisitReport={this.state.hasFetchedVisitReport}
                  isFetchingVisitReport={this.state.isFetchingVisitReport}
                  report={this.state.visitReport}
                />
              </Card>
            </Col>
          </Row>
          <Row gutter={10} className="table-line">
            <Col span={12}>
              <Card buttons={buttons} title={'New Users vs returning users'}>
                  <NewUsers
                    hasFetchedVisitReport={this.state.hasFetchedVisitReport}
                    isFetchingVisitReport={this.state.isFetchingVisitReport}
                    report={this.state.visitReport}
                    colors={{}}
                  />
              </Card>
            </Col>
            <Col span={12}>
              <Card buttons={buttons} title={'Device type'}>
                  <DeviceType
                    hasFetchedVisitReportFormFactor={this.state.hasFetchedVisitReportFormFactor}
                    isFetchingVisitReportFormFactor={this.state.isFetchingVisitReportFormFactor}
                    report={this.state.visitReportFormFactor}
                    colors={{}}
                  />
              </Card>
            </Col>
          </Row>
        </div>);
    }
}
export default compose(
  withRouter,
)
(OverviewContent);
