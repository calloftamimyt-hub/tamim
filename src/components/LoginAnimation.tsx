import React from 'react';

export function LoginAnimation() {
  return (
    <div className="w-full relative overflow-hidden z-0 bg-transparent" style={{ aspectRatio: '16/9' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .la-anim-wrap {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: #FFFFFF;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .la-circle {
            position: absolute;
            border-radius: 50%;
            border: 2px dashed rgba(16, 185, 129, 0.3);
            animation: laSpin 20s linear infinite;
        }
        .la-c1 { width: 120px; height: 120px; border-color: rgba(16, 185, 129, 0.4); border-style: solid; }
        .la-c2 { width: 180px; height: 180px; animation-direction: reverse; animation-duration: 25s; }
        .la-c3 { width: 240px; height: 240px; opacity: 0.5; }

        @keyframes laSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .la-card {
            position: relative;
            width: 80px;
            height: 100px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 12px;
            box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
            z-index: 10;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 15px;
            animation: laFloat 4s ease-in-out infinite;
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .la-avatar {
            width: 32px;
            height: 32px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            margin-bottom: 10px;
            border: 2px solid rgba(255,255,255,0.8);
            position: relative;
            overflow: hidden;
        }
        .la-avatar::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 20px;
            height: 16px;
            background: rgba(255,255,255,0.8);
            border-radius: 10px 10px 0 0;
        }
        .la-avatar::before {
            content: '';
            position: absolute;
            top: 4px;
            left: 50%;
            transform: translateX(-50%);
            width: 10px;
            height: 10px;
            background: rgba(255,255,255,0.8);
            border-radius: 50%;
        }

        .la-line {
            width: 40px;
            height: 4px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 2px;
            margin-bottom: 6px;
        }
        .la-line-short {
            width: 25px;
        }

        .la-shield {
            position: absolute;
            bottom: -15px;
            right: -15px;
            width: 36px;
            height: 40px;
            background: #f59e0b;
            clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            z-index: 15;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 4px 10px rgba(245, 158, 11, 0.4);
            animation: laShieldPulse 2s infinite;
        }
        .la-shield::after {
            content: '✓';
            color: white;
            font-size: 18px;
            font-weight: bold;
        }

        @keyframes laFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }

        @keyframes laShieldPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }

        .la-particle {
            position: absolute;
            background: #10b981;
            border-radius: 50%;
            animation: laFloatUp 3s infinite linear;
            opacity: 0;
        }
        .p1 { width: 6px; height: 6px; left: 30%; bottom: 20%; animation-delay: 0s; }
        .p2 { width: 4px; height: 4px; right: 25%; bottom: 10%; animation-delay: 1.2s; }
        .p3 { width: 8px; height: 8px; left: 45%; bottom: 5%; animation-delay: 2.4s; }

        @keyframes laFloatUp {
            0% { transform: translateY(0); opacity: 0; }
            30% { opacity: 0.6; }
            100% { transform: translateY(-60px); opacity: 0; }
        }
      `}} />
      <div className="la-anim-wrap">
        <div className="la-circle la-c3"></div>
        <div className="la-circle la-c2"></div>
        <div className="la-circle la-c1"></div>
        
        <div className="la-card">
            <div className="la-avatar"></div>
            <div className="la-line"></div>
            <div className="la-line la-line-short"></div>
            <div className="la-shield"></div>
        </div>

        <div className="la-particle p1"></div>
        <div className="la-particle p2"></div>
        <div className="la-particle p3"></div>
      </div>
    </div>
  );
}

