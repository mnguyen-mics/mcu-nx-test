export type AdGroupStatus = 'ACTIVE' | 'PAUSED' | 'PENDING';

export type AdSlotVisibilityFilter = 'ABOVE_THE_FOLD' | 'BELOW_THE_FOLD' | 'ANY_POSITION';

export type BidOptimizationObjectiveType = 'CPC' | 'CPA' | 'CTR' | 'CPV';

export type BudgetPeriod = 'DAY' | 'WEEK' | 'MONTH';

export type CampaignStatus = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export type DisplayCampaignSubType = 'PROGRAMMATIC' | 'AD_SERVING' | 'TRACKING';

export type ModelVersion = 'V2014_06' | 'V2017_09';

export type TargetedDevice =
  | 'ALL'
  | 'ONLY_DESKTOP'
  | 'ONLY_MOBILE'
  | 'ONLY_TABLET'
  | 'MOBILE_AND_TABLET';

export type TargetedMedia = 'WEB' | 'MOBILE_APP';

export type TargetedOperatingSystem = 'ALL' | 'IOS' | 'ANDROID' | 'WINDOWS_PHONE';

export type TargetedBrowserFamily =
  | 'ALL'
  | 'CHROME'
  | 'INTERNET_EXPLORER'
  | 'MICROSOFT_EDGE'
  | 'FIREFOX'
  | 'SAFARI'
  | 'OPERA';

export type TargetedConnectionType =
  | 'ALL'
  | 'ETHERNET'
  | 'WIFI'
  | 'CELLULAR_NETWORK_2G'
  | 'CELLULAR_NETWORK_3G'
  | 'CELLULAR_NETWORK_4G';

export type CreativeAuditStatus =
  | 'NOT_AUDITED'
  | 'AUDIT_PENDING'
  | 'AUDIT_FAILED'
  | 'AUDIT_PASSED'
  | 'AUDIT_PARTIALLY_PASSED';
