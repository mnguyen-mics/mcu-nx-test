export interface CampaignResource {
   // TODO to be defined/generated in mcs-services
  [key: string]: any;
}

export interface CampaignRouteParams {
  organisationId: string;
  campaignId: string;
}

export interface DisplayCampaignResource {
  organisationId: TString[OrganisationId];
  name: string;
  creationTs: Date;
  editorVersionId: string;
  editorVersionValue: string;
  editorGroupId: string;
  editorArtifactId: string;
  status: CampaignStatus;
  currencyCode: string;
  technicalName: Option[String] = None;
  archived: boolean = false;
  subtype: DisplayCampaignSubtype;
  maxBidPrice: number = 0.0f;
  totalBudget: number = 0.0f;
  maxBudgetPerPeriod: number = 0.0f;
  maxBudgetPeriod: BudgetPeriodEnum = BudgetPeriodEnum.DAY;
  totalImpressionCapping: number = 0;
  perDayImpressionCapping: number = 0;
  startDate: Date;
  endDate: Date;
  targetedDevices: TargetedDevice = TargetedDevice.ALL;
  targetedMedias: TargetedMedia = TargetedMedia.WEB;
  targetedOperatingSystems: TargetedOperatingSystem = TargetedOperatingSystem.ALL;
  timeZone: TString[TimeZoneCode];
  modelVersion: ModelVersion;
}
