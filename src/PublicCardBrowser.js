import React, { useState, useEffect } from 'react';
import './firebase-styles.css';
import './PublicCardBrowser.css';
import { FirebaseService } from './firebase/firebaseService';

function PublicCardBrowser({ onCardSelected, setCurrentView }) {
    const [publicCards, setPublicCards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        loadPublicCards();
    }, []);

    const loadPublicCards = async () => {
        setIsLoading(true);
        setError('');

        try {
            const cards = await FirebaseService.getPublicCards(50);
            setPublicCards(cards);
        } catch (error) {
            console.error('Error loading public cards:', error);
            setError('Failed to load public cards. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCardSelect = async (card) => {
        try {
            // Increment usage count when someone selects a public card
            await FirebaseService.incrementUsageCount(card.id);

            // Update local usage count for immediate UI feedback
            setPublicCards(prev =>
                prev.map(c =>
                    c.id === card.id
                        ? { ...c, usageCount: (c.usageCount || 0) + 1 }
                        : c
                )
            );

            onCardSelected(card);
            setCurrentView('play');
        } catch (error) {
            console.error('Error selecting card:', error);
            // Still allow selection even if analytics fail
            onCardSelected(card);
            setCurrentView('play');
        }
    };

    const filteredCards = selectedCategory === 'all'
        ? publicCards
        : publicCards.filter(card => card.category === selectedCategory);

    const categories = ['all', 'business', 'tech', 'education', 'healthcare', 'custom'];

    return (
        <div className="public-browser">
            <div className="browser-header">
                <h2>🌍 Discover Public Bingo Cards</h2>
                <p>Browse cards created by the community</p>
            </div>

            <div className="category-filter">
                <label>Filter by category:</label>
                <div className="category-buttons">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                    <button onClick={loadPublicCards} className="retry-button">
                        🔄 Retry
                    </button>
                </div>
            )}

            {isLoading ? (
                <div className="loading-container">
                    <div className="spinner-large"></div>
                    <p>Loading public cards...</p>
                </div>
            ) : (
                <div className="cards-grid">
                    {filteredCards.length === 0 ? (
                        <div className="empty-state">
                            <p>🎯 No public cards found for this category.</p>
                            <p>Be the first to share a card!</p>
                        </div>
                    ) : (
                        filteredCards.map(card => (
                            <div key={card.id} className="public-card">
                                <div className="card-header">
                                    <h3>{card.name}</h3>
                                    <div className="card-badges">
                                        <span className="category-badge">
                                            {card.category || 'custom'}
                                        </span>
                                        {card.usageCount > 0 && (
                                            <span className="usage-badge">
                                                🎮 {card.usageCount} plays
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="card-preview">
                                    <div className="phrases-preview">
                                        {card.phrases.slice(0, 6).map((phrase, index) => (
                                            <span key={index} className="phrase-chip">
                                                {phrase.length > 20 ? phrase.substring(0, 20) + '...' : phrase}
                                            </span>
                                        ))}
                                        {card.phrases.length > 6 && (
                                            <span className="phrase-chip more">
                                                +{card.phrases.length - 6} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <div className="card-meta">
                                        <small>
                                            Created {new Date(card.createdAt).toLocaleDateString()}
                                        </small>
                                    </div>
                                    <button
                                        className="select-card-btn"
                                        onClick={() => handleCardSelect(card)}
                                    >
                                        🎯 Play This Card
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <div className="browser-actions">
                <button
                    className="action-button secondary"
                    onClick={() => setCurrentView('play')}
                >
                    ← Back to Game
                </button>
                <button
                    className="action-button primary"
                    onClick={() => setCurrentView('create')}
                >
                    ✨ Create Your Own
                </button>
            </div>
        </div>
    );
}

export default PublicCardBrowser;