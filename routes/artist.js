'use strict'

var express = require('express');
var ArtistController = require('../controllers/artist');

var api = express.Router();
var mdAuth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var mdUpload = multipart({ uploadDir: './uploads/artists' });

api.get('/artist/:id', mdAuth.ensureAuth, ArtistController.getArtist);
api.post('/artist', mdAuth.ensureAuth, ArtistController.saveArtist);
api.get('/artists/:page?', mdAuth.ensureAuth, ArtistController.getArtists);
api.put('/artist/:id', mdAuth.ensureAuth, ArtistController.updateArtist);
api.delete('/artist/:id', mdAuth.ensureAuth, ArtistController.deleteArtist);
api.post('/upload-image-artist/:id', [mdAuth.ensureAuth, mdUpload], ArtistController.uploadImage);
api.get('/get-image-artist/:imageFile', ArtistController.getImageFile);

module.exports = api;