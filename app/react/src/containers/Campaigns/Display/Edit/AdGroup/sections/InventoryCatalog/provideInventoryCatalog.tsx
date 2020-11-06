import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';

import { ServiceCategoryTree } from '../../../../../../../models/servicemanagement/PublicServiceItemResource';
import { EditAdGroupRouteMatchParam } from '../../domain';
import injectDatamart, {
  InjectedDatamartProps,
} from '../../../../../../Datamart/injectDatamart';
import { IDealListService } from '../../../../../../../services/Library/DealListService';
import { DealsListResource } from '../../../../../../../models/dealList/dealList';
import { TYPES } from '../../../../../../../constants/types';
import { lazyInject } from '../../../../../../../config/inversify.config';
import { ICatalogService } from '../../../../../../../services/CatalogService';

export interface DataLoadingContainer<T> {
  data: T;
  loading: boolean;
}

export interface InjectedInventoryCatalogProps {
  inventoryCategoryTree: DataLoadingContainer<ServiceCategoryTree[]>;
  dealList: DataLoadingContainer<DealsListResource[]>;
}

type State = InjectedInventoryCatalogProps;

interface ProvidedProps {
  isScenario?: boolean;
}

type Props = InjectedDatamartProps &
  RouteComponentProps<EditAdGroupRouteMatchParam> &
  ProvidedProps;

const provideInventoryCatalog = (
  Component: React.ComponentClass<InjectedInventoryCatalogProps>,
) => {
  class ProvidedComponent extends React.Component<Props, State> {
    @lazyInject(TYPES.IDealListService)
    private _dealsListService: IDealListService;

    @lazyInject(TYPES.ICatalogService)
    private _catalogService: ICatalogService;

    public constructor(props: Props) {
      super(props);
      this.state = {
        inventoryCategoryTree: {
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
      if (!this.props.isScenario) {
        this.fetchOwnDealList();
      }
    }

    fetchDetailedTargetingData = () => {
      const {
        match: {
          params: { organisationId },
        },
      } = this.props;

      this.setState(prevState => ({
        inventoryCategoryTree: {
          ...prevState.inventoryCategoryTree,
          loading: true,
        },
      }));

      this._catalogService
        .getCategoryTree(organisationId, {
          serviceType: ['DISPLAY_CAMPAIGN.INVENTORY_ACCESS'],
        })
        .then(categoryTree => {
          const fetchServices = (
            category: ServiceCategoryTree,
          ): Promise<ServiceCategoryTree> => {
            const servicesP = this._catalogService.getServices(organisationId, {
              parentCategoryId: category.node.id,
              serviceType: ['DISPLAY_CAMPAIGN.INVENTORY_ACCESS'],
            });
            const childrenCategoryP = Promise.all(
              category.children.map(fetchServices),
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
          };

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
                  ? categoryTree[0].services
                    ? categoryTree
                    : categoryTree[0].children
                  : categoryTree,
              loading: false,
            },
          }));
        });
    };

    fetchOwnDealList = () => {
      const {
        match: {
          params: { organisationId },
        },
      } = this.props;

      this.setState(prevState => ({
        dealList: {
          ...prevState.dealList,
          loading: true,
        },
      }));

      this._dealsListService
        .getDealLists(organisationId, {
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
      const { datamart, history, location, match, ...rest } = this.props;

      // with remove props used for the purpose of this HOC
      // then pass the rest to the resulting component

      return <Component {...rest} {...this.state} />;
    }
  }

  return ProvidedComponent;
};

export default compose<Props, InjectedInventoryCatalogProps>(
  withRouter,
  injectDatamart,
  provideInventoryCatalog,
);
