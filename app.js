let allQuestions = [];

// =========================
// 表示するコース
// =========================

const displayedCourses = [
    "A1ことば①",
    "A1ことば②",
    "A1ことば③",
    "A1かんじ①",
    "A1かんじ②",
    "A1かんじ③",
    "A1かいわ①",
    "A1かいわ②",
    "A1かいわ③",
    "A1かいわ④",
    "A1どっかい①",
    "A1どっかい②"
];

let currentQuestions = [];
let currentQuestionIndex = 0;

let userAnswers = [];

let selectedCourse = "";

let questionResults = [];
let confirmationMode = false;
let displayedChoiceSets = [];

// =========================
// JSON読み込み
// =========================

async function loadQuestions() {

    try {

        const response =
            await fetch("questions.json");

        if (!response.ok) {
            throw new Error(
                "questions.json を読み込めませんでした。"
            );
        }

        allQuestions =
            await response.json();

        createCourseButtons();

    } catch (error) {

        console.error(error);

        alert(
            "問題データを読み込めませんでした。"
        );
    }
}


// =========================
// コースボタン作成
// =========================

function createCourseButtons() {

    const container =
        document.getElementById(
            "course-buttons"
        );

    container.innerHTML = "";

const courses =
    displayedCourses.filter(
        course =>
            allQuestions.some(
                question =>
                    String(
                        question.course || ""
                    ).trim() === course
            )
    );

    courses.forEach(course => {

        const button =
            document.createElement("button");

        button.className =
            "course-button";

        button.textContent =
            course;

        button.addEventListener(
            "click",
            () => {
                startQuiz(course);
            }
        );

        container.appendChild(button);

    });
}


// =========================
// テスト開始
// =========================

function startQuiz(course) {

    selectedCourse = course;

    confirmationMode = false;

    const quizScreen =
        document.getElementById("quiz-screen");

    quizScreen.className = "course-screen";
    quizScreen.dataset.course = course;

    currentQuestions =
        allQuestions.filter(
            question =>
                String(
                    question.course || ""
                ).trim() === course
        );


    if (currentQuestions.length === 0) {

        alert(
            "このコースには問題がありません。"
        );

        return;
    }

    currentQuestions =
        [...currentQuestions];

    shuffleArray(
        currentQuestions
    );

    currentQuestionIndex = 0;
    confirmationMode = false;
    displayedChoiceSets =
        new Array(currentQuestions.length).fill(null);

    userAnswers =
        new Array(
            currentQuestions.length
        ).fill(null);

    questionResults = [];

    document
        .getElementById("start-screen")
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

// =========================
// 問題表示
// =========================

function showQuestion() {

    window.scrollTo(0, 0);

    const question =
        currentQuestions[
            currentQuestionIndex
        ];

    const questionArea =
        document.getElementById(
            "question-area"
        );

  document.getElementById("quiz-screen").dataset.section =
        question.section || "";

    questionArea.innerHTML = "";


    document.getElementById(
        "question-number"
    ).textContent =
        `${currentQuestionIndex + 1} / ${currentQuestions.length}`;


    /*
     * 小問の有無を判定
     */
    const subQuestions =
        parseSubQuestions(
            question.question
        );


    /*
     * 通常問題
     */
    if (subQuestions.length === 0) {

        /*
         * 問題文部分の高さを一定にする
         * S1～S3のみ使用
         */
        const questionContent =
            document.createElement("div");

        questionContent.className =
            "question-content";


        if (
            question.question &&
            question.question.trim()
        ) {

            const questionText =
                document.createElement("div");

            questionText.className =
                "question-text";

            questionText.innerHTML =
                formatText(
                    question.question
                );

            questionContent.appendChild(
                questionText
            );
        }

        if (
            question.section !== "Section1" &&
            question.section !== "Section2" &&
            question.khmerQuestion &&
            question.khmerQuestion.trim()
        ) {

    const khmerText =
        document.createElement("div");

    khmerText.className =
        "question-text khmer-question-text";

    khmerText.innerHTML =
        formatText(
            question.khmerQuestion
        );

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

    }


    /*
     * 小問問題（S4）
     */
    else {

        /*
         * 小問より前の文章だけ表示
         */
        const firstSubQuestionIndex =
            question.question.search(
                /\(\d+\)/
            );

        if (
            firstSubQuestionIndex > 0
        ) {

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

                questionText.className =
                    "question-text";

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

            khmerText.className =
                "question-text";

            khmerText.innerHTML =
                formatText(
                    question.khmerQuestion
                );

            questionArea.appendChild(
                khmerText
            );
        }


        /*
         * questionImage が空の場合でも、
         * question の中にある画像ファイル名を探す。
         */
        const questionImageMatch =
            question.question.match(
                /([^<>\s]+\.(png|jpg|jpeg|gif|webp))/i
            );

        if (
            questionImageMatch
        ) {

            addMedia(
                questionImageMatch[1],
                questionArea,
                "question"
            );
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

// 通常問題の選択肢表示
function showNormalChoices(question, container) {
    const questionIndex = currentQuestionIndex;

    let choices = displayedChoiceSets[questionIndex];

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

        displayedChoiceSets[questionIndex] = choices;
    }

    showChoices(
        choices,
        container,
        questionIndex,
        0
    );
}

// =========================
// 小問判定
// =========================

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
                number:
                    Number(match[1]),

                text:
                    match[2].trim()
            });

        }

    });


    return result;
}


// =========================
// 小問表示
// =========================

function showSubQuestions(
    question,
    subQuestions,
    container
) {

    /*
     * 小問の順番は変更しない。
     */

    const choiceGroups =
        createChoiceGroups(
            question,
            subQuestions.length
        );


    subQuestions.forEach(
        (subQuestion, index) => {

            const subContainer =
                document.createElement(
                    "div"
                );

            subContainer.className =
                "subquestion";


            const title =
                document.createElement(
                    "div"
                );

            title.className =
                "subquestion-text";

            title.innerHTML =
                `(${subQuestion.number}) ${formatText(subQuestion.text)}`;

            subContainer.appendChild(
                title
            );


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


// =========================
// 小問用選択肢作成
// =========================

function createChoiceGroups(
    question,
    subQuestionCount
) {

    const questionIndex =
        currentQuestionIndex;

    /*
     * すでに作成した選択肢があれば、
     * 同じ順番をそのまま使用する。
     */
    if (
        displayedChoiceSets[questionIndex]
    ) {

        return displayedChoiceSets[
            questionIndex
        ];
    }

    const groups = [];

    for (
        let i = 0;
        i < subQuestionCount;
        i++
    ) {

        const choices = [];

        (question.choices || [])
            .forEach(choice => {

                /*
                 * text の中に
                 *
                 * S4-001-11.png<br>16時
                 *
                 * のように画像と文字が入っている場合、
                 * <br> で分ける。
                 */
                const textParts =
                    String(choice.text || "")
                        .split(/<br\s*\/?>/i)
                        .map(value =>
                            value.trim()
                        );

                const imageParts =
                    splitMediaValues(
                        choice.image
                    );

                const audioParts =
                    splitMediaValues(
                        choice.audio
                    );

                let text =
                    textParts[i] || "";

                let image =
                    imageParts[i] || "";

                /*
                 * text に画像ファイル名が入っていたら
                 * 画像として扱う。
                 */
                if (
                    /\.(png|jpg|jpeg|gif|webp)$/i.test(
                        text
                    )
                ) {

                    image = text;

                    text = "";
                }

                choices.push({

                    text: text,

                    image: image,

                    audio:
                        audioParts[i] || "",

                    correct:
                        choice.correct === true

                });

            });

        /*
         * 最初に作ったときだけシャッフルする。
         */
        groups.push(
            prepareChoices(choices)
        );
    }

    /*
     * この問題の選択肢順を保存する。
     */
    displayedChoiceSets[
        questionIndex
    ] = groups;

    return groups;
}

// =========================
// 選択肢準備
// =========================

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

// =========================
// 選択肢表示
// =========================

function showChoices(
    choices,
    container,
    questionIndex,
    subIndex
) {

    const list =
        document.createElement("div");

    list.className =
        "choice-list";

    const question =
        currentQuestions[questionIndex];

    const isSection4 =
        question &&
        question.section === "Section4";

    choices.forEach(
        (choice, choiceIndex) => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "choice-button";

            /*
             * Section4で画像がある選択肢
             * 元JFTと同じように、JavaScriptで
             * 画像選択肢であることを明示する。
             */
            if (
                isSection4 &&
                choice.image
            ) {
                button.classList.add(
                    "choice-with-image"
                );
            }

            const content =
                document.createElement(
                    "div"
                );

            content.className =
                "choice-content";

            if (choice.text) {

                const text =
                    document.createElement(
                        "span"
                    );

                text.innerHTML =
                    formatText(
                        choice.text
                    );

                content.appendChild(
                    text
                );
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

            button.appendChild(
                content
            );


            /*
             * すでに選んでいる答えを表示
             */

            const savedAnswer =
                userAnswers[questionIndex] &&
                userAnswers[questionIndex][subIndex];

            if (
                savedAnswer &&
                savedAnswer.choiceIndex ===
                    choice._choiceIndex
            ) {

                button.classList.add(
                    "selected"
                );
            }


            /*
             * 確認中は選択肢を変更できない
             */

            if (!confirmationMode) {

                button.addEventListener(
                    "click",
                    () => {

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

            }

            list.appendChild(
                button
            );

        }
    );

    container.appendChild(
        list
    );
}

// =========================
// 回答保存
// =========================

function saveAnswer(
    questionIndex,
    subIndex,
    choice
) {

    if (
        !userAnswers[questionIndex]
    ) {

        userAnswers[questionIndex] =
            [];
    }

    userAnswers[
        questionIndex
    ][subIndex] = {
        correct:
            choice.correct,

        choiceIndex:
            choice._choiceIndex
    };

}

// =========================
// Backボタン
// =========================

document
    .getElementById("back-button")
    .addEventListener(
        "click",
        () => {

            if (
                currentQuestionIndex > 0
            ) {

                currentQuestionIndex--;

                showQuestion();
            }
        }
    );

// =========================
// 次へボタン
// =========================

function updateNextButton() {

    const button =
        document.getElementById(
            "next-button"
        );

    if (
        currentQuestionIndex ===
        currentQuestions.length - 1
    ) {

        button.textContent =
            "Finish";

        button.classList.add("finish-button");

    } else {

        button.textContent =
            "Next";

        button.classList.remove("finish-button");
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
                        .getElementById("quiz-screen")
                        .classList.add("hidden");

                    document
                        .getElementById("result-screen")
                        .classList.remove("hidden");

                } else {

                    calculateResult();

                }

            }
        }
    );
    
// =========================
// 問題番号ジャンプボタン
// =========================

function createQuestionJumpButtons() {

    const bar =
        document.getElementById(
            "question-jump-bar"
        );

    bar.innerHTML = "";

    currentQuestions.forEach(
        (question, index) => {

            const button =
                document.createElement("button");

            button.className =
                "question-jump-button";

            button.textContent =
                index + 1;

            button.addEventListener(
                "click",
                () => {

                    currentQuestionIndex =
                        index;

                    showQuestion();

                    updateQuestionJumpButtons();

                    window.scrollTo(0, 0);
                }
            );

            bar.appendChild(button);

        }
    );

    updateQuestionJumpButtons();
    updateQuestionJumpBarHeight();
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

            button.classList.toggle(
                "answered",
                Array.isArray(userAnswers[index]) &&
                userAnswers[index].some(answer => answer)
            );
        }
    );
}

function updateQuestionJumpBarHeight() {
    const bar = document.getElementById("question-jump-bar");

    if (!bar) {
        return;
    }

    document.body.style.paddingBottom =
        `${bar.offsetHeight + 20}px`;
}

// =========================
// 結果計算
// =========================

function calculateResult() {

    let correctCount = 0;

    questionResults = [];


    currentQuestions.forEach(
        (question, index) => {

            const answers =
                userAnswers[index];


            let correct = false;


            if (
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


            if (correct) {
                correctCount++;
            }


            questionResults.push({
                questionNumber:
                    index + 1,

                correct
            });

        }
    );


    const total =
        currentQuestions.length;


    const percentage =
        total === 0
            ? 0
            : Math.round(
                correctCount /
                total *
                100
            );


    showResultScreen(
        correctCount,
        total,
        percentage
    );
}


// =========================
// 結果表示
// =========================

function showResultScreen(
    correctCount,
    total,
    percentage
) {

    document
        .getElementById(
            "quiz-screen"
        )
        .classList.add("hidden");

    document
        .getElementById(
            "result-screen"
        )
        .classList.remove("hidden");

    document
        .getElementById(
            "score"
        )
        .textContent =
        `${percentage}%`;


    document
        .getElementById(
            "correct-count"
        )
        .textContent =
        `正解：${correctCount} / ${total}`;


    const list =
        document.getElementById(
            "result-list"
        );

    list.innerHTML = "";


    questionResults.forEach(
        result => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "result-item";


            if (result.correct) {

                item.classList.add(
                    "result-correct"
                );

                item.textContent =
                    `第${result.questionNumber}問　○ 正解`;

            } else {

                item.classList.add(
                    "result-wrong"
                );

                item.textContent =
                    `第${result.questionNumber}問　× 不正解`;
            }


            list.appendChild(
                item
            );

        }
    );
         window.scrollTo(0, 0);
}

// =========================
// 確認モード
// =========================

document.addEventListener(
    "DOMContentLoaded",
    () => {

document.addEventListener(
    "click",
    (event) => {

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
    }
);

// =========================
// 最初に戻る
// =========================

document
    .getElementById(
        "restart-button"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "result-screen"
                )
                .classList.add("hidden");

            document
                .getElementById(
                    "start-screen"
                )
                .classList.remove("hidden");

        }
    );


// =========================
// メディア表示
// =========================

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


            /*
             * 音声
             */
            if (
                lower.endsWith(".mp3") ||
                lower.endsWith(".wav") ||
                lower.endsWith(".ogg")
            ) {

                const audio =
                    document.createElement(
                        "audio"
                    );

                audio.controls = true;

                audio.className =
                    "audio-player";

                audio.src =
                    path.replace(/^image\//, "audio/");

                container.appendChild(
                    audio
                );

                return;
            }


            /*
             * 画像
             */
            if (
                lower.endsWith(".png") ||
                lower.endsWith(".jpg") ||
                lower.endsWith(".jpeg") ||
                lower.endsWith(".gif") ||
                lower.endsWith(".webp")
            ) {

     const image =
    document.createElement(
        "img"
    );

image.src =
    path.includes("/")
        ? path
        : `image/${path}`;

image.className =
    type === "choice"
        ? "choice-image"
        : "question-image";

                container.appendChild(
                    image
                );

            }

        }
    );
}


// =========================
// 改行で分割
// =========================

function splitMediaValues(value) {

    if (!value) {
        return [];
    }


    return String(value)
        .split(/\r?\n/)
        .map(value =>
            value.trim()
        )
        .filter(Boolean);
}


// =========================
// HTML表示用
// =========================

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
        .replace(/〈([^〉]+)〉/g, "<u>$1</u>");
}

// =========================
// シャッフル
// =========================

function shuffleArray(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
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


// =========================
// 起動
// =========================

loadQuestions();