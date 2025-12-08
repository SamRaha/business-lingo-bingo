import React, { useState, useCallback, useEffect } from "react";
import "./App.css";
import "./firebase-styles.css";
import Confetti from "./Confetti";
import Navbar from "./Navbar";
import CardCreator from "./CardCreator";
import VersionSelector from "./VersionSelector";
import PublicCardBrowser from "./PublicCardBrowser";
import { FirebaseService } from "./firebase/firebaseService";

// Default list of phrases
const defaultPhrases = [
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
        className={`bingo-cell ${pickedPhrases.includes(phrase) ? "picked" : ""} ${phrase === "FREE" ? "free" : ""}`}
        onClick={onPickPhrase ? () => onPickPhrase(phrase) : null}
    >
        {phrase}
    </div>
);

// Bingo card component
function BingoCard({ phrases = defaultPhrases, selectedVersion, onVersionChange, customCards, setCurrentView, currentCardName, onWin }) {
    const initialPhrases = shuffle([...phrases]).slice(0, 24); // One less for the "FREE" cell.
    initialPhrases.splice(12, 0, "FREE"); // Insert "FREE" at the middle position.
    const [cardPhrases, setCardPhrases] = useState(initialPhrases);
    const [pickedPhrases, setPickedPhrases] = useState(["FREE"]); // "FREE" cell is initially picked.

    // Update card when phrases change
    useEffect(() => {
        const newPhrases = shuffle([...phrases]).slice(0, 24);
        newPhrases.splice(12, 0, "FREE");
        setCardPhrases(newPhrases);
        setPickedPhrases(["FREE"]); // Reset picked phrases
        if (onWin) onWin(false); // Reset win state
    }, [phrases, onWin]);

    // Check for wins when picked phrases change
    useEffect(() => {
        if (checkWin() && onWin) {
            onWin(true);
        }
    }, [pickedPhrases, cardPhrases, onWin]);

    // Function to pick a phrase, using useCallback to prevent unnecessary re-renders
    const pickPhrase = useCallback(
        (phrase) => {
            if (!pickedPhrases.includes(phrase)) {
                setPickedPhrases((prevPickedPhrases) => [...prevPickedPhrases, phrase]);
            }
        },
        [pickedPhrases]
    );

    // Function to start a new game
    const playAgain = useCallback(() => {
        const newPhrases = shuffle([...phrases]).slice(0, 24);
        newPhrases.splice(12, 0, "FREE");
        setCardPhrases(newPhrases);
        setPickedPhrases(["FREE"]);
        if (onWin) onWin(false); // Reset win state
    }, [phrases, onWin]);

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
            <VersionSelector onBrowseClick={() => setCurrentView('browse')} />
            <h1>{currentCardName}</h1>
            <div className="bingo-grid">
                {cardPhrases.map((phrase, index) => (
                    <BingoCell
                        key={index}
                        phrase={phrase}
                        pickedPhrases={pickedPhrases}
                        onPickPhrase={phrase !== "FREE" ? pickPhrase : null}
                    />
                ))}
            </div>
            {checkWin() && (
                <div className="win-message">
                    <h2>Congratulations! You won Business Lingo Bingo!</h2>
                    <button
                        onClick={playAgain}
                        className="play-again-button"
                    >
                        🎯 Play Again
                    </button>
                </div>
            )}
        </div>
    );
}

// Main App component
function App() {
    const [currentView, setCurrentView] = useState('play');
    const [customCards, setCustomCards] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState('default');
    const [currentPhrases, setCurrentPhrases] = useState(defaultPhrases);
    const [currentCardName, setCurrentCardName] = useState('Business Lingo Bingo');
    const [defaultCard, setDefaultCard] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);

    // Reset confetti when view changes
    useEffect(() => {
        setShowConfetti(false);
    }, [currentView]);

    // Handle URL routing for direct card links
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            const match = hash.match(/#\/play\/(.+)/);

            if (match) {
                const cardId = match[1];
                loadCardById(cardId);
                setCurrentView('play');
            } else if (hash === '#/browse') {
                setCurrentView('browse');
            } else if (hash === '#/create') {
                setCurrentView('create');
            } else if (hash === '#/' || hash === '') {
                setCurrentView('play');
            }
        };

        // Handle initial page load
        handleHashChange();

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    // Function to load a specific card by ID
    const loadCardById = async (cardId) => {
        try {
            setIsLoading(true);
            const card = await FirebaseService.getCardById(cardId);

            if (card) {
                // Add to custom cards if not already there
                setCustomCards(prev => {
                    const exists = prev.find(c => c.id === card.id);
                    if (!exists) {
                        return [card, ...prev];
                    }
                    return prev;
                });

                // Set as current card
                setSelectedVersion(card.id.toString());
                setCurrentPhrases(card.phrases);
                setCurrentCardName(card.name);
            } else {
                setError('Card not found. Loading default card instead.');
                // Fallback to default
                setSelectedVersion('default');
                setCurrentPhrases(defaultPhrases);
                setCurrentCardName('Business Lingo Bingo');
            }
        } catch (error) {
            console.error('Error loading card by ID:', error);
            setError('Failed to load card. Using default instead.');
            setSelectedVersion('default');
            setCurrentPhrases(defaultPhrases);
            setCurrentCardName('Business Lingo Bingo');
        } finally {
            setIsLoading(false);
        }
    };

    // Load custom cards from Firebase on component mount
    useEffect(() => {
        const loadCards = async () => {
            setIsLoading(true);
            setError('');

            try {
                // First, ensure the default Business Lingo Bingo card exists in Firebase
                const systemDefaultCard = await FirebaseService.ensureDefaultCard(defaultPhrases);
                setDefaultCard(systemDefaultCard);

                // Check if we need to migrate localStorage data
                if (!FirebaseService.isDataMigrated()) {
                    const hasLocalData = localStorage.getItem('customBingoCards');
                    if (hasLocalData) {
                        console.log('Migrating localStorage data to Firebase...');
                        const migratedCards = await FirebaseService.migrateLocalStorageData();
                        setCustomCards(migratedCards);

                        // Set most recent as default
                        if (migratedCards.length > 0) {
                            const defaultCard = migratedCards[0];
                            setSelectedVersion(defaultCard.id.toString());
                            setCurrentPhrases(defaultCard.phrases);
                            setCurrentCardName(defaultCard.name);
                        } else {
                            // Use system default card
                            setSelectedVersion(systemDefaultCard.id.toString());
                            setCurrentPhrases(systemDefaultCard.phrases);
                            setCurrentCardName(systemDefaultCard.name);
                        }
                        return;
                    }
                }

                // Load cards from Firebase
                const userCards = await FirebaseService.getUserCards();
                setCustomCards(userCards);

                // Set default version to the most recent custom card or system default
                const userDefaultCard = userCards.find(card => card.isDefault) || userCards[0];
                if (userDefaultCard) {
                    setSelectedVersion(userDefaultCard.id.toString());
                    setCurrentPhrases(userDefaultCard.phrases);
                    setCurrentCardName(userDefaultCard.name);
                } else {
                    // Use system default card
                    setSelectedVersion(systemDefaultCard.id.toString());
                    setCurrentPhrases(systemDefaultCard.phrases);
                    setCurrentCardName(systemDefaultCard.name);
                }
            } catch (error) {
                console.error('Error loading cards:', error);
                setError('Failed to load your cards. Using default phrases.');

                // Fallback to localStorage if Firebase fails
                const fallbackCards = JSON.parse(localStorage.getItem('customBingoCards') || '[]');
                setCustomCards(fallbackCards);
            } finally {
                setIsLoading(false);
            }
        };

        loadCards();
    }, []);

    // Handle version change
    const handleVersionChange = (versionId) => {
        setSelectedVersion(versionId);
        setShowConfetti(false); // Reset confetti when changing versions

        if (versionId === 'default') {
            setCurrentPhrases(defaultPhrases);
            setCurrentCardName('Business Lingo Bingo');
            window.location.hash = '#/';
        } else {
            const selectedCard = customCards.find(card => card.id.toString() === versionId);
            if (selectedCard) {
                setCurrentPhrases(selectedCard.phrases);
                setCurrentCardName(selectedCard.name);
                window.location.hash = `#/play/${selectedCard.id}`;
            }
        }
    };

    // Handle new card saved
    const handleCardSaved = async (newCard) => {
        try {
            // Refresh the cards list from Firebase
            const updatedCards = await FirebaseService.getUserCards();
            setCustomCards(updatedCards);
            setSelectedVersion(newCard.id.toString());
            setCurrentPhrases(newCard.phrases);
            setCurrentCardName(newCard.name);
            window.location.hash = `#/play/${newCard.id}`;
        } catch (error) {
            console.error('Error refreshing cards after save:', error);
            // Still update with the new card locally
            setCustomCards(prev => [newCard, ...prev]);
            setSelectedVersion(newCard.id.toString());
            setCurrentPhrases(newCard.phrases);
            setCurrentCardName(newCard.name);
            window.location.hash = `#/play/${newCard.id}`;
        }
    };

    // Handle public card selected
    const handleCardSelected = (card) => {
        // Add to custom cards temporarily for version selector
        setCustomCards(prev => {
            const exists = prev.find(c => c.id === card.id);
            if (!exists) {
                return [card, ...prev];
            }
            return prev;
        });
        setSelectedVersion(card.id.toString());
        setCurrentPhrases(card.phrases);
        setCurrentCardName(card.name);
        window.location.hash = `#/play/${card.id}`; // This will trigger the hashchange handler
    };

    return (
        <div className="app">
            <Navbar currentView={currentView} setCurrentView={setCurrentView} />

            {/* Confetti at top level */}
            {showConfetti && <Confetti />}

            {/* Loading overlay */}
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">
                        <div className="spinner-large"></div>
                        <p>Loading your bingo cards...</p>
                    </div>
                </div>
            )}

            {/* Global error message */}
            {error && (
                <div className="error-banner">
                    <span className="error-icon">⚠️</span>
                    {error}
                    <button
                        onClick={() => setError('')}
                        className="error-dismiss"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="app-content">
                {currentView === 'play' && (
                    <BingoCard
                        phrases={currentPhrases}
                        selectedVersion={selectedVersion}
                        onVersionChange={handleVersionChange}
                        customCards={customCards}
                        setCurrentView={setCurrentView}
                        currentCardName={currentCardName}
                        onWin={setShowConfetti}
                    />
                )}
                {currentView === 'browse' && (
                    <PublicCardBrowser
                        onCardSelected={handleCardSelected}
                        setCurrentView={setCurrentView}
                    />
                )}
                {currentView === 'create' && (
                    <CardCreator
                        setCurrentView={setCurrentView}
                        onCardSaved={handleCardSaved}
                    />
                )}
            </div>
        </div>
    );
}

export default App;
