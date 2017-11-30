import React from 'react';
import GeonameService, { Geoname } from './../../services/GeonameService';

interface GeonameRendererProps {
    geonameId: string;
    renderMethod: (geoname: Geoname) => JSX.Element;
}

interface GeonameRendererState {
  geoname?: Geoname;
}

export default class GeonameRenderer extends React.Component<GeonameRendererProps, GeonameRendererState> {

  constructor(props: GeonameRendererProps) {
    super(props);
    this.state = { geoname: undefined };
  }

  componentDidMount() {
    this.fetchGeoname(this.props.geonameId);
  }

  componentWillReceiveProps(nextProps: GeonameRendererProps) {
    this.fetchGeoname(this.props.geonameId);
  }

  fetchGeoname = (geonameId: string) => {
   return GeonameService.getGeoname(geonameId)
   .then(geoname => {
     this.setState({
      geoname: geoname,
     });
    });
  }

  render() {

    const {
      geoname,
    } = this.state;

    const element = geoname ? this.props.renderMethod(geoname) : null;

    return (
      <span>{element}</span>
    );
  }
}
