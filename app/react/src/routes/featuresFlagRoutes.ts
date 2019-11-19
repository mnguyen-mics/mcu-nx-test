import { NavigatorDefinition, NavigatorRoute, generateRoutesFromDefinition } from "./domain";
import FeatureFlagPage from "../containers/Features/FeatureFlagPage";

export const featureFlagDefinition: NavigatorDefinition = {
     // ========================================
     //           ZONE
     // ========================================
     featureFlagEdit: {
       path: '/ui-feature-flag',
       layout: 'edit',
       editComponent: FeatureFlagPage,
       requiredFeature: 'features.ui-feature-flag',
       requireDatamart: false,
     },
   }
   
   
   export const featureFlagRoutes: NavigatorRoute[] = generateRoutesFromDefinition(featureFlagDefinition)