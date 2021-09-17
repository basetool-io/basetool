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
  public roleName;

  constructor(role: Role) {
    this.ac = new AccessControl();
    this.roleName = role.name;

    this.ac.grant(this.roleName);

    if(this.getRoleAbilityLogic(role, "can_create")) this.ac.grant(this.roleName).createAny("record");
    if(this.getRoleAbilityLogic(role, "can_read")) this.ac.grant(this.roleName).readAny("record");
    if(this.getRoleAbilityLogic(role, "can_update")) this.ac.grant(this.roleName).updateAny("record");
    if(this.getRoleAbilityLogic(role, "can_delete")) this.ac.grant(this.roleName).deleteAny("record");
  }

  getRoleAbilityLogic(role: Role, ability: string) {
    return isEmpty(role.options) || isEmpty(role.options?.abilities) || (role.options.abilities && role.options.abilities.includes(ability));
  }

  createAny(record: string) {
    return this.ac.can(this.roleName).createAny(record);
  }

  readAny(record: string) {
    return this.ac.can(this.roleName).readAny(record);
  }

  updateAny(record: string) {
    return this.ac.can(this.roleName).updateAny(record);
  }

  deleteAny(record: string) {
    return this.ac.can(this.roleName).deleteAny(record);
  }
}
