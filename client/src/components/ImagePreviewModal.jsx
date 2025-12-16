import React from 'react';
import { IoClose } from 'react-icons/io5';
import '../styles/chat.css'; // Assuming styles are here or I'll add them

export default function ImagePreviewModal({ isOpen, imageUrl, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="preview-overlay" onClick={onClose}>
            <div className="preview-content" onClick={e => e.stopPropagation()}>
                <button className="preview-close-btn" onClick={onClose}><IoClose /></button>
                <img src={imageUrl} alt="Full Preview" />
            </div>
        </div>
    );
}
