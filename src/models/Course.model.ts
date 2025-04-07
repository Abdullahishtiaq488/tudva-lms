// backend/src/models/Course.model.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./User.model";
import { Lecture } from "./Lecture.model";
import { FAQ } from "./FAQ.model";
import { Tag } from "./Tag.model";
import { SeminarDay } from "./SeminarDay.model";
import { Booking } from "./Booking.model";  // Import Booking
import { Module } from "./Module.model";

@Entity("courses")
export class Course extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column("text", { nullable: true })
  short_description?: string;

  @Column("text", { default: 'recorded' })
  format?: string;

  @Column("text", { nullable: true })
  description?: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  level?: string;

  @Column({ nullable: true })
  language?: string;

  @Column({ nullable: true })
  modules_count?: number;

  // Removed course_type as it's redundant with format field

  @Column({ nullable: true })
  color?: string;

  @Column({ nullable: true })
  icon?: string;

  @Column({ nullable: true })
  promo_video_url?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.createdCourses) //  user.createdCourses
  @JoinColumn({ name: "instructor_id" }) // Use instructor_id as the FK
  instructor!: User;

  @Column() // Explicitly define the foreign key column.
  instructor_id!: string;

  @OneToMany(() => Lecture, (lecture) => lecture.course, { cascade: true })
  lectures!: Lecture[];

  @OneToMany(() => Module, (module) => module.course, { cascade: true })
  modules!: Module[];

  @OneToMany(() => FAQ, (faq) => faq.course, { cascade: true })
  faqs!: FAQ[];

  @OneToMany(() => Tag, (tag) => tag.course, { cascade: true })
  tags!: Tag[];

  @OneToMany(() => Booking, (booking) => booking.course) // One course can have many bookings
  bookings!: Booking[];

  @ManyToOne(() => SeminarDay, (seminarDay) => seminarDay.courses)
  @JoinColumn({ name: "seminarDayId" })
  seminarDay!: SeminarDay;

  @Column({ type: "uuid", nullable: true })
  seminarDayId?: string;

  @Column({ default: 'pending' })
  status!: string; // e.g., "pending", "approved", "rejected"
}