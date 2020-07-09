import * as React from 'react';
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
        datamart_id: audienceBuilder.datamart_id,
      },
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
