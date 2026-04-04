// ================= ÉTAT & CONFIGURATION =================
let appContent = null; // Contiendra le JSON chargé
let currentClasse = "";
let currentCompId = "";
let currentThemeId = "";
let currentLesson = null;

let quizQuestions = [];
let currentQuestion = 0;
let score = 0;

// Récupération de la progression sauvegardée (localStorage)
let userProgress = JSON.parse(localStorage.getItem('eduProgress')) || {};

// ================= CHARGEMENT DES DONNÉES =================
async function loadAppData() {
  try {
    // ⚠️ Adaptez le chemin si votre fichier est ailleurs
    const response = await fetch('data/content-maths-6e.json');
    appContent = await response.json();
    console.log("✅ Contenu pédagogique chargé :", appContent.meta);
  } catch (error) {
    console.error("❌ Erreur de chargement du contenu :", error);
    alert("Impossible de charger les cours. Vérifiez le chemin du fichier JSON.");
  }
}

// ================= NAVIGATION HIÉRARCHIQUE =================
function selectClasse(classe) {
  currentClasse = classe;
  document.getElementById("matieres").classList.remove("hidden");
  // Exemple d'affichage des matières (à adapter selon votre HTML)
  document.getElementById("matieres-list").innerHTML = `
    <button onclick="selectSubject('maths')">📐 Mathématiques</button>
    <button onclick="alert('Bientôt disponible')" disabled>📚 Français</button>
  `;
}

function selectSubject(subject) {
  if (!appContent) return;
  
  const container = document.getElementById("competences");
  container.innerHTML = "";
  container.classList.remove("hidden");
  document.getElementById("matieres").classList.add("hidden");

  appContent.competencies.forEach(comp => {
    const btn = document.createElement("button");
    btn.className = "nav-btn";
    btn.innerHTML = `🎯 ${comp.name}`;
    btn.onclick = () => selectCompetency(comp.id);
    container.appendChild(btn);
  });
}

function selectCompetency(compId) {
  currentCompId = compId;
  const comp = appContent.competencies.find(c => c.id === compId);
  const container = document.getElementById("themes");
  container.innerHTML = "";
  container.classList.remove("hidden");
  document.getElementById("competences").classList.add("hidden");

  comp.themes.forEach(theme => {
    const progress = getThemeProgress(theme.id);
    const btn = document.createElement("button");
    btn.className = "nav-btn";
    btn.innerHTML = `📖 ${theme.name} <span class="badge">${progress}/${theme.lessons.length}</span>`;
    btn.onclick = () => selectTheme(theme.id);
    container.appendChild(btn);
  });
}

function selectTheme(themeId) {
  currentThemeId = themeId;
  const comp = appContent.competencies.find(c => c.id === currentCompId);
  const theme = comp.themes.find(t => t.id === themeId);
  
  const container = document.getElementById("lecons");
  container.innerHTML = "";
  container.classList.remove("hidden");
  document.getElementById("themes").classList.add("hidden");

  theme.lessons.forEach(lesson => {
    const isDone = userProgress[lesson.id]?.completed;
    const btn = document.createElement("button");
    btn.className = `nav-btn ${isDone ? 'completed' : ''}`;
    btn.innerText = isDone ? `✅ ${lesson.title}` : `📝 ${lesson.title}`;
    btn.onclick = () => openLesson(lesson);
    container.appendChild(btn);
  });
}

// ================= AFFICHAGE LEÇON =================
function openLesson(lesson) {
  currentLesson = lesson;
  document.getElementById("lecons").classList.add("hidden");
  document.getElementById("cours").classList.remove("hidden");

  document.getElementById("titreCours").innerText = lesson.title;
  document.getElementById("contenuCours").innerHTML = `
    <h3>🎯 Objectifs</h3>
    <ul>${lesson.objectives.map(o => `<li>${o}</li>`).join('')}</ul>
    <h3>📖 Théorie</h3>
    <p>${lesson.content.theory}</p>
    <h3>📝 Exemples</h3>
    <ul>${lesson.content.examples.map(e => `<li>${e}</li>`).join('')}</ul>
    <div class="tip-box">💡 <strong>Astuce :</strong> ${lesson.content.tips}</div>
    <button onclick="startQuiz()" class="btn-primary">🚀 Lancer le Quiz (${lesson.quiz.count} questions)</button>
  `;
}

// ================= SYSTÈME DE QUIZ =================
function startQuiz() {
  document.getElementById("cours").classList.add("hidden");
  document.getElementById("quiz").classList.remove("hidden");

  currentQuestion = 0;
  score = 0;

  // 🔁 REMPLACER PLUS TARD PAR UN CHARGEMENT DE VRAIES QUESTIONS JSON
  quizQuestions = generateMockQuestions(currentLesson);

  showQuestion();
}

function generateMockQuestions(lesson) {
  // 🧩 Template de questions (à remplacer par vos 600 questions réelles)
  const questions = [];
  for (let i = 0; i < lesson.quiz.count; i++) {
    questions.push({
      question: `[${lesson.title}] Question ${i + 1}/10`,
      answers: ["Proposition A", "Proposition B", "Proposition C"],
      correct: Math.floor(Math.random() * 3) // Aléatoire pour la démo
    });
  }
  return questions;
}

function showQuestion() {
  if (currentQuestion >= quizQuestions.length) {
    showResults();
    return;
  }

  const q = quizQuestions[currentQuestion];
  document.getElementById("question").innerText = q.question;

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  q.answers.forEach((answer, index) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.innerText = answer;
    btn.onclick = () => handleAnswer(index, btn);
    answersDiv.appendChild(btn);
  });

  // Barre de progression
  const progressEl = document.getElementById("quiz-progress");
  if (progressEl) progressEl.innerText = `Question ${currentQuestion + 1}/${quizQuestions.length}`;
}

function handleAnswer(selectedIndex, btnElement) {
  const q = quizQuestions[currentQuestion];
  const isCorrect = selectedIndex === q.correct;

  if (isCorrect) score++;

  // Feedback immédiat
  btnElement.classList.add(isCorrect ? "correct" : "incorrect");
  const feedback = document.getElementById("feedback");
  if (feedback) {
    feedback.innerText = isCorrect ? "✅ Bonne réponse !" : `❌ La bonne réponse était : ${q.answers[q.correct]}`;
    feedback.className = isCorrect ? "feedback success" : "feedback error";
  }

  // Désactiver les boutons
  document.querySelectorAll(".answer-btn").forEach(b => b.disabled = true);

  // Afficher bouton suivant
  const nextBtn = document.getElementById("next-btn");
  if (nextBtn) nextBtn.style.display = "block";
}

function nextQuestion() {
  currentQuestion++;
  const nextBtn = document.getElementById("next-btn");
  const feedback = document.getElementById("feedback");
  
  if (nextBtn) nextBtn.style.display = "none";
  if (feedback) feedback.innerText = "";
  
  showQuestion();
}

function showResults() {
  document.getElementById("quiz").classList.add("hidden");
  document.getElementById("resultat").classList.remove("hidden");

  const percent = Math.round((score / quizQuestions.length) * 100);
  const passingThreshold = currentLesson.quiz.passingScore;
  const passed = score >= passingThreshold;

  document.getElementById("score").innerHTML = `
    📊 Score final : <strong>${score}/${quizQuestions.length}</strong> (${percent}%)
    ${passed ? '<br>🎉 <span style="color:green">Leçon validée !</span>' : '<br>🔄 <span style="color:orange">À retravailler</span>'}
  `;

  // Sauvegarde progression
  if (passed) {
    userProgress[currentLesson.id] = { completed: true, score: percent, date: new Date().toISOString() };
    localStorage.setItem('eduProgress', JSON.stringify(userProgress));
  }

  // Bouton retour
  const container = document.getElementById("resultat");
  // Nettoyer le contenu précédent sauf le titre et le score
  container.innerHTML = `<h2>Résultats</h2><p id="score">${container.querySelector("#score").innerHTML}</p>`;
  
  const backBtn = document.createElement("button");
  backBtn.className = "btn-primary";
  backBtn.innerText = "🔙 Retour aux leçons";
  backBtn.onclick = () => {
    document.getElementById("resultat").classList.add("hidden");
    selectTheme(currentThemeId);
  };
  container.appendChild(backBtn);
}

// ================= UTILITAIRES =================
function getThemeProgress(themeId) {
  if (!appContent) return 0;
  let count = 0;
  appContent.competencies.forEach(comp => {
    comp.themes.forEach(theme => {
      if (theme.id === themeId) {
        theme.lessons.forEach(lesson => {
          if (userProgress[lesson.id]?.completed) count++;
        });
      }
    });
  });
  return count;
}

// ================= INITIALISATION =================
document.addEventListener("DOMContentLoaded", () => {
  loadAppData();
  // Votre écran d'accueil peut s'afficher ici
});
