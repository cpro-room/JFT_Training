let allQuestions = [];

const displayedCourses = [
    "A1",
    "A2.1",
    "A2.2"
];

const displayedLessons = [
    "L1~6",
    "L7~12",
    "L13~18"
];

let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let selectedCourse = "";
let selectedLesson = "";
let selectedSection = "";
let questionResults = [];
let confirmationMode = false;
let displayedChoiceSets = [];

function getBestScores() {
    try {
        return JSON.parse(
            localStorage.getItem("jft_best_scores") || "{}"
        );
    } catch (error) {
        return {};
    }
}

function getScoreKey(course, lesson1, sectionName) {
    return `${course}__${lesson1}__${sectionName}`;
}

function saveBestScore(course, lesson1, sectionName, percentage) {
    const scores = getBestScores();

    const key = getScoreKey(
        course,
        lesson1,
        sectionName
    );

    if (
        scores[key] === undefined ||
        percentage > scores[key]
    ) {
        scores[key] = percentage;

        localStorage.setItem(
            "jft_best_scores",
            JSON.stringify(scores)
        );
    }
}

async function loadQuestions() {
    try {
        const response = await fetch("questions.json");

        if (!response.ok) {
            throw new Error(
                "questions.json を読み込めませんでした。"
            );
        }

        allQuestions = await response.json();

        createCourseButtons();
    } catch (error) {
        console.error(error);
        alert("問題データを読み込めませんでした。");
    }
}

function createCourseButtons() {
    const container =
        document.getElementById("course-buttons");

    container.innerHTML = "";

    displayedCourses.forEach(course => {

        const courseExists =
            allQuestions.some(
                question =>
                    String(question.course || "").trim() === course
            );

        if (!courseExists) {
            return;
        }

        const title =
            document.createElement("div");

        title.textContent = course;
        title.style.textAlign = "center";
        title.style.fontSize = "22px";
        title.style.fontWeight = "bold";
        title.style.margin = "20px 0 10px";

        container.appendChild(title);

        const lessonContainer =
            document.createElement("div");

        lessonContainer.style.display = "flex";
        lessonContainer.style.justifyContent = "center";
        lessonContainer.style.gap = "8px";
        lessonContainer.style.flexWrap = "wrap";

        displayedLessons.forEach(lesson1 => {
            const exists =
                allQuestions.some(
                    question =>
                        String(question.course || "").trim() === course &&
                        String(question.lesson1 || "").trim() === lesson1
                );

            if (!exists) {
                return;
            }

            const button =
                document.createElement("button");

            button.className = "course-button";
            button.textContent = lesson1;

            button.addEventListener(
                "click",
                () => {
                    gtag("event", "select_course", {
                        course_name: course
                    });

                    gtag("event", "select_lesson", {
                        course_name: course,
                        lesson1_name: lesson1
                    });

                    setTimeout(() => {
                        showSectionButtons(
                            course,
                            lesson1
                        );
                    }, 140);
                }
            );

            lessonContainer.appendChild(button);
        });

        /* =========================
           L1~18ボタン
           ========================= */

        const lesson18Button =
            document.createElement("button");

        lesson18Button.className = "course-button";
        lesson18Button.textContent = "L1~18";

        const scores = getBestScores();
        const targetSections = [];

        allQuestions.forEach(question => {

            const questionCourse =
                String(question.course || "").trim();

            const questionLesson =
                String(question.lesson1 || "").trim();

            const sectionName =
                String(question.sectionName || "").trim();

            if (
                questionCourse !== course ||
                !displayedLessons.includes(questionLesson) ||
                !sectionName
            ) {
                return;
            }

            const exists =
                targetSections.some(
                    item =>
                        item.lesson1 === questionLesson &&
                        item.sectionName === sectionName
                );

            if (!exists) {
                targetSections.push({
                    lesson1: questionLesson,
                    sectionName: sectionName
                });
            }
        });

   const unlocked =
    course === "A1" &&
    targetSections.length > 0 &&
    targetSections.every(item => {

                const score =
                    scores[
                        getScoreKey(
                            course,
                            item.lesson1,
                            item.sectionName
                        )
                    ];

                return Number(score || 0) >= 80;
            });

lesson18Button.style.background =
    unlocked ? "#ffff00" : "#d3d3d3";

        lesson18Button.style.cursor =
            unlocked ? "pointer" : "default";

        lesson18Button.disabled = !unlocked;

 if (unlocked) {
    lesson18Button.addEventListener(
        "click",
        () => {
            document.getElementById(
                "lesson-test-info"
            ).innerHTML =
                `${course}&nbsp;&nbsp;L1~18`;

           const lessonTestButton =
    document.getElementById(
        "lesson-test-button"
    );

lessonTestButton.dataset.course = course;
lessonTestButton.className = "course-button";
lessonTestButton.style.backgroundColor = "#ffff00";
lessonTestButton.style.cursor = "pointer";
lessonTestButton.disabled = false;
lessonTestButton.style.display = "block";
lessonTestButton.style.margin = "0 auto";

document.getElementById(
    "start-screen"
).classList.add("hidden");

            document.getElementById(
                "section-screen"
            ).classList.add("hidden");

            document.getElementById(
                "lesson-test-screen"
            ).classList.remove("hidden");

            window.scrollTo(0, 0);
        }
    );
}

        lessonContainer.appendChild(
            lesson18Button
        );

        container.appendChild(lessonContainer);
    });
}

function showSectionButtons(course, lesson1) {
    const startScreen =
        document.getElementById("start-screen");

    const sectionScreen =
        document.getElementById("section-screen");

const container =
    document.getElementById("section-buttons");

container.innerHTML = "";

const sectionInfo =
    document.createElement("div");

sectionInfo.className =
    "result-info";

sectionInfo.innerHTML =
    `${course}&nbsp;&nbsp;${lesson1}`;

container.appendChild(
    sectionInfo
);

    const sections = [];

    allQuestions.forEach(question => {
        if (
            String(question.course || "").trim() === course &&
            String(question.lesson1 || "").trim() === lesson1
        ) {
            const sectionName =
                String(question.sectionName || "").trim();

            if (
                sectionName &&
                !sections.includes(sectionName)
            ) {
                sections.push(sectionName);
            }
        }
    });

    sections.forEach(sectionName => {
        const button =
            document.createElement("button");

        button.className = "course-button";

        if (sectionName.startsWith("ことば")) {
            button.classList.add("section-kotoba");
        } else if (sectionName.startsWith("かんじ")) {
            button.classList.add("section-kanji");
        } else if (sectionName.startsWith("かいわ")) {
            button.classList.add("section-kaiwa");
        } else if (sectionName.startsWith("ちょうかい")) {
            button.classList.add("section-choukai");
        } else if (sectionName.startsWith("どっかい")) {
            button.classList.add("section-dokkai");
        }

        const scores = getBestScores();

        const scoreKey =
            getScoreKey(
                course,
                lesson1,
                sectionName
            );

        const sectionText =
            document.createElement("span");

        sectionText.textContent = sectionName;
        sectionText.style.paddingRight = "4em";

        button.appendChild(sectionText);

        const scoreText =
            document.createElement("span");

        scoreText.textContent =
            `　${scores[scoreKey] !== undefined ? scores[scoreKey] : 0}%`;

        scoreText.style.color = "blue";
        scoreText.style.position = "absolute";
        scoreText.style.right = "1em";

        button.style.position = "relative";

        button.appendChild(scoreText);

        button.addEventListener(
            "click",
            () => {
                gtag("event", "select_section", {
                    course_name: course,
                    lesson1_name: lesson1,
                    section_name: sectionName
                });

                setTimeout(() => {
                    startQuiz(
                        course,
                        lesson1,
                        sectionName
                    );
                }, 140);
            }
        );

        container.appendChild(button);
    });

    const backButton =
        document.createElement("button");

    backButton.className = "section-back-button";
    backButton.textContent = "Back";

    backButton.addEventListener(
        "click",
        () => {
            sectionScreen.classList.add("hidden");
            startScreen.classList.remove("hidden");

            window.scrollTo(0, 0);
        }
    );

    container.appendChild(backButton);

    startScreen.classList.add("hidden");
    sectionScreen.classList.remove("hidden");

    window.scrollTo(0, 0);
}

document.getElementById(
    "lesson-test-button"
).addEventListener(
    "click",
    () => {
        const course =
            document.getElementById(
                "lesson-test-button"
            ).dataset.course;
        startLessonTest(course);
    }
);

function startLessonTest(course) {

    selectedCourse = course;
    selectedLesson = "L1~18";
    selectedSection = "Section1";

    confirmationMode = false;

    const type1 =
        "Look at the illustration and choose the correct word.";

    const type2 =
        "Read the sentence and choose the word that fits in (      ) the most.";

    const type3 =
        "How do you write the underlined kanji word in hiragana? Choose the correct one.";

    const type4 =
        "Read the sentence and choose the kanji word that fits in (    ) the most?";

    function selectThreeBalanced(questions) {

        const groups = displayedLessons.map(
            lesson1 =>
                questions.filter(
                    question =>
                        String(question.lesson1 || "").trim() === lesson1
                )
        );

        const selected = [];

        groups.forEach(group => {
            if (group.length > 0) {
                const shuffled = [...group];
                shuffleArray(shuffled);
                selected.push(shuffled[0]);
            }
        });

        if (selected.length < 3) {

            const remaining =
                questions.filter(
                    question =>
                        !selected.includes(question)
                );

            shuffleArray(remaining);

            selected.push(
                ...remaining.slice(
                    0,
                    3 - selected.length
                )
            );
        }

        shuffleArray(selected);

        return selected.slice(0, 3);
    }

const selectBalancedQuestions = (
    questions,
    count
) => {

    const groups =
        displayedLessons.map(
            lesson1 =>
                questions.filter(
                    question =>
                        String(question.lesson1 || "").trim() === lesson1
                )
        );

    const selected = [];

    const baseCount =
        Math.floor(count / groups.length);

    const remainder =
        count % groups.length;

    groups.forEach((group, index) => {

        const target =
            baseCount +
            (index < remainder ? 1 : 0);

        const shuffled = [...group];

        shuffleArray(shuffled);

        selected.push(
            ...shuffled.slice(0, target)
        );
    });

    return selected;
};

const section2Questions =
    allQuestions.filter(
        question =>
            String(question.course || "").trim() === course &&
            String(question.section || "").trim() === "Section2"
    );

const selectedSection2Questions =
    selectBalancedQuestions(
        section2Questions,
        12
    );

const section3Questions =
    allQuestions.filter(
        question =>
            String(question.course || "").trim() === course &&
            String(question.section || "").trim() === "Section3"
    );

const section3Units = [];

section3Questions.forEach(question => {

const subQuestions =
    parseSubQuestions(question.khmerQuestion);

    const count =
        subQuestions.length > 0
            ? subQuestions.length
            : 1;

    section3Units.push({
        question: question,
        count: count
    });
});

const selectSection3Balanced = (units, targetCount) => {

    const groups =
        displayedLessons.map(
            lesson1 =>
                units.filter(
                    unit =>
                        String(
                            unit.question.lesson1 || ""
                        ).trim() === lesson1
                )
        );

    const selected = [];
    let totalCount = 0;

    const targetPerGroup =
        Math.floor(targetCount / groups.length);

    groups.forEach(group => {

        const shuffled = [...group];

        shuffleArray(shuffled);

        let groupCount = 0;

        for (const unit of shuffled) {

            if (
                groupCount + unit.count <=
                targetPerGroup
            ) {
                selected.push(unit.question);
                groupCount += unit.count;
                totalCount += unit.count;
            }
        }
    });

    const remaining =
        units.filter(
            unit =>
                !selected.includes(unit.question)
        );

    shuffleArray(remaining);

    for (const unit of remaining) {

        if (totalCount >= targetCount) {
            break;
        }

        selected.push(unit.question);
        totalCount += unit.count;
    }

    return selected;
};

const selectedSection3Questions =
    selectSection3Balanced(
        section3Units,
        12
    );

const section4Questions =
    allQuestions.filter(
        question =>
            String(question.course || "").trim() === course &&
            String(question.section || "").trim() === "Section4"
    );

const section4Units = [];

section4Questions.forEach(question => {

    const subQuestions =
        parseSubQuestions(question.question);

    const count =
        subQuestions.length > 0
            ? subQuestions.length
            : 1;

    section4Units.push({
        question: question,
        count: count
    });
});

const selectSection4Balanced = (units, targetCount) => {

    const groups =
        displayedLessons.map(
            lesson1 =>
                units.filter(
                    unit =>
                        String(
                            unit.question.lesson1 || ""
                        ).trim() === lesson1
                )
        );

    const selected = [];
    let totalCount = 0;

    const targetPerGroup =
        Math.floor(targetCount / groups.length);

    groups.forEach(group => {

        const shuffled = [...group];

        shuffleArray(shuffled);

        let groupCount = 0;

        for (const unit of shuffled) {

            if (
                groupCount + unit.count <=
                targetPerGroup
            ) {
                selected.push(unit.question);
                groupCount += unit.count;
                totalCount += unit.count;
            }
        }
    });

    const remaining =
        units.filter(
            unit =>
                !selected.includes(unit.question)
        );

    shuffleArray(remaining);

    for (const unit of remaining) {

        if (totalCount >= targetCount) {
            break;
        }

        selected.push(unit.question);
        totalCount += unit.count;
    }

    return selected;
};

const selectedSection4Questions =
    selectSection4Balanced(
        section4Units,
        12
    );

    const section1Questions =
        allQuestions.filter(
            question =>
                String(question.course || "").trim() === course &&
                String(question.section || "").trim() === "Section1"
        );

    const questions1 =
        section1Questions.filter(
            question =>
                String(question.englishQuestion || "").trim() === type1
        );

    const questions2 =
        section1Questions.filter(
            question =>
                String(question.englishQuestion || "").trim() === type2 &&
                String(question.sectionName || "").trim() === "ことば"
        );

    const questions3 =
        section1Questions.filter(
            question =>
                String(question.englishQuestion || "").trim() === type3
        );

const questions4 =
    section1Questions.filter(
        question =>
            String(question.englishQuestion || "").trim() === type4 &&
            String(question.sectionName || "").trim() === "かんじ"
    );

currentQuestions = [
    ...selectThreeBalanced(questions1),
    ...selectThreeBalanced(questions2),
    ...selectThreeBalanced(questions3),
    ...selectThreeBalanced(questions4),
    ...selectedSection2Questions,
    ...selectedSection3Questions,
    ...selectedSection4Questions
];

    currentQuestionIndex = 0;

    displayedChoiceSets =
        new Array(currentQuestions.length).fill(null);

    userAnswers =
        new Array(currentQuestions.length).fill(null);

    questionResults = [];

    document
        .getElementById("lesson-test-screen")
        .classList.add("hidden");

    document
        .getElementById("quiz-screen")
        .classList.remove("hidden");

    const quizScreen =
        document.getElementById("quiz-screen");

    quizScreen.className = "course-screen";
    quizScreen.dataset.course = course;

    showQuestion();
    createQuestionJumpButtons();

    window.scrollTo(0, 0);
}

function startQuiz(course, lesson1, sectionName) {
    selectedCourse = course;
    selectedLesson = lesson1;
    selectedSection = sectionName;

    confirmationMode = false;

    const quizScreen =
        document.getElementById("quiz-screen");

    quizScreen.className = "course-screen";
    quizScreen.dataset.course = course;

    currentQuestions = allQuestions.filter(
        question =>
            String(question.course || "").trim() === course &&
            String(question.lesson1 || "").trim() === lesson1 &&
            String(question.sectionName || "").trim() === sectionName
    );

    if (currentQuestions.length === 0) {
        alert("このコースには問題がありません。");
        return;
    }

    currentQuestions = [...currentQuestions];

    shuffleArray(currentQuestions);

    currentQuestionIndex = 0;

    displayedChoiceSets =
        new Array(currentQuestions.length).fill(null);

    userAnswers =
        new Array(currentQuestions.length).fill(null);

    questionResults = [];

    document
        .getElementById("start-screen")
        .classList.add("hidden");

    document
        .getElementById("section-screen")
        .classList.add("hidden");

    document
        .getElementById("result-screen")
        .classList.add("hidden");

    document
        .getElementById("quiz-screen")
        .classList.remove("hidden");

    showQuestion();
    createQuestionJumpButtons();

    window.scrollTo(0, 0);
}

function showQuestion() {
    window.scrollTo(0, 0);

    const question =
        currentQuestions[currentQuestionIndex];

    const questionArea =
        document.getElementById("question-area");

    document.getElementById("quiz-screen").dataset.section =
        question.section || "";

    questionArea.innerHTML = "";

    document.getElementById("question-number").textContent =
        `${currentQuestionIndex + 1} / ${currentQuestions.length}`;

    const subQuestions =
        question.section === "Section3"
            ? parseSubQuestions(question.khmerQuestion)
            : parseSubQuestions(question.question);

    if (subQuestions.length === 0) {
        const questionContent =
            document.createElement("div");

        questionContent.className = "question-content";

        if (
            question.section === "Section3" &&
            question.khmerQuestion &&
            question.khmerQuestion.trim()
        ) {
            const khmerText =
                document.createElement("div");

            khmerText.className =
                "question-text khmer-question-text";

            khmerText.innerHTML =
                formatText(question.khmerQuestion);

            questionContent.appendChild(khmerText);
        }

        if (question.section === "Section3") {
            const questionLines =
                String(question.question || "")
                    .split(/\r?\n|<br\s*\/?>/i)
                    .map(line => line.trim())
                    .filter(Boolean);

            const textLines = [];

            questionLines.forEach(line => {
                const lower =
                    line.toLowerCase();

                if (
                    lower.endsWith(".mp3") ||
                    lower.endsWith(".wav") ||
                    lower.endsWith(".ogg") ||
                    lower.endsWith(".png") ||
                    lower.endsWith(".jpg") ||
                    lower.endsWith(".jpeg") ||
                    lower.endsWith(".gif") ||
                    lower.endsWith(".webp")
                ) {
                    addMedia(
                        line,
                        questionContent,
                        "question"
                    );
                } else {
                    textLines.push(line);
                }
            });

            if (textLines.length > 0) {
                const questionText =
                    document.createElement("div");

                questionText.className = "question-text";

                questionText.innerHTML =
                    formatText(
                        textLines.join("\n")
                    );

                questionContent.appendChild(
                    questionText
                );

                questionContent.style.marginBottom =
                    "0.5em";
            }
        } else if (
            question.section === "Section4" &&
            question.question &&
            question.question.trim()
        ) {
            if (
                question.khmerQuestion &&
                question.khmerQuestion.trim()
            ) {
                const khmerSpace =
                    document.createElement("div");

                khmerSpace.style.height = "47px";

                questionContent.appendChild(
                    khmerSpace
                );

                const khmerText =
                    document.createElement("div");

                khmerText.className =
                    "question-text khmer-question-text";

                khmerText.innerHTML =
                    formatText(question.khmerQuestion);

                questionContent.appendChild(
                    khmerText
                );
            }

            const questionLines =
                String(question.question)
                    .split(/\r?\n|<br\s*\/?>/i)
                    .map(line => line.trim())
                    .filter(Boolean);

            const textLines = [];

            questionLines.forEach(line => {
                const lower =
                    line.toLowerCase();

                if (
                    lower.endsWith(".png") ||
                    lower.endsWith(".jpg") ||
                    lower.endsWith(".jpeg") ||
                    lower.endsWith(".gif") ||
                    lower.endsWith(".webp")
                ) {
                    addMedia(
                        line,
                        questionContent,
                        "question"
                    );
                } else {
                    textLines.push(line);
                }
            });

            if (textLines.length > 0) {
                const questionText =
                    document.createElement("div");

                questionText.className = "question-text";

                questionText.innerHTML =
                    formatText(
                        textLines.join("\n")
                    );

                questionContent.appendChild(
                    questionText
                );
            }
        } else if (
            question.question &&
            question.question.trim()
        ) {
            const questionText =
                document.createElement("div");

            questionText.className = "question-text";

            questionText.innerHTML =
                formatText(question.question);

            questionContent.appendChild(
                questionText
            );
        }

        if (
            question.section !== "Section3" &&
            question.section !== "Section1" &&
            question.section !== "Section2" &&
            question.section !== "Section4" &&
            question.khmerQuestion &&
            question.khmerQuestion.trim()
        ) {
            const khmerText =
                document.createElement("div");

            khmerText.className =
                "question-text khmer-question-text";

            khmerText.innerHTML =
                formatText(question.khmerQuestion);

            questionContent.appendChild(
                khmerText
            );
        }

        addMedia(
            question.questionImage,
            questionContent,
            "question"
        );

        questionArea.appendChild(
            questionContent
        );

        showNormalChoices(
            question,
            questionArea
        );
    } else {
        const firstSubQuestionIndex =
            question.question.search(/\(\d+\)/);

        if (firstSubQuestionIndex > 0) {
            let intro =
                question.question.substring(
                    0,
                    firstSubQuestionIndex
                ).trim();

            intro = intro.replace(
                /[^<>\s]+\.(png|jpg|jpeg|gif|webp)/gi,
                ""
            ).trim();

            if (intro) {
                const questionText =
                    document.createElement("div");

                questionText.className = "question-text";

                questionText.innerHTML =
                    formatText(intro);

                questionArea.appendChild(
                    questionText
                );
            }
        }

        if (
            question.khmerQuestion &&
            question.khmerQuestion.trim()
        ) {
            const khmerText =
                document.createElement("div");

            khmerText.className = "question-text";

            const khmerIntro =
                question.section === "Section3"
                    ? question.khmerQuestion
                        .split(/\(\d+\)/)[0]
                        .trim()
                    : question.khmerQuestion;

            khmerText.innerHTML =
                formatText(khmerIntro);

            questionArea.appendChild(
                khmerText
            );
        }

        if (question.section === "Section3") {
            addMedia(
                question.questionImage,
                questionArea,
                "question"
            );

            addMedia(
                question.audio,
                questionArea,
                "question"
            );
        } else {
            const questionImageMatch =
                question.question.match(
                    /([^<>\s]+\.(png|jpg|jpeg|gif|webp))/i
                );

            if (questionImageMatch) {
                addMedia(
                    questionImageMatch[1],
                    questionArea,
                    "question"
                );
            }
        }

        showSubQuestions(
            question,
            subQuestions,
            questionArea
        );
    }

    updateNextButton();
    updateQuestionJumpButtons();
}

function showNormalChoices(question, container) {
    const questionIndex =
        currentQuestionIndex;

    let choices =
        displayedChoiceSets[questionIndex];

    if (!choices) {
        choices = (question.choices || []).map(
            (choice, index) => ({
                text: String(choice.text || ""),
                image: String(choice.image || ""),
                audio: String(choice.audio || ""),
                correct: choice.correct === true,
                _choiceIndex: index
            })
        );

        choices = prepareChoices(choices);

        displayedChoiceSets[questionIndex] =
            choices;
    }

    showChoices(
        choices,
        container,
        questionIndex,
        0
    );
}

function parseSubQuestions(text) {
    if (!text) {
        return [];
    }

    const lines =
        text.split(/\r?\n|<br\s*\/?>/i);

    const result = [];

    lines.forEach(line => {
        const match =
            line.match(
                /^\s*\((\d+)\)\s*(.*)$/
            );

        if (match) {
            result.push({
                number: Number(match[1]),
                text: match[2].trim()
            });
        }
    });

    return result;
}

function showSubQuestions(
    question,
    subQuestions,
    container
) {
    const choiceGroups =
        createChoiceGroups(
            question,
            subQuestions.length
        );

    subQuestions.forEach(
        (subQuestion, index) => {
            const subContainer =
                document.createElement("div");

            subContainer.className =
                "subquestion";

            const title =
                document.createElement("div");

            title.className =
                "subquestion-text";

            title.innerHTML =
                `(${subQuestion.number}) ${formatText(subQuestion.text)}`;

            subContainer.appendChild(title);

            const choices =
                choiceGroups[index] || [];

            showChoices(
                choices,
                subContainer,
                currentQuestionIndex,
                index
            );

            container.appendChild(
                subContainer
            );
        }
    );
}

function createChoiceGroups(
    question,
    subQuestionCount
) {
    const questionIndex =
        currentQuestionIndex;

    if (displayedChoiceSets[questionIndex]) {
        return displayedChoiceSets[questionIndex];
    }

    const groups = [];

    for (
        let i = 0;
        i < subQuestionCount;
        i++
    ) {
        const choices = [];

        (question.choices || []).forEach(choice => {
            const textParts =
                String(choice.text || "")
                    .split(/<br\s*\/?>/i)
                    .map(value => value.trim());

            const imageParts =
                splitMediaValues(choice.image);

            const audioParts =
                splitMediaValues(choice.audio);

            let text =
                textParts[i] || "";

            let image =
                imageParts[i] || "";

            if (
                /\.(png|jpg|jpeg|gif|webp)$/i.test(text)
            ) {
                image = text;
                text = "";
            }

            choices.push({
                text: text,
                image: image,
                audio: audioParts[i] || "",
                correct: choice.correct === true
            });
        });

        groups.push(
            prepareChoices(choices)
        );
    }

    displayedChoiceSets[questionIndex] =
        groups;

    return groups;
}

function prepareChoices(choices) {
    const result =
        choices
            .filter(choice =>
                choice.text ||
                choice.image ||
                choice.audio
            )
            .map((choice, index) => ({
                ...choice,
                _choiceIndex:
                    choice._choiceIndex !== undefined
                        ? choice._choiceIndex
                        : index
            }));

    shuffleArray(result);

    return result;
}

function showChoices(
    choices,
    container,
    questionIndex,
    subIndex
) {
    const list =
        document.createElement("div");

    list.className = "choice-list";

    const question =
        currentQuestions[questionIndex];

    const isSection4 =
        question &&
        question.section === "Section4";

    choices.forEach(
        choice => {
            const button =
                document.createElement("button");

            button.className =
                "choice-button";

            if (
                isSection4 &&
                choice.image
            ) {
                button.classList.add(
                    "choice-with-image"
                );
            }

            const content =
                document.createElement("div");

            content.className =
                "choice-content";

            if (choice.text) {
                const text =
                    document.createElement("span");

                text.className =
                    "choice-text";

                text.innerHTML =
                    formatText(choice.text);

                content.appendChild(text);
            }

            addMedia(
                choice.image,
                content,
                "choice"
            );

            addMedia(
                choice.audio,
                content,
                "choice"
            );

            button.appendChild(content);

            const savedAnswer =
                userAnswers[questionIndex] &&
                userAnswers[questionIndex][subIndex];

            if (
                savedAnswer &&
                savedAnswer.choiceIndex ===
                    choice._choiceIndex
            ) {
                button.classList.add("selected");
            }

            if (!confirmationMode) {
                button.addEventListener(
                    "click",
                    () => {
                        if (confirmationMode) {
                            return;
                        }

                        const buttons =
                            list.querySelectorAll(
                                ".choice-button"
                            );

                        buttons.forEach(
                            b =>
                                b.classList.remove(
                                    "selected"
                                )
                        );

                        button.classList.add(
                            "selected"
                        );

                        saveAnswer(
                            questionIndex,
                            subIndex,
                            choice
                        );
                    }
                );
            } else {
                button.disabled = true;
                button.style.pointerEvents = "none";
            }

            list.appendChild(button);
        }
    );

    container.appendChild(list);

    requestAnimationFrame(() => {
        fitChoiceText(list);
    });
}

function fitChoiceText(container) {
    const buttons =
        container.querySelectorAll(
            ".choice-button:not(.choice-with-image)"
        );

    buttons.forEach(button => {
        const content =
            button.querySelector(".choice-content");

        const text =
            button.querySelector(".choice-text");

        if (!content || !text) {
            return;
        }

        const maxFontSize = 18;
        const minFontSize = 8;

        const measure =
            document.createElement("span");

        measure.innerHTML =
            text.innerHTML;

        const style =
            window.getComputedStyle(text);

        measure.style.position = "absolute";
        measure.style.visibility = "hidden";
        measure.style.whiteSpace = "nowrap";
        measure.style.width = "max-content";
        measure.style.fontFamily = style.fontFamily;
        measure.style.fontWeight = style.fontWeight;
        measure.style.fontStyle = style.fontStyle;
        measure.style.letterSpacing = style.letterSpacing;
        measure.style.fontSize = `${maxFontSize}px`;

        document.body.appendChild(measure);

        const textWidth =
            measure.getBoundingClientRect().width;

        const availableWidth =
            content.getBoundingClientRect().width;

        measure.remove();

        if (textWidth <= availableWidth) {
            text.style.fontSize =
                `${maxFontSize}px`;

            return;
        }

        const ratio =
            availableWidth / textWidth;

        let fontSize =
            maxFontSize * ratio;

        fontSize =
            Math.max(
                minFontSize,
                Math.floor(fontSize * 10) / 10
            );

        text.style.fontSize =
            `${fontSize}px`;
    });
}

window.addEventListener(
    "resize",
    () => {
        document
            .querySelectorAll(".choice-list")
            .forEach(list => {
                fitChoiceText(list);
            });
    }
);

function saveAnswer(
    questionIndex,
    subIndex,
    choice
) {
    if (!userAnswers[questionIndex]) {
        userAnswers[questionIndex] = [];
    }

    userAnswers[questionIndex][subIndex] = {
        correct: choice.correct,
        choiceIndex: choice._choiceIndex
    };
}

document
    .getElementById("back-button")
    .addEventListener(
        "click",
        () => {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                showQuestion();
            }
        }
    );

function updateNextButton() {
    const button =
        document.getElementById("next-button");

    if (
        currentQuestionIndex ===
        currentQuestions.length - 1
    ) {
        button.textContent = "Finish";

        button.classList.add(
            "finish-button"
        );
    } else {
        button.textContent = "Next";

        button.classList.remove(
            "finish-button"
        );
    }
}

document
    .getElementById("next-button")
    .addEventListener(
        "click",
        () => {
            if (
                currentQuestionIndex <
                currentQuestions.length - 1
            ) {
                currentQuestionIndex++;
                showQuestion();
            } else {
                if (confirmationMode) {
                    document
                        .querySelectorAll("audio")
                        .forEach(audio => audio.pause());

                    document
                        .getElementById("quiz-screen")
                        .classList.add("hidden");

                    document
                        .getElementById("question-number")
                        .textContent = "";

                    document
                        .getElementById("result-screen")
                        .classList.remove("hidden");
                } else {
                    document
                        .querySelectorAll("audio")
                        .forEach(audio => audio.pause());

                    calculateResult();
                }
            }
        }
    );

function createQuestionJumpButtons() {
    const bar =
        document.getElementById(
            "question-jump-bar"
        );

    bar.innerHTML = "";

    bar.style.position = "absolute";
    bar.style.left = "0";
    bar.style.top = "86px";
    bar.style.width = "46px";
    bar.style.height = "auto";
    bar.style.display = "block";
    bar.style.padding = "4px";
    bar.style.margin = "0";
    bar.style.overflow = "visible";
    bar.style.background = "#ffffff";
    bar.style.borderRight = "1px solid #ccc";
    bar.style.borderTop = "none";
    bar.style.zIndex = "1000";

    currentQuestions.forEach(
        (question, index) => {
            const button =
                document.createElement("button");

            button.className =
                "question-jump-button";

            button.textContent =
                index + 1;

            button.style.display = "block";
            button.style.width = "38px";
            button.style.minWidth = "38px";
            button.style.height = "34px";
            button.style.margin = "0 0 4px 0";
            button.style.padding = "0";

            button.addEventListener(
                "click",
                () => {
                    currentQuestionIndex = index;

                    showQuestion();
                    updateQuestionJumpButtons();

                    window.scrollTo(0, 0);
                }
            );

            bar.appendChild(button);
        }
    );

    updateQuestionJumpButtons();
}

function updateQuestionJumpButtons() {
    const buttons =
        document.querySelectorAll(
            ".question-jump-button"
        );

    buttons.forEach(
        (button, index) => {
            button.classList.toggle(
                "current",
                index === currentQuestionIndex
            );

            const question =
                currentQuestions[index];

            const subQuestions =
                parseSubQuestions(
                    question.section === "Section3"
                        ? question.khmerQuestion
                        : question.question
                );

            let answered = false;

            if (subQuestions.length > 0) {
                const answers =
                    userAnswers[index];

                answered =
                    Array.isArray(answers) &&
                    answers.length ===
                        subQuestions.length &&
                    subQuestions.every(
                        (_, subIndex) =>
                            answers[subIndex]
                    );
            } else {
                answered =
                    Array.isArray(userAnswers[index]) &&
                    userAnswers[index].some(
                        answer => answer
                    );
            }

            button.classList.toggle(
                "answered",
                answered
            );
        }
    );
}

function updateQuestionJumpBarHeight() {
    const bar =
        document.getElementById(
            "question-jump-bar"
        );

    if (!bar) {
        return;
    }

    document.body.style.paddingBottom =
        `${bar.offsetHeight + 20}px`;
}

function calculateResult() {
    questionResults = [];

    currentQuestions.forEach(
        (question, index) => {
            const answers =
                userAnswers[index];

            const subQuestions =
                parseSubQuestions(
                    question.section === "Section3"
                        ? question.khmerQuestion
                        : question.question
                );

            let correct = false;
            let subResults = [];

            if (subQuestions.length > 0) {
                subResults =
                    subQuestions.map(
                        (_, subIndex) => {
                            const answer =
                                Array.isArray(answers)
                                    ? answers[subIndex]
                                    : null;

                            return {
                                number:
                                    subQuestions[subIndex].number,

                                correct:
                                    answer &&
                                    answer.correct === true
                            };
                        }
                    );

                correct =
                    subResults.length > 0 &&
                    subResults.every(
                        result =>
                            result.correct === true
                    );
            } else if (
                Array.isArray(answers) &&
                answers.length > 0
            ) {
                correct =
                    answers.every(
                        answer =>
                            answer &&
                            answer.correct === true
                    );
            }

            questionResults.push({
                questionNumber: index + 1,
                correct,
                subResults:
                    question.section === "Section4" ||
                    question.section === "Section3"
                        ? subResults
                        : []
            });
        }
    );

    let totalAnswers = 0;
    let correctAnswers = 0;

    currentQuestions.forEach(
        (question, index) => {
            const answers =
                userAnswers[index];

            const subQuestions =
                parseSubQuestions(
                    question.section === "Section3"
                        ? question.khmerQuestion
                        : question.question
                );

            if (subQuestions.length > 0) {
                totalAnswers +=
                    subQuestions.length;

                if (Array.isArray(answers)) {
                    correctAnswers +=
                        answers.filter(
                            answer =>
                                answer &&
                                answer.correct === true
                        ).length;
                }
            } else {
                totalAnswers++;

                if (
                    Array.isArray(answers) &&
                    answers.length > 0 &&
                    answers.every(
                        answer =>
                            answer &&
                            answer.correct === true
                    )
                ) {
                    correctAnswers++;
                }
            }
        }
    );

    const percentage =
        totalAnswers === 0
            ? 0
            : Math.round(
                correctAnswers /
                totalAnswers *
                100
            );

    saveBestScore(
        selectedCourse,
        selectedLesson,
        selectedSection,
        percentage
    );

    showResultScreen(
        correctAnswers,
        totalAnswers,
        percentage
    );
}

function showResultScreen(
    correctCount,
    total,
    percentage
) {
    document
        .getElementById("quiz-screen")
        .classList.add("hidden");

    document
        .getElementById("question-number")
        .textContent = "";

    document
        .getElementById("result-screen")
        .classList.remove("hidden");

    const resultTitle =
        document.querySelector(
            "#result-screen h1"
        );

    resultTitle.innerHTML =
        `<ruby>結果<rt>けっか</rt></ruby>　លទ្ធផល`;

    const oldResultInfo =
        document.querySelector(
            "#result-screen .result-info"
        );

    if (oldResultInfo) {
        oldResultInfo.remove();
    }

    const resultInfo =
        document.createElement("div");

    resultInfo.className =
        "result-info";

resultInfo.innerHTML =
    selectedLesson === "L1~18"
        ? `${selectedCourse}&nbsp;&nbsp;${selectedLesson}`
        : `${selectedCourse}&nbsp;&nbsp;${selectedLesson}&nbsp;&nbsp;${selectedSection}`;

    resultTitle.insertAdjacentElement(
        "afterend",
        resultInfo
    );

    document
        .getElementById("score")
        .textContent =
        `${percentage}%`;

    const list =
        document.getElementById(
            "result-list"
        );

    list.style.width = "fit-content";
    list.style.margin = "0 auto";
    list.innerHTML = "";

    questionResults.forEach(
        result => {
            const hasSubResults =
                result.subResults &&
                result.subResults.length > 0;

            const createCell = (
                text,
                width,
                color
            ) => {
                const cell =
                    document.createElement("span");

                cell.textContent = text;
                cell.style.display = "inline-block";
                cell.style.width = width;
                cell.style.color = color;

                return cell;
            };

            if (hasSubResults) {
                result.subResults.forEach(
                    (subResult, subIndex) => {
                        const row =
                            document.createElement("div");

                        row.className =
                            "result-item";

                        row.style.textAlign =
                            "left";

                        row.appendChild(
                            createCell(
                                subIndex === 0
                                    ? `${result.questionNumber}．`
                                    : "",
                                "1.5em",
                                "#222"
                            )
                        );

                        row.appendChild(
                            createCell(
                                `(${subResult.number})`,
                                "2em",
                                "#222"
                            )
                        );

                        row.appendChild(
                            createCell(
                                subResult.correct
                                    ? "○"
                                    : "×",
                                "1em",
                                subResult.correct
                                    ? "#006600"
                                    : "#cc0000"
                            )
                        );

                        list.appendChild(row);
                    }
                );
            } else {
                const row =
                    document.createElement("div");

                row.className =
                    "result-item";

                row.style.textAlign =
                    "left";

                row.appendChild(
                    createCell(
                        `${result.questionNumber}．`,
                        "1.5em",
                        "#222"
                    )
                );

                row.appendChild(
                    createCell(
                        "",
                        "2em",
                        "#222"
                    )
                );

                row.appendChild(
                    createCell(
                        result.correct
                            ? "○"
                            : "×",
                        "1em",
                        result.correct
                            ? "#006600"
                            : "#cc0000"
                    )
                );

                list.appendChild(row);
            }
        }
    );

    window.scrollTo(0, 0);
}

document.addEventListener(
    "DOMContentLoaded",
    () => {
        document.addEventListener(
            "click",
            event => {
                if (
                    event.target.id !==
                    "confirm-button"
                ) {
                    return;
                }

                confirmationMode = true;
                currentQuestionIndex = 0;

                document
                    .getElementById("result-screen")
                    .classList.add("hidden");

                document
                    .getElementById("quiz-screen")
                    .classList.remove("hidden");

                showQuestion();
                createQuestionJumpButtons();

                window.scrollTo(0, 0);
            }
        );

        document
            .getElementById("restart-button")
            .addEventListener(
                "click",
                () => {
                    document
                        .getElementById("result-screen")
                        .classList.add("hidden");

                    document
                        .getElementById("section-screen")
                        .classList.add("hidden");

                    document
                        .getElementById("start-screen")
                        .classList.remove("hidden");

                    document
                        .getElementById("question-jump-bar")
                        .innerHTML = "";

                    document
                        .getElementById("question-number")
                        .textContent = "";
                }
            );
    }
);

function addMedia(
    value,
    container,
    type
) {
    if (!value) {
        return;
    }

    const values =
        splitMediaValues(value);

    values.forEach(
        path => {
            if (!path) {
                return;
            }

            const lower =
                path.toLowerCase();

            if (
                lower.endsWith(".mp3") ||
                lower.endsWith(".wav") ||
                lower.endsWith(".ogg")
            ) {
                const audio =
                    document.createElement("audio");

                audio.controls = true;
                audio.controlsList =
                    "nodownload noplaybackrate";
                audio.className =
                    "audio-player";

                audio.src =
                    path.includes("/")
                        ? (
                            path.startsWith("audio/")
                                ? path
                                : `audio/${path.split("/").pop()}`
                        )
                        : `audio/${path}`;

                container.appendChild(audio);

                return;
            }

            if (
                lower.endsWith(".png") ||
                lower.endsWith(".jpg") ||
                lower.endsWith(".jpeg") ||
                lower.endsWith(".gif") ||
                lower.endsWith(".webp")
            ) {
                const image =
                    document.createElement("img");

                image.src =
                    path.includes("/")
                        ? path
                        : `image/${path}`;

                image.className =
                    type === "choice"
                        ? "choice-image"
                        : "question-image";

                container.appendChild(image);
            }
        }
    );
}

function splitMediaValues(value) {
    if (!value) {
        return [];
    }

    return String(value)
        .split(/\r?\n/)
        .map(value => value.trim())
        .filter(Boolean);
}

function formatText(text) {
    if (!text) {
        return "";
    }

    return String(text)
        .replace(/\r?\n/g, "<br>")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(
            /([\u3400-\u9fff々]+)【([^【】]+)】/g,
            "<ruby>$1<rt>$2</rt></ruby>"
        )
        .replace(
            /〈([^〉]+)〉/g,
            "<u>$1</u>"
        );
}

function shuffleArray(array) {
    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {
        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            array[i],
            array[j]
        ] = [
            array[j],
            array[i]
        ];
    }

    return array;
}

function createDogAnimation() {
    const container =
        document.getElementById("dog-animation");

    if (!container) {
        return;
    }

    const dog =
        document.createElement("img");

    const baseDogSize = 125;

    const scores =
        getBestScores();

    const bestScores =
        Object.values(scores)
            .map(score => Number(score) || 0)
            .sort((a, b) => b - a)
            .slice(0, 40);

    const totalScore =
        bestScores.reduce(
            (sum, score) => sum + score,
            0
        );

    const dogSize =
        baseDogSize *
        (1 + totalScore / 3000);

    const isFatDog =
        totalScore > 3000;

    const dogPrefix =
        isFatDog
            ? "image/dog2_"
            : "image/dog_";

    dog.src =
        `${dogPrefix}1.png`;

    dog.style.position = "absolute";
    dog.style.width = `${dogSize}px`;
    dog.style.height = `${dogSize}px`;
    dog.style.objectFit = "contain";
    dog.style.left = "0px";
    dog.style.bottom = "0px";
    dog.style.transformOrigin = "center center";

    container.appendChild(dog);

    const walkingFrames = [
        `${dogPrefix}1.png`,
        `${dogPrefix}2.png`,
        `${dogPrefix}3.png`
    ];

    let frameIndex = 0;
    let direction = 1;
    let position = 0;
    let lastTime = performance.now();
    let frameTime = 0;
    let stateTime = 0;
    let sitting = false;

    let walkDuration =
        2000 + Math.random() * 3000;

    let sitDuration =
        2000 + Math.random() * 3000;

    function animate(time) {
        const delta =
            time - lastTime;

        lastTime = time;
        stateTime += delta;

        if (sitting) {
            if (stateTime >= sitDuration) {
                sitting = false;
                stateTime = 0;

                walkDuration =
                    2000 + Math.random() * 3000;

                dog.src =
                    walkingFrames[frameIndex];
            }
        } else {
            position +=
                direction * delta * 0.06;

            const maxPosition =
                container.clientWidth - dogSize;

            if (position >= maxPosition) {
                position = maxPosition;
                direction = -1;
            }

            if (position <= 0) {
                position = 0;
                direction = 1;
            }

            if (
                stateTime >= walkDuration &&
                position > 20 &&
                position < maxPosition - 20
            ) {
                sitting = true;
                stateTime = 0;

                sitDuration =
                    2000 + Math.random() * 3000;

                dog.src =
                    `${dogPrefix}4.png`;
            }

            frameTime += delta;

            if (frameTime >= 180) {
                frameTime = 0;

                frameIndex =
                    (frameIndex + 1) %
                    walkingFrames.length;

                dog.src =
                    walkingFrames[frameIndex];
            }
        }

        dog.style.left =
            position + "px";

        dog.style.transform =
            direction === 1
                ? "scaleX(-1)"
                : "scaleX(1)";

        if (sitting) {
            dog.src =
                `${dogPrefix}4.png`;
        }

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

createDogAnimation();
loadQuestions();