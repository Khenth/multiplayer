const {Router} = require('express');
const { getQuiz, newQuiz, deleteQuiz } = require('../controller/multi');


const router = Router();

router.get('/multi', getQuiz);
router.post('/multi', newQuiz);
router.delete('/multi/:id', deleteQuiz);


module.exports = router;