import {HttpStatus} from "../types/constants";
import BaseService from "./Service";
import {db} from "../drizzle/drizzle";
import {jobRequests, jobs, mechanics, users} from "../drizzle/schema";
import {and, desc, eq, sql} from "drizzle-orm";

export default class JobRequest extends BaseService {

    public async requests(mechanicId: string, page: number, limit: number) {
        try {
            const offset = (page - 1) * limit;

            const requestsWithJobs = db
                .select()
                .from(jobRequests)
                .innerJoin(jobs, eq(jobRequests.jobId, jobs.id))
                .where(eq(jobRequests.mechanicId, mechanicId))
                .orderBy(desc(jobRequests.createdAt))
                .limit(limit)
                .offset(offset);

            // Count query for pagination
            const countQuery = db
                .select({
                    count: sql`COUNT
                        (*)`,
                })
                .from(jobRequests)
                .where(eq(jobRequests.mechanicId, mechanicId));

            const [results, [{count}]] = await Promise.all([requestsWithJobs, countQuery]);
            const data = {
                records: results,
                pagination: this.createPagination(page, limit, Number(count)),
            };
            return this.responseData(HttpStatus.OK, true, `Requests were retrieved successfully.`, data);

        } catch (error) {
            return this.handleDrizzleError(error);
        }
    }

    public async request(mechanicId: string, jobId: string) {
        try {

            const query = await db
                .select()
                .from(jobRequests)
                .innerJoin(jobs, eq(jobRequests.jobId, jobs.id))
                .where(and(eq(jobRequests.mechanicId, mechanicId), eq(jobRequests.jobId, jobId)));

            const request = query[0];

            if (!request) return this.responseData(HttpStatus.NOT_FOUND, true, `Request was not found.`);
            return this.responseData(HttpStatus.OK, false, `Request was retrieved successfully.`, request);
        } catch (error) {
            return this.handleDrizzleError(error);
        }
    }
}