import * as React from 'react';
import { Row } from 'antd';
import { ButtonStyleless } from '../../../../../../../components';
import McsIcons, { McsIconType } from '../../../../../../../components/McsIcons';
import { LocationFieldModel } from './domain';
import GeonameService, { Geoname } from '../../../../../../../services/GeonameService';
import { normalizeArrayOfObject } from '../../../../../../../utils/Normalizer';

interface Props {
  locationFields: LocationFieldModel[];
  onClickOnRemove: (locationField: LocationFieldModel) => void;
}

interface State {
  geonameByGeonameId: { [geonameId: string]: Geoname };
}

class LocationSelectionRenderer extends React.Component<Props, State> {

  static defaultProps: Partial<Props> = {
    locationFields: [],
  };

  constructor(props: Props) {
    super(props);
    this.state = { geonameByGeonameId: {} };
  }

  componentDidMount() {
    this.fetchGeonames(this.props.locationFields.map(s => s.resource.geoname_id));
  }

  componentWillReceiveProps(nextProps: Props) {
    this.fetchGeonames(nextProps.locationFields.map(s => s.resource.geoname_id));
  }

  fetchGeonames = (geonameIds: string[]) => {
    Promise.all(
      geonameIds.map(id => GeonameService.getGeoname(id)),
    ).then(geonames => {
      this.setState({ geonameByGeonameId: normalizeArrayOfObject(geonames, 'id')});
    });
  }

  render() {

    const {
      locationFields,
      onClickOnRemove,
    } = this.props;

    const {
      geonameByGeonameId,
    } = this.state;

    return (
      <div>
        <Row
          type="flex"
          align="middle"
          justify="space-between"
          className={locationFields.length !== 0 ? 'search-result-box' : 'hide-section'}
        >
          {locationFields.map(locationField => {

            const handleOnClick = () => onClickOnRemove(locationField);
            const iconType: McsIconType = locationField.resource.exclude ? 'close-big' : 'check';
            const geonameName = geonameByGeonameId[locationField.resource.geoname_id].name;

            return (
              <div className={'search-result-box-item'} key={locationField.id}>
                <McsIcons type={iconType} />
                {geonameName}
                <ButtonStyleless
                  className="close-button"
                  onClick={handleOnClick}
                >
                  <McsIcons type="close" />
                </ButtonStyleless>
              </div>
            );
          })}
        </Row>
      </div>
    );
  }
}

export default LocationSelectionRenderer;
