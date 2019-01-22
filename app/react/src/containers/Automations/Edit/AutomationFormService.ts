import { AutomationResource } from './../../../models/automations/automations';
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
} from '../Builder/AutomationNode/Edit/domain';
import { INITIAL_AUTOMATION_DATA } from '../Edit/domain';
import { IQueryService } from '../../../services/QueryService';

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
            this.iterate(datamartId, savedAutomationId, treeData);
          }
        })
        .catch(err => {
          // Automation save failed
        });
    }
  }

  iterate = (
    datamartId: string,
    automationId: string,
    storylineNode: StorylineNodeModel,
  ) => {
    const node = storylineNode.node;
    // filter dropnodes
    if (isScenarioNodeShape(node)) {
      if (isDisplayCampaignNode(node)) {
        // waiting for jesus part
      } else if (isQueryInputNode(node)) {
        const saveOrCreateQueryPromise = node.formData.id
          ? this._queryService.updateQuery(datamartId, node.formData.id, {
              ...node.formData,
            })
          : this._queryService.createQuery(datamartId, {
              ...node.formData,
            });
        saveOrCreateQueryPromise
          .then(queryRes => {
            const beginNodeId = node.id;
            const saveOrCreateScenarioBeginNode = beginNodeId
              ? this._scenarioService.updateScenarioNode(automationId, {
                  ...node,
                  query_id: queryRes.data.id,
                })
              : this._scenarioService.createScenarioNode(automationId, {
                  ...node,
                  query_id: queryRes.data.id,
                });
            return saveOrCreateScenarioBeginNode
              .then(() => {
                if (storylineNode.in_edge) {
                  const edgeResource = storylineNode.in_edge;
                  const edgePromise = edgeResource.id
                    ? this._scenarioService.updateScenarioEdge(
                        automationId,
                        edgeResource.id,
                        edgeResource,
                      )
                    : this._scenarioService.createScenarioEdge(
                        automationId,
                        edgeResource,
                      );
                  return edgePromise
                    .then(() => {
                      // ok
                    })
                    .catch(() => {
                      // Edge save failed
                    });
                }
                return;
              })
              .catch(err => {
                // Begin node save failed
              });

            return;
          })
          .catch(err => {
            // Query save failed
          });
      } else if (isEndNode(node)) {
        //
      }
    }

    storylineNode.out_edges.forEach((child, index) => {
      this.iterate(datamartId, automationId, child);
    });
  };
}
