import * as React from 'react';
import { AudienceSegmentShape } from '../../../models/audiencesegment';
import { StandardSegmentBuilderQueryDocument } from '../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import { DashboardLayout } from '@mediarithmics-private/advanced-components';
import { DashboardContentSchema } from '@mediarithmics-private/advanced-components/lib/components/dashboard-layout/DashboardLayout';
import { isAudienceSegmentShape, isUserQuerySegment } from '../Segments/Edit/domain';
import { isStandardSegmentBuilderQueryDocument } from '../StandardSegmentBuilder/domain';
import {
  AbstractScope,
  QueryScope,
  SegmentScope,
} from '@mediarithmics-private/advanced-components/lib/models/datamart/graphdb/Scope';
import { TYPES } from '../../../constants/types';
import { IQueryService } from '../../../services/QueryService';
import { UserQuerySegment } from '../../../models/audiencesegment/AudienceSegmentResource';
import { QueryCreateRequest } from '../../../models/datamart/DatamartResource';
import _ from 'lodash';
import { Alert, Spin } from 'antd';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import messages from './messages';
import { lazyInject } from '../../../config/inversify.config';
import { QueryResource } from '@mediarithmics-private/advanced-components/lib/models/datamart/DatamartResource';

interface ScopedDashboardLayoutProps {
  datamartId: string;
  schema: DashboardContentSchema;
  source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument;
}

type Props = ScopedDashboardLayoutProps & InjectedIntlProps;

interface ScopedDashboardLayoutState {
  scope?: AbstractScope;
  isLoading: boolean;
  hasError: boolean;
}
type State = ScopedDashboardLayoutState;

class ScopedDashboardLayout extends React.Component<Props, State> {
  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  constructor(props: Props) {
    super(props);
    this.state = {
      scope: undefined,
      isLoading: true,
      hasError: false,
    };
  }

  private adaptScope(
    datamartId: string,
    source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument,
  ): Promise<AbstractScope | undefined> {
    if (!source) return Promise.resolve(undefined);

    if (isAudienceSegmentShape(source)) {
      if (isUserQuerySegment(source)) {
        const userQuerySegment = source as UserQuerySegment;
        return this._queryService
          .getQuery(userQuerySegment.datamart_id, userQuerySegment.query_id as string)
          .then(res => {
            return {
              type: 'SEGMENT',
              segmentId: userQuerySegment.id,
              query: res.data,
            };
          });
      } else {
        const segmentSource = source as AudienceSegmentShape;
        const scope: SegmentScope = {
          type: 'SEGMENT',
          segmentId: segmentSource.id,
        };
        return Promise.resolve(scope);
      }
    } else if (isStandardSegmentBuilderQueryDocument(source)) {
      const standardSegmentBuilderQueryDocument = source as StandardSegmentBuilderQueryDocument;
      const queryResource: QueryCreateRequest = {
        datamart_id: datamartId,
        query_language: 'JSON_OTQL',
        query_text: JSON.stringify(standardSegmentBuilderQueryDocument),
        query_language_subtype: 'PARAMETRIC',
      };
      const scope: QueryScope = {
        type: 'QUERY',
        query: queryResource as QueryResource,
      };
      return Promise.resolve(scope);
    }
    return Promise.resolve(undefined);
  }

  private updateScope(
    datamartId: string,
    source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument,
  ) {
    this.adaptScope(datamartId, source)
      .then(res => {
        this.setState({
          isLoading: false,
          scope: res,
        });
      })
      .catch(e => {
        this.setState({
          isLoading: false,
          hasError: true,
        });
      });
  }

  componentDidMount() {
    const { source, datamartId } = this.props;
    this.updateScope(datamartId, source);
  }

  componentDidUpdate(prevProps: Props) {
    const { datamartId, source } = this.props;
    const { source: prevSource } = prevProps;
    if (!_.isEqual(source, prevSource)) {
      this.setState({
        isLoading: true,
      });
      this.updateScope(datamartId, source);
    }
  }

  render() {
    const { datamartId, schema, intl } = this.props;
    const { scope, isLoading, hasError } = this.state;
    return hasError ? (
      <Alert type='error' message={intl.formatMessage(messages.errorLoadingScope)} />
    ) : isLoading ? (
      <Spin size={'small'} />
    ) : (
      <DashboardLayout datamart_id={datamartId} schema={schema} scope={scope} />
    );
  }
}

export default compose<Props, ScopedDashboardLayoutProps>(injectIntl)(ScopedDashboardLayout);
