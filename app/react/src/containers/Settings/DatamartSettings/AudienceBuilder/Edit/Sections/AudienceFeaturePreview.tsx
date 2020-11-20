import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { messages } from '../../messages';
import { FormSection } from '../../../../../../components/Form';
import { SchemaItem } from '../../../../../QueryTool/JSONOTQL/domain';
import { Card } from '@mediarithmics-private/mcs-components-library';
import AudienceFeatureVariable from '../../../../../Audience/AudienceBuilder/QueryFragmentBuilders/AudienceFeatureVariable';
import { withRouter, RouteComponentProps } from 'react-router';
import { AudienceFeatureResource } from '../../../../../../models/audienceFeature';

interface AudienceFeaturePreviewProps {
  schema?: SchemaItem;
  associatedQuery?: string;
}

const audienceFeature: AudienceFeatureResource = {
  id: '27',
  datamart_id: '1162',
  name: 'Test - activity nature date and creation ts',
  description: 'Enter your info',
  token: 'double',
  addressable_object: 'UserPoint',
  object_tree_expression:
    '( activity_events { nature == $activity_nature and date < $activity_date} or creation_ts > $creation_ts)',
  variables: [
    {
      parameter_name: 'activity_nature',
      field_name: 'nature',
      type: 'String',
      path: ['activity_events', 'nature'],
      reference_type: undefined,
      reference_model_type: undefined,
    },
    {
      parameter_name: 'activity_date',
      field_name: 'date',
      type: 'Date',
      path: ['activity_events', 'date'],
      reference_type: undefined,
      reference_model_type: undefined,
    },
    {
      parameter_name: 'creation_ts',
      field_name: 'creation_ts',
      type: 'Timestamp',
      path: ['creation_ts'],
      reference_type: undefined,
      reference_model_type: undefined,
    },
  ],
};

type Props = AudienceFeaturePreviewProps &
  InjectedIntlProps &
  RouteComponentProps<{ datamartId: string }>;

class AudienceFeaturePreview extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = { displayAdvancedSection: false };
  }

  render() {
    const {
      intl: { formatMessage },
      match: {
        params: { datamartId },
      },
    } = this.props;

    return (
      <div className="mcs-audienceFeature-preview">
        <FormSection title={messages.preview} />
        <Card
          className="mcs-audienceFeature_card"
          title={formatMessage(messages.audienceFeatures)}
        >
          <div className="mcs-audienceFeature_cardContainer">
            <div className="mcs-audienceFeature_name">{`${audienceFeature.name}`}</div>
            <i className="mcs-audienceFeature_description">{`${audienceFeature.description} `}</i>
            {audienceFeature.variables.map((v, index) => {
              return (
                <AudienceFeatureVariable
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
