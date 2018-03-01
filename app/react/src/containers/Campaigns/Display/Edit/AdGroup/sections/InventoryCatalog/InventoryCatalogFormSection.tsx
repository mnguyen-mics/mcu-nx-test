import * as React from 'react';
import cuid from 'cuid';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { WrappedFieldArrayProps } from 'redux-form';
import { Row, Col } from 'antd/lib/grid';
import { compose } from 'recompose';
import provideInventoryCatalog, {
  InjectedInventoryCatalogProps,
  DataLoadingContainer,
} from './provideInventoryCatalog';

import {
  InventoryCatalFieldsModel,
} from '../../domain';
import FormSection from '../../../../../../../components/Form/FormSection';
import messages from '../../../messages';
import inventoryCatalogMsgs from './messages';
import {
  ServiceCategoryTree,
  AdexInventoryServiceItemPublicResource,
  DealListServiceItemPublicResource,
  DisplayNetworkServiceItemPublicResource,
  PlacementListServiceItemPublicResource,
} from '../../../../../../../models/servicemanagement/PublicServiceItemResource';
import FormSearchAndTreeSelect from '../../../../../../../components/Form/FormSearchAndTreeSelect';
import { TreeData } from '../../../../../../../components/SearchAndTreeSelect';
import ButtonStyleless from '../../../../../../../components/ButtonStyleless';
import { ReduxFormChangeProps } from '../../../../../../../utils/FormHelper';
import {
  DealsListResource,
  DealsListSelectionCreateRequest,
} from '../../../../../../../models/dealList/dealList';
import {
  KeywordListResource,
  KeywordListSelectionCreateRequest,
} from '../../../../../../../models/keywordList/keywordList';
import {
  PlacementListResource,
  PlacementListSelectionCreateRequest,
} from '../../../../../../../models/placement/PlacementListResource';
import { AdExchangeSelectionCreateRequest } from '../../../../../../../models/adexchange/adexchange';
import { DisplayNetworkSelectionCreateRequest } from '../../../../../../../models/displayNetworks/displayNetworks';

export interface InventoryCatalogFormSectionProps
  extends 
    ReduxFormChangeProps {}

type Props = WrappedFieldArrayProps<InventoryCatalFieldsModel> &
  InjectedIntlProps &
  InjectedInventoryCatalogProps &
  InventoryCatalogFormSectionProps;

interface State {
  showExclude: boolean;
  includedDataSource: TreeData[];
  excludedDataSource: TreeData[];
}

type ServicesType =
  | AdexInventoryServiceItemPublicResource
  | DealListServiceItemPublicResource
  | DisplayNetworkServiceItemPublicResource
  | PlacementListServiceItemPublicResource;

class InventoryCatalogFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showExclude: false,
      includedDataSource: [],
      excludedDataSource: [],
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      inventoryCategoryTree,
      keywordList,
      dealList,
      placementList,
    } = nextProps;

    this.buildIncludedDataSet(
      placementList,
      keywordList,
      dealList,
      inventoryCategoryTree,
    );
    this.buildExcludedDataSet(
      placementList,
      keywordList,
      inventoryCategoryTree,
    );
  }

  buildIncludedDataSet = (
    placementList: DataLoadingContainer<PlacementListResource[]>,
    keywordList: DataLoadingContainer<KeywordListResource[]>,
    dealList: DataLoadingContainer<DealsListResource[]>,
    inventoryCategoryTree: DataLoadingContainer<ServiceCategoryTree[]>,
  ) => {
    const { intl } = this.props;

    const placementListTree =
      placementList.data.length > 0
        ? // add datamart's segments to tree if any
          this.buildTreeDataFromOwnSegments(
            placementList.data,
            'placementList',
            intl.formatMessage(inventoryCatalogMsgs.myPlacementListCategory),
          )
        : [];

    const keywordListTree =
      keywordList.data.length > 0
        ? // add datamart's segments to tree if any
          this.buildTreeDataFromOwnSegments(
            keywordList.data,
            'keywordList',
            intl.formatMessage(inventoryCatalogMsgs.myKeywordListCategory),
          )
        : [];

    const dealListTree =
      dealList.data.length > 0
        ? // add datamart's segments to tree if any
          this.buildTreeDataFromOwnSegments(
            dealList.data,
            'dealList',
            intl.formatMessage(inventoryCatalogMsgs.myDealListCategory),
          )
        : [];

    const includedDataSource = inventoryCategoryTree.data
      .map(child =>
        toTreeData(
          child,
          [
            {
              value: child.node.id,
              label: child.node.name,
              isLeaf: false,
            },
          ],
          'servcices',
        ),
      )
      .concat(dealListTree, keywordListTree, placementListTree);

    this.setState({ includedDataSource });
  };

  buildExcludedDataSet = (
    placementList: DataLoadingContainer<PlacementListResource[]>,
    keywordList: DataLoadingContainer<KeywordListResource[]>,
    inventoryCategoryTree: DataLoadingContainer<ServiceCategoryTree[]>,
  ) => {
    const { intl } = this.props;

    const placementListTree =
      placementList.data.length > 0
        ? // add datamart's segments to tree if any
          this.buildTreeDataFromOwnSegments(
            placementList.data,
            'placementList',
            intl.formatMessage(inventoryCatalogMsgs.myPlacementListCategory),
          )
        : [];

    const keywordListTree =
      keywordList.data.length > 0
        ? // add datamart's segments to tree if any
          this.buildTreeDataFromOwnSegments(
            keywordList.data,
            'keywordList',
            intl.formatMessage(inventoryCatalogMsgs.myKeywordListCategory),
          )
        : [];

    const excludedDataSource = inventoryCategoryTree.data
      .map(child =>
        toTreeData(
          child,
          [
            {
              value: child.node.id,
              label: child.node.name,
              isLeaf: false,
            },
          ],
          'servcices',
        ),
      )
      .concat(keywordListTree, placementListTree);

    this.setState({ excludedDataSource });
  };

  getSelectedInventory = (
    serviceItems: ServicesType[],
    otherData: Array<
      DealsListResource | KeywordListResource | PlacementListResource
    >,
    excluded: boolean = false,
  ): string[] => {
    const selectedInventoryIds: string[] = [];
    this.props.fields.getAll().forEach(field => {
      if (field.model.type === 'DEAL_LIST' && !excluded) {
        selectedInventoryIds.push(
          `dealList_${field.model.data.deal_list_id}`,
        );
      } else if (
        field.model.type === 'KEYWORD_LIST' &&
        field.model.data.exclude === excluded
      ) {
        selectedInventoryIds.push(
          `keywordList_${field.model.data.keyword_list_id}`,
        );
      } else if (
        field.model.type === 'PLACEMENT_LIST' &&
        field.model.data.exclude === excluded
      ) {
        selectedInventoryIds.push(
          `placementList_${field.model.data.placement_list_id}`,
        );
      } else if (
        field.model.type === 'AD_EXCHANGE' &&
        field.model.data.exclude === excluded
      ) {
        selectedInventoryIds.push(
          `adExchange_${field.model.data.ad_exchange_id}`,
        );
      } else if (field.model.type === 'DISPLAY_NETWORK' && field.model.data.exclude === excluded) {
        selectedInventoryIds.push(
          `displayNetwork_${field.model.data.display_network_id}`,
        );
      }
    });

    // const serviceInventoryIds = [];
    // const otherDataIds = otherData.map(o => o.id);
    // const allSegmentIds = serviceInventoryIds.concat(otherDataIds);
    // return selectedInventoryIds.filter(id => allSegmentIds.includes(id));

    return selectedInventoryIds;
  };

  markAsDeleted = (forExcludedSegment: boolean = false) => (
    inventoryId: string,
  ) => {
    const { fields } = this.props;

    fields.getAll().some((field, index) => {
      if (
        this.getId(field) === inventoryId
        // && field.model.exclude === forExcludedSegment
      ) {
        fields.remove(index);
        return true;
      }
      return false;
    });
  };

  handleChange = (
    inventoryCategoryTree: ServiceCategoryTree[],
    dealList: DealsListResource[],
    keywordList: KeywordListResource[],
    placementList: PlacementListResource[],
    exclude: boolean = false,
  ) => (inventoryIds: string[]) => {
    const { fields, formChange } = this.props;


    const allFields = fields.getAll() || [];

    const newFields: InventoryCatalFieldsModel[] = [];

    const otherData = [...dealList, ...keywordList, ...placementList];

    const currentlySelectedIds = this.getSelectedInventory(
      getServices(inventoryCategoryTree),
      otherData,
      exclude,
    );

    const unrelatedSelectedFields = allFields.filter(
      field => !currentlySelectedIds.includes(this.getId(field)),
    );

    newFields.push(...unrelatedSelectedFields);

    // Leave already checked ids and add new ones
    inventoryIds.forEach(inventoryId => {
      const inventory = {
        type: inventoryId.split('_')[0],
        value: inventoryId.split('_')[1],
      };

      const found = allFields.find(field => {
        switch (inventory.type) {
          case 'keywordList':
            return (
              (field.model.data as KeywordListSelectionCreateRequest)
                .keyword_list_id === inventory.value
            );
          case 'placementList':
            return (
              (field.model.data as PlacementListSelectionCreateRequest)
                .placement_list_id === inventory.value
            );
          case 'dealList':
            return (
              (field.model.data as DealsListSelectionCreateRequest)
                .deal_list_id === inventory.value
            );
          case 'adExchange':
            return (
              (field.model.data as AdExchangeSelectionCreateRequest)
                .ad_exchange_id === inventory.value
            );
          case 'displayNetwork':
            return (
              (field.model.data as DisplayNetworkSelectionCreateRequest)
                .display_network_id === inventory.value
            );
        }
        return false;
      });

      if (!found) {

        const newField = this.generateField(inventory.type, inventory.value, inventoryCategoryTree, exclude);

        if (newField) {
          newFields.push(newField)
        }
      }
    });

    // Don't add those that are not checked anymore
    allFields
      // .filter(field => field.model.exclude === forExcludedSegment)
      .forEach(field => {
        const found = inventoryIds.includes(this.getId(field));
        if (found) {
          newFields.push({ ...field });
        }
      });

    formChange((fields as any).name, newFields);
  };

  generateField = (type: string, value: string, inventoryCategoryTree: ServiceCategoryTree[], exclude: boolean = false): InventoryCatalFieldsModel | undefined => {

    switch (type) {
      case 'keywordList':
        return {
          key: cuid(),
          model: {
            data: {
              keyword_list_id: value,
              exclude: exclude,
            },
            type: 'KEYWORD_LIST',
          },
        };
      case 'placementList':
        return {
          key: cuid(),
          model: {
            data: {
              placement_list_id: value,
              exclude: exclude,
            },
            type: 'PLACEMENT_LIST',
          },
        };
      case 'dealList':
        return {
          key: cuid(),
          model: {
            data: {
              deal_list_id: value,
              ad_group_id: "1", // to be removed
            },
            type: 'DEAL_LIST',
          },
        };
      default:
        return this.generateFieldBasedOnService(type, value, inventoryCategoryTree, exclude)
    }
  }

  generateFieldBasedOnService = (type: string, value: string, inventoryCategoryTree: ServiceCategoryTree[], exclude: boolean = false): InventoryCatalFieldsModel | undefined => {
    const foundService = getServices(inventoryCategoryTree).find(s => {
      switch(type) {
        case 'displayNetwork':
          return s.type === 'inventory_access_display_network' && s.display_network_id === value;
        case 'adExchange':
          return s.type === 'inventory_access_ad_exchange' && s.ad_exchange_id === value;
        case 'placementList':
          return s.type === 'inventory_access_placement_list' && s.placement_list_id === value;
        case 'dealList':
          return s.type === 'inventory_access_deal_list' && s.deal_list_id === value;
      }
      return false;
    })

    if (foundService) {
      switch(foundService.type) {
        case 'inventory_access_ad_exchange':
          return {
            key: cuid(),
            model: {
              data: {
                ad_exchange_id: foundService.ad_exchange_id,
                exclude: exclude, // to be removed ?
              },
              type: 'AD_EXCHANGE',
            },
          }
        case 'inventory_access_display_network':
          return {
            key: cuid(),
            model: {
              data: {
                display_network_id: foundService.display_network_id,
                exclude: exclude, // to be removed ?
              },
              type: 'DISPLAY_NETWORK',
            },
          }
        case 'inventory_access_deal_list':
          return {
            key: cuid(),
            model: {
              data: {
                deal_list_id: foundService.deal_list_id,
                ad_group_id: "1",
              },
              type: 'DEAL_LIST',
            },
          }
        case 'inventory_access_placement_list':
          return {
            key: cuid(),
            model: {
              data: {
                placement_list_id: foundService.placement_list_id,
                exclude: exclude, // to be removed ?
              },
              type: 'PLACEMENT_LIST',
            },
          }
      }
    }
    return undefined;
  }

  getId = (field: InventoryCatalFieldsModel) => {
    switch (field.model.type) {
      case 'PLACEMENT_LIST':
        return `placementList_${field.model.data.placement_list_id}`;
      case 'DEAL_LIST':
        return `dealList_${field.model.data.deal_list_id}`;
      case 'KEYWORD_LIST':
        return `keywordList_${field.model.data.keyword_list_id}`;
      case 'AD_EXCHANGE':
        return `adExchange_${field.model.data.ad_exchange_id}`;
      case 'DISPLAY_NETWORK':
        return `displayNetwork_${field.model.data.display_network_id}`;
    }
    return '';
  };

  buildTreeDataFromOwnSegments = (
    audienceSegments: any[],
    key: string,
    title: string,
  ): TreeData => {
    return {
      value: key,
      label: title,
      isLeaf: false,
      children: audienceSegments.map(segment => ({
        value: `${key}_${segment.id}`,
        label: segment.name,
        type: key,
        isLeaf: true,
      })),
    };
  };

  toogleShowExclude = () => {
    this.setState(prevState => ({ showExclude: !prevState.showExclude }));
  };

  render() {
    const {
      intl,
      inventoryCategoryTree,
      keywordList,
      dealList,
      placementList,
    } = this.props;

    const otherData = [
      ...dealList.data,
      ...keywordList.data,
      ...placementList.data,
    ];

    const excludedSegmentFound = !!this.getSelectedInventory(
      getServices(inventoryCategoryTree.data),
      otherData,
      true,
    ).length;
    const showExclude = excludedSegmentFound || this.state.showExclude;

    return (
      <div className="audience-catalog">
        <FormSection
          title={messages.sectionInventoryTitle}
          subtitle={messages.sectionInventorySubTitle}
        />

        <Row>
          <Row className="audience-selection-notice">
            <Col span={10} offset={4}>
              <FormattedMessage
                {...inventoryCatalogMsgs.detailedTargetingNotice}
              />
            </Col>
          </Row>
          <FormSearchAndTreeSelect
            label={intl.formatMessage(
              inventoryCatalogMsgs.detailedTargetingLabel,
            )}
            placeholder={intl.formatMessage(
              inventoryCatalogMsgs.selectPlaceholder,
            )}
            datasource={this.state.includedDataSource}
            loading={
              inventoryCategoryTree.loading ||
              dealList.loading ||
              keywordList.loading ||
              placementList.loading
            }
            tooltipProps={{
              title: intl.formatMessage(
                inventoryCatalogMsgs.detailedTargetingTooltip,
              ),
            }}
            value={this.getSelectedInventory(
              getServices(inventoryCategoryTree.data),
              otherData,
            )}
            handleClickOnRemove={this.markAsDeleted()}
            handleOnChange={this.handleChange(
              inventoryCategoryTree.data,
              dealList.data,
              keywordList.data,
              placementList.data,
            )}
          />
          <div className={showExclude ? '' : 'hide-section'}>
            <Row className="audience-selection-notice">
              <Col span={10} offset={4}>
                <FormattedMessage
                  {...inventoryCatalogMsgs.detailedTargetingExclusionNotice}
                />
              </Col>
            </Row>
            <FormSearchAndTreeSelect
              label={intl.formatMessage(
                inventoryCatalogMsgs.detailedTargetingExclusionLabel,
              )}
              placeholder={intl.formatMessage(
                inventoryCatalogMsgs.selectPlaceholder,
              )}
              datasource={this.state.excludedDataSource}
              loading={
                inventoryCategoryTree.loading ||
                dealList.loading ||
                keywordList.loading ||
                placementList.loading
              }
              tooltipProps={{
                title: intl.formatMessage(
                  inventoryCatalogMsgs.detailedTargetingExclusionTooltip,
                ),
              }}
              value={this.getSelectedInventory(
                getServices(inventoryCategoryTree.data),
                otherData,
                true,
              )}
              handleClickOnRemove={this.markAsDeleted(true)}
              handleOnChange={this.handleChange(
                inventoryCategoryTree.data,
                dealList.data,
                keywordList.data,
                placementList.data,
                true,
              )}
            />
          </div>
          <Row className={showExclude ? 'hide-section' : ''}>
            <Col span={3} offset={11}>
              <ButtonStyleless
                onClick={this.toogleShowExclude}
                className="action-button"
              >
                <FormattedMessage {...inventoryCatalogMsgs.excludeLinkMsg} />
              </ButtonStyleless>
            </Col>
          </Row>
        </Row>
      </div>
    );
  }
}

export default compose<Props, InventoryCatalogFormSectionProps>(
  injectIntl,
  provideInventoryCatalog,
)(InventoryCatalogFormSection);

function generateServiceType(service: ServicesType) {
  if (service.type === 'inventory_access_ad_exchange') {
    return `adExchange_${service.ad_exchange_id}`;
  } else if (service.type === 'inventory_access_display_network') {
    return `displayNetwork_${service.display_network_id}`;
  } else if (service.type === 'inventory_access_placement_list') {
    return `placementList_${service.placement_list_id}`;
  } else if (service.type === 'inventory_access_deal_list') {
    return `dealList_${service.deal_list_id}`;
  }
  return '';
}

/////////////
// HELPERS //
/////////////

function toTreeData(
  category: ServiceCategoryTree,
  ancestors: TreeData[],
  type: string,
): TreeData {
  const categoryChildren = (category.children || []).map(child => {
    const ancestor = {
      value: `${type}_${child.node.id}`,
      label: child.node.name,
      isLeaf: false,
    };
    return toTreeData(child, ancestors.concat(ancestor), type);
  });

  const serviceChildren = (category.services || []).map(service => ({
    // TODO remove as any
    value: generateServiceType(service as any),
    label: service.name,
    parentLabel: category.node.name,
    ancestors,
    isLeaf: true,
  }));

  return {
    value: `${type}_${category.node.id}`,
    label: category.node.name,
    isLeaf: false,
    children: [...categoryChildren, ...serviceChildren],
  };
}

function getServices(categoryTree: ServiceCategoryTree[]): ServicesType[] {
  function traverse(treeNode: ServiceCategoryTree): ServicesType[] {
    return treeNode.children.reduce((acc, child) => {
      return [...acc, ...traverse(child)];
    }, (treeNode.services as ServicesType[]) || []);
  }

  return categoryTree.reduce((acc, treeNode) => {
    return [...acc, ...traverse(treeNode)];
  }, []);
}
