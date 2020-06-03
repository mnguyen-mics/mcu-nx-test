export default interface UserChoiceResource {
  $user_point_id?: string;
  $user_agent_id?: string;
  $compartment_id?: string;
  $user_account_id?: string;
  $email_hash?: string;
  $creation_ts: number;
  $channel_id?: string;
  $processing_id?: string;
  $choice_ts: number;
  $choice_acceptance_value: boolean;
  $choice_source_id?: string;
  $choice_source_token?: string;
  // Custom fields
  [key: string]: any;
}