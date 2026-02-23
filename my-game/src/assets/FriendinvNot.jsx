const FriendInvite = ({ sender, onAccept, onDecline }) => {
  return (
    <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-right-10 duration-300">
      {/* Container with the neon glow and clipped corners */}
      <div 
        className="bg-cyan-400 p-[2px]" 
        style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
      >
        <div 
          className="bg-[#0f0518] px-6 py-4 flex flex-col items-center gap-3 min-w-[280px]"
          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
        >
          {/* Text - Using uppercase to match your 'START GAME' button */}
          <p className="text-white text-[10px] tracking-widest uppercase text-center leading-relaxed">
            <span className="text-cyan-400 font-bold block mb-1">{sender}</span> 
            sent a friend request!
          </p>

          <div className="flex gap-6 mt-1">
            {/* Accept Button (Cyan) */}
            <button 
              onClick={onAccept}
              className="text-cyan-400 hover:scale-110 transition-transform duration-200 text-xl drop-shadow-[0_0_5px_rgba(0,242,255,0.8)]"
            >
              [ ✓ ]
            </button>
            
            {/* Decline Button (Pink/Red) */}
            <button 
              onClick={onDecline}
              className="text-pink-500 hover:scale-110 transition-transform duration-200 text-xl drop-shadow-[0_0_5px_rgba(255,0,85,0.8)]"
            >
              [ ✕ ]
            </button>
          </div>
        </div>
      </div>
      
      {/* Outer Glow Effect */}
      <div className="absolute inset-0 -z-10 bg-cyan-500/20 blur-xl rounded-full" />
    </div>
  );
};

export default FriendInvite;