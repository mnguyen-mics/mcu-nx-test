import _ from 'lodash';
import {
  AutomationResource,
  ScenarioNodeShape,
  ScenarioEdgeResource,
  QueryInputNodeResource,
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
  isScenarioNodeShape,
  DisplayCampaignAutomationFormData,
  INITIAL_DISPLAY_CAMPAIGN_NODE_FORM_DATA,
  isEmailCampaignNode,
  INITIAL_EMAIL_CAMPAIGN_NODE_FORM_DATA,
  EmailCampaignAutomationFormData,
  isAbnNode,
  isEndNode,
} from '../Builder/AutomationNode/Edit/domain';
import { INITIAL_AUTOMATION_DATA } from '../Edit/domain';
import { IQueryService } from '../../../services/QueryService';
import { Task, executeTasksInSequence } from '../../../utils/FormHelper';

import EmailCampaignService from '../../../services/EmailCampaignService';
import {
  getBlastTasks,
  getRouterTasks,
} from '../../Campaigns/Email/Edit/EmailCampaignFormService';
import { isFakeId } from '../../../utils/FakeIdHelper';
import { IDisplayCampaignFormService } from '../../Campaigns/Display/Edit/DisplayCampaignFormService';
import DisplayCampaignService from '../../../services/DisplayCampaignService';

interface CustomEdgeResource {
  source_id: string;
  target_id: string;
  edgeResource?: ScenarioEdgeResource;
}

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

  @inject(TYPES.IDisplayCampaignFormService)
  private _displayCampaignFormService: IDisplayCampaignFormService;

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
        return buildAutomationTreeData(
          res[1].data,
          res[2].data,
          res[3].data,
          this._queryService,
          res[0].data.datamart_id,
        ).then(storylineNodeModelRes => {
          return {
            automation: res[0].data,
            automationTreeData: storylineNodeModelRes,
          };
        });
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
      return saveOrCreatePromise().then(createdAutomation => {
        const savedAutomationId = createdAutomation.data.id;
        const datamartId = formData.automation.datamart_id;

        const treeData = formData.automationTreeData;

        if (datamartId) {
          return this.saveFirstNode(datamartId, savedAutomationId, treeData).then(
            firstNodeId => {
              return this.iterate(
                organisationId,
                datamartId,
                savedAutomationId,
                treeData.out_edges,
                firstNodeId,
              );
            },
          );
        }
        return Promise.resolve()
      });
    }
  }

  saveFirstNode = (
    datamartId: string,
    automationId: string,
    storylineNode: StorylineNodeModel,
  ) => {
    const node = storylineNode.node as QueryInputNodeResource;
    const saveOrCreateQueryPromise = node.query_id
      ? this._queryService.updateQuery(datamartId, node.query_id, node.formData)
      : this._queryService.createQuery(datamartId, node.formData);
    return saveOrCreateQueryPromise.then(queryRes => {
      return this.saveOrCreateNode(
        automationId,
        storylineNode,
        undefined,
        queryRes.data.id,
      ).then(res => {
        return res.data.id;
      });
    });
  };

  iterate = (
    organisationId: string,
    datamartId: string,
    automationId: string,
    storylineNodes: StorylineNodeModel[],
    parentNodeId: string,
  ): Promise<any> => {
    return storylineNodes.reduce((prev, storylineNode) => {
      const node = storylineNode.node;

      if (isScenarioNodeShape(node)) {
        if (isDisplayCampaignNode(node)) {
          const saveOrCreateCampaignPromise = this.saveSubDisplayCampaign(
            organisationId,
            node.formData,
            node.initialFormData,
            node.campaign_id,
          );
          return prev.then(() => saveOrCreateCampaignPromise.then(campaignIds => {
            return this.saveOrCreateNode(
              automationId,
              storylineNode,
              campaignIds,
            ).then(res => {
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
          }))
        } else if (isEmailCampaignNode(node)) {
          const saveOrCreateCampaignPromise = this.saveSubEmailCampaign(
            organisationId,
            node.formData,
            node.initialFormData,
            node.campaign_id,
          );
          return prev.then(() => saveOrCreateCampaignPromise.then(campaignId => {
            return this.saveOrCreateNode(automationId, storylineNode, {
              campaign_id: campaignId,
            }).then(res => {
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
          }))
        } else if (isQueryInputNode(node)) {
          const saveOrCreateQueryPromise = node.query_id
            ? this._queryService.updateQuery(
                datamartId,
                node.query_id,
                node.formData,
              )
            : this._queryService.createQuery(datamartId, node.formData);
          return prev.then(() => saveOrCreateQueryPromise.then(queryRes => {
            return this.saveOrCreateNode(
              automationId,
              storylineNode,
              undefined,
              queryRes.data.id,
            ).then(res => {
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
          }))
        } else if (isAbnNode(node)) {
          return prev.then(() => this.saveOrCreateNode(
            automationId,
            storylineNode,
          ).then(res => {
            return this.saveOrCreateEdges(automationId, {
              source_id: parentNodeId,
              target_id: res.data.id,
              edgeResource: storylineNode.in_edge
            }).then(() => {
              return this.iterate(
                organisationId,
                datamartId,
                automationId,
                storylineNode.out_edges,
                res.data.id,
              );
            });
          }))
        } else if (isEndNode(node)) {
          return prev.then(() => this.saveOrCreateNode(
            automationId,
            storylineNode,
          ).then(res => {
            return this.saveOrCreateEdges(automationId, {
              source_id: parentNodeId,
              target_id: res.data.id,
              edgeResource: storylineNode.in_edge
            }).then(() => {
              return this.iterate(
                organisationId,
                datamartId,
                automationId,
                storylineNode.out_edges,
                res.data.id,
              );
            });
          }))
        }
      }
      return prev.then(() => Promise.resolve());
    }, Promise.resolve());
  };

  saveOrCreateNode = (
    automationId: string,
    storylineNode: StorylineNodeModel,
    campaignIds?: {
      ad_group_id?: string;
      campaign_id: string;
    },
    queryId?: string,
  ) => {
    const node = storylineNode.node as ScenarioNodeShape;
    let saveOrCreateScenarioNode: Promise<DataResponse<ScenarioNodeShape>>;
    let scenarioNodeResource = {};
    let resourceId;
    if (isDisplayCampaignNode(node)) {
      scenarioNodeResource = {
        id: node.id ? node.id : undefined,
        name: node.name,
        scenario_id: automationId,
        x: node.x,
        y: node.y,
        type: node.type,
        ad_group_id: campaignIds ? campaignIds.ad_group_id : undefined,
        campaign_id: campaignIds ? campaignIds.campaign_id : undefined,
      };
      resourceId = node.campaign_id;
    } else if (isEmailCampaignNode(node)) {
      scenarioNodeResource = {
        id: node.id ? node.id : undefined,
        name: node.name,
        scenario_id: automationId,
        x: node.x,
        y: node.y,
        type: node.type,
        campaign_id: campaignIds ? campaignIds.campaign_id : undefined,
      };
      resourceId = node.campaign_id;
    } else if (isQueryInputNode(node)) {
      scenarioNodeResource = {
        id: node.id,
        name: node.name,
        scenario_id: automationId,
        x: node.x,
        y: node.y,
        type: 'QUERY_INPUT',
        query_id: queryId,
        evaluation_mode: 'LIVE',
        evaluation_period: null,
        evaluation_period_unit: null
      };
      resourceId = node.query_id;
    } else if (isAbnNode(node)) {
      scenarioNodeResource = {
        id: node.id,
        name: node.name,
        scenario_id: automationId,
        x: node.x,
        y: node.y,
        type: 'ABN_NODE'
      }
    } else if (isEndNode(node)) {
      scenarioNodeResource = {
        id: node.id,
        name: node.name,
        scenario_id: automationId,
        x: node.x,
        y: node.y,
        type: 'END_NODE'
      }
    }
    saveOrCreateScenarioNode = resourceId
      ? this._scenarioService.updateScenarioNode(
          automationId,
          node.id,
          scenarioNodeResource,
        )
      : this._scenarioService.createScenarioNode(automationId, {
          ...scenarioNodeResource,
          id: undefined,
        });
    return saveOrCreateScenarioNode.then(res => {
      if (node.type === 'START') {
        this._scenarioService.createScenarioBeginNode(automationId, res.data);
      }
      return res;
    });
  };

  saveOrCreateEdges = (
    automationId: string,
    customEdgeData: CustomEdgeResource,
  ) => {

    return customEdgeData.edgeResource && customEdgeData.edgeResource.id && !isFakeId(customEdgeData.edgeResource.id)
      ? this._scenarioService.updateScenarioEdge(
          automationId,
          customEdgeData.edgeResource.id,
          customEdgeData.edgeResource,
        )
      : this._scenarioService.createScenarioEdge(automationId, {
          ..._.omit(customEdgeData.edgeResource, ['id']),
          scenario_id: automationId,
          source_id: customEdgeData.source_id,
          target_id: customEdgeData.target_id,
        });
  };

  saveSubDisplayCampaign = (
    organisationId: string,
    formData: DisplayCampaignAutomationFormData,
    initialFormData: DisplayCampaignAutomationFormData = INITIAL_DISPLAY_CAMPAIGN_NODE_FORM_DATA,
    campaignId?: string,
  ): Promise<{ ad_group_id?: string; campaign_id: string }> => {

    return this._displayCampaignFormService
      .saveCampaign(organisationId, formData, initialFormData)
      .then(res => DisplayCampaignService.getAdGroups(res).then(r => ({ campaign_id: res, ad_group_id: r && r.data.length ? r.data[0].id : undefined})))

  };

  saveSubEmailCampaign = (
    organisationId: string,
    formData: EmailCampaignAutomationFormData,
    initialFormData: EmailCampaignAutomationFormData = INITIAL_EMAIL_CAMPAIGN_NODE_FORM_DATA,
    campaignId?: string,
  ) => {
    let createOrUpdateCampaignPromise;

    if (campaignId) {
      createOrUpdateCampaignPromise = EmailCampaignService.updateEmailCampaign(
        campaignId,
        formData.campaign,
      );
    } else {
      createOrUpdateCampaignPromise = EmailCampaignService.createEmailCampaign(
        organisationId,
        formData.campaign,
      );
    }

    return createOrUpdateCampaignPromise.then(savedCampaignRes => {
      const savedCampaignId = savedCampaignRes.data.id;

      const tasks: Task[] = [];

      tasks.push(
        ...getRouterTasks(
          savedCampaignId,
          formData.routerFields,
          initialFormData.routerFields,
        ),
        ...getBlastTasks(
          savedCampaignId,
          formData.blastFields,
          initialFormData.blastFields,
        ),
      );

      return executeTasksInSequence(tasks)
      .then(() => EmailCampaignService.updateEmailCampaign(savedCampaignId, { id: savedCampaignId, status: 'ACTIVE' }))
      .then(() => EmailCampaignService.getBlasts(savedCampaignId))
      .then((blastData) => Promise.all(blastData.data.map(blast => EmailCampaignService.updateBlast(savedCampaignId, blast.id, { id: blast.id, status: 'SCENARIO_ACTIVATED' }))))
      .then(() => {
        return savedCampaignId;
      });
    });
  };
}