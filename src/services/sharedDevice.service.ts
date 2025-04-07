// src/services/sharedDevice.service.ts
import { User } from "../models/User.model"; // Import User
import { TrainingRoom } from "../models/TrainingRoom.model"; // Import
import { AppDataSource } from "../config/database";
import { loginUser } from "./user.service";

const userRepository = AppDataSource.getRepository(User);
const trainingRoomRepository = AppDataSource.getRepository(TrainingRoom);

// In-memory store for active sessions (replace with Redis in production)
const activeSessions: { [deviceId: string]: { [userId: string]: { sessionToken: string; expiresAt: number } } } = {};

export const sharedDeviceLogin = async (deviceId: string, userCredentials: { email: string; password: string }[], sessionId: string) => {

    // 1. Verify Device
    const trainingRoom = await trainingRoomRepository.findOneBy({ id: deviceId }); // Assuming deviceId is the training room ID
    if (!trainingRoom) {
        throw new Error("Device not registered as a shared device.");
    }
    // 2. Authenticate Users
    const userSessions = [];
        for (const credentials of userCredentials) {
            // Use existing loginUser function for authentication
            const loginResult = await loginUser(credentials.email, credentials.password);
            if (!loginResult.success) {
             // Handle individual user login failures.
             throw new Error(`Authentication failed for user ${credentials.email} `)
            }

            // 3. Create Session
            const sessionToken = loginResult.token; // Reuse the JWT
            const expiresAt = Date.now() + 60 * 60 * 1000; // 1-hour session (adjust as needed)

            // Store session (in-memory for now)
            if (!activeSessions[deviceId]) {
               activeSessions[deviceId] = {};
            }
           activeSessions[deviceId][loginResult.user.userId] = { sessionToken, expiresAt };
           userSessions.push({ userId: loginResult.user.userId, sessionToken });

    }

    // 4. Disable Booking (In-memory flag for simplicity)
    //    In a real app, you'd likely have a more robust mechanism,
    //    possibly involving a shared lock in Redis.
    setDeviceBookingStatus(deviceId, false);


    // 5. Schedule Auto-Logout (Simplified - see notes below)
    setTimeout(() => {
        logoutAllUsers(deviceId);
    }, 60 * 60 * 1000); // 1 hour (adjust as needed)

    return {
        success: true,
        message: "Users logged in successfully on shared device.",
        userSessions,
        deviceMode: "shared",
    };
};


// Helper function to check if booking is enabled for a device
export const isBookingEnabled = (deviceId: string) => {
    // In a real application you might want to check this in the database.
    // Or if you have a central place where you are maintaining shared device
    // status.
    if (deviceBookingStatus[deviceId] === undefined){
        return true;
    }
    return deviceBookingStatus[deviceId];
};

// In-memory store for device booking status (replace with Redis in production)
const deviceBookingStatus: { [deviceId: string]: boolean } = {};

// Helper function to set device booking status.
const setDeviceBookingStatus = (deviceId: string, enabled: boolean) => {
   deviceBookingStatus[deviceId] = enabled;
};

// Helper Function for Logout
const logoutAllUsers = (deviceId: string) => {
    if (activeSessions[deviceId]) {
        delete activeSessions[deviceId];
    }
   setDeviceBookingStatus(deviceId, true); // Re-enable booking
    console.log(`Logged out all users from device ${deviceId}`);
    // In a real app, you might want to emit a WebSocket event here
    // to notify the frontend to clear user sessions.
};