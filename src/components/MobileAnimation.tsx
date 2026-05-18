import React from 'react';

export function MobileAnimation() {
  return (
    <div className="w-full relative overflow-hidden z-0" style={{ aspectRatio: '16/9' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .ma-anim-wrap {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: #FFFFFF;
            overflow: hidden;
        }
        /* Mobile phone outline */
        .ma-phone {
            position: relative;
            margin: 5% auto;
            width: 22%;
            height: 70%;
            border: 3px solid #2d3436;
            border-radius: 16px;
            background: #ffffff;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            overflow: hidden;
            z-index: 10;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .ma-notch {
            width: 40%;
            height: 6px;
            background: #2d3436;
            border-radius: 0 0 6px 6px;
        }
        .ma-screen {
            margin-top: 15%;
            width: 80%;
            height: 40%;
            background: linear-gradient(135deg, #74b9ff, #0984e3);
            border-radius: 8px;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            font-weight: bold;
            font-size: 24px;
        }
        .ma-chat-bubble {
            width: 80%;
            height: 12px;
            background: #dfe6e9;
            border-radius: 6px;
            margin-top: 10%;
            align-self: flex-start;
            margin-left: 10%;
            animation: maFadeInOut 2s infinite alternate;
        }
        .ma-chat-bubble-2 {
            width: 60%;
            height: 12px;
            background: #00cec9;
            border-radius: 6px;
            margin-top: 5%;
            align-self: flex-end;
            margin-right: 10%;
            animation: maFadeInOut 2s 1s infinite alternate;
        }
        @keyframes maFadeInOut {
            0% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        .ma-signal {
            position: absolute;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100px;
            height: 100px;
            border-radius: 50%;
            border: 2px solid #00cec9;
            opacity: 0;
            animation: maPulse 2s infinite;
            z-index: 5;
        }
        .ma-signal-2 {
            animation-delay: 1s;
        }
        @keyframes maPulse {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }
        /* floating elements */
        .ma-icon {
            position: absolute;
            width: 36px;
            height: 36px;
            background: #ffeaa7;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            animation: maFloat 3s infinite alternate;
            color: #d63031;
            font-size: 10px;
            font-weight: bold;
        }
        .ma-icon-left {
            left: 20%;
            top: 40%;
            background: #81ecec;
            color: #00b894;
        }
        .ma-icon-right {
            right: 20%;
            top: 30%;
            animation-delay: 1.5s;
        }
        @keyframes maFloat {
            0% { transform: translateY(-10px); }
            100% { transform: translateY(10px); }
        }
      `}} />
      <div className="ma-anim-wrap">
        <div className="ma-signal"></div>
        <div className="ma-signal ma-signal-2"></div>
        
        <div className="ma-icon ma-icon-left">SMS</div>
        <div className="ma-icon ma-icon-right">OTP</div>

        <div className="ma-phone">
            <div className="ma-notch"></div>
            <div className="ma-screen">✔️</div>
            <div className="ma-chat-bubble"></div>
            <div className="ma-chat-bubble-2"></div>
        </div>
      </div>
    </div>
  );
}
