import * as React from 'react';
import { compose } from 'recompose';
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
import {
  Index,
  SearchFilter,
} from '@mediarithmics-private/mcs-components-library/lib/utils';
import { Filter } from '../../Common/domain';
import { AudienceFeaturesByFolder } from '../../../../../models/audienceFeature/AudienceFeatureResource';
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
  totalAudienceFeatures: number;

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
      totalAudienceFeatures: 0,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { datamartId },
      },
    } = this.props;
    const { filter } = this.state;

    this.fetchFoldersAndFeatures(datamartId, filter);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { filter: prevFilter } = prevState;
    const { filter } = this.state;
    const {
      match: {
        params: { datamartId },
      },
    } = this.props;
    if (filter !== prevFilter) {
      this.fetchFoldersAndFeatures(datamartId, filter);
    }
  }

  setBaseFolder = (
    baseFolder: AudienceFeaturesByFolder,
    totalAudienceFeatures: number,
  ) => {
    this.setState({
      audienceFeaturesByFolder: baseFolder,
      selectedFolder: baseFolder,
      isLoading: false,
      totalAudienceFeatures: totalAudienceFeatures,
    });
  };

  onFailure = (err: any) => {
    this.props.notifyError(err);
    this.setState({
      isLoading: false,
    });
  };

  fetchFoldersAndFeatures = (datamartId: string, filter?: Index<any>) => {
    const { intl, notifyError } = this.props;
    this._audienceFeatureService.fetchFoldersAndFeatures(
      datamartId,
      intl.formatMessage(messages.audienceFeatures),
      this.setBaseFolder,
      this.onFailure,
      notifyError,
      filter,
    );
  };

  deleteAudienceFeature = (resource: AudienceFeatureResource) => {
    const {
      location: { search, pathname, state },
      history,
      intl: { formatMessage },
      notifyError,
      match: {
        params: { datamartId },
      },
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
              this._audienceFeatureService.fetchAudienceFeatures(
                datamartId,
                filter as SearchFilter,
              );
              history.replace({
                pathname: pathname,
                search: updateSearch(search, newFilter),
                state: state,
              });
            } else {
              this._audienceFeatureService.fetchAudienceFeatures(
                datamartId,
                filter as SearchFilter,
              );
            }
          })
          .catch((err) => {
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
      .catch((err) => {
        this.props.notifyError(err);
      })
      .then((_) => this.fetchFoldersAndFeatures(datamartId));
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
      .catch((err) => {
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
      .catch((err) => {
        this.props.notifyError(err);
      })
      .then((_) => this.fetchFoldersAndFeatures(datamartId));
  };

  onSelectFolder = (id?: string) => () => {
    const { audienceFeaturesByFolder } = this.state;
    this.setState({
      selectedFolder: this._audienceFeatureService.getFolderContent(
        id,
        audienceFeaturesByFolder,
      ),
    });
  };

  getBreadCrumb = () => {
    const { selectedFolder, audienceFeaturesByFolder } = this.state;
    const buildBreadCrumbs = () => {
      if (selectedFolder && audienceFeaturesByFolder) {
        const path: AudienceFeaturesByFolder[] = [];
        const pathLoop = (folder: AudienceFeaturesByFolder) => {
          const parent = this._audienceFeatureService.getFolderContent(
            folder.parent_id,
            audienceFeaturesByFolder,
          );
          if (!folder.id) {
            path.unshift(audienceFeaturesByFolder);
          } else {
            path.unshift(folder);
            if (parent) pathLoop(parent);
          }
        };
        pathLoop(selectedFolder);

        return path.map((elt) => {
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
        <div className="mcs-audienceFeatureSettings_folderTable">
          {!!selectedFolder &&
            selectedFolder.children.map((folder) => {
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
    this.setState({
      filter: {
        currentPage: newFilter.currentPage,
        pageSize: newFilter.pageSize,
        keywords: newFilter.keywords ? newFilter.keywords : '',
      },
    });
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
      this.createFolder().then((_) => {
        this.fetchFoldersAndFeatures(datamartId);
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
      <div className="mcs-audienceFeatureSettings-folderForm">
        <Input
          value={inputValue}
          onChange={this.handleInputChange}
          className="mcs-audienceFeatureSettings-folderInput"
          placeholder={intl.formatMessage(
            messages.audienceFeaturePlaceholderFolderInput,
          )}
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
        <Button
          type="primary"
          onClick={addNewFeature}
          className="mcs-audienceFeature_creation_button"
        >
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
    const { isLoading, filter, selectedFolder, totalAudienceFeatures } = this.state;

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <div className="mcs-audienceFeatureSettings-table">
            <div className="mcs-card-header mcs-card-title">
              <span className="mcs-card-title">
                <FormattedMessage {...messages.audienceFeatures} />
              </span>
              <div className="mcs-card-button">{this.buildActionButtons()}</div>
            </div>

            {!!selectedFolder && (
              <AudienceFeatureTable
                dataSource={selectedFolder.audience_features}
                total={totalAudienceFeatures}
                isLoading={isLoading}
                noItem={false}
                onFilterChange={this.onFilterChange}
                filter={filter}
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
