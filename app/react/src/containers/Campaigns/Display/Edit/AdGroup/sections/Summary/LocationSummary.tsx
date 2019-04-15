import * as React from 'react';
import {
  AdGroupFormData,
  AD_GROUP_FORM_NAME,
  LocationFieldModel,
} from '../../domain';
import { getFormValues } from 'redux-form';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import ObjectRenderer from '../../../../../../ObjectRenderer/ObjectRenderer';
import GeonameService, { Geoname } from '../../../../../../../services/GeonameService';

interface MapStateProps {
  locationFields: LocationFieldModel[];
}

type Props = MapStateProps & InjectedIntlProps;

function printGeonames(geonameIds: string[] = []) {
  return geonameIds.map((id, index) => {
    const isLast = index === geonameIds.length - 1;
    const renderMethod = (g: Geoname) => <span>{g.name}</span>
    return (
      <span key={id}>
        <ObjectRenderer id={id} fetchingMethod={GeonameService.getGeoname} renderMethod={renderMethod} />
        { isLast ? '' : ', ' }
      </span>
    );
  });
}

class LocationSummary extends React.Component<Props> {
  render() {
    const { locationFields } = this.props;

    const includedLocations = locationFields
      .filter(field => !field.model.exclude)
      .map(field => field.model.geoname_id);

    const excludedLocations = locationFields
      .filter(field => field.model.exclude)
      .map(field => field.model.geoname_id);

    let content = null;

    if (includedLocations.length === 0 && excludedLocations.length === 0) {
      content = (
        <FormattedMessage
          id="display.campaign.edit.adGroup.locationSummary.noLocaton"
          defaultMessage="Your ad group is not restricted on a particular location"
        />
      );
    } else if (includedLocations.length > 0 && excludedLocations.length === 0) {
      content = (
        <div>
          <FormattedMessage
            id="display.campaign.edit.adGroup.locationSummary.includeOnly"
            defaultMessage="Your ad group is restrited to the following {locationCount, plural , one {location} other {locations} }"
            values={{
              locationCount: includedLocations.length,
            }}
          />
          <p className="info-color">{printGeonames(includedLocations)}</p>
        </div>
      );
    } else if (includedLocations.length === 0 && excludedLocations.length > 0) {
      content = (
        <div>
          <FormattedMessage
            id="display.campaign.edit.adGroup.locationSummary.excludeonly"
            defaultMessage="Your ad group will run everywhere except on the following {locationCount, plural , one {location} other {locations} }"
            values={{
              locationCount: excludedLocations.length,
            }}
          />
          <p className="info-color">{printGeonames(excludedLocations)}</p>
        </div>
      );
    } else if (includedLocations.length > 0 && excludedLocations.length > 0) {
      content = (
        <div>
          <FormattedMessage
            id="display.campaign.edit.adGroup.locationSummary.include"
            defaultMessage="Your ad group is restrited to the following {locationCount, plural , one {location} other {locations} }"
            values={{
              locationCount: includedLocations.length,
            }}
          />
          <p className="info-color">{printGeonames(includedLocations)}</p>
          <br />
          <FormattedMessage
            id="display.campaign.edit.adGroup.locationSummary.exclude"
            defaultMessage="Except"
          />
          <p className="info-color">{printGeonames(excludedLocations)}</p>
        </div>
      );
    }

    return <div>{content}</div>;
  }
}

const getAdGroupFormData = (state: any): AdGroupFormData => {
  return getFormValues(AD_GROUP_FORM_NAME)(state) as AdGroupFormData;
};

export default compose(
  injectIntl,
  connect(state => ({
    locationFields: getAdGroupFormData(state).locationFields,
  })),
)(LocationSummary);
