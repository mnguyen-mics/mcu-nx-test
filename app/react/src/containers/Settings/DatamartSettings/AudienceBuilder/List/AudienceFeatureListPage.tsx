import * as React from 'react';
import _ from 'lodash';
import queryString from 'query-string';
import { compose } from 'recompose';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Button, Layout, Modal, Input, Breadcrumb } from 'antd';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { messages } from '../messages';
import {
  KEYWORD_SEARCH_SETTINGS,
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';
import AudienceFeatureTable from '../List/AudienceFeatureTable';
import { injectDrawer } from '../../../../../components/Drawer';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import { IAudienceFeatureService } from '../../../../../services/AudienceFeatureService';
import { AudienceFeatureResource } from '../../../../../models/audienceFeature';
import { SearchFilter } from '@mediarithmics-private/mcs-components-library/lib/utils';
import { AudienceFeatureFolderResource } from '../../../../../models/audienceFeature/AudienceFeatureResource';
import { Button as McsButton } from '@mediarithmics-private/mcs-components-library';
import AudienceFeatureFolder from './AudienceFeatureFolder';

const { Content } = Layout;

export const AUDIENCE_FEATURE_SEARCH_SETTINGS = [
  ...KEYWORD_SEARCH_SETTINGS,
  ...PAGINATION_SEARCH_SETTINGS,
];

interface State {
  isLoading: boolean;
  audienceFeatureFolders?: AudienceFeatureFolderResource[];
  currentAudienceFeatures?: AudienceFeatureResource[];
  currentAudienceFeatureFolder?: AudienceFeatureFolderResource;
  selectedAudienceFeature?: AudienceFeatureResource;
  inputValue: string;
  total?: number;
  displayFolderInput: boolean;
}

type Props = RouteComponentProps<{
  organisationId: string;
  datamartId: string;
}> &
  InjectedNotificationProps &
  InjectedIntlProps;

class AudienceFeatureListPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceFeatureService)
  private _audienceFeatureService: IAudienceFeatureService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      displayFolderInput: false,
      inputValue: '',
    };
  }

  componentDidMount() {
    const {
      history,
      match: {
        params: { datamartId },
      },
    } = this.props;
    this.setState({
      isLoading: true,
    });
    const searchFilter = {
      currentPage: 1,
      pageSize: 10,
      folder_id: 'none',
    };
    history.push({
      search: updateSearch('', searchFilter),
    });
    this.fetchBaseFoldersAndFeatures(datamartId, searchFilter);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const {
      location: { search: prevSearch },
    } = prevProps;
    const {
      location: { search },
      match: {
        params: { datamartId },
      },
    } = this.props;
    const { currentAudienceFeatureFolder } = this.state;
    const { currentAudienceFeatureFolder: prevAudienceFeatureFolder } = prevState;
    const keywords = queryString.parse(search).keywords;
    const options = this._audienceFeatureService.buildAudienceFeatureOptions(
      {
        ...parseSearch<SearchFilter>(search, AUDIENCE_FEATURE_SEARCH_SETTINGS),
        keywords: keywords,
      },
      currentAudienceFeatureFolder?.id,
    );
    const prevKeywords = queryString.parse(prevSearch).keywords;
    const prevOptions = this._audienceFeatureService.buildAudienceFeatureOptions(
      {
        ...parseSearch<SearchFilter>(prevSearch, AUDIENCE_FEATURE_SEARCH_SETTINGS),
        keywords: prevKeywords,
      },
      prevAudienceFeatureFolder?.id,
    );
    if (!_.isEqual(options, prevOptions)) {
      this.setState({
        isLoading: true,
        currentAudienceFeatureFolder: keywords ? undefined : currentAudienceFeatureFolder,
      });

      this._audienceFeatureService.getAudienceFeatures(datamartId, options).then(response =>
        this.setState({
          isLoading: false,
          currentAudienceFeatures: response.data,
          total: response.total,
        }),
      );
    }
  }

  setBaseFolderAndFeatures = (
    folders: AudienceFeatureFolderResource[],
    baseFeatures: AudienceFeatureResource[],
    total?: number,
  ) => {
    this.setState({
      audienceFeatureFolders: folders,
      currentAudienceFeatureFolder: undefined,
      currentAudienceFeatures: baseFeatures,
      total: total,
      isLoading: false,
    });
  };

  onFailure = (err: any) => {
    this.props.notifyError(err);
    this.setState({
      isLoading: false,
    });
  };

  fetchBaseFoldersAndFeatures = (
    datamartId: string,
    defaultSearchFilter?: Partial<SearchFilter>,
  ) => {
    const {
      location: { search },
    } = this.props;
    this.setState({
      isLoading: true,
    });
    const searchFilter = defaultSearchFilter
      ? defaultSearchFilter
      : parseSearch<SearchFilter>(search, AUDIENCE_FEATURE_SEARCH_SETTINGS);
    this._audienceFeatureService.fetchFoldersAndFeatures(
      datamartId,
      this.setBaseFolderAndFeatures,
      this.onFailure,
      searchFilter,
    );
  };

  deleteAudienceFeature = (resource: AudienceFeatureResource) => {
    const {
      location: { search },
      history,
      intl: { formatMessage },
      notifyError,
    } = this.props;

    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      title: formatMessage(messages.audienceFeatureDeleteListModalTitle),
      okText: formatMessage(messages.audienceFeatureDeleteListModalOk),
      className: 'mcs-audienceFeatureDeletePopUp',
      cancelText: formatMessage(messages.audienceFeatureDeleteListModalCancel),
      onOk: () => {
        this._audienceFeatureService
          .deleteAudienceFeature(resource.datamart_id, resource.id)
          .then(() => {
            this.fetchBaseFoldersAndFeatures(resource.datamart_id);
            history.replace({
              search: updateSearch(search, {
                currentPage: 1,
              }),
            });
          })
          .catch(err => {
            notifyError(err);
          });
      },
      onCancel: () => {
        // cancel,
      },
    });
  };

  renameFolder = (folderId: string, newName: string) => {
    const {
      match: {
        params: { datamartId },
      },
    } = this.props;
    return this._audienceFeatureService
      .updateAudienceFeatureFolder(datamartId, folderId, {
        name: newName,
      })
      .catch(err => {
        this.props.notifyError(err);
      })
      .then(res => this.fetchBaseFoldersAndFeatures(datamartId));
  };

  createFolder = () => {
    const {
      match: {
        params: { datamartId },
      },
    } = this.props;
    const { inputValue } = this.state;
    return this._audienceFeatureService
      .createAudienceFeatureFolder(datamartId, {
        name: inputValue,
        datamart_id: datamartId,
        parent_id: null,
      })
      .catch(err => {
        this.props.notifyError(err);
      });
  };

  deleteFolder = (folderId: string) => {
    const {
      match: {
        params: { datamartId },
      },
      intl: { formatMessage },
      notifyError,
    } = this.props;

    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      title: formatMessage(messages.audienceFolderDeleteListModalTitle),
      okText: formatMessage(messages.audienceFeatureDeleteListModalOk),
      cancelText: formatMessage(messages.audienceFeatureDeleteListModalCancel),
      onOk: () => {
        this._audienceFeatureService
          .deleteAudienceFeatureFolder(datamartId, folderId)
          .then(() => {
            this.fetchBaseFoldersAndFeatures(datamartId);
          })
          .catch(err => {
            notifyError(err);
          });
      },
      onCancel: () => {
        // cancel,
      },
    });
  };

  onSelectFolder = (folderId?: string) => () => {
    const {
      location: { search },
      history,
    } = this.props;
    const { audienceFeatureFolders } = this.state;
    history.replace({
      search: updateSearch(search, {
        currentPage: 1,
        folder_id: folderId,
      }),
    });
    this.setState({
      currentAudienceFeatureFolder: folderId
        ? audienceFeatureFolders?.find(f => f.id === folderId)
        : undefined,
    });
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
              <McsButton onClick={this.onSelectFolder(elt.id)}>{elt.name}</McsButton>
            </Breadcrumb.Item>
          );
        });
        breadcrmb.unshift(
          <Breadcrumb.Item key={'root_folder'}>
            <McsButton onClick={this.onSelectFolder()}>
              {intl.formatMessage(messages.audienceFeatures)}
            </McsButton>
          </Breadcrumb.Item>,
        );
        return breadcrmb;
      }
      return;
    };
    return (
      <Breadcrumb className='mcs-audienceBuilder_breadCrumb mcs-breadcrumb'>
        {buildBreadCrumbs()}
      </Breadcrumb>
    );
  };

  renderFolderTable = () => {
    const { currentAudienceFeatureFolder, audienceFeatureFolders } = this.state;
    const {
      location: { search },
    } = this.props;
    const filter = parseSearch<SearchFilter>(search, AUDIENCE_FEATURE_SEARCH_SETTINGS);

    return filter.keywords ? undefined : (
      <div>
        {this.getBreadCrumb()}
        <div className='mcs-audienceFeatureSettings_folderTable'>
          {audienceFeatureFolders
            ?.filter(f =>
              currentAudienceFeatureFolder
                ? currentAudienceFeatureFolder?.id === f.parent_id
                : f.parent_id === null,
            )
            ?.map(folder => {
              return (
                <AudienceFeatureFolder
                  key={folder.id ? folder.id : 'root_key'}
                  folder={folder}
                  onSelectFolder={this.onSelectFolder}
                  renameFolder={this.renameFolder}
                  deleteFolder={this.deleteFolder}
                />
              );
            })}
        </div>
      </div>
    );
  };

  onFilterChange = (newFilter: SearchFilter) => {
    const {
      history,
      location: { search },
    } = this.props;
    const nextLocation = {
      search: updateSearch(search, newFilter, AUDIENCE_FEATURE_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  };

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ inputValue: e.target.value });
  };

  buildActionButtons = () => {
    const {
      history,
      intl,
      match: {
        params: { datamartId, organisationId },
      },
    } = this.props;
    const { displayFolderInput, inputValue } = this.state;
    const addNewFeature = () => {
      history.push({
        pathname: `/v2/o/${organisationId}/settings/datamart/${datamartId}/audience_feature/create`,
        state: {
          datamartId: datamartId,
        },
      });
    };

    const addFolder = () => {
      this.setState({
        displayFolderInput: true,
      });
    };

    const onOk = () => {
      this.createFolder().then(res => {
        this.fetchBaseFoldersAndFeatures(datamartId);
        this.setState({
          displayFolderInput: false,
          inputValue: '',
        });
      });
    };

    const onCancel = () => {
      this.setState({
        displayFolderInput: false,
      });
    };

    return displayFolderInput ? (
      <div className='mcs-audienceFeatureSettings-folderForm'>
        <Input
          value={inputValue}
          onChange={this.handleInputChange}
          className='mcs-audienceFeatureSettings-folderInput'
          placeholder={intl.formatMessage(messages.audienceFeaturePlaceholderFolderInput)}
        />

        <Button type='primary' onClick={onOk}>
          <FormattedMessage {...messages.audienceFeatureAddButton} />
        </Button>

        <Button onClick={onCancel}>
          <FormattedMessage {...messages.audienceFeatureCancelButton} />
        </Button>
      </div>
    ) : (
      <div>
        <Button
          type='primary'
          onClick={addNewFeature}
          className='mcs-audienceFeature_creation_button'
        >
          <FormattedMessage {...messages.audienceFeatureNew} />
        </Button>
        <Button className='mcs-audienceFeatureSettings-addFolderButton' onClick={addFolder}>
          <FormattedMessage {...messages.audienceFeatureAddFolder} />
        </Button>
      </div>
    );
  };

  render() {
    const {
      location: { search },
    } = this.props;
    const { isLoading, currentAudienceFeatures, total } = this.state;

    const filter = parseSearch<SearchFilter>(search, AUDIENCE_FEATURE_SEARCH_SETTINGS);

    return (
      <div className='ant-layout'>
        <Content className='mcs-content-container'>
          <div className='mcs-audienceFeatureSettings-table'>
            <div className='mcs-card-header mcs-card-title'>
              <span className='mcs-card-title'>
                <FormattedMessage {...messages.audienceFeatures} />
              </span>
              <div className='mcs-card-button'>{this.buildActionButtons()}</div>
            </div>

            {!!currentAudienceFeatures && (
              <AudienceFeatureTable
                dataSource={currentAudienceFeatures}
                isLoading={isLoading}
                noItem={false}
                onFilterChange={this.onFilterChange}
                filter={filter}
                total={total}
                deleteAudienceFeature={this.deleteAudienceFeature}
                relatedTable={this.renderFolderTable()}
              />
            )}
          </div>
        </Content>
      </div>
    );
  }
}

export default compose<Props, {}>(
  injectIntl,
  withRouter,
  injectDrawer,
  injectNotifications,
)(AudienceFeatureListPage);
