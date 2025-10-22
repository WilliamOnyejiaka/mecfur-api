import {HttpStatus} from "../types/constants";
import BaseService from "./Service";
import {db} from "../drizzle/drizzle";
import {mechanics, users} from "../drizzle/schema";
import {and, eq, sql} from "drizzle-orm";

export default class Job extends BaseService {

    public async nearByMechanics(lon: number, lat: number, radiusKm: number, page: number, limit: number) {
        try {
            const offset = (page - 1) * limit;

            const resultsQuery = db
                .select({
                    id: mechanics.id,
                    firstName: mechanics.firstName,
                    lastName: mechanics.lastName,
                    email: mechanics.email,
                    location: mechanics.location,
                    profilePicture: mechanics.profilePicture,
                    skills: mechanics.skills,
                    phone: mechanics.phone
                })
                .from(mechanics)
                .where(
                    // Raw SQL for spherical distance (in meters; divide by 1000 for km)
                    sql`ST_DistanceSphere
                        (${mechanics.location}, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326))
                        <=
                        ${radiusKm * 1000}`
                )
                .orderBy(sql`ST_DistanceSphere
                    (${mechanics.location}, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326))`)
                .limit(limit)
                .offset(offset);

            const countQuery = db
                .select({
                    count: sql`COUNT
                        (*)`
                })
                .from(mechanics)
                .where(
                    sql`ST_DistanceSphere
                    ( ${mechanics.location},
                        ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326))
                    <=
                    ${radiusKm * 1000}`
                );

            const [results, [{count}]] = await Promise.all([resultsQuery, countQuery]);
            const data = {results, count}
            return this.responseData(HttpStatus.OK, true, "Mechanics retrieved successfully.", data);

        } catch (error) {
            return this.handleDrizzleError(error);
        }
    }

    public async nearByMechanicsWithSkill(lon: number, lat: number, radiusKm: number, page: number, limit: number, desiredSkills: string[] = []) {
        try {
            const offset = (page - 1) * limit;

            // language=SQL format=false
            const resultsQuery = db
                .select({
                    id: mechanics.id,
                    firstName: mechanics.firstName,
                    lastName: mechanics.lastName,
                    email: mechanics.email,
                    location: mechanics.location,
                    profilePicture: mechanics.profilePicture,
                    skills: mechanics.skills,
                    phone: mechanics.phone
                })
                .from(mechanics)
                .where(
                    and(
                        // Raw SQL for spherical distance (in meters; divide by 1000 for km)
                        sql`ST_DistanceSphere
                        (${mechanics.location}, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326))
                        <=
                        ${radiusKm * 1000}`,
                        // Filter for mechanics with at least one matching skill
                        desiredSkills.length > 0
                            ? sql`${mechanics.skills} && ${desiredSkills}`
                            : undefined
                    )
                )
                .orderBy(sql`ST_DistanceSphere
                (${mechanics.location}, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326))`)
                .limit(limit)
                .offset(offset);

            const countQuery = db
                .select({
                    count: sql`COUNT
                        (*)`
                })
                .from(mechanics)
                .where(
                    and(
                        sql`ST_DistanceSphere
                            (${mechanics.location}, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326))
                            <=
                            ${radiusKm * 1000}`,
                        desiredSkills.length > 0
                            ? sql`${mechanics.skills} &&
                                ${desiredSkills}`
                            : undefined
                    )
                );

            const [results, [{count}]] = await Promise.all([resultsQuery, countQuery]);
            const data = {results, count};
            return this.responseData(HttpStatus.OK, true, `Mechanics retrieved successfully.`, data);

        } catch (error) {
            return this.handleDrizzleError(error);
        }
    }
}