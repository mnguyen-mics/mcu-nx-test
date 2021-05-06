import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps, StaticContext } from 'react-router';
import { message, Modal } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import * as FeatureSelectors from '../../../../../redux/Features/selectors';
import {
  MobileApplicationFormData,
  EditMobileAppRouteMatchParam,
  INITIAL_MOBILE_APP_FORM_DATA,
} from './domain';
import messages from './messages';
import MobileApplicationEditForm, { FORM_ID } from './MobileApplicationEditForm';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { injectDatamart, InjectedDatamartProps } from '../../../../Datamart';
import { createFieldArrayModel } from '../../../../../utils/FormHelper';
import { ChannelResource, EventRules } from '../../../../../models/settings/settings';
import { VisitAnalyzerFieldModel } from '../../Common/domain';
import DatamartSelector from '../../../../../containers/Datamart/DatamartSelector';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';
import { FormLayoutActionbarProps } from '../../../../../components/Layout/FormLayoutActionbar';
import { getWorkspace } from '../../../../../redux/Session/selectors';
import { UserWorkspaceResource } from '../../../../../models/directory/UserProfileResource';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IChannelService } from '../../../../../services/ChannelService';
import { MicsReduxState } from '../../../../../utils/ReduxHelper';
import { IOrganisationService } from '../../../../../services/OrganisationService';
import { ProcessingSelectionResource } from '../../../../../models/processing';
import { Loading } from '@mediarithmics-private/mcs-components-library';
import { Link } from 'react-router-dom';

interface State {
  mobileApplicationData: MobileApplicationFormData;
  loading: boolean;
  selectedDatamartId: string;
}

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<
    EditMobileAppRouteMatchParam,
    StaticContext,
    { from?: string; mobileApplicationId?: string }
  > &
  MapStateToProps &
  InjectedDatamartProps;

class EditMobileAppPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IChannelService)
  private _channelService: IChannelService;

  @lazyInject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;

  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true, // default true to avoid render x2 on mounting
      mobileApplicationData: INITIAL_MOBILE_APP_FORM_DATA,
      selectedDatamartId: props.match.params.datamartId,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { mobileApplicationId: mobileApplicationIdFromURLParam, organisationId },
      },
      location,
      datamart,
      notifyError,
    } = this.props;

    const mobileApplicationIdFromLocState = location.state && location.state.mobileApplicationId;

    const mobileApplicationId = mobileApplicationIdFromURLParam || mobileApplicationIdFromLocState;

    if (mobileApplicationId) {
      const getMobileApplication = this._channelService.getChannel(
        this.state.selectedDatamartId,
        mobileApplicationId,
      );
      const getEventRules = this._channelService.getEventRules(
        this.state.selectedDatamartId,
        mobileApplicationId,
        organisationId,
      );
      const getProcessingSelections = this._channelService
        .getProcessingSelectionsByChannel(mobileApplicationId)
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

      Promise.all([getMobileApplication, getEventRules, getProcessingSelections])
        .then(res => {
          const formData = {
            mobileapplication: res[0].data,
            initialProcessingSelectionResources: res[2].map(
              processingAndSelection => processingAndSelection.processingSelectionResource,
            ),
            processingActivities: res[2].map(processingAndSelection =>
              createFieldArrayModel(processingAndSelection.processingResource),
            ),
            visitAnalyzerFields: res[0].data.visit_analyzer_model_id
              ? [
                  createFieldArrayModel({
                    visit_analyzer_model_id: res[0].data.visit_analyzer_model_id,
                  }),
                ]
              : [],
            eventRulesFields: res[1].data.map((er: EventRules) => createFieldArrayModel(er)),
          };
          return formData;
        })
        .then((formData: MobileApplicationFormData) =>
          this.setState({
            loading: false,
            mobileApplicationData: formData,
            selectedDatamartId: formData.mobileapplication.datamart_id
              ? formData.mobileapplication.datamart_id
              : datamart.id,
          }),
        )
        .catch(err => {
          notifyError(err);
        });
    } else {
      this.setState({ loading: false });
    }
  }

  onSubmitFail = () => {
    const { intl } = this.props;
    message.error(intl.formatMessage(messages.errorFormMessage));
  };

  getDatamartId = () => {
    const {
      match: {
        params: { mobileApplicationId },
      },
      datamart,
    } = this.props;

    const { mobileApplicationData, selectedDatamartId } = this.state;

    let datamartId: string;
    if (mobileApplicationId) {
      datamartId = mobileApplicationData.mobileapplication.datamart_id
        ? mobileApplicationData.mobileapplication.datamart_id
        : datamart.id;
    } else {
      datamartId = selectedDatamartId;
    }
    return datamartId;
  };

  shouldWarnProcessings = (mobileApplicationFormData: MobileApplicationFormData): boolean => {
    const initialProcessingSelectionResources =
      mobileApplicationFormData.initialProcessingSelectionResources;
    const processingActivities = mobileApplicationFormData.processingActivities;

    const initialProcessingIds = initialProcessingSelectionResources.map(
      processingSelection => processingSelection.processing_id,
    );
    const processingActivityIds = processingActivities.map(
      processingResource => processingResource.model.id,
    );

    return (
      mobileApplicationFormData.mobileapplication.id !== undefined &&
      !(
        initialProcessingIds.length === processingActivityIds.length &&
        initialProcessingIds.every(pId => processingActivityIds.includes(pId))
      )
    );
  };

  checkProcessingsAndSave = (mobileApplicationFormData: MobileApplicationFormData) => {
    const {
      intl: { formatMessage },
    } = this.props;

    const warn = this.shouldWarnProcessings(mobileApplicationFormData);

    const saveFunction = () => {
      this.save(mobileApplicationFormData);
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

  save = (mobileApplicationFormData: MobileApplicationFormData) => {
    const {
      match: {
        params: { organisationId },
      },
      notifyError,
      history,
      intl,
    } = this.props;

    const datamartId = this.getDatamartId();

    const hideSaveInProgress = message.loading(intl.formatMessage(messages.savingInProgress), 0);

    this.setState({
      loading: true,
    });

    const getVisitAnalyzerId = (visitAnalyzerFields: VisitAnalyzerFieldModel[]) => {
      if (
        visitAnalyzerFields.length &&
        visitAnalyzerFields[0].model &&
        visitAnalyzerFields[0].model.visit_analyzer_model_id
      ) {
        return visitAnalyzerFields[0].model.visit_analyzer_model_id;
      }
      return null;
    };

    const generateEventRulesTasks = (channel: ChannelResource): Array<Promise<any>> => {
      const startIds = this.state.mobileApplicationData.eventRulesFields.map(erf => erf.model.id);
      const savedIds: string[] = [];
      const saveCreatePromises = mobileApplicationFormData.eventRulesFields.map(erf => {
        if (!erf.model.id) {
          return this._channelService.createEventRules(datamartId, channel.id, {
            ...erf.model,
            datamart_id: datamartId,
            site_id: channel.id,
          });
        } else if (startIds.includes(erf.model.id)) {
          savedIds.push(erf.model.id);
          const eventRuleBody = {
            ...erf.model,
            datamart_id: datamartId,
            site_id: channel.id,
          };
          if (
            eventRuleBody.type === 'USER_IDENTIFIER_INSERTION' &&
            eventRuleBody.identifier_creation === 'USER_ACCOUNT' &&
            !eventRuleBody.compartment_id
          ) {
            eventRuleBody.compartment_id = null;
          }
          return this._channelService.updateEventRules(
            datamartId,
            channel.id,
            organisationId,
            erf.model.id,
            eventRuleBody,
          );
        }
        return Promise.resolve();
      });
      const deletePromises = startIds.map(sid =>
        sid && !savedIds.includes(sid)
          ? this._channelService.deleteEventRules(datamartId, channel.id, organisationId, sid)
          : Promise.resolve(),
      );
      return [...saveCreatePromises, ...deletePromises];
    };

    const generateProcessingSelectionsTasks = (
      mobileApplication: ChannelResource,
    ): Array<Promise<any>> => {
      const initialProcessingSelectionResources =
        mobileApplicationFormData.initialProcessingSelectionResources;
      const processingActivities = mobileApplicationFormData.processingActivities;

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

          return this._channelService.createProcessingSelectionForChannel(
            mobileApplication.id,
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
          return this._channelService.deleteChannelProcessingSelection(
            mobileApplication.id,
            processingSelectionId,
          );
        } else {
          return Promise.resolve({});
        }
      });

      return [...savePromises, ...deletePromises];
    };

    const generateAllPromises = (channel: ChannelResource): Array<Promise<any>> => {
      return [...generateEventRulesTasks(channel), ...generateProcessingSelectionsTasks(channel)];
    };

    const generateSavingPromise = (): Promise<any> => {
      if (mobileApplicationFormData.mobileapplication.id) {
        const type: 'MOBILE_APPLICATION' = 'MOBILE_APPLICATION';
        const mbApp = {
          ...mobileApplicationFormData.mobileapplication,
          visit_analyzer_model_id: getVisitAnalyzerId(
            mobileApplicationFormData.visitAnalyzerFields,
          ),
          type: type,
        };
        // TODO: use ChannelService.updateChannel when available
        return this._channelService
          .updateMobileApplication(
            datamartId,
            mobileApplicationFormData.mobileapplication.id,
            mbApp,
          )
          .then(channel => {
            Promise.all(generateAllPromises(channel.data));
          });
      }

      return this._channelService
        .createChannel(this.props.match.params.organisationId, datamartId, {
          ...mobileApplicationFormData.mobileapplication,
          visit_analyzer_model_id: getVisitAnalyzerId(
            mobileApplicationFormData.visitAnalyzerFields,
          ),
          type: 'MOBILE_APPLICATION',
        })
        .then(channel => {
          Promise.all(generateAllPromises(channel.data));
        });
    };

    generateSavingPromise()
      .then(() => {
        hideSaveInProgress();
        const channelsUrl = `/v2/o/${organisationId}/settings/channels`;
        history.push(channelsUrl);
      })
      .catch(err => {
        hideSaveInProgress();
        notifyError(err);
        this.setState({
          loading: false,
        });
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

    const defaultRedirectUrl = `/v2/o/${organisationId}/settings/datamart/channels`;

    return location.state && location.state.from
      ? history.push(location.state.from)
      : history.push(defaultRedirectUrl);
  };

  onDatamartSelect = (datamart: DatamartResource) => {
    this.setState({
      selectedDatamartId: datamart.id,
    });
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;

    const { loading, mobileApplicationData } = this.state;

    if (loading) {
      return <Loading isFullScreen={true} />;
    }

    const mobileName =
      mobileApplicationData.mobileapplication && mobileApplicationData.mobileapplication.name
        ? formatMessage(messages.editMobileApplicationTitle, {
            name: mobileApplicationData.mobileapplication.name,
          })
        : formatMessage(messages.createMobileApplicationTitle);

    const breadcrumbPaths = [
      <Link key='1' to={`/v2/o/${organisationId}/settings/datamart/channels`}>
        {formatMessage(messages.breadcrumbTitle1)}
      </Link>,
      mobileName,
    ];

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: breadcrumbPaths,
      onClose: this.onClose,
    };

    const datamartId = this.getDatamartId();

    const initialProcessingSelectionsForWarning = mobileApplicationData.mobileapplication.id
      ? mobileApplicationData.initialProcessingSelectionResources
      : undefined;

    return datamartId ? (
      <MobileApplicationEditForm
        initialValues={mobileApplicationData}
        onSubmit={this.checkProcessingsAndSave}
        close={this.onClose}
        breadCrumbPaths={breadcrumbPaths}
        onSubmitFail={this.onSubmitFail}
        datamartId={datamartId}
        initialProcessingSelectionsForWarning={initialProcessingSelectionsForWarning}
      />
    ) : (
      <DatamartSelector onSelect={this.onDatamartSelect} actionbarProps={actionBarProps} />
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspace: getWorkspace(state),
  hasFeature: FeatureSelectors.hasFeature(state),
});

export default compose(
  withRouter,
  injectIntl,
  injectDatamart,
  connect(mapStateToProps),
  injectNotifications,
)(EditMobileAppPage);
