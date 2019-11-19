import * as React from 'react';
import { buildFeedStatsByFeedRequestBody } from '../../../../../../utils/FeedsStatsReportHelper';
import { IFeedsStatsService } from '../../../../../../services/FeedsStatsService';
import { TYPES } from '../../../../../../constants/types';
import { lazyInject } from '../../../../../../config/inversify.config';
import { normalizeReportView } from '../../../../../../utils/MetricHelper';
import StackedAreaPlot from '../../../../../../components/Charts/TimeBased/StackedAreaPlot';
import { LoadingChart } from '../../../../../../components/EmptyCharts';
import { defineMessages, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import injectThemeColors, { InjectedThemeColorsProps } from '../../../../../Helpers/injectThemeColors';

interface FeedChartProps {
    organisationId: string;
    feedId: string;
}

type Props = FeedChartProps & InjectedThemeColorsProps;

interface FeedReport {
    day: string;
    upserted_user_points: number;
    deleted_user_points: number;
}

interface State {
    dataSource: FeedReport[];
    dateRange: DateRange;
    isLoading: boolean;
}

interface DateRange {
    from: string;
    to: string;
}

class FeedChart extends React.Component<Props, State> {
    @lazyInject(TYPES.IFeedsStatsService)
    private _feedsStatsService: IFeedsStatsService;

    constructor(props: Props) {
        super(props);

        this.state = {
            dataSource: [],
            isLoading: true,
            dateRange: {
                from: '2019-09-01',
                to: '2019-09-08',
            },
        };
    }

    componentDidMount() {
        this.fetchStats();
    }

    fetchStats() {
        const { organisationId, feedId } = this.props;
        const {
            dateRange: { from, to },
        } = this.state;

        this.setState({
            isLoading: true,
        });

        const reportBody = buildFeedStatsByFeedRequestBody(feedId);
        return this._feedsStatsService
            .getStats(organisationId, reportBody)
            .then(res => {
                const normalized = normalizeReportView<{
                    day: string;
                    sync_type: string;
                    uniq_user_identifiers_count: number;
                }>(res.data.report_view);

                const upserts = normalized.filter(rv => rv.sync_type === 'UPSERT');
                const deletes = normalized.filter(rv => rv.sync_type === 'DELETE');

                let feedReports = upserts.map(upsertReport => {
                    const deleteReport = deletes.find(r => r.day === upsertReport.day);

                    return {
                        day: upsertReport.day,
                        upserted_user_points: upsertReport.uniq_user_identifiers_count,
                        deleted_user_points: deleteReport ? deleteReport.uniq_user_identifiers_count : 0,
                    } as FeedReport;
                });

				if (!feedReports.find(fr => fr.day === from))
					feedReports = [{
						day: from,
						upserted_user_points: 0,
						deleted_user_points: 0
					}].concat(feedReports);

				if (!feedReports.find(fr => fr.day === to))
					feedReports.push({
						day: to,
						upserted_user_points: 0,
						deleted_user_points: 0
					});

                return this.setState({
                    dataSource: feedReports,
                    isLoading: false,
                });
            })
            .catch(() => {
                this.setState({
                    isLoading: false,
                });
            });
    }

    render() {
        const { colors } = this.props;
        const { dataSource, isLoading } = this.state;

        const metrics = dataSource && dataSource[0] ? Object.keys(dataSource[0]).filter(el => el !== 'day') : [];

        const optionsForChart = {
            xKey: 'day',
            yKeys: metrics.map(metric => {
                return {
                    key: metric,
                    message: messagesMap[metric],
                };
            }),
            colors: [colors['mcs-info'], colors['mcs-error']],
        };

        return !isLoading ? (
			<StackedAreaPlot dataset={dataSource as any} options={optionsForChart} />
        ) : (
            <LoadingChart />
        );
    }
}

export default compose<Props, FeedChartProps>(injectThemeColors)(FeedChart);

const messagesMap: {
    [metric: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
    upserted_user_points: {
        id: 'feed.upserted_user_points',
        defaultMessage: 'Upserted User Points',
    },
    deleted_user_points: {
        id: 'feed.deleted_user_points',
        defaultMessage: 'Deleted User Points',
    },
});
