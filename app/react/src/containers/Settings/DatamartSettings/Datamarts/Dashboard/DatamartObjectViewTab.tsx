import * as React from 'react';
import { Row, Col, Spin, Button, Alert, Upload, message, Modal } from 'antd';
import {
  RuntimeSchemaResource,
  SchemaDecoratorResource,
  RuntimeSchemaValidationInfoResource,
} from '../../../../../models/datamart/graphdb/RuntimeSchema';
import moment from 'moment';
import { Loading } from '../../../../../components';
import { compose } from 'recompose';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import AceEditor from 'react-ace';
import 'brace/mode/graphqlschema';
import { defineMessages, FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { UploadFile } from 'antd/lib/upload/interface';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IRuntimeSchemaService } from '../../../../../services/RuntimeSchemaService';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';

type Props = IDatamartObjectViewTabProps & InjectedNotificationProps & InjectedIntlProps;

export interface IDatamartObjectViewTabProps {
  datamartId: string;
}

interface State {
  loadingDeletion: boolean;
  loadingList: boolean;
  loadingSingle: boolean;
  schemas: RuntimeSchemaResource[];
  selectedSchemaText?: string;
  selectedSchema?: RuntimeSchemaResource;
  schemaValidation?: RuntimeSchemaValidationInfoResource;
  schemaDecorator?: SchemaDecoratorResource[];
  uploadingDecorator: boolean;
  changedSchemaValue?: string;
  changedSchemaId?: string;
}

const messages = defineMessages({
  validationSuccess: {
    id: 'datamart.schemaEditor.objectTree.validation.success',
    defaultMessage: 'Your schema is valid. Please press publish to turn it live.',
  },
  validationError: {
    id: 'datamart.schemaEditor.objectTree.validation.error',
    defaultMessage:
      'Either your schema has errors, or is not compliant with the previous one. Please check with your support in order to assess it.',
  },
  validationButton: {
    id: 'datamart.schemaEditor.objectTree.validation.button',
    defaultMessage: 'Validate your Schema.',
  },
  saveButton: {
    id: 'datamart.schemaEditor.objectTree.save.button',
    defaultMessage: 'Save your Changes.',
  },
  publicationButton: {
    id: 'datamart.schemaEditor.objectTree.publication.button',
    defaultMessage: 'Publish your Schema.',
  },
  history: {
    id: 'datamart.schemaEditor.objectTree.history',
    defaultMessage: 'History',
  },
  schema: {
    id: 'datamart.schemaEditor.objectTree.schema',
    defaultMessage: 'Schema',
  },
  createVersion: {
    id: 'datamart.schemaEditor.objectTree.version.create',
    defaultMessage: 'Create a new version',
  },
  hasDecorators: {
    id: 'datamart.schemaEditor.objectTree.decorators.exist',
    defaultMessage: 'This schema has decorators',
  },
  hasNotDecorators: {
    id: 'datamart.schemaEditor.objectTree.decorators.dontExist',
    defaultMessage: "This schema doesn't have any decorators",
  },
  uploadDecorators: {
    id: 'datamart.schemaEditor.objectTree.decorators.upload',
    defaultMessage: 'Upload new Decorators',
  },
  downloadTemplate: {
    id: 'datamart.schemaEditor.objectTree.decorators.downloadTemplate',
    defaultMessage: 'Download Template',
  },
  downloadDecorators: {
    id: 'datamart.schemaEditor.objectTree.decorators.download',
    defaultMessage: 'Download Decorators',
  },
  deleteDecorators: {
    id: 'datamart.schemaEditor.objectTree.decorators.delete',
    defaultMessage: 'Delete Decorators',
  },
  deletionSuccess: {
    id: 'datamart.schemaEditor.objectTree.decorators.deletion.success',
    defaultMessage: 'Schema decorators successfully deleted !',
  },
  deletionError: {
    id: 'datamart.schemaEditor.objectTree.decorators.deletion.error',
    defaultMessage: 'Error while deleting schema decorators',
  },
  modalTitle: {
    id: 'datamart.schemaEditor.objectTree.decorators.title',
    defaultMessage: 'Delete Decorators?',
  },
  modalDeleteContent: {
    id: 'datamart.schemaEditor.objectTree.decorators.delete.content',
    defaultMessage: 'Delete',
  },
  modalDescription: {
    id: 'datamart.schemaEditor.objectTree.decorators.description',
    defaultMessage:
      'You are about to permanently delete the Decorators of this Schema. This action cannot be undone.',
  },
});

class DatamartObjectViewTab extends React.Component<Props, State> {
  @lazyInject(TYPES.IRuntimeSchemaService)
  private _runtimeSchemaService: IRuntimeSchemaService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loadingDeletion: false,
      loadingList: true,
      loadingSingle: true,
      schemas: [],
      uploadingDecorator: false,
    };
  }

  componentDidMount() {
    const { datamartId } = this.props;

    this.fetchSchemas(datamartId, true);
  }

  componentDidUpdate(prevProps: IDatamartObjectViewTabProps) {
    const { datamartId } = this.props;

    const { datamartId: prevDatamartId } = this.props;

    if (datamartId !== prevDatamartId) {
      this.fetchSchemas(datamartId, true);
    }
  }
  fetchSchemas = (datamartId: string, shouldSelectLive = true) => {
    this.setState({ loadingList: true });
    return this._runtimeSchemaService
      .getRuntimeSchemas(datamartId)
      .then(r => {
        this.setState({ loadingList: false, schemas: r.data });
        const liveSchema = r.data.find(s => s.status === 'LIVE');
        if (shouldSelectLive && liveSchema) {
          this.setState({ selectedSchema: liveSchema });
          return this.fetchSchemaDetail(datamartId, liveSchema.id);
        }
        return this.fetchSchemaDetail(datamartId, r.data[0].id);
      })
      .catch(err => {
        this.setState({ loadingList: false });
        this.props.notifyError(err);
      });
  };

  fetchSchemaDetail = (datamartId: string, schemaId: string) => {
    this.setState({ loadingSingle: true });
    return this._runtimeSchemaService
      .getRuntimeSchemaText(datamartId, schemaId)
      .then(r => {
        this.setState({ selectedSchemaText: r });
        return this._runtimeSchemaService
          .getSchemaDecorator(datamartId, schemaId)
          .then(decorators => {
            this.setState({
              loadingSingle: false,
              schemaDecorator: decorators.data,
            });
          });
      })
      .catch(err => {
        this.setState({ loadingSingle: false });
        this.props.notifyError(err);
      });
  };

  selectSchema = (schema: RuntimeSchemaResource) => {
    this.setState({ selectedSchema: schema });
    return this.fetchSchemaDetail(schema.datamart_id, schema.id);
  };

  createNewSchemaVersion = (schema: RuntimeSchemaResource) => () => {
    this.setState({ loadingList: true, loadingSingle: true });
    return this._runtimeSchemaService
      .cloneRuntimeSchema(schema.datamart_id, schema.id)
      .then(s => {
        return Promise.all([
          this.fetchSchemaDetail(s.data.datamart_id, s.data.id),
          this.fetchSchemas(s.data.datamart_id, false),
        ]);
      })
      .catch(err => {
        this.props.notifyError(err);
        this.setState({ loadingList: false, loadingSingle: false });
      });
  };

  validateSchema = () => {
    const { selectedSchema } = this.state;
    if (selectedSchema) {
      this.setState({ loadingSingle: true });
      return this._runtimeSchemaService
        .validateRuntimeSchema(selectedSchema.datamart_id, selectedSchema.id)
        .then(r => this.setState({ schemaValidation: r.data, loadingSingle: false }))
        .catch(() => this.setState({ loadingSingle: false }));
    }
    return Promise.resolve();
  };

  saveSchema = () => {
    const { selectedSchema, changedSchemaValue } = this.state;
    if (selectedSchema && changedSchemaValue) {
      this.setState({ loadingSingle: true, schemaValidation: undefined });
      return this._runtimeSchemaService
        .updateRuntimeSchema(selectedSchema.datamart_id, selectedSchema.id, changedSchemaValue)
        .then(r =>
          this.setState({
            selectedSchemaText: changedSchemaValue,
            changedSchemaValue: undefined,
            changedSchemaId: undefined,
            loadingSingle: false,
          }),
        )
        .catch(err => {
          this.props.notifyError(err);
          this.setState({ loadingSingle: false });
        });
    }
    return Promise.resolve();
  };

  publishSchema = () => {
    const { selectedSchema, schemaValidation } = this.state;
    if (selectedSchema && schemaValidation) {
      this.setState({
        loadingSingle: true,
        loadingList: true,
        schemaValidation: undefined,
      });
      return this._runtimeSchemaService
        .publishRuntimeSchema(selectedSchema.datamart_id, selectedSchema.id)
        .then(r => this.fetchSchemas(r.data.datamart_id, true))
        .catch(err => {
          this.props.notifyError(err);
          this.setState({ loadingSingle: false, loadingList: false });
        });
    }
    return Promise.resolve();
  };

  downloadDecoratorsTemplate = () => {
    const rowsToDownload = [
      ['UserPoint', 'profiles', 'false', 'Profile', 'Uploaded CRM Profiles', 'en-US'],
    ];
    this.downloadCSVFile(rowsToDownload);
  };

  downloadDecorators = () => {
    const { schemaDecorator } = this.state;
    if (schemaDecorator) {
      const rowsToDownload = schemaDecorator.map(decorator => {
        return [
          decorator.object_name,
          decorator.field_name,
          decorator.hidden.toString(),
          decorator.label,
          decorator.help_text || '',
          decorator.locale || '',
        ];
      });
      this.downloadCSVFile(rowsToDownload);
    }
  };

  handleDeleteDecorators = (schemaId: string) => () => {
    const {
      intl: { formatMessage },
      datamartId,
    } = this.props;
    const { loadingDeletion } = this.state;
    const onOk = () => {
      this.setState({
        loadingDeletion: true,
      });
      return this._runtimeSchemaService
        .deleteSchemaDecorators(datamartId, schemaId)
        .then(() => {
          this.setState({
            loadingDeletion: false,
          });
          message.success(formatMessage(messages.deletionSuccess));
        })
        .catch(error => {
          this.setState({
            loadingDeletion: false,
          });
          message.error(formatMessage(messages.deletionError));
        });
    };
    Modal.confirm({
      title: formatMessage(messages.modalTitle),
      content: formatMessage(messages.modalDescription),
      onOk: onOk,
      okButtonProps: { type: 'primary', danger: true },
      okText: formatMessage(messages.modalDeleteContent),
      visible: loadingDeletion,
    });
  };

  downloadCSVFile = (rowsToDownload: string[][]) => {
    const rows: string[][] = [];
    rows.push(['OBJECT_NAME', 'FIELD_NAME', 'HIDDEN', 'LABEL', 'HELP_TEXT', 'LOCALE']);
    rowsToDownload.forEach(rowToDownload => {
      rows.push([
        rowToDownload[0],
        rowToDownload[1],
        rowToDownload[2],
        rowToDownload[3],
        rowToDownload[4],
        rowToDownload[5],
      ]);
    });
    let csvContent = 'data:text/csv;charset=utf-8,';
    rows.forEach(rowArray => {
      const row = rowArray.join(',');
      csvContent += row + '\r\n';
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'my_data.csv');
    document.body.appendChild(link); // Required for FF
    link.click();
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

  uploadDecorator = (file: UploadFile) => {
    const { datamartId } = this.props;
    const { selectedSchema } = this.state;
    if (!selectedSchema || !datamartId) {
      return Promise.resolve();
    }
    this.setState({ uploadingDecorator: true });

    return this.onFileUpdate(file)
      .then(fileContent => {
        return this._runtimeSchemaService
          .createSchemaDecorator(
            selectedSchema.datamart_id,
            selectedSchema.id,
            fileContent as string,
          )
          .then(() =>
            this._runtimeSchemaService.getSchemaDecorator(
              selectedSchema.datamart_id,
              selectedSchema.id,
            ),
          )
          .then(decorators => {
            this.setState({
              uploadingDecorator: false,
              schemaDecorator: decorators.data,
            });
          })
          .catch(err => {
            this.props.notifyError(err);
            this.setState({ uploadingDecorator: false });
          });
      })
      .catch(e => {
        this.props.notifyError(e);
      });
  };

  onSchemaChange = (value: string) => {
    this.setState({
      changedSchemaValue: value,
      changedSchemaId: this.state.selectedSchema?.id,
    });
  };

  onClickOnSelect = (schema: RuntimeSchemaResource) => () => this.selectSchema(schema);

  public render() {
    const {
      loadingSingle,
      schemas,
      loadingList,
      selectedSchema,
      schemaDecorator,
      selectedSchemaText,
      schemaValidation,
      changedSchemaValue,
      changedSchemaId,
    } = this.state;

    let additionnalButton;

    const uploadProps = {
      name: 'file',
      multiple: false,
      action: '/',
      accept: '.csv',
      showUploadList: false,
      beforeUpload: (file: UploadFile, fileList: UploadFile[]) => {
        this.uploadDecorator(file);
        return false;
      },
    };

    const isInValidationMode = !!schemaValidation;
    const validationError =
      schemaValidation &&
      (schemaValidation.schema_errors.length ||
        schemaValidation.tree_index_operations.find(ti => ti.init_strategy !== 'FORCE_NO_BUILD'));

    if (changedSchemaValue && selectedSchema && selectedSchema.status === 'DRAFT') {
      additionnalButton = (
        <Button size='small' type='primary' onClick={this.saveSchema}>
          <FormattedMessage {...messages.saveButton} />
        </Button>
      );
    }

    if (
      changedSchemaValue === undefined &&
      selectedSchema &&
      selectedSchema.status === 'DRAFT' &&
      !isInValidationMode
    ) {
      additionnalButton = (
        <Button size='small' type='primary' onClick={this.validateSchema}>
          <FormattedMessage {...messages.validationButton} />
        </Button>
      );
    }

    if (
      !changedSchemaValue &&
      selectedSchema &&
      selectedSchema.status === 'DRAFT' &&
      isInValidationMode &&
      !validationError
    ) {
      additionnalButton = (
        <Button size='small' type='primary' onClick={this.publishSchema}>
          <FormattedMessage {...messages.publicationButton} />
        </Button>
      );
    }

    if (
      selectedSchema &&
      selectedSchema.status === 'LIVE' &&
      schemas &&
      !schemas.find(s => s.status === 'DRAFT')
    ) {
      additionnalButton = (
        <Button size='small' type='primary' onClick={this.createNewSchemaVersion(selectedSchema)}>
          <FormattedMessage {...messages.createVersion} />
        </Button>
      );
    }

    const hasDecorators = schemaDecorator && schemaDecorator.length > 0;

    return (
      <div className='schema-editor'>
        <Row className='title-line'>
          <Col className='title' span={6}>
            <FormattedMessage {...messages.history} />
          </Col>
          <Col className='title' span={18}>
            <span style={{ float: 'right' }}>{additionnalButton}</span>
            <FormattedMessage {...messages.schema} />
          </Col>
        </Row>
        <Row className='content-line'>
          <Col span={6} className='content'>
            {loadingList ? (
              <Spin />
            ) : (
              schemas
                .sort((a, b) => b.creation_date - a.creation_date)
                .map(s => {
                  return (
                    <div
                      key={s.id}
                      className={
                        selectedSchema && selectedSchema.id === s.id
                          ? 'list-item selected'
                          : 'list-item'
                      }
                      onClick={this.onClickOnSelect(s)}
                    >
                      <span className='title'>{s.status}</span>
                      <span className='date'>{moment(s.creation_date).fromNow()}</span>
                    </div>
                  );
                })
            )}
          </Col>
          <Col span={18} className='content'>
            {loadingSingle ? (
              <Loading isFullScreen={false} />
            ) : (
              <div>
                {isInValidationMode && selectedSchema?.id === schemaValidation?.schema_id && (
                  <Alert
                    style={{ marginBottom: 10 }}
                    message={
                      validationError ? (
                        <FormattedMessage {...messages.validationError} />
                      ) : (
                        <FormattedMessage {...messages.validationSuccess} />
                      )
                    }
                    type={validationError ? 'error' : 'success'}
                  />
                )}
                <AceEditor
                  width='100%'
                  mode='graphqlschema'
                  theme='github'
                  setOptions={{
                    showGutter: true,
                  }}
                  onChange={this.onSchemaChange}
                  readOnly={selectedSchema?.status === 'DRAFT' ? false : true}
                  // changedSchemaValue can be equal to '' and in this case we don't want to display selectedSchemaText
                  // hence the use of: changedSchemaValue !== undefined
                  value={
                    changedSchemaValue !== undefined && changedSchemaId === selectedSchema?.id
                      ? changedSchemaValue
                      : selectedSchemaText
                  }
                />
                <Row className='decorators'>
                  <Col span={12} className='text'>
                    {hasDecorators ? (
                      <div className='success'>
                        <McsIcon type='check-rounded' />{' '}
                        <FormattedMessage {...messages.hasDecorators} />
                      </div>
                    ) : (
                      <div>
                        <FormattedMessage {...messages.hasNotDecorators} />
                      </div>
                    )}
                  </Col>
                  <Col span={12} className='buttons'>
                    <Upload {...uploadProps}>
                      <Button type='primary' className='spacing' size='small'>
                        <FormattedMessage {...messages.uploadDecorators} />
                      </Button>
                    </Upload>
                    <Button
                      size='small'
                      className='spacing'
                      onClick={this.downloadDecoratorsTemplate}
                    >
                      <FormattedMessage {...messages.downloadTemplate} />
                    </Button>
                    {hasDecorators && (
                      <Button size='small' className='spacing' onClick={this.downloadDecorators}>
                        <FormattedMessage {...messages.downloadDecorators} />
                      </Button>
                    )}
                    {hasDecorators && selectedSchema && (
                      <Button
                        type='primary'
                        size='small'
                        danger={true}
                        onClick={this.handleDeleteDecorators(selectedSchema.id)}
                      >
                        <FormattedMessage {...messages.deleteDecorators} />
                      </Button>
                    )}
                  </Col>
                </Row>
              </div>
            )}
          </Col>
        </Row>
      </div>
    );
  }
}

export default compose<Props, IDatamartObjectViewTabProps>(
  injectNotifications,
  injectIntl,
)(DatamartObjectViewTab);
