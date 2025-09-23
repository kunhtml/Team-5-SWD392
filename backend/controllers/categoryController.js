const { Category } = require("../models");

const listCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: true },
      order: [["name", "ASC"]],
      attributes: ["id", "name"],
    });
    res.json({ categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { listCategories };
