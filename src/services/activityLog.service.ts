// src/services/activityLog.service.ts
import { ActivityLog } from "../models/ActivityLog.model";
import { AppDataSource } from "../config/database";
import { User } from "../models/User.model";

const activityLogRepository = AppDataSource.getRepository(ActivityLog);

export const logActivity = async (
    action: string,
    entityType: string,
    entityId: string | undefined, //  Accept undefined
    userId: string | undefined, //  Accept user ID (string or undefined)
    details?: object
) => {
    const logEntry = activityLogRepository.create({
        action,
        entityType,
        entityId,
        user: userId ? { id: userId } as User : undefined, // Create a partial User object, or undefined
        details: details ? JSON.stringify(details) : undefined,
    });

    await activityLogRepository.save(logEntry);
};