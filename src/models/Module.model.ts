import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from "typeorm";
import { Course } from "./Course.model";
import { Slot } from "./Slot.model";

@Entity("modules")
export class Module extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    title!: string;

    @Column("text", { nullable: true })
    description?: string;

    @ManyToOne(() => Course, (course) => course.modules)
    course!: Course;

    @ManyToOne(() => Slot, { nullable: true }) // Allow null for flexible recorded courses
    slot?: Slot | null;

    @Column()
    moduleNumber!: number; // To maintain the order of modules within a course
}