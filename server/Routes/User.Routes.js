const { Router }=require("express");
const { SignUpUser,LoginUser } = require("../Controller/User.controller");
const userRouter = Router();

// create user
userRouter.post("/signup", async(req,res)=>{
    const { First_Name,Last_Name,Mobile,Mail,Password,role } = req.body
    if(Mobile.toString().length!==10){
        return res.send(200).send({message:"Invalid Mobile Number"})
    }
    const { message, status }= await SignUpUser(
        First_Name,
        Last_Name,
        Mobile.toString(),
        Mail,
        Password,
        role
    )
    if (status === "error") {
        return res.status(404).send({ message, status });
    } else if (status === "exists") {
        return res.status(200).send({ message, status });
    }
    return res.status(200).send({ message, status });
})

//login
userRouter.post("/login", async (req, res) => {
    const { Mobile, Password } = req.body;
    if (Mobile.toString().length !== 10) {
        return res.status(200).send({ message: "Invalid Mobile Number" });
    }
    const { message, status, value } = await LoginUser(Mobile.toString(), Password);
    if (status === "error") {
      return res.status(404).send({ message, status });
    } else if (status === "failed") {
      return res.status(201).send({ message, status });
    }
    return res
      .cookie("auth", value, { httpOnly: true, secure: false, maxAge:86400000 })
      .status(200)
      .send({ message, status });
});

userRouter.get("/logout",async(req,res)=>{
    res.clearCookie("auth").status(200).send(
        {message:"user logout successfully", status:"success"}
    )
})

module.exports = userRouter