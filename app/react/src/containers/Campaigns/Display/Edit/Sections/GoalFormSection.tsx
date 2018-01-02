import * as React from 'react';
import { compose } from 'recompose';
import cuid from 'cuid';
import { WrappedFieldArrayProps } from 'redux-form';

import messages from '../messages';
import { DrawableContentProps } from '../../../../../components/Drawer/index';
import { GoalFieldModel, isGoalFormData } from '../domain';
import GoalSelector, {
  GoalSelectorProps,
} from '../../../Common/GoalSelector';
import {
  RelatedRecords,
  RecordElement,
} from '../../../../../components/RelatedRecord';
import { GoalResource } from '../../../../../models/goal';
import { FormSection } from '../../../../../components/Form';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { ReduxFormChangeProps } from '../../../../../utils/FormHelper';
import { isGoalResource, GoalFormData, INITIAL_GOAL_FORM_DATA } from '../../../Goal/Edit/domain';
import GoalForm, { GoalFormProps } from '../../../Goal/Edit/GoalForm';
import { GoalFormLoaderProps } from '../../../Goal/Edit/GoalFormLoader';

export interface GoalFormSectionProps extends DrawableContentProps, ReduxFormChangeProps {}

type Props = GoalFormSectionProps &
  InjectedIntlProps &
  WrappedFieldArrayProps<GoalFieldModel>;

interface State {
  showPixelModal: boolean;
}

class GoalFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { showPixelModal: false };
  }

  openGoalSelector = () => {
    const { fields, openNextDrawer, closeNextDrawer } = this.props;

    const selectedGoalIds = getExistingGoalIds(fields.getAll());

    const handleSave = (goals: GoalResource[]) => {
      this.updateExistingGoals(goals);
      closeNextDrawer();
    };

    const goalSelectorProps: GoalSelectorProps = {
      selectedGoalIds,
      close: closeNextDrawer,
      save: handleSave,
    };

    const options = {
      additionalProps: goalSelectorProps,
    };

    openNextDrawer<GoalSelectorProps>(GoalSelector, options);
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
      .map(goal => ({
        key: cuid(),
        model: {
          goal_id: goal.id,
        },
        meta: { name: goal.name },
      }));

    formChange((fields as any).name, keptFields.concat(newFields));
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

  openGoalForm = (field?: GoalFieldModel) => {
    const {
      intl: { formatMessage },
      openNextDrawer,
      closeNextDrawer,
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

    const handleOnSubmit = (formData: GoalFormData) => {
      this.updateGoals(formData, field && field.key);
      closeNextDrawer();
    };

    const props: GoalFormProps = {
      breadCrumbPaths,
      closeNextDrawer,
      openNextDrawer,
      close: closeNextDrawer,
      onSubmit: handleOnSubmit,
    };

    if (!field) {
      props.initialValues = INITIAL_GOAL_FORM_DATA;
    } else if (isGoalFormData(field.model)) {
      props.initialValues = field.model;
    } else {
      // TODO fix this ugly cast
      (props as GoalFormLoaderProps).goalId = field.model.goal_id;
    }

    const options = {
      additionalProps: props,
    };

    openNextDrawer<GoalFormProps>(GoalForm, options);
  };

  getPixelTag = (field: GoalFieldModel) => {
    return <span>get pixel</span>;
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
          additionalActionButtons={this.getPixelTag}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      );
    });
  };

  render() {
    const { intl: { formatMessage } } = this.props;

    const pixelModal = 'pixelModal';

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
            iconType: "goals",
            message: formatMessage(messages.campaignGoalSelectionEmpty),
          }}
        >
          {this.getGoalRecords()}
        </RelatedRecords>
        {pixelModal}
      </div>
    );
  }
}

export default compose<Props, GoalFormSectionProps>(injectIntl)(GoalFormSection);

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
