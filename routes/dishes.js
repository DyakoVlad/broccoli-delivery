const express = require('express');
const router = express.Router();
const {isEmpty} = require('../helpers/upload-helper');
const Dish = require('../models/Dish');
const User = require('../models/User');
const fs = require('fs');
const {userAuthenticated} = require('../helpers/auth-helper');
const cyrillicToTranslit = require('cyrillic-to-translit-js');


router.all('/*', userAuthenticated, (req, res, next) => {
    User.deleteMany({isVerified: false}).then(userDeleted => {});
    next();
});

// ROUTER

router.get('/', (req, res) => {
    res.render('dishes/index');
});

router.get('/list', (req, res) => {
    Dish.find({}).then((dishes) => {
        res.render('dishes/list', {dishes: dishes});
    });

});

router.get('/create', (req, res) => {
    console.log(req.user);
    res.render('dishes/create');
});

router.post('/create', (req, res) => {
    let errors = [];

    if (!req.body.name) {
        errors.push({message: 'You must enter a name'})
    }

    if (!req.body.price) {
        errors.push({message: 'You must enter a price'})
    }

    if (!(errors.length > 0)) {
        let filename = 'broccoli.png';
        if (!isEmpty(req.files)) {
            let file = req.files.file;
            filename = Date.now() + '-' + file.name;
            file.mv('./public/uploads/' + filename, (err) => {
                if (err) throw err;
            });
        }
        let vegan = false;
        if (req.body.vegan) {
            vegan = true;
        }
        let NewDish = new Dish({
            name: req.body.name,
            slug: cyrillicToTranslit().transform(req.body.name.toLowerCase(), "_"),
            vegan: vegan,
            category: req.body.category,
            price: req.body.price,
            img: filename
        });

        NewDish.save().then(dishSaved => {
            req.flash('success_message', `Post '${dishSaved.name}' was created successfully.`);
            res.redirect('/dishes/list')
        });
    }
    else {
        res.render('dishes/create', {message: errors})
    }
});

router.get('/:slug', (req, res) => {
    Dish.findOne({slug: req.params.slug}).then((dish) => {
        res.render('dishes/info', {item: dish});
    })
});

router.get('/edit/:id', (req, res) => {
    Dish.findOne({_id: req.params.id}).then((dish) => {
        res.render('dishes/edit', {item: dish});
    })
});

router.put('/edit/:id', (req, res) => {
    let errors = [];

    if (!req.body.name) {
        errors.push({message: 'You must enter a name'})
    }

    if (!req.body.price) {
        errors.push({message: 'You must enter a price'})
    }

    if (!(errors.length > 0)) {
        let filename = 'broccoli.png';
        if (!isEmpty(req.files)) {
            let file = req.files.file;
            filename = Date.now() + '-' + file.name;
            file.mv('./public/uploads/' + filename, (err) => {
                if (err) throw err;
            });
        }
        let vegan = false;
        if (req.body.vegan) {
            vegan = true;
        }
        Dish.findOne({_id: req.params.id}).then((dish) => {
            dish.name = req.body.name;
            dish.slug = cyrillicToTranslit().transform(req.body.name.toLowerCase(), "_");
            dish.vegan = vegan;
            dish.category = req.body.category;
            dish.price = req.body.price;
            dish.img = filename;
            dish.save().then((dishSaved) => {
                req.flash('success_message', `Post '${dishSaved.name}' was edited successfully.`);
                res.redirect('/dishes/list');
            })
        });
    }
    else {
        Dish.findOne({_id: req.params.id}).then((dish) => {
            res.render('dishes/edit', {message: errors, item: dish});
        });
    }
});

router.delete('/delete/:id', (req, res) => {

    Dish.findOne({_id: req.params.id}).then(deletedDish => {
        fs.unlink('./public/uploads/' + deletedDish.img, (err) => {
            console.log(err);
            deletedDish.remove();
            req.flash('success_message', `Dish '${deletedDish.name}' was deleted successfully.`);
            res.redirect('/dishes/list')
        });
    })
});

module.exports = router;