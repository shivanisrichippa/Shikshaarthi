// src/components/Supercoin/Supercoin.js

import React, { useState, useEffect, Suspense, useMemo, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import './Supercoin.css';
import assets from '../assets/assets.js';
import tokenService from '../utils/tokenService';

// Lazy load the Lottie Player for better initial page load performance
const LottiePlayer = React.lazy(() =>
  import('@lottiefiles/react-lottie-player').then(module => ({ default: module.Player }))
);

// --- Top-Level Constants ---
const earningActivities = [ { id: 'login', title: "Login to Shikshaarthi (One-time)", points: 50, iconLottie: "/animations/login-bonus.json", description: "Kickstart your journey with a welcome bonus!" }, { id: 'rental', title: 'Share Rental Room Info', points: 20, iconLottie: "/animations/rental.json", description: "Help others find PGs, flats, or rooms." }, { id: 'mess', title: 'Post Mess Service Info', points: 15, iconLottie: "/animations/mess.json", description: "Review or list tiffin and mess services." }, { id: 'health', title: 'Add Healthcare Service Info', points: 10, iconLottie: "/animations/health.json", description: "Share details of local clinics, doctors, pharmacies." }, { id: 'household', title: 'List Household Services', points: 15, iconLottie: "/animations/household.json", description: "Plumbers, electricians, maids, laundry etc." }, ];
const levelsData = [ { id: 1, name: "Bronze Beginner", coinsRequired: 200, reward: "20% Discount [Shiksharth] Subscription", imageSrc: [assets.twenty, assets.defaultReward, assets.defaultReward2, assets.defaultReward3].filter(Boolean), color: "#CD7F32" }, { id: 2, name: "Silver Scout", coinsRequired: 300, reward: "30% Discount [Shiksharth] Subscription", imageSrc: [assets.thirty, assets.defaultReward, assets.defaultReward2, assets.defaultReward3].filter(Boolean), color: "#C0C0C0" }, { id: 3, name: "Gold Guardian", coinsRequired: 400, reward: "Shikshaarthi Cap & T-shirt", imageSrc: [ assets.white, assets.cap1, assets.black, assets.cap2 ].filter(Boolean), color: "#FFD700" }, { id: 4, name: "Platinum Pro", coinsRequired: 500, reward: "₹500 Phonepe Cash Card / Udemy Course (Rs.500)", imageSrc: [assets.cash, assets.udemyy, assets.defaultReward2, assets.defaultReward3].filter(Boolean), color: "#E5E4E2" }, { id: 5, name: "Diamond Dynamo", coinsRequired: 700, reward: "Boat Neckband / Udemy course (Rs.800) / ₹800 Phonepe Cash Card ", imageSrc: [assets.wiredBluetooth, assets.cash2, assets.udemyy, assets.defaultReward3].filter(Boolean), color: "#B9F2FF" }, { id: 6, name: "Master Explorer", coinsRequired: 1000, reward: "₹1000 Phonepe Cash Card  / Boat Earbuds /Udemy course (Rs.1000) ", imageSrc: [assets.earbuds, assets.cash3, assets.udemyy, assets.defaultReward3].filter(Boolean), color: "#9B59B6" }, { id: 7, name: "Legendary Shikshaarthi", coinsRequired: 1250, reward: "₹1500 Phonepe Cash Card  / Smartwatch / Udemy course (Rs.1500)", imageSrc: [assets.Airpods, assets.cash4, assets.udemyy, assets.defaultReward3].filter(Boolean), color: "#E67E22" }, ];
const spinWheelPrizesProbConfig = [ { text: "₹25 Cash", id: "cash25", color: "#AE0000", textColor: "#FFFFFF", icon: "💰", probabilityWeight: 1, prizeValue: "₹25 PhonePe Gift Card" }, { text: "15% Off Sub", id: "discount15", color: "#4A00E0", textColor: "#FFFFFF", icon: "🏷️", probabilityWeight: 2, prizeValue: "15% Off Shikshaarthi Subscription" }, { text: "10% Off Sub", id: "discount10", color: "#004E92", textColor: "#FFFFFF", icon: "🏷️", probabilityWeight: 3, prizeValue: "10% Off Shikshaarthi Subscription" }, { text: "₹15 Cash", id: "cash15", color: "#D4AF37", textColor: "#000000", icon: "💰", probabilityWeight: 2, prizeValue: "₹15 PhonePe Gift Card" }, { text: "₹10 Cash", id: "cash10", color: "#006400", textColor: "#FFFFFF", icon: "💰", probabilityWeight: 5, prizeValue: "₹10 PhonePe Gift Card" }, { text: "₹5 Cashback", id: "cash5", color: "#4B5320", textColor: "#FFFFFF", icon: "💸", probabilityWeight: 7, prizeValue: "₹5 PhonePe Gift Card" }, ];

// *** NEW: Data for the Terms and Conditions Section ***
const termsAndConditionsData = [
    {
        q: "Eligibility & User Verification",
        a: "To participate, you must be a verified college student with a valid Shikshaarthi account. We reserve the right to verify student status."
    },
    {
        q: "Information Authenticity & Originality",
        a: "All information you submit must be original, accurate, and truthful. Supercoins will only be credited after our admin team successfully verifies your submission."
    },
    {
        q: "Duplicate Submissions Policy",
        a: "If another user has already submitted the same information and it has been approved, new submissions of that same information will not be eligible for Supercoins. Be the first to share!"
    },
    {
        q: "Reward Redemption Process",
        a: "Redeemed rewards are subject to availability and may have specific terms from our partners. Processing may take up to 48 hours, and physical items will be shipped to your registered address."
    },
    {
        q: "Program Modifications & Rights",
        a: "Shikshaarthi reserves the right to modify, suspend, or terminate the Supercoin program, including point values and rewards, at any time. Any changes will be communicated on this page."
    }
];

// ===================================================================
// --- CHILD COMPONENTS AND UTILITIES (DEFINED OUTSIDE MAIN COMPONENT) ---
// ===================================================================
const LottieFallback = ({ text = "Loading..." }) => <div className="lottie-fallback">{text}</div>;
const Modal = ({ isOpen, onClose, title, children }) => { if (!isOpen) return null; return (<div className="sc-modal-overlay" onClick={onClose}><div className="sc-modal-content" onClick={(e) => e.stopPropagation()}><div className="sc-modal-header"><h3>{title}</h3><button onClick={onClose} className="sc-modal-close-btn">×</button></div><div className="sc-modal-body">{children}</div></div></div>); };
const ImageSlider = ({ images = [], altPrefix = "Reward", onImageClick }) => { const [currentIndex, setCurrentIndex] = useState(0); const goToNext = useCallback(() => { setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1)); }, [images.length]); useEffect(() => { if (images.length > 1) { const id = setInterval(goToNext, 2500); return () => clearInterval(id); } }, [images.length, goToNext]); const currentImageSrc = (images && images.length > 0) ? images[currentIndex] : assets.defaultReward; return (<div className="reward-image-slider" onClick={() => onImageClick(currentImageSrc, altPrefix)}><img src={currentImageSrc} alt={altPrefix} className="reward-image" /></div>); };
const shuffleArray = (array) => { let currentIndex = array.length, randomIndex; while (currentIndex !== 0) { randomIndex = Math.floor(Math.random() * currentIndex); currentIndex--; [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]; } return array; };
const createVisualWheelSegments = () => { const prizeCounts = [ { config: spinWheelPrizesProbConfig.find(p => p.id === 'discount15'), count: 1 }, { config: spinWheelPrizesProbConfig.find(p => p.id === 'discount10'), count: 1 }, { config: spinWheelPrizesProbConfig.find(p => p.id === 'cash25'), count: 1 }, { config: spinWheelPrizesProbConfig.find(p => p.id === 'cash15'), count: 2 }, { config: spinWheelPrizesProbConfig.find(p => p.id === 'cash10'), count: 2 }, { config: spinWheelPrizesProbConfig.find(p => p.id === 'cash5'), count: 4 }, ]; let segments = []; prizeCounts.forEach(item => { if (item.config) for (let i = 0; i < item.count; i++) segments.push({...item.config}); }); return shuffleArray(segments); };
const drawWheel = (canvas, rewards, rotation) => { if (!canvas || !rewards || rewards.length === 0) return; const ctx = canvas.getContext('2d'); const numSegments = rewards.length; const anglePerSegment = (2 * Math.PI) / numSegments; const centerX = canvas.width / 2; const centerY = canvas.height / 2; const outerRadius = Math.min(centerX, centerY) - 8; const textRadius = outerRadius * 0.60; const iconRadius = outerRadius * 0.80; ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.save(); ctx.shadowColor = 'rgba(212, 167, 98, 0.5)'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(centerX, centerY, outerRadius + 4, 0, 2 * Math.PI); ctx.fillStyle = '#101010'; ctx.fill(); ctx.restore(); rewards.forEach((reward, i) => { ctx.beginPath(); ctx.moveTo(centerX, centerY); const startAngle = i * anglePerSegment + rotation; const endAngle = (i + 1) * anglePerSegment + rotation; ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle); ctx.closePath(); ctx.fillStyle = reward.color || '#2C2C2C'; ctx.fill(); }); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; rewards.forEach((reward, i) => { ctx.save(); ctx.fillStyle = reward.textColor || '#FFFFFF'; const currentAngle = (i * anglePerSegment + (i + 1) * anglePerSegment) / 2 + rotation; ctx.font = `bold ${outerRadius * 0.10}px Inter, Arial, sans-serif`; const iconX = centerX + Math.cos(currentAngle) * iconRadius; const iconY = centerY + Math.sin(currentAngle) * iconRadius; ctx.translate(iconX, iconY); ctx.rotate(currentAngle + Math.PI / 2); ctx.fillText(reward.icon || '🎁', 0, 0); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.font = `600 ${outerRadius * 0.06}px Inter, Arial, sans-serif`; const textX = centerX + Math.cos(currentAngle) * textRadius; const textY = centerY + Math.sin(currentAngle) * textRadius; ctx.translate(textX, textY); ctx.rotate(currentAngle + Math.PI / 2); const lines = reward.text.split(' '); if (lines.length > 1 && reward.text.length > 6) { ctx.fillText(lines[0], 0, -outerRadius * 0.03); ctx.fillText(lines.slice(1).join(' '), 0, outerRadius * 0.035); } else { ctx.fillText(reward.text, 0, 0); } ctx.restore(); }); ctx.beginPath(); ctx.arc(centerX, centerY, outerRadius * 0.25, 0, 2 * Math.PI); ctx.fillStyle = '#0A0A0A'; ctx.fill(); ctx.strokeStyle = 'rgba(212, 167, 98, 0.9)'; ctx.lineWidth = 3.5; ctx.stroke(); ctx.beginPath(); ctx.arc(centerX, centerY, outerRadius * 0.1, 0, 2 * Math.PI); ctx.fillStyle = 'rgba(212, 167, 98, 1)'; ctx.fill(); };
const IntegratedSpinWheel = React.forwardRef(({ visualSegmentsConfig }, ref) => { const canvasRef = useRef(null); const currentRotationRef = useRef(0); const animationFrameIdRef = useRef(null); useEffect(() => { if (visualSegmentsConfig?.length > 0) drawWheel(canvasRef.current, visualSegmentsConfig, currentRotationRef.current); }, [visualSegmentsConfig]); useEffect(() => () => { if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current); }, []); const startSpinAnimation = (targetVisualIndex, onAnimationComplete) => { if (!visualSegmentsConfig?.length) { if (onAnimationComplete) onAnimationComplete(); return; } const startTime = performance.now(); const totalFullSpins = 8; const initialRotation = currentRotationRef.current; const anglePerSegment = (2 * Math.PI) / visualSegmentsConfig.length; const prizeLandingAngle = - (targetVisualIndex * anglePerSegment) - (anglePerSegment / 2) + (Math.random() * anglePerSegment * 0.4 - anglePerSegment * 0.2); const finalTargetRotation = (2 * Math.PI * totalFullSpins) + prizeLandingAngle; function spinStep(currentTime) { const elapsedTime = currentTime - startTime; let progress = Math.min(elapsedTime / 6000, 1); const easedProgress = 1 - Math.pow(1 - progress, 5); currentRotationRef.current = initialRotation + (finalTargetRotation - initialRotation) * easedProgress; drawWheel(canvasRef.current, visualSegmentsConfig, currentRotationRef.current); if (progress < 1) { animationFrameIdRef.current = requestAnimationFrame(spinStep); } else { if (onAnimationComplete) onAnimationComplete(); } } animationFrameIdRef.current = requestAnimationFrame(spinStep); }; React.useImperativeHandle(ref, () => ({ startSpinAnimation })); return (<div className="sc-wheel-assembly"><div className="sc-wheel-pointer-indicator"></div><canvas ref={canvasRef} width="300" height="300" className="sc-spin-wheel-canvas"></canvas></div>); });

// --- Supercoin Main Component ---
const Supercoin = () => {
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_BACKEND_AUTH_URL || "http://localhost:3001";

    const [user, setUser] = useState(null);
    const [availableSpins, setAvailableSpins] = useState(0);
    const [initialLoading, setInitialLoading] = useState(true);
    const [pageError, setPageError] = useState(null);
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [selectedLevelForPopup, setSelectedLevelForPopup] = useState(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showImagePopup, setShowImagePopup] = useState(false);
    const [imagePopupSrc, setImagePopupSrc] = useState('');
    const [imagePopupAlt, setImagePopupAlt] = useState('');
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinResult, setSpinResult] = useState(null);
    const integratedSpinWheelRef = useRef();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRewardModal, setShowRewardModal] = useState(false);
    const [showNoSpinsModal, setShowNoSpinsModal] = useState(false);

    const visualWheelLayout = useMemo(() => createVisualWheelSegments(), []);
  
    const fetchPageData = useCallback(async () => {
        const token = tokenService.getToken();
        if (!token) { 
            setInitialLoading(false); 
            return; 
        }
        
        try {
            const [profileRes, spinsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/auth/profile`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/api/spin/status`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (profileRes.status === 401 || spinsRes.status === 401) {
                tokenService.removeToken(); 
                setUser(null);
                setAvailableSpins(0);
                toast.error('Session expired. Please log in again.');
                navigate('/login');
                throw new Error('Session expired.');
            }

            const profileData = await profileRes.json();
            const spinsData = await spinsRes.json();

            if (profileData.success) {
                 // Ensure redeemedRewards is an array for consistent logic
                if (profileData.transactionHistory && Array.isArray(profileData.transactionHistory.redeemedRewards)) {
                    setUser({
                        ...profileData.user,
                        redeemedRewards: profileData.transactionHistory.redeemedRewards
                    });
                } else {
                    setUser(profileData.user);
                }
            }
            if (spinsData.success) setAvailableSpins(spinsData.availableSpins);

        } catch (error) {
            if (error.message !== 'Session expired.') {
                setPageError(error.message);
                toast.error("Failed to load your data.");
            }
        } finally {
            setInitialLoading(false);
        }
    }, [navigate, API_BASE_URL]);

    useEffect(() => { fetchPageData(); }, [fetchPageData]);
    
    const handleSpinAttempt = async () => {
        if (!user) { setShowLoginModal(true); return; }
        if (isSpinning) return;
        if (availableSpins <= 0) { setShowNoSpinsModal(true); return; }

        setIsSpinning(true);
        setSpinResult(null);
        const toastId = toast.loading("Spinning the wheel...");

        try {
            const token = tokenService.getToken();
            const response = await fetch(`${API_BASE_URL}/api/spin/consume`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            
            const wonPrize = data.wonPrize;
            setAvailableSpins(data.availableSpins);
            if (data.newCoinBalance !== undefined) {
                setUser(prev => ({...prev, coins: data.newCoinBalance}));
            }
            
            const targetVisualIndex = visualWheelLayout.findIndex(segment => segment.id === wonPrize.id);
            
            integratedSpinWheelRef.current.startSpinAnimation(targetVisualIndex > -1 ? targetVisualIndex : 0, () => {
                setSpinResult(wonPrize);
                toast.dismiss(toastId);
                setShowRewardModal(true);
            });
        } catch (error) {
            toast.error(error.message, { id: toastId });
            setIsSpinning(false);
        }
    };

    const redeemRewardAPI = async (level) => {
        setIsRedeeming(true);
        const toastId = toast.loading('Processing your redemption...');
        try {
            const token = tokenService.getToken();
            if (!token) throw new Error('Authentication required.');

            const response = await fetch(`${API_BASE_URL}/api/auth/redeem-reward`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                // FIX: Send the correct payload with levelId, coinsToDeduct, and rewardName
                body: JSON.stringify({
                    levelId: level.id,
                    coinsToDeduct: level.coinsRequired,
                    rewardName: level.reward
                })
            });

            const responseData = await response.json();
            if (!response.ok) throw new Error(responseData.message || 'Redemption failed.');
            
            toast.dismiss(toastId);
            setShowSuccessPopup(true);
            
            // FIX: Correctly update the user state from the response for immediate UI feedback
            setUser(prevUser => ({
                ...prevUser,
                coins: responseData.remainingCoins,
                redeemedRewards: [...(prevUser.redeemedRewards || []), { levelId: level.id }]
            }));

        } catch (err) {
            toast.error(err.message, { id: toastId });
            if (err.message === 'Authentication required.') navigate('/login');
        } finally {
            setIsRedeeming(false);
        }
    };

    const isRewardRedeemed = (levelId) => user?.redeemedRewards?.some(r => r.levelId === levelId);
    const handleRedeemClick = (level) => { setSelectedLevelForPopup(level); setShowConfirmPopup(true); };
    const confirmRedeem = async () => { if (!selectedLevelForPopup || isRedeeming) return; setShowConfirmPopup(false); await redeemRewardAPI(selectedLevelForPopup); };
    const cancelRedeem = () => { if (!isRedeeming) { setShowConfirmPopup(false); setSelectedLevelForPopup(null); } };
    const handleImageClick = (src, alt) => { if (src) { setImagePopupSrc(src); setImagePopupAlt(alt); setShowImagePopup(true); } };
    const closeImagePopup = () => setShowImagePopup(false);
    const closeSuccessPopup = () => { setShowSuccessPopup(false); setSelectedLevelForPopup(null); };
    
    const userCoins = useMemo(() => user?.coins || 0, [user]);
    const currentActiveLevel = useMemo(() => { if (!user) return null; return [...levelsData].sort((a, b) => b.coinsRequired - a.coinsRequired).find(level => userCoins >= level.coinsRequired) || null; }, [userCoins, user]);
    const nextLevelProgress = useMemo(() => { if (!user) return { isMaxLevel: true, progress: 0 }; const sortedLevelsAsc = [...levelsData].sort((a, b) => a.coinsRequired - b.coinsRequired); if (!currentActiveLevel) { const firstLevel = sortedLevelsAsc[0]; if (!firstLevel) return { isMaxLevel: true, progress: 0 }; const progress = (userCoins / firstLevel.coinsRequired) * 100; return { isMaxLevel: false, progress: Math.min(100, progress), nextLevel: firstLevel, coinsNeeded: Math.max(0, firstLevel.coinsRequired - userCoins) }; } const currentLevelIndex = sortedLevelsAsc.findIndex(level => level.id === currentActiveLevel.id); const nextLevelData = sortedLevelsAsc[currentLevelIndex + 1]; if (!nextLevelData) return { isMaxLevel: true, progress: 100 }; const coinsForCurrent = currentActiveLevel.coinsRequired; const coinsForNext = nextLevelData.coinsRequired; const range = coinsForNext - coinsForCurrent; const progress = range > 0 ? ((userCoins - coinsForCurrent) / range) * 100 : 100; return { isMaxLevel: false, progress: Math.min(100, progress), nextLevel: nextLevelData, coinsNeeded: Math.max(0, nextLevelData.coinsRequired - userCoins) }; }, [userCoins, currentActiveLevel, user]);

    if (initialLoading) return (<div className="supercoin-page-loading-fullscreen"><Suspense fallback={<div></div>}><LottiePlayer autoplay loop src="/animations/loading-spinner.json" style={{ height: '250px', width: '250px' }} /></Suspense><p>Brewing Your Supercoin Experience... ✨</p></div>);
    if (pageError) return (<div className="supercoin-page-container error-container" style={{color: 'white', textAlign: 'center', paddingTop: '50px'}}><h2>⚠️ Oops! Something Went Wrong</h2><p>{pageError}</p><button onClick={fetchPageData} className="sc-cta-button primary retry-btn">Try Again</button><Link to="/" className="sc-cta-button secondary back-btn">Go Home</Link></div>);
  
    return (
        <div className="supercoin-page-container">
            <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} title="Login Required"><p>Please log in to use the Spin Wheel.</p><div style={{textAlign: 'center'}}><button onClick={() => navigate('/login')} className='sc-cta-button primary'>Login</button></div></Modal>
            <Modal isOpen={showNoSpinsModal} onClose={() => setShowNoSpinsModal(false)} title="💡 How to Earn a Spin"><div style={{textAlign: 'center'}}><p>You get one free spin for every data submission that gets approved by our admin team!</p><p className='text-muted' style={{fontSize: '0.9rem'}}>Contribute valuable information to help the community and get rewarded.</p><button onClick={() => { setShowNoSpinsModal(false); navigate('/add-data'); }} className="sc-cta-button primary" style={{marginTop: '20px'}}>Add Information Now</button></div></Modal>
            <Modal isOpen={showRewardModal} onClose={() => { setShowRewardModal(false); setIsSpinning(false); }} title="🎉 You Won! 🎉">{spinResult && (<div style={{textAlign: 'center'}}><p style={{fontSize: '1.2rem'}}>Congratulations! You've won:</p><h4 className="highlight-gold" style={{fontSize: '1.5rem', margin: '15px 0'}}>{spinResult.prizeValue}</h4><p className="text-muted">Our team will contact you shortly via email to deliver your prize.</p><button onClick={() => { setShowRewardModal(false); setIsSpinning(false); }} className="sc-cta-button primary" style={{marginTop: '20px'}}>Awesome!</button></div>)}</Modal>
            {showConfirmPopup && selectedLevelForPopup && ( <div className="popup-overlay" role="dialog"><div className="popup-content"><button className="popup-close-button" onClick={cancelRedeem} disabled={isRedeeming}>×</button><h3 className="popup-title">🎁 Confirm Your Redemption</h3><div className="popup-details"><p><strong>Level {selectedLevelForPopup.id}:</strong> {selectedLevelForPopup.name}</p><p><strong>Reward:</strong> {selectedLevelForPopup.reward}</p><p><strong>Coins to be Deducted:</strong> <span className="coins-icon">🪙</span> {selectedLevelForPopup.coinsRequired.toLocaleString()}</p></div><div className="popup-warning"><strong>Important:</strong><ul><li>Coins will be deducted immediately.</li><li>This action cannot be undone.</li><li>Reward processing may take 24-48 hours.</li><li>You'll receive confirmation via email.</li></ul></div><div className="popup-actions"><button onClick={cancelRedeem} className="levels-cta-button cancel-button" disabled={isRedeeming}>No, Cancel</button><button onClick={confirmRedeem} className="levels-cta-button confirm-button" disabled={isRedeeming}>{isRedeeming ? 'Processing...' : 'Yes, Redeem!'}</button></div></div></div> )}
            {showSuccessPopup && (<div className="popup-overlay" role="dialog"><div className="popup-content"><button className="popup-close-button" onClick={closeSuccessPopup}>×</button><h3 className="popup-title">✅ Redemption Successful!</h3><div style={{ textAlign: 'center', padding: '10px 0' }}><p style={{fontSize: '1.1rem', color: '#eee', lineHeight: '1.6'}}>Our team will send you an email regarding your reward within two business days.</p><p style={{fontSize: '1rem', color: '#bbb', marginTop: '10px'}}>Please keep an eye on your inbox!</p></div><div className="popup-actions" style={{justifyContent: 'center', marginTop: '25px'}}><button onClick={closeSuccessPopup} className="levels-cta-button confirm-button">Okay, Got It!</button></div></div></div> )}
            {showImagePopup && (<div className="popup-overlay image-viewer-overlay" onClick={closeImagePopup}><div className="popup-content image-viewer-content" onClick={(e) => e.stopPropagation()}><button className="popup-close-button image-viewer-close-button" onClick={closeImagePopup}>×</button><img src={imagePopupSrc} alt={imagePopupAlt} className="enlarged-reward-image"/></div></div>)}

            <section className="sc-hero-section-main"><div className="sc-hero-content-area"><h1 className="sc-hero-title">Turn <span className="highlight-gold">Campus Intel</span> Into <span className="highlight-gold">Epic Rewards!</span></h1><p className="sc-hero-subtitle">Your everyday info transforms into real prizes.</p>{user ? (<button onClick={() => document.getElementById('how-to-earn')?.scrollIntoView({ behavior: 'smooth' })} className="sc-cta-button primary hero-cta">Discover Earning 👇</button>) : (<button onClick={() => navigate('/sign-up')} className="sc-cta-button primary hero-cta">Join Now & Earn! 🚀</button>)}</div><div className="sc-hero-visual-area"><img src={assets.circle} alt="Supercoin Wheel" className="sc-hero-rotating-image" /></div></section>
            <section className="sc-content-section" id="what-is-supercoin"><h2 className="sc-section-title">What is <span className="highlight-gold">Shikshaarthi Supercoin?</span></h2><div className="sc-intro-box"><div className="sc-intro-icon"><Suspense fallback={<LottieFallback />}><LottiePlayer autoplay loop src="/animations/coin-intro.json" style={{ height: '120px', width: '120px' }} /></Suspense></div><p className="sc-section-description">Supercoin Feature is one of the innovative and interesting innovation of Shiksharthi startup which gives opportunity to students to earn exciting prizes , cash and discount coupons for free just for sharing the information about nearby rental rooms , mess services, healthcare service , plumbers , electrician ,laundry services..</p></div></section>
            <section className="sc-content-section alternate-bg" id="how-to-earn"><h2 className="sc-section-title">Your Path to <span className="highlight-gold">Supercoins</span></h2><p className="sc-section-description">The more quality info you share, the more coins you collect!</p><div className="sc-earning-activities-grid">{earningActivities.map(action => (<div className="sc-earning-activity-card" key={action.id}><div className="sc-activity-card-icon"><Suspense fallback={<LottieFallback />}><LottiePlayer autoplay loop src={action.iconLottie} style={{ height: '70px', width: '70px' }} /></Suspense></div><div className="sc-activity-card-content"><h4>{action.title}</h4><p>{action.description}</p></div><div className="sc-activity-card-points">+{action.points} <span className="coin-icon">🪙</span></div></div>))}</div></section>
            
            <section className="sc-content-section sc-rewards-showcase-levels" id="reward-levels">
                <header className="levels-page-header"><h2 className="sc-section-title">Your <span className="highlight-gold">Reward Levels</span></h2><p className="sc-section-description">Unlock prizes as you collect Supercoins!</p></header>
                {!user ? (<div style={{textAlign: 'center', padding: '30px 0'}}><p>Please <Link to="/login" className="sc-inline-link">login</Link> to view your reward levels!</p></div>) : (
                <>
                    <div className="user-info-panel"><div className="user-greeting"><h3>Hi, {user.fullName?.split(' ')[0]}!</h3><p className="college-name">🎓 {user.collegeName}</p></div><div className="user-coins-summary"><div className="coins-balance"><span className="coins-icon">🪙</span><span className="coins-amount">{userCoins.toLocaleString()}</span><span className="coins-label">Supercoins</span></div>{!nextLevelProgress.isMaxLevel && nextLevelProgress.nextLevel ? (<div className="progress-to-next"><div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${nextLevelProgress.progress}%` }}><span>{Math.round(nextLevelProgress.progress)}%</span></div></div><p>{nextLevelProgress.coinsNeeded.toLocaleString()} coins to <span className="next-level-name">{nextLevelProgress.nextLevel.name}</span></p></div>) : (<p className="max-level-reached">🎉 All levels unlocked! Amazing! 🎉</p>)}</div></div>
                    <div className="levels-grid-path">{levelsData.map((level, index) => {
                        const isUnlocked = userCoins >= level.coinsRequired;
                        const isRedeemed = isRewardRedeemed(level.id);
                        const cardClasses = `level-card ${isRedeemed ? 'redeemed' : isUnlocked ? 'unlocked' : 'locked'} ${isUnlocked && !isRedeemed ? 'is-clickable' : ''}`;
                        const canRedeemThisLevel = isUnlocked && !isRedeemed;
                        
                        return (<React.Fragment key={level.id}>
                            <div className={cardClasses} style={{ '--level-color': level.color }} onClick={canRedeemThisLevel ? () => handleRedeemClick(level) : undefined} role={canRedeemThisLevel ? 'button' : 'group'} tabIndex={canRedeemThisLevel ? 0 : -1}>
                                <div className="level-card-shine"></div><div className="level-banner"><h3>{level.name}</h3>{isRedeemed ? <span className="status-badge redeemed-badge">✓ Claimed</span> : (isUnlocked ? <span className="status-badge unlocked-badge">Unlocked</span> : <span className="status-badge locked-badge">Locked</span>)}</div>
                                <div className="reward-image-wrapper"><ImageSlider images={level.imageSrc} altPrefix={level.reward} onImageClick={handleImageClick} /></div>
                                <div className="level-card-content"><p className="reward-name">{level.reward}</p><p className="coins-to-unlock"><span className="coins-icon">🪙</span> {level.coinsRequired.toLocaleString()}</p>
                                    <div className="action-area">
                                        {canRedeemThisLevel ? (<button className="levels-cta-button redeem-button">Redeem Reward</button>) : isRedeemed ? <p className="status-text redeemed-text">Reward Claimed!</p> : <p className="status-text locked-text">Need {(level.coinsRequired - userCoins).toLocaleString()} more</p>}
                                    </div>
                                </div>
                            </div>
                            {index < levelsData.length - 1 && (<div className={`path-connector ${isUnlocked ? 'unlocked' : ''} ${currentActiveLevel && level.coinsRequired <= currentActiveLevel.coinsRequired ? 'active-path' : ''}`}></div>)}
                        </React.Fragment>);
                    })}</div>
                </>
                )}
            </section>

            <section className="sc-content-section alternate-bg sc-spin-offer-section" id="special-offer">
                <div className="sc-spin-heading-area"><Suspense fallback={<LottieFallback />}><LottiePlayer autoplay loop src="/animations/spin-win.json" style={{ height: '150px', width: '150px' }} /></Suspense><h2 className="sc-section-title">Your Turn to <span className="highlight-gold">Spin & Win!</span></h2></div>
                <p className="sc-section-description">You get a spin for every approved submission. You have <strong className="highlight-gold">{availableSpins}</strong> spin(s) ready!</p>
                <div className="sc-spin-wheel-interactive-area-wrapper">
                    <IntegratedSpinWheel ref={integratedSpinWheelRef} visualSegmentsConfig={visualWheelLayout}/>
                    <button onClick={handleSpinAttempt} disabled={isSpinning || (user && availableSpins <= 0)} className={`sc-spin-action-button ${isSpinning || (user && availableSpins <= 0) ? 'disabled' : ''}`}>
                        {isSpinning ? "SPINNING..." : `SPIN THE WHEEL (${availableSpins})`}
                    </button>
                </div>
            </section>
            
            {/* *** NEW AND UPDATED SECTION *** */}
            <section className="sc-content-section" id="terms-conditions">
                <h2 className="sc-section-title">The <span className="highlight-gold">Ground Rules</span></h2>
                
                {/* Special Offer Box */}
                <div className="special-offer-box">
                    <h4>🚀 Spin & Win: Special Launch Offer!</h4>
                    <p>For every approved submission, you get a chance to spin the wheel for guaranteed prizes like cash up to ₹25, course discounts, and more!</p>
                    <ul>
                        <li><i className="fas fa-users"></i> Offer is valid for the first  All the users who is part of Shiksharthi .</li>
                        <li><i className="fas fa-upload"></i> You must share at least   one approved submission to be eligible.</li>
                        <li><i className="fas fa-redo-alt"></i> Each user can spin the wheel  once per approved submission .</li>
                    </ul>
                </div>

                {/* Main Terms Accordion */}
                <div className="sc-accordion-container">
                    {termsAndConditionsData.map((item, index) => (
                        <details className="sc-accordion-item" key={index} open={index === 0}>
                            <summary>{item.q}</summary>
                            <p>{item.a}</p>
                        </details>
                    ))}
                </div>
            </section>
            
            <section className="sc-final-cta-section-main"><h2 className="sc-final-cta-title">Convert <span className="highlight-gold">Knowledge into Rewards?</span></h2><p className="sc-final-cta-subtitle">Join Shikshaarthi Supercoins today!</p>{user ? (<Link to="/add-data" className="sc-cta-button primary large-cta">Start Sharing & Earning! 🤩</Link>) : (<button onClick={() => navigate('/sign-up')} className="sc-cta-button primary large-cta">Join & Win! 🎉</button>)}</section>
        </div>
    );
}

export default Supercoin;