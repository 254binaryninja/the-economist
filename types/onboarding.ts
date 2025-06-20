import { z } from "zod"

export const formSchema = z.object({
    userName:z.string().min(4,{
        message:"Username must be at least 4 characters long"
    }).max(50,{
        message:"Username must be at most 50 characters long"
    }),
    occupation:z.string().min(4,
        {
            message:"Occupation must be at least 4 characters long"
        }
    ).max(50,{
        message:"Occupation must be at most 50 characters long"
    }),
    student:z.boolean(),
})