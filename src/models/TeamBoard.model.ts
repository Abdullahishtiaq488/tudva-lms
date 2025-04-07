import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { TeamList } from "./TeamList.model";

@Entity("team_boards")
export class TeamBoard extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    title!: string;

    @Column("text", { nullable: true })
    description?: string;

    @OneToMany(() => TeamList, (list) => list.board, { cascade: true })
    lists!: TeamList[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}