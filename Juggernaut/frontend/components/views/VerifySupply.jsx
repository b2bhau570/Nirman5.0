import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { FileUpload } from '../FileUpload';
import { ShieldCheck, QrCode, CheckCircle, Camera, Loader2, ScanLine, AlertCircle, RefreshCw, XCircle, Package, Lock, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../../translations';

export const VerifySupply = ({ language }) => {
  const t = translations[language];
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  
  // Camera States
  const [cameraActive, setCameraActive] = useState(true);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  
  const [manualFile, setManualFile] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);

  // --- Camera Initialization & Cleanup ---
  useEffect(() => {
    let stream = null;
    let mounted = true;

    const initCamera = async () => {
      if (!cameraActive || scannedData || verificationResult) return;
      
      try {
        setCameraLoading(true);
        setCameraError(null);
        setPermissionDenied(false);

        const constraints = { 
          video: { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (!mounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        stream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
             videoRef.current?.play().catch(e => console.warn("Autoplay blocked:", e));
             setCameraLoading(false);
          };
        }
      } catch (err) {
        console.error("Camera init error:", err);
        if (mounted) {
          setCameraLoading(false);
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
             setPermissionDenied(true);
             setCameraError("Camera permission was denied. Please allow access in browser settings.");
          } else {
             setCameraError(t.cameraError);
          }
          setCameraActive(false);
        }
      }
    };

    initCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [cameraActive, scannedData, verificationResult, t.cameraError]);

  // --- Scanning Loop ---
  useEffect(() => {
    if (!cameraActive || scannedData || verificationResult || cameraLoading) return;

    const scan = () => {
       if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });

          if (ctx) {
             canvas.width = video.videoWidth;
             canvas.height = video.videoHeight;
             ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
             
             const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
             const code = jsQR(imageData.data, imageData.width, imageData.height, {
               inversionAttempts: "dontInvert",
             });

             if (code && code.data) {
               console.log("QR Found:", code.data);
               handleScannedCode(code.data);
               return; // Stop scanning
             }
          }
       }
       requestRef.current = requestAnimationFrame(scan);
    };

    requestRef.current = requestAnimationFrame(scan);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [cameraActive, scannedData, verificationResult, cameraLoading]);

  const handleScannedCode = (data) => {
    setScannedData(data);
    setCameraActive(false); 
    setIsVerifying(true);
    // Simulate verification delay
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationResult('success'); 
    }, 2000);
  };

  const handleVerify = () => {
    if (!manualFile && !scannedData) return;
    setIsVerifying(true);
    setVerificationResult(null);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationResult('success');
    }, 2500);
  };

  const resetVerification = () => {
    setVerificationResult(null);
    setScannedData(null);
    setManualFile(null);
    setCameraError(null);
    setPermissionDenied(false);
    setCameraActive(true);
  };

  const toggleCamera = () => {
    if (cameraActive) {
        setCameraActive(false);
    } else {
        setScannedData(null);
        setCameraError(null);
        setPermissionDenied(false);
        setCameraActive(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-emerald-900 flex items-center gap-3">
          <ShieldCheck className="text-emerald-600" size={36} />
          {t.verifyHeader}
        </h2>
        <p className="text-slate-500 mt-2 text-lg max-w-2xl">
          {t.verifySub}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[600px]">
        {/* Left Column: QR Scanner (Dark Mode Conserved for Camera Contrast) */}
        <div className="bg-black/90 rounded-3xl shadow-xl border border-slate-800 overflow-hidden flex flex-col relative h-full min-h-[500px]">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40 z-20">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <ScanLine size={20} className="text-lime-400" />
              {t.liveScanner}
            </h3>
            <div className="flex gap-2 items-center">
              {cameraActive && !cameraError && !cameraLoading ? (
                <>
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium text-slate-300">Live</span>
                </>
              ) : (
                <span className="text-xs font-medium text-slate-500">
                    {cameraLoading ? "Initializing..." : "Paused"}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
             
             {/* Hidden Canvas for Processing */}
             <canvas ref={canvasRef} className="hidden" />

             {/* Camera View */}
             {cameraActive && !scannedData && !cameraError ? (
                <>
                   <video 
                     ref={videoRef}
                     playsInline
                     muted
                     className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${cameraLoading ? 'opacity-0' : 'opacity-100'}`}
                   />
                   
                   {cameraLoading && (
                       <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-slate-900">
                           <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
                           <p className="text-white text-sm font-medium">Starting Camera...</p>
                       </div>
                   )}

                   {/* Dark Scanner Overlay */}
                   <div className="absolute inset-0 bg-black/50 z-10">
                      {/* Clear Cutout */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-white/20 bg-transparent box-content shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                          {/* Corners */}
                          <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-lime-400"></div>
                          <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-lime-400"></div>
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-lime-400"></div>
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-lime-400"></div>
                          
                          {/* Scanning Beam */}
                          {!cameraLoading && (
                             <div className="absolute left-0 right-0 top-0 h-0.5 bg-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                          )}

                          <div className="absolute inset-0 flex items-center justify-center opacity-20">
                              <QrCode size={100} className="text-white" />
                          </div>
                      </div>
                   </div>

                   {!cameraLoading && (
                        <p className="absolute bottom-8 text-white text-sm font-medium bg-black/60 px-6 py-2 rounded-full backdrop-blur-md z-20 border border-white/10 shadow-lg">
                            {t.alignQr}
                        </p>
                   )}
                </>
             ) : (
               <div className="text-slate-500 flex flex-col items-center p-8 text-center z-10 relative w-full">
                 {scannedData ? (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-24 h-24 rounded-full bg-emerald-900/90 text-lime-400 flex items-center justify-center mb-6 border-4 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                        <CheckCircle size={48} />
                      </div>
                      <p className="text-white mb-2 font-bold text-2xl">{t.codeDetected}</p>
                      <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10 mb-4">
                        <p className="text-sm font-mono text-lime-400 break-all max-w-[280px]">
                          {scannedData}
                        </p>
                      </div>
                    </motion.div>
                 ) : permissionDenied ? (
                   <div className="flex flex-col items-center max-w-xs">
                     <div className="w-20 h-20 rounded-full bg-red-900/20 flex items-center justify-center mb-4 text-red-400 border border-red-500/30">
                        <Lock size={32} />
                     </div>
                     <h4 className="text-white font-bold text-lg mb-2">Access Denied</h4>
                     <p className="text-slate-400 mb-6 text-sm">Agri-Sentry needs camera access to scan QR codes. Please check your browser settings.</p>
                     
                     <div className="text-xs text-slate-500 bg-white/5 p-3 rounded-lg border border-white/10 mb-6 w-full text-left">
                       <p className="font-bold mb-1 flex items-center gap-1"><Settings size={10}/> How to fix:</p>
                       <ol className="list-decimal pl-4 space-y-1">
                         <li>Click the lock icon in the address bar.</li>
                         <li>Toggle "Camera" to Allow.</li>
                         <li>Refresh the page.</li>
                       </ol>
                     </div>

                     <button 
                       onClick={resetVerification}
                       className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 rounded-xl font-bold transition-colors shadow-lg"
                     >
                       <RefreshCw size={18} /> {t.retry}
                     </button>
                   </div>
                 ) : cameraError ? (
                   <div className="flex flex-col items-center">
                     <div className="w-20 h-20 rounded-full bg-red-900/20 flex items-center justify-center mb-4 text-red-400 border border-red-500/30">
                        <AlertCircle size={32} />
                     </div>
                     <p className="text-red-200 mb-6 max-w-xs font-medium">{cameraError}</p>
                     <button 
                       onClick={resetVerification}
                       className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-colors shadow-lg"
                     >
                       <RefreshCw size={18} /> {t.retry}
                     </button>
                   </div>
                 ) : (
                   <>
                     <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                        <Camera size={40} className="text-slate-600" />
                     </div>
                     <p className="text-slate-400 text-lg">{t.cameraInactive}</p>
                   </>
                 )}
               </div>
             )}
          </div>
          
          <div className="p-4 bg-black/40 border-t border-white/10 text-center z-20">
            <button 
              onClick={toggleCamera}
              className={`font-bold text-sm transition-colors uppercase tracking-wider flex items-center justify-center gap-2 w-full ${cameraActive && !scannedData && !permissionDenied ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'}`}
            >
              {cameraActive && !scannedData && !cameraError && !permissionDenied ? t.pauseCamera : t.activateCamera}
            </button>
          </div>
        </div>

        {/* Right Column: Manual Upload & Results (Light Theme) */}
        <div className="flex flex-col gap-6 relative h-full">
          {/* Verification Result Overlay */}
          <AnimatePresence>
            {verificationResult === 'success' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-30 bg-white/95 backdrop-blur-xl rounded-3xl border border-emerald-200 flex flex-col items-center justify-center p-8 text-center shadow-2xl"
              >
                <div className="absolute inset-0 bg-emerald-50/50 rounded-3xl animate-pulse-slow"></div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                  className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30 relative z-10"
                >
                  <CheckCircle size={56} />
                </motion.div>
                <h3 className="text-3xl font-bold text-emerald-900 mb-2 relative z-10">{t.authenticProduct}</h3>
                <div className="bg-emerald-50 rounded-xl p-6 mb-8 w-full max-w-sm border border-emerald-200 relative z-10">
                   <p className="text-emerald-800 text-sm font-medium flex items-center justify-center gap-2 mb-2">
                     <ShieldCheck size={16} />
                     {t.verifiedBlockchain}
                   </p>
                   <div className="h-px bg-emerald-200 w-full my-2"></div>
                   <p className="text-emerald-600 text-xs mt-1 break-all font-mono">
                     ID: {scannedData ? scannedData : manualFile?.name || "MANUAL-UPLOAD-ID"}
                   </p>
                   <p className="text-slate-500 text-xs mt-1">
                     Manufacturer: GreenLife Seeds Ltd.
                   </p>
                </div>
                <button 
                  onClick={resetVerification}
                  className="relative z-10 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg flex items-center gap-2 hover:scale-105"
                >
                  <ScanLine size={18} />
                  {t.verifyAnother}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info Card */}
          <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-200 flex-shrink-0">
             <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700 shrink-0">
                   <ShieldCheck size={24} />
                </div>
                <div>
                   <h3 className="font-bold text-emerald-900 mb-1">{t.verifyManually}</h3>
                   <p className="text-sm text-emerald-800/70 leading-relaxed">
                     {t.verifyManuallyDesc}
                   </p>
                </div>
             </div>
          </div>

          {/* Manual Upload Section - Light Card */}
          <div className="bg-white rounded-3xl shadow-md shadow-emerald-900/5 border border-slate-200 p-6 flex-1 flex flex-col">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Package size={20} className="text-emerald-600" />
              {t.uploadLabel}
            </h3>
            
            <div className="flex-1">
              <FileUpload 
                label={t.uploadLabel}
                onFileSelect={setManualFile} 
              />
            </div>
            
            <button 
              onClick={handleVerify}
              disabled={isVerifying || !manualFile}
              className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-3 border ${
                !manualFile 
                  ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700 shadow-emerald-500/20'
              }`}
            >
              {isVerifying ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  {t.verifying}
                </>
              ) : (
                <>
                  <ShieldCheck size={24} />
                  {manualFile ? t.verifyUploaded : t.uploadToVerify}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};