const express = require('express');
const router = express.Router();
router.get("/", (req, res) => {
    return res.send("OrderReleaseRouter Router is working!");
});

module.exports = router;