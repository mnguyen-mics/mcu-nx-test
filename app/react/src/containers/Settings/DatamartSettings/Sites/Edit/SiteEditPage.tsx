import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { message, Modal } from 'antd';
import { injectIntl, WrappedComponentProps } from 'react-intl';

import * as FeatureSelectors from '../../../../../redux/Features/selectors';
import { EditSiteRouteMatchParam, INITIAL_SITE_FORM_DATA, SiteFormData } from './domain';
import messages from './messages';
import SiteEditForm, { FORM_ID } from './SiteEditForm';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { injectDatamart, InjectedDatamartProps } from '../../../../Datamart';
import { createFieldArrayModel } from '../../../../../utils/FormHelper';
import { ChannelResource, EventRules } from '../../../../../models/settings/settings';
import { VisitAnalyzerFieldModel } from '../../Common/domain';
import DatamartSelector from '../../../../../containers/Datamart/DatamartSelector';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';
import { getWorkspace } from '../../../../../redux/Session/selectors';
import { FormLayoutActionbarProps } from '../../../../../components/Layout/FormLayoutActionbar';
import { UserWorkspaceResource } from '../../../../../models/directory/UserProfileResource';
import { lazyInject } from '../../../../../config/inversify.config';
import { IChannelService } from '../../../../../services/ChannelService';
import { TYPES } from '../../../../../constants/types';
import queryString from 'query-string';
import { IOrganisationService } from '../../../../../services/OrganisationService';
import { ProcessingSelectionResource } from '../../../../../models/processing';
import { Loading } from '@mediarithmics-private/mcs-components-library';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { executeTasksInSequence } from '../../../../../utils/PromiseHelper';

interface State {
  siteData: SiteFormData;
  loading: boolean;
  selectedDatamartId: string;
}

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = WrappedComponentProps &
  InjectedNotificationProps &
  RouteComponentProps<EditSiteRouteMatchParam, {}, { from?: string; siteId: string }> &
  MapStateToProps &
  InjectedDatamartProps;

class SiteEditPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IChannelService)
  private _channelService: IChannelService;

  @lazyInject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;

  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true, // default true to avoid render x2 on mounting
      siteData: INITIAL_SITE_FORM_DATA,
      selectedDatamartId:
        (queryString.parse(props.location.search).selectedDatamartId as string) ||
        props.match.params.datamartId,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { siteId: siteIdFromURLParam, organisationId },
      },
      location,
      datamart,
      notifyError,
    } = this.props;

    const siteIdFromLocState = location.state && location.state.siteId;

    const siteId = siteIdFromURLParam || siteIdFromLocState;

    if (siteId) {
      const getSites = this._channelService.getChannel(this.state.selectedDatamartId, siteId);
      const getEventRules = this._channelService.getEventRules(
        this.state.selectedDatamartId,
        siteId,
        organisationId,
      );
      const getAliases = this._channelService.getAliases(
        this.state.selectedDatamartId,
        siteId,
        organisationId,
      );
      const getProcessingSelections = this._channelService
        .getProcessingSelectionsByChannel(siteId)
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

      const getVisitAnalyzerSelections = this._channelService.getVisitAnalyzerSelections(siteId);

      Promise.all([
        getSites,
        getEventRules,
        getAliases,
        getProcessingSelections,
        getVisitAnalyzerSelections,
      ])
        .then(res => {
          return {
            site: res[0].data,
            initialProcessingSelectionResources: res[3].map(
              processingAndSelection => processingAndSelection.processingSelectionResource,
            ),
            processingActivities: res[3].map(processingAndSelection =>
              createFieldArrayModel(processingAndSelection.processingResource),
            ),
            visitAnalyzerFields: res[4].data
              ? res[4].data.map(visitAnalyzerModel =>
                  createFieldArrayModel({
                    visit_analyzer_model_id: visitAnalyzerModel.visit_analyzer_model_id,
                  }),
                )
              : [],
            initialVisitAnalyzerSelections: res[4].data,
            eventRulesFields: res[1].data.map((er: EventRules) => createFieldArrayModel(er)),
            aliases: res[2].data.map(al => createFieldArrayModel(al)),
          };
        })
        .then((formData: SiteFormData) =>
          this.setState({
            loading: false,
            siteData: formData,
            selectedDatamartId: formData.site.datamart_id ? formData.site.datamart_id : datamart.id,
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
        params: { siteId },
      },
      datamart,
    } = this.props;

    const { siteData, selectedDatamartId } = this.state;

    let datamartId: string;
    if (siteId) {
      datamartId = siteData.site.datamart_id ? siteData.site.datamart_id : datamart.id;
    } else {
      datamartId = selectedDatamartId;
    }
    return datamartId;
  };

  shouldWarnProcessings = (siteFormData: SiteFormData): boolean => {
    const initialProcessingSelectionResources = siteFormData.initialProcessingSelectionResources;
    const processingActivities = siteFormData.processingActivities;

    const initialProcessingIds = initialProcessingSelectionResources.map(
      processingSelection => processingSelection.processing_id,
    );
    const processingActivityIds = processingActivities.map(
      processingResource => processingResource.model.id,
    );

    return (
      siteFormData.site.id !== undefined &&
      !(
        initialProcessingIds.length === processingActivityIds.length &&
        initialProcessingIds.every(pId => processingActivityIds.includes(pId))
      )
    );
  };

  checkProcessingsAndSave = (siteFormData: SiteFormData) => {
    const {
      intl: { formatMessage },
    } = this.props;

    const warn = this.shouldWarnProcessings(siteFormData);

    const saveFunction = () => {
      this.save(siteFormData);
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

  save = (siteFormData: SiteFormData) => {
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

    const getVisitAnalyzerIds = (visitAnalyzerFields: VisitAnalyzerFieldModel[]) => {
      return visitAnalyzerFields.map(
        visitAnalyzerField => visitAnalyzerField.model.visit_analyzer_model_id,
      );
    };

    const generateEventRulesTasks = (site: ChannelResource): Array<Promise<any>> => {
      const startIds = this.state.siteData.eventRulesFields.map(erf => erf.model.id);
      const savedIds: string[] = [];
      const saveCreatePromises = siteFormData.eventRulesFields.map(erf => {
        if (!erf.model.id) {
          return this._channelService.createEventRules(datamartId, site.id, {
            ...erf.model,
            datamart_id: datamartId,
            site_id: site.id,
          });
        } else if (startIds.includes(erf.model.id)) {
          savedIds.push(erf.model.id);
          const eventRuleBody = {
            ...erf.model,
            datamart_id: datamartId,
            site_id: site.id,
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
            site.id,
            organisationId,
            erf.model.id,
            eventRuleBody,
          );
        }
        return Promise.resolve();
      });
      const deletePromises = startIds.map(sid =>
        sid && !savedIds.includes(sid)
          ? this._channelService.deleteEventRules(datamartId, site.id, organisationId, sid)
          : Promise.resolve(),
      );
      return [...saveCreatePromises, ...deletePromises];
    };

    const generateAliasesTasks = (site: ChannelResource): Array<Promise<any>> => {
      const startId = this.state.siteData.aliases.map(alias => alias.model.id);
      const savedIds: string[] = [];
      const saveCreatePromises = siteFormData.aliases.map(alias => {
        if (!alias.model.id) {
          return this._channelService.createAliases(datamartId, site.id, {
            organisation_id: organisationId,
            site_id: site.id,
            name: alias.model.name,
          });
        } else if (startId.includes(alias.model.id)) {
          savedIds.push(alias.model.id);
          return this._channelService.updateAliases(
            datamartId,
            site.id,
            organisationId,
            alias.model.id,
            {
              ...alias.model,
              site_id: site.id,
              organisation_id: organisationId,
            },
          );
        }
        return Promise.resolve();
      });
      const deletePromises = startId.map(sid =>
        sid && !savedIds.includes(sid)
          ? this._channelService.deleteAliases(datamartId, site.id, organisationId, sid)
          : Promise.resolve(),
      );
      return [...saveCreatePromises, ...deletePromises];
    };

    const generateVisitAnalyzerSelectionsTasks = (
      channel: ChannelResource,
    ): Array<Promise<any>> => {
      const initialVisitAnalyzerModelIds = siteFormData.initialVisitAnalyzerSelections.map(
        channelVisitAnalyzerSelectionResource =>
          channelVisitAnalyzerSelectionResource.visit_analyzer_model_id,
      );
      const initialSelectionsIds = siteFormData.initialVisitAnalyzerSelections.map(
        channelVisitAnalyzerSelectionResource => channelVisitAnalyzerSelectionResource.id,
      );
      const currentVisitAnalyzerModelIds = getVisitAnalyzerIds(siteFormData.visitAnalyzerFields);
      const deleteAllVisitAnalysersPromise = (
        selectionIds: string[],
      ): Array<() => Promise<any>> => {
        return selectionIds.map(
          id => () => this._channelService.deleteVisitAnalyzerSelection(channel.id, id),
        );
      };
      const createAllVisitAnalysersPromise = (
        visitAnalyzerModelId: string[],
      ): Array<() => Promise<any>> => {
        return visitAnalyzerModelId.map(
          id => () => this._channelService.createVisitAnalyzerSelection(channel.id, id),
        );
      };

      if (currentVisitAnalyzerModelIds && !initialVisitAnalyzerModelIds) {
        return [
          executeTasksInSequence(createAllVisitAnalysersPromise(currentVisitAnalyzerModelIds)),
        ];
      } else if (initialVisitAnalyzerModelIds && !currentVisitAnalyzerModelIds) {
        return [executeTasksInSequence(deleteAllVisitAnalysersPromise(initialSelectionsIds))];
      } else if (
        currentVisitAnalyzerModelIds &&
        initialVisitAnalyzerModelIds &&
        currentVisitAnalyzerModelIds !== initialVisitAnalyzerModelIds
      ) {
        return [
          executeTasksInSequence(
            deleteAllVisitAnalysersPromise(initialSelectionsIds).concat(
              createAllVisitAnalysersPromise(currentVisitAnalyzerModelIds),
            ),
          ),
        ];
      } else {
        return [Promise.resolve({})];
      }
    };

    const generateProcessingSelectionsTasks = (site: ChannelResource): Array<Promise<any>> => {
      const initialProcessingSelectionResources = siteFormData.initialProcessingSelectionResources;
      const processingActivities = siteFormData.processingActivities;

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
            site.id,
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
            site.id,
            processingSelectionId,
          );
        } else {
          return Promise.resolve({});
        }
      });

      return [...savePromises, ...deletePromises];
    };

    const generateAllPromises = (site: ChannelResource): Array<Promise<any>> => {
      return [
        ...generateEventRulesTasks(site),
        ...generateAliasesTasks(site),
        ...generateProcessingSelectionsTasks(site),
        ...generateVisitAnalyzerSelectionsTasks(site),
      ];
    };

    const generateSavingPromise = (): Promise<any> => {
      if (siteFormData.site.id) {
        const mbApp = {
          ...siteFormData.site,
        };

        return this._channelService
          .updateSite(datamartId, siteFormData.site.id, mbApp)
          .then(site => Promise.all(generateAllPromises(site.data)));
      }

      return this._channelService
        .createChannel(this.props.match.params.organisationId, datamartId, {
          ...siteFormData.site,
          type: 'SITE',
        })
        .then(site => Promise.all(generateAllPromises(site.data)));
    };

    generateSavingPromise()
      .then(() => {
        hideSaveInProgress();
        const channelsUrl = `/v2/o/${organisationId}/settings/datamart/channels`;
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

    const { loading, siteData } = this.state;

    if (loading) {
      return <Loading isFullScreen={true} />;
    }

    const siteName =
      siteData.site && siteData.site.name
        ? formatMessage(messages.editSiteTitle, {
            name: siteData.site.name,
          })
        : formatMessage(messages.createSiteTitle);

    const breadcrumbPaths = [
      <Link key='1' to={`/v2/o/${organisationId}/settings/datamart/channels`}>
        {formatMessage(messages.breadcrumbTitle1)}
      </Link>,
      siteName,
    ];

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: breadcrumbPaths,
      onClose: this.onClose,
    };

    const datamartId = this.getDatamartId();

    const initialProcessingSelectionsForWarning = siteData.site.id
      ? siteData.initialProcessingSelectionResources
      : undefined;

    return datamartId ? (
      <SiteEditForm
        initialValues={siteData}
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
)(SiteEditPage);
