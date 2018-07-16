import * as React from 'react';
import {
  AdGroupFormData,
  AD_GROUP_FORM_NAME,
  PlacementListFieldModel,
} from '../../domain';
import { getFormValues } from 'redux-form';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { printStringArray } from './utils';

interface MapStateProps {
  placementListFields: PlacementListFieldModel[];
}

type Props = MapStateProps & InjectedIntlProps;

class PlacementListSummary extends React.Component<Props> {
  render() {
    const { placementListFields } = this.props;

    const includedPlacementLists = placementListFields
      .filter(field => !field.model.exclude)
      .map(field => field.meta.name);

    const excludedPlacementLists = placementListFields
      .filter(field => field.model.exclude)
      .map(field => field.meta.name);

    let content = null;

    if (
      includedPlacementLists.length === 0 &&
      excludedPlacementLists.length === 0
    ) {
      content = (
        <FormattedMessage
          id="ad-group-form-summary-placementlist-none"
          defaultMessage="Your ad group does not target a particular placement list"
        />
      );
    } else if (
      includedPlacementLists.length > 0 &&
      excludedPlacementLists.length === 0
    ) {
      content = (
        <div>
          <FormattedMessage
            id="ad-group-form-summary-placementlist-include_only"
            defaultMessage="Your ad group will target the following {placementListCount, plural , one {placement list} other {placement lists} }"
            values={{
              placementListCount: includedPlacementLists.length,
            }}
          />
          <p className="info-color">
            {printStringArray(includedPlacementLists)}
          </p>
        </div>
      );
    } else if (
      includedPlacementLists.length === 0 &&
      excludedPlacementLists.length > 0
    ) {
      content = (
        <div>
          <FormattedMessage
            id="ad-group-form-summary-placementlist-exclude_only"
            defaultMessage="Your ad group will exclude the following {placementListCount, plural , one {placement list} other {placement lists} }"
            values={{
              placementListCount: excludedPlacementLists.length,
            }}
          />
          <p className="info-color">
            {printStringArray(excludedPlacementLists)}
          </p>
        </div>
      );
    } else if (
      includedPlacementLists.length > 0 &&
      excludedPlacementLists.length > 0
    ) {
      content = (
        <div>
          <FormattedMessage
            id="ad-group-form-summary-placementlist-include"
            defaultMessage="Your ad group will target the following {placementListCount, plural , one {placement list} other {placement lists} }"
            values={{
              placementListCount: includedPlacementLists.length,
            }}
          />
          <p className="info-color">
            {printStringArray(includedPlacementLists)}
          </p>
          <br />
          <FormattedMessage
            id="ad-group-form-summary-placementlist-exclude"
            defaultMessage="Your ad group will exclude the following {placementListCount, plural , one {placement list} other {placement lists} }"
            values={{
              placementListCount: excludedPlacementLists.length,
            }}
          />
          <p className="info-color">
            {printStringArray(excludedPlacementLists)}
          </p>
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
    placementListFields: getAdGroupFormData(state).inventoryCatalFields,
  })),
)(PlacementListSummary);
