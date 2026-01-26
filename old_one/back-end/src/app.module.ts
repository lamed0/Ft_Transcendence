import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TodosModule } from './todos/todos.module';
import { NotesModule } from './notes/notes.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [UsersModule, TodosModule, NotesModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
