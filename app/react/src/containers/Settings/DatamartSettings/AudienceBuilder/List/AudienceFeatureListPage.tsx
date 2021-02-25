import * as React from 'react';
import { compose } from 'recompose';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Button, Row, Layout, Modal, Input, Breadcrumb } from 'antd';
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
import {
  IAudienceFeatureService,
  AudienceFeatureOptions,
} from '../../../../../services/AudienceFeatureService';
import { AudienceFeatureResource } from '../../../../../models/audienceFeature';
import {
  Index,
  SearchFilter,
} from '@mediarithmics-private/mcs-components-library/lib/utils';
import { Filter } from '../../Common/domain';
import {
  AudienceFeaturesByFolder,
  AudienceFeatureFolderResource,
} from '../../../../../models/audienceFeature/AudienceFeatureResource';
import { Button as McsButton } from '@mediarithmics-private/mcs-components-library';
import AudienceFeatureFolder from './AudienceFeatureFolder';

const { Content } = Layout;

export const AUDIENCE_FEATURE_SEARCH_SETTINGS = [
  ...KEYWORD_SEARCH_SETTINGS,
  ...PAGINATION_SEARCH_SETTINGS,
];

interface State {
  isLoading: boolean;
  audienceFeaturesByFolder?: AudienceFeaturesByFolder;
  selectedAudienceFeature?: AudienceFeatureResource;
  selectedFolder?: AudienceFeaturesByFolder;
  inputValue: string;

  filter: Filter;
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
      filter: {
        pageSize: 10,
        currentPage: 1,
        keywords: '',
      },
      displayFolderInput: false,
      inputValue: '',
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { datamartId },
      },
      location: { search },
    } = this.props;
    const filter = parseSearch(search, AUDIENCE_FEATURE_SEARCH_SETTINGS);

    this.fetchFoldersAndFeatures(datamartId, filter);
  }

  fetchFoldersAndFeatures = (datamartId: string, filter: Index<any>) => {
    const { intl } = this.props;
    this.setState({
      isLoading: true,
    });
    this.fetchFolders(datamartId).then(audienceFeatureFolders => {
      this.fetchAudienceFeatures()
        .then(features => {
          const folderLoop = (
            folders: AudienceFeatureFolderResource[],
          ): AudienceFeaturesByFolder[] => {
            return folders.map(folder => {
              return {
                id: folder.id,
                name: folder.name,
                parent_id: folder.parent_id,
                audience_features: features.filter(
                  (f: AudienceFeatureResource) =>
                    folder.audience_feature_ids.includes(f.id),
                ),
                children: folderLoop(
                  audienceFeatureFolders.filter(
                    (f: AudienceFeatureFolderResource) =>
                      f.id !== null && folder.children_ids.includes(f.id),
                  ),
                ),
              };
            });
          };
          const baseFolder = {
            id: null,
            name: intl.formatMessage(messages.audienceFeatures),
            parent_id: 'root',
            children: folderLoop(
              audienceFeatureFolders.filter(
                (f: AudienceFeatureFolderResource) => f.parent_id === null,
              ),
            ),
            audience_features: [],
          };
          this.setState({
            audienceFeaturesByFolder: baseFolder,
            selectedFolder: baseFolder,
            isLoading: false,
          });
        })
        .catch(err => {
          this.props.notifyError(err);
          this.setState({
            isLoading: false,
          });
        });
    });
  };

  fetchFolders = (datamartId: string) => {
    return this._audienceFeatureService
      .getAudienceFeatureFolders(datamartId)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        this.props.notifyError(err);
        return [];
      });
  };

  fetchAudienceFeatures = (filter?: SearchFilter) => {
    const {
      match: {
        params: { datamartId },
      },
    } = this.props;

    const options: AudienceFeatureOptions = {
      // ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };

    if (filter?.keywords) {
      options.keywords = [filter.keywords];
    }

    options.fake_dataset = true;

    return this._audienceFeatureService
      .getAudienceFeatures(datamartId, options)
      .then(res => {
        return res.data;
      });
  };

  deleteAudienceFeature = (resource: AudienceFeatureResource) => {
    const {
      location: { search, pathname, state },
      history,
      intl: { formatMessage },
      notifyError,
    } = this.props;

    const { selectedFolder } = this.state;

    const filter = parseSearch(search, AUDIENCE_FEATURE_SEARCH_SETTINGS);

    Modal.confirm({
      icon: 'exclamation-circle',
      title: formatMessage(messages.audienceFeatureDeleteListModalTitle),
      okText: formatMessage(messages.audienceFeatureDeleteListModalOk),
      cancelText: formatMessage(messages.audienceFeatureDeleteListModalCancel),
      onOk: () => {
        this._audienceFeatureService
          .deleteAudienceFeature(resource.datamart_id, resource.id)
          .then(() => {
            if (
              selectedFolder &&
              selectedFolder.audience_features.length === 1 &&
              filter.currentPage !== 1
            ) {
              const newFilter = {
                ...filter,
                currentPage: filter.currentPage - 1,
              };
              this.fetchAudienceFeatures(filter as SearchFilter);
              history.replace({
                pathname: pathname,
                search: updateSearch(search, newFilter),
                state: state,
              });
            } else {
              this.fetchAudienceFeatures(filter as SearchFilter);
            }
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
      });
  };

  createFolder = () => {
    const {
      match: {
        params: { datamartId },
      },
    } = this.props;
    const { inputValue, selectedFolder } = this.state;
    return this._audienceFeatureService
      .createAudienceFeatureFolder(datamartId, {
        name: inputValue,
        datamart_id: datamartId,
        parent_id: selectedFolder?.id,
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
    } = this.props;
    return this._audienceFeatureService
      .deleteAudienceFeatureFolder(datamartId, folderId)
      .catch(err => {
        this.props.notifyError(err);
      });
  };

  getFolder = (id: string | null) => {
    const { audienceFeaturesByFolder } = this.state;
    let selectedFolder: AudienceFeaturesByFolder | undefined;
    const loop = (folder: AudienceFeaturesByFolder) => {
      if (id === null) {
        selectedFolder = audienceFeaturesByFolder;
      } else {
        folder.children.forEach(f => {
          if (f.id === id) {
            selectedFolder = f;
          } else {
            loop(f);
          }
        });
      }
    };
    if (audienceFeaturesByFolder) loop(audienceFeaturesByFolder);
    return selectedFolder;
  };

  onSelectFolder = (id: string | null) => () => {
    this.setState({
      selectedFolder: this.getFolder(id),
    });
  };

  getBreadCrumb = () => {
    const { selectedFolder, audienceFeaturesByFolder } = this.state;
    const buildBreadCrumbs = () => {
      if (selectedFolder && audienceFeaturesByFolder) {
        const path: AudienceFeaturesByFolder[] = [];
        const pathLoop = (folder: AudienceFeaturesByFolder) => {
          const parent = this.getFolder(folder.parent_id);
          if (folder.id === null) {
            path.unshift(audienceFeaturesByFolder);
          } else {
            path.unshift(folder);
            if (parent) pathLoop(parent);
          }
        };
        pathLoop(selectedFolder);

        return path.map(elt => {
          return (
            <Breadcrumb.Item key={elt.id ? elt.id : 'root_key'}>
              <McsButton onClick={this.onSelectFolder(elt.id)}>
                {elt.name}
              </McsButton>
            </Breadcrumb.Item>
          );
        });
      }
      return;
    };
    return (
      <Breadcrumb className="mcs-audienceFeatureSettings_breadCrumb">
        {buildBreadCrumbs()}
      </Breadcrumb>
    );
  };

  renderFolderTable = () => {
    const { selectedFolder } = this.state;

    return (
      <div>
        {this.getBreadCrumb()}
        <Row className="mcs-audienceFeatureSettings_folderTable" gutter={16}>
          {!!selectedFolder &&
            selectedFolder.children.map(folder => {
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
        </Row>
      </div>
    );
  };

  onFilterChange = (newFilter: SearchFilter) => {
    this.fetchAudienceFeatures(newFilter);
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
      this.createFolder();
    };

    const onCancel = () => {
      this.setState({
        displayFolderInput: false,
      });
    };

    return displayFolderInput ? (
      <div className="mcs-audienceFeatureSettings-folderForm">
        <Input
          value={inputValue}
          onChange={this.handleInputChange}
          className="mcs-audienceFeatureSettings-folderInput"
          placeholder={intl.formatMessage(messages.audienceFeaturePlaceholderFolderInput)}
        />

        <Button type="primary" onClick={onOk}>
          <FormattedMessage {...messages.audienceFeatureAddButton} />
        </Button>

        <Button onClick={onCancel}>
          <FormattedMessage {...messages.audienceFeatureCancelButton} />
        </Button>
      </div>
    ) : (
      <div>
        <Button type="primary" onClick={addNewFeature} className="mcs-audienceFeature_creation_button">
          <FormattedMessage {...messages.audienceFeatureNew} />
        </Button>
        <Button
          className="mcs-audienceFeatureSettings-addFolderButton"
          onClick={addFolder}
        >
          <FormattedMessage {...messages.audienceFeatureAddFolder} />
        </Button>
      </div>
    );
  };

  render() {
    const { isLoading, filter, selectedFolder } = this.state;

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <Row className="mcs-audienceFeatureSettings-table">
            <div className="mcs-card-header mcs-card-title">
              <span className="mcs-card-title">
                <FormattedMessage {...messages.audienceFeatures} />
              </span>
              <div className="mcs-card-button">{this.buildActionButtons()}</div>
            </div>

            {!!selectedFolder && (
              <AudienceFeatureTable
                dataSource={selectedFolder.audience_features}
                total={
                  selectedFolder &&
                  selectedFolder.parent_id === 'root' &&
                  selectedFolder.children.length > 0
                    ? selectedFolder.children.length
                    : 0
                }
                isLoading={isLoading}
                noItem={false}
                onFilterChange={this.onFilterChange}
                filter={filter}
                deleteAudienceFeature={this.deleteAudienceFeature}
                relatedTable={this.renderFolderTable()}
              />
            )}
          </Row>
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
