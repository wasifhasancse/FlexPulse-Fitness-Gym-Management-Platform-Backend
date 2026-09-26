const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favorite.controller");

router.post("/favorites", favoriteController.toggleFavorite);
router.delete("/favorites", favoriteController.deleteFavorite);
router.get("/favorites", favoriteController.getFavorites);
router.get("/favorites/check", favoriteController.checkFavorite);

module.exports = router;
