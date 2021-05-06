import { ThemeColorsShape } from '../containers/Helpers/injectThemeColors';
import { ImportExecution } from '../models/imports/imports';
import { DatamartReplicationJobExecutionResource } from '../models/settings/settings';

export function getExecutionInfo(
  execution: ImportExecution | DatamartReplicationJobExecutionResource,
  colors: ThemeColorsShape,
) {
  const tasks = execution.num_tasks ? execution.num_tasks : 0;
  const completedTasks = execution.completed_tasks ? execution.completed_tasks : 0;

  const setColor = (status: string) => {
    switch (status) {
      case 'RUNNING':
      case 'PENDING':
        return colors['mcs-primary'];
      case 'SUCCESS':
        return colors['mcs-success'];
      case 'SUCCEEDED':
        return colors['mcs-success'];
      case 'FAILED':
        return colors['mcs-error'];
      default:
        return colors['mcs-primary'];
    }
  };
  return {
    percent: tasks ? completedTasks / tasks : 0,
    color: setColor(execution.status),
  };
}
