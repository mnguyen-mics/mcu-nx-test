import * as React from 'react';
import { compose } from 'recompose';
import { messages } from '../../messages';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import cuid from 'cuid';
import {
  FormSection,
} from '../../../../../../components/Form';
import { AudienceFeatureResource } from '../../../../../../models/audienceFeature';
import injectDrawer, { InjectedDrawerProps } from "../../../../../../components/Drawer/injectDrawer";
import {
  RelatedRecords,
  RecordElement,
} from '../../../../../../components/RelatedRecord';
import { WrappedFieldArrayProps } from 'redux-form';
import { AudienceFeatureModel } from '../domain';
import { ReduxFormChangeProps } from "../../../../../../utils/FormHelper";
import AudienceFeatureSelector, {
  AudienceFeatureSelectorProps,
} from '../../../../../Audience/AudienceBuilder/QueryFragmentBuilders/AudienceFeatureSelector';

export interface DemographicsFormSectionProps extends ReduxFormChangeProps { }

type Props = DemographicsFormSectionProps &
InjectedIntlProps &
WrappedFieldArrayProps<AudienceFeatureModel> &
InjectedDrawerProps & 
RouteComponentProps<{
  datamartId: string;
  organisationId: string;
  audienceBuilderId: string;
}>;

class AudienceBuilderDemographicsSection extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  getDemographicsRecords = () => {
    const {
      fields,
    } = this.props;

    const getAudienceFeatureName = (field: AudienceFeatureModel) => field.model.name;

    return fields.getAll().map((field, index) => {
      const handleRemove = () => fields.remove(index);

      return (
        <RecordElement
          key={field.key}
          record={field}
          title={getAudienceFeatureName}
          onRemove={handleRemove}
        />
      );
    });
  };

  addAudienceFeature = (
    audienceFeatures: AudienceFeatureResource[],
  ) => {
    const { fields, formChange, closeNextDrawer } = this.props;
    
    const newFields: AudienceFeatureModel[] = [];
    newFields.push(...fields.getAll());
    newFields.push({
      key: cuid(),
      model: audienceFeatures[0],
    });

    formChange((fields as any).name, newFields);
    closeNextDrawer();
  }

  openDemographicsSelector = () => {
    const { 
      openNextDrawer,
      match: {
        params: { datamartId },
      },
      fields,
    } = this.props;

    const props: AudienceFeatureSelectorProps = {
      datamartId: datamartId,
      close: this.props.closeNextDrawer,
      save: this.addAudienceFeature,
      demographicIds: fields.map((_, index) => {
          return fields.get(index).model.id
      }),
    };

    openNextDrawer<AudienceFeatureSelectorProps>(AudienceFeatureSelector, {
      additionalProps: props,
    });
  }

  render() {
    const { intl: { formatMessage } } = this.props;

    return (
      <div>
        <FormSection
          button={{
            message: formatMessage(messages.audienceBuilderSectionDemographicsAddButton),
            onClick: this.openDemographicsSelector
          }}
          title={messages.audienceBuilderSectionDemographicsTitle}
          subtitle={messages.audienceBuilderSectionDemographicsSubtitle}
        />

        <RelatedRecords
          emptyOption={{
            genericIconProps: { type: 'info-circle', className: 'mcs-audienceBuilderSettings-records', theme: 'filled' },
            message: formatMessage(messages.audienceBuilderSectionDemographicsSubtitle),
          }}
        >
          {this.getDemographicsRecords()}
        </RelatedRecords>
    </div>
    );
  }
}

export default compose<Props, DemographicsFormSectionProps>(
  withRouter,
  injectIntl,
  injectDrawer,
)(AudienceBuilderDemographicsSection);
