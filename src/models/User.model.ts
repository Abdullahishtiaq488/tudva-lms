// src/models/user.model.ts
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToMany, DeleteDateColumn } from "typeorm";
import { Booking } from "./Booking.model";
import { Course } from "./Course.model";
import { UserProgress } from "./UserProgress.model";

// Define the enum for user roles
export enum UserRole {
    Learner = "learner",
    Instructor = "instructor",
    Admin = "admin",
    TrainingRoomAdmin = "training_room_admin"
}

@Entity("users")
export class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    passwordHash!: string; // Store hashed passwords, NEVER plain text

    @Column()
    fullName!: string;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.Learner,
    })
    role!: UserRole;

    @Column({ default: true }) //Add an is active, that can also be used for soft-delete
    isActive!: boolean;

    @Column({ nullable: true })
    phoneNo?: string;

    @Column("text", { nullable: true })
    aboutMe?: string;

    @Column({ nullable: true })
    profilePicture?: string;

    @Column("simple-array", { nullable: true })
    education?: string[];

    @OneToMany(() => Course, (course) => course.instructor)
    createdCourses!: Course[];

    @Column({ type: "text", nullable: true })
    confirmationToken?: string | null;

    @Column({ type: "timestamptz", nullable: true })
    tokenExpiration?: Date | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => Booking, (booking) => booking.user)
    bookings!: Booking[];

    @OneToMany(() => UserProgress, (userProgress) => userProgress.user)
    progress!: UserProgress[];

    @Column({ nullable: true })
    resetPasswordToken?: string;

    @Column({ nullable: true })
    resetPasswordExpires?: Date;

    @DeleteDateColumn()  // Add this decorator
    deletedAt?: Date;
}