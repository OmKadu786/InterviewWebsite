import React, { useState } from 'react';
import { Hero } from '../components/Home/Hero';
import { WelcomeModal } from '../components/WelcomeModal';
import { useNavigate } from 'react-router-dom';
import { LoginModal } from '../components/Auth/LoginModal';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
        return localStorage.getItem('welcomeConsent') !== 'true';
    });
    const [showLoginModal, setShowLoginModal] = useState(false);

    return (
        <>
            <Hero onStartConfirm={() => navigate('/setup')} />
            <WelcomeModal
                isOpen={showWelcomeModal}
                onAgree={() => setShowWelcomeModal(false)}
            />
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
            />
        </>
    );
};
