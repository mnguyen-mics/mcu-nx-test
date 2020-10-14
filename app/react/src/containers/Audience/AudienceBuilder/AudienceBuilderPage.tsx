import * as React from 'react';
import _ from 'lodash';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import AudienceBuilderSelector, { messages } from './AudienceBuilderSelector';
import AudienceBuilderContainer from './AudienceBuilderContainer';
import {
  AudienceBuilderResource,
  AudienceBuilderFormData,
  QueryDocument,
  AudienceBuilderGroupNode,
  AudienceBuilderParametricPredicateNode,
} from '../../../models/audienceBuilder/AudienceBuilderResource';
import { lazyInject } from '../../../config/inversify.config';
import { IAudienceBuilderService } from '../../../services/AudienceBuilderService';
import { TYPES } from '../../../constants/types';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { INITIAL_AUDIENCE_BUILDER_FORM_DATA } from './constants';
import { Loading } from '../../../components';
import { IQueryService } from '../../../services/QueryService';
import { OTQLResult } from '../../../models/datamart/graphdb/OTQLResult';
import { IAudienceFeatureService } from '../../../services/AudienceFeatureService';
import {
  withDatamartSelector,
  WithDatamartSelectorProps,
} from '../../Datamart/WithDatamartSelector';

interface State {
  audienceBuilders?: AudienceBuilderResource[];
  selectedAudienceBuilder?: AudienceBuilderResource;
  formData: AudienceBuilderFormData;
  isLoading: boolean;
  queryResult?: OTQLResult;
  isQueryRunning: boolean;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  WithDatamartSelectorProps;

class AudienceBuilderPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceBuilderService)
  private _audienceBuilderService: IAudienceBuilderService;

  @lazyInject(TYPES.IAudienceFeatureService)
  private _audienceFeatureService: IAudienceFeatureService;

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      isQueryRunning: false,
      formData: INITIAL_AUDIENCE_BUILDER_FORM_DATA,
    };
  }

  componentDidMount() {
    const { selectedDatamartId } = this.props;

    this._audienceBuilderService
      .getAudienceBuilders(selectedDatamartId)
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
    const { selectedAudienceBuilder, formData, audienceBuilders } = this.state;
    if (audienceBuilders?.length === 1 && selectedAudienceBuilder === undefined)
      this.selectAudienceBuilder(audienceBuilders[0]);
    const { selectedAudienceBuilder: prevSelectedAudienceBuidler } = prevState;
    if (!_.isEqual(selectedAudienceBuilder, prevSelectedAudienceBuidler)) {
      this.runQuery(formData);
    }
  }

  getInitialFormData = (audienceBuilder: AudienceBuilderResource) => {
    if (audienceBuilder.demographics_features_ids.length >= 1) {
      const datamartId = audienceBuilder.datamart_id;
      const promises = audienceBuilder.demographics_features_ids.map(id => {
        return this._audienceFeatureService.getAudienceFeature(datamartId, id);
      });
      Promise.all(promises).then(resp => {
        const parametricPredicates = resp.map(r => {
          return r.data;
        });
        this.setState({
          formData: {
            where: {
              type: 'GROUP',
              boolean_operator: 'AND',
              expressions: [
                {
                  type: 'GROUP',
                  boolean_operator: 'AND',
                  expressions: parametricPredicates.map(p => {
                    const parameters: { [key: string]: any } = {};
                    p.variables.forEach(v => {
                      const parameterName = v.parameter_name;
                      parameters[parameterName] = '';
                    });
                    return {
                      type: 'PARAMETRIC_PREDICATE',
                      parametric_predicate_id: p.id,
                      parameters: parameters,
                    };
                  }),
                },
              ],
            },
          },
        });
      });
    } else {
      this.setState({
        formData: INITIAL_AUDIENCE_BUILDER_FORM_DATA,
      });
    }
  };

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
    const { selectedDatamartId } = this.props;
    this.setState({
      isQueryRunning: true,
    });
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
      .runJSONOTQLQuery(selectedDatamartId, this.formateQuery(query) as any)
      .then(queryResult => {
        this.setState({
          queryResult: queryResult.data,
          isQueryRunning: false,
        });
      })
      .catch(err => {
        // this.props.notifyError(err);
        this.setState({
          isQueryRunning: false,
        });
      });
  };

  // This will be removed when backend will be able to handle List and Long
  formateQuery = (query: QueryDocument) => {
    return {
      ...query,
      where: {
        ...query.where,
        expressions: (query.where as AudienceBuilderGroupNode).expressions.map(
          (exp: AudienceBuilderGroupNode) => {
            return {
              ...exp,
              expressions: exp.expressions.map(
                (e: AudienceBuilderParametricPredicateNode) => {
                  const parameters: any = {};
                  const formateValue = (v: any) => {
                    if (Array.isArray(v)) {
                      return v[0].toString();
                    } else if (typeof v === 'number') {
                      return v.toString();
                    } else return v;
                  };
                  Object.keys(e.parameters).forEach(k => {
                    parameters[`${k}`] = formateValue(e.parameters[k]);
                  });

                  return {
                    ...e,
                    parameters: parameters,
                  };
                },
              ),
            };
          },
        ),
      },
    };
  };

  selectAudienceBuilder = (audienceBuilder: AudienceBuilderResource) => {
    this.setState({
      selectedAudienceBuilder: audienceBuilder,
    });
    this.getInitialFormData(audienceBuilder);
  };

  render() {
    const { intl } = this.props;
    const {
      selectedAudienceBuilder,
      audienceBuilders,
      isLoading,
      formData,
      queryResult,
      isQueryRunning
    } = this.state;

    if (isLoading) {
      return <Loading className="loading-full-screen" />;
    }

    return selectedAudienceBuilder ? (
      <AudienceBuilderContainer
        save={this.runQuery}
        initialValues={formData}
        queryResult={queryResult}
        isQueryRunning={isQueryRunning}
        audienceBuilder={selectedAudienceBuilder}
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
  injectNotifications,
)(AudienceBuilderPage);
