import * as React from 'react';
import { ReduxFormChangeProps } from '../../../../utils/FormHelper';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
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
import { Alert, Select } from 'antd';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { Link } from 'react-router-dom';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IOrganisationService } from '../../../../services/OrganisationService';
import { connect } from 'react-redux';
import { getWorkspace } from '../../../../redux/Session/selectors';
import { MicsReduxState } from '../../../../utils/ReduxHelper';
import { UserWorkspaceResource } from '../../../../models/directory/UserProfileResource';
import { LabeledValue } from 'antd/lib/tree-select';

export type ProcessingsAssociatedType =
  | 'CHANNEL'
  | 'COMPARTMENT'
  | 'SEGMENT'
  | 'SEGMENT-EDGE'
  | 'ADD-TO-SEGMENT-AUTOMATION';

export interface ProcessingActivitiesFormSectionProps
  extends ReduxFormChangeProps {
  initialProcessingSelectionsForWarning?: ProcessingSelectionResource[];
  processingsAssociatedType: ProcessingsAssociatedType;
  disabled?: boolean;
  // ModalMode is used to render the section in a modal
  modalMode?: boolean;
}

interface ModalState {
  processingActivitiesSearchResult: ProcessingResource[];
  options: LabeledValue[];
}

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = InjectedIntlProps &
  WrappedFieldArrayProps<ProcessingActivityFieldModel> &
  ProcessingActivitiesFormSectionProps &
  InjectedDrawerProps &
  MapStateToProps &
  RouteComponentProps<{ organisationId: string }>;

class ProcessingActivitiesFormSection extends React.Component<
  Props,
  ModalState
> {
  @lazyInject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;

  constructor(props: Props) {
    super(props);
    this.state = {
      processingActivitiesSearchResult: [],
      options: [],
    };
  }

  componentDidMount() {
    this.fetchProcessingActivities();
  }

  updateProcessingActivities = (processingActivities: ProcessingResource[]) => {
    const { fields, formChange } = this.props;

    const newField: ProcessingActivityFieldModel[] = processingActivities.map(
      (processingActivity) => {
        return {
          key: cuid(),
          model: processingActivity,
        };
      },
    );

    formChange((fields as any).name, newField);
    this.props.closeNextDrawer();
  };

  updateModalProcessingActivities = (
    processingActivity: ProcessingResource,
  ) => {
    const { fields, formChange } = this.props;
    const alreadyAdded = fields
      .getAll()
      .find((f) => f.model.id === processingActivity.id);
    const newFields: ProcessingActivityFieldModel[] = alreadyAdded
      ? fields.getAll()
      : fields.getAll().concat({
          key: cuid(),
          model: processingActivity,
        });

    formChange((fields as any).name, newFields);
  };

  openProcessingActivitySelector = () => {
    const { fields, openNextDrawer } = this.props;

    const selectedProcessingActivityIds = fields
      .getAll()
      .map((processingField) => processingField.model.id);

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

  onChange = (value: string) => {
    const { processingActivitiesSearchResult } = this.state;
    const processingActivityToAdd = processingActivitiesSearchResult.find(
      (pa) => pa.id === value,
    );
    if (processingActivityToAdd) {
      this.updateModalProcessingActivities(processingActivityToAdd);
    }
  };

  fetchProcessingActivities = () => {
    const {
      workspace,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const options: any = {};
    const communityId = workspace(organisationId).community_id;

    this._organisationService
      .getProcessings(communityId, options)
      .then((res) => {
        this.setState({
          processingActivitiesSearchResult: res.data,
          options: res.data.map((pa) => {
            return {
              label: pa.name,
              value: pa.id,
            };
          }),
        });
      });
  };

  onSearch = (value?: string) => {
    const { processingActivitiesSearchResult } = this.state;
    const data = value
      ? processingActivitiesSearchResult.filter((pa) => pa.name.includes(value))
      : processingActivitiesSearchResult;
  
    this.setState({
      options: data.map((pa) => {
        return {
          label: pa.name,
          value: pa.id,
        };
      }),
    });
  };

  renderModalProcessingSelector = () => {
    const { options } = this.state;
    return (
      <Select
        className="mcs-processingActivitiesFormSection_modalSearchBar"
        placeholder="Search"
        onChange={this.onChange}
        onSearch={this.onSearch}
        options={options}
      />
    );
  };

  getProcessingActivityRecords = () => {
    const { fields, disabled } = this.props;

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
          editable={disabled === undefined || disabled === false}
        />
      );
    });

    return returnedObj;
  };

  isWarningNeeded = (): boolean => {
    const {
      fields,
      initialProcessingSelectionsForWarning,
      processingsAssociatedType,
    } = this.props;

    if (
      processingsAssociatedType === 'SEGMENT' ||
      processingsAssociatedType === 'SEGMENT-EDGE' ||
      processingsAssociatedType === 'COMPARTMENT' ||
      processingsAssociatedType === 'ADD-TO-SEGMENT-AUTOMATION'
    ) {
      return false;
    }

    if (initialProcessingSelectionsForWarning) {
      const initialProcessingIds = initialProcessingSelectionsForWarning.map(
        (processingSelectionResource) =>
          processingSelectionResource.processing_id,
      );
      const processingIds = fields
        .getAll()
        .map((processingField, index) => processingField.model.id);

      return !(
        initialProcessingIds.length === processingIds.length &&
        initialProcessingIds.every((pId) => processingIds.includes(pId))
      );
    }

    return false;
  };

  getSectionSubTitle = () => {
    const {
      processingsAssociatedType,
      match: {
        params: { organisationId },
      },
    } = this.props;

    if (
      processingsAssociatedType === 'SEGMENT' ||
      processingsAssociatedType === 'SEGMENT-EDGE'
    )
      return messages.processingActivitiesForSegmentsSectionSubtitle;
    else if (processingsAssociatedType === 'COMPARTMENT')
      return messages.processingActivitiesForCompartmentsSectionSubtitle;
    else if (processingsAssociatedType === 'ADD-TO-SEGMENT-AUTOMATION')
      return {
        ...messages.addToSegmentAutomationSectionSubtitle,
        values: {
          organisationSettings: (
            <Link
              to={`/v2/o/${organisationId}/settings/organisation/processings`}
              target="_blank"
            >
              <FormattedMessage {...messages.organisationSettings} />
            </Link>
          ),
        },
      };
    else return messages.processingActivitiesForChannelsSectionSubtitle;
  };

  getSectionTitle = () => {
    const { processingsAssociatedType } = this.props;

    if (
      processingsAssociatedType === 'SEGMENT' ||
      processingsAssociatedType === 'SEGMENT-EDGE' ||
      processingsAssociatedType === 'ADD-TO-SEGMENT-AUTOMATION'
    )
      return messages.processingActivitiesForSegmentsSectionTitle;
    else
      return messages.processingActivitiesForChannelsOrCompartmentsSectionTitle;
  };

  render() {
    const {
      intl: { formatMessage },
      processingsAssociatedType,
      disabled,
      modalMode,
    } = this.props;

    const sectionSubTitle = this.getSectionSubTitle();
    const sectionTitle = this.getSectionTitle();

    const warningTag = this.isWarningNeeded() ? (
      <div className="optional-section-content">
        <Alert
          message={
            <div>
              <McsIcon type="warning" />
              {formatMessage(messages.warningProcessingActivitiesForChannels)}
            </div>
          }
          type="warning"
        />
      </div>
    ) : null;

    const sectionDropdownItems =
      processingsAssociatedType === 'SEGMENT-EDGE' || disabled || modalMode
        ? undefined
        : [
            {
              id: messages.dropdownAddProcessingActivity.id,
              message: messages.dropdownAddProcessingActivity,
              onClick: this.openProcessingActivitySelector,
            },
          ];

    const relatedRecords = (
      <RelatedRecords
        emptyOption={{
          iconType: 'users',
          message: formatMessage(
            processingsAssociatedType === 'SEGMENT-EDGE'
              ? messages.processingActivitiesForEdge
              : messages.processingActivitiesEmptySection,
          ),
        }}
      >
        {processingsAssociatedType === 'SEGMENT-EDGE'
          ? []
          : this.getProcessingActivityRecords()}
      </RelatedRecords>
    );

    return (
      <div
        className={
          modalMode
            ? 'mcs-processingActivitiesFormSection_modalFormSection'
            : ''
        }
      >
        <FormSection
          dropdownItems={sectionDropdownItems}
          subtitle={sectionSubTitle}
          title={sectionTitle}
        />
        {modalMode && this.renderModalProcessingSelector()}
        {relatedRecords}
        {warningTag}
      </div>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspace: getWorkspace(state),
});

export default compose<Props, ProcessingActivitiesFormSectionProps>(
  injectIntl,
  withRouter,
  injectDrawer,
  connect(mapStateToProps, undefined),
)(ProcessingActivitiesFormSection);
