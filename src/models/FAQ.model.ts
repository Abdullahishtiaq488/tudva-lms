// backend/src/models/FAQ.model.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Course } from "./Course.model"; // Import Course

@Entity("faqs")
export class FAQ extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    question!: string;

    @Column("text")
    answer!: string;

    @ManyToOne(() => Course, (course) => course.faqs)
    course!: Course; // Relationship to Course
    @Column()
    course_id!: string;

    @Column({nullable: true}) // New field for sorting
    sortOrder?: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}