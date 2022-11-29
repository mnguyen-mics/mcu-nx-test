export default interface MlModelResource {
  id: string;
  organisation_id: string;
  ml_algorithm_id: string;
  name?: string;
  model_uri?: string;
  html_notebook_result_uri?: string;
  notebook_uri?: string;
  status: string;
  last_updated_date: number;
}
