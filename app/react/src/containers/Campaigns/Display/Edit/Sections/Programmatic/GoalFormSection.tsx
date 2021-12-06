import * as React from 'react';
import { compose } from 'recompose';
import { Modal } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { WrappedFieldArrayProps } from 'redux-form';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import SyntaxHighlighter from 'react-syntax-highlighter';

import messages from '../../messages';
import { injectDrawer } from '../../../../../../components/Drawer';
import { EditDisplayCampaignRouteMatchParam, GoalFieldModel, isGoalFormData } from '../../domain';
import GoalSelector, { GoalSelectorProps } from '../../../../Common/GoalSelector';
import { InjectedDatamartProps, injectDatamart } from '../../../../../Datamart';
import { Button, McsIcon } from '@mediarithmics-private/mcs-components-library';
import { RelatedRecords, RecordElement } from '../../../../../../components/RelatedRecord';
import { GoalResource, GoalSelectionCreateRequest } from '../../../../../../models/goal';
import { FormSection } from '../../../../../../components/Form';
import { ReduxFormChangeProps } from '../../../../../../utils/FormHelper';
import { Task, executeTasksInSequence } from '../../../../../../utils/PromiseHelper';
import { isGoalResource, INITIAL_GOAL_FORM_DATA, GoalFormData } from '../../../../Goal/Edit/domain';
import GoalFormContainer, { GoalFormContainerProps } from '../../../../Goal/Edit/GoalFormContainer';
import GoalFormLoader, { GoalFormLoaderProps } from '../../../../Goal/Edit/GoalFormLoader';
import { IGoalFormService } from '../../../../Goal/Edit/GoalFormService';
import { InjectedDrawerProps } from '../../../../../../components/Drawer/injectDrawer';
import { lazyInject } from '../../../../../../config/inversify.config';
import { TYPES } from '../../../../../../constants/types';
import { generateFakeId } from '../../../../../../utils/FakeIdHelper';
import { IGoalService } from '../../../../../../services/GoalService';

export interface GoalFormSectionProps extends ReduxFormChangeProps {
  small?: boolean;
  disabled?: boolean;
}

type Props = GoalFormSectionProps &
  InjectedIntlProps &
  InjectedDatamartProps &
  InjectedDrawerProps &
  RouteComponentProps<EditDisplayCampaignRouteMatchParam> &
  WrappedFieldArrayProps<GoalFieldModel>;

interface State {
  visible: boolean;
  loading: boolean;
  field?: GoalFieldModel;
}

class GoalFormSection extends React.Component<Props, State> {
  @lazyInject(TYPES.IGoalFormService)
  private _goalFormService: IGoalFormService;

  @lazyInject(TYPES.IGoalService)
  private _goalService: IGoalService;

  constructor(props: Props) {
    super(props);
    this.state = {
      visible: false,
      loading: false,
    };
  }

  openGoalSelector = () => {
    const { fields } = this.props;

    const selectedGoalIds = getExistingGoalIds(fields.getAll());

    const handleSave = (goals: GoalResource[]) => {
      this.updateExistingGoals(goals);
      this.props.closeNextDrawer();
    };

    const goalSelectorProps: GoalSelectorProps = {
      selectedGoalIds,
      close: this.props.closeNextDrawer,
      save: handleSave,
    };

    const options = {
      additionalProps: goalSelectorProps,
    };

    this.props.openNextDrawer<GoalSelectorProps>(GoalSelector, options);
  };

  updateExistingGoals = (goals: GoalResource[]) => {
    const { fields, formChange } = this.props;

    const newGoalIds = goals.map(goal => goal.id);

    const keptFields: GoalFieldModel[] = [];
    fields.getAll().forEach(field => {
      if (!isGoalFormData(field.model)) {
        if (newGoalIds.includes(field.model.goal_id)) {
          keptFields.push(field);
        }
      } else if (isGoalResource(field.model.goal)) {
        if (newGoalIds.includes(field.model.goal.id)) {
          keptFields.push(field);
        }
      } else if (isGoalFormData(field.model)) {
        keptFields.push(field);
      }
    });
    formChange((fields as any).name, keptFields);

    const existingGoalIds = getExistingGoalIds(fields.getAll());
    const newFields: GoalFieldModel[] = [];
    goals
      .filter(goal => !existingGoalIds.includes(goal.id))
      .forEach(goal => {
        const model: GoalSelectionCreateRequest = {
          goal_id: goal.id,
          goal_selection_type: 'CONVERSION',
          default: true,
        };
        return this._goalService
          .getGoal(model.goal_id)
          .then(resp => resp.data)
          .then(goalResource => {
            const triggerMode = goalResource.new_query_id ? 'QUERY' : 'PIXEL';
            newFields.push({
              key: generateFakeId(),
              model,
              meta: { name: goal.name, triggerMode: triggerMode },
            });
          })
          .then(() => {
            formChange((fields as any).name, keptFields.concat(newFields));
          });
      });
  };

  updateGoals = (goalFormData: GoalFormData, fieldKey?: string) => {
    const { fields, formChange } = this.props;

    const newFields: GoalFieldModel[] = [];
    if (fieldKey) {
      fields.getAll().forEach(field => {
        if (fieldKey === field.key) {
          newFields.push({
            key: fieldKey,
            model: goalFormData,
            meta: {
              name: goalFormData.goal.name || '',
              triggerMode: goalFormData.triggerType,
            },
          });
        } else {
          newFields.push(field);
        }
      });
    } else {
      newFields.push(...fields.getAll());
      newFields.push({
        key: generateFakeId(),
        model: goalFormData,
        meta: {
          name: goalFormData.goal.name || '',
          triggerMode: goalFormData.triggerType,
        },
      });
    }

    formChange((fields as any).name, newFields);
  };

  openGoalForm = (field?: GoalFieldModel) => {
    const {
      intl: { formatMessage },
    } = this.props;

    const breadCrumbPaths = [
      field && field.meta.name
        ? formatMessage(messages.editGoal, {
            goalName: field.meta.name,
          })
        : formatMessage(messages.newGoal),
    ];

    const handleOnSubmit = (formData: GoalFormData) => {
      this.updateGoals(formData, field && field.key);
      this.props.closeNextDrawer();
    };

    const props: GoalFormContainerProps = {
      breadCrumbPaths,
      close: this.props.closeNextDrawer,
      onSubmit: handleOnSubmit,
    };

    const options = {
      additionalProps: props,
    };

    let FormComponent = GoalFormContainer;

    if (!field) {
      props.initialValues = {
        ...INITIAL_GOAL_FORM_DATA,
      };
    } else if (isGoalFormData(field.model)) {
      props.initialValues = field.model;
    } else {
      // TODO fix this ugly cast
      FormComponent = GoalFormLoader;
      (props as GoalFormLoaderProps).goalId = field.model.goal_id;
    }

    this.props.openNextDrawer<GoalFormContainerProps>(FormComponent, options);
  };

  getPixelSnippet = (field: GoalFieldModel) => {
    const {
      intl: { formatMessage },
    } = this.props;

    return (
      <Button
        onClick={this.handleCodeSnippetClick(field)}
        title={formatMessage(messages.getCodeSnippet)}
      >
        <McsIcon type='code' className='big' />
      </Button>
    );
  };

  updateFields = (goalId: string, goalName: string) => {
    const { fields, formChange } = this.props;
    const { field } = this.state;
    const newFields: GoalFieldModel[] = [];
    const tasks: Task[] = [];
    fields.getAll().forEach(_field => {
      tasks.push(() => {
        return this._goalService
          .getGoal(goalId)
          .then(resp => resp.data)
          .then(goalResource => {
            if (field && _field.key === field.key) {
              newFields.push({
                key: generateFakeId(),
                model: {
                  goal_id: goalId,
                  goal_selection_type: 'CONVERSION',
                  default: true,
                },
                meta: {
                  name: goalName,
                  triggerMode: goalResource.new_query_id ? 'QUERY' : 'PIXEL',
                },
              });
            } else {
              newFields.push(_field);
            }
          });
      });
    });
    return executeTasksInSequence(tasks).then(() => {
      formChange((fields as any).name, newFields);
    });
  };

  goalPixelModalOnOk = () => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;
    const { field } = this.state;
    if (field && field.model) {
      this.setState({
        loading: true,
      });
      const goalFormData = field.model as GoalFormData;
      this._goalFormService.saveGoal(organisationId, goalFormData).then(goalResource => {
        this.setState({
          loading: false,
          visible: false,
        });
        this.showPixelSnippet(goalResource.id, () =>
          this.updateFields(goalResource.id, goalResource.name),
        );
      });
    }
  };

  getGoalRecords = () => {
    const { fields } = this.props;

    const getGoalName = (field: GoalFieldModel) => field.meta.name;

    return fields.getAll().map((field, index) => {
      const displayPixelSnippet = field.meta.triggerMode === 'PIXEL';
      const handleRemove = () => fields.remove(index);
      const handleEdit = () => this.openGoalForm(field);
      return (
        <RecordElement
          key={field.key}
          recordIconType={'goals'}
          record={field}
          title={getGoalName}
          additionalActionButtons={displayPixelSnippet ? this.getPixelSnippet : undefined}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      );
    });
  };

  closeGoalPixelModal = () => {
    this.setState({
      visible: false,
    });
  };

  displayGoalPixelModal = (field: GoalFieldModel) => {
    this.setState({
      visible: true,
      field: field,
    });
  };

  showPixelSnippet = (goalId: string, handleOnOk?: () => void) => {
    const {
      intl: { formatMessage },
      datamart,
    } = this.props;
    Modal.info({
      width: 520,
      title: formatMessage(messages.goalPixelModalTitle),
      content: (
        <div>
          <p>{formatMessage(messages.goalPixelModalContent)}</p>
          <br />
          <SyntaxHighlighter language='html' style={docco}>
            {`<img style="display:none" src="https://events.mediarithmics.com/v1/touches/pixel?$ev=$conversion&$dat_token=${datamart.token}&$goal_id=${goalId}" />`}
          </SyntaxHighlighter>
        </div>
      ),
      onOk() {
        if (handleOnOk) handleOnOk();
      },
    });
  };

  handleCodeSnippetClick = (field: GoalFieldModel) => () => {
    if (!isGoalFormData(field.model)) {
      this.showPixelSnippet(field.model.goal_id);
    } else if (isGoalResource(field.model.goal)) {
      this.showPixelSnippet(field.model.goal.id);
    } else {
      this.displayGoalPixelModal(field);
    }
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    const { visible, loading } = this.state;

    return (
      <div id='goals' className='mcs-modal_container'>
        <FormSection
          dropdownItems={[
            {
              id: messages.dropdownNew.id,
              message: messages.dropdownNew,
              onClick: this.openGoalForm,
            },
            {
              id: messages.dropdownAddExisting.id,
              message: messages.dropdownAddExisting,
              onClick: this.openGoalSelector,
            },
          ]}
          subtitle={messages.sectionSubtitle2}
          title={messages.sectionTitle2}
        />

        <RelatedRecords
          emptyOption={{
            iconType: 'goals',
            message: formatMessage(messages.campaignGoalSelectionEmpty),
          }}
        >
          {this.getGoalRecords()}
        </RelatedRecords>
        <Modal
          title={formatMessage(messages.goalPixelModalTitle)}
          visible={visible}
          onOk={this.goalPixelModalOnOk}
          confirmLoading={loading}
          onCancel={this.closeGoalPixelModal}
        >
          <p>{formatMessage(messages.goalPixelModalSaveGoal)}</p>
        </Modal>
      </div>
    );
  }
}

export default compose<Props, GoalFormSectionProps>(
  injectIntl,
  withRouter,
  injectDatamart,
  injectDrawer,
)(GoalFormSection);

function getExistingGoalIds(goalFields: GoalFieldModel[]) {
  const existingGoalIds: string[] = [];
  goalFields.forEach(field => {
    if (!isGoalFormData(field.model)) {
      existingGoalIds.push(field.model.goal_id);
    } else if (isGoalResource(field.model.goal)) {
      existingGoalIds.push(field.model.goal.id);
    }
  });
  return existingGoalIds;
}
