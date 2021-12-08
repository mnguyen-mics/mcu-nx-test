import * as React from 'react';
import GraphQLConsoleContainer from './GRAPHQL/GraphQLConsoleContainer';
import OTQLConsoleContainer from './OTQL/OTQLConsoleContainer';
import { Layout, Row } from 'antd';
import { FormTitle } from '../../components/Form';
import { MenuList } from '@mediarithmics-private/mcs-components-library';
import { defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { injectFeatures, InjectedFeaturesProps } from '../Features';

export interface IQueryToolSelectorProps {
  datamartId: string;
  renderActionBar: (query: string, datamartId: string) => React.ReactNode;
  createdQueryId?: string;
}

export type Languages = 'OTQL' | 'GRAPHQL';

interface State {
  queryLanguage?: Languages;
}

const messages = defineMessages({
  title: {
    id: 'queryselector.title',
    defaultMessage: 'Query Language',
  },
  subTitle: {
    id: 'queryselector.subtitle',
    defaultMessage: 'Choose your Query Language',
  },
});

type Props = IQueryToolSelectorProps & InjectedFeaturesProps;

class QueryToolSelector extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      queryLanguage: props.hasFeature('datamart-graphql') ? undefined : 'OTQL',
    };
  }

  onSelect = (value: Languages) => () => {
    this.setState({ queryLanguage: value });
  };

  public render() {
    const { queryLanguage } = this.state;
    if (queryLanguage) {
      switch (queryLanguage) {
        case 'GRAPHQL':
          return <GraphQLConsoleContainer {...this.props} />;
        case 'OTQL':
          return <OTQLConsoleContainer {...this.props} />;
      }
    }

    return (
      <Layout>
        <Layout.Content className='mcs-content-container mcs-form-container text-center'>
          <FormTitle title={messages.title} subtitle={messages.subTitle} />
          <Row className='mcs-selector_container'>
            <Row className='menu'>
              <MenuList title={'OTQL'} select={this.onSelect('OTQL')} />
              <MenuList title={'GraphQL'} select={this.onSelect('GRAPHQL')} />
            </Row>
          </Row>
        </Layout.Content>
      </Layout>
    );
  }
}

export default compose<Props, IQueryToolSelectorProps>(injectFeatures)(QueryToolSelector);
