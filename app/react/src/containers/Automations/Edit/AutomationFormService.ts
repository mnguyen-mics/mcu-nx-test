import { AutomationResource } from './../../../models/automations/automations';
import { IScenarioService } from './../../../services/ScenarioService';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../constants/types';
import { AutomationFormData } from './domain';
import { buildAutomationTreeData } from '../Builder/domain';
import { DataResponse } from '../../../services/ApiService';
import { isScenarioNodeShape } from '../Builder/AutomationNode/Edit/domain';

export interface IAutomationFormService {
  loadInitialAutomationValues: (
    automationId: string,
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
  loadInitialAutomationValues(
    automationId: string,
  ): Promise<AutomationFormData> {
    const automationPromise = this._scenarioService.getScenario(automationId);
    const storylinePromise = this._scenarioService.getScenarioStoryline(
      automationId,
    );
    const nodePromise = this._scenarioService.getScenarioNodes(automationId);
    const edgePromise = this._scenarioService.getScenarioEdges(automationId);
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

    if (storageModelVersion !== 'v201709') {
      return saveOrCreatePromise();
    } else {
      return saveOrCreatePromise().then(createdAutomation => {
        const createdAutomationId = createdAutomation.data.id;
        return this._scenarioService
          .createScenarioBeginNode(createdAutomationId, {
            name: 'begin node',
            scenario_id: createdAutomationId,
            type: 'QUERY_INPUT',
            query_id: '', // TO REPLACE
          })
          .then(() => {
            const treeData = formData.automationTreeData;
            if (
              treeData &&
              isScenarioNodeShape(treeData.node) &&
              treeData.in_edge
            ) {
              const saveFirstNodePromise = this._scenarioService.createScenarioNode(
                createdAutomationId,
                treeData.node,
              );
              const saveFirstEdgePromise = this._scenarioService.createScenarioEdge(
                createdAutomationId,
                treeData.in_edge,
              );
              // return Promise.resolve();
              Promise.all([saveFirstNodePromise, saveFirstEdgePromise])
                .then(() => {
                  treeData.out_edges.forEach((node, child) => {
                    // filter dropnodes
                    return Promise.resolve();
                  });
                })
                .catch(err => {
                  //
                });
            }
            return Promise.resolve();
          })
          .catch(err => {
            //
          });
      });
    }
  }
}
