var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async')
const {body, validationResult} = require("express-validator");

// Display list of all Genre.
exports.genre_list = function(req, res, next){

    Genre.find()
    .sort([["name", "ascending"]])
    .exec(function(err, list_genres)
    {
        if (err) return next(err);
        //Successful, so render
        res.render('genre_list', {title:"Genre list", genre_list:list_genres});
    });
    // res.send('NOT IMPLEMENTED: Genre list');
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next){
    async.parallel({
        genre: function(callback){            
            Genre.findById(req.params.id).exec(callback);            
        },

        genre_books: function(callback){
            Book.find({'genre':req.params.id}).exec(callback);           
        },
    }, function(err, results){
        if (err){return next(err);}
        if (results.genre==null){ // No result.
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        
        res.render('genre_detail', {title:'Genre Detail', genre: results.genre, genre_books: results.genre_books});        
    }
    );
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res){
    res.render('genre_form', {title: 'Create Genre'});
};

// Handle Genre create on POST.
exports.genre_create_post = [
    // Validate and santise the name field.
    body('name', 'Genre name required').trim().isLength({min: 1}).escape(),
    
    // Process request after validation and santitization
    (req, res, next)=>{
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        
        // Create a genre object with escaped and trimmed data.
        var genre = new Genre(
            {name: req.body.name}
        );
         
        if (!errors.isEmpty())
        {
            // There are errors. Render the form again with sanitized values/error messages.
            
            res.render('genre_form', {title: 'Create Genre', genre: genre, errors:errors.array()});
            
            return ;
        }
        else{
            // Data from form is valid.
            // Check if Genre with same name already exists
            
            Genre.findOne({'name': req.body.name})
            .exec(function(err, found_genre){
                if (err){return next(err);}

                if (found_genre) {
                    // Genre exists, redirect to its detail page.
                    res.redirect(found_genre.url);
                }
                else{
                    genre.save(function (err){
                        if (err) { return next(err);}
                        // Genre save. Redirect to genre detail page.
                        res.redirect(genre.url);
                    });
                }
            });
        }
    }

];

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res, next){
    
    async.parallel({genre:function(callback){
        Genre.findById(req.params.id)
        .exec(callback);
    },
        books:function(callback){
            Book.find({genre:req.params.id})
            .exec(callback);
        }
    },function(err, results){
        if (err){next(err);}
        if (results.genre==null)
        {
            err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        return res.render('genre_delete', {title:'Delete genre', books:results.books, genre:results.genre});
    });
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res, next){
   
    Genre.findByIdAndDelete(req.body.genreid)
    .exec(function(err){
        if (err){return next(err);}
        return res.redirect('/catalog/genres');
    });
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res, next){
    Genre.findById(req.params.id)
    .exec(function(err, genre){
        if (err){return next(err);}
        return res.render('genre_form', {title:'Update Genre', genre:genre});
    });
};

// Handle Genre update on POST.
exports.genre_update_post = [
    body('name', "Genre should not be empty").trim().isLength({min:1}).escape(),
    function(req, res, next){
        let errors = validationResult(req);
        let genre = new Genre({
            name:req.body.name,
            _id:req.params.id
        });
        if (!errors.isEmpty()){            
            return res.render('genre_form', {title:'Update Genre', genre:genre, errors:errors.array()});             
        }
        
        Genre.findByIdAndUpdate(req.params.id, genre, function(err, thegenre){
            if (err){return next(err);}
            return res.redirect(thegenre.url);
        });
    }
];
