import * as React from 'react';
import _ from 'lodash';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { messages } from '../../messages';
import { FormSection } from '../../../../../../components/Form';
import { SchemaItem } from '../../../../../QueryTool/JSONOTQL/domain';
import { Card } from '@mediarithmics-private/mcs-components-library';
import AudienceFeatureVariable from '../../../../../Audience/AudienceBuilder/QueryFragmentBuilders/AudienceFeatureVariable';
import { withRouter, RouteComponentProps } from 'react-router';
import { AudienceFeatureFormData } from '../domain';

interface AudienceFeaturePreviewProps {
  schema?: SchemaItem;
  formValues?: AudienceFeatureFormData;
}

type Props = AudienceFeaturePreviewProps &
  InjectedIntlProps &
  RouteComponentProps<{ datamartId: string }>;

class AudienceFeaturePreview extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const {
      intl: { formatMessage },
      match: {
        params: { datamartId },
      },
      formValues,
    } = this.props;

    return (
      <div className="mcs-audienceFeature-preview">
        <FormSection title={messages.audienceFeaturePreview} />
        <Card
          className="mcs-audienceFeature_card"
          title={formatMessage(messages.audienceFeatures)}
        >
          <div className="mcs-audienceFeature_cardContainer">
            <div className="mcs-audienceFeature_name">{formValues?.name}</div>
            <i className="mcs-audienceFeature_description">
              {formValues?.description}
            </i>
            {formValues?.variables?.map((v, index) => {
              return (
                <AudienceFeatureVariable
                  newLayout={false}
                  key={index}
                  disabled={true}
                  datamartId={datamartId}
                  variable={v}
                  objectTypes={[]}
                  formPath={''}
                />
              );
            })}
          </div>
        </Card>
      </div>
    );
  }
}

export default compose<Props, AudienceFeaturePreviewProps>(
  injectIntl,
  withRouter,
)(AudienceFeaturePreview);
