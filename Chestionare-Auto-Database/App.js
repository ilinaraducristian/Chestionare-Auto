/*
||====================================================================================================||
||         This program is desinged to convert "Chestionare Auto DRPCIV" by "OptiumumSoftware"        ||
||     from "Google Play Store" extracted apk "main.js" from "<extracted_apk_path>/assets/www/js/"    ||
||                  file into a JSON object with all the questions answers and images                 ||
||====================================================================================================||
*/

// Filesystem module
const fs = require("fs");

// Read main.js file
let main_js = fs.readFileSync("main.js");

// Convert main_js to string
main_js = main_js.toString();

/*
    Find the last questionList, find the semicolon after the
    closing bracket an remove everything after the semicolon
*/
let questions = main_js.replace(
  /];(?!.*questionList.?=(?!.*questionList.?=)).*/,
  "];"
);

// Convert questions to code
questions = questions.replace(/var /g, "questionLists.");
let questionLists = {};
eval(questions);

// Loop through questionLists
for (let questionList in questionLists) {
  // Loop through questions for each questionList
  questionLists[questionList].forEach(question => {
    // Convert question to appropiate format
    question.answers = [
      question.answ1.replace(";", "").trim(),
      question.answ2.replace(";", "").trim(),
      question.answ3.replace(".", "").trim()
    ];
    question.image = question.questionImage.replace(/\..*/, "");
    question.correct_answers = question.correntansw;
    delete question["id"];
    delete question["questionImage"];
    delete question["answ1"];
    delete question["answ2"];
    delete question["answ3"];
    delete question["isanswered"];
    delete question["stepnr"];
    delete question["correntansw"];
  });

  // Stringify and prettify questions
  let questions_as_json = JSON.stringify(
    questionLists[questionList],
    null,
    "\t"
  );

  // Write formatted questionList to file
  fs.writeFileSync(questionList + ".json", questions_as_json, err =>
    console.log(err)
  );
}
