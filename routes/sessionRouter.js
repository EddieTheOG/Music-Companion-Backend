const express = require("express");
const router = express.Router();

router.get('/session/:id');

router.get('/session');

router.post('/session/create')