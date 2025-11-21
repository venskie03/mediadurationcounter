import React, { useState, useCallback } from 'react';
import { FaUpload, FaMusic, FaVideo, FaDollarSign, FaClock, FaFile } from 'react-icons/fa';

const App = () => {
  const [files, setFiles] = useState([]);
  const [chargePerMinute, setChargePerMinute] = useState(3);
  const [isDragging, setIsDragging] = useState(false);

  const getMediaDuration = useCallback((file) => {
    return new Promise((resolve) => {
      const element = document.createElement(file.type?.includes('video') ? 'video' : 'audio');
      const objectUrl = URL.createObjectURL(file);
      element.preload = 'metadata';

      const cleanup = () => {
        URL.revokeObjectURL(objectUrl);
      };

      element.onloadedmetadata = () => {
        const duration = Number.isFinite(element.duration) ? element.duration : 0;
        cleanup();
        resolve(duration);
      };

      element.onerror = () => {
        cleanup();
        resolve(0);
      };

      element.src = objectUrl;
    });
  }, []);

  const handleFileUpload = useCallback(async (uploadedFiles) => {
    const filesArray = Array.from(uploadedFiles);
    const filesWithDuration = await Promise.all(
      filesArray.map(async (file) => {
        const durationSeconds = Math.round(await getMediaDuration(file)); // FIX
        return {
          file,
          name: file.name,
          type: file.type?.includes('audio') ? 'audio' : 'video',
          durationSeconds,
          id: Math.random().toString(36).substr(2, 9)
        };
      })
    );
    setFiles(prev => [...prev, ...filesWithDuration]);
  }, [getMediaDuration]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const uploadedFiles = e.dataTransfer.files;
    handleFileUpload(uploadedFiles);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e) => {
    handleFileUpload(e.target.files);
  }, [handleFileUpload]);

  const removeFile = useCallback((id) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  }, []);

  const formatDuration = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.round(totalSeconds % 60);
    let displayMinutes = minutes;

    if (seconds === 60) {
      displayMinutes += 1;
      seconds = 0;
    }

    return { minutes: displayMinutes, seconds };
  };

  // Calculate totals
  const totalSecondsAccumulated = files.reduce((total, file) => total + file.durationSeconds, 0);
  const { minutes: totalMinutesWithSeconds, seconds: remainingSeconds } = formatDuration(totalSecondsAccumulated);

  const combineMinutes = (minutes, seconds) => {
    return parseFloat(`${minutes}.${seconds.toString().padStart(2, "0")}`);
  };

  const totalCharge = combineMinutes(totalMinutesWithSeconds, remainingSeconds) * chargePerMinute ;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-4 font-[Poppins]">
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Media Duration Calculator</h1>
        <p className="text-gray-400">Upload files to calculate duration and cost</p>
      </div>
  
      {/* Main Card */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-lg p-6 mb-6 border border-gray-700">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            isDragging 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-gray-600 hover:border-blue-400 hover:bg-gray-700/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <FaUpload className="text-3xl text-blue-400 mx-auto mb-4" />
          <p className="text-gray-300 mb-2">Drag & drop files here</p>
          <p className="text-sm text-gray-500 mb-4">Audio and video files</p>
          <label className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all">
            <FaUpload className="mr-2 text-sm" />
            Choose Files
            <input
              type="file"
              className="hidden"
              multiple
              accept="audio/*,video/*"
              onChange={handleFileInput}
            />
          </label>
        </div>
  
        {/* Charge Input */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <FaDollarSign className="inline mr-1 text-green-400" />
            Charge per minute ($)
          </label>
          <input
            type="number"
            value={chargePerMinute}
            onChange={(e) => setChargePerMinute(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="0.01"
          />
        </div>
      </div>
  
      {/* Results Card */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-lg p-6 mb-6 border border-gray-700">
     <div className="flex gap-2">
     <h2 className="text-xl font-bold text-gray-200 mb-4 flex items-center">
          <FaClock className="text-blue-400 mr-2" />
          Summary
        </h2>
        <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center">
          {totalCharge.toFixed(2) > 150 ? 'PALDO BAKA NAMAN' : ''}
        </h2>
     </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Duration */}
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl p-5 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">Total Duration</p>
                <p className="text-2xl font-bold text-white">
                  {totalMinutesWithSeconds}m {remainingSeconds}s 
                </p>
              </div>
              <FaClock className="text-3xl text-blue-400 opacity-80" />
            </div>
          </div>
  
          {/* Total Charge */}
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-5 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">Total Charge</p>
                <p className="text-2xl font-bold text-white">
                  ${totalCharge.toFixed(2)}
                </p>
              </div>
              <FaDollarSign className="text-3xl text-green-400 opacity-80" />
            </div>
          </div>
        </div>
      </div>
  
      {/* File List */}
      {files.length > 0 && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-gray-200 mb-4">
            Uploaded Files ({files.length})
          </h3>
          <div className="space-y-3">
            {files.map((file) => {
              const { minutes, seconds } = formatDuration(file.durationSeconds);
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors border border-gray-600"
                >
                  <div className="flex items-center">
                    {file.type === 'audio' ? (
                      <FaMusic className="text-purple-400 text-lg mr-3" />
                    ) : (
                      <FaVideo className="text-red-400 text-lg mr-3" />
                    )}
                    <div>
                      <p className="font-medium text-gray-200">{file.name}</p>
                      <p className="text-sm text-gray-400">
                        {minutes}m {seconds}s
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-red-400 hover:text-red-300 transition-colors text-sm"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
  
      {/* Empty State */}
      {files.length === 0 && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-lg p-8 text-center border border-gray-700">
          <FaFile className="text-5xl text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No files uploaded</h3>
          <p className="text-gray-500">Upload files to get started</p>
        </div>
      )}
    </div>
  </div>
  );
};

export default App;