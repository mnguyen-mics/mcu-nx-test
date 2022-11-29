import * as React from 'react';
import { compose } from 'recompose';
import { messages } from '../../messages';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import cuid from 'cuid';
import { FormSection } from '../../../../../../components/Form';
import injectDrawer, {
  InjectedDrawerProps,
} from '../../../../../../components/Drawer/injectDrawer';
import { RelatedRecords, RecordElement } from '../../../../../../components/RelatedRecord';
import { WrappedFieldArrayProps } from 'redux-form';
import { AudienceFeatureModel } from '../domain';
import { ReduxFormChangeProps } from '../../../../../../utils/FormHelper';
import { InfoCircleFilled } from '@ant-design/icons';
import AudienceFeatureSelector, {
  AudienceFeatureSelection,
  AudienceFeatureSelectorProps,
} from '../../../../../Audience/StandardSegmentBuilder/QueryFragmentBuilders/AudienceFeatureSelector';

export interface StandardSegmentBuilderInitialFeatureSectionProps extends ReduxFormChangeProps {}

type Props = StandardSegmentBuilderInitialFeatureSectionProps &
  WrappedComponentProps &
  WrappedFieldArrayProps<AudienceFeatureModel> &
  InjectedDrawerProps &
  RouteComponentProps<{
    datamartId: string;
    organisationId: string;
  }>;

class StandardSegmentBuilderInitialFeatureSection extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  getDemographicsRecords = () => {
    const { fields } = this.props;

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

  addAudienceFeature = (audienceFeatureSelection: AudienceFeatureSelection) => {
    const { fields, formChange, closeNextDrawer } = this.props;

    const newFields: AudienceFeatureModel[] = [];
    newFields.push(...fields.getAll());
    Object.keys(audienceFeatureSelection).forEach(featureId => {
      newFields.push({
        key: cuid(),
        model: audienceFeatureSelection[featureId].audienceFeature,
      });
    });

    formChange((fields as any).name, newFields);
    closeNextDrawer();
  };

  openDemographicsSelector = () => {
    const {
      openNextDrawer,
      match: {
        params: { datamartId },
      },
    } = this.props;

    const props: AudienceFeatureSelectorProps = {
      datamartId: datamartId,
      close: this.props.closeNextDrawer,
      save: this.addAudienceFeature,
      isSettingsMode: true,
    };

    openNextDrawer<AudienceFeatureSelectorProps>(AudienceFeatureSelector, {
      additionalProps: props,
    });
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    return (
      <div>
        <FormSection
          button={{
            message: formatMessage(messages.standardSegmentBuilderSectionDemographicsAddButton),
            onClick: this.openDemographicsSelector,
          }}
          title={messages.standardSegmentBuilderSectionDemographicsTitle}
          subtitle={messages.standardSegmentBuilderSectionDemographicsSubtitle}
        />

        <RelatedRecords
          emptyOption={{
            genericIconProps: (
              <InfoCircleFilled className='mcs-standardSegmentBuilderSettings-records' />
            ),
            message: formatMessage(messages.standardSegmentBuilderSectionDemographicsSubtitle),
          }}
        >
          {this.getDemographicsRecords()}
        </RelatedRecords>
      </div>
    );
  }
}

export default compose<Props, StandardSegmentBuilderInitialFeatureSectionProps>(
  withRouter,
  injectIntl,
  injectDrawer,
)(StandardSegmentBuilderInitialFeatureSection);
