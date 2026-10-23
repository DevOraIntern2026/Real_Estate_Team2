import { OWNER_PATHS } from "../../../constants/paths";

export const ownerPropertyPath = (id: string) => `${OWNER_PATHS.properties}/${id}`;
export const ownerPropertyEditPath = (id: string) => `${ownerPropertyPath(id)}/edit`; // form not designed yet
