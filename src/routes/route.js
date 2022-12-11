const express = require('express');
const router = express.Router();

const authorController = require('../controllers/authorController');
const blogcontroller = require('../controllers/blogController');
const middleware = require("../middleware/auth")


router.post('/createAuthor', authorController.createAuthor);

router.get('/authors', authorController.authors );

router.post("/login", authorController.login)

//..........................Blog
router.post("/blogs", middleware.tokenChecker, blogcontroller.createBlog )

router.get("/blogs", middleware.tokenChecker, blogcontroller.getBlogs)

router.put("/blogs/:blogId", middleware.tokenChecker, blogcontroller.update)


router.delete("/blogs/:blogId", middleware.tokenChecker, blogcontroller.deleteByBlogId)

router.delete("/blogs", middleware.tokenChecker, blogcontroller.deleteByQuery)

module.exports = router;