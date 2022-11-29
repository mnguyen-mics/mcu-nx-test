import * as React from 'react';
import { Layout, Button, Modal, Spin, Upload, message, Input } from 'antd';
import MlAlgorithmModelResource from '../../../../../models/mlAlgorithmModel/MlAlgorithmModelResource';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { WrappedComponentProps, injectIntl, FormattedMessage } from 'react-intl';
import { InjectedNotificationProps } from '../../../../Notifications/injectNotifications';
import { compose } from 'recompose';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import { IMlAlgorithmModelService } from '../../../../../services/MlAlgorithmModelService';
import { PAGINATION_SEARCH_SETTINGS, parseSearch } from '../../../../../utils/LocationSearchHelper';
import ItemList, { Filters } from '../../../../../components/ItemList';
import { getPaginatedApiParam, getApiToken } from '../../../../../utils/ApiHelper';
import messages from './messages';
import moment from 'moment';
import { UploadFile } from 'antd/lib/upload/interface';
import withValidators, { ValidatorProps } from '../../../../../components/Form/withValidators';
import log from '../../../../../utils/Logger';
import NotebookResultPreviewModal from './NotebookResultPreviewModal';
import { IDataFileService } from '../../../../../services/DataFileService';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import FileSaver from 'file-saver';

const { Content } = Layout;

const Dragger = Upload.Dragger;

const initialState = {
  loading: false,
  data: [],
  total: 0,
  isModalOpen: false,
  isPreviewModalOpened: false,
  dataExportState: {},
  previewModalHtml: '',
  newModelName: '',
};

interface MlAlgorithmModelsListState {
  loading: boolean;
  data: MlAlgorithmModelResource[];
  total: number;
  isModalOpen: boolean;
  isPreviewModalOpened: boolean;
  previewModalHtml: string;
  modelFile?: UploadFile[];
  resultFile?: UploadFile[];
  notebookFile?: UploadFile[];
  newModelName: string;
  dataExportState: Record<string, number>;
}

interface RouterProps {
  organisationId: string;
  mlAlgorithmId: string;
}

type JoinedProps = RouteComponentProps<RouterProps> &
  ValidatorProps &
  WrappedComponentProps &
  InjectedNotificationProps;

class MlAlgorithmModelList extends React.Component<JoinedProps, MlAlgorithmModelsListState> {
  @lazyInject(TYPES.IMlAlgorithmModelService)
  private _mlAlgorithmModelService: IMlAlgorithmModelService;

  @lazyInject(TYPES.IDataFileService)
  private _dataFileService: IDataFileService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = initialState;
  }

  fetchMlAlgorithmModels = (organisationId: string, filter: Filters) => {
    const {
      match: {
        params: { mlAlgorithmId },
      },
    } = this.props;
    this.fetchMlAlgorithmModelsWithMlAlgorithmId(organisationId, mlAlgorithmId, filter);
  };

  fetchMlAlgorithmModelsWithMlAlgorithmId = (
    organisationId: string,
    mlAlgorithmId: string,
    filter: Filters,
  ) => {
    const { intl } = this.props;
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      this._mlAlgorithmModelService
        .getMlAlgorithmModels(organisationId, mlAlgorithmId, options)
        .then(results => {
          this.setState({
            loading: false,
            data: results.data,
            total: results.total || results.count,
          });
        })
        .catch(err => {
          message.error(intl.formatMessage(messages.modelsLoadingError));
        });
    });
  };

  buildColumnDefinition = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    const dataColumns: Array<DataColumnDefinition<MlAlgorithmModelResource>> = [
      {
        title: formatMessage(messages.id),
        key: 'id',
        isHideable: false,
        render: (text: string) => text,
      },
      {
        title: formatMessage(messages.name),
        key: 'name',
        isHideable: false,
        render: (text: string, record: MlAlgorithmModelResource) => record.name,
      },
      {
        title: formatMessage(messages.status),
        key: 'status',
        isHideable: false,
        render: (text: string, record: MlAlgorithmModelResource) => record.status,
      },
      {
        title: formatMessage(messages.lastUpdatedDate),
        key: 'last updated date',
        isHideable: false,
        render: (text: string, record: MlAlgorithmModelResource) =>
          record.last_updated_date
            ? moment(record.last_updated_date).format('DD/MM/YYYY HH:mm:ss')
            : formatMessage(messages.lastUpdatedDate),
      },
    ];

    return dataColumns;
  };

  onFileUpdate = (file: any, isBinary: boolean) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (fileLoadedEvent: any) => {
        const textFromFileLoaded = fileLoadedEvent.target.result;
        return resolve(textFromFileLoaded);
      };
      if (isBinary) {
        // ML Algorithm models are binary files that needs to be parsed as ArrayBuffer
        fileReader.readAsArrayBuffer(file);
      } else {
        fileReader.readAsText(file, 'UTF-8');
      }
    });
  };

  formatFormData = (file: UploadFile, isBinary: boolean): Promise<FormData> => {
    const formData = new FormData();
    return this.onFileUpdate(file, isBinary)
      .then(fileContent => {
        const formattedFile = new Blob([fileContent as any], {});
        formData.append('file', formattedFile, file.name);
        return formData;
      })
      .catch(e => {
        this.props.notifyError(e);
        return formData;
      });
  };

  handleOnUploadButton = () => {
    const {
      match: {
        params: { organisationId, mlAlgorithmId },
      },
      location: { search },
      intl,
    } = this.props;

    const { modelFile, resultFile, notebookFile, newModelName } = this.state;

    if (newModelName === '') {
      message.error(intl.formatMessage(messages.modelNameIsRequired));
    }

    if (modelFile && resultFile && notebookFile && newModelName !== '') {
      this.setState({ loading: true });
      Promise.all([
        this.formatFormData(modelFile[0], true),
        this.formatFormData(resultFile[0], false),
        this.formatFormData(notebookFile[0], false),
      ])
        .then(responses => {
          const modelFormData = responses[0];
          const resultFormData = responses[1];
          const notebookFormData = responses[2];
          const mlAlgorithmModel = {
            name: this.state.newModelName,
            status: 'PAUSED',
            organisation_id: organisationId,
          };
          this._mlAlgorithmModelService
            .createMlAlgorithmModel(mlAlgorithmId, mlAlgorithmModel)
            .then(res => res.data)
            .then(model => {
              return this._mlAlgorithmModelService.uploadNotebook(
                mlAlgorithmId,
                model.id,
                notebookFormData,
              );
            })
            .then(res => res.data)
            .then(modelWithNotebook => {
              return this._mlAlgorithmModelService.uploadBinary(
                mlAlgorithmId,
                modelWithNotebook.id,
                modelFormData,
              );
            })

            .then(res => res.data)
            .then(modelWithModel => {
              return this._mlAlgorithmModelService.uploadResult(
                mlAlgorithmId,
                modelWithModel.id,
                resultFormData,
              );
            })
            .then(values => {
              const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);
              this.fetchMlAlgorithmModels(organisationId, filter);
              this.setState({
                loading: false,
                isModalOpen: false,
                resultFile: [],
                modelFile: [],
                notebookFile: [],
              });
            })
            .catch(err => {
              this.setState({ loading: false });
              let errorMessage = intl.formatMessage(messages.modelCreationError);
              if (err.error) {
                errorMessage += `: ${err.error}`;
              }
              message.error(errorMessage);
            });
        })
        .catch(err => {
          this.setState({ loading: false });
          this.props.notifyError(err);
        });
    }
  };

  private startDownload = (uri: string) => {
    const { dataExportState } = this.state;

    this.props.notifyInfo({
      message:
        'Your download request is processing. Do not refresh your page to avoid canceling it.',
    });
    if (!dataExportState.hasOwnProperty(uri)) {
      this.setState(prevState => {
        const newState = prevState;
        newState.dataExportState[uri] = 0;
        return newState;
      });
    }
  };

  private finaliseDownload = (uri: string) => {
    const { dataExportState } = this.state;

    if (dataExportState.hasOwnProperty(uri)) {
      this.setState(prevState => {
        const newState = prevState;
        delete newState.dataExportState[uri];
        return newState;
      });
    }
  };

  download = (uri: string) => {
    try {
      this.startDownload(uri);
      const url = `${
        (window as any).MCS_CONSTANTS.API_URL
      }/v1/data_file/data?uri=${encodeURIComponent(uri)}`;
      const transferFailed = () => {
        this.props.notifyInfo({ message: 'Your download has failed.' });
        this.finaliseDownload(uri);
      };
      const transferCanceled = () => {
        this.props.notifyInfo({ message: 'Your download as been canceled.' });
        this.finaliseDownload(uri);
      };
      const oReq = new XMLHttpRequest();
      oReq.responseType = 'blob';
      oReq.onload = () => {
        if (oReq.status >= 200 && oReq.status < 400) {
          FileSaver.saveAs(oReq.response, uri.split('/').pop());
        } else {
          const responsePromise: Promise<any> = oReq.response.text();
          responsePromise.then(responseAsText => {
            const response = JSON.parse(responseAsText);
            const notification = { message: `${response.error} (error id: ${response.error_id})` };
            if (oReq.status < 500) {
              this.props.notifyWarning(notification);
            } else {
              this.props.notifyError(notification);
            }
          });
        }
        this.finaliseDownload(uri);
      };
      oReq.open('get', url, true);
      oReq.addEventListener('error', transferFailed, false);
      oReq.addEventListener('abort', transferCanceled, false);

      oReq.setRequestHeader('Authorization', getApiToken());
      oReq.send();
    } catch (err) {
      log.error(err);
    }
  };

  downloadBinary = (mlAlgorithmModel: MlAlgorithmModelResource) => {
    if (mlAlgorithmModel.binary_uri) {
      this.download(mlAlgorithmModel.binary_uri);
    }
  };

  downloadResult = (mlAlgorithmModel: MlAlgorithmModelResource) => {
    if (mlAlgorithmModel.html_notebook_result_uri) {
      this.download(mlAlgorithmModel.html_notebook_result_uri);
    }
  };

  downloadNotebook = (mlAlgorithmModel: MlAlgorithmModelResource) => {
    if (mlAlgorithmModel.notebook_uri) {
      this.download(mlAlgorithmModel.notebook_uri);
    }
  };

  previewResult = (mlAlgorithmModel: MlAlgorithmModelResource) => {
    if (mlAlgorithmModel.html_notebook_result_uri) {
      this._dataFileService
        .getDatafileData(mlAlgorithmModel.html_notebook_result_uri)
        .then(blob => {
          return new Response(blob).text();
        })
        .then(data => {
          this.setState({ previewModalHtml: data, isPreviewModalOpened: true });
        });
    }
  };

  onClosePreviewModal = () => {
    this.setState({
      previewModalHtml: '',
      isPreviewModalOpened: !this.state.isPreviewModalOpened,
    });
  };

  togglePause = (mlAlgorithmModel: MlAlgorithmModelResource) => {
    const {
      match: {
        params: { organisationId, mlAlgorithmId },
      },
      location: { search },
      intl,
    } = this.props;
    if (mlAlgorithmModel.status === 'PAUSED') {
      mlAlgorithmModel.status = 'LIVE';
    } else {
      mlAlgorithmModel.status = 'PAUSED';
    }
    this._mlAlgorithmModelService
      .updateMlAlgorithmModel(mlAlgorithmId, mlAlgorithmModel.id, mlAlgorithmModel)
      .then(res => res.data)
      .then(model => {
        const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);
        this.fetchMlAlgorithmModels(organisationId, filter);
        message.success(intl.formatMessage(messages.updateSuccess));
      })
      .catch(err => {
        message.error(intl.formatMessage(messages.updateError));
      });
  };

  handleOpenClose = () => {
    this.setState({ isModalOpen: !this.state.isModalOpen });
  };

  renderModal = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    const { loading, isModalOpen, resultFile, modelFile, notebookFile } = this.state;

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

    const notebookUploadProps = {
      name: 'file',
      multiple: false,
      action: '/',
      accept: '.ipynb',
      beforeUpload: (file: UploadFile, fileList: UploadFile[]) => {
        this.setState({ notebookFile: fileList });
        return false;
      },
      fileList: notebookFile,
      onRemove: (file: UploadFile) => {
        if (notebookFile) {
          this.setState({ notebookFile: [] });
        }
      },
    };
    const resultUploadProps = {
      name: 'file',
      multiple: false,
      action: '/',
      accept: '.html',
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
    };
    const onChange = (e: any) =>
      this.setState({
        newModelName: e.target.value,
      });

    return (
      <div className='mcs-modal_container'>
        <Modal
          title={formatMessage(messages.uploadTitle)}
          visible={isModalOpen}
          onOk={this.handleOnUploadButton}
          okButtonProps={{ disabled: loading }}
          okText={formatMessage(messages.uploadConfirm)}
          onCancel={this.handleOpenClose}
          confirmLoading={loading}
        >
          <Spin spinning={loading}>
            <Input
              defaultValue={this.state.newModelName}
              onChange={onChange}
              placeholder='Name'
              required={true}
            />
            <br />
            <br />
            <Dragger {...notebookUploadProps}>
              <p className='ant-upload-hint'>{formatMessage(messages.uploadMessageNotebook)}</p>
            </Dragger>
            <br />
            <Dragger {...modelUploadProps}>
              <p className='ant-upload-hint'>{formatMessage(messages.uploadMessageModel)}</p>
            </Dragger>
            <br />
            <Dragger {...resultUploadProps}>
              <p className='ant-upload-hint'>{formatMessage(messages.uploadMessageResult)}</p>
            </Dragger>
          </Spin>
        </Modal>
      </div>
    );
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;
    const { dataExportState } = this.state;
    const emptyTable: {
      iconType: McsIconType;
      message: string;
    } = {
      iconType: 'settings',
      message: formatMessage(messages.empty),
    };

    const actionsColumnsDefinition: Array<ActionsColumnDefinition<MlAlgorithmModelResource>> = [
      {
        key: 'action',
        actions: (mlAlgorithmModel: MlAlgorithmModelResource) => [
          {
            message: formatMessage(messages.downloadBinary),
            callback: this.downloadBinary,
            disabled: !(
              mlAlgorithmModel.binary_uri &&
              dataExportState[mlAlgorithmModel.binary_uri] == undefined
            ),
          },
          {
            message: formatMessage(messages.downloadResult),
            callback: this.downloadResult,
            disabled: !(
              mlAlgorithmModel.html_notebook_result_uri &&
              dataExportState[mlAlgorithmModel.html_notebook_result_uri] == undefined
            ),
          },
          {
            message: formatMessage(messages.downloadNotebook),
            callback: this.downloadNotebook,
            disabled: !(
              mlAlgorithmModel.notebook_uri &&
              dataExportState[mlAlgorithmModel.notebook_uri] == undefined
            ),
          },
          {
            message: formatMessage(messages.previewResult),
            callback: this.previewResult,
            disabled: !(
              mlAlgorithmModel.notebook_uri &&
              dataExportState[mlAlgorithmModel.notebook_uri] == undefined
            ),
          },
          {
            message:
              mlAlgorithmModel.status === 'PAUSED'
                ? formatMessage(messages.statusLive)
                : formatMessage(messages.statusPaused),
            callback: this.togglePause,
            disabled: false,
          },
        ],
      },
    ];

    const onClick = () => {
      this.setState({ isModalOpen: true });
    };

    const buttons = [
      <Button key='create' type='primary' onClick={onClick}>
        <FormattedMessage {...messages.newMlAlgorithmModel} />
      </Button>,
    ];

    const additionnalComponent = (
      <div>
        <div className='mcs-card-header mcs-card-title'>
          <span className='mcs-card-title'>
            <FormattedMessage {...messages.mlAlgorithmModels} />
          </span>
          <span className='mcs-card-button'>{buttons}</span>
        </div>
        <hr className='mcs-separator' />
      </div>
    );

    const { isPreviewModalOpened, previewModalHtml } = this.state;

    return (
      <div className='ant-layout'>
        <Content className='mcs-content-container'>
          {this.renderModal()}
          <NotebookResultPreviewModal
            opened={isPreviewModalOpened}
            html={previewModalHtml}
            onClose={this.onClosePreviewModal}
          />
          <ItemList
            fetchList={this.fetchMlAlgorithmModels}
            dataSource={this.state.data}
            loading={this.state.loading}
            total={this.state.total}
            columns={this.buildColumnDefinition()}
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

export default compose(withRouter, injectIntl, withValidators)(MlAlgorithmModelList);
