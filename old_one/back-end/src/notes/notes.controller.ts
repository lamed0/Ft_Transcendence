import { Controller, Post, Body, Get, Param, Query, Patch, Delete } from '@nestjs/common';
import { NotesService } from './notes.service';
import { PrismaClient, Prisma } from '@prisma/client';

@Controller('notes')
export class NotesController {
    constructor (private readonly noteService: NotesService){}

    @Get()
    getAll(@Query('archived') archived?: boolean){
        return this.noteService.findAll(archived);
    }

    @Get(':id')
    getOne(@Param('id') id: string){
        return this.noteService.findOne(+id);
    }

    @Post()
    create(@Body() note: Prisma.NoteCreateInput){
        return this.noteService.createNote(note);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() note: Prisma.NoteUpdateInput){
        return this.noteService.updateNote(+id, note);
    }

    @Delete(':id')
    deleteNote(@Param('id') id: string){
        this.noteService.removeNote(+id);
    }
}
