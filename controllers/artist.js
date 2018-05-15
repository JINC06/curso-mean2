'use strict'

var fs = require('fs');
var path = require('path');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getArtist(req, res) {
    var artistId = req.params.id;

    Artist.findById(artistId, (err, artist) => {
        if (err) {
            res.status(500).send({ message: 'Erro en la petición' });
        } else {
            if (!artist) {
                res.status(404).send({ message: 'El artista no existe' });
            } else {
                res.status(200).send({ artist });
            }
        }
    });
}

function getArtists(req, res) {
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    var itemsPerPage = 3;

    Artist.find().sort('name').paginate(page, itemsPerPage, function(err, artists, total) {
        if (err) {
            res.status(500).send({ message: 'Erro en la petición' });
        } else {
            if (!artists) {
                res.status(404).send({ message: 'No hay artistas' });
            } else {
                res.status(200).send({
                    totalItems: total,
                    artists: artists
                });
            }
        }
    });
}


function saveArtist(req, res) {
    var artist = new Artist();

    var params = req.body;
    artist.name = params.name;
    artist.description = params.description;
    artist.image = 'null';

    artist.save((err, artistStored) => {
        if (err) {
            res.status(500).send({ message: 'Error al guardar el artista' });
        } else {
            if (!artistStored) {
                res.status(404).send({ message: 'El artista no ha sido guardado' });
            } else {
                res.status(200).send({ artist: artistStored });
            }
        }
    });
}

function updateArtist(req, res) {
    var artistId = req.params.id;
    var update = req.body;

    Artist.findByIdAndUpdate(artistId, update, (err, artistUpdated) => {
        if (err) {
            res.status(500).send({ message: 'Error al guardar el artista' });
        } else {
            if (!artistUpdated) {
                res.status(404).send({ message: 'El artista no ha sido actualizardo' });
            } else {
                res.status(200).send({ artist: artistUpdated });
            }
        }
    });
}

function deleteArtist(req, res) {
    var artistId = req.params.id;

    Artist.findByIdAndRemove(artistId, (err, artistRemoved) => {
        if (err) {
            res.status(500).send({ message: 'Error al guardar el artist' });
        } else {
            if (!artistRemoved) {
                res.status(404).send({ message: 'El artista no ha sido eliminado' });
            } else {
                //res.status(200).send({ artist: artistRemoved });

                Album.find({ artist: artistRemoved._id }).remove((err, albumRemoved) => {
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
                                        res.status(200).send({ artist: artistRemoved });
                                    }
                                }
                            });

                        }
                    }
                });
            }
        }
    });
}

function uploadImage(req, res) {
    var artistId = req.params.id;
    var fileName = 'No subido...';

    if (req.files) {
        var filePath = req.files.image.path;
        var fileSplit = filePath.split('/');
        var fileName = fileSplit[2];

        var extSplit = fileName.split('\.');
        var fileExt = extSplit[1];

        if (fileExt == 'png' || fileExt == 'jpg' || fileExt == 'gif') {
            Artist.findByIdAndUpdate(artistId, { image: fileName }, (err, artistUpdated) => {
                if (err) {
                    res.status(404).send({ message: 'Error al actualizar la imagen del artista' });
                } else {
                    if (!artistUpdated) {
                        res.status(404).send({ message: 'No se ha podido actualizar la imagen del artista' });
                    } else {
                        res.status(200).send({ artist: artistUpdated });
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
    var pathFile = './uploads/artists/' + imageFile;
    fs.exists(pathFile, function(exists) {
        if (exists) {
            res.sendFile(path.resolve(pathFile));
        } else {
            res.status(404).send({ message: 'No existe la imagen...' });
        }
    });
}

module.exports = {
    getArtist,
    saveArtist,
    getArtists,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImageFile
}