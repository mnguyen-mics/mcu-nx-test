import * as React from 'react';
import _ from 'lodash';
import { Input, Row, Col, Breadcrumb, AutoComplete, Spin } from 'antd';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { RouteComponentProps } from 'react-router';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import {
  IAudienceFeatureService,
  AudienceFeatureSearchSettings,
} from '../../../../services/AudienceFeatureService';
import { StandardSegmentBuilderFormData } from '../../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { AudienceFeatureFolderResource } from '../../../../models/audienceFeature/AudienceFeatureResource';
import {
  Button,
  Actionbar,
  McsIcon,
  EmptyTableView,
  CollectionView,
  Loading,
} from '@mediarithmics-private/mcs-components-library';
import AudienceFeatureCard from './AudienceFeatureCard';
import { FolderOutlined } from '@ant-design/icons';
import { messages } from '../constants';
import Layout from 'antd/lib/layout/layout';
import { PaginationProps } from 'antd/lib/pagination';
import { InjectedFeaturesProps, injectFeatures } from '../../../Features';

const Search = Input.Search;
export interface Filter {
  currentPage: number;
  pageSize: number;
}
interface MapStateToProps {
  formValues: StandardSegmentBuilderFormData;
}

export interface AudienceFeatureSelectorProps {
  datamartId: string;
  save: (audienceFeatures: AudienceFeatureResource[], finalValue?: string) => void;
  close: () => void;
}

interface State {
  isLoading: boolean;
  audienceFeatureFolders?: AudienceFeatureFolderResource[];
  selectedAudienceFeature?: AudienceFeatureResource;
  currentAudienceFeatureFolder?: AudienceFeatureFolderResource;
  currentAudienceFeatures?: AudienceFeatureResource[];
  hideFolder?: boolean;
  searchSettings: AudienceFeatureSearchSettings;
  total?: number;
  searchValue?: string;
  searchOptions: Array<{ value: string }>;
  isLoadingFinalValues: boolean;
  isJobExecutionExisting?: boolean;
}

type Props = MapStateToProps &
  AudienceFeatureSelectorProps &
  InjectedIntlProps &
  InjectedFeaturesProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }>;

class AudienceFeatureSelector extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceFeatureService)
  private _audienceFeatureService: IAudienceFeatureService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      searchSettings: {
        currentPage: 1,
        pageSize: 12,
      },
      hideFolder: false,
      searchOptions: [],
      isLoadingFinalValues: false,
    };
  }

  componentDidMount() {
    this.setState({
      isLoading: true,
    });
    this.fetchBaseFoldersAndFeatures();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { searchSettings: prevSearchSettings } = prevState;
    const { searchSettings, currentAudienceFeatureFolder } = this.state;
    const { datamartId } = this.props;
    if (searchSettings !== prevSearchSettings) {
      this.setState({
        isLoading: true,
      });
      const options = this._audienceFeatureService.buildAudienceFeatureOptions(
        searchSettings,
        currentAudienceFeatureFolder?.id,
      );
      this._audienceFeatureService
        .getAudienceFeatures(datamartId, options)
        .then(response =>
          this.setState({
            isLoading: false,
            currentAudienceFeatures: response.data,
            total: response.total,
          }),
        )
        .catch(err => {
          this.setState({
            isLoading: false,
            currentAudienceFeatures: [],
            total: 0,
            audienceFeatureFolders: [],
          });
        });
    }
  }

  setBaseFolderAndFeatures = (
    folders: AudienceFeatureFolderResource[],
    baseFeatures: AudienceFeatureResource[],
    total?: number,
    isJobExecutionExisting?: boolean,
  ) => {
    this.setState({
      audienceFeatureFolders: folders,
      currentAudienceFeatureFolder: undefined,
      currentAudienceFeatures: baseFeatures,
      total: total,
      isLoading: false,
      isJobExecutionExisting: isJobExecutionExisting,
    });
  };

  onFailure = (err: any) => {
    this.props.notifyError(err);
    this.setState({
      isLoading: false,
    });
  };

  fetchBaseFoldersAndFeatures = () => {
    const { datamartId } = this.props;
    const { searchSettings } = this.state;
    this._audienceFeatureService.fetchFoldersAndFeatures(
      datamartId,
      this.setBaseFolderAndFeatures,
      this.onFailure,
      searchSettings,
      true,
    );
  };

  getSearchOptions = () => {
    const { intl } = this.props;
    const { searchSettings } = this.state;
    return {
      placeholder: intl.formatMessage(messages.searchAudienceFeature),
      onSearch: (value: string) => {
        this.setState({
          searchSettings: {
            ...searchSettings,
            keywords: value,
            currentPage: 1,
          },
          hideFolder: !!value,
          currentAudienceFeatureFolder: undefined,
        });
      },
    };
  };

  getBreadCrumb = () => {
    const { currentAudienceFeatureFolder, audienceFeatureFolders } = this.state;
    const { intl } = this.props;
    const buildBreadCrumbs = () => {
      if (audienceFeatureFolders) {
        const path: AudienceFeatureFolderResource[] = [];
        const pathLoop = (folder: AudienceFeatureFolderResource) => {
          path.unshift(folder);
          if (folder.parent_id) {
            const parent = audienceFeatureFolders.find(f => f.id === folder.parent_id);
            pathLoop(parent!);
          }
        };
        if (currentAudienceFeatureFolder) {
          pathLoop(currentAudienceFeatureFolder);
        }

        const breadcrmb = path.map(elt => {
          return (
            <Breadcrumb.Item key={elt.id}>
              <Button onClick={this.onSelectFolder(elt.id)}>{elt.name}</Button>
            </Breadcrumb.Item>
          );
        });
        breadcrmb.unshift(
          <Breadcrumb.Item key={'root_folder'}>
            <Button onClick={this.onSelectFolder()}>
              {intl.formatMessage(messages.audienceFeatures)}
            </Button>
          </Breadcrumb.Item>,
        );
        return breadcrmb;
      }
      return;
    };
    return (
      <Breadcrumb className='mcs-standardSegmentBuilder_breadCrumb mcs-breadcrumb'>
        {buildBreadCrumbs()}
      </Breadcrumb>
    );
  };

  onSelectFolder = (folderId?: string) => () => {
    const { searchSettings, audienceFeatureFolders } = this.state;
    this.setState({
      searchSettings: {
        ...searchSettings,
        currentPage: 1,
      },
      hideFolder: !!folderId,
      currentAudienceFeatureFolder: folderId
        ? audienceFeatureFolders?.find(f => f.id === folderId)
        : undefined,
    });
  };

  onSelectFeature = (featureId: string, finalValue?: string) => () => {
    const { save } = this.props;
    const { currentAudienceFeatures } = this.state;
    const selectedAudienceFeature = currentAudienceFeatures?.find(
      audienceFeature => audienceFeature.id === featureId,
    );
    this.setState(
      {
        selectedAudienceFeature,
      },
      () => {
        if (selectedAudienceFeature) save([selectedAudienceFeature], finalValue);
      },
    );
  };

  onFilterChange = (newFilter: Filter) => {
    const { searchSettings } = this.state;
    this.setState({
      searchSettings: {
        ...searchSettings,
        currentPage: newFilter.currentPage,
        pageSize: newFilter.pageSize,
      },
    });
  };

  renderSelector = () => {
    const { intl, hasFeature, datamartId, notifyError } = this.props;
    const {
      audienceFeatureFolders,
      selectedAudienceFeature,
      currentAudienceFeatures,
      currentAudienceFeatureFolder,
      searchSettings,
      hideFolder,
      isLoading,
      total,
      searchValue,
      searchOptions,
      isLoadingFinalValues,
      isJobExecutionExisting,
    } = this.state;
    const noData =
      (!audienceFeatureFolders || audienceFeatureFolders.length === 0) &&
      (!currentAudienceFeatures || currentAudienceFeatures.length === 0);

    if (isLoading) {
      return <Loading isFullScreen={true} />;
    } else if (noData) {
      return <EmptyTableView iconType='warning' message={intl.formatMessage(messages.noData)} />;
    }

    const audienceFeatures = currentAudienceFeatures
      ? currentAudienceFeatures.map(feature => {
          return (
            <AudienceFeatureCard
              key={'audience_feature-card-' + feature.id}
              audienceFeature={feature}
              selectedAudienceFeature={selectedAudienceFeature}
              onSelectFeature={this.onSelectFeature}
              searchValue={searchValue}
            />
          );
        })
      : [];
    const pagination: PaginationProps = {
      className: 'ant-table-pagination mini float-right',
      pageSizeOptions: ['12', '24', '36', '48'],
      size: 'small',
      current: searchSettings.currentPage,
      pageSize: searchSettings.pageSize,
      showSizeChanger: true,
      total: total,
      onChange: (page: number, size: number) =>
        this.onFilterChange({
          currentPage: page,
          pageSize: size,
        }),
      onShowSizeChange: (current: number, size: number) =>
        this.onFilterChange({
          pageSize: size,
          currentPage: 1,
        }),
    };

    const onSearch = (searchText: string) => {
      this.setState(
        {
          searchValue: searchText,
        },
        () => {
          if (this.state.isJobExecutionExisting) {
            this.setState({
              isLoadingFinalValues: true,
            });
            this._audienceFeatureService
              .getFinalValues(datamartId, searchText)
              .then(res => {
                const finalValuesObject = res.data;
                if (searchText === this.state.searchValue) {
                  this.setState({
                    searchOptions: finalValuesObject.values.map(val => {
                      return {
                        value: val,
                      };
                    }),
                    isLoadingFinalValues: false,
                  });
                }
              })
              .catch(error => {
                notifyError(error);
                this.setState({
                  searchOptions: [],
                  isLoadingFinalValues: false,
                });
              });
          }
        },
      );
    };

    const onSelect = (searchText: string) => {
      this.setState({
        searchSettings: {
          ...searchSettings,
          finalValues: isJobExecutionExisting ? searchText : undefined,
          keywords: searchText,
          currentPage: 1,
        },
        hideFolder: !!searchText,
        currentAudienceFeatureFolder: undefined,
      });
    };

    const onPressEnter = () => {
      this.setState({
        searchSettings: {
          ...searchSettings,
          finalValues: isJobExecutionExisting ? searchValue : undefined,
          keywords: searchValue,
          currentPage: 1,
        },
        hideFolder: !!searchValue,
        currentAudienceFeatureFolder: undefined,
        searchValue: searchValue,
      });
    };

    return (
      <React.Fragment>
        {hasFeature('audience-feature-search') ? (
          <AutoComplete
            value={searchValue}
            options={searchOptions}
            dropdownMatchSelectWidth={352}
            style={{ width: 400 }}
            onSelect={onSelect}
            onSearch={onSearch}
            notFoundContent={isLoadingFinalValues && <Spin />}
          >
            <Input.Search
              size='large'
              placeholder={intl.formatMessage(messages.searchAudienceFeature)}
              onPressEnter={onPressEnter}
              onSearch={onPressEnter}
            />
          </AutoComplete>
        ) : (
          <Search className='mcs-search-input' {...this.getSearchOptions()} />
        )}

        {!searchSettings.keywords && this.getBreadCrumb()}
        <Row gutter={16}>
          {!hideFolder &&
            audienceFeatureFolders
              ?.filter(f =>
                currentAudienceFeatureFolder
                  ? currentAudienceFeatureFolder?.id === f.parent_id
                  : f.parent_id === null,
              )
              ?.map(folder => {
                return (
                  <Col key={folder.id ? folder.id : 'root_key'} span={4}>
                    <div
                      className='mcs-standardSegmentBuilder_folder'
                      onClick={this.onSelectFolder(folder.id)}
                    >
                      <FolderOutlined className='mcs-standardSegmentBuilder_folderIcon' />
                      <br />
                      <span>{folder.name}</span>
                      <br />
                      <span className='mcs-standardSegmentBuilder_folderChildNumber'>
                        {folder.audience_features_ids?.length} features
                      </span>
                    </div>
                  </Col>
                );
              })}
        </Row>
        <div className='mcs-standardSegmentBuilder_featureCardContainer'>
          <CollectionView
            collectionItems={audienceFeatures!}
            pagination={pagination}
            loading={isLoading}
            gutter={16}
          />
        </div>
      </React.Fragment>
    );
  };

  render() {
    const {
      intl: { formatMessage },
      close,
    } = this.props;

    return (
      <Layout className={'mcs-selector-layout'}>
        <Actionbar pathItems={[formatMessage(messages.addAudienceFeature)]} edition={true}>
          <McsIcon type='close' className='close-icon mcs-table-cursor' onClick={close} />
        </Actionbar>
        <Layout className={`mcs-edit-container mcs-standardSegmentBuilder_featureSelector`}>
          {this.renderSelector()}
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, AudienceFeatureSelectorProps>(
  injectIntl,
  injectFeatures,
  injectNotifications,
)(AudienceFeatureSelector);
