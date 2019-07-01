export default interface MlAlgorithmResource {
    id: string;
    organisation_id: string;
    notebook_uri?: string;
    name?: string;
    description?: string;
    last_updated_date: number;
  }