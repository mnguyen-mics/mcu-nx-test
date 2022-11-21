import * as React from 'react';
import { WrappedFieldArrayProps } from 'redux-form';
import { WrappedComponentProps, injectIntl, defineMessages } from 'react-intl';
import cuid from 'cuid';
import { compose } from 'recompose';
import { injectDrawer } from '../../../../components/Drawer/index';
import { VisitAnalyzerFieldModel } from './domain';
import FormSection from '../../../../components/Form/FormSection';
import VisitAnalyzerSelector, { VisitAnalyzerSelectorProps } from '../Common/VisitAnalyzerSelector';
import { VisitAnalyzer } from '../../../../models/Plugins';
import { PropertyResourceShape, StringPropertyResource } from '../../../../models/plugin/index';
import { ReduxFormChangeProps } from '../../../../utils/FormHelper';
import {
  DataListResponse,
  DataResponse,
} from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { makeCancelable, CancelablePromise } from '../../../../utils/ApiHelper';
import { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import { lazyInject } from '../../../../config/inversify.config';
import { IVisitAnalyzerService } from '../../../../services/Library/VisitAnalyzerService';
import { TYPES } from '../../../../constants/types';
import TimelineStepBuilder, {
  Step,
} from '../../../../components/TimelineStepBuilder/TimelineStepBuilder';
import { DatabaseOutlined, GlobalOutlined } from '@ant-design/icons';
import { EmptyRecords } from '@mediarithmics-private/mcs-components-library';
import { Tooltip } from 'antd';

export interface VisitAnalyzerSectionProps extends ReduxFormChangeProps {}

type Props = VisitAnalyzerSectionProps &
  WrappedFieldArrayProps<VisitAnalyzerFieldModel> &
  WrappedComponentProps &
  InjectedDrawerProps;

interface VisitAnalyzerData {
  visitAnalyzer?: VisitAnalyzer;
  properties: PropertyResourceShape[];
}

interface State {
  steps: Array<Step<VisitAnalyzerData>>;
}

const messages = defineMessages({
  dropdownAddExisting: {
    id: 'settings.form.activityAnalyzer.addExisting',
    defaultMessage: 'Add Existing',
  },
  addStepButton: {
    id: 'settings.form.activityAnalyzer.addStep',
    defaultMessage: 'Add an Activity Analyzer',
  },
  sectionSubtitleVisitAnalyzer: {
    id: 'settings.form.activityAnalyzer.subtitle',
    defaultMessage:
      'Add Activity Analyzers to your property. They are run in sequences. A Activity Analyzer is a custom plugin that helps you enhance or modify data before storing it in your datamart.',
  },
  sectionTitleVisitAnalyzer: {
    id: 'settings.form.activityAnalyzer.title',
    defaultMessage: 'Activity Analyzers',
  },
  sectionEmptyVisitAnalyzer: {
    id: 'settings.form.activityAnalyzer.empty',
    defaultMessage: 'There is no Activity Analyzer selected yet!',
  },
  newVisitAnalyzerSelection: {
    id: 'settings.form.activityAnalyzer.new',
    defaultMessage: 'New Activity Analyzer',
  },
  sectionGeneralErrorRecoveryStrategyHelperSTORE_WITH_ERROR_ID: {
    id: 'settings.form.activityAnalyzer.error-recovery-strategy.STORE_WITH_ERROR_ID',
    defaultMessage:
      'Store With Error Id: If the Activity Analyzer failed, the activity will be sent to the next Activity Analyzer without any modification of this one.',
  },
  sectionGeneralErrorRecoveryStrategyHelperSTORE_WITH_ERROR_ID_AND_SKIP_UPCOMING_ANALYZERS: {
    id: 'settings.form.activityAnalyzer.error-recovery-strategy.STORE_WITH_ERROR_ID_AND_SKIP_UPCOMING_ANALYZERS',
    defaultMessage:
      'Store With Error Id And Skip Upcoming Analyzers: If the Activity Analyzer failed, the activity will be saved without any modification of this one.',
  },
  sectionGeneralErrorRecoveryStrategyHelperDROP: {
    id: 'settings.form.activityAnalyzer.error-recovery-strategy.DROP',
    defaultMessage: 'Drop: If the Activity Analyzer failed, the activity won’t be saved.',
  },
});

class VisitAnalyzerSection extends React.Component<Props, State> {
  cancelablePromise: CancelablePromise<
    Array<[DataResponse<VisitAnalyzer>, DataListResponse<PropertyResourceShape>]>
  >;

  @lazyInject(TYPES.IVisitAnalyzerService)
  private _visitAnalyzerService: IVisitAnalyzerService;

  constructor(props: Props) {
    super(props);
    this.state = {
      steps: [this.getDefaultStep()],
    };
  }

  componentDidMount() {
    const visitAnalyzerFields = this.props.fields.getAll();
    if (visitAnalyzerFields)
      this.fetchActivityAnalyzer(
        visitAnalyzerFields.map(
          visitAnalyzerField => visitAnalyzerField.model.visit_analyzer_model_id,
        ),
      );
  }

  componentDidUpdate(previousProps: Props) {
    const previousVisitAnalyzerFields = previousProps.fields.getAll();

    const visitAnalyzerFields = this.props.fields.getAll();

    if (visitAnalyzerFields && previousVisitAnalyzerFields !== visitAnalyzerFields) {
      this.fetchActivityAnalyzer(
        visitAnalyzerFields.map(
          visitAnalyzerField => visitAnalyzerField.model.visit_analyzer_model_id,
        ),
      );
    }
  }

  componentWillUnmount() {
    if (this.cancelablePromise) this.cancelablePromise.cancel();
  }

  fetchActivityAnalyzer = (visitAnalyzerIds: string[]) => {
    this.cancelablePromise = makeCancelable(
      Promise.all(
        visitAnalyzerIds.map(visitAnalyzerId =>
          Promise.all([
            this._visitAnalyzerService.getInstanceById(visitAnalyzerId),
            this._visitAnalyzerService.getInstanceProperties(visitAnalyzerId),
          ]),
        ),
      ),
    );

    this.cancelablePromise.promise.then(results => {
      this.setState({
        steps: visitAnalyzerIds.map((visitAnalyzerId, index) => ({
          id: cuid(),
          name: this.getName(
            {
              visitAnalyzer: results[index][0].data,
              properties: results[index][1].data,
            },
            index,
          ),
          properties: {
            visitAnalyzer: results[index][0].data,
            properties: results[index][1].data,
          },
        })),
      });
    });
  };

  updateActivityAnalyzer = (visitAnalyzer: VisitAnalyzer[]) => {
    const { fields, formChange } = this.props;

    const newFields: VisitAnalyzerFieldModel[] = fields.getAll().map((field, currentIndex) => {
      return {
        key: cuid(),
        model: {
          visit_analyzer_model_id: field.model.visit_analyzer_model_id,
        },
      };
    });
    newFields.push({
      key: cuid(),
      model: {
        visit_analyzer_model_id: visitAnalyzer[0].id,
      },
    });

    formChange((fields as any).name, newFields);
    this.props.closeNextDrawer();
  };

  openActivityAnalyzerSelector = () => {
    const props: VisitAnalyzerSelectorProps = {
      selectedVisitAnalyzerIds: [],
      close: this.props.closeNextDrawer,
      save: this.updateActivityAnalyzer,
    };

    this.props.openNextDrawer<VisitAnalyzerSelectorProps>(VisitAnalyzerSelector, {
      additionalProps: props,
    });
  };
  renderHeaderTimeline = () => {
    return <GlobalOutlined className={'mcs-funnelQueryBuilder_timeline_icon'} />;
  };

  renderFooterTimeline = () => {
    return <DatabaseOutlined className={'mcs-funnelQueryBuilder_timeline_icon'} />;
  };

  renderStepBody = (step: Step<VisitAnalyzerData>, index: number) => {
    return <React.Fragment />;
  };

  renderStepHeader = (step: Step<VisitAnalyzerData>, index: number) => {
    const errorStrategy = step.properties.visitAnalyzer?.error_recovery_strategy;
    type helperKey =
      | 'sectionGeneralErrorRecoveryStrategyHelperDROP'
      | 'sectionGeneralErrorRecoveryStrategyHelperSTORE_WITH_ERROR_ID'
      | 'sectionGeneralErrorRecoveryStrategyHelperSTORE_WITH_ERROR_ID_AND_SKIP_UPCOMING_ANALYZERS';
    const key = ('sectionGeneralErrorRecoveryStrategyHelper' + errorStrategy) as helperKey;
    const tooltipMessage = errorStrategy ? this.props.intl.formatMessage(messages[key]) : '';
    return (
      <div className='mcs-timelineStepBuilder_stepName_title'>
        <div className={'mcs-VisitAnalyzerFormSection_timeline_stepName'}>{step.name}</div>
        <Tooltip title={tooltipMessage} placement='right'>
          <div className={'mcs-VisitAnalyzerFormSection_timeline_errorRecoveryStrategy'}>
            {errorStrategy}
          </div>
        </Tooltip>
      </div>
    );
  };

  getDefaultStep = (): Step<VisitAnalyzerData> => {
    return {
      id: cuid(),
      name: this.props.intl.formatMessage(messages.newVisitAnalyzerSelection),
      properties: {
        visitAnalyzer: undefined,
        properties: [],
      },
    };
  };

  getName = (visitAnalyzerData: VisitAnalyzerData, index: number) => {
    const name = visitAnalyzerData?.visitAnalyzer?.name;
    const typeP =
      visitAnalyzerData?.properties &&
      visitAnalyzerData?.properties.find(p => p.technical_name === 'name');
    const providerP =
      visitAnalyzerData?.properties &&
      visitAnalyzerData?.properties.find(p => p.technical_name === 'provider');

    if (name && typeP && providerP) {
      return `${name} (${(typeP as StringPropertyResource).value.value} - ${
        (providerP as StringPropertyResource).value.value
      })`;
    } else {
      return (
        visitAnalyzerData?.visitAnalyzer?.id ??
        this.props.intl.formatMessage(messages.newVisitAnalyzerSelection)
      );
    }
  };

  onStepAdded = () => {
    this.openActivityAnalyzerSelector();
  };

  onStepChange = (steps: Array<Step<VisitAnalyzerData>>) => {
    const { fields, formChange } = this.props;
    const newFields: VisitAnalyzerFieldModel[] = steps.map(step => {
      return {
        key: cuid(),
        model: {
          visit_analyzer_model_id: step.properties.visitAnalyzer?.id!,
        },
      };
    });

    formChange((fields as any).name, newFields);

    this.setState({ steps });
  };

  getActivityAnalyzerRecords = () => {
    const rendering = {
      shouldDisplayNumbersInBullet: false,
      renderHeaderTimeline: this.renderHeaderTimeline,
      renderFooterTimeline: this.renderFooterTimeline,
      renderStepBody: this.renderStepBody,
      renderStepHeader: this.renderStepHeader,
      shouldRenderArrows: true,
      getAddStepText: () => messages.addStepButton,
    };
    const stepManagement = {
      computeStepName: (step: Step<VisitAnalyzerData>, index: number) =>
        this.getName(step.properties, index),
      onStepAdded: this.onStepAdded,
      onStepRemoved: this.onStepChange,
      onStepsReordered: this.onStepChange,
      getDefaultStep: this.getDefaultStep,
    };

    return (
      <React.Fragment>
        <FormSection
          subtitle={messages.sectionSubtitleVisitAnalyzer}
          title={messages.sectionTitleVisitAnalyzer}
        />

        <div className={'mcs-VisitAnalyzerFormSection_timeline'}>
          {!this.state.steps.length && (
            <EmptyRecords
              iconType={'optimization'}
              message={this.props.intl.formatMessage(messages.sectionEmptyVisitAnalyzer)}
            />
          )}
          <TimelineStepBuilder
            steps={this.state.steps}
            rendering={rendering}
            stepManagement={stepManagement}
            maxSteps={5}
          />
        </div>
      </React.Fragment>
    );
  };

  render() {
    return (
      <div className={'mcs-visitAnalyzerFormSection_section'}>
        {this.getActivityAnalyzerRecords()}
      </div>
    );
  }
}

export default compose<VisitAnalyzerSectionProps, Props>(
  injectIntl,
  injectDrawer,
)(VisitAnalyzerSection);
