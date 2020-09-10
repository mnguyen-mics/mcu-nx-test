import * as React from 'react';
import _ from 'lodash';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import AudienceBuilderSelector, { messages } from './AudienceBuilderSelector';
import AudienceBuilderContainer from './AudienceBuilderContainer';
import {
  AudienceBuilderResource,
  AudienceBuilderFormData,
  // QueryDocument,
  AudienceBuilderNodeShape,
  isAudienceBuilderGroupNode,
  QueryDocument,
} from '../../../models/audienceBuilder/AudienceBuilderResource';
import { lazyInject } from '../../../config/inversify.config';
import { IAudienceBuilderService } from '../../../services/AudienceBuilderService';
import { RouteComponentProps, withRouter } from 'react-router';
import { TYPES } from '../../../constants/types';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { INITIAL_AUDIENCE_BUILDER_FORM_DATA } from './constants';
import { Loading } from '../../../components';
import {
  withDatamartSelector,
  WithDatamartSelectorProps,
} from '../../Datamart/WithDatamartSelector';
import { IQueryService } from '../../../services/QueryService';
import { OTQLResult } from '../../../models/datamart/graphdb/OTQLResult';

interface State {
  audienceBuilders?: AudienceBuilderResource[];
  selectedAudienceBuidler?: AudienceBuilderResource;
  formData: AudienceBuilderFormData;
  isLoading: boolean;
  queryResult?: OTQLResult;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  WithDatamartSelectorProps &
  RouteComponentProps<{ organisationId: string }>;

class AudienceBuilderPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceBuilderService)
  private _audienceBuilderService: IAudienceBuilderService;

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      formData: INITIAL_AUDIENCE_BUILDER_FORM_DATA,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    this._audienceBuilderService
      .getAudienceBuilders(organisationId)
      .then(res => {
        this.setState({
          audienceBuilders: res.data,
          isLoading: false,
        });
      })
      .catch(error => {
        this.setState({
          isLoading: false,
        });
        this.props.notifyError(error);
      });
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const {
      selectedAudienceBuidler,
      formData
    } = this.state;
    const {
      selectedAudienceBuidler: prevSelectedAudienceBuidler
    } = prevState;
    if(!_.isEqual(selectedAudienceBuidler, prevSelectedAudienceBuidler)) {
      this.runQuery(formData);
    }
  }

  saveAudience = (formData: AudienceBuilderFormData) => {
    // const baseQueryFragment = {
    //   language_version: 'JSON_OTQL',
    //   operations: [
    //     {
    //       directives: [
    //         {
    //           name: 'count',
    //         },
    //       ],
    //       selections: [],
    //     },
    //   ],
    //   from: 'UserPoint',
    //   where: {},
    // };
    // const clauseWhere = formData.where;
    // const query: QueryDocument = {
    //   ...baseQueryFragment,
    //   where: clauseWhere,
    // };
    // Let's keep it to check the query.
    // It will be removed when backend part will be ready
    // console.log('The Query: ', query);
    // console.log('Number of errors: ', this.validateQuery(clauseWhere));
  };

  runQuery = (formData: AudienceBuilderFormData) => {
    const {
      selectedDatamartId,
    } = this.props;
     const baseQueryFragment = {
      language_version: 'JSON_OTQL',
      operations: [
        {
          directives: [
            {
              name: 'count',
            },
          ],
          selections: [],
        },
      ],
      from: 'UserPoint',
      where: {},
    };
    const clauseWhere = formData.where;
    const query: QueryDocument = {
      ...baseQueryFragment,
      where: clauseWhere,
    };

    this._queryService
    .runJSONOTQLQuery(selectedDatamartId, query as any).
    then(queryResult => {
      this.setState({
        queryResult: queryResult.data
      })
    }).catch(err => {
      this.props.notifyError(err)
    })
  }

  // Validates JSON OTQL clauseWhere from formData
  validateQuery = (clauseWhere: AudienceBuilderNodeShape): number => {
    let errors = 0;
    if (
      clauseWhere.type !== 'GROUP' ||
      clauseWhere.boolean_operator !== 'AND'
    ) {
      errors++;
    } else
      clauseWhere.expressions.forEach((exp, i) => {
        if (i === 0) {
          if (!isAudienceBuilderGroupNode(exp)) {
            errors++;
          } else {
            if (exp.boolean_operator !== 'AND') {
              errors++;
            }
          }
        } else {
          if (exp.type !== 'GROUP' || exp.boolean_operator !== 'OR') {
            errors++;
          }
        }
      });
    return errors;
  };

  selectAudienceBuilder = (audienceBuilder: AudienceBuilderResource) => {
    this.setState({
      selectedAudienceBuidler: audienceBuilder,
      formData: {
        ...INITIAL_AUDIENCE_BUILDER_FORM_DATA,
      },
    });
  };

  render() {
    const { intl, selectedDatamartId } = this.props;
    const {
      selectedAudienceBuidler,
      audienceBuilders,
      isLoading,
      formData,
      queryResult
    } = this.state;

    if (isLoading) {
      return <Loading className="loading-full-screen" />;
    }
    return selectedAudienceBuidler ? (
      <AudienceBuilderContainer
        save={this.runQuery}
        initialValues={formData}
        queryResult={queryResult}
        datamartId={selectedDatamartId}
      />
    ) : (
      <AudienceBuilderSelector
        audienceBuilders={audienceBuilders || []}
        onSelect={this.selectAudienceBuilder}
        actionbarProps={{
          paths: [
            {
              name: intl.formatMessage(messages.subTitle),
            },
          ],
        }}
        isMainlayout={true}
      />
    );
  }
}

export default compose(
  withDatamartSelector,
  injectIntl,
  withRouter,
  injectNotifications,
)(AudienceBuilderPage);
