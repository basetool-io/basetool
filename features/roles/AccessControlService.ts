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

  setPermissionsForRecord() {
    if(this.getRoleAbilityLogic(this.role, "can_create")) this.ac.grant(this.roleName()).createAny("record");
    if(this.getRoleAbilityLogic(this.role, "can_read")) this.ac.grant(this.roleName()).readAny("record");
    if(this.getRoleAbilityLogic(this.role, "can_update")) this.ac.grant(this.roleName()).updateAny("record");
    if(this.getRoleAbilityLogic(this.role, "can_delete")) this.ac.grant(this.roleName()).deleteAny("record");
  }

  roleName() {
    if(this.role) return this.role.name;

    return "";
  }

  getRoleAbilityLogic(role: Role, ability: string) {
    return isEmpty(role.options) || (role.options.abilities && role.options.abilities.includes(ability));
  }

  createAny(record: string) {
    return this.ac.can(this.roleName()).createAny(record);
  }

  readAny(record: string) {
    return this.ac.can(this.roleName()).readAny(record);
  }

  updateAny(record: string) {
    return this.ac.can(this.roleName()).updateAny(record);
  }

  deleteAny(record: string) {
    return this.ac.can(this.roleName()).deleteAny(record);
  }
}
