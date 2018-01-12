export interface GoalResource {
    archived: boolean;
    default_goal_value: number;
    goal_value_currency: string;
    id: string;
    name: string;
    new_query_id?: string;
    organisation_id: string;
    query_id?: string;
    technical_name: string;
}