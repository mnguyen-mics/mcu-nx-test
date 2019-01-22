import {
  AutomationResource,
  ScenarioNodeShape,
  ScenarioEdgeResource,
} from './../../../models/automations/automations';
import { IScenarioService } from './../../../services/ScenarioService';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../constants/types';
import { AutomationFormData } from './domain';
import { buildAutomationTreeData, StorylineNodeModel } from '../Builder/domain';
import { DataResponse } from '../../../services/ApiService';
import {
  isQueryInputNode,
  isDisplayCampaignNode,
  isEndNode,
  isScenarioNodeShape,
  DisplayCampaignFormData,
  INITIAL_DISPLAY_CAMPAIGN_NODE_FORM_DATA,
  isEmailCampaignNode,
} from '../Builder/AutomationNode/Edit/domain';
import { INITIAL_AUTOMATION_DATA } from '../Edit/domain';
import { IQueryService } from '../../../services/QueryService';
import DisplayCampaignService from '../../../services/DisplayCampaignService';
import { Task, executeTasksInSequence } from '../../../utils/FormHelper';
import {
  getAdTasks,
  getLocationTasks,
  getInventoryCatalogTask,
} from '../../Campaigns/Display/Edit/AdGroup/AdGroupFormService';

export interface IAutomationFormService {
  loadInitialAutomationValues: (
    automationId: string,
    storageModelVersionId: string,
  ) => Promise<AutomationFormData>;
  saveOrCreateAutomation: (
    organsiationId: string,
    storageModelVersionId: string,
    formData: AutomationFormData,
  ) => Promise<DataResponse<any>>;
}

@injectable()
export class AutomationFormService implements IAutomationFormService {
  @inject(TYPES.IScenarioService)
  private _scenarioService: IScenarioService;

  @inject(TYPES.IQueryService)
  private _queryService: IQueryService;

  loadInitialAutomationValues(
    automationId: string,
    storageModelVersion: string,
  ): Promise<AutomationFormData> {
    const automationPromise = this._scenarioService.getScenario(automationId);
    const storylinePromise = this._scenarioService.getScenarioStoryline(
      automationId,
    );
    const nodePromise = this._scenarioService.getScenarioNodes(automationId);
    const edgePromise = this._scenarioService.getScenarioEdges(automationId);
    if (storageModelVersion !== 'v201506') {
      return Promise.all([
        automationPromise,
        storylinePromise,
        nodePromise,
        edgePromise,
      ]).then(res => {
        return {
          automation: res[0].data,
          automationTreeData: buildAutomationTreeData(
            res[1].data,
            res[2].data,
            res[3].data,
          ),
        };
      });
    } else {
      return Promise.all([automationPromise]).then(res => {
        return {
          automation: res[0].data,
          automationTreeData: INITIAL_AUTOMATION_DATA.automationTreeData,
        };
      });
    }
  }

  saveOrCreateAutomation(
    organisationId: string,
    storageModelVersion: string,
    formData: AutomationFormData,
  ): Promise<any> {
    const automationId = formData.automation.id;
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

    if (storageModelVersion === 'v201506') {
      return saveOrCreatePromise();
    } else {
      return saveOrCreatePromise()
        .then(createdAutomation => {
          const savedAutomationId = createdAutomation.data.id;
          const datamartId = formData.automation.datamart_id;

          const treeData = formData.automationTreeData;
          if (datamartId) {
            this.iterate(
              organisationId,
              datamartId,
              savedAutomationId,
              treeData,
            );
          }
        })
        .catch(err => {
          // Automation save failed
        });
    }
  }

  iterate = (
    organisationId: string,
    datamartId: string,
    automationId: string,
    storylineNode: StorylineNodeModel,
  ) => {
    const node = storylineNode.node;

    if (isScenarioNodeShape(node)) {
      if (isDisplayCampaignNode(node)) {
        const saveOrCreateCampaignPromise = this.saveSubCampaign(
          organisationId,
          node.formData,
          node.initialFormData,
          node.campaign_id,
        );
        saveOrCreateCampaignPromise.then(() => {
          //
          let saveOrCreateScenarioNode: Promise<
            DataResponse<ScenarioNodeShape>
          >;
          const scenarioNodeResource = {
            id: node.campaign_id ? node.id : undefined,
            name: node.name,
            scenario_id: automationId,
            x: node.x,
            y: node.y,
            type: node.type,
            campaign_id: node.campaign_id,
            ad_group_id: node.ad_group_id,
          };
          saveOrCreateScenarioNode = node.campaign_id
            ? this._scenarioService.updateScenarioNode(
                automationId,
                node.id,
                scenarioNodeResource,
              )
            : this._scenarioService.createScenarioNode(
                automationId,
                scenarioNodeResource,
              );
          saveOrCreateScenarioNode.then(() => {
            if (storylineNode.in_edge) {
              this.saveOrCreateScenarioEdge(
                automationId,
                storylineNode.in_edge,
              );
            }
          });
        });
      } else if (isEmailCampaignNode(node)) {
        //
      } else if (isQueryInputNode(node)) {
        const saveOrCreateQueryPromise = node.query_id
          ? this._queryService.updateQuery(
              datamartId,
              node.query_id,
              node.formData,
            )
          : this._queryService.createQuery(datamartId, node.formData);
        saveOrCreateQueryPromise
          .then(queryRes => {
            let saveOrCreateScenarioNode: Promise<
              DataResponse<ScenarioNodeShape>
            >;

            const scenarioNodeResource = {
              id: node.id,
              name: node.name,
              scenario_id: automationId,
              x: node.x,
              y: node.y,
              type: 'QUERY_INPUT',
              query_id: queryRes.data.id,
            };
            saveOrCreateScenarioNode = node.id
              ? this._scenarioService.updateScenarioNode(
                  automationId,
                  node.id,
                  scenarioNodeResource,
                )
              : this._scenarioService.createScenarioNode(
                  automationId,
                  scenarioNodeResource,
                );

            saveOrCreateScenarioNode
              .then(res => {
                if (node.type === 'START') {
                  this._scenarioService.createScenarioBeginNode(
                    automationId,
                    res.data,
                  );
                }
                if (storylineNode.in_edge) {
                  this.saveOrCreateScenarioEdge(
                    automationId,
                    storylineNode.in_edge,
                  );
                }
              })
              .catch(err => {
                // Begin node save failed
              });
          })
          .catch(err => {
            // Query save failed
          });
      } else if (isEndNode(node)) {
        let saveOrCreateScenarioNode: Promise<DataResponse<ScenarioNodeShape>>;
        const scenarioNodeResource = {
          id: node.id,
          name: node.name,
          scenario_id: automationId,
          x: node.x,
          y: node.y,
          type: 'ABN_NODE',
        };
        saveOrCreateScenarioNode = node.id
          ? this._scenarioService.updateScenarioNode(
              automationId,
              node.id,
              scenarioNodeResource,
            )
          : this._scenarioService.createScenarioNode(
              automationId,
              scenarioNodeResource,
            );
        saveOrCreateScenarioNode
          .then(() => {
            if (storylineNode.in_edge) {
              this.saveOrCreateScenarioEdge(
                automationId,
                storylineNode.in_edge,
              );
            }
          })
          .catch(err => {
            // Begin node save failed
          });
      }
    }

    storylineNode.out_edges.forEach((child, index) => {
      this.iterate(organisationId, datamartId, automationId, child);
    });
  };

  saveOrCreateScenarioEdge = (
    automationId: string,
    edge: ScenarioEdgeResource,
  ) => {
    const edgePromise = edge.id
      ? this._scenarioService.updateScenarioEdge(automationId, edge.id, edge)
      : this._scenarioService.createScenarioEdge(automationId, edge);
    edgePromise
      .then(() => {
        // ok
      })
      .catch(() => {
        // Edge save failed
      });
  };

  saveSubCampaign = (
    organisationId: string,
    formData: DisplayCampaignFormData,
    initialFormData: DisplayCampaignFormData = INITIAL_DISPLAY_CAMPAIGN_NODE_FORM_DATA,
    campaignId?: string,
  ) => {
    let createOrUpdateCampaignPromise;

    if (campaignId) {
      createOrUpdateCampaignPromise = DisplayCampaignService.updateCampaign(
        campaignId,
        {
          name: formData ? formData.name : '',
        },
      );
    } else {
      createOrUpdateCampaignPromise = DisplayCampaignService.createCampaign(
        organisationId,
        {
          name: formData ? formData.name : '',
          model_version: 'V2017_09',
          max_budget_period: 'DAY',
          editor_version_id: '11',
          time_zone: 'Europe/Paris',
          type: 'DISPLAY',
        },
      );
    }

    return createOrUpdateCampaignPromise.then(savedCampaignRes => {
      const savedCampaignId = savedCampaignRes.data.id;

      updateBidOptimizer(formData);

      let createOrUpdateAdGroupPromise;
      if (formData.adGroup.id) {
        createOrUpdateAdGroupPromise = DisplayCampaignService.updateAdGroup(
          savedCampaignId,
          formData.adGroup.id,
          formData.adGroup,
        );
      } else {
        createOrUpdateAdGroupPromise = DisplayCampaignService.createAdGroup(
          savedCampaignId,
          formData.adGroup,
        );
      }

      createOrUpdateAdGroupPromise.then(res => {
        const adGroupId = res.data.id;

        const tasks: Task[] = [];

        tasks.push(
          ...getAdTasks(
            organisationId,
            savedCampaignId,
            adGroupId,
            formData.adFields,
            initialFormData.adFields,
          ),
          ...getLocationTasks(
            savedCampaignId,
            adGroupId,
            formData.locationFields,
            initialFormData.locationFields,
          ),
          ...getInventoryCatalogTask(
            savedCampaignId,
            adGroupId,
            formData.inventoryCatalFields,
            initialFormData.inventoryCatalFields,
          ),
        );

        executeTasksInSequence(tasks).then(() => adGroupId);
      });
    });
  };
}

function updateBidOptimizer(adGroupFormData: DisplayCampaignFormData) {
  const bidOptimizer =
    adGroupFormData.bidOptimizerFields[0] &&
    adGroupFormData.bidOptimizerFields[0].model;
  if (bidOptimizer) {
    adGroupFormData.adGroup.bid_optimizer_id = bidOptimizer.bid_optimizer_id;
    adGroupFormData.adGroup.bid_optimization_objective_type =
      bidOptimizer.bid_optimization_objective_type;
    adGroupFormData.adGroup.bid_optimization_objective_value =
      bidOptimizer.bid_optimization_objective_value;
  } else {
    adGroupFormData.adGroup.bid_optimizer_id = null;
    adGroupFormData.adGroup.bid_optimization_objective_type = null;
    adGroupFormData.adGroup.bid_optimization_objective_value = null;
  }
}
