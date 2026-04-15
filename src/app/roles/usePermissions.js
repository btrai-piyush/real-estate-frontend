import { rolePermissions } from "./rolePermissions";

export default function usePermissions(role){

    const hasPermission=(permission)=>{
        if(role === null || role === undefined) return false;
        
        const permissions=rolePermissions[role] || [];
        return permissions.includes(permission);
    };

    return {hasPermission};
}