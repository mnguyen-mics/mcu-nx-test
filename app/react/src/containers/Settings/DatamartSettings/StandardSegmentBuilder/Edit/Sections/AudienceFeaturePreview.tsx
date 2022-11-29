import * as React from 'react';
import _ from 'lodash';
import { compose } from 'recompose';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { messages } from '../../messages';
import { FormSection } from '../../../../../../components/Form';
import { SchemaItem } from '../../../../../Audience/AdvancedSegmentBuilder/domain';
import { Card } from '@mediarithmics-private/mcs-components-library';
import AudienceFeatureLayout from '../../../../../Audience/StandardSegmentBuilder/QueryFragmentBuilders/AudienceFeatureLayout';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { AudienceFeatureFormData } from '../domain';
import { AudienceFeatureResource } from '../../../../../../models/audienceFeature';

interface AudienceFeaturePreviewProps {
  schema?: SchemaItem;
  formValues?: AudienceFeatureFormData;
}

type Props = AudienceFeaturePreviewProps &
  WrappedComponentProps &
  RouteComponentProps<{ datamartId: string }>;

class AudienceFeaturePreview extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const {
      match: {
        params: { datamartId },
      },
      formValues,
    } = this.props;

    const audienceFeature = formValues && [formValues as AudienceFeatureResource];

    return (
      <div className='mcs-audienceFeature-preview'>
        <FormSection title={messages.audienceFeaturePreview} />
        <Card className='mcs-audienceFeature_card'>
          <AudienceFeatureLayout
            formPath={''}
            datamartId={datamartId}
            objectTypes={[]}
            audienceFeatures={audienceFeature}
            disabled={true}
          />
        </Card>
      </div>
    );
  }
}

export default compose<Props, AudienceFeaturePreviewProps>(
  injectIntl,
  withRouter,
)(AudienceFeaturePreview);
