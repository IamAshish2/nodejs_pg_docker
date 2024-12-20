import express from 'express'
import prisma from '../prismaClient.js';

const router = express.Router();

// Get all todos
router.get('/',async (req,res) => {
    try {
        const todos = await prisma.todo.findMany({
            where:{
                userId:req.userId
            }
        });
        res.json(todos);
    } catch (error) {
        console.log(error.message);
        res.sendStatus(503);
    }
});

//create a new todo
router.post('/',async (req,res) => {
    const {task} = req.body;
    const todo = await prisma.todo.create({
        data:{
            // task:task,
            task,
            userId:req.userId
        }
    })
    res.json(todo);
})

// update a todo
router.put('/:id',async(req,res) => {
    const {task,completed} = req.body; // destructure the completed status from the body
    const {id} = req.params; // get the id from the req
    const updateTodo = await prisma.todo.update({
        where:{
            id: parseInt(id),
            userId: req.userId
        },
        data:{
            completed: !! completed,
            task
        }
    })
     res.json({messgae:'todo has been updated!',updateTodo})
})

router.delete('/:id',(req,res) => {
    const {id} = req.params;
    const userId = req.userId;
    const deleteTodo = prisma.user.delete({
        where:{
            id: parseInt(id),
            userId
        }
    })

    res.json({message:"the todo has been deleted.",deleteTodo});
})

export default router;