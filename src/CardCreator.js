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
    const [duplicateIndices, setDuplicateIndices] = useState(new Set());
    const [shareUrl, setShareUrl] = useState("");

    // Function to find duplicate indices
    const findDuplicates = (phrasesArray) => {
        const trimmedPhrases = phrasesArray.map(phrase => phrase.trim().toLowerCase());
        const duplicateSet = new Set();

        for (let i = 0; i < trimmedPhrases.length; i++) {
            if (trimmedPhrases[i] && trimmedPhrases[i] !== '') {
                for (let j = i + 1; j < trimmedPhrases.length; j++) {
                    if (trimmedPhrases[i] === trimmedPhrases[j]) {
                        duplicateSet.add(i);
                        duplicateSet.add(j);
                    }
                }
            }
        }

        return duplicateSet;
    };

    const handlePhraseChange = (index, value) => {
        // Limit to 30 characters
        if (value.length > 30) {
            value = value.substring(0, 30);
        }

        const newPhrases = [...phrases];
        newPhrases[index] = value;
        setPhrases(newPhrases);

        // Update duplicate tracking
        const duplicates = findDuplicates(newPhrases);
        setDuplicateIndices(duplicates);
    };

    const handleSave = async () => {
        if (!cardName.trim()) {
            setError("Please enter a name for your bingo card!");
            return;
        }

        const trimmedPhrases = phrases.map((phrase) => phrase.trim());
        const emptyPhrases = trimmedPhrases.filter((phrase) => !phrase).length;
        if (emptyPhrases > 0) {
            setError(`Please fill in all 24 phrases! You have ${emptyPhrases} empty phrase${emptyPhrases > 1 ? "s" : ""} remaining.`);
            return;
        }

        // Check for duplicates
        const duplicates = trimmedPhrases.filter((phrase, index) => trimmedPhrases.indexOf(phrase) !== index);
        if (duplicates.length > 0) {
            setError(`Duplicate phrases found! Please make sure all phrases are unique.`);
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

            // Show share URL
            const newShareUrl = `${window.location.origin}${window.location.pathname}#/play/${savedCard.id}`;
            setShareUrl(newShareUrl);
            console.log('Share your bingo card:', newShareUrl);

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
            setDuplicateIndices(new Set());
            setShareUrl("");
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert("Share link copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy:", err);
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand("copy");
                alert("Share link copied to clipboard!");
            } catch (fallbackErr) {
                console.error("Fallback copy failed:", fallbackErr);
            }
            document.body.removeChild(textArea);
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
                            className={`phrase-input ${phrase.length === 30 ? 'at-limit' : ''} ${duplicateIndices.has(index) ? 'duplicate' : ''}`}
                            maxLength={30}
                            rows={3}
                        />
                        <div className="phrase-counter">
                            {phrase.length}/30
                            {phrase.length === 30 && <span className="limit-warning"> (max)</span>}
                            {duplicateIndices.has(index) && <span className="duplicate-warning"> (duplicate)</span>}
                        </div>
                    </div>
                ))}
            </div>

            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
            )}

            {shareUrl && (
                <div className="share-url-section">
                    <h3>🎉 Card Created Successfully!</h3>
                    <p>Share this link with others to let them play your bingo card:</p>
                    <div className="share-url-container">
                        <input
                            type="text"
                            value={shareUrl}
                            readOnly
                            className="share-url-input"
                        />
                        <button
                            onClick={copyToClipboard}
                            className="copy-button"
                            type="button"
                        >
                            📋 Copy Link
                        </button>
                    </div>
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
