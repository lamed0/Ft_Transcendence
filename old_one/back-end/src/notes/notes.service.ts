import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';

export interface Notes{
    id: number
    title: string
    content: string
    archived: boolean
}

@Injectable()
export class NotesService {
    // private notes: Notes[] = [];
    // private id = 1;
    constructor( private readonly prisma: DatabaseService) {}

    async findAll(archived?: boolean){
        if (archived === undefined) 
           return this.prisma.note.findMany();
        return this.prisma.note.findMany({
            where: {
                archived: archived,
            },
        });
    }

    async createNote(createNote: Prisma.NoteCreateInput ){
        return this.prisma.note.create({
            data: createNote
        })
    }

    async findOne(id: number)
    {
        return this.prisma.note.findUnique({
            where: {
                id,
            }
        })
    }

    async updateNote(id: number, updateNote: Prisma.NoteUpdateInput){
        return this.prisma.note.update({
            where: {
                id,
            },
            data: updateNote
        })
    }

    async removeNote(id: number){
        return this.prisma.note.delete({
            where: {
                id,
            }
        })
    }
}
