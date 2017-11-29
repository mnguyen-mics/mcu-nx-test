import * as React from 'react';

import { GenericFieldArray, Field, FieldArray, InjectedFormProps } from 'redux-form';

import messages from '../../../messages';
import LocationTargeting, { LocationTargetingProps } from './LocationTargeting';
import { FormSection } from '../../../../../../../components/Form';

const LocationTargetingFieldArray = FieldArray as new() => GenericFieldArray<Field, LocationTargetingProps>;

export interface Props {
  RxF: InjectedFormProps;
}

class LocationSection extends React.Component<Props> {

  render() {

    return (
      <div id="locationTargeting" className="locationTargeting">
        <FormSection
          subtitle={messages.sectionSubtitleLocation}
          title={messages.sectionTitleLocationTargeting}
        />

        <LocationTargetingFieldArray
          name="locationTargetingTable"
          component={LocationTargeting}
          RxF={this.props.RxF}
        />

      </div>

    );
  }
}

export default LocationSection;
