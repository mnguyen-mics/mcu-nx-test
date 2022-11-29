import * as React from 'react';
import { compose } from 'recompose';
import { defineMessages, MessageDescriptor, WrappedComponentProps, injectIntl } from 'react-intl';
import { FeedStatsInfo } from './FeedStats';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { getAllDates } from '../../../../../../utils/DateHelper';
import { formatMcsDate } from '../../../../../../utils/McsMoment';

const messages: {
  [key: string]: MessageDescriptor;
} = defineMessages({
  graphTitle: {
    id: 'feed.stats.graph.title',
    defaultMessage: 'Matching keys sent to the destination platform',
  },
  upsertsSent: {
    id: 'feed.stats.graph.upsertsSentSerie',
    defaultMessage: 'Upserts sent',
  },
  deletesSent: {
    id: 'feed.stats.graph.deletesSentSerie',
    defaultMessage: 'Deletes sent',
  },
});

interface FeedStatsGraphProps {
  stats: FeedStatsInfo;
}

type Props = FeedStatsGraphProps & WrappedComponentProps;

class FeedStatsGraph extends React.Component<Props> {
  render() {
    const {
      intl: { formatMessage },
      stats,
    } = this.props;

    const allDates = getAllDates(stats.timeUnit, formatMcsDate(stats.dateRange));

    const serie = allDates.map(d => {
      return (
        stats.graphInfo.find(line => {
          return line.date === d;
        }) || {
          date: d,
          nbSuccessUpserts: 0,
          nbSuccessDeletes: 0,
        }
      );
    });

    const chartOptions: Highcharts.Options = {
      chart: {
        type: 'column',
      },
      title: { text: '' },
      plotOptions: {
        column: {
          stacking: 'normal',
        },
      },
      tooltip: {
        shared: true,
        useHTML: false,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: '#e8e8e8',
        padding: 15,
        outside: false,
        shadow: false,
        hideDelay: 0,
        formatter() {
          const header = `<span style="font-size: 12px; font-weight: bold; margin-bottom: 13px;">${this.x}</span><br/><br/>`;
          const points = !this.points
            ? []
            : this.points?.map(point => {
                return `<span style="color:${
                  point.color
                }; font-size: 20px; margin-right: 20px;">\u25CF</span> ${
                  point.series.name
                }: <b>${Math.abs(point.y)}</b><br/>`;
              });

          return header.concat(...points);
        },
      },
      xAxis: {
        categories: allDates,
        crosshair: true,
      },
      yAxis: {
        title: {
          text: null,
        },
        labels: {
          formatter: function () {
            return Math.abs(this.value) + '';
          },
        },
      },
      series: [
        {
          name: formatMessage(messages.upsertsSent),
          data: serie.map(l => l.nbSuccessUpserts),
          type: 'column',
          color: '#00AB67',
        },
        {
          name: formatMessage(messages.deletesSent),
          data: serie.map(l => {
            return -l.nbSuccessDeletes;
          }),
          type: 'column',
          color: '#FC3F48',
        },
      ],
    };

    return (
      <div className='mcs-feedStats_graph'>
        <div className='mcs-feedStats_graph_title'>{formatMessage(messages.graphTitle)}</div>
        <HighchartsReact
          className='mcs-feedStats_graph_displayedGraph'
          highcharts={Highcharts}
          options={{ ...chartOptions }}
        />
      </div>
    );
  }
}

export default compose<Props, FeedStatsGraphProps>(injectIntl)(FeedStatsGraph);
