// controllers/hoots.js

const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const Hoot = require('../models/hoot.js');
const router = express.Router();

// ========== Public Routes ===========

// ========= Protected Routes =========


router.use(verifyToken); //verifies via the middleware that was given to us that the token is valid

router.post('/', async (req, res) => {
    try {
        req.body.author = req.user._id;
        const hoot = await Hoot.create(req.body);
        hoot._doc.author = req.user;
        res.status(201).json(hoot)
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
})

router.get('/', async (req, res) => {
    try {
        const hoots = await Hoot.find({}) //find all hoots
            .populate('author') //popuplate the author property with the document object from the user collection
            .sort({ createdAt: 'desc' }); //sort by createAt in desc order
        res.status(200).json(hoots);
    } catch (error) {
        res.status(500).json(error);
    }
});



router.get('/:hootId', async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId)
            .populate('author');
        res.status(200).json(hoot);
    } catch (error) {
        res.status(500).json(error);
    }
});



router.put('/:hootId', async (req, res) => {
    try {
        // Find the hoot:
        const hoot = await Hoot.findById(req.params.hootId);

        // Check permissions:
        if (!hoot.author.equals(req.user._id)) {
            return res.status(403).send("You're not allowed to do that!");
        }

        // Update hoot:
        const updatedHoot = await Hoot.findByIdAndUpdate(
            req.params.hootId,
            req.body,
            { new: true }
        );

        // Append req.user to the author property:
        updatedHoot._doc.author = req.user;

        // Issue JSON response:
        res.status(200).json(updatedHoot);
    } catch (error) {
        res.status(500).json(error);
    }
});



router.delete('/:hootId', async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId);

        //these lines verify the user's bearer token (which has the username in it) matches the auther's
        //name in the hoot. Ensures that other users are not able to update each others hoot
        //only the auther of the hoot may update their hoot
        //these lines check for that
        if (!hoot.author.equals(req.user._id)) {
            return res.status(403).send("You're not allowed to do that!");
        }

        const deletedHoot = await Hoot.findByIdAndDelete(req.params.hootId);
        res.status(200).json(deletedHoot);
    } catch (error) {
        res.status(500).json(error);
    }
});



// controllers/hoots.js

router.post('/:hootId/comments', async (req, res) => {
    try {
        req.body.author = req.user._id;
        const hoot = await Hoot.findById(req.params.hootId); //find the hoot you want to place a comment on
        hoot.comments.push(req.body); //add to the list of comments 
        await hoot.save(); //save that data in the database

        // Find the newly created comment:
        const newComment = hoot.comments[hoot.comments.length - 1];


        console.log(hoot.comments, newComment)

        //add to the auther property the req.user property
        newComment._doc.author = req.user;

        // Respond with the newComment:
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json(error);
    }
});



router.put('/:hootId/comments/:commentId', async (req, res) => {

    try {
        const hoot = await Hoot.findById(req.params.hootId); //gets the hoot by id
        const comment = hoot.comments.id(req.params.commentId); // find the specific comment from that hoot using the comment id 
        comment.text = req.body.text; //now that found the specific comment, we can update the text for it using the req.body.text value
        await hoot.save(); //save that to the DB
        res.status(200).json({ message: 'Ok' }); //return ok if okay
    } catch (err) {
        res.status(500).json(err);
    }
});


router.delete('/:hootId/comments/:commentId', async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId);//gets the hoot by id 
        hoot.comments.remove({ _id: req.params.commentId }); //using the commentId remove that comment
        await hoot.save(); //save that to the DB
        res.status(200).json({ message: 'Ok' });//return ok if okay
    } catch (err) {
        res.status(500).json(err);
    }
});



module.exports = router;
