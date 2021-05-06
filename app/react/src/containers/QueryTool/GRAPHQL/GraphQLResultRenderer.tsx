import * as React from 'react';
import { Spin, Tag } from 'antd';
import { FormattedMessage } from 'react-intl';
import { Card } from '@mediarithmics-private/mcs-components-library';
import injectThemeColors, { InjectedThemeColorsProps } from '../../Helpers/injectThemeColors';
import { compose } from 'recompose';
import { GraphQLResult } from '../../../models/datamart/graphdb/OTQLResult';

export interface GraphQLResultRendererProps {
  result: GraphQLResult | null;
  loading?: boolean;
  aborted?: boolean;
}

type Props = GraphQLResultRendererProps & InjectedThemeColorsProps;

class GraphQLResultRenderer extends React.Component<Props> {
  render() {
    const { result, loading, aborted, colors } = this.props;

    let content: React.ReactNode;
    if (loading) {
      content = (
        <div className='text-center'>
          <Spin size='large' />
        </div>
      );
    } else if (aborted) {
      content = (
        <div className='text-center'>
          <FormattedMessage
            id='queryTool.otql-result-renderer-aborted'
            defaultMessage='Aborted...'
          />
        </div>
      );
    } else if (result) {
      content = (
        <div>
          <pre>{JSON.stringify(result.data, null, 2)}</pre>
        </div>
      );
    } else {
      content = (
        <div className='text-center'>
          <FormattedMessage
            id='queryTool.otql-result-renderer-empty'
            defaultMessage='Empty Result'
          />
        </div>
      );
    }

    return (
      <Card
        title={
          <FormattedMessage
            id='queryTool.otql-result-renderer-card-title'
            defaultMessage='Result'
          />
        }
        buttons={
          result ? (
            <React.Fragment>
              <Tag color={colors['mcs-info']}>
                <FormattedMessage
                  id='otql-result-renderer-card-subtitle-duration'
                  defaultMessage='Took {duration}ms'
                  values={{ duration: result.took }}
                />
              </Tag>
              {result.cache_hit && (
                <Tag color={colors['mcs-success']}>
                  <FormattedMessage
                    id='otql-result-renderer-card-subtitle-cache'
                    defaultMessage='From Cache'
                  />
                </Tag>
              )}
            </React.Fragment>
          ) : undefined
        }
      >
        {content}
      </Card>
    );
  }
}

export default compose<Props, GraphQLResultRendererProps>(injectThemeColors)(GraphQLResultRenderer);
