const express=require("express")

const app=express()

app.use(express.json())

app.listen("localhost",4000,()=>{
    console.log("server started at port number 4000")
})