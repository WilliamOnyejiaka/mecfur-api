// @ts-ignore
import {param, query} from "express-validator";
import {handleValidationErrors} from "../validators";

export const nearByMechanics = [
    query('page').optional().isInt({min: 1}).withMessage("page must be an integer"),
    query('limit').optional().isInt({min: 1}).withMessage("limit must be an integer"),
    query('radius').optional().isInt({min: 1}).withMessage("radius must be an integer"),
    param('lon')
        .isFloat({min: -180, max: 180})
        .withMessage('Longitude must be a number between -180 and 180')
        .toFloat(),
    param('lat')
        .isFloat({min: -90, max: 90})
        .withMessage('Latitude must be a number between -90 and 90')
        .toFloat(),
    handleValidationErrors
]