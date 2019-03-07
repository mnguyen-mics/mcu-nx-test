import * as React from 'react';
import { Row } from 'antd';
import { ButtonStyleless } from '../../../../../../../components';
import McsIcon, { McsIconType } from '../../../../../../../components/McsIcon';
import { LocationFieldModel } from '../../domain';
import GeonameService, { Geoname } from '../../../../../../../services/GeonameService';
import ObjectRenderer from '../../../../../../../containers/ObjectRenderer/ObjectRenderer';

interface Props {
  locationFields: LocationFieldModel[];
  onClickOnRemove: (locationField: LocationFieldModel, index: number) => void;
  disabled?: boolean;
}

class LocationSelectionRenderer extends React.Component<Props> {

  static defaultProps: Partial<Props> = {
    locationFields: [],
  };

  render() {

    const {
      locationFields,
      onClickOnRemove,
      disabled
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

            const handleOnClick = () => !!disabled ? undefined : onClickOnRemove(locationField, index);
            const iconType: McsIconType = locationField.model.exclude ? 'close-big' : 'check';
            const renderGeoname = (geoname: Geoname) => <span>{geoname.name}</span>;

            return (
              <div className={'search-result-box-item'} key={locationField.key}>
                <McsIcon type={iconType} />
                <ObjectRenderer
                  key={locationField.key}
                  id={locationField.model.geoname_id}
                  renderMethod={renderGeoname}
                  fetchingMethod={GeonameService.getGeoname}
                />
                <ButtonStyleless
                  className="close-button"
                  onClick={handleOnClick}
                  disabled={!!disabled}
                >
                  <McsIcon type="close" />
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
