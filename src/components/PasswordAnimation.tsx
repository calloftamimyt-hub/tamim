import React from 'react';

export function PasswordAnimation() {
  return (
    <div className="w-full relative overflow-hidden z-0" style={{ aspectRatio: '16/9' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .pa-anim-wrap {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: #FFFFFF;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .pa-lock-container {
            position: relative;
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #00b894, #55efc4);
            border-radius: 12px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.15);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10;
        }
        .pa-shackle {
            position: absolute;
            top: -30px;
            width: 50px;
            height: 50px;
            border: 8px solid #b2bec3;
            border-bottom: none;
            border-radius: 25px 25px 0 0;
            z-index: 5;
            transition: transform 0.5s ease-in-out;
            animation: paUnlock 3s infinite alternate ease-in-out;
            transform-origin: left bottom;
        }
        .pa-keyhole {
            width: 15px;
            height: 15px;
            background: #ffffff;
            border-radius: 50%;
            position: relative;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }
        .pa-keyhole::after {
            content: '';
            position: absolute;
            top: 10px;
            left: 3px;
            width: 9px;
            height: 15px;
            background: #ffffff;
            border-radius: 2px;
        }
        @keyframes paUnlock {
            0%, 20% { transform: translateY(0); }
            50%, 100% { transform: translateY(-12px); }
        }
        
        .pa-asterisk {
            position: absolute;
            font-size: 40px;
            color: #d63031;
            font-weight: bold;
            opacity: 0;
            z-index: 20;
        }
        .pa-a1 { left: 25%; top: 35%; animation: paPop 2s infinite ease-out; }
        .pa-a2 { left: 40%; top: 20%; animation: paPop 2s 0.3s infinite ease-out; }
        .pa-a3 { right: 40%; top: 35%; animation: paPop 2s 0.6s infinite ease-out; }
        .pa-a4 { right: 25%; top: 20%; animation: paPop 2s 0.9s infinite ease-out; }

        @keyframes paPop {
            0% { transform: scale(0); opacity: 1; color: #fdcb6e; }
            50% { transform: scale(1.5); opacity: 0.8; color: #d63031; }
            100% { transform: scale(2); opacity: 0; }
        }
        
        .pa-shield-back {
            position: absolute;
            width: 180px;
            height: 180px;
            background: #f1f2f6;
            clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            z-index: 1;
            animation: paRotate 15s infinite linear;
        }
        @keyframes paRotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
      `}} />
      <div className="pa-anim-wrap">
        <div className="pa-shield-back"></div>
        <div className="pa-shackle"></div>
        <div className="pa-lock-container">
            <div className="pa-keyhole"></div>
        </div>
        
        <div className="pa-asterisk pa-a1">*</div>
        <div className="pa-asterisk pa-a2">*</div>
        <div className="pa-asterisk pa-a3">*</div>
        <div className="pa-asterisk pa-a4">*</div>
      </div>
    </div>
  );
}
