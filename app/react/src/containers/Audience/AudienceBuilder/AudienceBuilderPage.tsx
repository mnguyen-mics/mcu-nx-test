import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import AudienceBuilderSelector, { messages } from './AudienceBuilderSelector';
import AudienceBuilderContainer from './AudienceBuilderContainer';
import {
  AudienceBuilderResource,
  AudienceBuilderFormData,
  AudienceBuilderNodeShape,
  isAudienceBuilderGroupNode,
  AudienceBuilderFieldNodeModel,
} from '../../../models/audienceBuilder/AudienceBuilderResource';
import { lazyInject } from '../../../config/inversify.config';
import { IAudienceBuilderService } from '../../../services/AudienceBuilderService';
import { RouteComponentProps, withRouter } from 'react-router';
import { TYPES } from '../../../constants/types';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { INITIAL_AUDIENCE_BUILDER_FORM_DATA } from './constants';
import {
  ObjectTreeExpressionNodeShape,
  isGroupNode,
  GroupNode,
  isFieldNode,
} from '../../../models/datamart/graphdb/QueryDocument';
import { Loading } from '../../../components';
import cuid from 'cuid';

interface State {
  audienceBuilders?: AudienceBuilderResource[];
  selectedAudienceBuidler?: AudienceBuilderResource;
  formData: AudienceBuilderFormData;
  isLoading: boolean;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }>;

class AudienceBuilderPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceBuilderService)
  private _audienceBuilderService: IAudienceBuilderService;

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
          formData: INITIAL_AUDIENCE_BUILDER_FORM_DATA,
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

  // Builds formData from JSON OTQL where clause
  buildFormData = (
    whereClause?: ObjectTreeExpressionNodeShape,
  ): AudienceBuilderFormData => {
    const loop = (
      node: ObjectTreeExpressionNodeShape,
    ): AudienceBuilderNodeShape[] => {
      if (!isGroupNode(node)) {
        // Wrong data
        return [];
      } else {
        return node.expressions.map(exp => {
          if (isFieldNode(exp)) {
            return {
              key: cuid(),
              model: exp,
            };
          } else if (isGroupNode(exp)) {
            return {
              key: cuid(),
              model: {
                ...exp,

                expressions: loop(exp),
              },
            };
          } else {
            // If there is others node types,
            // formData should not be valid
            return {
              key: cuid(),
              model: exp as any,
            };
          }
        });
      }
    };

    const defaultFormData: AudienceBuilderFormData = {
      where: {
        type: 'GROUP',
        boolean_operator: 'AND',
        expressions: [],
      },
    };
    if (!whereClause) {
      return defaultFormData;
    } else if (isGroupNode(whereClause)) {
      const formData = {
        where: {
          ...whereClause,
          expressions: loop(whereClause),
        },
      };
      return formData as AudienceBuilderFormData;
    } else {
      return defaultFormData;
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
    // JSON OTQL Clause where
    // const clauseWhere = this.extractJsonOtql(formData);
    // const query = {
    //   ...baseQueryFragment,
    //   where: clauseWhere,
    // };
    // console.log('The Query: ', query);
    // console.log('Number of errors: ', this.validateQuery(clauseWhere));
  };

  // returns JSON OTQL where clause from formData
  extractJsonOtql = (formData: AudienceBuilderFormData): GroupNode => {
    const loop = (
      expressions: AudienceBuilderNodeShape[],
    ): ObjectTreeExpressionNodeShape[] => {
      return expressions.map(exp => {
        if (isAudienceBuilderGroupNode(exp.model)) {
          return {
            ...exp.model,
            expressions: loop(exp.model.expressions),
          };
        } else {
          return exp.model as AudienceBuilderFieldNodeModel;
        }
      });
    };
    return {
      ...formData.where,
      expressions: loop(formData.where.expressions),
    };
  };

  // Validates JSON OTQL clauseWhere from formData
  validateQuery = (clauseWhere: ObjectTreeExpressionNodeShape): number => {
    let errors = 0;
    if (
      clauseWhere.type !== 'GROUP' ||
      clauseWhere.boolean_operator !== 'AND'
    ) {
      errors++;
    } else
      clauseWhere.expressions.forEach((exp, i) => {
        if (i === 0) {
          if (!isGroupNode(exp)) {
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
    });
  };

  render() {
    const { intl } = this.props;
    const {
      selectedAudienceBuidler,
      audienceBuilders,
      isLoading,
      formData,
    } = this.state;

    if (isLoading) {
      return <Loading className="loading-full-screen" />;
    }
    return selectedAudienceBuidler ? (
      <AudienceBuilderContainer
        save={this.saveAudience}
        initialValues={formData}
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
  injectIntl,
  withRouter,
  injectNotifications,
)(AudienceBuilderPage);
