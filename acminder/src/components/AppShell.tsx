import React from 'react';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <>
      {/* Mobile: full screen */}
      <div className="sm:hidden">
        {children}
      </div>

      {/* Desktop: phone shell */}
      <div className="hidden sm:flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F0EDE8] to-[#E8E4DF]">
        <div className="relative w-[390px] h-[844px] bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Notch simulation */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>
          <div className="pt-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}