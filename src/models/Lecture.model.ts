// backend/src/models/Lecture.model.ts
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { Course } from "./Course.model"; 
import { Slot } from "./Slot.model";

@Entity("lectures")
export class Lecture extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column("text", { nullable: true })
    title!: string;

    @Column("text", { nullable: true })
    moduleName!: string; // New field to group lectures by module

    @Column("text", { nullable: true }) 
    topicName?: string; //Added topic to lecture.

    @Column("text", { nullable: true }) // Use "text" for longer descriptions
    description?: string; //Added topic to lecture.

    @Column({ nullable: true })
    videoUrl?: string; //  Store the video/content URL.

    @ManyToOne(() => Course, (course) => course.lectures)
    @JoinColumn({ name: "course_id" }) 
    course!: Course;
    
    @Column()
    course_id!: string;  // This stores the actual foreign key
    
    @ManyToOne(() => Slot, (slot) => slot.lectures)
    @JoinColumn({ name: "slot_id" }) // Specify foreign key column name
    slot?: Slot | null; // Allow null, as a lecture *might* not be assigned to a slot.

    @Column({nullable: true}) // New field for sorting
    sortOrder?: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}