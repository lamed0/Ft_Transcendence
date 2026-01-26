import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
    // create(users: Users){
    //     this.users.push(users);
    // }

    findAll(){
        return ["Med", "maria"];
    }
}
