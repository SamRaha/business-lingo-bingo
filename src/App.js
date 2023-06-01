import React, { useState, useCallback } from "react";
import "./App.css";
import Confetti from "./Confetti";

// List of phrases
const phrases = [
    "Dot the i's and cross the t's",
    "Circling back",
    "Per our last email",
    "Low hanging fruit",
    "Boots on the ground",
    "Win-win",
    "Think outside the box!",
    "At the end of the day",
    "Let's touch base",
    "Moving forward",
    "Giving 110%",
    "Data-driven",
    "On the radar",
    "What are your thoughts",
    "Pain point",
    "Synergy",
    "Put in on the record",
    "Hit the ground running",
    "Value-added",
    "High-performing",
    "On the same page",
    "Bang for your buck",
    "No-brainer",
    "Pivot",
];

// Shuffle array function
function shuffle(array) {
    let currentIndex = array.length;
    let temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
// Bingo cell component
const BingoCell = ({ phrase, pickedPhrases, onPickPhrase }) => (
    <div
        className={`bingo-cell ${pickedPhrases.includes(phrase) ? "picked" : ""}`}
        onClick={onPickPhrase ? () => onPickPhrase(phrase) : null} // Only call the function if it's not null
    >
        {phrase}
    </div>
);
// Bingo card component
function BingoCard() {
    const initialPhrases = shuffle(phrases).slice(0, 24); // One less for the "FREE" cell.
    initialPhrases.splice(12, 0, "FREE"); // Insert "FREE" at the middle position.
    const [cardPhrases] = useState(initialPhrases);
    const [pickedPhrases, setPickedPhrases] = useState(["FREE"]); // "FREE" cell is initially picked.

    // Function to pick a phrase, using useCallback to prevent unnecessary re-renders
    const pickPhrase = useCallback(
        (phrase) => {
            if (!pickedPhrases.includes(phrase)) {
                setPickedPhrases((prevPickedPhrases) => [...prevPickedPhrases, phrase]);
            }
        },
        [pickedPhrases]
    );

    // Checking winning condition
    function checkWin() {
        const horizontalWins = [
            [0, 1, 2, 3, 4],
            [5, 6, 7, 8, 9],
            [10, 11, 12, 13, 14],
            [15, 16, 17, 18, 19],
            [20, 21, 22, 23, 24],
        ];
        const verticalWins = [
            [0, 5, 10, 15, 20],
            [1, 6, 11, 16, 21],
            [2, 7, 12, 17, 22],
            [3, 8, 13, 18, 23],
            [4, 9, 14, 19, 24],
        ];
        const diagonalWins = [
            [0, 6, 12, 18, 24],
            [4, 8, 12, 16, 20],
        ];

        const allWins = horizontalWins.concat(verticalWins, diagonalWins);

        return allWins.some((win) => win.every((cell) => pickedPhrases.includes(cardPhrases[cell])));
    }

    return (
        <div className="bingo-card">
            <h1>Business Lingo Bingo</h1>
            <div className="bingo-grid">
                {cardPhrases.map((phrase, index) => (
                    <BingoCell
                        key={index}
                        phrase={phrase}
                        pickedPhrases={pickedPhrases}
                        onPickPhrase={phrase !== "FREE" ? pickPhrase : null} // Pass null instead of undefined
                    />
                ))}
            </div>
            {checkWin() && (
                <>
                    <div className="win-message">
                        <h2>Congratulations! You won Business Lingo Bingo!</h2>
                    </div>
                    <Confetti width={window.innerWidth} height={window.innerHeight} />
                </>
            )}
        </div>
    );
}

export default BingoCard;
