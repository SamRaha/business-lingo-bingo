import React from 'react';
import './Navbar.css';

function Navbar({ currentView, setCurrentView }) {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <h2>Business Lingo Bingo</h2>
            </div>
            <div className="navbar-menu">
                <button
                    className={`navbar-button ${currentView === 'play' ? 'active' : ''}`}
                    onClick={() => setCurrentView('play')}
                >
                    <span className="button-icon">🎮</span>
                    Play
                </button>
                <button
                    className={`navbar-button ${currentView === 'browse' ? 'active' : ''}`}
                    onClick={() => setCurrentView('browse')}
                >
                    <span className="button-icon">🌍</span>
                    Browse
                </button>
                <button
                    className={`navbar-button ${currentView === 'create' ? 'active' : ''}`}
                    onClick={() => setCurrentView('create')}
                >
                    <span className="button-icon">✨</span>
                    Create
                </button>
            </div>
        </nav>
    );
}

export default Navbar;