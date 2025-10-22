import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    uniqueIndex,
    real,
    boolean,
    integer,
    index,
    pgEnum,
    json
} from "drizzle-orm/pg-core";
import { randomUUID } from 'crypto';

export const jobStatusEnum = pgEnum('job_status', [
    'pending',
    'searching',
    'accepted',
    'mechanic_enroute',
    'in_progress',
    'completed',
    'cancelled'
]);

export const verificationStatusEnum = pgEnum('verification_status', [
    'pending',
    'approved',
    'rejected'
]);

export const urgencyEnum = pgEnum('urgency', ['low', 'normal', 'high', 'emergency']);

export const cancelledBy = pgEnum('cancelledBy', ['user','mechanic']);

export type PhotoField = {
    url: String,
    publicId: String,
}

export const users = pgTable('users', {
    id: uuid('id').primaryKey().$defaultFn(() => randomUUID()),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phone: varchar('phone', { length: 20 }).notNull().unique(),
    password: text('password').notNull(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    profilePicture: json('profile_picture').$type<PhotoField>(),

    // Location
    currentCity: varchar('current_city', { length: 100 }),
    currentLatitude: real('current_latitude'),
    currentLongitude: real('current_longitude'),
    currentAddress: text('current_address'),

    // Account status
    isActive: boolean('is_active').notNull().default(true),
    isVerified: boolean('is_verified').notNull().default(false),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    lastActive: timestamp('last_active').notNull().defaultNow(),
}, (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
    phoneIdx: uniqueIndex('users_phone_idx').on(table.phone),
    locationIdx: index('users_location_idx').on(table.currentLatitude, table.currentLongitude),
}));

export const mechanics = pgTable('mechanics', {
    id: uuid('id').primaryKey().$defaultFn(() => randomUUID()),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phone: varchar('phone', { length: 20 }).notNull().unique(),
    password: text('password').notNull(),

    // Personal Info
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    profilePicture: json('profile_picture').$type<PhotoField>(),
    dateOfBirth: timestamp('date_of_birth'),

    // Verification Documents
    // idType: varchar('id_type', { length: 50 }),
    // idNumber: varchar('id_number', { length: 50 }),
    // idDocumentUrl: text('id_document_url'),
    // certificationUrls: text('certification_urls').array(),

    // Skills & Specialization
    skills: text('skills').array().notNull().default([]),
    yearsExperience: integer('years_experience').notNull().default(0),
    bio: text('bio'),

    // Location & Availability
    baseCity: varchar('base_city', { length: 100 }).notNull(),
    currentLatitude: real('current_latitude'),
    currentLongitude: real('current_longitude'),
    currentAddress: text('current_address'),
    isOnline: boolean('is_online').notNull().default(false),
    isAvailable: boolean('is_available').notNull().default(true),

    // Ratings & Performance
    // averageRating: real('average_rating').notNull().default(0),
    // totalRatings: integer('total_ratings').notNull().default(0),
    // totalJobsCompleted: integer('total_jobs_completed').notNull().default(0),
    // totalJobsCancelled: integer('total_jobs_cancelled').notNull().default(0),
    // acceptanceRate: real('acceptance_rate').notNull().default(0),

    // Financial
    // totalEarnings: real('total_earnings').notNull().default(0),
    // availableBalance: real('available_balance').notNull().default(0),
    // pendingBalance: real('pending_balance').notNull().default(0),

    // Verification Status
    isVerified: boolean('is_verified').notNull().default(false),
    verificationStatus: verificationStatusEnum('verification_status').notNull().default('pending'),
    verificationNotes: text('verification_notes'),
    verifiedAt: timestamp('verified_at'),
    // verifiedBy: text('verified_by'),

    // Account Status
    isActive: boolean('is_active').notNull().default(true),
    isSuspended: boolean('is_suspended').notNull().default(false),
    suspensionReason: text('suspension_reason'),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    lastActive: timestamp('last_active').notNull().defaultNow(),
}, (table) => ({
    emailIdx: uniqueIndex('mechanics_email_idx').on(table.email),
    phoneIdx: uniqueIndex('mechanics_phone_idx').on(table.phone),
    locationIdx: index('mechanics_location_idx').on(table.currentLatitude, table.currentLongitude),
    availabilityIdx: index('mechanics_availability_idx').on(table.isOnline, table.isAvailable, table.isVerified),
}));

export const jobs = pgTable('jobs', {
    id: uuid('id').primaryKey().$defaultFn(() => randomUUID()),

    // References
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    mechanicId: uuid('mechanic_id').references(() => mechanics.id, { onDelete: 'set null' }),

    // Job Details
    issueType: varchar('issue_type', { length: 50 }).notNull(),
    issueDescription: text('issue_description').notNull(),
    urgency: urgencyEnum('urgency').notNull().default('normal'),

    // Location
    pickupLatitude: real('pickup_latitude').notNull(),
    pickupLongitude: real('pickup_longitude').notNull(),
    pickupAddress: text('pickup_address').notNull(),
    destinationLat: real('destination_lat'),
    destinationLng: real('destination_lng'),
    destinationAddress: text('destination_address'),

    // Status & Timeline
    status: jobStatusEnum('status').notNull().default('pending'),
    requestedAt: timestamp('requested_at').notNull().defaultNow(),
    acceptedAt: timestamp('accepted_at'),
    arrivedAt: timestamp('arrived_at'),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    cancelledAt: timestamp('cancelled_at'),

    // Estimated times
    estimatedArrival: timestamp('estimated_arrival'),
    estimatedDuration: integer('estimated_duration'),

    // Pricing
    // estimatedCost: real('estimated_cost'),
    // negotiatedCost: real('negotiated_cost'),
    // finalCost: real('final_cost'),
    // platformFee: real('platform_fee'),
    // mechanicEarning: real('mechanic_earning'),

    // Payment
    // paymentMethod: varchar('payment_method', { length: 20 }),
    // paymentStatus: paymentStatusEnum('payment_status').notNull().default('pending'),
    // paymentId: text('payment_id').unique(),

    // Cancellation
    cancelledBy: cancelledBy('cancelledBy').notNull(),
    cancellationReason: text('cancellation_reason'),

    // Vehicle Info
    vehicleMake: varchar('vehicle_make', { length: 50 }),
    vehicleModel: varchar('vehicle_model', { length: 50 }),
    vehicleYear: integer('vehicle_year'),
    vehiclePlate: varchar('vehicle_plate', { length: 20 }),
    photoUrls: text('photo_urls').array().default([]),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
    userIdx: index('jobs_user_idx').on(table.userId),
    mechanicIdx: index('jobs_mechanic_idx').on(table.mechanicId),
    statusIdx: index('jobs_status_idx').on(table.status),
    requestedAtIdx: index('jobs_requested_at_idx').on(table.requestedAt),
    locationIdx: index('jobs_location_idx').on(table.pickupLatitude, table.pickupLongitude),
}));

