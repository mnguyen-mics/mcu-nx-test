import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';

import AudienceSegmentService from '../../../../../../../services/AudienceSegmentService';
import CatalogService from '../../../../../../../services/CatalogService';
import { AudienceSegmentResource } from '../../../../../../../models/audiencesegment';
import {
  ServiceCategoryTree,
  AudienceSegmentServiceItemPublicResource,
} from '../../../../../../../models/servicemanagement/PublicServiceItemResource';
import { EditAdGroupRouteMatchParam } from '../../domain';
import injectDatamart, {
  InjectedDatamartProps,
} from '../../../../../../Datamart/injectDatamart';

export interface DataLoadingContainer<T> {
  data: T;
  loading: boolean;
}

export interface InjectedAudienceCatalogProps {
  audienceCategoryTree: DataLoadingContainer<ServiceCategoryTree[]>;
  genderServiceItems: DataLoadingContainer<
    AudienceSegmentServiceItemPublicResource[]
  >;
  ageServiceItems: DataLoadingContainer<
    AudienceSegmentServiceItemPublicResource[]
  >;
  audienceSegments: DataLoadingContainer<AudienceSegmentResource[]>;
}

type State = InjectedAudienceCatalogProps;

type Props = InjectedDatamartProps &
  RouteComponentProps<EditAdGroupRouteMatchParam>;

const provideAudienceCatalog = (Component: React.ComponentClass<InjectedAudienceCatalogProps>) => {
  const providedComponent = class ProvidedComponent extends React.Component<Props, State> {
    constructor(props: Props) {
      super(props);
      this.state = {
        audienceCategoryTree: {
          data: [],
          loading: false,
        },
        genderServiceItems: {
          data: [],
          loading: false,
        },
        ageServiceItems: {
          data: [],
          loading: false,
        },
        audienceSegments: {
          data: [],
          loading: false,
        },
      };
    }

    componentDidMount() {
      this.fetchDetailedTargetingData();
      this.fetchGenderServiceItems();
      this.fetchAgeServiceItems();
      this.fetchOwnDatamartSegments();
    }
  
    fetchDetailedTargetingData = () => {
      const { match: { params: { organisationId } } } = this.props;
  
      this.setState(prevState => ({
        audienceCategoryTree: {
          ...prevState.audienceCategoryTree,
          loading: true,
        },
      }));
  
      CatalogService.getCategoryTree(organisationId, {
        serviceType: ['AUDIENCE_DATA.AUDIENCE_SEGMENT'],
      })
        .then(categoryTree => {
          function fetchServices(
            category: ServiceCategoryTree,
          ): Promise<ServiceCategoryTree> {
            const servicesP = CatalogService.getServices(organisationId, {
              parentCategoryId: category.node.id,
            });
            const childrenCategoryP = Promise.all(
              category.children
                .filter(
                  child =>
                    child.node.category_subtype !== 'AUDIENCE.AGE' &&
                    child.node.category_subtype !== 'AUDIENCE.GENDER',
                )
                .map(fetchServices),
            );
  
            return Promise.all([servicesP, childrenCategoryP]).then(
              ([services, childrenCategory]) => {
                return {
                  node: category.node,
                  children: childrenCategory,
                  services,
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
            audienceCategoryTree: {
              // if 1 catalog only, hide root
              data:
                categoryTree.length === 1
                  ? categoryTree[0].children
                  : categoryTree,
              loading: false,
            },
          }));
        });
    };
  
    fetchGenderServiceItems = () => {
      const { match: { params: { organisationId } } } = this.props;
  
      this.setState(prevState => ({
        genderServiceItems: {
          ...prevState.genderServiceItems,
          loading: true,
        },
      }));
  
      CatalogService.getAudienceSegmentServices(organisationId, {
        categorySubtype: ['AUDIENCE.GENDER'],
      }).then(genderServiceItems => {
        this.setState(prevState => ({
          genderServiceItems: {
            data: genderServiceItems,
            loading: false,
          },
        }));
      });
    };
  
    fetchAgeServiceItems = () => {
      const { match: { params: { organisationId } } } = this.props;
  
      this.setState(prevState => ({
        ageServiceItems: {
          ...prevState.ageServiceItems,
          loading: true,
        },
      }));
  
      CatalogService.getAudienceSegmentServices(organisationId, {
        categorySubtype: ['AUDIENCE.AGE'],
      }).then(ageServiceItems => {
        this.setState(prevState => ({
          ageServiceItems: {
            data: ageServiceItems,
            loading: false,
          },
        }));
      });
    };
  
    fetchOwnDatamartSegments = () => {
      const { match: { params: { organisationId } }, datamart } = this.props;
  
      this.setState(prevState => ({
        audienceSegments: {
          ...prevState.audienceSegments,
          loading: true,
        },
      }));
  
      AudienceSegmentService.getSegments(organisationId, datamart.id, {
        max_results: 500,
      })
        .then(res => res.data)
        .then(audienceSegments => {
          this.setState(prevState => ({
            audienceSegments: {
              data: audienceSegments,
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
        ...rest,
      } = this.props

      // with remove props used for the purpose of this HOC
      // then pass the rest to the resulting component

      return <Component {...rest} {...this.state} />;
    }
  }

  return providedComponent;
}

export default compose<Props, InjectedAudienceCatalogProps>(
  withRouter,
  injectDatamart,
  provideAudienceCatalog,
);
