// SpinWheelComponent.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
// import { Link } from 'react-router-dom'; // No longer needed for auth prompts
import './SpinWheel.css'; 

// drawWheel function - Let's enhance its appearance slightly
const drawWheel = (canvas, rewards, rotation) => {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const numSegments = rewards.length;
  const anglePerSegment = (2 * Math.PI) / numSegments;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const outerRadius = Math.min(centerX, centerY) - 10; // Main radius for segments
  const innerRadius = outerRadius * 0.85; // For a "donut" effect if desired for text
  const textRadius = (outerRadius + innerRadius) / 2 * 0.85; // Radius for text placement

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Enhanced Wheel Border/Shadow
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius + 5, 0, 2 * Math.PI);
  ctx.fillStyle = '#e0e0e0'; // Outer border color (light gray)
  // ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  // ctx.shadowBlur = 10;
  // ctx.shadowOffsetX = 3;
  // ctx.shadowOffsetY = 3;
  ctx.fill();
  // ctx.shadowColor = 'transparent';


  // Draw segments
  rewards.forEach((reward, i) => {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    const startAngle = i * anglePerSegment + rotation;
    const endAngle = (i + 1) * anglePerSegment + rotation;
    ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = reward.color || '#CCCCCC';
    ctx.fill();
    
    // Segment divider lines
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; // Darker, slightly transparent dividers
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + outerRadius * Math.cos(endAngle), centerY + outerRadius * Math.sin(endAngle));
    ctx.stroke();
    ctx.restore();
  });

  // Text on segments
  ctx.font = 'bold 10px Poppins, Arial, sans-serif'; // Adjusted for potentially smaller segments
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  rewards.forEach((reward, i) => {
    ctx.save();
    ctx.fillStyle = reward.textColor || '#222222'; // Default to dark text
    const currentAngle = (i * anglePerSegment + (i + 1) * anglePerSegment) / 2 + rotation;
    
    ctx.translate(
      centerX + Math.cos(currentAngle) * textRadius,
      centerY + Math.sin(currentAngle) * textRadius
    );
    ctx.rotate(currentAngle + Math.PI / 2); 

    const lines = reward.text.split(' ');
    if (reward.text.length > 10 && lines.length > 1 && reward.text.length < 18) { 
        ctx.fillText(lines[0], 0, -6);
        ctx.fillText(lines.slice(1).join(' '), 0, 6);
    } else if (reward.text.length >= 18 && lines.length > 2) {
        ctx.fillText(lines.slice(0,2).join(' '), 0, -8);
        ctx.fillText(lines.slice(2).join(' '), 0, 5);
    }
     else {
        ctx.fillText(reward.text, 0, 0);
    }
    ctx.restore();
  });

  // Center Decor Circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius * 0.2, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffffff'; // White center
  ctx.fill();
  ctx.strokeStyle = '#d4a762'; // Gold border for center
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius * 0.1, 0, 2 * Math.PI);
  ctx.fillStyle = '#d4a762'; // Gold inner dot
  ctx.fill();
};


const SpinWheelComponent = ({ onSpinComplete, eligibility /* apiBaseUrl might not be needed */ }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  // const [internalError, setInternalError] = useState(null); // Less likely to have errors now
  const canvasRef = useRef(null);
  const currentRotationRef = useRef(0);
  const animationFrameIdRef = useRef(null);

  const rewards = useMemo(() => [
    { text: "₹25 Cash", id: "cash25", color: "#FFD700", textColor: "#333" }, // Gold
    { text: "Try Again!", id: "tryAgain", color: "#f0f0f0", textColor: "#555" }, // Light Gray
    { text: "Mini Course", id: "miniCourse", color: "#fff8e1", textColor: "#b8860b" }, // Creamy yellow
    { text: "10% Off", id: "coupon10", color: "#d4a762", textColor: "#FFFFFF" }, // Shikshaarthi Gold with white text
    { text: "50 Coins", id: "coins50", color: "#FFF", textColor: "#d4a762" }, // White with gold text
    { text: "Mystery Gift", id: "goodie", color: "#4A4A4A", textColor: "#FFF" } // Dark Gray
  ], []);
  
  useEffect(() => {
    drawWheel(canvasRef.current, rewards, currentRotationRef.current);
  }, [rewards]);

  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  const animateSpin = (targetRotation, duration, finalPrizeIndex) => {
    const startTime = performance.now();
    const totalFullSpins = 6; // More spins for visual appeal
    const initialRotation = currentRotationRef.current;
    const anglePerSegment = (2 * Math.PI) / rewards.length;
    const prizeLandingAngle = - (finalPrizeIndex * anglePerSegment) - (anglePerSegment / 2);
    const finalTargetRotation = (2 * Math.PI * totalFullSpins) + prizeLandingAngle;

    function spinStep(currentTime) {
      const elapsedTime = currentTime - startTime;
      let progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 4); // Ease-out Quart

      currentRotationRef.current = initialRotation + (finalTargetRotation - initialRotation) * easedProgress;
      drawWheel(canvasRef.current, rewards, currentRotationRef.current);

      if (progress < 1) {
        animationFrameIdRef.current = requestAnimationFrame(spinStep);
      } else {
        currentRotationRef.current %= (2 * Math.PI); 
        drawWheel(canvasRef.current, rewards, currentRotationRef.current);
        setIsSpinning(false);
        const wonPrize = rewards[finalPrizeIndex];
        setSpinResult(wonPrize);
        onSpinComplete(wonPrize); 
      }
    }
    animationFrameIdRef.current = requestAnimationFrame(spinStep);
  };

  const handleSpin = async () => {
    if (isSpinning) return; // Only prevent spin if already spinning
    
    setIsSpinning(true);
    // setInternalError(null);
    setSpinResult(null);

    // Mocking prize determination - no backend call
    console.log("DEMO SPIN: Determining prize locally...");
    await new Promise(resolve => setTimeout(resolve, 300)); // Short delay to simulate
    
    const randomIndex = Math.floor(Math.random() * rewards.length);
    const mockPrize = rewards[randomIndex];
    
    console.log("DEMO SPIN: Prize selected:", mockPrize);
    animateSpin(0, 4500, randomIndex); // Duration of spin animation
  };

  // Simplified button and notice logic for "everyone can spin"
  const buttonText = isSpinning ? "SPINNING..." : "SPIN THE WHEEL!";
  const buttonDisabled = isSpinning;
  let noticeMessage = null;
  if (!isSpinning && !spinResult) {
    noticeMessage = <p className="spin-notice demo-mode">This is a demo! Everyone gets to spin.</p>;
  }

  return (
    <div className="spin-wheel-component-wrapper improved-ui">
      <div className="wheel-assembly">
        <div className="wheel-pointer-indicator"></div>
        <canvas ref={canvasRef} width="300" height="300" className="spin-wheel-canvas"></canvas> {/* Canvas size */}
      </div>
      
      <button 
        onClick={handleSpin} 
        disabled={buttonDisabled}
        className={`spin-action-button ${buttonDisabled ? 'disabled' : ''} ${isSpinning ? 'spinning' : ''}`}
        aria-live="polite"
      >
        {buttonText}
      </button>

      {noticeMessage}
      
      {spinResult && !isSpinning && (
        <div className="spin-result-message" role="alert">
          <h3>🎉 You Got... 🎉</h3>
          <p>{spinResult.text}</p>
          <button onClick={handleSpin} className="spin-again-button">Spin Again!</button>
        </div>
      )}
    </div>
  );
};

export default SpinWheelComponent;