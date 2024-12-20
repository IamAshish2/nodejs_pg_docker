import express from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from "../prismaClient.js";

const router = express.Router();

// register a new user endpoint /auth/register
router.post('/register', async (req,res) => {
    const {username,password} = req.body;
   
    // encrypt the password
    const hashedPassword = bcrypt.hashSync(password,8);

    // save the new user and hashed passwrod to the db
    try {
        // check if the user already exists
        const userExists = await prisma.user.findFirst({
            where:{
                username:username
            },
        });
        if(userExists){
            return res.status(400).send({message:"The user already exists"})
        }

        const user = await prisma.user.create({
            data: {
                username,
                password:hashedPassword
            }
        })

        // default value to the newly created user
        // now that we have an user, i want to add the first todo for them.
        const defautToDo = `Hello :) Add your first todo!`
        await prisma.todo.create({
            data:{
                task:defautToDo,
                userId: user.id
            }
        })

        // Create the jwt token for user authentication and validation
        const token = jwt.sign({id:user.id},
                                process.env.JWT_SECRET_KEY,{expiresIn:'24h'});
        res.json({token});
    } catch (error) {
        console.log(error.message);
        res.sendStatus(503);
    }    
});

router.post('/login', async (req,res) => {
    const {username,password} = req.body;
    try {
        // check the data base
        const user = await prisma.user.findUnique({
            where:{
                username:username
            }
        })

        if(!user){return res.status(404).send({message:"User not found!"})};

        const passwordIsValid = bcrypt.compareSync(password,user.password);
        if(!passwordIsValid){
            return res.status(401).send({message:"Invalid password!"})
        }
        
        // we have a successful authentication if we come to this point
        const token = jwt.sign({id:user.id},process.env.JWT_SECRET_KEY,{expiresIn:'24h'});
        res.json({token});
    } catch (error) {
        console.log(error.message);
        res.sendStatus(503);
    }
});


export default router;