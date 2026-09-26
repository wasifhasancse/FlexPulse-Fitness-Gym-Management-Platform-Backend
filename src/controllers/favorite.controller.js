const FavoriteModel = require("../models/favorite.model");
const { ensureUserActive } = require("../middlewares/userCheck.middleware");

// add or remove toggle a class from favorites
const toggleFavorite = async (req, res, next) => {
  try {
    const { userId, classId } = req.body;

    const activeResult = await ensureUserActive({ userId }, res);
    if (!activeResult.ok) return;

    const existing = await FavoriteModel.findOne({ userId, classId });
    if (existing) {
      await FavoriteModel.delete({ userId, classId });
      return res.status(200).json({
        isFavorite: false,
        message: "Removed this class from favorites",
      });
    } else {
      await FavoriteModel.create({
        ...req.body,
        createdAt: new Date(),
      });
      return res
        .status(200)
        .json({ isFavorite: true, message: "Added this class to favorites" });
    }
  } catch (error) {
    next(error);
  }
};

// delete a class from favorites
const deleteFavorite = async (req, res, next) => {
  try {
    const { userId, classId } = req.body;
    const result = await FavoriteModel.delete({ userId, classId });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// get all favorite classes by user id
const getFavorites = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const favorites = await FavoriteModel.find({ userId });
    res.status(200).json(favorites);
  } catch (error) {
    next(error);
  }
};

// check if a class is in user's favorites
const checkFavorite = async (req, res, next) => {
  try {
    const { userId, classId } = req.query;
    const existing = await FavoriteModel.findOne({ userId, classId });
    res.status(200).json({ isFavorite: !!existing });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleFavorite,
  deleteFavorite,
  getFavorites,
  checkFavorite,
};
