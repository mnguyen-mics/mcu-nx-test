import * as React from 'react';
import _ from 'lodash';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import AudienceBuilderSelector, { messages } from './AudienceBuilderSelector';
import AudienceBuilderContainer from './AudienceBuilderContainer';
import {
  AudienceBuilderResource,
  AudienceBuilderFormData,
} from '../../../models/audienceBuilder/AudienceBuilderResource';
import { lazyInject } from '../../../config/inversify.config';
import { IAudienceBuilderService } from '../../../services/AudienceBuilderService';
import { TYPES } from '../../../constants/types';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import {
  INITIAL_AUDIENCE_BUILDER_FORM_DATA,
  buildQueryDocument,
  FORM_ID,
} from './constants';
import { Loading } from '../../../components';
import { IQueryService } from '../../../services/QueryService';
import { OTQLResult } from '../../../models/datamart/graphdb/OTQLResult';
import { IAudienceFeatureService } from '../../../services/AudienceFeatureService';
import {
  withDatamartSelector,
  WithDatamartSelectorProps,
} from '../../Datamart/WithDatamartSelector';
import { withRouter, RouteComponentProps } from 'react-router';
import { MicsReduxState } from '../../../utils/ReduxHelper';
import { getFormValues } from 'redux-form';
import { connect } from 'react-redux';

interface State {
  audienceBuilders?: AudienceBuilderResource[];
  selectedAudienceBuilder?: AudienceBuilderResource;
  formData: AudienceBuilderFormData;
  isLoading: boolean;
  queryResult?: OTQLResult;
  isQueryRunning: boolean;
}

interface MapStateToProps {
  formValues: AudienceBuilderFormData;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  MapStateToProps &
  RouteComponentProps<{ organisationId: string }> &
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
    this.getAudienceBuilders(selectedDatamartId);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { selectedAudienceBuilder } = this.state;
    const {
      match: {
        params: { organisationId },
      },
      selectedDatamartId,
      formValues,
    } = this.props;
    const {
      match: {
        params: { organisationId: prevOrganisationId },
      },
      selectedDatamartId: prevSelectedDatamartId,
      formValues: prevFormValues,
    } = prevProps;
    if (
      organisationId !== prevOrganisationId ||
      selectedDatamartId !== prevSelectedDatamartId
    ) {
      this.getAudienceBuilders(selectedDatamartId).then(() => {
        this.runQuery(formValues);
      });
    } else if (
      selectedAudienceBuilder &&
      selectedAudienceBuilder.demographics_features_ids.length === 0 &&
      !_.isEqual(formValues, prevFormValues)
    ) {
      this.runQuery(formValues);
    }
  }

  getAudienceBuilders = (datamartId: string) => {
    return this._audienceBuilderService
      .getAudienceBuilders(datamartId)
      .then(res => {
        this.setState({
          audienceBuilders: res.data,
          selectedAudienceBuilder:
            res.data.length === 1 ? res.data[0] : undefined,
          isLoading: false,
        });
      })
      .catch(error => {
        this.setState({
          isLoading: false,
        });
        this.props.notifyError(error);
      });
  };

  selectAudienceBuilder = (audienceBuilder: AudienceBuilderResource) => {
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
          selectedAudienceBuilder: audienceBuilder,
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
        selectedAudienceBuilder: audienceBuilder,
        formData: INITIAL_AUDIENCE_BUILDER_FORM_DATA,
      });
    }
  };

  runQuery = (formData: AudienceBuilderFormData) => {
    const { selectedDatamartId } = this.props;
    this.setState({
      isQueryRunning: true,
    });
    this._queryService
      .runJSONOTQLQuery(selectedDatamartId, buildQueryDocument(formData))
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

  render() {
    const { intl } = this.props;
    const {
      selectedAudienceBuilder,
      audienceBuilders,
      isLoading,
      formData,
      queryResult,
      isQueryRunning,
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

const mapStateToProps = (state: MicsReduxState) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose(
  withDatamartSelector,
  withRouter,
  injectIntl,
  injectNotifications,
  connect(mapStateToProps),
)(AudienceBuilderPage);
