const niveaux = {
    facile : {
        fruits :  ['🍎', '🍎', '🍌', '🍌', '🍒', '🍒', '🍓', '🍓', '🍉', '🍉', '🍇', '🍇'],
        colonnes : 4 
    },
    moyen : {
        fruits :  ['🍎', '🍎', '🍌', '🍌', '🍒', '🍒', '🍓', '🍓', '🍉', '🍉', '🍇', '🍇', '🥥', '🥥', '🍍', '🍍'],
        colonnes : 4 
    },
    difficile : {
        fruits :  ['🍎', '🍎', '🍌', '🍌', '🍒', '🍒', '🍓', '🍓', '🍉', '🍉', '🍇', '🍇', '🥥', '🥥', '🍍', '🍍', '🥭', '🥭', '🍊', '🍊', '🍋', '🍋', '🥝', '🥝'],
        colonnes : 6 
    },
}
let niveauActuel = 'facile';
let fruits = niveaux[niveauActuel].fruits;
let premiereCarteRetournee = null;
let deuxiemeCarteRetournee = null;
let paireTrouvee = 0;
let nombreCoups = 0;
let tempsdeJeu = 0;
let timerInterval = null;
let startGame = false;

function melangerTableau(tableau) {
    for (let i = tableau.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tableau[i], tableau[j]] = [tableau[j], tableau[i]];
    }
    return tableau;
}

function formaterTemps(secondes) {
    const minutes = Math.floor(secondes / 60);
    const reste = secondes % 60;
    return `${minutes.toString().padStart(2, '0')} : ${reste.toString().padStart(2, '0')}`;
}

function demarrerChrono() {
    if(!startGame) {
        startGame = true;
        tempsdeJeu = 0;
        document.getElementById('chrono').textContent = formaterTemps(tempsdeJeu);

        timerInterval = setInterval(() => {
            tempsdeJeu++;
            document.getElementById('chrono').textContent = formaterTemps(tempsdeJeu);
        }, 1000)
    }
}

function arreterChrono() {
    clearInterval(timerInterval);
    startGame = false;
}

function finDePartie() {
    arreterChrono();

    document.getElementById('temps-final').textContent = formaterTemps(tempsdeJeu);
    document.getElementById('coups-final').textContent = nombreCoups;
    document.getElementById('message-victoire').classList.remove('hidden');

    //Save le score
    saveScore();

    // Affiche le score
    afficheMeilleursScore();
}

function saveScore() {
    let scores = JSON.parse(localStorage.getItem(`memory-scores-${niveauActuel}`)) || [];

    scores.push({
        temps : tempsdeJeu,
        coups : nombreCoups,
        date : new Date().toLocaleDateString()
    })

    //Trier les scores (d'abord par temps, puis par coups)
    scores.sort((a,b) => {
        if(a.temps === b.temps) {
            return a.coups - b.coups;
        }
        return a.temps - b.temps;
    })

    // Garder seulement les 5 meilleurs scores
    if(scores.length > 5) {
        scores = scores.slice(0,5);
    }

    // Sauvergarder dans localStorage par niveau
    localStorage.setItem(`best-score-${niveauActuel}`, JSON.stringify(scores));
}

// Fonction pour afficher les meilleurs scores
function afficheMeilleursScore() {
    // Affiche le meilleur score
}

// Fonction pour changer de niveau
function changerNiveau(niveau) {
    document.querySelectorAll('.btn-difficulte').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(niveau).classList.add('active')

    niveauActuel = niveau;

    initGame();
}

function retournerCarte(event) {
    const carte = event.target;

    if(!startGame) {
        demarrerChrono();
    }

    if(
        carte.classList.contains('retournee') ||
        carte.classList.contains('paire-trouvee') ||
        (premiereCarteRetournee && deuxiemeCarteRetournee)
    ) {
        return;
    }

    carte.classList.add('retournee')

    if(!premiereCarteRetournee) {
        premiereCarteRetournee = carte;
    } else {
        deuxiemeCarteRetournee = carte;
        nombreCoups++;
        document.getElementById('nombre-coups').textContent = nombreCoups;

        verifierPaire();
    }
}

function verifierPaire() {
    const fruit1 = premiereCarteRetournee.dataset.fruit;
    const fruit2 = deuxiemeCarteRetournee.dataset.fruit;

    if(fruit1 === fruit2) {
        premiereCarteRetournee.classList.add('paire-trouvee');
        deuxiemeCarteRetournee.classList.add('paire-trouvee');

        paireTrouvee++
        document.getElementById('paires-trouvees').textContent = paireTrouvee;

        if(paireTrouvee === fruits.length / 2) {
            finDePartie();
        }
        
        premiereCarteRetournee = null;
        deuxiemeCarteRetournee = null;
    } else {
        setTimeout(() => {
            premiereCarteRetournee.classList.remove('retournee')
            deuxiemeCarteRetournee.classList.remove('retournee')

            premiereCarteRetournee = null;
            deuxiemeCarteRetournee = null;
        }, 1000);
    }
}

function initGame() {
    // Réinitialiser les variables
    premiereCarteRetournee = null;
    deuxiemeCarteRetournee = null;
    paireTrouvee = 0;
    nombreCoups = 0;

    console.log("nombreCoups" + nombreCoups);


    //Arrêter le chrono précédent si actif
    arreterChrono();
    startGame = false;

    //Mettre à jour la configuration selon le niveau
    fruits = niveaux[niveauActuel].fruits;
    const paireTotal = fruits.length / 2;
    const nombreColonnes = niveaux[niveauActuel].colonnes;

    // Mettre à jour l'affichage
    document.getElementById('paires-trouvees').textContent = paireTrouvee;
    document.getElementById('paires-total').textContent =  paireTotal;
    document.getElementById('nombre-coups').textContent =  nombreCoups;
    document.getElementById('chrono').textContent =  "00:00";


    //Cacher les messages
    document.getElementById('message-victoire').classList.add('hidden');

    // Configurer la grille
    const grilleElement = document.getElementById('grille');
    grilleElement.style.gridTemplateColumns = `repeat(${nombreColonnes}, 100px)`;

    //  Vider la grille si elle contient déjà des éléments
    grilleElement.innerHTML = '';

    // Mélanger les fruits
    const fruitsMelanges = melangerTableau(fruits);

    fruitsMelanges.forEach((fruit, index) => {
        const carteElement = document.createElement('div');
        carteElement.className = 'carte';

        carteElement.dataset.fruit = fruit;
        carteElement.textContent = fruit;

        carteElement.addEventListener('click', retournerCarte)

        grilleElement.appendChild(carteElement);
    })
}

        // Initialisation au chargement de la page
        window.addEventListener('DOMContentLoaded', () => {
            initGame();

            // Ajouter l'événement de clic au bouton "Nouvelle partie"
            document.getElementById('nouvelle-partie').addEventListener('click', initGame);

            // Ajouter les événements pour les boutons de difficulté
            document.getElementById('facile').addEventListener('click', () => changerNiveau('facile'));
            document.getElementById('moyen').addEventListener('click', () => changerNiveau('moyen'));
            document.getElementById('difficile').addEventListener('click', () => changerNiveau('difficile'));
        });