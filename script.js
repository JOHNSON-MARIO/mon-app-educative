let currentClasse = "";
let score = 0;
let index = 0;

const quiz = [
  {
    q: "2 + 2 = ?",
    a: ["3", "4", "5"],
    correct: 1
  }
];

// LOGIN
function login() {
  const user = document.getElementById("username").value;
  if (user) {
    localStorage.setItem("user", user);
    showApp();
  }
}

function logout() {
  localStorage.removeItem("user");
  location.reload();
}

function showApp() {
  document.getElementById("login").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
}

// AUTO LOGIN
if (localStorage.getItem("user")) {
  showApp();
}

// APP
function selectClasse(classe) {
  currentClasse = classe;
  const matieres = ["Maths", "Français", "Anglais", "SVT"];
  
  let html = "<h2>Matières</h2>";
  matieres.forEach(m => {
    html += `<button onclick="loadCours('${m}')">${m}</button>`;
  });

  document.getElementById("matieres").innerHTML = html;
  document.getElementById("matieres").classList.remove("hidden");
}

function loadCours(matiere) {
  document.getElementById("cours").classList.remove("hidden");
  document.getElementById("titreCours").innerText = matiere;
  document.getElementById("contenuCours").innerText =
    "Cours de " + matiere + " pour la classe de " + currentClasse;
}

function startQuiz() {
  index = 0;
  showQuestion();
}

function showQuestion() {
  let q = quiz[index];
  let html = `<h3>${q.q}</h3>`;
  
  q.a.forEach((ans, i) => {
    html += `<button onclick="answer(${i})">${ans}</button>`;
  });

  document.getElementById("quiz").innerHTML = html;
  document.getElementById("quiz").classList.remove("hidden");
}

function answer(i) {
  if (i === quiz[index].correct) score++;
  index++;

  if (index < quiz.length) {
    showQuestion();
  } else {
    document.getElementById("quiz").innerHTML =
      `<h2>Score: ${score}</h2>`;
  }
}
