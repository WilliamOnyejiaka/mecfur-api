import {HttpStatus, UserType} from "../types/constants";
import BaseService from "./Service";
import {db} from "../drizzle/drizzle";
import {jobRequests, jobs, mechanics, users} from "../drizzle/schema";
import {and, arrayContained, arrayContains, arrayOverlaps, eq, sql} from "drizzle-orm";
import {Queues} from "../config/bullMQ";
import notify from "./notify";

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
            const data = {records: results, pagination: this.createPagination(page, limit, Number(count))};
            return this.responseData(HttpStatus.OK, true, "Mechanics retrieved successfully.", data);

        } catch (error) {
            return this.handleDrizzleError(error);
        }
    }

    public async createJob(issueType: string,
                           issueDescription: string,
                           pickupLon: number,
                           pickupLat: number,
                           vehicleMake: string,
                           vehicleModel: string,
                           vehicleYear: number,
                           vehiclePlate: string,
                           pickupAddress: string,
                           userId: string
    ) {
        try {
            const result = (await db.insert(jobs).values({
                issueType,
                issueDescription,
                pickupLocation: sql`ST_SetSRID
                    (ST_MakePoint(${pickupLon}, ${pickupLat}), 4326)`,
                pickupAddress,
                vehicleMake,
                vehicleModel,
                vehicleYear,
                vehiclePlate,
                userId,
                status: "pending"
            }).returning())[0];

            const nearByMechanics = await this.nearByMechanicsWithSkill(pickupLon, pickupLat, 50, 1, 20, [issueType]);

            const mechanics = nearByMechanics.json.data?.records;
            if (mechanics && mechanics.length > 0) {
                await Queues.postJob.add('job', {
                    mechanics,
                    jobId: result.id,
                    jobDetails: result
                }, {jobId: `send-${Date.now()}`, priority: 1});
            }
            const data = {job: result, nearByMechanics: mechanics}

            return this.responseData(HttpStatus.OK, false, "Job was created successfully.", data);
        } catch (error) {
            return this.handleDrizzleError(error);
        }
    }

    public async acceptJob(requestId: string, mechanicId: string) {
        try {
            const request = await db
                .select()
                .from(jobRequests)
                .innerJoin(jobs, eq(jobRequests.jobId, jobs.id))
                .innerJoin(mechanics, eq(jobRequests.mechanicId, mechanics.id))
                .where(and(eq(jobRequests.id, requestId), eq(jobRequests.mechanicId, mechanicId)))
                .limit(1);
            console.log(request)
            if (!request[0]) return this.responseData(HttpStatus.NOT_FOUND, true, "Job was not found");

            const job = request[0].jobs;
            const status = request[0].jobs.status;
            if([
                'searching',
                'accepted',
                'mechanic_enroute',
                'in_progress',
                'completed',
                'cancelled'
            ].includes(status)) return this.responseData(HttpStatus.BAD_REQUEST, true, `This job cannot be accepted because it has a ${status} status.`);

            const updatedJob = (await db
                .update(jobs)
                .set({ status: "accepted",mechanicId: mechanicId })
                .where(eq(jobs.id, job.id))
                .returning())[0];

            const mechanic = request[0].mechanics;
            await notify({
                userId: job.userId,
                userType: UserType.User,
                type: 'job',
                data: {jobDetails: updatedJob,mechanic: mechanic},
            });

            return this.responseData(HttpStatus.OK, false, "Job was accepted successfully.", updatedJob);

        } catch (error) {
            return this.handleDrizzleError(error);
        }
    }

    public async nearByMechanicsWithSkill(
        lon: number,
        lat: number,
        radiusKm: number,
        page: number,
        limit: number,
        desiredSkills: string[] = []
    ) {
        try {
            const offset = (page - 1) * limit;

            // Build where conditions
            const whereConditions = [
                sql`ST_DistanceSphere
                    (${mechanics.location}, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326))
                    <=
                    ${radiusKm * 1000}`,
            ];

            // Add skills filter only if desiredSkills is not empty
            if (desiredSkills.length > 0) {
                whereConditions.push(arrayOverlaps(mechanics.skills, desiredSkills));
            }

            // Main query for mechanics
            const resultsQuery = db
                .select({
                    id: mechanics.id,
                    firstName: mechanics.firstName,
                    lastName: mechanics.lastName,
                    email: mechanics.email,
                    location: mechanics.location,
                    profilePicture: mechanics.profilePicture,
                    skills: mechanics.skills,
                    phone: mechanics.phone,
                })
                .from(mechanics)
                .where(and(...whereConditions))
                .orderBy(
                    sql`ST_DistanceSphere
                        (${mechanics.location}, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326))`
                )
                .limit(limit)
                .offset(offset);

            // Count query for pagination
            const countQuery = db
                .select({
                    count: sql`COUNT
                        (*)`,
                })
                .from(mechanics)
                .where(and(...whereConditions)); // Use same conditions as resultsQuery

            const [results, [{count}]] = await Promise.all([resultsQuery, countQuery]);
            const data = {
                records: results,
                pagination: this.createPagination(page, limit, Number(count)),
            };
            return this.responseData(HttpStatus.OK, true, `Mechanics retrieved successfully.`, data);
        } catch (error) {
            return this.handleDrizzleError(error);
        }
    }

    public async nearByMechanicsWithSkilld(lon: number, lat: number, radiusKm: number, page: number, limit: number, desiredSkills: string[] = []) {
        try {
            const offset = (page - 1) * limit;

            // language=SQL format=false
            // const resultsQuery = db
            //     .select({
            //         id: mechanics.id,
            //         firstName: mechanics.firstName,
            //         lastName: mechanics.lastName,
            //         email: mechanics.email,
            //         location: mechanics.location,
            //         profilePicture: mechanics.profilePicture,
            //         skills: mechanics.skills,
            //         phone: mechanics.phone
            //     })
            //     .from(mechanics)
            //     .where(
            //         and(
            //             // Raw SQL for spherical distance (in meters; divide by 1000 for km)
            //             sql`ST_DistanceSphere
            //             (${mechanics.location}, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326))
            //             <=
            //             ${radiusKm * 1000}`,
            //             // Filter for mechanics with at least one matching skill
            //             desiredSkills.length > 0
            //                 ? sql`${mechanics.skills} && ${desiredSkills}`
            //                 : undefined
            //         )
            //     )
            //     .orderBy(sql`ST_DistanceSphere
            //     (${mechanics.location}, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326))`)
            //     .limit(limit)
            //     .offset(offset);

            // Build where conditions
            const whereConditions = [
                sql`ST_DistanceSphere
                    (${mechanics.location}, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326))
                    <=
                    ${radiusKm * 1000}`,
            ];

            // Add skills filter only if desiredSkills is not empty
            if (desiredSkills.length > 0) {
                // whereConditions.push(sql`${mechanics.skills} && ${desiredSkills}`);
                whereConditions.push(arrayContained(mechanics.skills, desiredSkills));

            }

            console.log(whereConditions)

            // Construct the query
            const resultsQuery = db
                .select({
                    id: mechanics.id,
                    firstName: mechanics.firstName,
                    lastName: mechanics.lastName,
                    email: mechanics.email,
                    location: mechanics.location,
                    profilePicture: mechanics.profilePicture,
                    skills: mechanics.skills,
                    phone: mechanics.phone,
                })
                .from(mechanics)
                .where(and(...whereConditions))
                .orderBy(
                    sql`ST_DistanceSphere
                        (${mechanics.location}, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326))`
                )
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
            const data = {records: results, pagination: this.createPagination(page, limit, count as number)};
            return this.responseData(HttpStatus.OK, true, `Mechanics retrieved successfully.`, data);

        } catch (error) {
            return this.handleDrizzleError(error);
        }
    }


}