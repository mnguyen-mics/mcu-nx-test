import * as React from 'react';
import { compose } from 'recompose';
import cuid from 'cuid';
import { Modal } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { WrappedFieldArrayProps } from 'redux-form';

import messages from '../messages';
import { injectDrawer } from '../../../../../components/Drawer/index';
import {
  EditDisplayCampaignRouteMatchParam,
  GoalFieldModel,
  isGoalFormData,
} from '../domain';
import GoalSelector, { GoalSelectorProps } from '../../../Common/GoalSelector';
import { InjectedDatamartProps, injectDatamart } from '../../../../Datamart';
import { McsIcon, ButtonStyleless } from '../../../../../components';
import {
  RelatedRecords,
  RecordElement,
} from '../../../../../components/RelatedRecord';
import {
  GoalResource,
  GoalSelectionCreateRequest,
} from '../../../../../models/goal';
import { FormSection } from '../../../../../components/Form';
import { ReduxFormChangeProps } from '../../../../../utils/FormHelper';
import {
  isGoalResource,
  INITIAL_GOAL_FORM_DATA,
  NewGoalFormData,
} from '../../../Goal/Edit/domain';
import GoalForm, { GoalFormProps } from '../../../Goal/Edit/GoalForm';
import GoalFormLoader, {
  GoalFormLoaderProps,
} from '../../../Goal/Edit/GoalFormLoader';
import GoalFormService from '../../../Goal/Edit/GoalFormService';
import { InjectDrawerProps } from '../../../../../components/Drawer/injectDrawer';

export interface GoalFormSectionProps extends ReduxFormChangeProps {}

type Props = GoalFormSectionProps &
  InjectedIntlProps &
  InjectedDatamartProps &
  InjectDrawerProps &
  RouteComponentProps<EditDisplayCampaignRouteMatchParam> &
  WrappedFieldArrayProps<GoalFieldModel>;

class GoalFormSection extends React.Component<Props> {
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
      }
    });

    const existingGoalIds = getExistingGoalIds(fields.getAll());
    const newFields = goals
      .filter(goal => !existingGoalIds.includes(goal.id))
      .map(goal => {
        const model: GoalSelectionCreateRequest = {
          goal_id: goal.id,
          goal_selection_type: 'CONVERSION',
          default: true,
        };
        return {
          key: cuid(),
          model,
          meta: { name: goal.name },
        };
      });

    formChange((fields as any).name, keptFields.concat(newFields));
  };

  updateGoals = (goalFormData: NewGoalFormData, fieldKey?: string) => {
    const { fields, formChange } = this.props;

    const newFields: GoalFieldModel[] = [];
    if (fieldKey) {
      fields.getAll().forEach(field => {
        if (fieldKey === field.key) {
          newFields.push({
            key: fieldKey,
            model: goalFormData,
            meta: { name: goalFormData.goal.name || '' },
          });
        } else {
          newFields.push(field);
        }
      });
    } else {
      newFields.push(...fields.getAll());
      newFields.push({
        key: cuid(),
        model: goalFormData,
        meta: { name: goalFormData.goal.name || '' },
      });
    }

    formChange((fields as any).name, newFields);
  };

  updateQueryContainer = () => {
    console.log('UUUUPDATE');
  }

  openGoalForm = (field?: GoalFieldModel) => {
    const {
      intl: { formatMessage },
    } = this.props;

    const breadCrumbPaths = [
      {
        name:
          field && field.meta.name
            ? formatMessage(messages.editGoal, {
                goalName: field.meta.name,
              })
            : formatMessage(messages.newGoal),
      },
    ];

    const handleOnSubmit = (formData: NewGoalFormData) => {
      this.updateGoals(formData, field && field.key);
      this.props.closeNextDrawer();
    };

    const props: GoalFormProps = {
      breadCrumbPaths,
      close: this.props.closeNextDrawer,
      onSubmit: handleOnSubmit,
      updateQueryContainer: this.updateQueryContainer,
    };

    const options = {
      additionalProps: props,
    };

    let FormComponent = GoalForm;

    if (!field) {
      props.initialValues = INITIAL_GOAL_FORM_DATA;
    } else if (isGoalFormData(field.model)) {
      props.initialValues = field.model;
    } else {
      // TODO fix this ugly cast
      FormComponent = GoalFormLoader;
      (props as GoalFormLoaderProps).goalId = field.model.goal_id;
    }

    this.props.openNextDrawer<GoalFormProps>(FormComponent, options);
  };

  getPixelSnippet = (field: GoalFieldModel) => {
    const {
      intl: { formatMessage },
      datamart,
      fields,
      formChange,
    } = this.props;

    const showPixelSnippet = (goalId: string, handleOnOk?: () => void) => {
      Modal.info({
        width: 520,
        title: formatMessage(messages.goalPixelModalTitle),
        content: (
          <div>
            <p>{formatMessage(messages.goalPixelModalContent)}</p>
            <br />
            <pre>
              <code
              >{`<img src="//events.mediarithmics.com/v1/touches/pixel?$ev=$conversion&$dat_token=${
                datamart.token
              }&$goal_id=${goalId}" />`}</code>
            </pre>
          </div>
        ),
        onOk() {
          if (handleOnOk) handleOnOk();
        },
      });
    };

    const updateFields = (goalId: string, goalName: string) => {
      const newFields: GoalFieldModel[] = [];
      fields.getAll().forEach(_field => {
        if (_field.key === field.key) {
          newFields.push({
            key: cuid(),
            model: {
              goal_id: goalId,
              goal_selection_type: 'CONVERSION',
              default: true,
            },
            meta: { name: goalName },
          });
        } else {
          newFields.push(_field);
        }
      });
      formChange((fields as any).name, newFields);
    };

    const handleOnClick = () => {
      if (!isGoalFormData(field.model)) {
        showPixelSnippet(field.model.goal_id);
      } else if (isGoalResource(field.model.goal)) {
        showPixelSnippet(field.model.goal.id);
      } else {
        //
        const goalFormData = field.model;
        const organisationId = this.props.match.params.organisationId;
        Modal.confirm({
          title: formatMessage(messages.goalPixelModalTitle),
          content: <div>{formatMessage(messages.goalPixelModalSaveGoal)}</div>,
          onOk() {
            GoalFormService.saveGoal(organisationId, goalFormData).then(
              goalResource => {
                showPixelSnippet(goalResource.id, () =>
                  updateFields(goalResource.id, goalResource.name),
                );
              },
            );
          },
        });
      }
    };

    return (
      <ButtonStyleless onClick={handleOnClick}>
        <McsIcon type="settings" className="big" />
      </ButtonStyleless>
    );
  };

  getGoalRecords = () => {
    const { fields } = this.props;

    const getGoalName = (field: GoalFieldModel) => field.meta.name;

    return fields.getAll().map((field, index) => {
      const handleRemove = () => fields.remove(index);
      const handleEdit = () => this.openGoalForm(field);
      return (
        <RecordElement
          key={field.key}
          recordIconType={'goals'}
          record={field}
          title={getGoalName}
          additionalActionButtons={this.getPixelSnippet}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      );
    });
  };

  render() {
    const { intl: { formatMessage } } = this.props;

    return (
      <div id="goals">
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
