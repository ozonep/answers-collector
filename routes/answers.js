const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Joi = require('joi');
const decomment = require('decomment');
const cuid = require('cuid');
const pgp = require('pg-promise')();

const cn = {
    host: 'localhost',
    port: 5432,
    database: 'creaturesdb',
    user: 'postgres',
    password: 'password',
};
const db = pgp(cn);

// bcrypt.compare(plainAnswer, hashedAnswer).then((res) => {
//     // res == true
// });

const validateAnswer = (answer) => {
    const schema = {
        answer: Joi.string().min(5).required(),
        userId: Joi.string().required(),
        exerciseId: Joi.string().required(),
    };
    return Joi.validate(answer, schema);
};


router.get('/', (req, res) => {
    if (req.query.exerciseId) {
        db.any('SELECT id, normalized_answer, answer, hash, user_id, date FROM answers LEFT JOIN student_answers ON answers.id = student_answers.answer_id WHERE exercise_id = $1', [req.query.exerciseId])
            .then(data => res.send(data))
            .catch(err => res.send(err.message));
    } else {
        db.any('SELECT id, normalized_answer, hash, user_id, date FROM answers LEFT JOIN student_answers ON answers.id = student_answers.answer_id')
            .then(data => res.send(data))
            .catch(err => res.send(err.message));
    }
});

router.get('/:answerId', (req, res) => {
    db.any('SELECT id, normalized_answer, answer, hash, user_id, date FROM answers LEFT JOIN student_answers ON answers.id = student_answers.answer_id WHERE id = $1', [req.params.answerId])
        .then(data => res.send(data))
        .catch(err => res.send(err.message));
});

router.post('/', (req, res) => {
    const uniqueId = cuid();
    const { error } = validateAnswer(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const noCommentsAnswer = decomment(req.body.answer);
    const normalizedAnswer = noCommentsAnswer.replace(/\s+/g, ' ').trim();
    bcrypt.hash(normalizedAnswer, 10).then((hash) => {
        db.tx(t => t.batch([
            t.none('INSERT INTO student_answers (answer_id, user_id, answer) VALUES ($1, $2, $3)', [uniqueId, req.body.userId, req.body.answer]),
            t.none('INSERT INTO answers (id, normalized_answer, hash, exercise_id) VALUES ($1, $2, $3, $4)', [uniqueId, normalizedAnswer, hash, req.body.exerciseId]),
        ]))
            .then(() => res.send(uniqueId))
            .catch(err => res.status(400).send(err.message));
    });
});


module.exports = router;
