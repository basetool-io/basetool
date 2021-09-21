import { AccessControl } from 'accesscontrol';
import { isEmpty } from 'lodash';

export type Role = {
  name: string;
  options: {
    abilities?: string[];
  }
}

export default class AccessControlService {
  public ac;
  public role;

  constructor(role: Role) {
    this.ac = new AccessControl();
    this.role = role;

    this.ac.grant(role.name);

    this.setPermissionsForRecord();
  }

  get roleName() {
    return this.role.name;
  }

  public hasRole(roleName: string) {
    return this.roleName === roleName;
  }

  public createAny(record: string) {
    return this.ac.can(this.roleName).createAny(record);
  }

  public readAny(record: string) {
    return this.ac.can(this.roleName).readAny(record);
  }

  public updateAny(record: string) {
    return this.ac.can(this.roleName).updateAny(record);
  }

  public deleteAny(record: string) {
    return this.ac.can(this.roleName).deleteAny(record);
  }

  private getRoleAbilityLogic(ability: string) {
    return isEmpty(this.role.options) || (this.role.options.abilities && this.role.options.abilities.includes(ability));
  }

  private setPermissionsForRecord() {
    if(this.getRoleAbilityLogic("can_create")) this.ac.grant(this.roleName).createAny("record");
    if(this.getRoleAbilityLogic("can_read")) this.ac.grant(this.roleName).readAny("record");
    if(this.getRoleAbilityLogic("can_update")) this.ac.grant(this.roleName).updateAny("record");
    if(this.getRoleAbilityLogic("can_delete")) this.ac.grant(this.roleName).deleteAny("record");
  }
}
