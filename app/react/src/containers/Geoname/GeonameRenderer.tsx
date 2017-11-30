import React from 'react';
import GeonameService, { Geoname } from './../../services/GeonameService';

interface GeonameRendererProps {
    id: string;
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
    this.fetchGeoname(this.props.id);
  }

  componentWillReceiveProps(nextProps: GeonameRendererProps) {
    this.fetchGeoname(this.props.id);
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
