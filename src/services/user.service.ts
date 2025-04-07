// src/services/user.service.ts
import { User, UserRole } from "../models/User.model";
import { AppDataSource } from "../config/database";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from "../utils/email";
import { AppError } from "../middleware/errorHandler.middleware";
import { PasswordResetToken } from "../models/PasswordResetToken.model";

const userRepository = AppDataSource.getRepository(User);
const passwordResetTokenRepository = AppDataSource.getRepository(PasswordResetToken);

export const registerUser = async (email: string, passwordPlain: string, fullName: string, role: UserRole = UserRole.Learner) => {
    // 1. Input Validation (using Joi in the route handler is preferred)
    if (!email || !passwordPlain || !fullName) {
        throw new AppError("Email, password, and full name are required.", 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new AppError("Invalid email format.", 400);
    }

    if (passwordPlain.length < 8) {
        throw new AppError("Password must be at least 8 characters long.", 400);
    }
    // 2. Check if user already exists
    const existingUser = await userRepository.findOneBy({ email: email });
    if (existingUser) {
        throw new AppError("Email already registered.", 409); // 409 Conflict
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);

    // 4. Create user
    const newUser = userRepository.create({
        email,
        passwordHash,
        fullName,
        role,
        isActive: false, // Set to inactive initially
        confirmationToken: "", // Will be set shortly.
        // Don't set token expiration yet
    });

    const savedUser = await userRepository.save(newUser); // Save *before* generating token

    // 5. Generate confirmation token
    const token = jwt.sign({ userId: savedUser.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    // Set token and expiration on the *saved* user
    savedUser.confirmationToken = token;
    savedUser.tokenExpiration = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await userRepository.save(savedUser);

    // 6. Send confirmation email

    console.log(savedUser.email, 'savedUser.email')

    try {
        const url = `${process.env.BASE_URL}/auth/confirm-email?token=${token}`
        await sendEmail(savedUser.email, 'Confirm Your Account', url, 'registrationConfirmation', { token: token, name: savedUser.fullName });
    } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Consider deleting the user here, or marking them for later cleanup, since email failed.
        // This is important for avoiding "hanging" unconfirmed accounts.
        throw new AppError("Failed to send confirmation email.  Registration incomplete.", 500);
    }


    // 7. Return success (don't include sensitive data)
    return { success: true, message: "Registration successful.  Please check your email for confirmation.", userId: savedUser.id };
};

export const loginUser = async (email: string, passwordPlain: string) => {
    // 1. Find user by email
    const user = await userRepository.findOneBy({ email: email });
    if (!user) {
        throw new AppError("Invalid credentials.", 401); // 401 Unauthorized
    }

    // 2. Check if user is active
    if (!user.isActive) {
        throw new AppError("Account is not active. Please confirm your email.", 403); // Or a more specific error
    }


    // 3. Compare password hash
    const passwordMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!passwordMatch) {
        throw new AppError("Invalid credentials.", 401);
    }
    
    // 4. Generate JWT
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' }); // Set appropriate expiration

    console.log(token, 'token')

    // 5. Return success with token and user info (excluding sensitive data)
    return {
        success: true,
        token,
        user: {
            userId: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role
        }
    };
};

export const verifyConfirmationToken = async (token: string) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

        const user = await userRepository.findOneBy({ id: decoded.userId });
        if (!user) {
            throw new AppError("User not found.", 404);
        }

        // Check if token matches and hasn't expired
        if (user.confirmationToken !== token || (user.tokenExpiration && user.tokenExpiration < new Date())) {
            throw new AppError("Invalid or expired token.", 400);
        }

        // Activate user
        user.isActive = true;
        user.confirmationToken = null; // Clear the token
        user.tokenExpiration = null; // Clear expiration
        await userRepository.save(user);

        return { success: true, message: "Account confirmed successfully." };
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new AppError("Invalid token format.", 400)
        }
        if (error instanceof jwt.TokenExpiredError) {
            throw new AppError("Token expired", 400);
        }
        throw error; // Re-throw other errors
    }
};

export const getUserProfile = async (userId: string) => {
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
        throw new AppError("User not found.", 404);
    }

    // Return user data, EXCLUDING sensitive fields like passwordHash
    return {
        success: true,
        user: {
            userId: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            profilePicture: user.profilePicture, // Include the updated picture
            phoneNo: user.phoneNo,
            aboutMe: user.aboutMe,
            education: user.education
        }
    };
};

//Update User profile service function.
export const updateUserProfile = async (userId: string, profileData: Partial<User>, currentPassword?: string) => {
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
        throw new AppError("User not found.", 404);
    }

    // If changing password, require current password
    if (profileData.passwordHash && !currentPassword) {
        throw new AppError("Current password is required to change password.", 400);
    }

    // Verify current password if changing password
    if (profileData.passwordHash && currentPassword) {
        const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!passwordMatch) {
            throw new AppError("Incorrect current password.", 401);
        }
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        profileData.passwordHash = await bcrypt.hash(profileData.passwordHash, salt);
    }

    // Update user data
    Object.assign(user, profileData); // Efficiently update multiple fields
    const updatedUser = await userRepository.save(user);

    console.log(profileData, 'profileData')

    // Exclude sensitive data from the response
    return {
        success: true,
        message: 'Profile updated successfully',
        user: {
            userId: updatedUser.id,
            email: updatedUser.email,
            fullName: updatedUser.fullName,
            role: updatedUser.role,
            profilePicture: updatedUser.profilePicture, // Include the updated picture
            phoneNo: updatedUser.phoneNo,
            aboutMe: updatedUser.aboutMe,
            education: updatedUser.education
            // Add any other non-sensitive fields you want to return
        }
    };
};

//Gets all users for Admin
export const getAllUsers = async (page: number = 1, pageSize: number = 10) => {
    const skip = (page - 1) * pageSize;

    const [users, total] = await userRepository.findAndCount({
        skip,
        take: pageSize,
        order: { createdAt: "DESC" } // Order by creation date (newest first)
    });

    // Exclude sensitive data from the returned users
    const safeUsers = users.map(user => ({
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
        // Add other non-sensitive fields
    }));

    return {
        success: true,
        users: safeUsers,
        total,
        page,
        pageSize
    };
};

export const updateUserRole = async (adminId: string, userId: string, newRole: UserRole) => {
    // 1. Check if the user making the request is an admin.
    const admin = await userRepository.findOneBy({ id: adminId });
    if (!admin || admin.role !== UserRole.Admin) {
        throw new AppError("Unauthorized: Only admins can update user roles.", 403);
    }

    // 2. Find the user to update.
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
        throw new AppError("User not found.", 404);
    }

    // 3. Prevent self-demotion (optional, but good practice).
    if (adminId === userId && user.role !== newRole) {
        throw new AppError("Admins cannot demote themselves.", 400);
    }
    // 4. Update the role.
    user.role = newRole;
    const updatedUser = await userRepository.save(user);

    // Exclude sensitive data from response.
    return {
        success: true,
        message: 'User role updated successfully.',
        user: {
            userId: updatedUser.id,
            email: updatedUser.email,
            fullName: updatedUser.fullName,
            role: updatedUser.role
        }
    };
};

export const deleteUser = async (userId: string, adminId: string) => {
    // 1. Check if the user making the request is an admin.
    const admin = await userRepository.findOneBy({ id: adminId });
    if (!admin || admin.role !== "admin") {
        throw new AppError("Unauthorized: Only admins can delete users.", 403);
    }

    // 2. Find the user to delete/deactivate.
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
        throw new AppError("User not found.", 404);
    }

    // 3. Prevent self-deletion (optional but recommended).
    if (adminId === userId) {
        throw new AppError("Admins cannot delete themselves.", 400);
    }

    // 4. Soft delete (recommended) or hard delete.
    // Soft Delete:
    user.isActive = false; // Set isActive to false
    await userRepository.save(user); // save the changes

    // Hard Delete (use with caution!):
    // await userRepository.delete(userId);

    return { success: true, message: "User deleted (deactivated) successfully." };
};

export const requestPasswordReset = async (email: string) => {
    console.log(email, 'email')
    const user = await userRepository.findOneBy({ email });
    console.log(user, 'user')
    if (!user) {
        // NOTE:  Even if the user doesn't exist, we return success.
        // This is a security best practice to avoid leaking information
        // about registered email addresses (email enumeration).
        return { success: true, message: "If a matching account was found, a password reset link has been sent." };
    }

    // Check if there's an existing token that hasn't expired yet
    const existingToken = await passwordResetTokenRepository.findOne({
        where: { userId: user.id },
        order: { expiresAt: 'DESC' }, // Get the most recent token
    });

    console.log(existingToken, 'existingToken')

    if (existingToken && existingToken.expiresAt > new Date()) {
        throw new AppError("A password reset request has already been sent recently.  Please check your email.", 429); // 429 Too Many Requests
    }


    // Generate a JWT for password reset
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' }); // 1 hour expiration

    // Save the token and expiration to the database
    const resetToken = passwordResetTokenRepository.create({
        userId: user.id,
        token: token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    });

    await passwordResetTokenRepository.save(resetToken);

    // Send the password reset email
    try {
        const url = `${process.env.BASE_URL}/auth/confirm-change-password?token=${token}`
        console.log(url, 'URL')
        await sendEmail(user.email, 'Password Reset Request', url, 'passwordReset', { token, name: user.fullName });
    } catch (emailError) {
        console.error("Error sending password reset email:", emailError);
        //  Consider what to do if the email fails.  You might *not* want
        //  to throw an error to the user, but you *do* want to log it.
        throw new AppError("Failed to send password reset email.", 500);
    }

    return { success: true, message: "If a matching account was found, a password reset link has been sent." };
};

export const verifyResetToken = async (token: string) => {
    try {
        // 1. Verify the token (using jose)
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

        // 2. Find the token in the database
        const resetToken = await passwordResetTokenRepository.findOneBy({
            token: token,
            userId: decoded.userId, // Use the decoded userId
        });

        if (!resetToken) {
            throw new AppError("Invalid or expired token.", 400);
        }

        // 3. Check if the token has expired
        if (resetToken.expiresAt < new Date()) {
            throw new AppError("Token has expired.", 400);
        }

        return { success: true, message: "Token is Valid." };
    } catch (error: any) {
        throw new AppError(error.message, error.statusCode || 500); // Consistent error handling
    }
};
export const resetPassword = async (token: string, newPasswordPlain: string) => {
    // 1. Verify the token
    let decoded: { userId: string };
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    } catch (error) {
        throw new AppError("Invalid or expired token.", 400);
    }

    // 2. Find the token in the database
    const resetToken = await passwordResetTokenRepository.findOneBy({ token: token, userId: decoded.userId });
    if (!resetToken) {
        throw new AppError("Invalid or expired token.", 400);
    }

    // 3. Check if the token has expired
    if (resetToken.expiresAt < new Date()) {
        throw new AppError("Token has expired.", 400);
    }

    // 4. Find the user
    const user = await userRepository.findOneBy({ id: decoded.userId });
    if (!user) {
        throw new AppError("User not found.", 404); // This should not happen, but handle it
    }

    // 5. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPasswordPlain, salt);

    // 6. Update the user's password and clear the reset token
    user.passwordHash = newPasswordHash;
    await userRepository.save(user); //Save password.

    // 7. Delete the used token (or mark it as used)
    await passwordResetTokenRepository.delete(resetToken.id);

    // 8. Send a confirmation email (optional, but good practice)
    try {
        const url = process.env.BASE_URL+ '/auth/sign-in'
        await sendEmail(user.email, 'Password Reset Confirmation', url, 'passwordResetConfirmation', { name: user.fullName });
    } catch (emailError) {
        console.error("Error sending password reset confirmation email", emailError)
        //Consider what to do if it fails.
        //In this case do not throw error.
    }

    return { success: true, message: "Password reset successfully." };
};