const { Router } = require("express");
const { getAllData,UploadIssue, addToCart, Completed } = require("../Controller/Product.Controller");
const authenticate = require("../MiddleWares/Authorization.MiddleWares");
const { UserModel } = require("../models/User.model");
const multer = require("multer")
var random = require('random-name');
console.log(random.middle())

const productRouter = Router();

productRouter.get("/data", async(req,res)=>{
    const { message, status, data } = await getAllData();
    if (status === "error") {
        return res.status(404).send({ message, status });
    }
    return res.status(200).send({ message, status, data });
})

// upload image and data

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"./uploads")
    },
    filename:(req,file,cb)=>{
        cb(null,`${random.middle()}.jpg`)
    },
})
const uploads=multer({storage:storage})
productRouter.post("/uploadIssue", uploads.single("Image_Url"), async(req,res)=>{
    const Mail = req.cookies.auth;
    if (Mail === null || undefined) {
      return res
        .status(401)
        .send({ message: "session expired", status: "user logged out" });
    }
    const { user } = await authenticate(Mail);
    if (user === undefined || user.length === 0) {
        return res
          .status(401)
          .send({ message: "unauthorised user", status: "failed" });
    }
    const { Title,Category, Desc, Number, Status, isCompleted } = req.body
    const { message, status, value } = await UploadIssue( Title, Image_Url, Category,Desc, Name, Number, Mail, Status, isCompleted );
    if (status === "error") {
        return res.status(404).send({ message, status });
    }
    else if (status === "failed") {
        return res.status(201).send({ message, status });
    }
    await UserModel.updateOne(
        { Mail },
        { $push: { Problems: { productId: value._id, } } }
    );
    return res.status(200).send({ message, status });
})

productRouter.get("/:id/addtocart", async(req,res)=>{
    const Mail=req.cookies.auth
    if(Mail===null || undefined){
        return res
        .status(401)
        .send({ message: "session expired", status: "user logged out" });
    }
    const { id } = req.params;
    const { seller } = await authenticate(Mail);
    if (seller === undefined || seller.length === 0) {
        return res
          .status(401)
          .send({ message: "unauthorised user", status: "failed" });
    }
    const { message, status } = await addToCart(id, Mail);
    if (status === "error") {
        return res.status(404).send({ message, status });
    }
    
    return res.status(200).send({ message, status });
})

module.exports = { productRouter }