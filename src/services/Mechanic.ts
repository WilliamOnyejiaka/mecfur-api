
import { HttpStatus} from "../types/constants";
import BaseService from "./Service";
import {db} from "../drizzle/drizzle";
import {mechanics} from "../drizzle/schema";
import {eq} from "drizzle-orm";

export default class Mechanic extends BaseService {

    public async profile(mechanicId: string) {
        try {

            let result = await db.select().from(mechanics).where(eq(mechanics.id, mechanicId));
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