import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { CatalogRessource, CategoryRessource, ItemRessource } from '../../../models/catalog/catalog';
import { Card } from '@mediarithmics-private/mcs-components-library';
import CatalogItemTable from './CatalogItemTable'
import McsIcon from '../../../components/McsIcon'
import { ButtonStyleless } from '../../../components'
import { Select, Table, Breadcrumb, Icon } from 'antd';
import messages from './messages'
import injectNotifications, { InjectedNotificationProps } from '../../Notifications/injectNotifications';
import { injectDatamart, InjectedDatamartProps } from '../../Datamart';
import { TYPES } from '../../../constants/types';
import { lazyInject } from '../../../config/inversify.config';
import { ILibraryCatalogService } from '../../../services/Library/LibraryCatalogService';


const Option = Select.Option;

export interface Category extends CategoryRessource {
  hasSubCategory: boolean;
  hasItems: boolean;
  subItems: ItemRessource[];
}

interface CatalogContentState {
  catalogs: {
    items: CatalogRessource[];
    selectedId?: string;
    loading: boolean
  },
  categories: {
    items: Category[];
    loading: boolean;
  },
  path: Category[];
}

type Props = 
  InjectedNotificationProps & 
  InjectedDatamartProps &
  RouteComponentProps<{ organisationId: string }> & 
  InjectedIntlProps;

class CategoryTable extends Table<Category> {}

class CatalogContent extends React.Component<
  Props,
  CatalogContentState
> {

  @lazyInject(TYPES.ILibraryCatalogService)
  private _libraryCatalogService: ILibraryCatalogService;

  constructor(props: Props) {
    super(props);
    this.state = {
      catalogs: {
        items: [],
        selectedId: undefined,
        loading: true,
      },
      categories: {
        items: [],
        loading: true,
      },
      path: [],
    }
  }

  componentDidMount() {
    const {
      datamart,
    } = this.props;
    this.fetchCatalog(datamart.id);
  }
  
  componentDidUpdate(previousProps: Props) {
    const {
      match: {
        params: {
          organisationId
        }
      },
      datamart
    } = this.props;

    const {
      match: {
        params: {
          organisationId: previousOrganisationId,
        }
      },
    } = previousProps;

    if (organisationId !== previousOrganisationId) {
      this.fetchCatalog(datamart.id);
    }
  }
  
  fetchCatalog = (datamatId: string) => {
    const getSelectedCatalogId = (catalogs: CatalogRessource[]) => {
      return this.state.catalogs.selectedId ? this.state.catalogs.selectedId : catalogs && catalogs.length ? catalogs[0].token : null;
    }
    this._libraryCatalogService.getCatalogs(datamatId)
      .then(res => res.data)
      .then(catalogs => {
        const a = getSelectedCatalogId(catalogs);
        if (a !== null) {
          this.setState({ catalogs: { loading: false, items: catalogs, selectedId: a } })
          return this.fetchInitialCategories(datamatId, a)
        } else {
          this.setState({ catalogs: { loading: false, items: [] }, categories: { loading: false, items: [] } })
        }
      })
      .catch(err => this.handleError(err))
  }

  fetchInitialCategories = (datamartId: string, catalogToken: string) => {
    this._libraryCatalogService.getCatalogMainCategories(datamartId, catalogToken, { depth: 0, first_result: 0, max_results: 500 })
      .then(res => res.data)
      .then(res => {
        const promises = res.map(category => {
          return this._libraryCatalogService.getCatalogSubCategories(datamartId, catalogToken, category.category_id)
            .then(r => r.data)
            .then(r => { return {...category, hasSubCategory: r.length > 0 } })
            .then(r => {
              return this._libraryCatalogService.getCatalogCategoryItems(datamartId, catalogToken, category.category_id, { first_result: 0, max_results: 500 })
                .then(i => i.data)
                .then(i => { return {...r, hasItems: i.length > 0, subItems: i } })
            })
        })
        return Promise.all(promises)
      })
      .then(categories => this.setState({ categories: { items: categories, loading: false } }))
      .catch(err => this.handleError(err))
  }

  handleError = (err: any) => {
    this.props.notifyError(err);
    this.setState({
      path: [],
      catalogs: {
        ...this.state.catalogs,
        loading: false,
      },
      categories: {
        ...this.state.categories,
        loading: false,
      },
    })
  }

  fetchSubCategories = (datamartId: string, catalogToken: string, categoryId: string) => {
    this.setState({
      categories: {
        items: this.state.categories.items,
        loading: true,
      }
    }, () => {
      this._libraryCatalogService.getCatalogSubCategories(datamartId, catalogToken, categoryId, { depth: 0, first_result: 0, max_results: 500 })
        .then(res => res.data)
        .then(res => {
          const promises = res.map(category => {
            return this._libraryCatalogService.getCatalogSubCategories(datamartId, catalogToken, category.category_id)
              .then(r => r.data)
              .then(r => { return {...category, hasSubCategory: r.length > 0 } })
              .then(r => {
                return r.hasSubCategory ? {...r, hasItems: false, subItems: []} : this._libraryCatalogService.getCatalogCategoryItems(datamartId, catalogToken, category.category_id)
                  .then(i => i.data)
                  .then(i => { return {...r, hasItems: i.length > 0, subItems: i } }) 
              })
          })
          return Promise.all(promises)
        })
        .then(categories => this.setState({ categories: { items: categories, loading: false } }))
        .catch(err => this.handleError(err))
    })
  }

  handleCatalogChange = (value: string) => {
    const {
      datamart,
    } = this.props;

   this.setState({
     path: [],
     catalogs: {
       items: this.state.catalogs.items,
       loading: false,
       selectedId: value,
     },
     categories: {
       ...this.state.categories,
       loading: true,
     },
   }, () => this.fetchInitialCategories(datamart.id, value));
  
  }

  generateCatalogSelect = () => {
    return this.state.catalogs.items.length ? (
      <Select defaultValue={this.state.catalogs.selectedId} style={{ minWidth: 120 }} onChange={this.handleCatalogChange}>
        {this.state.catalogs.items.map(catalog => {
          return <Option key={catalog.token} value={catalog.token}>{catalog.token}</Option>
        })}
      </Select>
    ) : null
  }

  generateBreadcrumb = () => {
    const {
      datamart,
    } = this.props;

    const onHomeClick = () => {
      this.setState({ path: [], categories: { items: [], loading: true } }, () => {
        if (this.state.catalogs.selectedId) {
          this.fetchInitialCategories(datamart.id, this.state.catalogs.selectedId)
        }
      })
    }
    const onCategoryClick = (item: Category) => () => {
      const newPath = [ ... this.state.path ];
      const index = newPath.findIndex(i => i.category_id === item.category_id);
      this.setState({ path: newPath.slice(0, index + 1) }, () => {
        if (this.state.catalogs.selectedId) {
          this.fetchSubCategories(datamart.id, this.state.catalogs.selectedId, item.category_id)
        }
      })
      
    }

    return  (
      <Breadcrumb style={{ marginBottom: 14 }}>
        <Breadcrumb.Item>
          <ButtonStyleless onClick={onHomeClick}>
            <Icon type="home" /> { this.state.catalogs.selectedId }
          </ButtonStyleless>
        </Breadcrumb.Item>
        {this.state.path.map((item, i) => {
          return (
            <Breadcrumb.Item key={item.category_id}>
              {i === this.state.path.length -1 ? item.category_id : <ButtonStyleless onClick={onCategoryClick(item)}>
                {item.category_id}
              </ButtonStyleless>}
            </Breadcrumb.Item>
          )
        })}
      </Breadcrumb>
    )
  }

  renderEmbededView = (record: Category) => {
    const {
      intl
    } = this.props;
    return record.hasItems ? <CatalogItemTable records={record.subItems} /> : <div>{intl.formatMessage(messages.noProduct)}</div>
  }


  render() {
    const {
      datamart,
      intl,
    } = this.props;

    const handleOnRow = (record: Category) => ({
      onClick: () => {
        if (record.hasSubCategory) {
          this.setState({ path: [...this.state.path, record], categories: { loading: true, items: this.state.categories.items } }, () => {
            if (this.state.catalogs.selectedId) {
              this.fetchSubCategories(datamart.id, this.state.catalogs.selectedId, record.category_id);
            }
            
          })
        }
        
      },
    });

    const getRowClassName = (record: Category) => {
      if ( record.hasSubCategory ) return 'mcs-table-cursor';
      return '';
    }
  
    return (
      <div style={{ marginTop: 40 }}>
        <Card title={''} buttons={this.generateCatalogSelect()}>
          <hr />
          {this.generateBreadcrumb()}

          <CategoryTable
            columns={[
              {
                title: intl.formatMessage(messages.category),
                dataIndex: 'category_id',
              },
              {
                render: (text, record) => {
                  if (record.hasSubCategory) {
                    return (
                      <div className="float-right">
                        <McsIcon type="chevron-right" />
                      </div>
                    );
                  }
                  return null;
                },
              },
            ]}
            onRow={handleOnRow}
            rowClassName={getRowClassName}
            rowKey='category_id'
            loading={this.state.catalogs.loading || this.state.categories.loading}
            dataSource={this.state.categories.items}
            expandedRowRender={this.renderEmbededView}
            pagination={{
              size: 'small',
              showSizeChanger: true,
              hideOnSinglePage: true,
            }}
          />
        </Card>
      </div>
    )
  }
}

export default compose<Props, {}>(
  injectIntl,
  withRouter,
  injectNotifications,
  injectDatamart,
)(CatalogContent);
