import * as React from 'react';
import { ReduxFormChangeProps } from '../../../../utils/FormHelper';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { WrappedFieldArrayProps } from 'redux-form';
import { ProcessingActivityFieldModel } from './domain';
import injectDrawer, {
  InjectedDrawerProps,
} from '../../../../components/Drawer/injectDrawer';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { FormSection } from '../../../../components/Form';
import messages from './messages';
import {
  RelatedRecords,
  RecordElement,
} from '../../../../components/RelatedRecord';
import cuid from 'cuid';
import ProcessingActivitiesSelector, {
  ProcessingActivitiesSelectorProps,
} from './ProcessingActivitiesSelector';
import {
  ProcessingResource,
  ProcessingSelectionResource,
} from '../../../../models/processing';
import { Alert } from 'antd';
import { McsIcon } from '../../../../components';

export interface ProcessingActivitiesFormSectionProps
  extends ReduxFormChangeProps {
  initialProcessingSelectionsForWarning?: ProcessingSelectionResource[];
}

type Props = InjectedIntlProps &
  WrappedFieldArrayProps<ProcessingActivityFieldModel> &
  ProcessingActivitiesFormSectionProps &
  InjectedDrawerProps &
  RouteComponentProps<{ organisationId: string }>;

class ProcessingActivitiesFormSection extends React.Component<Props> {
  updateProcessingActivities = (processingActivities: ProcessingResource[]) => {
    const { fields, formChange } = this.props;

    const newField: ProcessingActivityFieldModel[] = processingActivities.map(
      processingActivity => {
        return {
          key: cuid(),
          model: processingActivity,
        };
      },
    );

    formChange((fields as any).name, newField);
    this.props.closeNextDrawer();
  };

  openProcessingActivitySelector = () => {
    const { fields, openNextDrawer } = this.props;

    const selectedProcessingActivityIds = fields
      .getAll()
      .map(processingField => processingField.model.id);

    const props: ProcessingActivitiesSelectorProps = {
      selectedProcessingActivityIds: selectedProcessingActivityIds,
      close: this.props.closeNextDrawer,
      save: this.updateProcessingActivities,
    };

    openNextDrawer<ProcessingActivitiesSelectorProps>(
      ProcessingActivitiesSelector,
      {
        additionalProps: props,
      },
    );
  };

  getProcessingActivityRecords = () => {
    const { fields } = this.props;

    const getProcessingName = (processingField: ProcessingActivityFieldModel) =>
      processingField.model.name;

    const getAdditionalData = (
      processingField: ProcessingActivityFieldModel,
    ) => {
      const processingLegalBasis = processingField.model.legal_basis;
      if (processingLegalBasis) {
        return <span>{processingLegalBasis}</span>;
      }
      return null;
    };

    const returnedObj = fields.getAll().map((processingField, index) => {
      const removeRecord = () => fields.remove(index);

      return (
        <RecordElement
          key={processingField.key}
          recordIconType={'users'}
          record={processingField}
          title={getProcessingName}
          additionalData={getAdditionalData}
          onRemove={removeRecord}
        />
      );
    });

    return returnedObj;
  };

  isWarningNeeded = (): boolean => {
    const { fields, initialProcessingSelectionsForWarning } = this.props;

    if (initialProcessingSelectionsForWarning) {
      const initialProcessingIds = initialProcessingSelectionsForWarning.map(
        processingSelectionResource =>
          processingSelectionResource.processing_id,
      );
      const processingIds = fields
        .getAll()
        .map((processingField, index) => processingField.model.id);

      return !(
        initialProcessingIds.length === processingIds.length &&
        initialProcessingIds.every(pId => processingIds.includes(pId))
      );
    }

    return false;
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    const warningTag = this.isWarningNeeded() ? (
      <div className="optional-section-content">
        <Alert
          message={
            <div>
              <McsIcon type="warning" />
              {formatMessage(messages.warningProcessingActivities)}
            </div>
          }
          type="warning"
        />
      </div>
    ) : null;

    return (
      <div>
        <FormSection
          dropdownItems={[
            {
              id: messages.dropdownAddProcessingActivity.id,
              message: messages.dropdownAddProcessingActivity,
              onClick: this.openProcessingActivitySelector,
            },
          ]}
          subtitle={messages.processingActivitiesSectionSubtitle}
          title={messages.processingActivitiesSectionTitle}
        />
        <RelatedRecords
          emptyOption={{
            iconType: 'users',
            message: formatMessage(messages.processingActivitiesEmptySection),
          }}
        >
          {this.getProcessingActivityRecords()}
        </RelatedRecords>
        {warningTag}
      </div>
    );
  }
}

export default compose<Props, ProcessingActivitiesFormSectionProps>(
  injectIntl,
  withRouter,
  injectDrawer,
)(ProcessingActivitiesFormSection);
