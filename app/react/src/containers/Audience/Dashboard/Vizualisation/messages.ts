import { defineMessages } from 'react-intl';

export default defineMessages({
  count: {
    id: 'chart.date.aggregation.otql.count',
    defaultMessage: 'Count',
  },
  noData: {
    id: 'chart.otql.dashboard.common.noData',
    defaultMessage: 'There is no data for your query. Please retry later!',
  },
  error: {
    id: 'chart.otql.dashboard.common.error',
    defaultMessage: 'there was an error generating your chart, please retry',
  },
});
