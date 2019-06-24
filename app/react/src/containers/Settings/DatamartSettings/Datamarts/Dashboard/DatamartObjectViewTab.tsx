import * as React from 'react';
import { Row, Col, Spin, Button } from 'antd';
import RuntimeSchemaService from '../../../../../services/RuntimeSchemaService';
import { RuntimeSchemaResource } from '../../../../../models/datamart/graphdb/RuntimeSchema';
import moment from 'moment';
import { Loading } from '../../../../../components';
import { compose } from 'recompose';
import injectNotifications, { InjectedNotificationProps } from '../../../../Notifications/injectNotifications';

type Props = IDatamartObjectViewTabProps & InjectedNotificationProps

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

class DatamartObjectViewTab extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
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
    })
    .catch(err => {
      this.setState({ loadingList: false })
      this.props.notifyError(err);
    });
  };

  fetchSchemaDetail = (datamartId: string, schemaId: string) => {
    this.setState({ loadingSingle: true });
    return RuntimeSchemaService.getRuntimeSchemaText(datamartId, schemaId).then(
      r => {
        this.setState({ loadingSingle: false, selectedSchemaText: r });
      },
    )
    .catch(err => {
      this.setState({ loadingSingle: false })
      this.props.notifyError(err);
    });
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
          <Col className="title" span={6}>
            {schemas.filter(s => s.status === "DRAFT").length ? undefined : <Button size="small" style={{ float: "right" }}>New Version</Button>} History
          </Col>
          <Col className="title" span={18}>
            Schema {schemas.filter(s => s.status === "DRAFT").length ? undefined : <Button size="small" style={{ float: "right" }}>Publication</Button>} History
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
            {loadingSingle ? <Loading /> : <div>{selectedSchemaText}</div>}
          </Col>
        </Row>
      </div>
    );
  }
}

export default compose<Props, IDatamartObjectViewTabProps>(
  injectNotifications
)(DatamartObjectViewTab)
