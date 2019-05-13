import * as React from 'react';
import ReactAngular from '../../ReactAngular/ReactAngular';
import { QueryResource } from '../../../models/datamart/DatamartResource';
import { FormattedMessage } from 'react-intl';
import { Spin } from 'antd';

const messageProps = {
  id: 'queryTool.query-tool.widget.angular-query.undefined',
  defaultMessage: 'Undefined angular query container'
}


export interface AngularQueryToolWidgetProps {
  datamartId: string;
  organisationId: string;
  setStateWithQueryContainer: (queryContainer: QueryContainer) => void;
}

export interface QueryContainer {
  saveOrUpdate: () => Promise<QueryResource>
}

interface AngularQueryToolWidgetState {
  sessionInitialized: boolean,
  queryContainerInitialized: boolean
}

declare global { namespace JSX { interface IntrinsicElements { "mcs-query-tool": any } } }


const ReactAngularJS = ReactAngular as any;

export default class AngularQueryToolWidget extends React.Component<AngularQueryToolWidgetProps, AngularQueryToolWidgetState> {

  AngularQueryContainer: any;
  AngularSession: any;
  queryContainer: QueryContainer

  constructor(props: AngularQueryToolWidgetProps) {
    super(props);
    this.state = { sessionInitialized: false, queryContainerInitialized: false }
  }

  componentDidMount() {        
    this.AngularQueryContainer = (window as any).angular.element(document.body).injector().get('core/datamart/queries/QueryContainer');
    this.AngularSession = (window as any).angular.element(document.body).injector().get('core/common/auth/Session');
    this.AngularSession.init(`o${this.props.organisationId}d${this.props.datamartId}`)
      .then(() => {
        this.setState({ sessionInitialized: true })
      })
      .then(() => {
        this.queryContainer = new this.AngularQueryContainer(this.props.datamartId)
        this.props.setStateWithQueryContainer(this.queryContainer);
        this.setState({
          queryContainerInitialized: true
        })
      })
      .catch(() => this.setState({
        sessionInitialized: true,
        queryContainerInitialized: true
      }))
  }

  render() {
    if (!this.state.sessionInitialized) {
      return <Spin />
    }

    return this.state.queryContainerInitialized ? (
      <ReactAngularJS
        scope={{
          container: this.queryContainer,
          organisationId: this.props.organisationId,
          datamartId: this.props.datamartId,
        }}
      >
        <mcs-query-tool query-container="container" statistics-enabled="true" selected-values-enabled="true" datamart-id="datamartId" organisation-id="organisationId" />
      </ReactAngularJS>
    ) : (
      <FormattedMessage {...messageProps} />
    );
  }
}