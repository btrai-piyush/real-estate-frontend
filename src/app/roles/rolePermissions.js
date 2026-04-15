import {ROLES} from "./roles";
import {PERMISSIONS} from "./permissions";

export const rolePermissions={
    [ROLES.ADMIN]:[
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.MANAGE_LISTINGS,
    ],
}