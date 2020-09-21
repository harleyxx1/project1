const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.send('posts Route'));

module.exports = router;