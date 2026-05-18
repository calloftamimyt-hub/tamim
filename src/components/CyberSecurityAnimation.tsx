import React from 'react';

export function CyberSecurityAnimation() {
  return (
    <div className="w-full relative overflow-hidden z-0" style={{ aspectRatio: '16/9' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .cs-anim-wrap {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: #FFFFFF;
            overflow: hidden;
        }
        .cs-data-file {
            position: absolute; background: #FFFFFF; border: 1.5px solid #E2E8F0;
            border-radius: 8px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
            animation: csFloatData 3.5s infinite ease-in-out alternate;
            padding: 8px; display: flex; flex-direction: column; gap: 5px; z-index: 2;
        }
        .cs-file-line { height: 4px; background: #E2E8F0; border-radius: 2px; }
        .cs-file-bg-1 { width: 75px; height: 95px; left: 25%; top: 10%; }
        .cs-file-bg-2 { width: 65px; height: 55px; left: 10%; top: 20%; background: #F8FAFC; animation-delay: 0.7s; }
        @keyframes csFloatData { 0% { transform: translateY(0) rotate(0deg); } 100% { transform: translateY(-8px) rotate(3deg); } }
        .cs-file-lock {
            position: absolute; top: -6px; right: -6px; width: 16px; height: 12px;
            background: #00b894; border-radius: 2px; box-shadow: 0 2px 8px rgba(0, 184, 148, 0.4);
        }
        .cs-file-lock::before {
            content: ''; position: absolute; top: -5px; left: 3px; width: 10px; height: 6px;
            border: 2px solid #00b894; border-bottom: none; border-radius: 4px 4px 0 0;
        }
        .cs-password-bar {
            position: absolute; left: 5%; top: 45%; width: 25%; height: 10%;
            background: #FFFFFF; border: 1.5px solid #6C5CE7; border-radius: 20px;
            display: flex; align-items: center; padding-left: 15px; gap: 6px; z-index: 3; box-shadow: 0 6px 15px rgba(108, 92, 231, 0.1);
        }
        .cs-pass-dot { width: 6px; height: 6px; background: #6C5CE7; border-radius: 50%; opacity: 0; animation: csDotType 1.8s infinite steps(1) alternate; }
        .cs-dot2 { animation-delay: 0.3s; }
        .cs-dot3 { animation-delay: 0.6s; }
        @keyframes csDotType { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
        .cs-secure-mail {
            position: absolute; left: 12%; bottom: 20%; width: 22%; height: 25%; background: #FAC423; 
            border-radius: 6px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12); z-index: 6; animation: csMailFloat 3s infinite ease-in-out alternate; border: 1px solid #D9A406;
        }
        @keyframes csMailFloat { 0% { transform: translateY(0); } 100% { transform: translateY(-8px); } }
        .cs-mail-flap {
            position: absolute; top: 0; left: 0; width: 0; height: 0;
            border-left: 64px solid transparent; border-right: 64px solid transparent; border-top: 42px solid #E5B214; z-index: 7;
        }
        .cs-mail-lines {
            position: absolute; bottom: 0; left: 0; width: 100%; height: 100%;
            clip-path: polygon(0% 100%, 50% 50%, 100% 100%); background-color: #D9A406; border-radius: 0 0 6px 6px;
        }
        .cs-small-lock {
            position: absolute; bottom: -5px; right: -5px; width: 20px; height: 15px;
            background: #2D3436; border-radius: 3px; z-index: 8; box-shadow: 0 3px 8px rgba(0,0,0,0.2);
        }
        .cs-small-lock::before {
            content: ''; position: absolute; top: -8px; left: 4px; width: 12px; height: 9px;
            border: 2px solid #2D3436; border-bottom: none; border-radius: 6px 6px 0 0;
        }
        .cs-shield-box { position: absolute; left: 40%; top: 28%; width: 20%; height: 40%; z-index: 10; }
        .cs-shield {
            width: 100%; height: 100%; background: linear-gradient(135deg, #F9D423 0%, #FF4E50 100%); 
            clip-path: polygon(0% 0%, 100% 0%, 100% 50%, 50% 100%, 0% 50%); border: 2px solid #FFF; display: flex; justify-content: center; align-items: center;
            box-shadow: 0 10px 25px rgba(255, 78, 80, 0.25); animation: csShieldGlow 2.5s infinite ease-in-out;
        }
        @keyframes csShieldGlow { 0%, 100% { transform: scale(1); filter: drop-shadow(0 4px 10px rgba(249, 212, 35, 0.3)); } 50% { transform: scale(1.05); filter: drop-shadow(0 8px 20px rgba(249, 212, 35, 0.6)); } }
        .cs-shield-lock { width: 26px; height: 22px; background: #FFF; border-radius: 4px; position: relative; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .cs-shield-lock::before { content: ''; position: absolute; top: -14px; left: 4px; width: 18px; height: 15px; border: 3.5px solid #FFF; border-bottom: none; border-radius: 10px 10px 0 0; }
        .cs-character-container {
            position: absolute; right: 12%; bottom: 0; width: 24%; height: 78%; display: flex; flex-direction: column; align-items: center; z-index: 5;
        }
        .cs-man-head { width: 42%; aspect-ratio: 1; background-color: #FFD1BA; border-radius: 50%; position: relative; box-shadow: inset -4px -4px 0 rgba(0,0,0,0.08); }
        .cs-man-hair { background: #333333; height: 38%; width: 100%; border-radius: 14px 14px 0 0; }
        .cs-man-neck { width: 18%; height: 12%; background: #FFD1BA; margin-top: -2px; }
        .cs-man-body { width: 82%; height: 72%; background: #9BB388; border-radius: 16px 16px 0 0; position: relative; box-shadow: inset -5px 0 10px rgba(0,0,0,0.08); }
        .cs-man-shirt { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 24%; height: 24%; background: #FFF; clip-path: polygon(0 0, 100% 0, 50% 100%); }
        .cs-man-tie { position: absolute; top: 15%; left: 50%; transform: translateX(-50%); width: 5%; height: 50%; background: #7C9469; }
        .cs-left-arm { position: absolute; left: -8%; top: 12%; width: 22%; height: 58%; background: #8FA67C; border-radius: 10px; transform: rotate(12deg); }
        .cs-waving-arm-container { position: absolute; right: -14%; top: 6%; width: 28%; height: 68%; transform-origin: top center; animation: csArmWave 1.4s ease-in-out infinite alternate; }
        .cs-shoulder-sleeve { width: 90%; height: 65%; background: #9BB388; border-radius: 10px; }
        .cs-hand-palm { width: 75%; height: 35%; background: #FFD1BA; border-radius: 50% 50% 6px 6px; margin-top: -6px; margin-left: 2px; box-shadow: inset -2px -2px 0 rgba(0,0,0,0.08); }
        @keyframes csArmWave { 0% { transform: rotate(5deg); } 100% { transform: rotate(-38deg); } }
      `}} />
      <div className="cs-anim-wrap">
        <div className="cs-data-file cs-file-bg-1">
            <div className="cs-file-lock"></div>
            <div className="cs-file-line" style={{width: '50%', background: '#6C5CE7'}}></div>
            <div className="cs-file-line"></div>
            <div className="cs-file-line" style={{width: '75%'}}></div>
        </div>
        <div className="cs-data-file cs-file-bg-2">
            <div className="cs-file-lock"></div>
            <div className="cs-file-line" style={{width: '40%', background: '#00b894'}}></div>
            <div className="cs-file-line"></div>
        </div>

        <div className="cs-password-bar">
            <div className="cs-file-lock" style={{left: '-5px', top: '-5px', background: '#6C5CE7', boxShadow: '0 2px 6px rgba(108, 92, 231, 0.3)'}}></div>
            <div className="cs-pass-dot cs-dot1"></div>
            <div className="cs-pass-dot cs-dot2"></div>
            <div className="cs-pass-dot cs-dot3"></div>
        </div>

        <div className="cs-secure-mail">
            <div className="cs-mail-flap"></div>
            <div className="cs-mail-lines"></div>
            <div className="cs-small-lock"></div>
        </div>

        <div className="cs-shield-box">
            <div className="cs-shield">
                <div className="cs-shield-lock"></div>
            </div>
        </div>

        <div className="cs-character-container">
            <div className="cs-man-head">
                <div className="cs-man-hair"></div>
            </div>
            <div className="cs-man-neck"></div>
            <div className="cs-man-body">
                <div className="cs-man-shirt"></div>
                <div className="cs-man-tie"></div>
                <div className="cs-left-arm"></div>
                
                <div className="cs-waving-arm-container">
                    <div className="cs-shoulder-sleeve"></div>
                    <div className="cs-hand-palm"></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
