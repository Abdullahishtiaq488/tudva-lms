// src/config/database.ts
import * as dotenv from "dotenv";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../models/User.model";
import { Course } from "../models/Course.model";
import { Lecture } from "../models/Lecture.model";
import { FAQ } from "../models/FAQ.model";
import { Tag } from "../models/Tag.model";
import { Booking } from "../models/Booking.model";
import { Slot } from "../models/Slot.model";
import { SeminarDay } from "../models/SeminarDay.model";
import { Module } from "../models/Module.model";
import { TrainingRoom } from "../models/TrainingRoom.model";
import { TeamBoard } from "../models/TeamBoard.model";
import { TeamList } from "../models/TeamList.model";
import { TeamCard } from "../models/TeamCard.model";
import { TeamCardComment } from "../models/TeamCardComment.model";
import { ActivityLog } from "../models/ActivityLog.model";
import { Attachment } from "../models/Attachment.model";
import { PasswordResetToken } from "../models/PasswordResetToken.model";
import { UserProgress } from "../models/UserProgress.model";
dotenv.config();

// Using Supabase connection string instead of individual parameters
console.log('Database URL:', process.env.DATABASE_URL ? 'URL exists' : 'URL is missing');

// Fallback connection string in case environment variable is missing
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.ngpdfyhvlztueekbksju:5ZLXXME3V0EqkYpI@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

export const AppDataSource = new DataSource({
    type: "postgres",
    url: connectionString,
    ssl: {
        rejectUnauthorized: false // This is needed for Supabase connections
    },
    synchronize: true,  // Set to true for development to update entity metadata
    logging: true,   // Enable logging for debugging
    entities: [
        User,
        Course,
        Lecture,
        Tag,
        FAQ,
        Booking,
        Slot,
        SeminarDay,
        Module,
        TrainingRoom,
        TeamBoard,
        TeamList,
        TeamCard,
        TeamCardComment,
        ActivityLog,
        Attachment,
        PasswordResetToken,
        UserProgress
    ],
    migrations: ["src/migrations/*.ts"],  // Add migrations directory
    subscribers: [],
})