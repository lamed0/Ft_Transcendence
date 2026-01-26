import { Injectable } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';

export interface Todo{
    id: number
    title: string
    completed: Boolean
}

@Injectable()
export class TodosService {
    private todos: Todo[] = [];
    private id = 1;

    findAll(){
        return this.todos;
    }

    findOne(id: number){
        return this.todos.find(t => t.id === id);
    }

    create(title: string){
        const todo = { id: this.id++, title, completed: false };
        this.todos.push(todo);
        return todo;
    }

    update(id: number, title?: string, completed?: boolean){
        const todo = this.findOne(id);
        if(!todo) return null;

        if(title !== undefined) todo.title = title;
        if(completed !== undefined) todo.completed = completed;
        return todo;
    }

    deleteUser(id: number){
        this.todos = this.todos.filter(t => t.id !== id);
    }
}
