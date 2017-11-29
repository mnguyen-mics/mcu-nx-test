export interface CampaignResource {
   // TODO to be defined/generated in mcs-services
  [key: string]: any;
}

export interface CampaignRouteParams {
  organisationId: string;
  campaignId: string;
}

export interface DisplayCampaignResource {
  // organisationId: TString[OrganisationId];
  name: string;
  creationTs: Date;
  editorVersionId: string;
  editorVersionValue: string;
  editorGroupId: string;
  editorArtifactId: string;
  currencyCode: string;
  archived: boolean;
  totalImpressionCapping: number;
  perDayImpressionCapping: number;
  startDate: string;
  endDate: string;
  maxBidPrice: number;
  totalBudget: number;
  maxBudgetPerPeriod: number;
  // status: CampaignStatus;
  // technicalName: Option[String] = None;
  // subtype: DisplayCampaignSubtype;
  // maxBudgetPeriod: BudgetPeriodEnum = BudgetPeriodEnum.DAY;
  // targetedDevices: TargetedDevice = TargetedDevice.ALL;
  // targetedMedias: TargetedMedia = TargetedMedia.WEB;
  // targetedOperatingSystems: TargetedOperatingSystem = TargetedOperatingSystem.ALL;
  // timeZone: TString[TimeZoneCode];
  // modelVersion: ModelVersion;
}
