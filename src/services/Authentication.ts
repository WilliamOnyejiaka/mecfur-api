import {Cloudinary, Token} from ".";
import {FailedFiles, UploadedFiles} from "../types";
import {CdnFolders, HttpStatus, ResourceType, UserType} from "../types/constants";
import {Password} from "../utils";
import BaseService from "./Service";
import {TokenBlackList} from "../cache";
import {env} from "../config";
import {EnvKey} from "../config/env";
import {db} from "../drizzle/drizzle";
import {users} from "../drizzle/schema";
import {eq} from "drizzle-orm";

// * Authentication class for various users
export default class Authentication extends BaseService {

    protected readonly storedSalt: string = env(EnvKey.STORED_SALT)!;
    protected readonly tokenSecret: string = env(EnvKey.TOKEN_SECRET)!;
    protected readonly secretKey: string = env(EnvKey.SECRET_KEY)!;
    protected readonly tokenBlackListCache: TokenBlackList = new TokenBlackList();

    private generateToken(data: any, role: string, expiresIn: string = "100y") {
        return Token.createToken(this.tokenSecret, data, [role], expiresIn);
    }

    protected generateOTPToken(email: string, role: string, expiresIn: string = "5m") {
        return this.generateToken({email: email}, role, expiresIn);
    }

    protected generateUserToken(data: any, role: UserType) {
        return this.generateToken(data, role);
    }

    // protected generateAdminToken(admin: any) {
    //     return this.generateToken(admin, "admin");
    // }

    // * User(normal user) sign up service
    public async signUp(signUpData: any) {
        try {

            let userEmailExists = await db.select().from(users).where(eq(users.email, signUpData.email));
            if (userEmailExists.length > 0) return this.responseData(400, true, `Email already exists.`);

            let userPhoneNumberExists = await db.select().from(users).where(eq(users.phone, signUpData.phone));
            if (userPhoneNumberExists.length > 0) return this.responseData(400, true, `Phone number already exists.`);

            let uploadedFiles: UploadedFiles[] = [], publicIds: string[] = [], failedFiles: FailedFiles[] = [];

            // * Checking if user profile picture exists
            if (signUpData.file) {
                // * Uploading to cloudinary
                const cloudinary = new Cloudinary();

                ({ uploadedFiles, failedFiles, publicIds } = await cloudinary.upload([signUpData.file], ResourceType.IMAGE, CdnFolders.PROFILEPICTURE));
                if (failedFiles?.length) {
                    return this.responseData(400, true, "File upload failed", failedFiles);
                }
            }

            signUpData.password = Password.hashPassword(signUpData.password, this.storedSalt);
            const user = (await db.insert(users).values({
                ...signUpData,
                profilePicture: {
                    url: uploadedFiles[0]?.url || "",
                    publicId: uploadedFiles[0]?.publicId || "",
                },
                isVerified: false,
                isActive: true
            }).returning())[0];

            const token = this.generateUserToken({id: user.id}, UserType.User);
            const data = {
                user: {
                    ...user,
                    password: undefined
                },
                token: token,
            };
            return this.responseData(201, false, "User has been created successfully", data);

        } catch (error) {
            return this.handleDrizzleError(error);
        }
    }

    // * User(normal user) login service
    public async login(email: string, password: string) {
        try {
            let result = await db.select().from(users).where(eq(users.email, email));

            if (result.length > 0) {
                const user = result[0];
                const hashedPassword = user.password!;
                const validPassword = Password.compare(password, hashedPassword, this.storedSalt);

                if (validPassword) {
                    const token = this.generateUserToken({id: user.id}, UserType.User);
                    const data = {
                        user: {
                            ...user,
                            password: undefined
                        },
                        token: token,
                    };
                    return this.responseData(200, false, "User has been logged in successfully", data);
                }
                return super.responseData(HttpStatus.BAD_REQUEST, true, "Invalid password");
            }
            return this.responseData(404, true, "User was not found")
        } catch (error) {
            return this.handleDrizzleError(error);
        }
    }

    public async logOut(token: string) {
        const tokenValidationResult: any = Token.validateToken(token, ["any"], this.tokenSecret);

        if (tokenValidationResult.error) {
            return super.responseData(400, true, tokenValidationResult.message);
        }

        const decoded = Token.decodeToken(token);
        const blacklisted = await this.tokenBlackListCache.set(token, {
            data: decoded.data,
            types: decoded.types
        }, decoded.expiresAt);

        return blacklisted ?
            super.responseData(200, false, "User has been logged out successfully") :
            super.responseData(500, true, "Something went wrong");
    }
}