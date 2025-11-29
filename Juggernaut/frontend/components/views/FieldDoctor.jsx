import React, { useState } from 'react';
import { FileUpload } from '../FileUpload';
import { Stethoscope, Activity, Loader2, CheckCircle2, AlertOctagon, ShieldCheck, Leaf, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { translations } from '../../translations';

const MOCK_DISEASES = [
  {
    diseaseName: 'Early Blight',
    pathogen: 'Alternaria solani',
    confidence: 0.94,
    severity: 'high',
    description: 'Fungal infection causing concentric rings on leaves. rapid spread possible in humid conditions.',
    treatments: [
      'Apply copper-based fungicide immediately',
      'Prune infected leaves to increase airflow',
      'Rotate crops next season'
    ]
  },
  {
    diseaseName: 'Yellow Leaf Rust',
    pathogen: 'Puccinia striiformis',
    confidence: 0.88,
    severity: 'medium',
    description: 'Yellow stripes appearing on leaves. Can reduce yield if not treated.',
    treatments: [
      'Apply sulfur-based fungicides',
      'Reduce nitrogen fertilizer temporarily',
      'Monitor surrounding plants'
    ]
  },
  {
    diseaseName: 'Healthy Plant',
    pathogen: 'N/A',
    confidence: 0.99,
    severity: 'healthy',
    description: 'No significant signs of disease or pest damage detected.',
    treatments: [
      'Continue regular monitoring',
      'Maintain current irrigation schedule',
      'Ensure balanced fertilization'
    ]
  }
];

// --- Mock API Service ---
const analyzeLeafImage = async (file) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate random result for demo purposes
      const randomIndex = Math.floor(Math.random() * MOCK_DISEASES.length);
      resolve(MOCK_DISEASES[randomIndex]);
    }, 2500);
  });
};

export const FieldDoctor = ({ language }) => {
  const t = translations[language];
  const [hasFile, setHasFile] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);

  const handleFileSelect = (file) => {
    setHasFile(true);
    setDiagnosisResult(null); // Reset if new file
  };

  const handleDiagnose = async () => {
    if (!hasFile) return;
    setDiagnosing(true);
    
    try {
      const result = await analyzeLeafImage(new File([], "mock")); // Pass actual file in real app
      setDiagnosisResult(result);
    } catch (error) {
      console.error("Diagnosis failed", error);
    } finally {
      setDiagnosing(false);
    }
  };

  // Helper for dynamic UI styles based on severity
  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-900',
          subText: 'text-red-700',
          accent: 'text-red-600',
          badge: 'bg-red-100 text-red-700 border-red-200',
          icon: <AlertOctagon size={18} className="text-red-600" />
        };
      case 'medium':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-900',
          subText: 'text-amber-700',
          accent: 'text-amber-600',
          badge: 'bg-amber-100 text-amber-700 border-amber-200',
          icon: <AlertTriangle size={18} className="text-amber-600" />
        };
      case 'healthy':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-900',
          subText: 'text-emerald-700',
          accent: 'text-emerald-600',
          badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          icon: <ShieldCheck size={18} className="text-emerald-600" />
        };
      default:
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          text: 'text-slate-900',
          subText: 'text-slate-700',
          accent: 'text-slate-600',
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <Leaf size={18} />
        };
    }
  };

  const styles = diagnosisResult ? getSeverityStyles(diagnosisResult.severity) : null;

  return (
    <div className="space-y-6">
       <div className="mb-8">
        <h2 className="text-3xl font-bold text-emerald-900 flex items-center gap-3">
          <Stethoscope className="text-lime-600" size={36} />
          {t.diagnoseHeader}
        </h2>
        <p className="text-slate-500 mt-2 text-lg max-w-2xl">
          {t.diagnoseSub}
        </p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-md shadow-emerald-900/5 overflow-hidden border border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Left: Upload Section */}
          <div className="p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-200">
            <div className="flex items-center gap-3 mb-8">
               <span className="flex items-center justify-center w-8 h-8 rounded-full bg-lime-100 text-lime-700 font-bold text-sm border border-lime-200">1</span>
               <h3 className="text-xl font-bold text-slate-800">{t.uploadSpecimen}</h3>
            </div>
            
            <FileUpload 
              label="Upload Leaf Close-up" 
              onFileSelect={handleFileSelect}
            />

            <div className="mt-8 bg-slate-50 rounded-xl p-4 text-sm text-slate-600 border border-slate-200">
              <p className="font-semibold mb-2 text-slate-800">Tips for accuracy:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ensure the leaf is flat and well-lit.</li>
                <li>Avoid blurry images.</li>
                <li>Include healthy tissue for contrast if possible.</li>
              </ul>
            </div>
          </div>

          {/* Right: Diagnosis Placeholder/Results */}
          <div className="p-8 lg:p-12 bg-slate-50/50 flex flex-col justify-center relative min-h-[500px]">
             <div className="absolute top-6 right-6">
                <Activity className="text-slate-400" size={24} />
             </div>

             <div className="flex items-center gap-3 mb-8">
               <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold text-sm">2</span>
               <h3 className="text-xl font-bold text-slate-800">{t.aiDiagnosis}</h3>
            </div>

            {/* Content Switcher */}
            <div className="flex-1 flex flex-col items-center justify-center">
               
               {!hasFile && !diagnosisResult && (
                  <div className="text-center py-10">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 mb-4 mx-auto">
                      <Stethoscope className="text-slate-400" size={40} />
                    </div>
                    <h4 className="text-lg font-medium text-slate-700">{t.waitingInput}</h4>
                    <p className="text-slate-500 max-w-xs mt-2 mx-auto">Upload an image on the left to start the diagnostic process.</p>
                  </div>
               )}

               {hasFile && !diagnosisResult && (
                  <div className="w-full">
                     <div className="opacity-40 pointer-events-none filter blur-[1px] select-none mb-6">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <div className="h-4 w-3/4 bg-slate-200 rounded mb-2"></div>
                          <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
                        </div>
                     </div>
                     <button 
                        onClick={handleDiagnose}
                        disabled={diagnosing}
                        className="w-full py-4 bg-lime-600 hover:bg-lime-700 text-white rounded-xl font-bold shadow-lg shadow-lime-500/20 transition-all flex items-center justify-center gap-2"
                     >
                        {diagnosing ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            {t.analyzingLeaf}
                          </>
                        ) : (
                          t.diagnoseSpecimen
                        )}
                     </button>
                  </div>
               )}

               {diagnosisResult && styles && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full"
                  >
                     <div className={`${styles.bg} p-6 rounded-2xl border ${styles.border} shadow-sm mb-6 relative overflow-hidden`}>
                       <div className={`absolute top-0 left-0 w-1 h-full ${styles.text.replace('text', 'bg').replace('900', '500')}`}></div>
                       
                       <div className="flex justify-between items-start mb-4">
                         <div>
                           <h4 className={`text-xl font-bold ${styles.text}`}>{diagnosisResult.diseaseName}</h4>
                           <p className={`text-sm ${styles.subText}`}>{diagnosisResult.pathogen}</p>
                         </div>
                         <span className={`${styles.badge} text-xs font-bold px-3 py-1 rounded-full border`}>
                           {Math.round(diagnosisResult.confidence * 100)}% {t.confidence}
                         </span>
                       </div>
                       
                       <p className={`text-sm mb-4 ${styles.subText} italic`}>"{diagnosisResult.description}"</p>

                       <div className="space-y-4">
                          <div className={`p-3 bg-white/50 rounded-lg border ${styles.border} text-sm ${styles.text} flex gap-3`}>
                             <div className="shrink-0 pt-0.5">{styles.icon}</div>
                             <p className="font-medium">
                               {diagnosisResult.severity === 'healthy' 
                                 ? 'Plant appears healthy. No action needed.' 
                                 : t.immediateAction}
                             </p>
                          </div>
                          
                          <div>
                             <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.recommendedTreatment}</p>
                             <ul className="text-sm text-slate-700 space-y-2">
                               {diagnosisResult.treatments.map((treatment, idx) => (
                                 <li key={idx} className="flex items-start gap-2">
                                   <CheckCircle2 size={16} className={`${styles.accent} shrink-0 mt-0.5`} />
                                   <span>{treatment}</span>
                                 </li>
                               ))}
                             </ul>
                          </div>
                       </div>
                     </div>

                     <button 
                        onClick={() => {
                          setHasFile(false);
                          setDiagnosisResult(null);
                        }}
                        className="w-full py-3 border border-slate-300 text-slate-600 rounded-xl font-semibold hover:bg-white transition-colors"
                     >
                        {t.reset}
                     </button>
                  </motion.div>
               )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};