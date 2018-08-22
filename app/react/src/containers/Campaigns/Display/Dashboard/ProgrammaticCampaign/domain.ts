import { MediaPerformance } from "../Charts/MediaPerformanceTable";
import { OverallStat } from "../Charts/DisplayStackedAreaChart";
import { DisplayCampaignInfoResource, AdInfoResource, AdGroupResource } from "../../../../../models/campaign/display";
import { AttributionSelectionResource, GoalSelectionResource } from "../../../../../models/goal";

export const initialPageState: DisplayCampaignPageState = {
  campaign: {
    items: {
      isLoading: false,
      isUpdating: false,
      isArchiving: false,
      hasItems: true,
      hasFetched: false,
    },
    overallPerformance: {
      performance: [],
      isLoading: false,
      hasFetched: false,
      error: false,
    },
    performance: {
      performance: [],
      isLoading: false,
      hasFetched: false,
      error: false,
    },
    mediaPerformance: {
      performance: [],
      isLoading: false,
      hasFetched: false,
      error: false,
    },
  },
  adGroups: {
    items: {
      itemById: {},
      adGroupCampaign: {},
      isLoading: false,
      isUpdating: false,
      isArchiving: false,
      hasItems: true,
      hasFetched: false,
    },
    performance: {
      performanceById: {},
      isLoading: false,
      hasFetched: false,
      error: false,
    },
  },
  ads: {
    items: {
      itemById: {},
      adAdGroup: {},
      isLoading: false,
      isUpdating: false,
      isArchiving: false,
      hasItems: true,
      hasFetched: false,
    },
    performance: {
      performanceById: {},
      isLoading: false,
      hasFetched: false,
      error: false,
    },
  },
  goals: {
    items: {
      itemById: [],
      isLoading: false,
      hasItems: true,
      hasFetched: false,
    },
  },
}

export interface GoalsCampaignRessource extends GoalSelectionResource {
  attribution: AttributionSelectionResource[];
}

export interface DisplayCampaignPageState {
  campaign: {
    items: {
      itemById?: DisplayCampaignInfoResource,
      isLoading: boolean,
      isUpdating: boolean,
      isArchiving: boolean,
      hasItems: boolean,
      hasFetched: boolean,
    },
    overallPerformance: {
      performance: OverallStat[],
      isLoading: boolean,
      hasFetched: boolean,
      error: boolean,
    },
    performance: {
      performance: OverallStat[],
      isLoading: boolean,
      hasFetched: boolean,
      error: boolean,
    },
    mediaPerformance: {
      performance: MediaPerformance[],
      isLoading: boolean,
      hasFetched: boolean,
      error: boolean,
    },
  },
  adGroups: {
    items: {
      itemById: { [key: string]: AdGroupResource },
      adGroupCampaign: {},
      isLoading: boolean,
      isUpdating: boolean,
      isArchiving: boolean,
      hasItems: boolean,
      hasFetched: boolean,
    },
    performance: {
      performanceById: { [key: string]: OverallStat },
      isLoading: boolean,
      hasFetched: boolean,
      error: boolean,
    },
  },
  ads: {
    items: {
      itemById: { [key: string]: AdInfoResource },
      adAdGroup: {
        [key: string]: {
          ad_group_id: string,
          campaign_id: string,
        },
      },
      isLoading: boolean,
      isUpdating: boolean,
      isArchiving: boolean,
      hasItems: boolean,
      hasFetched: boolean,
    },
    performance: {
      performanceById: { [key: string]: OverallStat },
      isLoading: boolean,
      hasFetched: boolean,
      error: boolean,
    },
  },
  goals: {
    items: {
      itemById: GoalsCampaignRessource[],
      isLoading: boolean,
      hasItems: boolean,
      hasFetched: boolean,
    },
  }
}