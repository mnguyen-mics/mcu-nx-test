import { MediaPerformance } from '../Charts/MediaPerformanceTable';
import { OverallStat } from '../Charts/DisplayStackedAreaChart';
import {
  DisplayCampaignInfoResource,
  AdInfoResource,
  AdGroupResource,
} from '../../../../../models/campaign/display';
import { AttributionSelectionResource, GoalSelectionResource } from '../../../../../models/goal';

export const initialPageState: DisplayCampaignPageState = {
  campaign: {
    data: {
      items: [],
      isLoading: false,
      isUpdating: false,
      isArchiving: false,
    },
    overallPerformance: {
      items: [],
      isLoading: false,
      isUpdating: false,
      isArchiving: false,
    },
    performance: {
      items: [],
      isLoading: false,
      isUpdating: false,
      isArchiving: false,
    },
    mediaPerformance: {
      items: [],
      isLoading: false,
      isUpdating: false,
      isArchiving: false,
    },
  },
  adGroups: {
    data: {
      items: {},
      isLoading: false,
      isUpdating: false,
      isArchiving: false,
      adGroupCampaign: {},
    },
    performance: {
      items: {},
      isLoading: false,
      isUpdating: false,
      isArchiving: false,
    },
  },
  ads: {
    data: {
      items: {},
      adGroupCampaign: {},
      isLoading: false,
      isUpdating: false,
      isArchiving: false,
    },
    performance: {
      items: {},
      isLoading: false,
      isUpdating: false,
      isArchiving: false,
    },
  },
  goals: {
    items: [],
    isLoading: false,
    isUpdating: false,
    isArchiving: false,
  },
};

export const initialAdGroupPageState: AdGroupPageState = {
  campaign: {
    data: {
      items: [],
      isLoading: false,
      isUpdating: false,
      isArchiving: false,
    },
  },
  adGroups: {
    data: {
      items: [],
      isLoading: false,
      isUpdating: false,
      isArchiving: false,
    },
    overallPerformance: {
      items: [],
      isLoading: false,
      isUpdating: false,
      isArchiving: false,
    },
    performance: {
      items: [],
      isLoading: false,
      isUpdating: false,
      isArchiving: false,
    },
    mediaPerformance: {
      items: [],
      isLoading: false,
      isUpdating: false,
      isArchiving: false,
    },
  },
  ads: {
    data: {
      items: {},
      adGroupCampaign: {},
      isLoading: false,
      isUpdating: false,
      isArchiving: false,
    },
    performance: {
      items: {},
      isLoading: false,
      isUpdating: false,
      isArchiving: false,
    },
  },
};

interface CommonItemsProps {
  adGroupCampaign?: {
    [key: string]: {
      ad_group_id: string;
      campaign_id: string;
    };
  };
  adAdGroup?: {
    [key: string]: {
      ad_group_id: string;
      campaign_id: string;
    };
  };
  isLoading: boolean;
  isUpdating: boolean;
  isArchiving: boolean;
}
export interface Items<T> extends CommonItemsProps {
  items: T[];
}

export interface ItemsById<T> extends CommonItemsProps {
  items: { [key: string]: T };
}

export interface GoalsCampaignRessource extends GoalSelectionResource {
  attribution: AttributionSelectionResource[];
}

export interface DisplayCampaignPageState {
  campaign: {
    data: Items<Omit<DisplayCampaignInfoResource, 'ad_groups'>>;
    overallPerformance: Items<OverallStat>;
    performance: Items<OverallStat>;
    mediaPerformance: Items<MediaPerformance>;
  };
  adGroups: {
    data: ItemsById<AdGroupResource>;
    performance: ItemsById<OverallStat>;
  };
  ads: {
    data: ItemsById<AdInfoResource>;
    performance: ItemsById<OverallStat>;
  };
  goals: Items<GoalsCampaignRessource>;
}

export interface AdGroupPageState {
  campaign: {
    data: Items<Omit<DisplayCampaignInfoResource, 'ad_groups'>>;
  };
  adGroups: {
    data: Items<AdGroupResource>;
    overallPerformance: Items<OverallStat>;
    performance: Items<OverallStat>;
    mediaPerformance: Items<MediaPerformance>;
  };
  ads: {
    data: ItemsById<AdInfoResource>;
    performance: ItemsById<OverallStat>;
  };
}
