export interface IPermissionDefinition {
  key: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  scope: string;
  category: string;
}
