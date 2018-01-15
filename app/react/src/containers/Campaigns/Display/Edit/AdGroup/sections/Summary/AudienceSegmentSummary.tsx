import * as React from 'react';
import {
  AdGroupFormData,
  AD_GROUP_FORM_NAME,
  SegmentFieldModel,
} from '../../domain';
import { getFormValues } from 'redux-form';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import WhenDatamart from '../../../../../../Datamart/WhenDatamart';
import { printStringArray } from './utils';

interface MapStateProps {
  segmentFields: SegmentFieldModel[];
}

type Props = MapStateProps & InjectedIntlProps;

class AudienceSegmentSummary extends React.Component<Props> {
  render() {
    const { segmentFields } = this.props;

    const includedSegmentNames = segmentFields
      .filter(field => !field.model.exclude)
      .map(field => field.meta.name);

    const excludedSegmentNames = segmentFields
      .filter(field => field.model.exclude)
      .map(field => field.meta.name);

    let content = null;

    if (
      includedSegmentNames.length === 0 &&
      excludedSegmentNames.length === 0
    ) {
      content = (
        <FormattedMessage
          id="ad-group-form-summary-segments-none"
          defaultMessage="Your ads will target everyone"
        />
      );
    } else if (
      includedSegmentNames.length > 0 &&
      excludedSegmentNames.length === 0
    ) {
      content = (
        <div>
          <FormattedMessage
            id="ad-group-form-summary-segments-include_only"
            defaultMessage="Your ads will target the following {segmentCount, plural , one {segment} other {segments} }"
            values={{
              segmentCount: includedSegmentNames.length
            }}
          />
          <p className="info-color">{printStringArray(includedSegmentNames)}</p>
        </div>
      );
    } else if (
      includedSegmentNames.length === 0 &&
      excludedSegmentNames.length > 0
    ) {
      content = (
        <div className="error-color">
          <FormattedMessage
            id="ad-group-form-summary-segments-exclude_only"
            defaultMessage="Please target at least one segment"
          />
        </div>
      );
    } else if (
      includedSegmentNames.length > 0 &&
      excludedSegmentNames.length > 0
    ) {
      content = (
        <div>
          <FormattedMessage
            id="ad-group-form-summary-segments-include"
            defaultMessage="Your ads will target the following {segmentCount, plural , one {segment} other {segments} }"
            values={{
              segmentCount: includedSegmentNames.length
            }}
          />
          <p className="info-color">{printStringArray(includedSegmentNames)}</p>
          <br />
          <FormattedMessage
            id="ad-group-form-summary-segments-exclude"
            defaultMessage="Your ads will no target the following {segmentCount, plural , one {segment} other {segments} }"
            values={{
              segmentCount: excludedSegmentNames.length
            }}
          />
          <p className="info-color">{printStringArray(excludedSegmentNames)}</p>
        </div>
      );
    }

    return <WhenDatamart>{content}</WhenDatamart>;
  }
}

const getAdGroupFormData = (state: any): AdGroupFormData => {
  return getFormValues(AD_GROUP_FORM_NAME)(state) as AdGroupFormData;
};

export default compose(
  injectIntl,
  connect(state => ({
    segmentFields: getAdGroupFormData(state).segmentFields,
  })),
)(AudienceSegmentSummary);
