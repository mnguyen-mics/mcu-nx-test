import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { DatamartResource } from '../../models/datamart/DatamartResource';
import { UserProfileResource } from '../../models/directory/UserProfileResource';
import { Layout, Row } from 'antd';
import { MenuList } from '@mediarithmics-private/mcs-components-library';
import { FormTitle } from '../../components/Form';
import { defineMessages } from 'react-intl';
import { MicsReduxState } from '../../utils/ReduxHelper';

export interface WithDatamartSelectorProps extends RouteComponentProps<{ organisationId: string }> {
  selectedDatamartId: string;
  selectedDatafarm: string;
  connectedUser: UserProfileResource;
}

type Props<T> = T & WithDatamartSelectorProps;

interface IState {
  datamartId?: string;
  datafarm?: string;
}

const messages = defineMessages({
  title: {
    id: 'datamart_selector.title',
    defaultMessage: 'Datamarts',
  },
  subTitle: {
    id: 'datamart_selector.subtitle',
    defaultMessage: 'Choose your datamart',
  },
});

export function withDatamartSelector<T>(WrappedComponent: React.ComponentClass) {
  class NewComponent extends React.Component<Props<T>, IState> {
    constructor(props: Props<T>) {
      super(props);
      const foundDatamarts = this.findAvailableDatamarts(
        props.connectedUser,
        props.match.params.organisationId,
      );
      this.state = {
        datamartId:
          foundDatamarts && foundDatamarts.length === 1 ? foundDatamarts[0].id : undefined,
        datafarm:
          foundDatamarts && foundDatamarts.length === 1 ? foundDatamarts[0].datafarm : undefined,
      };
    }

    componentDidMount() {
      this.assignAvailableDatamart(
        this.props.connectedUser,
        this.props.match.params.organisationId,
      );
    }

    componentDidUpdate(prevProps: Props<T>, prevState: IState) {
      if (prevProps.match.params.organisationId !== this.props.match.params.organisationId) {
        this.assignAvailableDatamart(
          this.props.connectedUser,
          this.props.match.params.organisationId,
        );
      }
    }

    assignAvailableDatamart = (
      connectedUser: UserProfileResource,
      currentOrganisationId: string,
    ) => {
      const foundDatamarts = this.findAvailableDatamarts(connectedUser, currentOrganisationId);
      if (foundDatamarts && foundDatamarts.length === 1) {
        this.setState({ datamartId: foundDatamarts[0].id });
      } else {
        this.setState({ datamartId: undefined, datafarm: undefined });
      }
    };

    findAvailableDatamarts = (
      connectedUser: UserProfileResource,
      currentOrganisationId: string,
    ): DatamartResource[] => {
      let datamarts: DatamartResource[] = [];
      const found = connectedUser.workspaces.find(
        (w: any) => w.organisation_id === currentOrganisationId,
      );
      if (found) {
        datamarts = found.datamarts;
      }

      return datamarts;
    };

    onSelectDatamart = (d: DatamartResource) => {
      this.setState({
        datamartId: d.id,
        datafarm: d.datafarm,
      });
    };

    render() {
      const {
        connectedUser,
        match: {
          params: { organisationId },
        },
      } = this.props;

      const { datamartId, datafarm } = this.state;

      if (!datamartId) {
        const datamarts = this.findAvailableDatamarts(connectedUser, organisationId);

        return (
          <Layout>
            <Layout.Content className='mcs-content-container mcs-form-container text-center'>
              <FormTitle title={messages.title} subtitle={messages.subTitle} />
              <Row className='mcs-selector_container'>
                <Row className='menu'>
                  {datamarts.map(d => {
                    const handleSelect = () => this.onSelectDatamart(d);
                    return <MenuList key={d.id} title={d.name || d.token} select={handleSelect} />;
                  })}
                </Row>
              </Row>
            </Layout.Content>
          </Layout>
        );
      }

      const wrappedComponentProps: Partial<WithDatamartSelectorProps> = {
        selectedDatamartId: datamartId,
        selectedDatafarm: datafarm,
        connectedUser: connectedUser,
      };

      return <WrappedComponent {...this.props} {...wrappedComponentProps} />;
    }
  }

  return compose<Props<T>, T>(
    withRouter,
    connect((state: MicsReduxState) => ({
      connectedUser: state.session.connectedUser,
    })),
  )(NewComponent);
}
