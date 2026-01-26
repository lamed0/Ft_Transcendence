import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { TodosService, Todo } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Controller('todos')
export class TodosController {
    constructor (private readonly todosService: TodosService){}

    @Get()
    getAll(): Todo[]{
        return this.todosService.findAll();
    }

    @Get(':id')
    getOne(@Param('id') id: string): Todo | undefined{
        return this.todosService.findOne(+id);
    }

    @Post()
    create(@Body() dto: CreateTodoDto): Todo | null{
        return this.todosService.create(dto.title);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTodoDto): Todo | null{
        return this.todosService.update(+id, dto.title, dto.completed);
    }

    @Delete(':id')
    deleteUser(@Param('id') id: string): void{
        this.todosService.deleteUser(+id);
    }

}
