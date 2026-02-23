import React from 'react';

// Pass currentUserId so the component knows who YOU are
export default function MatchHistory({ matchData, currentUserId }) {
    return (
        <div className="w-full h-full overflow-y-auto px-2 custom-scrollbar">
            <ul className="flex flex-col w-full">
                {matchData?.map((session) => {
                    // 1. Correctly find the opponent relative to the viewer
                    const opponent = session.participants.find(p => p.userId !== currentUserId);
                    
                    // 2. Determine if the viewer (currentUserId) won
                    const isPlayerA = session.participants[0]?.userId === currentUserId;
                    const hasWon = isPlayerA 
                        ? session.scoreA > session.scoreB 
                        : session.scoreB > session.scoreA;

                    return (
                        <li 
                            key={session.id} 
                            className="flex items-center justify-between py-3 border-b border-cyan-500/10 last:border-0 hover:bg-white/5 transition-colors px-1"
                        >
                            {/* Opponent Name */}
                            <span className="text-white font-pixel text-[10px] uppercase truncate w-20">
                                {opponent?.username || "GUEST"}
                            </span>

                            {/* Score Display */}
                            <span className="text-white/50 font-pixel text-[10px] tracking-widest">
                                {session.scoreA}-{session.scoreB}
                            </span>

                            {/* WIN / LOSE with Glow */}
                            <span className={`font-pixel text-[10px] w-10 text-right ${
                                hasWon 
                                ? 'text-[#00ff41] drop-shadow-[0_0_2px_#00ff41]' 
                                : 'text-[#ff0000] drop-shadow-[0_0_2px_#ff0000]'
                            }`}>
                                {hasWon ? 'WIN' : 'LOSE'}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};