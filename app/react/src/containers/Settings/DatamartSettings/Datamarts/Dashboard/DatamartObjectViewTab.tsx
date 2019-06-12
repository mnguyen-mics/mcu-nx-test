import * as React from 'react';
import { Row, Col, Spin } from 'antd';
import RuntimeSchemaService from '../../../../../services/RuntimeSchemaService';
import { RuntimeSchemaResource } from '../../../../../models/datamart/graphdb/RuntimeSchema';
import moment from 'moment';
import { Loading } from '../../../../../components';

export interface IDatamartObjectViewTabProps {
  datamartId: string;
}

interface State {
  loadingList: boolean;
  loadingSingle: boolean;
  schemas: RuntimeSchemaResource[];
  selectedSchemaText?: string;
  selectedSchema?: RuntimeSchemaResource;
}

export default class DatamartObjectViewTab extends React.Component<
  IDatamartObjectViewTabProps,
  State
> {
  constructor(props: IDatamartObjectViewTabProps) {
    super(props);
    this.state = {
      loadingList: true,
      loadingSingle: true,
      schemas: [],
    };
  }

  componentDidMount() {
    const { datamartId } = this.props;

    this.fetchSchemas(datamartId);
  }

  componentDidUpdate(prevProps: IDatamartObjectViewTabProps) {
    const { datamartId } = this.props;

    const { datamartId: prevDatamartId } = this.props;

    if (datamartId !== prevDatamartId) {
      this.fetchSchemas(datamartId);
    }
  }

  fetchSchemas = (datamartId: string) => {
    this.setState({ loadingList: true });
    return RuntimeSchemaService.getRuntimeSchemas(datamartId).then(r => {
      this.setState({ loadingList: false, schemas: r.data });
      const liveSchema = r.data.find(s => s.status === 'LIVE');
      if (liveSchema) {
        this.setState({ selectedSchema: liveSchema });
        return this.fetchSchemaDetail(datamartId, liveSchema.id);
      }
      return this.fetchSchemaDetail(datamartId, r.data[0].id);
    });
  };

  fetchSchemaDetail = (datamartId: string, schemaId: string) => {
    this.setState({ loadingSingle: true });
    return RuntimeSchemaService.getRuntimeSchemaText(datamartId, schemaId).then(
      r => {
        this.setState({ loadingSingle: false, selectedSchemaText: r });
      },
    );
  };

  public render() {
    const {
      loadingSingle,
      schemas,
      loadingList,
      selectedSchema,
      selectedSchemaText,
    } = this.state;

    return (
      <div className="schema-editor">
        <Row className="title-line">
          <Col className="title" span={6}>History</Col>
          <Col className="title" span={18}>Schema</Col>
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
                          : "list-item"
                      }
                    > 
                      <span className="title">{s.status}</span>
                      <span className="date">{moment(s.creation_date).fromNow()}</span>
                    </div>
                  );
                })
            )}
          </Col>
          <Col span={18} className="content">
            {loadingSingle ? <Loading /> : <div>{selectedSchemaText}</div>}
          </Col>
        </Row>
      </div>
    );
  }
}
