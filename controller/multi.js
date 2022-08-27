const { response, request } = require("express");
const Quiz = require("../modules/quiz");

const getQuiz = async (req = request, res = response)=>{
   const listquiz = await Quiz.find();
    res.status(200).json({
      listquiz
    })
}
const newQuiz = async (req = request, res = response)=>{
        const { type, quiz, choice, answer} = req.body;
       const  newquiz = new Quiz({type, quiz, choice, answer});
        await newquiz.save();
        res.status(200).json(newquiz);
}
const deleteQuiz = async (req = request, res = response)=>{
        const {id} = req.params.id;
        const deletequiz = await Quiz.deleteOne(id);
        res.status(200).json(deletequiz);
}

module.exports = {
    newQuiz,
    getQuiz,
    deleteQuiz
}