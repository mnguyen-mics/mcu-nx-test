import * as React from 'react';
import { Row } from 'antd';
import { Button, McsIcon } from '@mediarithmics-private/mcs-components-library';
import { LocationFieldModel } from '../../domain';
import { Geoname, IGeonameService } from '../../../../../../../services/GeonameService';
import ObjectRenderer from '../../../../../../../containers/ObjectRenderer/ObjectRenderer';
import { lazyInject } from '../../../../../../../config/inversify.config';
import { TYPES } from '../../../../../../../constants/types';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';

interface Props {
  locationFields: LocationFieldModel[];
  onClickOnRemove: (locationField: LocationFieldModel, index: number) => void;
  disabled?: boolean;
}

class LocationSelectionRenderer extends React.Component<Props> {
  static defaultProps: Partial<Props> = {
    locationFields: [],
  };

  @lazyInject(TYPES.IGeonameService)
  private _geonameService: IGeonameService;

  render() {
    const { locationFields, onClickOnRemove, disabled } = this.props;

    return (
      <div>
        <Row
          align='middle'
          justify='space-between'
          className={locationFields.length !== 0 ? 'search-result-box' : 'hide-section'}
        >
          {locationFields.map((locationField, index) => {
            const handleOnClick = () =>
              !!disabled ? undefined : onClickOnRemove(locationField, index);
            const iconType: McsIconType = locationField.model.exclude ? 'close-big' : 'check';
            const renderGeoname = (geoname: Geoname) => <span>{geoname.name}</span>;

            return (
              <div className={'search-result-box-item'} key={locationField.key}>
                <McsIcon type={iconType} />
                <ObjectRenderer
                  key={locationField.key}
                  id={locationField.model.geoname_id}
                  renderMethod={renderGeoname}
                  fetchingMethod={this._geonameService.getGeoname}
                />
                <Button className='close-button' onClick={handleOnClick} disabled={!!disabled}>
                  <McsIcon type='close' />
                </Button>
              </div>
            );
          })}
        </Row>
      </div>
    );
  }
}

export default LocationSelectionRenderer;
