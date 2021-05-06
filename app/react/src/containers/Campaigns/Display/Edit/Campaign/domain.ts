import { DisplayCampaignResource } from './../../../../../models/campaign/display/DisplayCampaignResource';
export type operationType = 'equals' | 'increase' | 'decrease';

export interface CampaignsInfosFieldModel {
  campaignProperty: keyof DisplayCampaignResource;
  action?: operationType;
  value?: string;
}

const operationMap = {
  equals: (propertyValue: number, targetValue: number) => targetValue,
  increase: (propertyValue: number, percentValue: number) =>
    propertyValue + propertyValue * percentValue * 0.01,
  decrease: (propertyValue: number, percentValue: number) =>
    propertyValue - propertyValue * percentValue * 0.01,
};

const operation = (chosenOperation: operationType, propertyValue: number, targetValue: number) => {
  return operationMap[chosenOperation](propertyValue, targetValue);
};

export default operation;
