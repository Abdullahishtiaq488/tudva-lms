// src/services/trainingRoom.service.ts
import { TrainingRoom } from "../models/TrainingRoom.model";
import { AppDataSource } from "../config/database";
import { AppError } from "../middleware/errorHandler.middleware";

const trainingRoomRepository = AppDataSource.getRepository(TrainingRoom);

export const registerTrainingRoom = async (
    institutionName: string,
    contactEmail: string,
    contactPhone: string | undefined, // Optional
    address: string
) => {
    // 1. Input Validation
    if (!institutionName || !contactEmail || !address) {
        throw new AppError("Institution name, contact email, and address are required.", 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
        throw new AppError("Invalid email format for contact email.", 400);
    }

    // 2. Check for Duplicate Email (Important!)
    const existingRoom = await trainingRoomRepository.findOneBy({ contactEmail });
    if (existingRoom) {
        throw new AppError("A training room with this contact email already exists.", 409); // 409 Conflict
    }

    // 3. Create and Save Training Room
    const newTrainingRoom = trainingRoomRepository.create({
        institutionName,
        contactEmail,
        contactPhone,
        address,
    });

    const savedTrainingRoom = await trainingRoomRepository.save(newTrainingRoom);

    // 4. Return Success
    return {
        success: true,
        message: "Training room registered successfully.",
        trainingRoom: savedTrainingRoom,
    };
};

// Add other service functions here (e.g., getTrainingRoom, updateTrainingRoom, etc.)