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
      <div>
        <Row>
          <Col span={6}>
            {loadingList ? (
              <Spin />
            ) : (
              schemas.map(s => {
                return (
                  <div
                    key={s.id}
                    className={
                      selectedSchema && selectedSchema.id === s.id
                        ? 'selected'
                        : undefined
                    }
                  >
                    <span>{s.status}</span>{' '}
                    <span>{moment(s.creation_date).fromNow()}</span>
                  </div>
                );
              })
            )}
          </Col>
          <Col span={18}>
            {loadingSingle ? <Loading /> : <div>{selectedSchemaText}</div>}
          </Col>
        </Row>
      </div>
    );
  }
}
