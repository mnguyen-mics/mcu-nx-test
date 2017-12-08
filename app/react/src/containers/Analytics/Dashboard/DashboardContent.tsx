import * as React from 'react';
import { Row } from 'antd';
import moment from 'moment';
import Card from '../../../components/Card/Card';
import DashboardVisitAreaChart from '../Charts/DashboardVisitAreaChart';
import ReportService from '../../../services/ReportService';
import DashboardHeader from '../Common/DashboardHeader';

interface DashboardContentProps {
  isFetchingVisitReport: boolean;
  hasFetchedVisitReport: boolean;
}

interface DashboardContentState {
  isFetchingVisitReport: boolean;
  hasFetchedVisitReport: boolean;
  report: any;
}

class DashboardContent extends React.Component<DashboardContentProps, DashboardContentState> {

    constructor(props: DashboardContentProps) {
        super(props);

        this.state = {
          report: [],
          isFetchingVisitReport: false,
          hasFetchedVisitReport: false,
        };
    }

    extractReportObject(headers: string[], row: any[]) {
        const result = {}
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

    fetchAllData = (organisationId: string, datamartId: string, filter: any) => {
        const getMediaPerf = ReportService.getVisitReport(
            organisationId,
            'datamart_id',
            datamartId,
            filter.from,
            filter.to,
            '',
            '',
            { sort: '-clicks', limit: 30 },
        );
        this.setState((prevState) => {
          return {
            ...prevState,
            isFetchingVisitReport: true,
          };
        });
        getMediaPerf.promise.then((response: any) => {
          this.setState((prevState) => {
            return {
              ...prevState,
              isFetchingVisitReport: false,
            };
          });
          const report = response.data.report_view;
          this.updateStateOnPerf(report);
        }).catch(console.error);
    }

    updateStateOnPerf(performanceReport: any) {
        this.setState((prevState) => {
            const nextState: DashboardContentState = {
                ...prevState,
            };
            nextState.hasFetchedVisitReport = true;
            nextState.report = this.extractReportDataset(performanceReport);
            return nextState;
        });
    }

    componentDidMount() {
        const filter = { from: moment('2017-11-01'), to: moment('2017-12-04') };
        this.fetchAllData('1', '1048', filter);
    }

    render() {
        const buttons = (<div />)
        return (
            <div>
                <DashboardHeader object={{ name: 'Overview' }} translationKey="CAMPAIGN" />
                <Row gutter={10} className="table-line">
                    <Card buttons={buttons} >
                        <Row gutter={10} className="table-line">
                            <DashboardVisitAreaChart
                                hasFetchedVisitReport={this.state.hasFetchedVisitReport}
                                isFetchingVisitReport={this.state.isFetchingVisitReport}
                                report={this.state.report}
                            />
                        </Row>
                    </Card>
                </Row>
            </div>);
    }
}

export default DashboardContent;
