var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');
const {body, validationResult} = require("express-validator");
const bookinstance = require('../models/bookinstance');


// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {

    BookInstance.find()
      .populate('book')
      .exec(function (err, list_bookinstances) {
        if (err) { return next(err); }
        // Successful, so render
      
        res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
      });
  
  };

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res, next){
    BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function(err, book_instance){
        if (err){
            return next(err);
        }
        if (book_instance==null){
            err = new Error("No book instance found");
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render("bookinstance_detail", {title:"Copy" + book_instance.title, instance_book:book_instance});

    });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next){
    Book.find({}, 'title')
    .sort([['title']])
    .collation({locale: "en" })
    .exec(function (err, books){
        if (err){return next(err);} 
        res.render('bookinstance_form', {title:'Create BookInstance', books:books});  
    });    
}; 

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    body('book', 'Book must not be empty').trim().isLength({min:1}).escape(),
    body('imprint', 'Imprint must not be empty').trim().isLength({min:1}).escape(),
    body('date_due', 'Invalid date').optional({checkFalsy:true}).isISO8601().toDate(),
    body('status').escape(),
    function(req, res, next){
        let errors = validationResult(req);

        let bookinstance = new BookInstance({
            book:req.body.book, 
            imprint:req.body.imprint,
            due_back:req.body.due_back,
            status:req.body.status
        });
        
        if (!errors.isEmpty()){
            Book.find({}, 'title')
            .sort([['title']])
            .collation({locale: "en" })
            .exec(function (err, books){
                if (err){return next(err);} 
                console.log(bookinstance);
                return res.render('bookinstance_form', {title:'Create BookInstance', books:books, bookinstance:bookinstance, errors:errors.array()});  
            });  
            return;
        }
        
        bookinstance.save(function(err){
            if (err){return next(err);}
            
            res.redirect(bookinstance.url);
        });
    }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res){
    res.send('NOT IMPLEMENTED: BookInstance delete GET');
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res){
    res.send('NOT IMPLEMENTED: BookInstance delete POST');
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res){
    res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function(req, res){
    res.send('NOT IMPLEMENTED: BookInstance update POST');
};
