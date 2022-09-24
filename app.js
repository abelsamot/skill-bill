const express = require('express')
var request = require("request")
const app = express()
const port = 5000
const mongoose = require('mongoose');
const { assert } = require('chai');
const { ObjectId } = require('bson');
const bodyParser = require('body-parser');
const cors = require('cors');
const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');
const PythonShell = require("python-shell").PythonShell;
const { resolve } = require('path/posix');
var _ = require('underscore');
require("dotenv").config()

app.use(require('body-parser').urlencoded({ extended: false }));
// Connect to database
mongoose.connect("mongodb://147.182.158.244:56728/parse", {useNewUrlParser:true});
var isoDate = new Date().toISOString()

console.log("OK")
// coding test
app.post('/pythonCodingTest/', (req, res) => {
    fs.writeFileSync('test.py', req.query.code)

    let options = { 
        mode: 'text',
        pythonOptions: ['-u'], // get print results in real-time
        args: [1, 2, 3]
      };
      
      PythonShell.run('test.py', options, function (err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        console.log('results: %j', results);
        res.json({passOrFail: results[0]})
      });
  })


function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}
// Define the schemas of our tables

const companySchema = new mongoose.Schema({
    _id: String,
    name: String,
    typeOfCompany: String,
    logo:String,
}, { versionKey: false })

const Company= mongoose.model("Company", companySchema)

const qcmQuestionsSchema = new mongoose.Schema({
    _id:String,
    question: String,
    questionImage:String,
    questionCategory:String,
    answersOptions:[{
        _id:String,
        answerText:String,
        isCorrect:Boolean
    }]
},{ collection: 'qcmQuestions',versionKey: false })

const qcmQuestions = mongoose.model("qcmQuestions", qcmQuestionsSchema)


const codingQuestionsSchema = new mongoose.Schema({
    _id:String,
    questionText: String,
    initialCode: String,
    subject: String,
    input: Array,
    outputs: Array,
},{ collection: 'codingQuestions',versionKey: false })

const codingQuestions = mongoose.model("codingQuestions", codingQuestionsSchema)




const testSchema = new mongoose.Schema({
    _id:String,
    name: String,
    difficulty:String,
    typeOfTest: String,
    language:String,
    durationInMinutes:Number,
    nbOfQuestions:Number,
    positionInLanguageTree:Number,
    smallDescription:String,
    longDescription:String,
    categories:[{
        _id:String,
        categoryName:String,
        maxIterationPerTest:Number,
    }],
    _created_at:Date,
    _updated_at:Date,
    image:String,
    codeQuestions:[{type: mongoose.Schema.Types.ObjectId, ref: 'qcmQuestions'}],
    qcmQuestions:[{ type: mongoose.Schema.Types.ObjectId, ref: 'qcmQuestions' }]
},{ collection: 'tests',versionKey: false })

const Test= mongoose.model("tests", testSchema)

const userSchema = new mongoose.Schema({
    _id:String,
    username: String,
    email:String,
    post: String,
    status:String,
    ethAdress:String,
    typeOfUser:String,
    stack:Array,
    seniority: String,
    firstName: String,
    lastName: String,
    _created_at:Date,
    _updated_at:Date,
    userType:String,
    tests:[{
        _id:String,
        testName:String,
        testType:String,
        testScore:Number,
        testBegun:Boolean,
        testDone:Boolean,
    }],
},{ collection: '_User',versionKey: false })
const User = mongoose.model("_User", userSchema)




app.get('/similarweb', (req, res) => {
    request("https://api.similarweb.com/v1/website/worldia.com/general-data/all?api_key=1804ef1224df413eab4304ce775df843",
    function(error,response,body){
        if(!error && response.statusCode==200){
            var parsedBody = JSON.parse(body)
            var siteName= parsedBody.site_name
            res.send({siteName})
        }
    })
  })
app.get('/', (req, res) => {
    res.send("Hello")
  })


app.post('/addATest', (req, res) => {
    testId= req.query.testId
    questionId= req.query.questionId
    question = req.query.qcmQuestion
    ListOfAnswers = req.query.answers

    Test.findOne({_id:testId},function(err,test){

        if(err){
            console.log(err)
        }
        else{

            const listOfQuestions = []
            test.qcmQuestion.map((question)=> console.log(question))
            //listOfTestName.push(test.testName)
            }
        test.save()
        })
    res.end("yes")
})
app.post('/testBegun', (req, res) => {
    const testId= req.query.testId
    const userId= req.query.userId
    const testBegun=true
    User.findOne({_id:userId},function(err,user){
        if(err){
            console.log(err);
        } 
        else{
            const foo = user.tests
            const newArr = foo.map(obj => {
                if (obj._id === testId) {
                    obj.testBegun=true
                    return obj
                }
                return obj
              });
            console.log(newArr)
            User.updateOne({_id:userId},{tests:newArr}, function(err,response){
                if(err){
                    console.log(err);
                } 
                else {
                    console.log(response)
                }
            })
            
        }
    })
    res.end("success")
})

app.post('/deleteQCMQuestion', (req, res) => {
    testId= req.query.testId
    questionId= req.query.questionId
    
    Test.findOne({_id:testId},function(err,test){

        if(err){
            console.log(err)
        }
        else{
            
            listOfQuestionsUpdated = test.qcmQuestions.filter(function(item) {
                return item.toString() !== questionId
            })
            Test.updateOne({_id:testId},{qcmQuestions:listOfQuestionsUpdated}, function(err,response){
                if(err){
                    console.log(err);
                } 
                else {
                    console.log(response)
                    console.log(listOfQuestionsUpdated)
                    qcmQuestions.deteOne({_id:questionId}, function(err){
                        if(err){
                            console.log(err);
                        }
                        else{
                           console.log("sucessfully Deleted") 
                        }
                    })
                }})
            
            }

        })
    res.end("yes")
})


app.post('/modifyTest', (req, res) => {
    testId= req.query.testId
    smallDescription = req.query.smallDescription
    longDescription = req.query.longDescription
    nbOfQuestions = req.query.nbOfQuestions
    durationInMinutes = req.query.durationInMinutes
    difficulty = req.query.difficulty
    categories = req.query.categories
    listOfQuestionsToDelete = req.query.listOfQuestionsToDelete
    console.log(req.query.listOfQuestionsToDelete)
    categoriesFormated = []
    categories.map((category)=> {
        let parsedCategory = JSON.parse(category)
        parsedCategory.maxIterationPerTest=parseInt(parsedCategory.maxIterationPerTest)
        categoriesFormated.push(parsedCategory)
    })

    // Update the QCM test
    Test.updateOne({_id:req.query.testId},{
        difficulty:difficulty,
        categories:categoriesFormated,
        durationInMinutes:durationInMinutes,
        nbOfQuestions:nbOfQuestions,
        longDescription:longDescription,
        smallDescription:smallDescription
    }, function(err,response){
        if(err){
            console.log(err);
        } 
        else {
            console.log(response)
        }
    })

    // Delete wanted questions
    Test.findOne({_id:testId},function(err,test){
        if(err){
            console.log(err)
        }
        else{
            if (Array.isArray(listOfQuestionsToDelete)){
            
            listOfQuestionsToDelete.map((questionId)=>{
                listOfQuestionsUpdated = test.qcmQuestions.filter(function(item) {
                    return item.toString() !== questionId
                })
                Test.updateOne({_id:testId},{qcmQuestions:listOfQuestionsUpdated}, function(err,response){
                    if(err){
                        console.log(err);
                    } 
                    else {
                        console.log(response)
                        console.log(listOfQuestionsUpdated)
                        qcmQuestions.deleteOne({_id:questionId}, function(err){
                            if(err){
                                console.log(err);
                            }
                            else{
                               console.log("sucessfully Deleted") 
                            }
                        })
                    }})
            })  
            }}

        })
    res.end("success")
    })

app.post('/addQCMQuestionToTest', (req, res) => {
    testId= req.query.testId
    questionId = mongoose.Types.ObjectId()
    question = req.query.question
    questionImage = req.body.image
    questionCategory = req.query.category
    console.log(questionCategory)
    const answers = [
        {
            _id:mongoose.Types.ObjectId(),
            answerText:req.query.answer1,
            isCorrect:req.query.answer1IsCorrect==='true'
        },
        {
            _id:mongoose.Types.ObjectId(),
            answerText:req.query.answer2,
            isCorrect:req.query.answer2IsCorrect==='true'
        },
        {
            _id:mongoose.Types.ObjectId(),
            answerText:req.query.answer3,
            isCorrect:req.query.answer3IsCorrect==='true'
        },
        {
            _id:mongoose.Types.ObjectId(),
            answerText:req.query.answer4,
            isCorrect:req.query.answer4IsCorrect==='true'
        },
    ]
    const newQCMQuestion = new qcmQuestions ({
        _id:questionId,
        question: question,
        questionCategory:questionCategory,
        questionImage:questionImage,
        answersOptions:answers
    })
    newQCMQuestion.save()

    Test.findOne({_id:testId},function(err,test){

        if(err){
            console.log(err)
        }
        else{

            const listOfQuestions = []
            console.log(question)
            console.log(answers)
            test.qcmQuestions.push(questionId)
            test.save()
            }
        })
    res.end("yes")
  })
 

app.post('/addUser', (req, res) => {
    firstName = req.query.firstName
    lastName = req.query.lastName
    _id= req.query._id
    post = req.query.post
    username = firstName + " " + lastName
    stack = req.query.stack
    seniority = req.query.seniority
    email = req.query.email
    typeOfUser = req.query.typeOfUser
    UserStatus = req.query.userStatus
    ethAdress = req.query.ethAdress
    console.log(req.query)
    // Create a company record
    const user = new User ({
        _id:_id,
        username: username,
        email:email,
        post: post,
        ethAdress:ethAdress,
        typeOfUser:typeOfUser,
        stack:stack,
        seniority: seniority,
        firstName: firstName,
        status:UserStatus,
        lastName: lastName,
        _created_at:isoDate,
        _updated_at:isoDate,
    })
    user.save();
    res.end("yes")
  })

app.post('/addTestsResultsToUser', (req, res) => {
    testId = req.query.testId
    testScore= req.query.testScore
    userId = req.query.userId
    console.log(testScore+ " - for : " + userId)
    User.findOne({_id:userId },function(err,user){
                testsToMap = user.tests
                if(err){
                    console.log(err)
                }
                else{
                    testsToMap.map((test)=> {
                        if(test._id===testId){
                            test.testScore=testScore
                            test.testDone = true
                            test.screenshots
                            console.log(" Score added " + testScore)
                        }
                        else{
                            console.log(test.testName)
                        }
                    })
                    user.save()
                }
            })
    res.end("yes")
    })

app.post('/addTestsToUser', (req, res) => {
    listOfTests = req.query.listOfTests
    user = req.query.username
    console.log(user)
    User.findOne({username:user},function(err,user){

                if(err){
                    console.log(err)
                }
                else{
                    for(let i = 0; i < listOfTests.length; i++){
                        const testObject = JSON.parse(listOfTests[i])
                        console.log(testObject.testName)
                        const listOfTestName = []
                        user.tests.map((test)=> listOfTestName.push(test.testName))
                        if (listOfTestName.includes(testObject.testName)){
                            console.log("Already in")
                        }
                        else{
                            
                            console.log("Adding")
                            user.tests.push(testObject)
                            
                        }
                        }
                user.save()
                }
            })
    res.end("yes")
    })

app.get('/getUserData', (req, res) => {
        user = req.query.username
        User.findOne({username:user},function(err,user){
            if(err){
                console.log(err)
            }
            else{
                console.log(user)
                res.send(user)
            }
        })
      })

app.get('/getUserTree', (req, res) => {
        
        username = req.query.username
        User.findOne({username:username},function(err,user){
            if(err){
                console.log(err)
            }
            else{
                const tests = user.tests
                const testTree = {
                    id: 'item-one',
                    title: 'Coding basics',
                    tooltip: {
                      content:
                        'This node is the top most level, and will be unlocked, and ready to be clicked.',
                    },
                    children: []
                }
                const nodeStates = {
                    'item-one': {
                        optional: false,
                        nodeState: 'selected',
                      }
                }
                tests.map((test,i,row)=> {
                    if(!_.isEmpty(test._id)){
                        console.log(i)

                        Test.findOne({_id:test._id},function(err,testFound){
                            if(err){
                                console.log(err)
                            }
                            else{
                                var stateOfNode = 'unlocked'
                                if(test.testDone){
                                    stateOfNode = 'selected'
                                }

                                nodeStates[test._id] = {
                                    optional: false,
                                    nodeState: stateOfNode,
                                }

                                testTree.children.push({
                                    id:testFound._id,
                                    title:testFound.name,
                                    tooltip:{
                                        content:testFound.smallDescription
                                    },
                                    icon:testFound.image,
                                    children:[]

                                })
                                if(row.length-1===i){
                                    console.log(row.length-1)
                                    res.send({
                                        testTree:testTree,
                                        nodeStates:nodeStates
                                    })

                                }

                            }
                        })
                    }

                })

            }
        })
      })

app.get('/getUserByID', (req, res) => {
        id = req.query.id
        User.findOne({_id:id},function(err,user){
            if(err){
                console.log(err)
            }
            else{
                console.log(user)
                res.send(user)
            }
        })
      })

app.get('/getTestByID', (req, res) => {
        id = req.query.id
        Test.findOne({_id:id},function(err,test){
            if(err){
                console.log(err)
            }
            else{
                res.send(test)
            }
        })
      })

app.get('/getQCMTestQuestions', (req, res) => {
    
    id = req.query.id
    Test.findOne({_id:id},function(err,test){
        if(err){
            console.log(err)
        }
        else{
            if(test){
                qcmQuestions.find({_id:test.qcmQuestions},function(err,question){
                    if(err){
                        console.log(err)
                    }
                    else{
                        // Shuffle array
                        var categoryCount = []
                        test.categories.map((cat)=>{
                        categoryCount.push({
                            id:cat.categoryName,
                            maxIterationPerTest:cat.maxIterationPerTest,
                            questions:[]
                        })
                        })
                        question.map((q)=>{
                            const index = categoryCount.findIndex(object => {
                                return object.id === q.questionCategory;
                              });
                              categoryCount[index].questions.push(q)
                        }
                        )
                        let firstQuestionList = []
                        categoryCount.map((cat)=>{
                            const shuffled1 = cat.questions.sort(() => 0.5 - Math.random());
                            cat.questions = shuffled1.slice(0, cat.maxIterationPerTest);
                            cat.questions.map((q)=>firstQuestionList.push(q))
                        })
                        const shuffled = firstQuestionList.sort(() => 0.5 - Math.random());
                        // Get sub-array of first nelements after shuffled
                        let selectedQuestions = shuffled.slice(0, test.nbOfQuestions);
                        res.send(selectedQuestions)
                    }
                })
            }
            else{
                res.send([{}])
            }
        }
    })   
    })
  
app.get('/getAllQuestionsForOneQCM', (req, res) => {
        id = req.query.id
        Test.findOne({_id:id},function(err,test){
            if(err){
                console.log(err)
            }
            else{
                if(test){
                    qcmQuestions.find({_id:test.qcmQuestions},function(err,question){
                            res.send(question)
                    })
                }
                else{
                    res.send([{}])
                }
            }
        })   
        })

app.get('/getCodeTestQuestions', (req, res) => {
        id = req.query.id
            Test.findOne({_id:id},function(err,test){
                if(err){
                    console.log(err)
                }
                else{
                    console.log(test.codeQuestions)
                    codingQuestions.find({_id:test.codeQuestions},function(err,question){
                        if(err){
                            console.log(err)
                        }
                        else{
                            console.log(question)
                            res.send(question)
                        }
                    })
                }
            })
         
    })
        
app.get('/getAllUserTestsByID', (req, res) => {
        tests = req.query.tests && req.query.tests

        listOfTests = []
        if (Array.isArray(tests)){
            const requests = tests.map((testString)=> {
                var testObject = JSON.parse(testString)
                console.log(testObject._id)
                Test.findOne({_id:testObject._id},function(err,test){
                    if(err){
                        console.log(err)
                    }
                    else{
                        listOfTests.push(test)
                    }
                })
            })
            Promise.all(requests).then(() => console.log(listOfTests))
        }
        res.send(listOfTests)
      })

app.post('/delUser', (req, res) => {
    const User= mongoose.model("_User", userSchema)
    username = req.query.username
    User.deleteOne({username:username}, function(err){
        if(err){
            console.log(err)
        }
        else{
            console.log("Success")
        }
    })
    res.end("yes")
  })

app.get('/getTests', (req,res)=> {
    Test.find(function(err,tests){
        if(err){
            console.log(err)
        }
        else{
            res.send(tests)
        }
    })

  })
  app.get('/getCompanies', (req, res) => {
    
    // Find 
    Company.find(function(err,companies){
        if(err){
            console.log(err)
        }
        else{
            res.send(companies)
        }
    })
  })
  app.get('/getUsers', (req, res) => {
    User.find(function(err,users){
        if(err){
            console.log(err)
        }
        else{
            res.send(users)
            console.log(users)
        }
    })
  })
app.listen(process.env.PORT || 5000, () => {
  console.log(`Example app listening on port ${port}`)
})
