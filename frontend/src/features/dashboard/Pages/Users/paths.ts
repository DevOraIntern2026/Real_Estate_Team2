import { ADMIN_PATHS } from "../../constants/paths";

export const USERS_PATH = ADMIN_PATHS.users;
export const userProfilePath = (id: string) => `${USERS_PATH}/${id}`;
