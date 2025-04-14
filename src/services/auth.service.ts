// import { hash } from "crypto";
// import { SupabaseConfig } from "../config/supabase";
// import { BaseService } from "../core/BaseService";
// import { AuthError, ValidationError } from "../core/ErrorHandler";
// import { ICreateUserDTO, IUser } from "../types/model/user.types";
// import { compare } from "bcrypt";

import { compare } from "bcrypt";
import { SupabaseConfig } from "../config/supabase";
import { tableNames } from "../constance";
import { BaseService } from "../core/BaseService";
import { AuthError } from "../core/ErrorHandler";
import { IUserModel } from "../types/model/user.type";

// export abstract class AuthService extends BaseService<any> {
//   protected salt: string;

//   constructor(protected tableName: string) {
//     super(SupabaseConfig.getClient(), tableName);
//     this.salt = String(process.env.SALT);
//   }

//   /**
//    * Creates a new user.
//    * @param {CreateUserDTO} userData The user data to create.
//    * @returns {Promise<User>} The created user.
//    */
//   public async createUser(userData: ICreateUserDTO): Promise<IUser> {
//     const existingEmail = await this.findAll({ where: { email: userData.email } });
//     if (existingEmail && existingEmail.length > 0) {
//       throw new ValidationError("Email already exists");
//     }

//     const existingUsername = await this.findAll({ where: { username: userData.username } });
//     if (existingUsername && existingUsername.length > 0) {
//       throw new ValidationError("Username already taken");
//     }

//     const hashedPassword = hash(userData.password, this.salt);

//     const user = await this.create({
//       username: userData.username,
//       email: userData.email,
//       password: hashedPassword,
//       role_id: userData.role_id || 1,
//       is_active: true,
//     });

//     if (!user) {
//       console.log("user", user);
//       throw new Error("Failed to create user");
//     }

//     return user;
//   }

//   /**
//    * Authenticates a user by email and password.
//    * @param {string} email The user's email.
//    * @param {string} password The user's password.
//    * @returns {Promise<User>} The authenticated user.
//    */
//   public async authenticate(email: string, password: string): Promise<IUser> {
//     const user = await this.findAll({ where: { email: email } });
//     if (!user || user.length === 0) {
//       throw new AuthError();
//     }

//     //Check if the password is currect
//     const isPasswordValid = await compare(password, user[0].password);
//     if (!isPasswordValid) {
//       throw new AuthError();
//     }

//     //Check if the user is active
//     if (!user[0].is_active) {
//       throw new AuthError("Accound is disabled");
//     }

//     return user[0];
//   }
// }

export abstract class AuthService extends BaseService<IUserModel> {
  constructor() {
    super(SupabaseConfig.getClient(), tableNames.user);
  }

  /**
   * Authenticates a user by email and password.
   * @param {string} email The user's email.
   * @param {string} password The user's password.
   * @returns {Promise<User>} The authenticated user.
   */
  public async authenticate(email: string, password: string): Promise<IUserModel> {
    const user = await this.findAll({ where: { email: email } });
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


  public async logout() {}

  public async getAllCurrentUsersSession() {}
}
