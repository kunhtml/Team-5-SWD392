const express = require("express");
const { listCategories } = require("../controllers/categoryController");

const router = express.Router();

// Public: list active categories
router.get("/", listCategories);

module.exports = router;
