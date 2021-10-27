import * as React from 'react';
import { AdGroupFormData, AD_GROUP_FORM_NAME } from '../../domain';
import { getFormValues } from 'redux-form';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import WhenDatamart from '../../../../../../Datamart/WhenDatamart';
import { printStringArray } from './utils';
import { SegmentFieldModel } from '../../../../../Email/Edit/domain';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';

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

    if (includedSegmentNames.length === 0 && excludedSegmentNames.length === 0) {
      content = (
        <FormattedMessage
          id='display.campaign.edit.adGroup.summarySection.noSegment'
          defaultMessage='Your ads will target everyone'
        />
      );
    } else if (includedSegmentNames.length > 0 && excludedSegmentNames.length === 0) {
      content = (
        <div>
          <FormattedMessage
            id='display.campaign.edit.adGroup.summarySection.includeOnly'
            defaultMessage='Your ads will target the following {segmentCount, plural , one {segment} other {segments} }'
            values={{
              segmentCount: includedSegmentNames.length,
            }}
          />
          <p className='info-color'>{printStringArray(includedSegmentNames)}</p>
        </div>
      );
    } else if (includedSegmentNames.length === 0 && excludedSegmentNames.length > 0) {
      content = (
        <div className='error-color'>
          <FormattedMessage
            id='display.campaign.edit.adGroup.summarySection.excludeOnly'
            defaultMessage='Please target at least one segment'
          />
        </div>
      );
    } else if (includedSegmentNames.length > 0 && excludedSegmentNames.length > 0) {
      content = (
        <div>
          <FormattedMessage
            id='display.campaign.edit.adGroup.summarySection.include'
            defaultMessage='Your ads will target the following {segmentCount, plural , one {segment} other {segments} }'
            values={{
              segmentCount: includedSegmentNames.length,
            }}
          />
          <p className='info-color'>{printStringArray(includedSegmentNames)}</p>
          <br />
          <FormattedMessage
            id='display.campaign.edit.adGroup.summarySection.exclude'
            defaultMessage='Your ads will no target the following {segmentCount, plural , one {segment} other {segments} }'
            values={{
              segmentCount: excludedSegmentNames.length,
            }}
          />
          <p className='info-color'>{printStringArray(excludedSegmentNames)}</p>
        </div>
      );
    }

    return <WhenDatamart>{content}</WhenDatamart>;
  }
}

const getAdGroupFormData = (state: MicsReduxState): AdGroupFormData => {
  return getFormValues(AD_GROUP_FORM_NAME)(state) as AdGroupFormData;
};

export default compose(
  injectIntl,
  connect((state: MicsReduxState) => ({
    segmentFields: getAdGroupFormData(state).segmentFields,
  })),
)(AudienceSegmentSummary);
