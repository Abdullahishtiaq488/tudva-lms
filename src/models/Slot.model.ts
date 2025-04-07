// backend/src/models/Slot.model.ts
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import { SeminarDay } from "./SeminarDay.model"; // Import SeminarDay
import { Module } from "./Module.model";

@Entity("slots")
export class Slot extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    startTime!: string; // e.g., "09:00"

    @Column()
    endTime!: string;   // e.g., "10:30"

    @Column({ default: true }) // Active by default
    isActive!: boolean;

    @ManyToOne(() => SeminarDay, (seminarDay) => seminarDay.slots)
    seminarDay!: SeminarDay; // Relationship with SeminarDay

    @Column({nullable: true})
    seminarDayId?: string; // Add seminarDayId to the Slot entity

    @OneToMany(() => Module, module => module.slot)
    lectures?: Module[]; // Each slot can have multiple lectures

    @Column({ nullable: true }) // Add a column for storing the slot number
    slotNumber?: number;

}