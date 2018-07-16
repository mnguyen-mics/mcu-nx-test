import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';

import CatalogService from '../../../../../../../services/CatalogService';
import {
  ServiceCategoryTree,
} from '../../../../../../../models/servicemanagement/PublicServiceItemResource';
import { EditAdGroupRouteMatchParam } from '../../domain';
import injectDatamart, {
  InjectedDatamartProps,
} from '../../../../../../Datamart/injectDatamart';
import PlacementListsService from '../../../../../../../services/Library/PlacementListsService'
import { PlacementListResource } from '../../../../../../../models/placement/PlacementListResource';
import DealListsService from '../../../../../../../services/Library/DealListsService'
import { DealsListResource } from '../../../../../../../models/dealList/dealList';
import KeywordListsService from '../../../../../../../services/Library/KeywordListsService'
import { KeywordListResource } from '../../../../../../../models/keywordList/keywordList';

export interface DataLoadingContainer<T> {
  data: T;
  loading: boolean;
}

export interface InjectedInventoryCatalogProps {
  inventoryCategoryTree: DataLoadingContainer<ServiceCategoryTree[]>;
  placementList: DataLoadingContainer<PlacementListResource[]>;
  keywordList: DataLoadingContainer<KeywordListResource[]>;
  dealList: DataLoadingContainer<DealsListResource[]>;
}

type State = InjectedInventoryCatalogProps;

type Props = InjectedDatamartProps &
  RouteComponentProps<EditAdGroupRouteMatchParam>;

const provideInventoryCatalog = (Component: React.ComponentClass<InjectedInventoryCatalogProps>) => {
  const providedComponent = class ProvidedComponent extends React.Component<Props, State> {
    constructor(props: Props) {
      super(props);
      this.state = {
        inventoryCategoryTree: {
          data: [],
          loading: false,
        },
        keywordList: {
          data: [],
          loading: false,
        },
        placementList: {
          data: [],
          loading: false,
        },
        dealList: {
          data: [],
          loading: false,
        },
      };
    }

    componentDidMount() {
      this.fetchDetailedTargetingData();
      this.fetchOwnDealList();
      this.fetchOwnKeywordList();
      this.fetchOwnPlacementList();
    }
  
    fetchDetailedTargetingData = () => {
      const { match: { params: { organisationId } } } = this.props;
  
      this.setState(prevState => ({
        inventoryCategoryTree: {
          ...prevState.inventoryCategoryTree,
          loading: true,
        },
      }));
  
      CatalogService.getCategoryTree(organisationId, {
        serviceType: ['DISPLAY_CAMPAIGN.INVENTORY_ACCESS'],
      })
        .then(categoryTree => {
          function fetchServices(
            category: ServiceCategoryTree,
          ): Promise<ServiceCategoryTree> {
            const servicesP = CatalogService.getServices(organisationId, {
              parentCategoryId: category.node.id,
              serviceType: ['DISPLAY_CAMPAIGN.INVENTORY_ACCESS'],
            });
            const childrenCategoryP = Promise.all(
              category.children
                .map(fetchServices),
            );
  
            return Promise.all([servicesP, childrenCategoryP]).then(
              ([services, childrenCategory]) => {
                return {
                  node: category.node,
                  children: childrenCategory,
                  services: services.data,
                };
              },
            );
          }
  
          return Promise.all(
            categoryTree.map(category => {
              return fetchServices(category);
            }),
          );
        })
        .then(categoryTree => {
          this.setState(prevState => ({
            inventoryCategoryTree: {
              // if 1 catalog only, hide root
              data:
                categoryTree.length === 1
                  ? categoryTree[0].services ? categoryTree : categoryTree[0].children
                  : categoryTree,
              loading: false,
            },
          }));
        });
    };
  
    fetchOwnKeywordList = () => {
      const { match: { params: { organisationId } } } = this.props;
  
      this.setState(prevState => ({
        keywordList: {
          ...prevState.keywordList,
          loading: true,
        },
      }));
  
      KeywordListsService.getKeywordLists(organisationId, {
        max_results: 500,
      })
        .then(res => res.data)
        .then(keywordList => {
          this.setState(prevState => ({
            keywordList: {
              data: keywordList,
              loading: false,
            },
          }));
        });
    };
  
    fetchOwnPlacementList = () => {
      const { match: { params: { organisationId } } } = this.props;
  
      this.setState(prevState => ({
        placementList: {
          ...prevState.placementList,
          loading: true,
        },
      }));
  
      PlacementListsService.getPlacementLists(organisationId, {
        max_results: 500,
      })
        .then(res => res.data)
        .then(placementList => {
          this.setState(prevState => ({
            placementList: {
              data: placementList,
              loading: false,
            },
          }));
        });
    };
  
    fetchOwnDealList = () => {
      const { match: { params: { organisationId } } } = this.props;
  
      this.setState(prevState => ({
        dealList: {
          ...prevState.dealList,
          loading: true,
        },
      }));
  
      DealListsService.getDealLists(organisationId, {
        max_results: 500,
      })
        .then(res => res.data)
        .then(dealList => {
          this.setState(prevState => ({
            dealList: {
              data: dealList,
              loading: false,
            },
          }));
        });
    };
  
    render() {
      const {
        datamart,
        history,
        location,
        match,
        ...rest
      } = this.props

      // with remove props used for the purpose of this HOC
      // then pass the rest to the resulting component

      return <Component {...rest} {...this.state} />;
    }
  }

  return providedComponent;
}

export default compose<Props, InjectedInventoryCatalogProps>(
  withRouter,
  injectDatamart,
  provideInventoryCatalog,
);
