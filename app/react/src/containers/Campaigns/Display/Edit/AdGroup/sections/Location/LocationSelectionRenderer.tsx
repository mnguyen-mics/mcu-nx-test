import * as React from 'react';
import { Row } from 'antd';
import { ButtonStyleless } from '../../../../../../../components';
import McsIcons, { McsIconType } from '../../../../../../../components/McsIcons';
import { LocationFieldModel } from '../../domain';
import { Geoname } from '../../../../../../../services/GeonameService';
import GeonameRenderer from '../../../../../../../containers/Geoname/GeonameRenderer';

interface Props {
  locationFields: LocationFieldModel[];
  onClickOnRemove: (locationField: LocationFieldModel, index: number) => void;
}

class LocationSelectionRenderer extends React.Component<Props> {

  static defaultProps: Partial<Props> = {
    locationFields: [],
  };

  render() {

    const {
      locationFields,
      onClickOnRemove,
    } = this.props;

    return (
      <div>
        <Row
          type="flex"
          align="middle"
          justify="space-between"
          className={locationFields.length !== 0 ? 'search-result-box' : 'hide-section'}
        >
          {locationFields.map((locationField, index) => {

            const handleOnClick = () => onClickOnRemove(locationField, index);
            const iconType: McsIconType = locationField.model.exclude ? 'close-big' : 'check';
            const renderGeoname = (geoname: Geoname) => <span>{geoname.name}</span>;

            return (
              <div className={'search-result-box-item'} key={locationField.key}>
                <McsIcons type={iconType} />
                <GeonameRenderer
                  key={locationField.key}
                  geonameId={locationField.model.geoname_id}
                  renderMethod={renderGeoname}
                />
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
