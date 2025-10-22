
import { HttpStatus} from "../types/constants";
import BaseService from "./Service";
import {db} from "../drizzle/drizzle";
import {users} from "../drizzle/schema";
import {eq} from "drizzle-orm";

export default class User extends BaseService {

    public async profile(userId: string) {
        try {

            let result = await db.select().from(users).where(eq(users.id, userId));
            if (result.length > 0) {
                const user = result[0];
                return this.responseData(HttpStatus.OK,false,"User was retrieved successfully",{...user,password: undefined});
            }
            return this.responseData(HttpStatus.NOT_FOUND, true, `User was not found.`);

        } catch (error) {
            return this.handleDrizzleError(error);
        }
    }
}