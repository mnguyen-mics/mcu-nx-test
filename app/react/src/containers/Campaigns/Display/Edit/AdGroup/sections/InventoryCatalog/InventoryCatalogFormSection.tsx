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
import { InventoryCatalFieldsModel } from '../../domain';
import FormSection from '../../../../../../../components/Form/FormSection';
import messages from '../../../messages';
import inventoryCatalogMsgs from './messages';
import {
  ServiceCategoryTree,
  AdexInventoryServiceItemPublicResource,
  DisplayNetworkServiceItemPublicResource,
} from '../../../../../../../models/servicemanagement/PublicServiceItemResource';
import { Button } from '@mediarithmics-private/mcs-components-library';
import { ReduxFormChangeProps } from '../../../../../../../utils/FormHelper';
import { AdExchangeSelectionCreateRequest } from '../../../../../../../models/adexchange/adexchange';
import { DisplayNetworkSelectionCreateRequest } from '../../../../../../../models/displayNetworks/displayNetworks';
import TreeSelectWithList, {
  TreeData,
} from '../../../../../../../components/Form/TreeSelectWithList';

export interface InventoryCatalogFormSectionProps extends ReduxFormChangeProps {
  small?: boolean;
  disabled?: boolean;
  isScenario?: boolean;
}

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
  | DisplayNetworkServiceItemPublicResource;

class InventoryCatalogFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showExclude: false,
      includedDataSource: [],
      excludedDataSource: [],
    };
  }

  componentDidUpdate(previousProps: Props) {
    const { inventoryCategoryTree } = this.props;

    const {
      inventoryCategoryTree: previousInventoryCategoryTree,
    } = previousProps;

    if (inventoryCategoryTree !== previousInventoryCategoryTree) {
      this.buildIncludedDataSet(inventoryCategoryTree);
      this.buildExcludedDataSet(inventoryCategoryTree);
    }
  }

  buildIncludedDataSet = (
    inventoryCategoryTree: DataLoadingContainer<ServiceCategoryTree[]>,
  ) => {
    const includedDataSource = inventoryCategoryTree.data.map((child) =>
      toTreeData(
        child,
        [
          {
            value: child.node.id,
            label: child.node.name,
            isLeaf: false,
          },
        ],
        'services',
      ),
    );

    this.setState({ includedDataSource });
  };

  buildExcludedDataSet = (
    inventoryCategoryTree: DataLoadingContainer<ServiceCategoryTree[]>,
  ) => {
    const excludedDataSource = inventoryCategoryTree.data.map((child) =>
      toTreeData(
        child,
        [
          {
            value: child.node.id,
            label: child.node.name,
            isLeaf: false,
          },
        ],
        'services',
      ),
    );

    this.setState({ excludedDataSource });
  };

  getSelectedInventory = (excluded: boolean = false): string[] => {
    const selectedInventoryIds: string[] = [];
    this.props.fields.getAll().forEach((field) => {
      if (
        field.model.type === 'AD_EXCHANGE' &&
        field.model.data.exclude === excluded
      ) {
        selectedInventoryIds.push(
          `adExchange_${field.model.data.ad_exchange_id}`,
        );
      } else if (
        field.model.type === 'DISPLAY_NETWORK' &&
        field.model.data.exclude === excluded
      ) {
        selectedInventoryIds.push(
          `displayNetwork_${field.model.data.display_network_id}`,
        );
      }
    });

    return selectedInventoryIds;
  };

  markAsDeleted = (forExcludedSegment: boolean = false) => (
    inventoryId: string,
  ) => {
    const { fields } = this.props;

    fields.getAll().some((field, index) => {
      if (this.getId(field) === inventoryId) {
        fields.remove(index);
        return true;
      }
      return false;
    });
  };

  handleChange = (
    inventoryCategoryTree: ServiceCategoryTree[],
    exclude: boolean = false,
  ) => (inventoryIds: string[]) => {
    const { fields, formChange } = this.props;

    const allFields = fields.getAll() || [];

    const newFields: InventoryCatalFieldsModel[] = [];

    const currentlySelectedIds = this.getSelectedInventory(exclude);

    const unrelatedSelectedFields = allFields.filter(
      (field) => !currentlySelectedIds.includes(this.getId(field)),
    );

    newFields.push(...unrelatedSelectedFields);

    // Leave already checked ids and add new ones
    inventoryIds.forEach((inventoryId) => {
      const inventory = {
        type: inventoryId.split('_')[0],
        value: inventoryId.split('_')[1],
      };

      if (inventory.value) {
        const found = allFields.find((field) => {
          switch (inventory.type) {
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
          const newField = this.generateField(
            inventory.type,
            inventory.value,
            inventoryCategoryTree,
            exclude,
          );

          if (newField) {
            newFields.push(newField);
          }
        }
      }
    });

    // Don't add those that are not checked anymore
    allFields.forEach((field) => {
      const found = inventoryIds.includes(this.getId(field));
      if (found) {
        newFields.push({ ...field });
      }
    });

    formChange((fields as any).name, newFields);
  };

  generateField = (
    type: string,
    value: string,
    inventoryCategoryTree: ServiceCategoryTree[],
    exclude: boolean = false,
  ): InventoryCatalFieldsModel | undefined => {
    return this.generateFieldBasedOnService(
      type,
      value,
      inventoryCategoryTree,
      exclude,
    );
  };

  generateFieldBasedOnService = (
    type: string,
    value: string,
    inventoryCategoryTree: ServiceCategoryTree[],
    exclude: boolean = false,
  ): InventoryCatalFieldsModel | undefined => {
    const foundService = getServices(inventoryCategoryTree).find((s) => {
      switch (type) {
        case 'displayNetwork':
          return (
            s.type === 'inventory_access_display_network' &&
            s.display_network_id === value
          );
        case 'adExchange':
          return (
            s.type === 'inventory_access_ad_exchange' &&
            s.ad_exchange_id === value
          );
      }
      return false;
    });

    if (foundService) {
      switch (foundService.type) {
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
          };
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
          };
      }
    }
    return undefined;
  };

  getId = (field: InventoryCatalFieldsModel) => {
    switch (field.model.type) {
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
      children: audienceSegments.map((segment) => ({
        value: `${key}_${segment.id}`,
        label: segment.name,
        type: key,
        isLeaf: true,
      })),
    };
  };

  toogleShowExclude = () => {
    this.setState((prevState) => ({ showExclude: !prevState.showExclude }));
  };

  render() {
    const { intl, inventoryCategoryTree, small, disabled } = this.props;

    const excludedSegmentFound = !!this.getSelectedInventory(true).length;
    const showExclude = excludedSegmentFound || this.state.showExclude;

    return (
      <div className="audience-catalog">
        <FormSection
          title={messages.sectionInventoryTitle}
          subtitle={messages.sectionInventorySubTitle}
        />

        <Row>
          <Row className="audience-selection-notice">
            <Col span={15} offset={small ? 0 : 4}>
              <FormattedMessage
                {...inventoryCatalogMsgs.detailedTargetingNotice}
              />
            </Col>
          </Row>
          <TreeSelectWithList
            label={intl.formatMessage(
              inventoryCatalogMsgs.detailedTargetingLabel,
            )}
            placeholder={intl.formatMessage(
              inventoryCatalogMsgs.selectPlaceholder,
            )}
            dataSource={this.state.includedDataSource}
            loading={inventoryCategoryTree.loading}
            tooltipProps={{
              title: intl.formatMessage(
                inventoryCatalogMsgs.detailedTargetingTooltip,
              ),
            }}
            value={this.getSelectedInventory()}
            handleClickOnRemove={this.markAsDeleted()}
            handleOnChange={this.handleChange(
              inventoryCategoryTree.data
            )}
            disabled={disabled}
            small={small}
          />
          <div className={showExclude ? '' : 'hide-section'}>
            <Row className="audience-selection-notice">
              <Col span={15} offset={4}>
                <FormattedMessage
                  {...inventoryCatalogMsgs.detailedTargetingExclusionNotice}
                />
              </Col>
            </Row>
            <TreeSelectWithList
              label={intl.formatMessage(
                inventoryCatalogMsgs.detailedTargetingExclusionLabel,
              )}
              placeholder={intl.formatMessage(
                inventoryCatalogMsgs.selectPlaceholder,
              )}
              dataSource={this.state.excludedDataSource}
              loading={inventoryCategoryTree.loading}
              tooltipProps={{
                title: intl.formatMessage(
                  inventoryCatalogMsgs.detailedTargetingExclusionTooltip,
                ),
              }}
              value={this.getSelectedInventory(
                true,
              )}
              handleClickOnRemove={this.markAsDeleted(true)}
              handleOnChange={this.handleChange(
                inventoryCategoryTree.data,
                true,
              )}
              disabled={disabled}
            />
          </div>
          <Row className={showExclude ? 'hide-section' : ''}>
            <Col span={3} offset={small ? 20 : 14}>
              <Button
                onClick={disabled ? undefined : this.toogleShowExclude}
                className="action-button"
              >
                <FormattedMessage {...inventoryCatalogMsgs.excludeLinkMsg} />
              </Button>
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
  const categoryChildren = (category.children || []).map((child) => {
    const ancestor = {
      value: `${type}_${child.node.id}`,
      label: child.node.name,
      isLeaf: false,
    };
    return toTreeData(child, ancestors.concat(ancestor), type);
  });

  const serviceChildren = (category.services || []).map((service) => ({
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
