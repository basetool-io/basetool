import { AccessControl, Permission } from 'accesscontrol';
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
  private falsePermission: Permission = {granted: false} as Permission;

  constructor(role: Role) {
    this.ac = new AccessControl();
    this.role = role;

    if(role) {
      this.ac.grant(this.roleName);

      this.setPermissionsForRecord();
    }
  }

  get roleName(): string {
    if(!this.role) return "";

    return this.role?.name;
  }

  public hasRole(roleName: string): boolean {
    if(!this.role) return false;

    return this.roleName === roleName;
  }

  public createAny(record: string): Permission {
    if(!this.role) return this.falsePermission;

    return this.ac.can(this.roleName).createAny(record);
  }

  public readAny(record: string): Permission {
    if(!this.role) return this.falsePermission;

    return this.ac.can(this.roleName).readAny(record);
  }

  public updateAny(record: string): Permission {
    if(!this.role) return this.falsePermission;

    return this.ac.can(this.roleName).updateAny(record);
  }

  public deleteAny(record: string): Permission {
    if(!this.role) return this.falsePermission;

    return this.ac.can(this.roleName).deleteAny(record);
  }

  private getRoleAbilityLogic(ability: string): boolean | undefined {
    if(!this.role) return false;

    return isEmpty(this.role.options) || (this.role.options.abilities && this.role.options.abilities.includes(ability));
  }

  private setPermissionsForRecord(): void {
    if(this.getRoleAbilityLogic("can_create")) this.ac.grant(this.roleName).createAny("record");
    if(this.getRoleAbilityLogic("can_read")) this.ac.grant(this.roleName).readAny("record");
    if(this.getRoleAbilityLogic("can_update")) this.ac.grant(this.roleName).updateAny("record");
    if(this.getRoleAbilityLogic("can_delete")) this.ac.grant(this.roleName).deleteAny("record");
  }
}
