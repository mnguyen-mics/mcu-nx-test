import React from 'react';
import GeonameService, { Geoname } from './../../services/GeonameService';
import { makeCancelable, CancelablePromise } from '../../utils/ApiHelper';

interface GeonameRendererProps {
  geonameId: string;
  renderMethod?: (geoname: Geoname) => JSX.Element;
}

interface GeonameRendererState {
  geoname?: Geoname;
}

export default class GeonameRenderer extends React.Component<
  GeonameRendererProps,
  GeonameRendererState
> {
  cancelablePromise: CancelablePromise<Geoname>;

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

  componentWillUnmount() {
    if (this.cancelablePromise) this.cancelablePromise.cancel();
  }

  fetchGeoname = (geonameId: string) => {
    this.cancelablePromise = makeCancelable(
      GeonameService.getGeoname(geonameId),
    );

    return this.cancelablePromise.promise.then(geoname => {
      this.setState({
        geoname: geoname,
      });
    });
  };

  render() {
    const { renderMethod } = this.props;

    const { geoname } = this.state;

    const element = geoname
      ? renderMethod ? renderMethod(geoname) : geoname.name
      : null;

    return <span>{element}</span>;
  }
}
