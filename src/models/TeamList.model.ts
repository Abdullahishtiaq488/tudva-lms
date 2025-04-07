import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, BaseEntity } from "typeorm";
import { TeamBoard } from "./TeamBoard.model";
import { TeamCard } from "./TeamCard.model";

@Entity("team_lists")
export class TeamList extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    title!: string;

    @ManyToOne(() => TeamBoard, (board) => board.lists)
    board!: TeamBoard;

    @OneToMany(() => TeamCard, (card) => card.list, { cascade: true })
    cards!: TeamCard[];

    @Column({ type: 'integer', default: 0 }) // Column to store the order/position
    listOrder!: number;
}