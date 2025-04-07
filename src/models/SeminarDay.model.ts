//backend/src/models/SeminarDay.model.ts
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm";
import { Course } from "./Course.model"; // Import Course
import { Slot } from "./Slot.model";

@Entity("seminar_days")
export class SeminarDay extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    weekday!: string; // e.g., "Monday", "Tuesday", etc.

    @Column({ default: true }) // You can set a default value if needed
    isActive!: boolean;

    @Column("text", {nullable: true})
    description?: string;

    @OneToMany(() => Course, (course) => course.seminarDay) // One-to-many with Course
    courses!: Course[];

    @OneToMany(() => Slot, (slot) => slot.seminarDay, { cascade: true })
    slots!: Slot[];
}