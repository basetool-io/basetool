import { AccessControl } from 'accesscontrol';
import { isEmpty } from 'lodash';

export type Role = {
  name: string;
  options: {
    abilities: string[];
  }
}

export default class ACLController {

  public ac;
  public roleName;

  constructor(role: Role) {
    this.ac = new AccessControl();
    this.roleName = role.name;

    this.ac.grant(this.roleName);

    if(isEmpty(role.options) || isEmpty(role.options?.abilities) || role.options.abilities.includes("can_create"))
      this.ac.grant(this.roleName).createAny("record");
    if(isEmpty(role.options) || isEmpty(role.options?.abilities) || role.options.abilities.includes("can_read"))
      this.ac.grant(this.roleName).readAny("record");
    if(isEmpty(role.options) || isEmpty(role.options?.abilities) || role.options.abilities.includes("can_update"))
      this.ac.grant(this.roleName).updateAny("record");
    if(isEmpty(role.options) || isEmpty(role.options?.abilities) || role.options.abilities.includes("can_delete"))
      this.ac.grant(this.roleName).deleteAny("record");
  }

  canCreate() {
    const createPermission = this.ac.can(this.roleName).createAny("record");

    return createPermission.granted;
  }

  canRead() {
    const readPermission = this.ac.can(this.roleName).readAny("record");

    return readPermission.granted;
  }

  canUpdate() {
    const updatePermission = this.ac.can(this.roleName).updateAny("record");

    return updatePermission.granted;
  }

  canDelete() {
    const deletePermission = this.ac.can(this.roleName).deleteAny("record");

    return deletePermission.granted;
  }
}
