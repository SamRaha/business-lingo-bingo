import React, { useState, useEffect } from "react";
import "./CardCreator.css";
import "./firebase-styles.css";
import { FirebaseService } from "./firebase/firebaseService";

function CardCreator({ setCurrentView, onCardSaved }) {
    const [cardName, setCardName] = useState("");
    const [phrases, setPhrases] = useState(Array(24).fill(""));
    const [isSaving, setIsSaving] = useState(false);
    const [category, setCategory] = useState("custom");
    const [error, setError] = useState("");

    const handlePhraseChange = (index, value) => {
        const newPhrases = [...phrases];
        newPhrases[index] = value;
        setPhrases(newPhrases);
    };

    const handleSave = async () => {
        if (!cardName.trim()) {
            setError("Please enter a name for your bingo card!");
            return;
        }

        const emptyPhrases = phrases.filter((phrase) => !phrase.trim()).length;
        if (emptyPhrases > 0) {
            setError(`Please fill in all 24 phrases! You have ${emptyPhrases} empty phrase${emptyPhrases > 1 ? "s" : ""} remaining.`);
            return;
        }

        setIsSaving(true);
        setError("");

        try {
            // Create new card data
            const cardData = {
                name: cardName.trim(),
                phrases: phrases.map((phrase) => phrase.trim()),
                isDefault: true,
                isPublic: true, // All cards are public
                category: category,
            };

            // Save to Firebase
            const savedCard = await FirebaseService.saveCustomCard(cardData);

            // Notify parent component
            onCardSaved(savedCard);
            setCurrentView("play");
        } catch (error) {
            console.error("Error saving card:", error);
            setError(error.message || "Failed to save card. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleClear = () => {
        if (window.confirm("Are you sure you want to clear all fields?")) {
            setCardName("");
            setPhrases(Array(24).fill(""));
        }
    };

    return (
        <div className="card-creator">
            <div className="creator-header">
                <h2>Create Your Own Bingo Card</h2>
                <p>Enter 24 phrases for your custom Business Lingo Bingo card</p>
            </div>

            <div className="card-name-section">
                <label htmlFor="cardName">Card Name:</label>
                <input
                    id="cardName"
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Enter a name for your bingo card..."
                    className="card-name-input"
                    maxLength={50}
                />
            </div>

            <div className="card-options">
                <div className="option-group">
                    <label htmlFor="category">Category:</label>
                    <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="category-select">
                        <option value="business">Business</option>
                        <option value="tech">Technology</option>
                        <option value="education">Education</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>
            </div>

            <div className="phrases-grid">
                {phrases.map((phrase, index) => (
                    <div key={index} className="phrase-input-container">
                        <label className="phrase-label">#{index + 1}</label>
                        <textarea
                            value={phrase}
                            onChange={(e) => handlePhraseChange(index, e.target.value)}
                            placeholder={`Enter phrase ${index + 1}...`}
                            className="phrase-input"
                            maxLength={100}
                            rows={3}
                        />
                    </div>
                ))}
            </div>

            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
            )}

            <div className="creator-actions">
                <button onClick={handleClear} className="action-button clear-button" disabled={isSaving}>
                    🗑️ Clear All
                </button>
                <button onClick={handleSave} disabled={isSaving || !cardName.trim() || phrases.some((phrase) => !phrase.trim())} className="action-button save-button">
                    {isSaving ? (
                        <>
                            <span className="spinner"></span>
                            Saving to Cloud...
                        </>
                    ) : (
                        <>🌍 Save & Share</>
                    )}
                </button>
            </div>
        </div>
    );
}

export default CardCreator;
