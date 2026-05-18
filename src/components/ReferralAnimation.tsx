import React from 'react';

export function ReferralAnimation() {
  return (
    <div className="w-full relative overflow-hidden z-0" style={{ aspectRatio: '16/9' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .ra-anim-wrap {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: #FFFFFF;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .ra-gift-box {
            position: relative;
            width: 80px;
            height: 60px;
            background: #ff7675;
            border-radius: 4px;
            z-index: 10;
            box-shadow: 0 10px 15px rgba(0,0,0,0.1);
            animation: raBounce 2s infinite ease-in-out;
        }
        .ra-gift-lid {
            position: absolute;
            top: -10px;
            left: -5px;
            width: 90px;
            height: 15px;
            background: #d63031;
            border-radius: 4px;
            z-index: 11;
        }
        .ra-ribbon-v {
            position: absolute;
            top: 0; left: 50%;
            transform: translateX(-50%);
            width: 15px;
            height: 100%;
            background: #fdcb6e;
            z-index: 12;
        }
        .ra-ribbon-h {
            position: absolute;
            top: 50%; left: 0;
            transform: translateY(-50%);
            width: 100%;
            height: 15px;
            background: #fdcb6e;
            z-index: 12;
        }
        .ra-bow {
            position: absolute;
            top: -25px;
            left: 50%;
            transform: translateX(-50%);
            width: 40px;
            height: 20px;
            z-index: 13;
            display: flex;
            justify-content: space-between;
        }
        .ra-bow-loop {
            width: 18px;
            height: 18px;
            border: 4px solid #fdcb6e;
            border-radius: 50% 50% 0 50%;
            transform: rotate(45deg);
        }
        .ra-bow-loop:last-child {
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
        }
        @keyframes raBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }

        /* Confetti */
        .ra-confetti {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 2px;
            animation: raFall 3s infinite linear;
        }
        .ra-c1 { background: #74b9ff; left: 20%; top: -10%; animation-delay: 0s; }
        .ra-c2 { background: #55efc4; left: 50%; top: -10%; animation-delay: 1s; }
        .ra-c3 { background: #fdcb6e; left: 80%; top: -10%; animation-delay: 0.5s; }
        .ra-c4 { background: #a29bfe; left: 30%; top: -10%; animation-delay: 1.5s; }
        .ra-c5 { background: #ff7675; left: 70%; top: -10%; animation-delay: 2s; }
        
        @keyframes raFall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(300px) rotate(360deg); opacity: 0; }
        }

        /* Connecting nodes */
        .ra-node {
            position: absolute;
            width: 36px;
            height: 36px;
            background: #00cec9;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            font-size: 16px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .ra-n1 { left: 15%; top: 30%; }
        .ra-n2 { left: 15%; bottom: 25%; }
        .ra-n3 { right: 15%; top: 30%; }
        .ra-n4 { right: 15%; bottom: 25%; }
        
        .ra-line {
            position: absolute;
            background: #dfe6e9;
            z-index: 0;
        }
        .ra-l1 { left: 20%; top: 40%; width: 30%; height: 2px; transform: rotate(15deg); }
        .ra-l2 { left: 20%; top: 60%; width: 30%; height: 2px; transform: rotate(-15deg); }
        .ra-l3 { right: 20%; top: 40%; width: 30%; height: 2px; transform: rotate(-15deg); }
        .ra-l4 { right: 20%; top: 60%; width: 30%; height: 2px; transform: rotate(15deg); }

      `}} />
      <div className="ra-anim-wrap">
        
        <div className="ra-line ra-l1"></div>
        <div className="ra-line ra-l2"></div>
        <div className="ra-line ra-l3"></div>
        <div className="ra-line ra-l4"></div>

        <div className="ra-node ra-n1">👤</div>
        <div className="ra-node ra-n2">👤</div>
        <div className="ra-node ra-n3">👤</div>
        <div className="ra-node ra-n4">👤</div>

        <div className="ra-gift-box">
            <div className="ra-gift-lid"></div>
            <div className="ra-ribbon-h"></div>
            <div className="ra-ribbon-v"></div>
            <div className="ra-bow">
                <div className="ra-bow-loop"></div>
                <div className="ra-bow-loop"></div>
            </div>
        </div>

        <div className="ra-confetti ra-c1"></div>
        <div className="ra-confetti ra-c2"></div>
        <div className="ra-confetti ra-c3"></div>
        <div className="ra-confetti ra-c4"></div>
        <div className="ra-confetti ra-c5"></div>

      </div>
    </div>
  );
}
