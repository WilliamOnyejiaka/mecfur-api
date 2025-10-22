// @ts-ignore
import { body } from 'express-validator';
import {handleValidationErrors} from "../validators";
import {uploads} from "../index";
import {ResourceType} from "../../types/constants";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { createStore } from "../../config/redis";

const signUpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 successful signup attempts per hour
    skipFailedRequests: true, // Ignore failed signup attempts (e.g., 400, 409)
    statusCode: 429,
    message: { error: true, message: 'Too many successful signup attempts, please try again after 1 hour.' },
    store: createStore("signUp"),
    standardHeaders: true,
    legacyHeaders: false,
});


export const signUp = [
    uploads(ResourceType.IMAGE).single("image"),
    // Required fields
    body('email')
        .isEmail()
        .withMessage('Email must be a valid email address')
        .isLength({ max: 255 })
        .withMessage('Email must be at most 255 characters')
        .normalizeEmail(), // Sanitizes email (e.g., converts to lowercase)

    body('phone')
        .isString()
        .withMessage('Phone must be a string')
        .isLength({ max: 20 })
        .withMessage('Phone number must be at most 20 characters')
        .trim()
        .notEmpty()
        .withMessage('Phone number is required'),

    body('password')
        .isString()
        .withMessage('Password must be a string')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .notEmpty()
        .withMessage('Password is required'),

    body('firstName')
        .isString()
        .withMessage('First name must be a string')
        .isLength({ max: 100 })
        .withMessage('First name must be at most 100 characters')
        .trim()
        .notEmpty()
        .withMessage('First name is required'),

    body('lastName')
        .isString()
        .withMessage('Last name must be a string')
        .isLength({ max: 100 })
        .withMessage('Last name must be at most 100 characters')
        .trim()
        .notEmpty()
        .withMessage('Last name is required'),

    // Optional fields
    body('currentCity')
        .optional()
        .isString()
        .withMessage('Current city must be a string')
        .isLength({ max: 100 })
        .withMessage('Current city must be at most 100 characters')
        .trim(),

    body('lat')
        .isFloat()
        .withMessage('Current latitude must be a valid number')
        .toFloat(), // Sanitizes to a float

    body('lon')
        .isFloat()
        .withMessage('Current longitude must be a valid number')
        .toFloat(), // Sanitizes to a float

    body('currentAddress')
        .optional()
        .isString()
        .withMessage('Current address must be a string')
        .trim(),
    handleValidationErrors
];

export const login = [
    body('email')
        .notEmpty()
        .withMessage('Email is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];