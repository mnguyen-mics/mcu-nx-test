import * as React from 'react';
import { compose } from 'recompose';
import { message, Modal } from 'antd';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import queryString from 'query-string';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import {
  UserAccountCompartmentDatamartSelectionResource,
  DatamartResource,
  UserAccountCompartmentResource,
} from '../../../../../models/datamart/DatamartResource';
import DatamartSelector from '../../../../Datamart/DatamartSelector';
import { FormLayoutActionbarProps } from '../../../../../components/Layout/FormLayoutActionbar';
import messages from './messages';
import CompartmentEditForm, { FORM_ID } from './CompartmentEditForm';
import {
  CompartmentFormData,
  EditCompartmentRouteMatchParam,
  INITIAL_COMPARTMENT_FORM_DATA,
} from './domain';
import { IDatamartService } from '../../../../../services/DatamartService';
import { InjectedDatamartProps, injectDatamart } from '../../../../Datamart';
import { Loading } from '../../../../../components';
import { DataResponse } from '../../../../../services/ApiService';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IOrganisationService } from '../../../../../services/OrganisationService';
import { createFieldArrayModel } from '../../../../../utils/FormHelper';
import { ProcessingSelectionResource } from '../../../../../models/processing';

interface State {
  compartmentFormData: CompartmentFormData;
  loading: boolean;
  selectedDatamartId?: string;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<EditCompartmentRouteMatchParam> &
  InjectedDatamartProps;

class CompartmentEditPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  @lazyInject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;

  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      compartmentFormData: INITIAL_COMPARTMENT_FORM_DATA,
      selectedDatamartId:
        queryString.parse(props.location.search).selectedDatamartId ||
        props.match.params.datamartId,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { compartmentId: compartmentIdFromURLParam, datamartId },
      },
      location,
      notifyError,
    } = this.props;

    const compartmentIdFromLocState =
      location.state && location.state.compartmentId;

    const compartmentId =
      compartmentIdFromURLParam || compartmentIdFromLocState;

    if (compartmentId) {
      const getCompartment = this._datamartService.getUserAccountCompartmentDatamartSelectionResource(
        datamartId,
        compartmentId,
      );

      const getProcessingSelections = this._datamartService
        .getProcessingSelectionsByCompartment(datamartId, compartmentId)
        .then(res => {
          const processingSelectionResources = res.data;

          return Promise.all(
            processingSelectionResources.map(processingSelectionResource => {
              return this._organisationService
                .getProcessing(processingSelectionResource.processing_id)
                .then(resProcessing => {
                  const processingResource = resProcessing.data;
                  return {
                    processingSelectionResource: processingSelectionResource,
                    processingResource: processingResource,
                  };
                });
            }),
          );
        });

      Promise.all([getCompartment, getProcessingSelections])
        .then(res => {
          const formData: CompartmentFormData = {
            compartment: res[0].data,
            initialProcessingSelectionResources: res[1].map(
              processingAndSelection =>
                processingAndSelection.processingSelectionResource,
            ),
            processingActivities: res[1].map(processingAndSelection =>
              createFieldArrayModel(processingAndSelection.processingResource),
            ),
          };

          return formData;
        })
        .then((formData: CompartmentFormData) => {
          this.setState({
            loading: false,
            compartmentFormData: formData,
            selectedDatamartId: formData.compartment.datamart_id
              ? formData.compartment.datamart_id
              : datamartId,
          });
        })
        .catch(err => {
          this.setState({ loading: false });
          notifyError(err);
          this.onClose();
        });
    } else {
      this.setState({
        loading: false,
      });
    }
  }

  shouldWarnProcessings = (
    compartmentFormData: CompartmentFormData,
  ): boolean => {
    const initialProcessingSelectionResources =
      compartmentFormData.initialProcessingSelectionResources;
    const processingActivities = compartmentFormData.processingActivities;

    const initialProcessingIds = initialProcessingSelectionResources.map(
      processingSelection => processingSelection.processing_id,
    );
    const processingActivityIds = processingActivities.map(
      processingResource => processingResource.model.id,
    );

    return (
      compartmentFormData.compartment.id !== undefined &&
      !(
        initialProcessingIds.length === processingActivityIds.length &&
        initialProcessingIds.every(pId => processingActivityIds.includes(pId))
      )
    );
  };

  checkProcessingsAndSave = (compartmentFormData: CompartmentFormData) => {
    const {
      intl: { formatMessage },
    } = this.props;

    const warn = this.shouldWarnProcessings(compartmentFormData);

    const saveFunction = () => {
      this.save(compartmentFormData);
    };

    if (warn) {
      Modal.confirm({
        content: formatMessage(messages.processingsWarningModalContent),
        okText: formatMessage(messages.processingsWarningModalOk),
        cancelText: formatMessage(messages.processingsWarningModalCancel),
        onOk() {
          return saveFunction();
        },
        onCancel() {
          //
        },
      });
    } else {
      saveFunction();
    }
  };

  save = (compartmentFormData: CompartmentFormData) => {
    const {
      match: {
        params: { organisationId },
      },
      notifyError,
      intl,
    } = this.props;

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );

    const generateProcessingSelectionsTasks = (
      compartmentResource: UserAccountCompartmentDatamartSelectionResource,
    ): Array<Promise<any>> => {
      const initialProcessingSelectionResources =
        compartmentFormData.initialProcessingSelectionResources;
      const processingActivities = compartmentFormData.processingActivities;

      const initialProcessingIds = initialProcessingSelectionResources.map(
        processingSelection => processingSelection.processing_id,
      );
      const processingActivityIds = processingActivities.map(
        processingResource => processingResource.model.id,
      );

      const processingIdsToBeAdded = processingActivityIds.filter(
        pId => !initialProcessingIds.includes(pId),
      );
      const processingIdsToBeDeleted = initialProcessingIds.filter(
        pId => !processingActivityIds.includes(pId),
      );

      const savePromises = processingIdsToBeAdded.map(pId => {
        const processingActivityFieldModel = processingActivities.find(
          processingActivity => processingActivity.model.id === pId,
        );

        if (processingActivityFieldModel) {
          const processingResource = processingActivityFieldModel.model;
          const processingSelectionResource: Partial<ProcessingSelectionResource> = {
            processing_id: processingResource.id,
            processing_name: processingResource.name,
          };
          return this._datamartService.createProcessingSelectionForCompartment(
            compartmentResource.datamart_id,
            compartmentResource.id,
            processingSelectionResource,
          );
        } else {
          return Promise.resolve({});
        }
      });

      const deletePromises = processingIdsToBeDeleted.map(pId => {
        const processingSelectionResource = initialProcessingSelectionResources.find(
          pSelectionResource => pSelectionResource.processing_id === pId,
        );

        if (processingSelectionResource) {
          const processingSelectionId = processingSelectionResource.id;
          return this._datamartService.deleteCompartmentProcessingSelection(
            compartmentResource.datamart_id,
            compartmentResource.id,
            processingSelectionId,
          );
        } else {
          return Promise.resolve({});
        }
      });

      return [...savePromises, ...deletePromises];
    };

    const createOrUpdateCompartment = compartmentFormData.compartment.id
      ? this.updateCompartment(compartmentFormData)
      : this.createCompartment(organisationId, compartmentFormData);

    return createOrUpdateCompartment
      .then(compartment =>
        Promise.all(generateProcessingSelectionsTasks(compartment.data)),
      )
      .then(() => {
        hideSaveInProgress();
        this.setState({
          loading: false,
        });
        this.onClose();
      })
      .catch(err => {
        hideSaveInProgress();
        notifyError(err);
        this.setState({
          loading: false,
        });
        this.onClose();
      });
  };

  updateCompartment = (
    compartmentFormData: CompartmentFormData,
  ): Promise<DataResponse<UserAccountCompartmentDatamartSelectionResource>> => {
    const updatedUserAccountCompartment: Partial<UserAccountCompartmentResource> = {
      token: compartmentFormData.compartment.token,
      name: compartmentFormData.compartment.name,
    };

    return this._datamartService
      .updateUserAccountCompartment(
        compartmentFormData.compartment.compartment_id!,
        updatedUserAccountCompartment,
      )
      .then(_ => {
        const updatedCompartmentDatamartSelection: Partial<UserAccountCompartmentDatamartSelectionResource> = {
          default: compartmentFormData.compartment.default,
        };

        return this._datamartService.updateUserAccountCompartmentDatamartSelectionResource(
          compartmentFormData.compartment.datamart_id!,
          compartmentFormData.compartment.id!,
          updatedCompartmentDatamartSelection,
        );
      });
  };

  createCompartment = (
    organisationId: string,
    compartmentFormData: CompartmentFormData,
  ): Promise<DataResponse<UserAccountCompartmentDatamartSelectionResource>> => {
    const partialUserAccountCompartment: Partial<UserAccountCompartmentResource> = {
      organisation_id: organisationId,
      token: compartmentFormData.compartment.token,
      name: compartmentFormData.compartment.name,
    };

    return this._datamartService
      .createUserAccountCompartment(partialUserAccountCompartment)
      .then(res => {
        const returnedUserAccountCompartment = res.data;

        const partialCompartmentDatamartSelection: Partial<UserAccountCompartmentDatamartSelectionResource> = {
          datamart_id: compartmentFormData.compartment.datamart_id,
          compartment_id: returnedUserAccountCompartment.id,
          default: compartmentFormData.compartment.default,
        };
        return this._datamartService.createUserAccountCompartmentDatamartSelectionResource(
          compartmentFormData.compartment.datamart_id!,
          partialCompartmentDatamartSelection,
        );
      });
  };

  onClose = () => {
    const {
      history,
      location,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const defaultRedirectUrl = `/v2/o/${organisationId}/settings/datamart/compartments`;

    return location.state && location.state.from
      ? history.push(location.state.from)
      : history.push(defaultRedirectUrl);
  };

  onSelectDatamart = (datamart: DatamartResource) => {
    this.setState({
      selectedDatamartId: datamart.id,
      compartmentFormData: {
        ...INITIAL_COMPARTMENT_FORM_DATA,
        compartment: {
          datamart_id: datamart.id,
        },
      },
    });
  };

  goToDatamartSelector = () => {
    const {
      match: {
        params: { compartmentId },
      },
    } = this.props;

    if (!compartmentId) {
      this.setState({
        selectedDatamartId: undefined,
      });
    }
  };

  getDatamartId = () => {
    const {
      match: {
        params: { compartmentId },
      },
    } = this.props;

    const { compartmentFormData, selectedDatamartId } = this.state;

    const datamartId: string | undefined = compartmentId
      ? compartmentFormData.compartment.datamart_id
      : selectedDatamartId;
    return datamartId;
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;

    const { loading, compartmentFormData } = this.state;

    if (loading) {
      return <Loading isFullScreen={true} />;
    }

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.breadcrumbTitle),
        path: `/v2/o/${organisationId}/settings/datamart/compartments`,
      },
    ];

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadcrumbPaths,
      onClose: this.onClose,
    };

    const datamartId = this.getDatamartId();

    const initialProcessingSelectionsForWarning = compartmentFormData
      .compartment.id
      ? compartmentFormData.initialProcessingSelectionResources
      : undefined;

    return datamartId ? (
      <CompartmentEditForm
        initialValues={compartmentFormData}
        onSubmit={this.checkProcessingsAndSave}
        close={this.onClose}
        breadCrumbPaths={breadcrumbPaths}
        datamartId={datamartId}
        goToDatamartSelector={this.goToDatamartSelector}
        initialProcessingSelectionsForWarning={
          initialProcessingSelectionsForWarning
        }
      />
    ) : (
      <DatamartSelector
        onSelect={this.onSelectDatamart}
        actionbarProps={actionBarProps}
      />
    );
  }
}

export default compose(
  withRouter,
  injectIntl,
  injectNotifications,
  injectDatamart,
)(CompartmentEditPage);
