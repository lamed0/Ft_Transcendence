import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-cyan-400 font-pixel">
      <h1 className="text-6xl mb-4">404</h1>
      <h2 className="text-2xl mb-8">PADDLE NOT FOUND</h2>
      <p className="mb-8 text-gray-400">The ball bounced out of the matrix. This page does not exist.</p>
      
      <Link 
        to="/" 
        className="px-6 py-3 border border-cyan-400 hover:bg-cyan-400 hover:text-black transition-colors"
      >
        RETURN TO BASE
      </Link>
    </div>
  );
}