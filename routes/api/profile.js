const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/Users');
const {
    check,
    validationResult
} = require('express-validator');
const {
    request
} = require('express');

router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.userid,
        }).populate('user', [
            'name',
            'avatar'
        ]);

        if (!profile) {
            return res.status(400).json({
                message: 'There is no profile for this user '
            });
        }

        res.json('profile')
    } catch (err) {
        res.status(500).send('Server error')
    }
});

router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;

    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    profileFields.social = {};
    if (twitter) profileFields.social.twitter = company;
    if (facebook) profileFields.social.facebook = facebook;
    if (youtube) profileFields.social.youtube = youtube;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
        let profile = await Profile.findOne({
            user: req.user.id
        });

        if (profile) {
            profile = await Profile.findOneAndUpdate({
                user: req.user.id
            }, {
                $set: profileFields
            }, {
                new: true
            });

            return res.json(profile);
        }

        profile = new Profile(profileFields);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.log(err)
        res.status(500).send('Server error');
    }
});

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);

        res.json(profiles);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id
        }).populate('user', ['name', 'avatar']);

        if (!profile) {
            res.status(400).json({
                message: "Profile not found."
            })
        }

        res.json(profile);
    } catch (err) {
        if (err.kind == 'ObjectId') {
            res.status(400).json({
                message: "Profile not found."
            })
        }
        res.status(500).send('Server error');
    }
});

router.delete('/', auth, async (req, res) => {
    try {
        await Profile.findOneAndRemove({
            user: req.user.id
        });
        await User.findOneAndRemove({
            _id: req.user.id
        });

    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
]], async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({
                user: req.user.id
            })

            profile.experience.unshift(newExp);

            await profile.save();

            res.json(profile);
        } catch (err) {
            res.status(500).send('Server error')
        }
    } catch (err) {
        res.status(500).send('Server error')
    }
});

module.exports = router;