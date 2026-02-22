import jwt from 'jsonwebtoken'
import UserModel from '../models/user.model.js'

const generatedAccessToken = async (userId) => {
    // Fetch user to include role and vendorId in token
    const user = await UserModel.findById(userId).select('role vendorId vendor');
    
    const payload = {
        id: userId,
        userId: userId,
        role: user?.role || 'USER',
        vendorId: user?.vendorId || user?.vendor || null
    };

    const token = await jwt.sign(
        payload,
        process.env.SECRET_KEY_ACCESS_TOKEN,
        { expiresIn: '24h' }
    )

    return token
}

export default generatedAccessToken