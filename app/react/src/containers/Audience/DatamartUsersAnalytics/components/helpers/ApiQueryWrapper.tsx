import * as React from 'react';
import FormatData from './FormatData';
import { Chart } from '../../../../../models/datamartUsersAnalytics/datamartUsersAnalytics';
import { IDatamartUsersAnalyticsService } from '../../../../../services/DatamartUsersAnalyticsService';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { ReportView } from '../../../../../models/ReportView';
import { LoadingChart } from '../../../../../components/EmptyCharts';

export interface ApiQueryWrapperProps {
    charts: Chart[];
    datamartId: string;
}

interface State {
    loading: boolean;
    reportViewApiResponse?: ReportView
}

class ApiQueryWrapper extends React.Component<ApiQueryWrapperProps, State> {
    @lazyInject(TYPES.IDatamartUsersAnalyticsService)
    private _datamartUsersAnalyticsService: IDatamartUsersAnalyticsService;

    constructor(props: ApiQueryWrapperProps) {
        super(props);

        this.state = {
            loading: true,
            reportViewApiResponse: undefined
        };
    }

    fetchAnalytics = (datamartId: string) => {
        return this._datamartUsersAnalyticsService.getAnalytics(datamartId)
            .then(res => {
                this.setState({
                    loading: false,
                    reportViewApiResponse: res.data.report_view
                });
            });
    }

    componentDidMount() {
        const { datamartId } = this.props;
        this.fetchAnalytics(datamartId)
    }

    render() {
        const { charts } = this.props;
        const { loading, reportViewApiResponse } = this.state;

        if (loading) return <LoadingChart />
        return (<div>{reportViewApiResponse && <FormatData apiResponse={reportViewApiResponse} charts={charts} />}</div>)
    }
}

export default ApiQueryWrapper;
