import * as React from 'react';
import { Layout, Button, Modal, Spin, Upload, message } from "antd";
import MlModelResource from "../../../../../models/mlModel/MlModelResource";
import { RouteComponentProps, withRouter } from "react-router";
import { InjectedIntlProps, injectIntl, FormattedMessage } from "react-intl";
import { InjectedThemeColorsProps } from "../../../../Helpers/injectThemeColors";
import { InjectedNotificationProps } from "../../../../Notifications/injectNotifications";
import { compose } from 'recompose';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import { IMlModelService } from '../../../../../services/MlModelService';
import { isSearchValid, PAGINATION_SEARCH_SETTINGS, buildDefaultSearch, parseSearch, compareSearches } from '../../../../../utils/LocationSearchHelper';
import ItemList, { Filters } from '../../../../../components/ItemList';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import messages from './messages';
import moment from 'moment';
import { McsIconType } from '../../../../../components/McsIcon';
import { ActionsColumnDefinition } from '../../../../../components/TableView/TableView';
import { UploadFile } from 'antd/lib/upload/interface';
import withValidators, { ValidatorProps } from '../../../../../components/Form/withValidators';

const { Content } = Layout

const Dragger = Upload.Dragger;

const initialState = {
    loading: false,
    data: [],
    total: 0,
    isModalOpen: false,
}

interface MlModelsListState {
    loading: boolean;
    data: MlModelResource[],
    total: number;
    isModalOpen: boolean;
    modelFile?: UploadFile[];
    resultFile?: UploadFile[];
}

interface RouterProps {
    organisationId: string,
    mlAlgorithmId: string
}

type JoinedProps = RouteComponentProps<RouterProps> &
    ValidatorProps &
    InjectedIntlProps &
    InjectedThemeColorsProps &
    InjectedNotificationProps;

class MlModelList extends React.Component<JoinedProps, MlModelsListState> {
    @lazyInject(TYPES.IMlModelService)
    private _mlModelService: IMlModelService;

    constructor(props: JoinedProps){
        super(props);
        this.state = initialState;
    }

    componentDidMount() {
        const {
            match: {
              params: { organisationId },
            },
            location: { search, pathname },
            history,
          } = this.props;

        if (!isSearchValid(search, PAGINATION_SEARCH_SETTINGS)) {
        history.replace({
            pathname: pathname,
            search: buildDefaultSearch(search, PAGINATION_SEARCH_SETTINGS),
            state: { reloadDataSource: true },
        });
        } else {
        const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);
        this.fetchMlModels(organisationId, filter);
        }
    }

    componentWillReceiveProps(nextProps: JoinedProps) {
      const {
        history,
        location: { search },
        match: {
          params: { organisationId, mlAlgorithmId },
        },
      } = this.props;
  
      const {
        location: { pathname: nextPathname, search: nextSearch },
        match: {
          params: {
            organisationId: nextOrganisationId,
            mlAlgorithmId: nextMlAlgorithmId
          }
        },
      } = nextProps;
  
      if (
        !compareSearches(search, nextSearch) ||
        organisationId !== nextOrganisationId || mlAlgorithmId !== nextMlAlgorithmId
      ) {
        if (!isSearchValid(nextSearch, PAGINATION_SEARCH_SETTINGS)) {
          history.replace({
            pathname: nextPathname,
            search: buildDefaultSearch(nextSearch, PAGINATION_SEARCH_SETTINGS),
            state: { reloadDataSource: organisationId !== nextOrganisationId },
          });
        } else {
          const filter = parseSearch(nextSearch, PAGINATION_SEARCH_SETTINGS);
          this.fetchMlModelsWithMlAlgorithmId(nextOrganisationId, nextMlAlgorithmId, filter);
        }
      }
    }


    fetchMlModels = (organisationId: string, filter: Filters) => {
        const {
            match: {
                params: {
                    mlAlgorithmId
                }
            }
        } = this.props;
        this.fetchMlModelsWithMlAlgorithmId(organisationId, mlAlgorithmId, filter)
    }

    fetchMlModelsWithMlAlgorithmId =  (organisationId: string, mlAlgorithmId: string, filter: Filters) => {
        this.setState({ loading: true}, () => {
            const options = {
                ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
              };
              this._mlModelService.getMlModels(organisationId, mlAlgorithmId, options).then(
                (results: { data: MlModelResource[]; total?: number; count: number }) => {
                  this.setState({
                    loading: false,
                    data: results.data,
                    total: results.total || results.count,
                  });
                },
              );
        });
    }

    buildColumnDefinition = () => {
      const {
        intl: { formatMessage },
      } = this.props;
  
      const dataColumns = [
        {
          intlMessage: messages.id,
          key: 'id',
          isHideable: false,
          render: (text: string) => text,
        },
        {
          intlMessage: messages.name,
          key: 'name',
          isHideable: false,
          render: (text: string, record: MlModelResource) => record.name,
        },
        {
          intlMessage: messages.status,
          key: 'status',
          isHideable: false,
          render: (text: string, record: MlModelResource) => record.status,
        },
        {
          intlMessage: messages.lastUpdatedDate,
          key: 'last updated date',
          isHideable: false,
          render: (text: string, record: MlModelResource) =>
            record.last_updated_date
              ? moment(record.last_updated_date).format('DD/MM/YYYY h:mm:ss')
              : formatMessage(messages.lastUpdatedDate),
        }
        
      ];
  
      return {
        dataColumnsDefinition: dataColumns,
      };
    };

    onFileUpdate = (file: any) => {
        return new Promise((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.onload = (fileLoadedEvent: any) => {
            const textFromFileLoaded = fileLoadedEvent.target.result;
            return resolve(textFromFileLoaded);
          };
    
          fileReader.readAsText(file, 'UTF-8');
        });
      };

    formatFormData = async (file: UploadFile): Promise<FormData> => {
        const formData = new FormData();
        const fileContent = await this.onFileUpdate(file);
        const formattedFile = new Blob([fileContent as any], {});
        formData.append('file', formattedFile, file.name);
        return formData;
    }

    handleOnUploadButton = async () => {
        
        const {
            match: {
                params: { organisationId, mlAlgorithmId }
            },
            location: { search },
            intl
        } = this.props;
        
        const { modelFile, resultFile } = this.state;
        
        if (modelFile && resultFile) {
            const modelFormData = await this.formatFormData(modelFile[0]);
            const resultFormData = await this.formatFormData(resultFile[0]);
        
            const mlModel = {
              "name": "Model Name",
              "status": "PAUSED"
            }          
            this._mlModelService.createMlModel(organisationId, mlAlgorithmId, mlModel)
              .then(res => res.data)
              .then(model => {
                Promise.all([
                  this._mlModelService.uploadModel(organisationId, mlAlgorithmId, model.id, modelFormData),
                  this._mlModelService.uploadResult(organisationId, mlAlgorithmId, model.id, resultFormData)
                ]);
              })
              .then(values => {
                const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);
                this.fetchMlModels(organisationId, filter);
                this.setState({
                  loading: false,
                  isModalOpen: false,
                  resultFile: [],
                  modelFile: [],
                });
              })
              .catch(err => {
                message.error(intl.formatMessage(messages.modelCreationError));
              })
        }
    }

    handleOpenClose = () => {
        this.setState({ isModalOpen: !this.state.isModalOpen });
    };

    renderModal = () => {
        const {
          intl: { formatMessage },
        } = this.props;
    
        const { loading, isModalOpen, resultFile, modelFile } = this.state;
    
        const modelUploadProps = {
          name: 'file',
          multiple: false,
          action: '/',
          accept: '',
          beforeUpload: (file: UploadFile, fileList: UploadFile[]) => {
            this.setState({ modelFile: fileList });
            return false;
          },
          fileList: modelFile,
          onRemove: (file: UploadFile) => {
              if (modelFile) {
                  this.setState({ modelFile: [] });
              }
          },
        };
        const resultUploadProps = {
            name: 'file',
            multiple: false,
            action: '/',
            accept: '',
            beforeUpload: (file: UploadFile, fileList: UploadFile[]) => {
                this.setState({ resultFile: fileList });
                return false;
            },
            fileList: resultFile,
            onRemove: (file: UploadFile) => {
                if (modelFile) {
                    this.setState({ resultFile: [] });
                }
            },
        }
    
        return (
          <Modal
            title={formatMessage(messages.uploadTitle)}
            visible={isModalOpen}
            onOk={this.handleOnUploadButton}
            okText={formatMessage(messages.uploadConfirm)}
            onCancel={this.handleOpenClose}
            confirmLoading={loading}
          >
            <Spin spinning={loading}>
              <Dragger {...modelUploadProps}>
                <p className="ant-upload-hint">
                  {formatMessage(messages.uploadMessage)}
                </p>
              </Dragger>
              <br />
              <Dragger {...resultUploadProps}>
                <p className="ant-upload-hint">
                  {formatMessage(messages.uploadMessage)}
                </p>
              </Dragger>
            </Spin>
          </Modal>
        );
      };


    render() {
        const emptyTable: {
            iconType: McsIconType;
            intlMessage: FormattedMessage.Props;
          } = {
            iconType: 'settings',
            intlMessage: messages.empty,
          };

          const actionsColumnsDefinition: Array<ActionsColumnDefinition<MlModelResource>> = [
            {
              key: 'action',
              actions: (mlAlgorithm: MlModelResource) => [
              ],
            },
          ];

          const onClick = () => {
            this.setState({ isModalOpen: true });
          }
    
          const buttons = [
            <Button key="create" type="primary" onClick={onClick}>
              <FormattedMessage {...messages.newMlModel} />
            </Button>,
          ];

          const additionnalComponent = (
            <div>
              <div className="mcs-card-header mcs-card-title">
                <span className="mcs-card-title">
                  <FormattedMessage {...messages.mlModels} />
                </span>
                <span className="mcs-card-button">{buttons}</span>
              </div>
              <hr className="mcs-separator" />
            </div>
          );

          return (
            <div className="ant-layout">
              <Content className="mcs-content-container">
              {this.renderModal()}
              <ItemList
                fetchList={this.fetchMlModels}
                dataSource={this.state.data}
                loading={this.state.loading}
                total={this.state.total}
                columns={this.buildColumnDefinition().dataColumnsDefinition}
                actionsColumnsDefinition={actionsColumnsDefinition}
                pageSettings={PAGINATION_SEARCH_SETTINGS}
                emptyTable={emptyTable}
                additionnalComponent={additionnalComponent}
              />
              </Content>
            </div>
          );
    
    }

    

}

export default compose(withRouter, injectIntl, withValidators)(MlModelList);