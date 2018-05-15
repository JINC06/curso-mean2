'use strict'

var fs = require('fs');
var path = require('path');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getAlbum(req, res) {
    var albumId = req.params.id;

    Album.findById(albumId).populate({ path: 'artist' }).exec((err, album) => {
        if (err) {
            res.status(500).send({ message: 'Error en la petición' });
        } else {
            if (!album) {
                res.status(404).send({ message: 'El album no existe' });
            } else {
                res.status(200).send({ album });
            }
        }
    });
}

function getAlbums(req, res) {
    var artistId = req.params.artist;

    if (!artistId) {
        var find = Album.find({}).sort('title');
    } else {
        var find = Album.find({ artist: artistId }).sort('year');
    }

    find.populate({ path: 'artist' }).exec((err, albums) => {
        if (err) {
            res.status(500).send({ message: 'Error en la petición' });
        } else {
            if (!albums) {
                res.status(404).send({ message: 'No hay albums' });
            } else {
                res.status(200).send({ albums });
            }
        }
    });
}

function saveAlbum(req, res) {
    var album = new Album();

    var params = req.body;
    album.title = params.title;
    album.description = params.description;
    album.year = params.year;
    album.image = 'null';
    album.artist = params.artist;

    album.save((err, albumStored) => {
        if (err) {
            res.status(500).send({ message: 'Error al guardar el album' });
        } else {
            if (!albumStored) {
                res.status(404).send({ message: 'El album no ha sido guardado' });
            } else {
                res.status(200).send({ album: albumStored });
            }
        }
    });
}

function updateAlbum(req, res) {
    var albumId = req.params.id;
    var update = req.body;

    Album.findByIdAndUpdate(albumId, update, (err, albumUpdated) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor' });
        } else {
            if (!albumUpdated) {
                res.status(404).send({ message: 'No se ha actualizado el album' });
            } else {
                res.status(200).send({ album: albumUpdated });
            }
        }
    });
}


function deleteAlbum(req, res) {
    var albumId = req.params.id;

    Album.findByIdAndRemove(albumId, (err, albumRemoved) => {
        if (err) {
            res.status.send(500).send({ message: 'Error al eliminar el album' });
        } else {
            if (!albumRemoved) {
                res.status(404).send({ message: 'El album no ha sido eliminado' });
            } else {

                Song.find({ album: albumRemoved._id }).remove((err, songRemoved) => {
                    if (err) {
                        res.status(500).send({ message: 'Error al eliminar la cancion' });
                    } else {
                        if (!songRemoved) {
                            res.status(404).send({ message: 'La cancion no ha sido eliminada' });
                        } else {
                            res.status(200).send({ album: albumRemoved });
                        }
                    }
                });

            }
        }
    });
}


function uploadImage(req, res) {
    var albumId = req.params.id;
    var fileName = 'No subido...';

    if (req.files) {
        var filePath = req.files.image.path;
        var fileSplit = filePath.split('/');
        var fileName = fileSplit[2];

        var extSplit = fileName.split('\.');
        var fileExt = extSplit[1];

        if (fileExt == 'png' || fileExt == 'jpg' || fileExt == 'gif') {
            Album.findByIdAndUpdate(albumId, { image: fileName }, (err, albumUpdated) => {
                if (err) {
                    res.status(404).send({ message: 'Error al actualizar la imagen del album' });
                } else {
                    if (!albumUpdated) {
                        res.status(404).send({ message: 'No se ha podido actualizar la imagen del album' });
                    } else {
                        res.status(200).send({ album: albumUpdated });
                    }
                }
            });
        } else {
            res.status(400).send({ message: 'Extensión del archivo no es correcta' });
        }
    } else {
        res.status(400).send({ message: 'No has subido ninguna imagen' });
    }
}

function getImageFile(req, res) {
    var imageFile = req.params.imageFile;
    var pathFile = './uploads/albums/' + imageFile;
    fs.exists(pathFile, function(exists) {
        if (exists) {
            res.sendFile(path.resolve(pathFile));
        } else {
            res.status(404).send({ message: 'No existe la imagen...' });
        }
    });
}

module.exports = {
    getAlbum,
    saveAlbum,
    getAlbums,
    updateAlbum,
    deleteAlbum,
    uploadImage,
    getImageFile
}