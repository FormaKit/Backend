import { SupabaseClient } from "@supabase/supabase-js";
import { BaseService } from "../core/BaseService";
import { ICreateUserDTO, IUser } from "../types/model/user.types";
import { tableNames } from "../constance";
import { AuthError, ValidationError } from "../core/ErrorHandler";
import { compare, hash } from "bcrypt";

export class UserService extends BaseService<IUser> {
    protected salt: number;

    constructor(supabase: SupabaseClient) {
        super(supabase, tableNames.user);
        this.salt = Number(process.env.SALT || 10);
    }

    /**
     * Creates a new user.
     * @param {CreateUserDTO} userData The user data to create.
     * @returns {Promise<User>} The created user.
     */
    async createUser(userData: ICreateUserDTO): Promise<IUser> {
        const existingEmail = await this.findAll({ email: userData.email });
        if (existingEmail && existingEmail.length > 0) {
            throw new ValidationError("Email already exists");
        }

        const existingUsername = await this.findAll({ username: userData.username });
        if (existingUsername && existingUsername.length > 0) {
            throw new ValidationError("Username already taken");
        }

        const hashedPassword = await hash(userData.password, this.salt);

        const user = await this.create({
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            role_id: userData.role_id || 1,
            is_active: true,
        });

        if (!user) {
            console.log('user', user)
            throw new Error("Failed to create user");
        }

        return user;
    }

    /**
     * Authenticates a user by email and password.
     * @param {string} email The user's email.
     * @param {string} password The user's password.
     * @returns {Promise<User>} The authenticated user.
     */
    async authenticate(email: string, password: string): Promise<IUser> {
        const user = await this.findAll({ email: email });
        if (!user || user.length === 0) {
            throw new AuthError();
        }

        //Check if the password is currect
        const isPasswordValid = await compare(password, user[0].password);
        if (!isPasswordValid) {
            throw new AuthError();
        }

        //Check if the user is active
        if (!user[0].is_active) {
            throw new AuthError("Accound is disabled");
        }

        return user[0];
    }
}
