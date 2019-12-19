import React from 'react';
import Highcharts from 'highcharts/highmaps';
import world from '../../../../../components/Charts/world';
import log from '../../../../../utils/Logger';
import cuid from 'cuid';

export interface GenericWorldMapProps {
  options: any;
  dataset: any;
}

class GenericWorldMap extends React.Component<GenericWorldMapProps> {

  cuid: string;

  constructor(props: GenericWorldMapProps) {
    super(props);
    this.cuid = cuid();
  }

  componentDidCatch() {
    log.info(world);
  }

  componentDidMount() {
    const { options, dataset } = this.props;
    this.generateMap(options, dataset);
  }

  generateMap = (options: any, dataset: any) => {
    Highcharts.createElement(
      'link',
      {},
      undefined,
      document.getElementsByTagName('head')[0],
    );
    

    options.series =[{
      data: dataset,
      mapData: (Highcharts as any).maps['custom/world'],
      joinBy: ['iso-a3', 'code3'] as any,
      type: 'map'
    }];
    
    Highcharts.mapChart(this.cuid, options);

  };
  render() {
    return <div id={this.cuid} />;
  }



}

export default GenericWorldMap;