import { DataListResponse } from './../../../services/ApiService';
import {
  PluginPropertyOrigin,
  PluginPropertyType,
  PropertyResourceShape,
} from './../../../models/plugin/index';
import {
  IAudienceSegmentFeedService,
  AudienceFeedType,
} from './../../../services/AudienceSegmentFeedService';
import { FeedNodeFormData } from './../Builder/AutomationNode/Edit/domain';
import { IPluginService } from './../../../services/PluginService';
import {
  AudienceFeed,
  CustomActionResource,
  PluginPresetResource,
  PluginProperty,
  StrictlyLayoutablePlugin,
} from './../../../models/Plugins';
import { ICustomActionService } from './../../../services/CustomActionService';
import {
  AudienceSegmentFormData,
  AudienceFeedTyped,
} from './../../Audience/Segments/Edit/domain';
import { IAudienceSegmentFormService } from './../../Audience/Segments/Edit/AudienceSegmentFormService';
import { ProcessingActivityFieldModel } from './../../Settings/DatamartSettings/Common/domain';
import _ from 'lodash';
import {
  AutomationResource,
  ScenarioNodeShape,
  ScenarioEdgeResource,
  QueryInputNodeResource,
  ScenarioExitConditionFormResource,
  CustomActionNodeResource,
  FeedNodeResource,
  ABNNodeResource,
  EdgeSelection,
} from './../../../models/automations/automations';
import { IScenarioService } from './../../../services/ScenarioService';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../constants/types';
import { AutomationFormData } from './domain';
import { buildAutomationTreeData, StorylineNodeModel } from '../Builder/domain';
import { DataResponse } from '../../../services/ApiService';
import {
  isQueryInputNode,
  isScenarioNodeShape,
  isEmailCampaignNode,
  INITIAL_EMAIL_CAMPAIGN_NODE_FORM_DATA,
  EmailCampaignAutomationFormData,
  isAbnNode,
  isEndNode,
  isWaitNode,
  ABNFormData,
  WaitFormData,
  isIfNode,
  isAddToSegmentNode,
  AddToSegmentAutomationFormData,
  DeleteFromSegmentAutomationFormData,
  CustomActionAutomationFormData,
  isDeleteFromSegmentNode,
  isOnSegmentEntryInputNode,
  isOnSegmentExitInputNode,
  isCustomActionNode,
  isFeedNode,
} from '../Builder/AutomationNode/Edit/domain';
import { INITIAL_AUTOMATION_DATA } from '../Edit/domain';
import { IQueryService } from '../../../services/QueryService';
import { Task, executeTasksInSequence } from '../../../utils/PromiseHelper';
import { IEmailCampaignFormService } from '../../Campaigns/Email/Edit/EmailCampaignFormService';
import { isFakeId } from '../../../utils/FakeIdHelper';
import { defineMessages } from 'react-intl';
import { IAudienceSegmentService } from '../../../services/AudienceSegmentService';
import moment from 'moment';
import { IEmailCampaignService } from '../../../services/EmailCampaignService';
import { IScenarioExitConditionService } from '../../../services/ScenarioExitConditionService';
import { ProcessingSelectionResource } from '../../../models/processing';

interface CustomEdgeResource {
  source_id: string;
  target_id: string;
  edgeResource?: ScenarioEdgeResource;
}

export interface IAutomationFormService {
  loadInitialAutomationValues: (
    automationId: string,
  ) => Promise<AutomationFormData>;
  saveOrCreateAutomation: (
    organisationId: string,
    formData: AutomationFormData,
    initialFormData: AutomationFormData,
  ) => Promise<DataResponse<AutomationResource>>;
  validateAutomation: (storylineNode: StorylineNodeModel) => Promise<void>;
}

const messages = defineMessages({
  undefinedQuery: {
    id: 'automation.builder.undefinedQuery',
    defaultMessage: 'Please define a query for all query nodes.',
  },
  emptyQuery: {
    id: 'automation.builder.emptyQuery',
    defaultMessage:
      'One of the query nodes has an empty query. Please define a non-empty query.',
  },
});

@injectable()
export class AutomationFormService implements IAutomationFormService {
  externalFeedService: IAudienceSegmentFeedService;
  tagFeedService: IAudienceSegmentFeedService;

  private _audienceExternalFeedServiceFactory: (
    segmentId: string,
  ) => IAudienceSegmentFeedService;

  private _audienceTagFeedServiceFactory: (
    segmentId: string,
  ) => IAudienceSegmentFeedService;

  @inject(TYPES.IScenarioService)
  private _scenarioService: IScenarioService;

  @inject(TYPES.IScenarioExitConditionService)
  private _scenarioExitConditionService: IScenarioExitConditionService;

  @inject(TYPES.IQueryService)
  private _queryService: IQueryService;

  @inject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  @inject(TYPES.IAudienceSegmentFormService)
  private _audienceSegmentFormService: IAudienceSegmentFormService;

  @inject(TYPES.IEmailCampaignService)
  private _emailCampaignService: IEmailCampaignService;

  @inject(TYPES.IEmailCampaignFormService)
  private _emailCampaignFormService: IEmailCampaignFormService;

  @inject(TYPES.ICustomActionService)
  private _customActionService: ICustomActionService;

  @inject(TYPES.IPluginService)
  private _pluginService: IPluginService;

  constructor(
    @inject(TYPES.IAudienceSegmentFeedServiceFactory)
    _audienceSegmentFeedServiceFactory: (
      feedType: AudienceFeedType,
    ) => (segmentId: string) => IAudienceSegmentFeedService,
  ) {
    this._audienceExternalFeedServiceFactory = _audienceSegmentFeedServiceFactory(
      'EXTERNAL_FEED',
    );
    this._audienceTagFeedServiceFactory = _audienceSegmentFeedServiceFactory(
      'TAG_FEED',
    );

    this.externalFeedService = this._audienceExternalFeedServiceFactory('');
    this.tagFeedService = this._audienceTagFeedServiceFactory('');
  }

  private ids: string[] = [];

  loadInitialAutomationValues(
    automationId: string,
  ): Promise<AutomationFormData> {
    const automationPromise = this._scenarioService.getScenario(automationId);
    const exitConditionsPromise = (datamartId: string) =>
      this.loadExitCondition(datamartId, automationId);
    const storylinePromise = this._scenarioService.getScenarioStoryline(
      automationId,
    );

    const nodePromise = (datamartId: string) =>
      this.loadScenarioNode(automationId, datamartId);

    const edgePromise = this._scenarioService.getScenarioEdges(automationId);

    return this._scenarioService.getScenario(automationId).then((r) => {
      return Promise.all([
        automationPromise,
        storylinePromise,
        nodePromise(r.data.datamart_id),
        edgePromise,
        exitConditionsPromise(r.data.datamart_id),
      ]).then((res) => {
        return buildAutomationTreeData(
          res[1].data,
          res[2],
          res[3].data,
          this._queryService,
          res[0].data.datamart_id,
        ).then((storylineNodeModelRes) => {
          return {
            automation: res[0].data,
            exitCondition: res[4],
            automationTreeData: storylineNodeModelRes,
          };
        });
      });
    });
  }

  loadExitCondition(
    datamartId: string,
    automationId: string,
  ): Promise<ScenarioExitConditionFormResource> {
    return this._scenarioExitConditionService
      .getScenarioExitConditions(automationId)
      .then((res) => {
        if (res.data.length > 0) {
          const exitCondition = res.data[0];
          return this._queryService
            .getQuery(datamartId, exitCondition.query_id)
            .then(({ data: query }) => {
              const initialValues = {
                ...query,
              };
              return {
                ...exitCondition,
                formData: initialValues,
                initialFormData: initialValues,
              };
            });
        }
        return Promise.resolve(INITIAL_AUTOMATION_DATA.exitCondition);
      })
      .catch((err) => {
        return Promise.resolve(INITIAL_AUTOMATION_DATA.exitCondition);
      });
  }

  loadScenarioNode(
    automationId: string,
    datamartId: string,
  ): Promise<ScenarioNodeShape[]> {
    return this._scenarioService
      .getScenarioNodes(automationId)
      .then((r) => {
        r.data.forEach((n) => {
          this.addNodeId(n.id);
        });
        return r;
      })
      .then((r) => {
        return Promise.all(
          r.data.map((n) => {
            let getPromise: Promise<ScenarioNodeShape> = Promise.resolve().then(
              () => ({ ...n }),
            );
            switch (n.type) {
              case 'EMAIL_CAMPAIGN':
                getPromise = this._emailCampaignFormService
                  .loadCampaign(n.campaign_id)
                  .then((campaignResp) => {
                    const initialValues = {
                      name: campaignResp.campaign.name,
                      campaign: campaignResp.campaign,
                      blastFields: campaignResp.blastFields,
                      routerFields: campaignResp.routerFields,
                    };
                    return {
                      ...n,
                      formData: initialValues,
                      initialValuesForm: initialValues,
                    };
                  });
                break;
              case 'ADD_TO_SEGMENT_NODE':
                getPromise = this._audienceSegmentFormService
                  .loadSegmentInitialValue(n.user_list_segment_id)
                  .then((result: AudienceSegmentFormData) => {
                    const segment = result.audienceSegment;

                    const getTtl = (ttl?: moment.Duration): {
                      value?: string;
                      unit: 'days' | 'weeks' | 'months';
                    } => {
                      if (!ttl) return { unit: 'days' };

                      const months = ttl.asMonths();
                      if (Number.isInteger(months) && months > 0) {
                        return { value: months.toString(), unit: 'months' };
                      } else {
                        const weeks = ttl.asWeeks();
                        if (Number.isInteger(weeks) && weeks > 0)
                          return { value: weeks.toString(), unit: 'weeks' };
                      }
                      return { value: ttl.asDays().toString(), unit: 'days' };;
                    }

                    const initialValues: AddToSegmentAutomationFormData = {
                      audienceSegmentName: segment.name,
                      processingActivities: result.processingActivities,
                      ttl: getTtl(moment.duration(segment.default_ttl, 'milliseconds')),
                    };
                    return {
                      ...n,
                      formData: initialValues,
                      initialValuesForm: initialValues,
                    };
                  });
                break;
              case 'DELETE_FROM_SEGMENT_NODE':
                getPromise = this._audienceSegmentService
                  .getSegment(n.user_list_segment_id)
                  .then(({ data: segment }) => {
                    const initialValues: DeleteFromSegmentAutomationFormData = {
                      audienceSegmentName: segment.name,
                      segmentId: n.user_list_segment_id,
                    };
                    return {
                      ...n,
                      formData: initialValues,
                      initialValuesForm: initialValues,
                    };
                  });
                break;
              case 'ABN_NODE':
                const abnFormData: ABNFormData = {
                  branch_number: n.edges_selection ? Object.keys(n.edges_selection).length : 2,
                  edges_selection: n.edges_selection,
                };
                getPromise = Promise.resolve().then(() => ({
                  ...n,
                  formData: abnFormData,
                }));
                break;
              case 'WAIT_NODE':
                getPromise = Promise.resolve().then(() => {
                  // We type it any as Duration have a field _months that we can't access otherwise
                  const duration: any = moment.duration(n.delay_period);
                  const initialValues: WaitFormData = {
                    wait_duration: {
                      value:
                        duration._days > 0
                          ? duration._days
                          : duration.asHours(),
                      unit: duration._days > 0 ? 'days' : 'hours',
                    },
                    day_window: n.day_window,
                    time_window_start: n.time_window_start
                      ? moment(n.time_window_start, 'HH:mm')
                      : undefined,
                    time_window_end: n.time_window_end
                      ? moment(n.time_window_end, 'HH:mm')
                      : undefined,
                  };
                  return {
                    ...n,
                    formData: initialValues,
                    initialValuesForm: initialValues,
                  };
                });
                break;
              case 'QUERY_INPUT':
                getPromise = this._queryService
                  .getQuery(datamartId, n.query_id)
                  .then((q) => ({
                    ...n,
                    formData: {
                      ...q.data,
                      name: name,
                      uiCreationMode: n.ui_creation_mode,
                    },
                  }));
                break;
              case 'IF_NODE':
                getPromise = this._queryService
                  .getQuery(datamartId, n.query_id)
                  .then((q) => ({
                    ...n,
                    name: 'If',
                    formData: {
                      ...q.data,
                    },
                  }));
                break;
              case 'END_NODE':
              case 'PLUGIN_NODE':
                getPromise = Promise.resolve().then(() => ({ ...n }));
                break;
              case 'ON_SEGMENT_ENTRY_INPUT_NODE':
              case 'ON_SEGMENT_EXIT_INPUT_NODE':
                getPromise = Promise.resolve({
                  ...n,
                  formData: {
                    name: '',
                    datamartId: datamartId,
                    segmentId: n.audience_segment_id,
                  },
                  initialFormData: {
                    name: '',
                    datamartId: datamartId,
                    segmentId: n.audience_segment_id,
                  },
                });
                break;
              case 'CUSTOM_ACTION_NODE':
                getPromise = n.custom_action_id
                  ? this._customActionService
                    .getInstanceById(n.custom_action_id)
                    .then((resCustomAction) => {
                      const customActionResource = resCustomAction.data;

                      const pluginLayoutP = this._pluginService.getLocalizedPluginLayoutFromVersionId(
                        customActionResource.version_id,
                      );

                      const customActionPropertiesP = this._customActionService
                        .getInstanceProperties(customActionResource.id)
                        .then(
                          (resCustomActionProperties) =>
                            resCustomActionProperties.data,
                        );

                      return Promise.all([
                        pluginLayoutP,
                        customActionPropertiesP,
                      ]).then((resPromises) => {
                        const { plugin, layout } = resPromises[0];
                        const customActionProperties = resPromises[1];

                        const formProperties: any = {};
                        customActionProperties.forEach(
                          (propertyResourceShape) => {
                            formProperties[
                              propertyResourceShape.technical_name
                            ] = { value: propertyResourceShape.value };
                          },
                        );

                        const constructedNode: CustomActionNodeResource = {
                          ...n,
                          custom_action_id: customActionResource.id,
                          formData: {
                            name: customActionResource.name,
                            pluginId: plugin.id,
                            pluginResource: plugin,
                            pluginLayout: layout,
                            pluginVersionProperties: customActionProperties,
                            properties: formProperties,
                          },
                        };
                        return constructedNode;
                      });
                    })
                  : Promise.resolve(n);
                break;
              case 'SCENARIO_AUDIENCE_SEGMENT_FEED_NODE':
                getPromise = this.getFeedNodePromise(n);
                break;
            }
            return getPromise;
          }),
        );
      });
  }

  getFeedNodePromise = (node: FeedNodeResource): Promise<FeedNodeResource> => {
    if (!node.feed_id) return Promise.resolve(node);

    const thenForGetFeeds = (feedType: 'EXTERNAL_FEED' | 'TAG_FEED') => (
      feeds: DataListResponse<AudienceFeed>,
    ) => {
      const foundFeed = feeds.data.find((feed) => feed.id === node.feed_id);
      if (foundFeed) {
        const audienceFeedTyped: AudienceFeedTyped = {
          ...foundFeed,
          type: feedType,
        };
        return audienceFeedTyped;
      } else return Promise.reject(undefined);
    };

    const feedP: Promise<
      AudienceFeedTyped | undefined
    > = this.externalFeedService
      .getFeeds({ scenario_id: node.scenario_id })
      .then(thenForGetFeeds('EXTERNAL_FEED'))
      .catch((err) => {
        return this.tagFeedService
          .getFeeds({ scenario_id: node.scenario_id })
          .then(thenForGetFeeds('EXTERNAL_FEED'))
          .catch((innerErr) => Promise.resolve(undefined));
      });

    const propertiesP: Promise<{
      [key: string]: PropertyResourceShape;
    }> = feedP.then((feedOpt) => {
      if (!feedOpt) return {};
      const getFeedPropertiesFunction =
        feedOpt.type === 'EXTERNAL_FEED'
          ? this._audienceSegmentService.getAudienceExternalFeedProperties
          : this._audienceSegmentService.getAudienceTagFeedProperties;

      return getFeedPropertiesFunction(feedOpt.audience_segment_id, feedOpt.id)
        .then((resProperties) => {
          return resProperties.data.reduce(
            (
              o: { [key: string]: PropertyResourceShape },
              prop: PluginProperty,
            ): { [key: string]: PropertyResourceShape } => {
              const propertyResourceShape: PropertyResourceShape = {
                deletable: prop.deletable,
                origin: prop.origin as PluginPropertyOrigin,
                technical_name: prop.technical_name,
                writable: prop.writable,
                value: prop.value,
                property_type: prop.property_type as PluginPropertyType,
              };

              return {
                ...o,
                [prop.technical_name]: propertyResourceShape,
              };
            },
            {},
          );
        })
        .catch((err) => {
          return {};
        });
    });

    const strictlyLayoutablePluginP: Promise<
      StrictlyLayoutablePlugin | undefined
    > = feedP.then((feedOpt) => {
      if (!feedOpt) return undefined;
      return this._pluginService
        .getLocalizedPluginLayoutFromVersionId(feedOpt.version_id)
        .then((resPluginAndLayout) => {
          const { plugin, layout } = resPluginAndLayout;
          if (layout) {
            return this._pluginService
              .getPluginVersionProperties(plugin.id, feedOpt.version_id)
              .then((resProperties) => {
                const strictlyLayoutablePlugin: StrictlyLayoutablePlugin = {
                  ...plugin,
                  name: feedOpt.name,
                  plugin_layout: layout,
                  plugin_preset: undefined,
                  plugin_version_properties: resProperties.data,
                  plugin_type:
                    feedOpt.type === 'EXTERNAL_FEED'
                      ? 'AUDIENCE_SEGMENT_EXTERNAL_FEED'
                      : 'AUDIENCE_SEGMENT_TAG_FEED',
                  disabled: true,
                };
                return strictlyLayoutablePlugin;
              })
              .catch((err) => undefined);
          } else return undefined;
        });
    });

    return Promise.all([propertiesP, strictlyLayoutablePluginP]).then(
      (resFeedAndProperties) => {
        const properties = resFeedAndProperties[0];
        const strictlyLayoutablePluginOpt = resFeedAndProperties[1];

        if (properties && strictlyLayoutablePluginOpt) {
          return {
            ...node,
            formData: { properties },
            strictlyLayoutablePlugin: strictlyLayoutablePluginOpt,
          };
        }
        return node;
      },
    );
  };

  removeNodeId = (id: string) =>
    (this.ids = this.ids.filter((n) => n !== `n-${id}`));
  removeEdgeId = (id: string) =>
    (this.ids = this.ids.filter((n) => n !== `e-${id}`));
  addNodeId = (id: string) => this.ids.push(`n-${id}`);
  addEdgeId = (id: string) => this.ids.push(`e-${id}`);

  saveOrCreateExitCondition(
    automationId: string,
    datamartId: string,
    exitConditionFormResource: ScenarioExitConditionFormResource,
  ): Promise<void> {
    const initialQueryText =
      exitConditionFormResource.initialFormData.query_text;
    const queryText = exitConditionFormResource.formData.query_text;

    const createQueryAndExitCondition = () => {
      return this._queryService
        .createQuery(datamartId, exitConditionFormResource.formData)
        .then(({ data: query }) => {
          this._scenarioExitConditionService.createScenarioExitConditions(
            automationId,
            {
              type: 'EVENT',
              query_id: query.id,
            },
          );
        });
    };

    if (initialQueryText && !queryText) {
      return this._scenarioExitConditionService.deleteScenarioExitConditions(
        automationId,
        exitConditionFormResource.id,
      );
    } else if (queryText) {
      if (initialQueryText && initialQueryText !== queryText) {
        return this._scenarioExitConditionService
          .deleteScenarioExitConditions(
            automationId,
            exitConditionFormResource.id,
          )
          .then(() => {
            return createQueryAndExitCondition();
          });
      } else if (!initialQueryText) {
        return createQueryAndExitCondition();
      }

      return Promise.resolve();
    }

    return Promise.resolve();
  }

  saveOrCreateAutomation(
    organisationId: string,
    formData: AutomationFormData,
    initialFormData: AutomationFormData,
  ): Promise<DataResponse<AutomationResource>> {
    const automationId = formData.automation.id;

    const traverse = (s: StorylineNodeModel) => {
      if (s.node.id && !isFakeId(s.node.id)) this.addNodeId(s.node.id);
      if (s.in_edge?.id && !isFakeId(s.in_edge.id)) {
        this.addEdgeId(s.in_edge.id);
      }
      s.out_edges.forEach((e) => {
        traverse(e);
      });
    };

    traverse(initialFormData.automationTreeData);

    const saveOrCreatePromise = () =>
      automationId
        ? this._scenarioService.updateScenario(
          automationId,
          formData.automation as AutomationResource,
        )
        : this._scenarioService.createScenario(
          organisationId,
          formData.automation as AutomationResource,
        );

    return saveOrCreatePromise()
      .then((createdAutomation) => {
        if (formData.automation.datamart_id) {
          return this.saveOrCreateExitCondition(
            createdAutomation.data.id,
            formData.automation.datamart_id,
            formData.exitCondition,
          ).then(() => createdAutomation);
        }
        return createdAutomation;
      })
      .then((createdAutomation) => {
        const savedAutomationId = createdAutomation.data.id;
        const datamartId = formData.automation.datamart_id;
        const treeData = formData.automationTreeData;

        if (datamartId) {
          return this.saveFirstNode(datamartId, savedAutomationId, treeData)
            .then((firstNode) => {
              return this.iterate(
                organisationId,
                datamartId,
                savedAutomationId,
                treeData.out_edges,
                firstNode.id,
              );
            })
            .then(() => {
              return this.ids.reduce((acc, id) => {
                const formattedId = id.substr(2);
                if (id.startsWith('e-')) {
                  return acc.then(() =>
                    this._scenarioService.deleteScenarioEdge(
                      createdAutomation.data.id,
                      formattedId,
                    ),
                  );
                }
                return acc.then(() =>
                  this._scenarioService.deleteScenarioNode(
                    createdAutomation.data.id,
                    formattedId,
                  ),
                );
              }, Promise.resolve() as Promise<any>);
            })
            .then(this.updateABNNodeSelections(savedAutomationId))
            .then(() => createdAutomation);
        }
        return Promise.resolve(createdAutomation);
      });
  }

  updateABNNodeSelections = (scenarioId: string) => () => {
    const nodesP = this._scenarioService.getScenarioNodes(scenarioId);
    const edgesP = this._scenarioService.getScenarioEdges(scenarioId);

    return Promise.all([nodesP, edgesP]).then((res) => {
      const [nodesData, edgesData] = res;
      const abnNodes: ABNNodeResource[] = nodesData.data.filter(isAbnNode);
      const edges = edgesData.data;

      const nodePromises: Array<
        Promise<DataResponse<ScenarioNodeShape> | undefined>
      > = abnNodes.map((abnNode) => {
        const associatedEdges = edges.filter((edge) => {
          return edge.source_id === abnNode.id;
        });

        const edgeSelectionIds = Object.keys(abnNode.edges_selection);

        const doSelectionsAndEdgesMatch =
          edgeSelectionIds.length === associatedEdges.length &&
          associatedEdges.every((edge) => edgeSelectionIds.includes(edge.id));

        if (!doSelectionsAndEdgesMatch && associatedEdges.length !== 0) {
          const edgesSelection: EdgeSelection = {};
          const gap = 100.0 / associatedEdges.length;

          associatedEdges.forEach((edge, index) => {
            const min = gap * index;
            const max = gap * (index + 1.0);

            edgesSelection[edge.id] = {
              min: min,
              max: max,
            };
          });

          const modifiedNode: ABNNodeResource = {
            ...abnNode,
            edges_selection: edgesSelection,
          };

          return this._scenarioService.updateScenarioNode(
            scenarioId,
            abnNode.id,
            modifiedNode,
          );
        }

        return Promise.resolve(undefined);
      });
      return Promise.all(nodePromises);
    });
  };

  saveFirstNode = (
    datamartId: string,
    automationId: string,
    storylineNode: StorylineNodeModel,
  ) => {
    const nodeType = storylineNode.node.type;
    if (nodeType === 'QUERY_INPUT')
      return this.saveQueryInputNode(datamartId, automationId, storylineNode);
    else
      return this.saveOrCreateNode(
        automationId,
        storylineNode,
        undefined,
        undefined,
        undefined,
      ).then((res) => {
        return res.data;
      });
  };

  saveQueryInputNode = (
    datamartId: string,
    automationId: string,
    storylineNode: StorylineNodeModel,
  ) => {
    // make it more modular to add new first node
    const node = storylineNode.node as QueryInputNodeResource;
    const saveOrCreateQueryPromise = !isFakeId(node.query_id)
      ? this._queryService
        .updateQuery(datamartId, node.query_id, node.formData)
        .then((res) => {
          this.removeNodeId(res.data.id);
          return res;
        })
      : this._queryService.createQuery(datamartId, node.formData);
    return saveOrCreateQueryPromise.then((queryRes) => {
      return this.saveOrCreateNode(
        automationId,
        storylineNode,
        undefined,
        queryRes.data.id,
        undefined,
      ).then((res) => {
        return res.data;
      });
    });
  };

  saveProcessingSelections = (
    audienceSegmentId: string,
    processingActivities: ProcessingActivityFieldModel[],
  ): Promise<string> => {
    const savePromises = processingActivities.map((processingActivityField) => {
      const processingActivity = processingActivityField.model;
      const processingSelectionResource: Partial<ProcessingSelectionResource> = {
        processing_id: processingActivity.id,
        processing_name: processingActivity.name,
      };

      return this._audienceSegmentService.createProcessingSelectionForAudienceSegment(
        audienceSegmentId,
        processingSelectionResource,
      );
    });

    return Promise.all(savePromises).then((returnedProcessingActivities) => {
      return audienceSegmentId;
    });
  };

  iterate = (
    organisationId: string,
    datamartId: string,
    automationId: string,
    storylineNodes: StorylineNodeModel[],
    parentNodeId: string,
  ): Promise<any> => {
    const tasks = storylineNodes.map(
      (storylineNode): Task => () => {
        const node = storylineNode.node;
        if (isScenarioNodeShape(node)) {
          if (isEmailCampaignNode(node)) {
            const saveOrCreateCampaignPromise = this.saveSubEmailCampaign(
              organisationId,
              node.formData,
              node.initialFormData,
              node.campaign_id,
            );
            return saveOrCreateCampaignPromise.then((campaignId) => {
              return this.saveOrCreateNode(automationId, storylineNode, {
                campaign_id: campaignId,
              }).then((res) => {
                return this.saveOrCreateEdges(automationId, {
                  source_id: parentNodeId,
                  target_id: res.data.id,
                  edgeResource: storylineNode.in_edge,
                }).then(() => {
                  return this.iterate(
                    organisationId,
                    datamartId,
                    automationId,
                    storylineNode.out_edges,
                    res.data.id,
                  );
                });
              });
            });
          } else if (isAddToSegmentNode(node)) {
            const saveOrCreateSegmentPromise = node.user_list_segment_id
              ? Promise.resolve(node.user_list_segment_id)
              : this.saveAudienceSegment(
                organisationId,
                datamartId,
                node.formData.audienceSegmentName
                  ? node.formData.audienceSegmentName
                  : '',
                node.formData.ttl.value ?
                  moment.duration(Number(node.formData.ttl.value), node.formData.ttl.unit).asMilliseconds() :
                  0
              );
            return saveOrCreateSegmentPromise
              .then((audienceSegmentId) => {
                return this.saveProcessingSelections(
                  audienceSegmentId,
                  node.formData.processingActivities,
                );
              })
              .then((audienceSegmentId) => {
                return this.saveOrCreateNode(
                  automationId,
                  storylineNode,
                  undefined,
                  undefined,
                  audienceSegmentId,
                ).then((res) => {
                  return this.saveOrCreateEdges(automationId, {
                    source_id: parentNodeId,
                    target_id: res.data.id,
                    edgeResource: storylineNode.in_edge,
                  }).then(() => {
                    let nextNodes = storylineNode.out_edges;
                    if (
                      node.formData.audienceSegmentId &&
                      isFakeId(node.formData.audienceSegmentId) &&
                      isAddToSegmentNode(res.data)
                    ) {
                      nextNodes = this.iterateToUpdateDeleteFromSegmentNodes(
                        node.formData.audienceSegmentId,
                        res.data.user_list_segment_id,
                        storylineNode.out_edges,
                      );
                    }
                    return this.iterate(
                      organisationId,
                      datamartId,
                      automationId,
                      nextNodes,
                      res.data.id,
                    );
                  });
                });
              });
          } else if (isDeleteFromSegmentNode(node)) {
            return this.saveOrCreateNode(
              automationId,
              storylineNode,
              undefined,
              undefined,
              node.formData.segmentId,
            ).then((res) => {
              return this.saveOrCreateEdges(automationId, {
                source_id: parentNodeId,
                target_id: res.data.id,
                edgeResource: storylineNode.in_edge,
              }).then(() => {
                return this.iterate(
                  organisationId,
                  datamartId,
                  automationId,
                  storylineNode.out_edges,
                  res.data.id,
                );
              });
            });
          } else if (isQueryInputNode(node) || isIfNode(node)) {
            const saveOrCreateQueryPromise = node.query_id
              ? this._queryService.updateQuery(
                datamartId,
                node.query_id,
                node.formData,
              )
              : this._queryService.createQuery(datamartId, node.formData);
            return saveOrCreateQueryPromise.then((queryRes) => {
              return this.saveOrCreateNode(
                automationId,
                storylineNode,
                undefined,
                queryRes.data.id,
              ).then((res) => {
                return this.saveOrCreateEdges(automationId, {
                  source_id: parentNodeId,
                  target_id: res.data.id,
                  edgeResource: storylineNode.in_edge,
                }).then(() => {
                  return this.iterate(
                    organisationId,
                    datamartId,
                    automationId,
                    storylineNode.out_edges,
                    res.data.id,
                  );
                });
              });
            });
          } else if (
            isCustomActionNode(node) &&
            node.formData &&
            node.formData.pluginId
          ) {
            const customActionIdP = node.custom_action_id
              ? Promise.resolve(node.custom_action_id)
              : this.saveCustomActionIfNeeded(
                organisationId,
                node.formData,
                node.formData.pluginId,
              );

            return customActionIdP.then((customActionId) => {
              return this.saveOrCreateNode(
                automationId,
                storylineNode,
                undefined,
                undefined,
                undefined,
                customActionId,
              ).then((res) => {
                return this.saveOrCreateEdges(automationId, {
                  source_id: parentNodeId,
                  target_id: res.data.id,
                  edgeResource: storylineNode.in_edge,
                }).then(() => {
                  return this.iterate(
                    organisationId,
                    datamartId,
                    automationId,
                    storylineNode.out_edges,
                    res.data.id,
                  );
                });
              });
            });
          } else if (
            isFeedNode(node) &&
            node.formData &&
            node.strictlyLayoutablePlugin
          ) {
            const feedIdP =
              !node.feed_id && node.strictlyLayoutablePlugin.plugin_preset
                ? this.saveFeedIfNeeded(
                  organisationId,
                  datamartId,
                  automationId,
                  node.formData,
                  node.strictlyLayoutablePlugin,
                  node.strictlyLayoutablePlugin.plugin_preset,
                )
                : Promise.resolve(node.feed_id);

            return feedIdP.then((feedId) => {
              return this.saveOrCreateNode(
                automationId,
                storylineNode,
                undefined,
                undefined,
                undefined,
                undefined,
                feedId,
              ).then((res) => {
                return this.saveOrCreateEdges(automationId, {
                  source_id: parentNodeId,
                  target_id: res.data.id,
                  edgeResource: storylineNode.in_edge,
                }).then(() => {
                  return this.iterate(
                    organisationId,
                    datamartId,
                    automationId,
                    storylineNode.out_edges,
                    res.data.id,
                  );
                });
              });
            });
          } else if (isAbnNode(node) || isEndNode(node) || isWaitNode(node)) {
            return this.saveOrCreateNode(automationId, storylineNode).then(
              (res) => {
                return this.saveOrCreateEdges(automationId, {
                  source_id: parentNodeId,
                  target_id: res.data.id,
                  edgeResource: storylineNode.in_edge,
                }).then(() => {
                  return this.iterate(
                    organisationId,
                    datamartId,
                    automationId,
                    storylineNode.out_edges,
                    res.data.id,
                  );
                });
              },
            );
          }
        }
        return Promise.resolve();
      },
    );

    return executeTasksInSequence(tasks);
  };

  iterateToUpdateDeleteFromSegmentNodes(
    fakeSegmentId: string,
    createdSegmentId: string,
    storylineNodeModels: StorylineNodeModel[],
  ): StorylineNodeModel[] {
    return storylineNodeModels.map((storylineNodeModel) => {
      const node = storylineNodeModel.node;
      if (
        isDeleteFromSegmentNode(node) &&
        node.formData.segmentId === fakeSegmentId
      ) {
        return {
          ...storylineNodeModel,
          out_edges: this.iterateToUpdateDeleteFromSegmentNodes(
            fakeSegmentId,
            createdSegmentId,
            storylineNodeModel.out_edges,
          ),
          node: {
            ...node,
            formData: {
              ...node.formData,
              segmentId: createdSegmentId,
            },
          },
        };
      }
      return {
        ...storylineNodeModel,
        out_edges: this.iterateToUpdateDeleteFromSegmentNodes(
          fakeSegmentId,
          createdSegmentId,
          storylineNodeModel.out_edges,
        ),
      };
    });
  }

  validateAutomationRec(storylineNodes: StorylineNodeModel[]): Promise<void> {
    return storylineNodes.reduce((prev, storylineNode) => {
      return prev.then(() =>
        this.validateNode(storylineNode).then(() =>
          this.validateAutomationRec(storylineNode.out_edges),
        ),
      );
    }, Promise.resolve());
  }

  validateAutomation(storylineNode: StorylineNodeModel): Promise<void> {
    return this.validateNode(storylineNode).then(() =>
      this.validateAutomationRec(storylineNode.out_edges),
    );
  }

  validateNode(storylineNode: StorylineNodeModel): Promise<void> {
    const node = storylineNode.node;
    if (isQueryInputNode(node) || isIfNode(node)) {
      if (!node.formData.query_language) {
        return Promise.reject(messages.undefinedQuery);
      }
      if (!node.formData.query_text || node.formData.query_text === '') {
        return Promise.reject(messages.emptyQuery);
      }
    }
    return Promise.resolve();
  }

  saveOrCreateNode = (
    automationId: string,
    storylineNode: StorylineNodeModel,
    campaignIds?: {
      ad_group_id?: string;
      campaign_id: string;
    },
    queryId?: string,
    audienceSegmentId?: string,
    customActionId?: string,
    feedId?: string,
  ) => {
    const node = storylineNode.node as ScenarioNodeShape;
    let saveOrCreateScenarioNode: Promise<DataResponse<ScenarioNodeShape>>;
    let scenarioNodeResource = {};
    let resourceId: string | undefined;
    if (isEmailCampaignNode(node)) {
      scenarioNodeResource = {
        id: node.id && !isFakeId(node.id) ? node.id : undefined,
        scenario_id: automationId,
        type: node.type,
        campaign_id: campaignIds ? campaignIds.campaign_id : undefined,
      };
      resourceId =
        node.campaign_id && !isFakeId(node.campaign_id)
          ? node.campaign_id
          : undefined;
    } else if (isQueryInputNode(node)) {
      scenarioNodeResource = {
        id: node.id && !isFakeId(node.id) ? node.id : undefined,
        scenario_id: automationId,
        type: 'QUERY_INPUT',
        query_id: queryId,
        ui_creation_mode: node.formData.uiCreationMode,
      };
      resourceId =
        node.query_id && !isFakeId(node.query_id) ? node.query_id : undefined;
    } else if (isOnSegmentEntryInputNode(node)) {
      scenarioNodeResource = {
        id: node.id && !isFakeId(node.id) ? node.id : undefined,
        scenario_id: automationId,
        type: 'ON_SEGMENT_ENTRY_INPUT_NODE',
        audience_segment_id: node.formData.segmentId,
      };
      resourceId = node.id && !isFakeId(node.id) ? node.id : undefined;
    } else if (isOnSegmentExitInputNode(node)) {
      scenarioNodeResource = {
        id: node.id && !isFakeId(node.id) ? node.id : undefined,
        scenario_id: automationId,
        type: 'ON_SEGMENT_EXIT_INPUT_NODE',
        audience_segment_id: node.formData.segmentId,
      };
      resourceId = node.id && !isFakeId(node.id) ? node.id : undefined;
    } else if (isAddToSegmentNode(node)) {
      scenarioNodeResource = {
        id: node.id && !isFakeId(node.id) ? node.id : undefined,
        scenario_id: automationId,
        type: node.type,
        user_list_segment_id: audienceSegmentId,
      };
      resourceId = node.id && !isFakeId(node.id) ? node.id : undefined;
    } else if (isDeleteFromSegmentNode(node)) {
      scenarioNodeResource = {
        id: node.id && !isFakeId(node.id) ? node.id : undefined,
        scenario_id: automationId,
        type: node.type,
        user_list_segment_id: audienceSegmentId,
      };
      resourceId = node.id && !isFakeId(node.id) ? node.id : undefined;
    } else if (isIfNode(node)) {
      scenarioNodeResource = {
        id: node.id && !isFakeId(node.id) ? node.id : undefined,
        scenario_id: automationId,
        query_id: queryId,
        type: 'IF_NODE',
      };
      resourceId = node.id && !isFakeId(node.id) ? node.id : undefined;
    } else if (isAbnNode(node)) {
      scenarioNodeResource = {
        id: node.id && !isFakeId(node.id) ? node.id : undefined,
        scenario_id: automationId,
        type: 'ABN_NODE',
      };
      resourceId = node.id && !isFakeId(node.id) ? node.id : undefined;
    } else if (isEndNode(node)) {
      scenarioNodeResource = {
        id: node.id && !isFakeId(node.id) ? node.id : undefined,
        scenario_id: automationId,
        type: 'END_NODE',
      };
      resourceId = node.id && !isFakeId(node.id) ? node.id : undefined;
    } else if (isWaitNode(node)) {
      scenarioNodeResource = {
        id: node.id && !isFakeId(node.id) ? node.id : undefined,
        scenario_id: automationId,
        delay_period: moment
          .duration(
            +node.formData.wait_duration.value,
            node.formData.wait_duration.unit,
          )
          .toISOString(),
        time_window_start: node.formData.time_window_start
          ? `T${node.formData.time_window_start.hours()}`
          : null,
        time_window_end: node.formData.time_window_end
          ? `T${node.formData.time_window_end.hours()}`
          : null,
        day_window: node.formData.day_window,
        type: 'WAIT_NODE',
      };
      resourceId = node.id && !isFakeId(node.id) ? node.id : undefined;
    } else if (isCustomActionNode(node)) {
      scenarioNodeResource = {
        id: node.id && !isFakeId(node.id) ? node.id : undefined,
        scenarioId: automationId,
        custom_action_id: customActionId,
        type: 'CUSTOM_ACTION_NODE',
      };
      resourceId = node.id && !isFakeId(node.id) ? node.id : undefined;
    } else if (isFeedNode(node)) {
      scenarioNodeResource = {
        id: node.id && !isFakeId(node.id) ? node.id : undefined,
        feed_id: feedId,
        scenario_id: automationId,
        type: 'SCENARIO_AUDIENCE_SEGMENT_FEED_NODE',
      };
      resourceId = node.id && !isFakeId(node.id) ? node.id : undefined;
    }
    saveOrCreateScenarioNode = resourceId
      ? this._scenarioService
        .updateScenarioNode(automationId, node.id, scenarioNodeResource)
        .then((e) => {
          this.removeNodeId(e.data.id);
          return e;
        })
      : this._scenarioService.createScenarioNode(automationId, {
        ...scenarioNodeResource,
        id: undefined,
      });
    return saveOrCreateScenarioNode;
  };

  saveOrCreateEdges = (
    automationId: string,
    customEdgeData: CustomEdgeResource,
  ): Promise<any> => {
    const resource = customEdgeData.edgeResource;
    return resource && resource.id && !isFakeId(resource.id)
      ? // update does not work therefore we are deleting the old one and creating a new one
      this._scenarioService
        .deleteScenarioEdge(automationId, resource.id)
        .then(() =>
          this._scenarioService.createScenarioEdge(automationId, {
            ..._.omit(customEdgeData.edgeResource, ['id']),
            source_id: customEdgeData.source_id,
            target_id: customEdgeData.target_id,
          }),
        )
        .then(() => {
          this.removeEdgeId(resource.id);
          return resource;
        })
      : this._scenarioService
        .createScenarioEdge(automationId, {
          ..._.omit(customEdgeData.edgeResource, ['id']),
          scenario_id: automationId,
          source_id: customEdgeData.source_id,
          target_id: customEdgeData.target_id,
        })
        .then((e) => {
          this.removeEdgeId(e.data.id);
          return e;
        });
  };

  saveCustomActionIfNeeded = (
    organisationId: string,
    customActionFormData: CustomActionAutomationFormData,
    pluginId: string,
  ): Promise<string> => {
    return this._pluginService.getPlugin(pluginId).then((resPlugin) => {
      const pluginResource = resPlugin.data;

      const customActionResourceP: Partial<CustomActionResource> = {
        name: customActionFormData.name,
        organisation_id: organisationId,
        group_id: pluginResource.group_id,
        artifact_id: pluginResource.artifact_id,
      };

      return this._customActionService
        .createPluginInstance(organisationId, customActionResourceP)
        .then((resCustomAction) => {
          const createdCustomAction = resCustomAction.data;
          const customActionId = createdCustomAction.id;

          const propertyKeysAndValues = Object.entries<any>(
            customActionFormData.properties || {},
          );
          const propertyPromises = propertyKeysAndValues.map((keyAndValue) => {
            const [key, valueObj] = keyAndValue;
            const value = valueObj.value;
            const associatedPluginVersionProperty = customActionFormData.pluginVersionProperties
              ? customActionFormData.pluginVersionProperties.find(
                (property) => property.technical_name === key,
              )
              : undefined;

            const propertyToBeCreated = {
              ...associatedPluginVersionProperty,
              technical_name: key,
              value: value,
            };

            return this._customActionService.updatePluginInstanceProperty(
              organisationId,
              customActionId,
              key,
              propertyToBeCreated,
            );
          });

          return Promise.all(propertyPromises).then((resPropertyPromises) => {
            return customActionId;
          });
        });
    });
  };

  saveFeedIfNeeded = (
    organisationId: string,
    datamartId: string,
    automationId: string,
    feedNodeFormData: FeedNodeFormData,
    strictlyLayoutablePlugin: StrictlyLayoutablePlugin,
    pluginPresetResource: PluginPresetResource,
  ): Promise<string> => {
    const audienceSegmentP = this._audienceSegmentService
      .createAudienceSegment(organisationId, {
        type: 'USER_LIST',
        feed_type: 'SCENARIO_FEED',
        datamart_id: datamartId,
        name: `automation_feed_autogenerated_scenarioId_${automationId}`,
      })
      .then((resAudienceSegment) => {
        return resAudienceSegment.data.id;
      });

    const properties = Object.values(feedNodeFormData.properties);

    const feedP = audienceSegmentP.then((audienceSegmentId) => {
      const createFeed =
        strictlyLayoutablePlugin.plugin_type ===
          'AUDIENCE_SEGMENT_EXTERNAL_FEED'
          ? this._audienceSegmentService.createAudienceExternalFeeds
          : this._audienceSegmentService.createAudienceTagFeeds;

      return createFeed(audienceSegmentId, {
        name: pluginPresetResource.name,
        group_id: strictlyLayoutablePlugin.group_id,
        artifact_id: strictlyLayoutablePlugin.artifact_id,
        version_id: pluginPresetResource.plugin_version_id,
        created_from: 'AUTOMATION',
        scenario_id: automationId,
      }).then((resFeed: DataResponse<AudienceFeed>) => resFeed.data);
    });

    return Promise.all([audienceSegmentP, feedP]).then(
      (audienceSegmentAndFeed) => {
        const audienceSegmentId = audienceSegmentAndFeed[0];
        const feed = audienceSegmentAndFeed[1];
        const updateProperty =
          strictlyLayoutablePlugin.plugin_type ===
            'AUDIENCE_SEGMENT_EXTERNAL_FEED'
            ? this._audienceSegmentService
              .updateAudienceSegmentExternalFeedProperty
            : this._audienceSegmentService.updateAudienceSegmentTagFeedProperty;

        return Promise.all(
          properties.map((property) => {
            if (property.writable) {
              updateProperty(
                organisationId,
                audienceSegmentId,
                feed.id,
                property.technical_name,
                property,
              );
            }
          }),
        ).then((res) => {
          return feed.id;
        });
      },
    );
  };

  saveAudienceSegment = (
    organisationId: string,
    datamartId: string,
    name: string,
    defaultTtl: number,
  ): Promise<string> => {
    return this._audienceSegmentService
      .createAudienceSegment(organisationId, {
        type: 'USER_LIST',
        feed_type: 'SCENARIO',
        datamart_id: datamartId,
        name: name,
        default_ttl: defaultTtl,
      })
      .then(({ data: segment }) => {
        return segment.id;
      });
  };

  saveSubEmailCampaign = (
    organisationId: string,
    formData: EmailCampaignAutomationFormData,
    initialFormData: EmailCampaignAutomationFormData = INITIAL_EMAIL_CAMPAIGN_NODE_FORM_DATA,
    campaignId?: string,
  ) => {
    let createOrUpdateCampaignPromise;
    if (campaignId) {
      createOrUpdateCampaignPromise = this._emailCampaignService.updateEmailCampaign(
        campaignId,
        _.omit(formData.campaign, ['technical_name']),
      );
    } else {
      createOrUpdateCampaignPromise = this._emailCampaignService.createEmailCampaign(
        organisationId,
        _.omit(formData.campaign, ['technical_name']),
      );
    }

    return createOrUpdateCampaignPromise.then((savedCampaignRes) => {
      const savedCampaignId = savedCampaignRes.data.id;

      const tasks: Task[] = [];

      tasks.push(
        ...this._emailCampaignFormService.getRouterTasks(
          savedCampaignId,
          formData.routerFields,
          initialFormData.routerFields,
        ),
        ...this._emailCampaignFormService.getBlastTasks(
          savedCampaignId,
          formData.blastFields,
          initialFormData.blastFields,
        ),
      );

      return executeTasksInSequence(tasks)
        .then(() =>
          this._emailCampaignService.updateEmailCampaign(savedCampaignId, {
            id: savedCampaignId,
            status: 'ACTIVE',
          }),
        )
        .then(() => this._emailCampaignService.getBlasts(savedCampaignId))
        .then((blastData) =>
          Promise.all(
            blastData.data.map((blast) =>
              this._emailCampaignService.updateBlast(
                savedCampaignId,
                blast.id,
                {
                  id: blast.id,
                  status: 'SCENARIO_ACTIVATED',
                },
              ),
            ),
          ),
        )
        .then(() => {
          return savedCampaignId;
        });
    });
  };
}
