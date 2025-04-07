// src/services/booking.service.ts
import { Booking } from "../models/Booking.model";
import { User } from "../models/User.model";
import { Course } from "../models/Course.model";
import { Module } from "../models/Module.model";
import { Slot } from "../models/Slot.model";
import { AppDataSource } from "../config/database";
import * as sharedDeviceService from './sharedDevice.service';
import { AppError } from "../middleware/errorHandler.middleware";
import { logActivity } from "./activityLog.service";

const bookingRepository = AppDataSource.getRepository(Booking);
const courseRepository = AppDataSource.getRepository(Course);
const moduleRepository = AppDataSource.getRepository(Module);
const slotRepository = AppDataSource.getRepository(Slot);
const userRepository = AppDataSource.getRepository(User);

export const createBooking = async (
    userId: string,
    courseId: string,
    selectedSlots: string[] | null,
    deviceId: string | undefined
) => {

    // 0. Check if booking is enabled (shared device mode)
    if (deviceId && !sharedDeviceService.isBookingEnabled(deviceId)) {
        throw new AppError("Booking is currently disabled on this device.", 403);
    }

    // 1. Input Validation and User/Course Existence
    if (!courseId) {
        throw new AppError("Course ID is required.", 400);
    }

    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
        throw new AppError("User not found.", 404);
    }

    const course = await courseRepository.findOne({
        where: { id: courseId },
        relations: { seminarDay: true, modules: { slot: true } }
    });

    if (!course) {
        throw new AppError("Course not found.", 404);
    }

    // 2. Determine Seminar Type (Live vs. Flexible Recorded)
    const isLiveCourse = course.format === "live";

    // 3. Conflict Check and Slot Availability
    let requiredSlots: Slot[] = [];
    if (isLiveCourse) {
        course.modules.forEach(module => {
            if (module.slot) {
                requiredSlots.push(module.slot);
            }
        });
    } else {
        if (!selectedSlots || selectedSlots.length === 0) {
            throw new AppError("For recorded courses, slots must be selected.", 400);
        }
        for (const slotId of selectedSlots) {
            const slot = await slotRepository.findOneBy({ id: slotId });
            if (!slot) {
                throw new AppError(`Slot with ID ${slotId} not found.`, 404);
            }
            requiredSlots.push(slot);
        }
    }

    const seminarDayId = course.seminarDay.id;
    const conflictingBookings = await bookingRepository
        .createQueryBuilder("booking")
        .innerJoin("booking.user", "user")
        .innerJoin("booking.course", "course")
        .innerJoin("course.seminarDay", "seminarDay")
        .leftJoin("course.modules", "module")
        .leftJoin("module.slot", "slot")
        .where("user.id = :userId", { userId })
        .andWhere("seminarDay.id = :seminarDayId", { seminarDayId })
        .andWhere(qb => {
            const subQuery = qb.subQuery()
                .select("1")
                .from(Slot, "requiredSlot")
                .where("requiredSlot.id IN (:...requiredSlotIds)")
                .getQuery();
            return "slot.id IN (" + subQuery + ")";
        })
        .setParameter("requiredSlotIds", requiredSlots.map(s => s.id))
        .getMany();

    if (conflictingBookings.length > 0) {
        const conflictingSlotIds = conflictingBookings.flatMap(booking =>
            booking.course.modules.map(module => module.slot?.id)
        ).filter(id => id !== undefined);

        throw new AppError(`Booking conflict detected.  The following slots are already booked: ${conflictingSlotIds.join(', ')}`, 409);
    }

    // 4. Create Booking
    // const newBooking = bookingRepository.create({
    //     user: user,
    //     course: course,
    //     bookingStatus: "confirmed",
    //     slotAssignments: isLiveCourse ? [] : requiredSlots,
    // });

    // const savedBooking = await bookingRepository.save(newBooking);

    // Pass userId (string), not user (object)
    // await logActivity("create", "Booking", savedBooking.id, userId, { courseId: course.id });

    // 5. Return Success
    return {
        success: true,
        message: "Booking created successfully.",
        booking: [],
    };
};

export const cancelBooking = async (userId: string, bookingId: string) => {
    if (!bookingId) {
        throw new AppError("Booking ID is required.", 400);
    }

    const booking = await bookingRepository.findOne({
        where: { id: bookingId },
        relations: { user: true, course: { modules: { slot: true } } },
    });

    if (!booking) {
        throw new AppError("Booking not found.", 404);
    }

    if (booking.user.id !== userId) {
        throw new AppError("Unauthorized: You can only cancel your own bookings.", 403);
    }

    if (booking.bookingStatus === "cancelled") {
        throw new AppError("Booking is already cancelled.", 400);
    }

    booking.bookingStatus = "cancelled";
    const updatedBooking = await bookingRepository.save(booking);

    // booking.slotAssignments = [];
    await bookingRepository.save(booking);

    // Pass userId (string), not booking.user (object)
    await logActivity("cancel", "Booking", booking.id, userId, { bookingId: booking.id });

    return {
        success: true,
        message: "Booking cancelled successfully.",
        booking: updatedBooking,
    };
};
export const getBookingsForUser = async (userId: string) => {
    const bookings = await bookingRepository.find({
        where: { user: { id: userId } },
        relations: { course: { modules: { slot: true }, seminarDay: true }, user: true }, // Include necessary relations
    });

    return { success: true, bookings };
};

export const getBookingStatistics = async () => {
    // Total Bookings
    const totalBookings = await bookingRepository.count();

    // Bookings Per Course (Example - you can customize this)
    const bookingsPerCourse = await bookingRepository
        .createQueryBuilder("booking")
        .select("course.title", "courseTitle") // Select course title
        .addSelect("COUNT(booking.id)", "bookingCount") // Count bookings
        .innerJoin("booking.course", "course") // Join with course
        .groupBy("course.id") // Group by course ID
        .orderBy("\"bookingCount\"", "DESC") // Order by booking count (descending)
        .getRawMany();  // Use getRawMany for custom select

    // Bookings per Seminar Day (Example)
    const bookingsPerSeminarDay = await bookingRepository
        .createQueryBuilder("booking")
        .select("seminarDay.weekday", "weekday")
        .addSelect("COUNT(booking.id)", "bookingCount")
        .innerJoin("booking.course", "course")
        .innerJoin("course.seminarDay", "seminarDay")
        .groupBy("seminarDay.id")
        .orderBy("\"bookingCount\"", "DESC")
        .getRawMany();

    return {
        success: true,
        totalBookings,
        bookingsPerCourse,
        bookingsPerSeminarDay,
        // Add more statistics as needed
    };
};