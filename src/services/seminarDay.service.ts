// src/services/seminarDay.service.ts
import { SeminarDay } from "../models/SeminarDay.model";
import { AppDataSource } from "../config/database";
import { Slot } from "../models/Slot.model"; // Import Slot
import { AppError } from "../middleware/errorHandler.middleware";

const seminarDayRepository = AppDataSource.getRepository(SeminarDay);
const slotRepository = AppDataSource.getRepository(Slot);

export const createSeminarDay = async (weekday: string, isActive: boolean = true, description?: string) => {
    // Input Validation
    if (!weekday) {
        throw new AppError("Weekday is required.", 400);
    }

    // Check for duplicate weekday
    const existingDay = await seminarDayRepository.findOneBy({ weekday });
    if (existingDay) {
        throw new AppError("A seminar day with this weekday already exists.", 409);
    }

    // Create and save the new SeminarDay
    const newSeminarDay = seminarDayRepository.create({
        weekday,
        isActive,
        description,
    });

    const savedSeminarDay = await seminarDayRepository.save(newSeminarDay);
    return { success: true, seminarDay: savedSeminarDay };
};

export const updateSeminarDay = async (id: string, updates: Partial<SeminarDay>) => {
    const seminarDay = await seminarDayRepository.findOneBy({ id });
    if (!seminarDay) {
        throw new AppError("Seminar day not found.", 404);
    }

    Object.assign(seminarDay, updates); // Apply updates
    const updatedSeminarDay = await seminarDayRepository.save(seminarDay);
    return { success: true, seminarDay: updatedSeminarDay };
};

//Gets all seminar days
export const getAllSeminarDays = async () => {
    const seminarDays = await seminarDayRepository.find({
        relations: {
            slots: true, // Include slots in the result
        },
    });
    return {success: true, seminarDays: seminarDays};
}

//Deactivates seminar day
export const deactivateSeminarDay = async (id: string) =>
{
    const seminarDay = await seminarDayRepository.findOneBy({id});

    if(!seminarDay)
    {
        throw new AppError("Seminar day not found.", 404);
    }

    seminarDay.isActive = false;
    await seminarDayRepository.save(seminarDay);
    return {success: true, message: "Seminar Day deactivated."};
}

export const createSlot = async (seminarDayId: string, startTime: string, endTime: string, isActive: boolean = true) => {
    // 1. Input Validation
    if (!seminarDayId || !startTime || !endTime) {
        throw new AppError("Seminar day ID, start time, and end time are required.", 400);
    }

    // 2. Check if SeminarDay exists
    const seminarDay = await seminarDayRepository.findOneBy({ id: seminarDayId });
    if (!seminarDay) {
        throw new AppError("Invalid seminar day ID.", 404);
    }
    if (!seminarDay.isActive)
    {
        throw new AppError("Cannot create slots for inactive Seminar Day.", 400)
    }

    // 3. Check for overlapping slots (Important!)
    const overlappingSlot = await slotRepository
    .createQueryBuilder("slot")
    .where("slot.seminarDay = :seminarDayId", { seminarDayId })
    .andWhere(
        "((slot.startTime < :endTime AND slot.endTime > :startTime) OR (slot.startTime = :startTime AND slot.endTime = :endTime))",  //Added check for complete overlap.
        { startTime, endTime }
    )
    .getOne();

    if (overlappingSlot) {
    throw new AppError(
        `Slot overlaps with existing slot: ${overlappingSlot.startTime}-${overlappingSlot.endTime}`, 409);
    }

    // 4. Create and save the new Slot
    const newSlot = slotRepository.create({
        seminarDay,
        startTime,
        endTime,
        isActive,
    });

    const savedSlot = await slotRepository.save(newSlot);
    return { success: true, slot: savedSlot };
};

export const updateSlot = async (id: string, updates: Partial<Slot>) => {
    const slot = await slotRepository.findOne({
        where: {id: id},
        relations: {seminarDay: true}
    });
    if (!slot) {
        throw new AppError("Slot not found.", 404);
    }
        // Check for overlapping slots (Important!)
        if (updates.startTime || updates.endTime){
            const overlappingSlot = await slotRepository
            .createQueryBuilder("slot")
            .where("slot.seminarDay = :seminarDayId", { seminarDayId: slot.seminarDay.id })
            .andWhere(
                "((slot.startTime < :endTime AND slot.endTime > :startTime) OR (slot.startTime = :startTime AND slot.endTime = :endTime))",
                { startTime: updates.startTime || slot.startTime, endTime: updates.endTime || slot.endTime}
            )
            .andWhere("slot.id != :id", {id: id}) // Exclude itself from check.
            .getOne();

            if (overlappingSlot) {
            throw new AppError(
                `Slot overlaps with existing slot: ${overlappingSlot.startTime}-${overlappingSlot.endTime}`, 409);
            }
    }

    Object.assign(slot, updates); // Apply updates
    const updatedSlot = await slotRepository.save(slot);
    return { success: true, slot: updatedSlot };
};

//Deactivates a slot.
export const deactivateSlot = async (id: string) => {
    const slot = await slotRepository.findOneBy({id});
    if (!slot) {
        throw new AppError("Slot not found.", 404);
    }

    slot.isActive = false;
    await slotRepository.save(slot);
    return {success: true, message: "Slot deactivated."}
}