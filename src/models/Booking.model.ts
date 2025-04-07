// backend/src/models/Booking.model.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    BaseEntity,
    JoinColumn,
    CreateDateColumn,
    Column,
} from "typeorm";
import { User } from "./User.model";
import { Course } from "./Course.model";

@Entity("bookings")
export class Booking extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, (user) => user.bookings)
    @JoinColumn({ name: "user_id" }) // Specify foreign key column name
    user!: User;

    @ManyToOne(() => Course, (course) => course.bookings)
    @JoinColumn({ name: "course_id" })
    course!: Course;

    @Column({ nullable: true })
    bookingStatus?: string;

    @CreateDateColumn()
    createdAt!: Date;
}