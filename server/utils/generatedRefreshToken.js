import UserModel from "../models/user.model.js"
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js';

const genertedRefreshToken = async(userId)=>{
    const token = await jwt.sign({ id : userId, userId },
        env.jwtRefreshSecret,
        { expiresIn : env.refreshTokenExpiresIn}
    )

    await UserModel.updateOne(
        { _id : userId},
        {
            refresh_token : token
        }
    )

    return token
}

export default genertedRefreshToken