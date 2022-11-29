export default interface ApiTokenResource {
  id: string;
  name?: string;
  creation_date: number;
  expiration_date: number;
  value: string;
}
