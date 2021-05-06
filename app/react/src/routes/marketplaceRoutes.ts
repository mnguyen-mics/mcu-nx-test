import OfferCatalogPage from '../containers/Marketplace/OfferCatalog/List/OfferCatalogPage';
import { NavigatorDefinition, NavigatorRoute, generateRoutesFromDefinition } from './domain';

export const marketplaceDefinition: NavigatorDefinition = {
  marketplaceOfferCatalogList: {
    path: '/marketplace/offercatalog',
    layout: 'main',
    contentComponent: OfferCatalogPage,
    requiredFeature: 'marketplace-offer_catalog',
  },
};

export const marketplaceRoutes: NavigatorRoute[] = generateRoutesFromDefinition(
  marketplaceDefinition,
);
