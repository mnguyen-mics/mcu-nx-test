import * as React from 'react';
import { Row, Col, Spin, Button, Alert } from 'antd';
import TableSchemaService from '../../../../../services/TableSchemaService';
import {
  RuntimeSchemaResource,
  RuntimeSchemaValidationResource,
  SchemaDecoratorResource,
} from '../../../../../models/datamart/graphdb/RuntimeSchema';
import moment from 'moment';
import { Loading } from '../../../../../components';
import { compose } from 'recompose';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import AceEditor from 'react-ace';
import 'brace/mode/hjson';
import { defineMessages, FormattedMessage } from 'react-intl';

type Props = IDatamartTableViewTabProps & InjectedNotificationProps;

export interface IDatamartTableViewTabProps {
  datamartId: string;
}

interface State {
  loadingList: boolean;
  loadingSingle: boolean;
  schemas: RuntimeSchemaResource[];
  selectedSchemaText?: string;
  selectedSchema?: RuntimeSchemaResource;
  schemaValidation?: RuntimeSchemaValidationResource;
  schemaDecorator?: SchemaDecoratorResource[];
  uploadingDecorator: boolean;
}

const messages = defineMessages({
  validationSuccess: {
    id: 'datamart.schemaEditor.tableView.validation.success',
    defaultMessage:
      'Your schema is valid. Please press publish to turn it live.',
  },
  validationError: {
    id: 'datamart.schemaEditor.tableView.validation.error',
    defaultMessage:
      'Either your schema has errors, or is not compliant with the previous one. Please check with your support in order to assess it.',
  },
  validationButton: {
    id: 'datamart.schemaEditor.tableView.validation.button',
    defaultMessage: 'Validate your Schema.',
  },
  publicationButton: {
    id: 'datamart.schemaEditor.tableView.publication.button',
    defaultMessage: 'Publish your Schema.',
  },
  history: {
    id: 'datamart.schemaEditor.tableView.history',
    defaultMessage: 'History',
  },
  schema: {
    id: 'datamart.schemaEditor.tableView.schema',
    defaultMessage: 'Schema',
  },
  createVersion: {
    id: 'datamart.schemaEditor.tableView.version.create',
    defaultMessage: 'Create a new version',
  },
});

class DatamartTableViewTab extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loadingList: true,
      loadingSingle: true,
      schemas: [],
      uploadingDecorator: false
    };
  }

  componentDidMount() {
    const { datamartId } = this.props;

    this.fetchSchemas(datamartId, true);
  }

  componentDidUpdate(prevProps: IDatamartTableViewTabProps) {
    const { datamartId } = this.props;

    const { datamartId: prevDatamartId } = this.props;

    if (datamartId !== prevDatamartId) {
      this.fetchSchemas(datamartId, true);
    }
  }

  fetchSchemas = (datamartId: string, shouldSelectLive = true) => {
    this.setState({ loadingList: true });
    return TableSchemaService.getTableSchemas(datamartId)
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
    return TableSchemaService.getTableSchemaText(datamartId, schemaId)
      .then(r => {
        this.setState({ selectedSchemaText: r, loadingSingle: false });
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
    return TableSchemaService.cloneTableSchema(
      schema.datamart_id,
      schema.id,
    ).then(s => {
      return Promise.all([
        this.fetchSchemaDetail(s.data.datamart_id, s.data.id),
        this.fetchSchemas(s.data.datamart_id, false),
      ]);
    })
    .catch(err => {
      this.props.notifyError(err);
      this.setState({ loadingList: false, loadingSingle: false })
    });
  };

  validateSchema = () => {
    const { selectedSchema } = this.state;
    if (selectedSchema) {
      this.setState({ loadingSingle: true });
      return TableSchemaService.validateTableSchema(
        selectedSchema.datamart_id,
        selectedSchema.id,
      )
        .then(r =>
          this.setState({ schemaValidation: r.data, loadingSingle: false }),
        )
        .catch(() => this.setState({ loadingSingle: false }));
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
      return TableSchemaService.publishTableSchema(
        selectedSchema.datamart_id,
        selectedSchema.id,
      )
        .then(r => this.fetchSchemas(r.data.datamart_id, true))
        .catch(() =>
          this.setState({ loadingSingle: false, loadingList: false }),
        );
    }
    return Promise.resolve();
  };

  

  onClickOnSelect = (schema: RuntimeSchemaResource) => () =>
    this.selectSchema(schema);

  public render() {
    const {
      loadingSingle,
      schemas,
      loadingList,
      selectedSchema,
      selectedSchemaText,
      schemaValidation,
    } = this.state;

    let additionnalButton;


    const isInValidationMode = !!schemaValidation;
    const validationError =
      schemaValidation &&
      (schemaValidation.schema_errors.length ||
        schemaValidation.tree_indices.find(
          ti => ti.init_strategy !== 'FORCE_NO_BUILD',
        ));

    if (
      selectedSchema &&
      selectedSchema.status === 'DRAFT' &&
      !isInValidationMode
    ) {
      additionnalButton = (
        <Button size="small" type="primary" onClick={this.validateSchema}>
          <FormattedMessage {...messages.validationButton} />
        </Button>
      );
    }

    if (
      selectedSchema &&
      selectedSchema.status === 'DRAFT' &&
      isInValidationMode &&
      !validationError
    ) {
      additionnalButton = (
        <Button size="small" type="primary" onClick={this.publishSchema}>
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
        <Button
          size="small"
          type="primary"
          onClick={this.createNewSchemaVersion(selectedSchema)}
        >
          <FormattedMessage {...messages.createVersion} />
        </Button>
      );
    }

    return (
      <div className="schema-editor">
        <Row className="title-line">
          <Col className="title" span={6}>
            <FormattedMessage {...messages.history} />
          </Col>
          <Col className="title" span={18}>
            <span style={{ float: 'right' }}>{additionnalButton}</span>
            <FormattedMessage {...messages.schema} />
          </Col>
        </Row>
        <Row className="content-line">
          <Col span={6} className="content">
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
                      <span className="title">{s.status}</span>
                      <span className="date">
                        {moment(s.creation_date).fromNow()}
                      </span>
                    </div>
                  );
                })
            )}
          </Col>
          <Col span={18} className="content">
            {loadingSingle ? (
              <Loading />
            ) : (
              <div>
                {isInValidationMode && (
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
                  width="100%"
                  mode="hjson"
                  theme="github"
                  setOptions={{
                    showGutter: true,
                  }}
                  value={selectedSchemaText}
                />
                
              </div>
            )}
          </Col>
        </Row>
      </div>
    );
  }
}

export default compose<Props, IDatamartTableViewTabProps>(injectNotifications)(
  DatamartTableViewTab,
);
