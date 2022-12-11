const mongoose = require('mongoose');
const authorModel = require('../model/authorModel');
const blogModel = require('../model/blogmodel');

const createBlog = async function (req, res) {
    try {
        let data = req.body;
        if (Object.keys(data).length === 0) {
            return res.status(400).send({ Status: false, msg: "Please enter all data" });
        }

        if (!data.title || data.title == "") {
            return res.status(400).send({ Status: false, msg: "Please enter title of the blog " });
        } else {
            data.title = data.title.trim()
        }

        if (!data.body || data.body == "") {
            return res.status(400).send({ Status: false, msg: "Please enter body" });
        } else {
            data.body = data.body.trim()
        }

        if (!data.authorId || data.authorId == "") {
            return res.status(400).send({ Status: false, msg: "Please enter authorId" });
        } else {
            data.authorId = data.authorId.trim()
        }

        if (!data.category || data.category == "")
            return res.status(400).send({ Status: false, msg: "Please enter category" });
        else data.category = data.category.trim()

        if (data.authorId !== req.authorId)
            return res.status(401).send({ Status: false, msg: "authorisation failed" });

        if (data.isPublished === true)
            data.publishedAt = Date.now()

        let savedData = await blogModel.create(data);
        res.status(201).send({ msg: savedData })

    } catch (err) {
        res.status(500).send(err.message);
    }
}

//...................................................................GET blogs Api

const getBlogs = async function (req, res) {
    try {
        if (req.query.authorId) {
            if (!mongoose.isValidObjectId(req.query.authorId))
                return res.status(400).send({ status: false, msg: "Please enter valid authorId" });
        }

        let blogFound = await blogModel.find(req.query);
        // console.log(blogFound);
        let len = blogFound.length;
        let arr = [];

        for (let i = 0; i < len; i++) {
            if (blogFound[i].isDeleted == false && blogFound[i].isPublished == true)
                arr.push(blogFound[i]);
        }

        if (arr.length > 0) {
            res.status(200).send({ status: true, data: arr, count: arr.length });
        } else {
            res.status(404).send({ status: false, msg: "No blogs found" });
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
}


//.............................................................PUT Api

const update = async function (req, res) {
    try {
        let data = req.body
        let blogId = req.params.blogId

        if (Object.keys(data).length == 0)
            return res.status(404).send({ msg: "No data for update " })

        if (!mongoose.isValidObjectId(blogId)) 
        return res.status(404).send({ Status: false, msg: " please enter valid objectId" })

        let findBlog = await blogModel.findById(blogId)
        if(!findBlog) 
        return res.status(404).send({msg: "invalid blogId"})

        if(findBlog.authorId._id.toString() !== req.authorId) 
        return res.status(404).send({Status: false, msg: "Authorisation failed"})

        if(findBlog.isDeleted == true) 
        return res.status(404).send({msg:"blog is already deleted"})

        if(findBlog.isDeleted == false){
            let updatedBlog = await blogModel.findOneAndUpdate({_id: blogId}, {
                $set:{
                    title: data.title,
                    body: data.body,
                    category:data.category,
                    publishedAt: Date.now(),
                    isPublished:true
                },
                $push: {
                    tags: data.tags,
                    subcategory: data.subcategory
                }
            }, {new: true, upsert: true})
            return res.status(200).send(updatedBlog)
        }

    } catch (err) {
        res.status(500).send(err.message);
    }
}

//.....................................................................Delete

const deleteByBlogId = async function(req, res){
    try{
        let blogId = req.params.blogId

        if(!mongoose.isValidObjectId(blogId)) 
        return res.status(400).send({Status: false, msg:"Please enter valid blogId"})

        let data = await blogModel.findById(blogId)

        if(!data) 
        return res.status(404).send({ status: false, msg: "Blog id does not exists" })

        if(data.authorId._id.toString() !== req.authorId) 
            return res.status(401).send({Status: false, msg:"Authorisation failed"})

         if(data)   {
            if(data.isDeleted == false){
                await blogModel.findOneAndUpdate({ _id: blogId}, {isDeleted: true, deletedAt: Date.now()}, {new: true} )
                res.status(200).send({Status: true, msg: "data deleted"})
            } else{
                res.status(200).send({Status: false, msg: "data already deleted"})
            }
         }
    } catch (err) {
        res.status(500).send(err.message);
    }
}


//.........................................................DeleteByQuery........................................................//

const deleteByQuery = async function(req, res){
    try{
        let filterdata = { isDeleted: false, authorId: req.authorId}
        let  {category, subcategory, tags, authorId } = req.query

        if(authorId){
            if(!mongoose.isValidObjectId(req.query.authorId))
            return res.status(400).send({Status: false, msg: "Please enter valid authorId"})
            else 
            filterdata.authorId = authorId
        }

        if(category){
            filterdata.category = category
        }
        if(subcategory){
            filterdata.subcategory = subcategory
        }

        if(tags){
            filterdata.tags = tags
        }

        let data = await blogModel.findOne(filterdata)

        if(!data)
            return res.status(404).send({Status: false, msg: "invalid id"})

        if(data.authorId._id.toString() !== req.authorId)
        return res.status(401).send({Status: false, msg: "authorisation failed"})

        let updatedData = await blogModel.updateOne(filterdata, { isDeleted: true}, {new: true})
        res.status(200).send({Status: true, msg: "data deleted"})
    } catch (err) {
        res.status(500).send(err.message);
    }
}


module.exports = {createBlog, getBlogs, update, deleteByBlogId, deleteByQuery}