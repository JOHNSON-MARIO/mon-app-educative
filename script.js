let currentClasse = "";
let score = 0;
let currentQuestion = 0;

const quizData = [
  {
    question: "Combien font 2 + 2 ?",
    answers: ["3", "4", "5"],
    correct: 1
  },
  {
    question: "Quelle est la capitale de la France ?",
    answers: ["Paris", "Londres", "Berlin"],
    correct: 0
  }
];

function selectClasse(classe) {
  currentClasse = classe;
  document.getElementById("matieres").classList.remove("hidden");
}

function loadCours(matiere) {
  document.getElementById("cours").classList.remove("hidden");
  document.getElementById("titreCours").innerText = matiere;
  document.getElementById("contenuCours").innerText =
    "Voici un exemple de cours de " + matiere;
}

function startQuiz() {
  document.getElementById("quiz").classList.remove("hidden");
  showQuestion();
}

function showQuestion() {
  let q = quizData[currentQuestion];
  document.getElementById("question").innerText = q.question;

  let answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  q.answers.forEach((answer, index) => {
    let btn = document.createElement("button");
    btn.innerText = answer;
    btn.onclick = () => {
      if (index === q.correct) score++;
    };
    answersDiv.appendChild(btn);
  });
}

function nextQuestion() {
  currentQuestion++;

  if (currentQuestion < quizData.length) {
    showQuestion();
  } else {
    document.getElementById("quiz").classList.add("hidden");
    document.getElementById("resultat").classList.remove("hidden");
    document.getElementById("score").innerText =
      "Score: " + score + "/" + quizData.length;
  }
}
