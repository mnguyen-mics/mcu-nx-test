import * as React from 'react';
import { Layout } from 'antd';
import AngularQueryToolWidget, {
  QueryContainer,
} from './AngularQueryToolWidget';
import { withRouter, RouteComponentProps } from 'react-router';
import ContentHeader from '../../../components/ContentHeader';

export interface SelectorQLBuilderContainerProps {
  datamartId: string;
  renderActionBar: (
    queryContainer: QueryContainer | null,
    datamartId: string,
  ) => React.ReactNode;
  title: string;
}

interface State {
  queryContainer: QueryContainer | null;
  exportModalVisible: boolean;
  exportModalLoading: boolean;
}

type Props = SelectorQLBuilderContainerProps &
  RouteComponentProps<{ organisationId: string }>;

class SelectorQLBuilderContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      queryContainer: null,
      exportModalVisible: false,
      exportModalLoading: false,
    };
  }

  setStateWithQueryContainer = (queryContainer: QueryContainer) => {
    if (this.state.queryContainer === null) {
      this.setState({ queryContainer });
    }
  };

  render() {
    const { renderActionBar, datamartId, title } = this.props;
    const { queryContainer } = this.state;

    return (
      <Layout>
        {renderActionBar(queryContainer, datamartId)}
        <Layout.Content
          className="mcs-content-container"
        >
          <ContentHeader
            title={
              title
            }
          />
          <AngularQueryToolWidget
            organisationId={this.props.match.params.organisationId}
            datamartId={this.props.datamartId}
            setStateWithQueryContainer={this.setStateWithQueryContainer}
          />
        </Layout.Content>
      </Layout>
    );
  }
}

export default withRouter(SelectorQLBuilderContainer);
