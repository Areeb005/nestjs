import { Body, Controller, Get, NotFoundException, Param, Post, UseGuards, UsePipes } from '@nestjs/common';
import { JoiValidationPipe } from 'src/common/pipes/joi-validation.pipe';
import * as Joi from 'joi';
import { UserService } from './user.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';


@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin') // Applies to all routes in this controller
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    @UsePipes(new JoiValidationPipe(
        Joi.object({
            name: Joi.string().min(2).max(50).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
        })
    ))
    async createUser(@Body() body: { name: string; email: string; password: string }) {
        const user = await this.userService.create(body);
        return { message: 'User created successfully', user };
    }


    @Get()
    async getUsers() {
        const users = await this.userService.getAllUsers();
        return { users };
    }

    @Get(':id')
    @Roles("admin", "user")
    async getUserByID(@Param('id') id: string) {
        const user = await this.userService.getUserById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return { user };
    }
}
