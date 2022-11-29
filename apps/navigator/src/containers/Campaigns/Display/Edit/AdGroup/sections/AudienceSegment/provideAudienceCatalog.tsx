import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { ICatalogService } from '../../../../../../../services/CatalogService';
import { AudienceSegmentResource } from '../../../../../../../models/audiencesegment';
import {
  ServiceCategoryTree,
  AudienceSegmentServiceItemPublicResource,
} from '../../../../../../../models/servicemanagement/PublicServiceItemResource';
import { EditAdGroupRouteMatchParam } from '../../domain';
import injectDatamart, { InjectedDatamartProps } from '../../../../../../Datamart/injectDatamart';
import { IAudienceSegmentService } from '../../../../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../../../../constants/types';
import { lazyInject } from '../../../../../../../config/inversify.config';

export interface DataLoadingContainer<T> {
  data: T;
  loading: boolean;
}

export interface InjectedAudienceCatalogProps {
  audienceCategoryTree: DataLoadingContainer<ServiceCategoryTree[]>;
  genderServiceItems: DataLoadingContainer<AudienceSegmentServiceItemPublicResource[]>;
  ageServiceItems: DataLoadingContainer<AudienceSegmentServiceItemPublicResource[]>;
  audienceSegments: DataLoadingContainer<AudienceSegmentResource[]>;
}

type State = InjectedAudienceCatalogProps;

type Props = InjectedDatamartProps & RouteComponentProps<EditAdGroupRouteMatchParam>;

const provideAudienceCatalog = (Component: React.ComponentClass<InjectedAudienceCatalogProps>) => {
  class ProvidedComponent extends React.Component<Props, State> {
    @lazyInject(TYPES.IAudienceSegmentService)
    private _audienceSegmentService: IAudienceSegmentService;

    @lazyInject(TYPES.ICatalogService)
    private _catalogService: ICatalogService;

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
      const {
        match: {
          params: { organisationId },
        },
      } = this.props;

      this.setState(prevState => ({
        audienceCategoryTree: {
          ...prevState.audienceCategoryTree,
          loading: true,
        },
      }));

      this._catalogService
        .getCategoryTree(organisationId, {
          serviceType: ['AUDIENCE_DATA.AUDIENCE_SEGMENT'],
        })
        .then(categoryTree => {
          const fetchServices = (category: ServiceCategoryTree): Promise<ServiceCategoryTree> => {
            const servicesP = this._catalogService.getServices(organisationId, {
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
            audienceCategoryTree: {
              // if 1 catalog only, hide root
              data: categoryTree.length === 1 ? categoryTree[0].children : categoryTree,
              loading: false,
            },
          }));
        });
    };

    fetchGenderServiceItems = () => {
      const {
        match: {
          params: { organisationId },
        },
      } = this.props;

      this.setState(prevState => ({
        genderServiceItems: {
          ...prevState.genderServiceItems,
          loading: true,
        },
      }));

      this._catalogService
        .getAudienceSegmentServices(organisationId, {
          categorySubtype: ['AUDIENCE.GENDER'],
        })
        .then(res => res.data)
        .then(genderServiceItems => {
          this.setState(prevState => ({
            genderServiceItems: {
              data: genderServiceItems,
              loading: false,
            },
          }));
        });
    };

    fetchAgeServiceItems = () => {
      const {
        match: {
          params: { organisationId },
        },
      } = this.props;

      this.setState(prevState => ({
        ageServiceItems: {
          ...prevState.ageServiceItems,
          loading: true,
        },
      }));

      this._catalogService
        .getAudienceSegmentServices(organisationId, {
          categorySubtype: ['AUDIENCE.AGE'],
        })
        .then(res => res.data)
        .then(ageServiceItems => {
          this.setState(prevState => ({
            ageServiceItems: {
              data: ageServiceItems,
              loading: false,
            },
          }));
        });
    };

    fetchOwnDatamartSegments = () => {
      const {
        match: {
          params: { organisationId },
        },
        datamart,
      } = this.props;

      this.setState(prevState => ({
        audienceSegments: {
          ...prevState.audienceSegments,
          loading: true,
        },
      }));

      this._audienceSegmentService
        .getSegments(organisationId, {
          max_results: 500,
          datamart_id: datamart.id,
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
      const { datamart, history, location, match, ...rest } = this.props;

      // with remove props used for the purpose of this HOC
      // then pass the rest to the resulting component

      return <Component {...rest} {...this.state} />;
    }
  }
  return ProvidedComponent;
};

export default compose<Props, InjectedAudienceCatalogProps>(
  withRouter,
  injectDatamart,
  provideAudienceCatalog,
);
