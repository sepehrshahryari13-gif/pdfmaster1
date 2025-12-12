import React from 'react';
import { Shield, Lock, Server, FileX, Info } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <div className="text-center space-y-4 pt-4">
        <h1 className="text-4xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="text-lg text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="text-blue-600" />
            General Overview
          </h2>
          <p className="text-slate-600 leading-relaxed">
            We are committed to protecting your privacy. This application "PDF Master" is designed with a "Privacy First" architecture. 
            Unlike traditional online PDF tools, we do not upload your files to any server for processing.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
           <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
             <Server className="text-green-600 mb-3" size={32} />
             <h3 className="font-bold text-slate-900 mb-2">No Server Uploads</h3>
             <p className="text-slate-600 text-sm">
               Your files are processed strictly within your web browser using WebAssembly technology. We do not have backend servers that see, read, or store your documents.
             </p>
           </div>
           <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
             <FileX className="text-purple-600 mb-3" size={32} />
             <h3 className="font-bold text-slate-900 mb-2">Data Retention</h3>
             <p className="text-slate-600 text-sm">
               Since we never receive your files, we cannot retain them. Once you close the browser tab, all processed data in memory is immediately cleared from your device.
             </p>
           </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Lock className="text-blue-600" />
            Cookie Policy
          </h2>
          <p className="text-slate-600 leading-relaxed">
            We do not use tracking cookies, advertising cookies, or third-party analytics. 
            We may use browser "Local Storage" strictly to remember your UI preferences (such as dismissing the privacy banner). 
            This data is not shared with anyone.
          </p>
        </section>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Info className="text-blue-600" />
            GDPR Rights
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Under the General Data Protection Regulation (GDPR), you have the right to access, rectify, or erase personal data. 
            However, because <strong>we do not collect any personal data or files</strong>, there is effectively nothing for us to erase or provide. 
            You maintain full control and ownership of your data at all times on your local device.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;