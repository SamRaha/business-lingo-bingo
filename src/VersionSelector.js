import React from 'react';
import './VersionSelector.css';

function VersionSelector({ onBrowseClick }) {
    return (
        <div className="version-selector">
            <button
                onClick={onBrowseClick}
                className="browse-versions-button"
            >
                🌍 Browse Other Versions
            </button>
        </div>
    );
}

export default VersionSelector;