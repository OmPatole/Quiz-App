import React, { useState, useEffect, useRef } from 'react';

const MockSecurityCheck = () => {
  const [isActive, setIsActive] = useState(false);
  const [logs, setLogs] = useState([]);
  const [violationCount, setViolationCount] = useState(0);
  const quizRef = useRef(null);

  // Helper to add logs with timestamps
  const addLog = (message) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${message}`, ...prev]);
  };

  // 1. Start: Request Full Screen
  const startMockQuiz = async () => {
    try {
      if (quizRef.current) {
        await quizRef.current.requestFullscreen();
        setIsActive(true);
        addLog("STARTED: Fullscreen entered.");
        setViolationCount(0);
      }
    } catch (err) {
      alert("Browser blocked fullscreen. Please click the button manually.");
    }
  };

  // 2. Stop: Exit
  const stopMockQuiz = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsActive(false);
    addLog("STOPPED: Quiz ended manually.");
  };

  useEffect(() => {
    if (!isActive) return;

    // A. Detect Tab Switching (Alt+Tab, Ctrl+Tab, Minimized)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolationCount(prev => prev + 1);
        addLog("VIOLATION: User switched tabs or minimized window! (visibility hidden)");
      } else {
        addLog("INFO: User returned to tab.");
      }
    };

    // B. Detect Focus Loss (Clicking outside, Alt+Tab overlay)
    const handleBlur = () => {
      setViolationCount(prev => prev + 1);
      addLog("VIOLATION: Window lost focus (Alt+Tab or clicked outside)!");
    };

    // C. Detect Escape Key (Exiting Full Screen)
    const handleFullScreenChange = () => {
      if (!document.fullscreenElement) {
        setIsActive(false);
        setViolationCount(prev => prev + 1);
        addLog("FATAL: User pressed ESC or exited fullscreen. Quiz Terminated.");
      }
    };

    // Attach Listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullScreenChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [isActive]);

  return (
    <div ref={quizRef} className={`min-h-screen p-8 transition-colors duration-300 ${isActive ? 'bg-white' : 'bg-gray-100'}`}>
      
      {!isActive ? (
        <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-lg text-center mt-20">
          <h1 className="text-2xl font-bold mb-4">Security Test Chamber</h1>
          <p className="mb-6 text-gray-600">
            Click start to test Fullscreen enforcement and Tab-switching detection.
          </p>
          <button 
            onClick={startMockQuiz}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700"
          >
            Start Mock Security Mode
          </button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-indigo-900">Quiz Active</h1>
            <button 
              onClick={stopMockQuiz}
              className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Exit Test
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className={`p-4 rounded-lg border-2 text-center ${violationCount > 0 ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'}`}>
              <div className="text-3xl font-bold">{violationCount}</div>
              <div className="text-sm font-semibold uppercase">Violations</div>
            </div>
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Try these:</strong><br/>
                1. Press <kbd className="bg-white px-1 rounded">Esc</kbd><br/>
                2. Press <kbd className="bg-white px-1 rounded">Alt</kbd> + <kbd className="bg-white px-1 rounded">Tab</kbd><br/>
                3. Press <kbd className="bg-white px-1 rounded">Ctrl</kbd> + <kbd className="bg-white px-1 rounded">Tab</kbd>
              </p>
            </div>
          </div>

          <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono h-64 overflow-y-auto text-sm shadow-inner">
            {logs.length === 0 && <span className="text-slate-500">// System logs will appear here...</span>}
            {logs.map((log, index) => (
              <div key={index} className="mb-1 border-b border-slate-800 pb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MockSecurityCheck;