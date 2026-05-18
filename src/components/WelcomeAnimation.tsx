import React from 'react';

export function WelcomeAnimation() {
  return (
    <div className="w-full relative overflow-hidden z-0" style={{ aspectRatio: '16/9' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .wa-anim-wrap {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(135deg, #EAE3F7 0%, #D2C4ED 100%);
            overflow: hidden;
        }
        .wa-welcome-banner {
            position: absolute; top: -60px; left: 8%;
            background: linear-gradient(135deg, #6C5CE7, #a29bfe);
            color: #FFFFFF; padding: 6px 20px; border-radius: 0 0 10px 10px;
            font-weight: 700; font-size: clamp(12px, 4vw, 18px); letter-spacing: 1px;
            box-shadow: 0 4px 10px rgba(108, 92, 231, 0.3);
            animation: waDropBanner 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
            z-index: 10;
        }
        @keyframes waDropBanner { to { top: 0; } }
        .wa-office-window {
            position: absolute; right: 15%; top: 15%; width: 30%; height: 45%;
            background-color: rgba(255, 255, 255, 0.5); border: 4px solid #FFFFFF; border-radius: 4px;
        }
        .wa-office-window::before { content: ''; position: absolute; top: 40%; left: 0; width: 100%; height: 3px; background: #FFF; }
        .wa-office-window::after { content: ''; position: absolute; left: 50%; top: 0; width: 3px; height: 100%; background: #FFF; }
        .wa-workspace { position: absolute; bottom: 12%; left: 5%; width: 35%; height: 30%; }
        .wa-modern-chair { position: absolute; left: 0; bottom: 5%; width: 30%; height: 80%; background: linear-gradient(to bottom, #38ef7d, #11998e); border-radius: 8px 8px 2px 2px; }
        .wa-modern-table { position: absolute; left: 25%; bottom: 5%; width: 75%; height: 8%; background-color: #6F4E37; border-radius: 3px; z-index: 2; }
        .wa-table-leg { position: absolute; bottom: -700%; width: 5%; height: 700%; background-color: #523A28; }
        .wa-modern-laptop { position: absolute; left: 40%; bottom: 13%; width: 25%; height: 25%; background-color: #2d3436; border-radius: 3px 3px 0 0; z-index: 3; }
        .wa-modern-laptop::after { content: ''; position: absolute; bottom: -2px; left: -15%; width: 130%; height: 3px; background: #636e72; border-radius: 1px; }
        .wa-id-card { position: absolute; left: 70%; bottom: 13%; width: 15%; height: 15%; background: white; border: 1px solid #6c5ce7; border-radius: 2px; z-index: 3; opacity: 0; transform: translateY(-10px) rotate(-10deg); animation: waIdCardPop 1s 2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes waIdCardPop { to { opacity: 1; transform: translateY(0) rotate(-15deg); } }
        .wa-indoor-plant { position: absolute; bottom: 12%; left: 44%; width: 7%; height: 10%; background: #E67E22; border-radius: 0 0 4px 4px; }
        .wa-plant-leaves { position: absolute; bottom: 90%; left: -30%; width: 160%; height: 130%; background: #2ECC71; border-radius: 50% 50% 0 0; }
        .wa-character { position: absolute; bottom: 12%; width: 11%; height: 52%; }
        .wa-boy { left: 54%; }
        .wa-girl { right: 8%; }
        .wa-face { width: 80%; aspect-ratio: 1; background-color: #FFD1BA; border-radius: 50%; margin: 0 auto; position: relative; }
        .wa-boy .wa-hair { background: #2d3436; height: 30%; border-radius: 10px 10px 0 0; }
        .wa-girl .wa-hair { background: #000000; height: 45%; border-radius: 12px 12px 2px 2px; }
        .wa-outfit { width: 100%; height: 45%; margin-top: -2px; border-radius: 12px 12px 0 0; }
        .wa-boy .wa-outfit { background: linear-gradient(to bottom, #FFEA79, #FAC423); }
        .wa-girl .wa-outfit { background: linear-gradient(to bottom, #FF7675, #D63031); }
        .wa-pants { display: flex; justify-content: space-between; width: 80%; height: 38%; margin: 0 auto; }
        .wa-leg { width: 35%; height: 100%; }
        .wa-boy .wa-leg { background-color: #3F51B5; }
        .wa-girl .wa-leg { background-color: #2d3436; }
        .wa-waving-hand { position: absolute; top: 30%; width: 25%; height: 30%; border-radius: 4px; transform-origin: top center; z-index: 4; }
        .wa-boy .wa-waving-hand { right: -20%; background-color: #FAC423; animation: waProWaveBoy 1.2s ease-in-out infinite alternate; }
        .wa-girl .wa-waving-hand { left: -20%; background-color: #D63031; animation: waProWaveGirl 1s ease-in-out infinite alternate; }
        @keyframes waProWaveBoy { 0% { transform: rotate(0deg); } 100% { transform: rotate(-45deg); } }
        @keyframes waProWaveGirl { 0% { transform: rotate(0deg); } 100% { transform: rotate(40deg); } }
      `}} />
      <div className="wa-anim-wrap">
        <div className="wa-welcome-banner">WELCOME</div>
        <div className="wa-office-window"></div>
        <div className="wa-workspace">
          <div className="wa-modern-chair"></div>
          <div className="wa-modern-table">
            <div className="wa-table-leg" style={{left: '15%'}}></div>
            <div className="wa-table-leg" style={{right: '15%'}}></div>
          </div>
          <div className="wa-modern-laptop"></div>
          <div className="wa-id-card"></div>
        </div>
        <div className="wa-indoor-plant">
          <div className="wa-plant-leaves"></div>
        </div>
        <div className="wa-character wa-boy">
          <div className="wa-face"><div className="wa-hair"></div></div>
          <div className="wa-outfit"></div>
          <div className="wa-waving-hand"></div>
          <div className="wa-pants">
            <div className="wa-leg"></div>
            <div className="wa-leg"></div>
          </div>
        </div>
        <div className="wa-character wa-girl">
          <div className="wa-face"><div className="wa-hair"></div></div>
          <div className="wa-outfit"></div>
          <div className="wa-waving-hand"></div>
          <div className="wa-pants">
            <div className="wa-leg"></div>
            <div className="wa-leg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
