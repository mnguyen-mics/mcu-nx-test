import React from 'react';
import Highcharts from 'highcharts/highmaps';
import cuid from 'cuid';
import { MapSeriesDataOptions } from '../../../../../models/datamartUsersAnalytics/datamartUsersAnalytics';

export interface GenericWorldMapProps {
  options: Highcharts.Options;
  dataset: MapSeriesDataOptions[];
}

class GenericWorldMap extends React.Component<GenericWorldMapProps> {
  cuid: string;

  constructor(props: GenericWorldMapProps) {
    super(props);
    this.cuid = cuid();
  }

  componentDidMount() {
    const { options, dataset } = this.props;
    this.generateMap(options, dataset);
  }

  generateMap = (options: Highcharts.Options, dataset: MapSeriesDataOptions[]) => {
    if (dataset[0].code3) {
      Highcharts.createElement('link', {}, undefined, document.getElementsByTagName('head')[0]);

      options.series = [
        {
          data: dataset,
          mapData: (Highcharts as any).maps['custom/world'],
          joinBy: ['iso-a3', 'code3'] as any,
          type: 'map',
        },
      ];

      Highcharts.mapChart(this.cuid, options);
    }
  };
  render() {
    return <div id={this.cuid} />;
  }
}

export default GenericWorldMap;
