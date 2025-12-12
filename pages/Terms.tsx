import React from 'react';
import { ScrollText, AlertCircle, Scale, Gavel, CheckCircle2 } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <div className="text-center space-y-4 pt-4">
        <h1 className="text-4xl font-bold text-slate-900">Terms of Use</h1>
        <p className="text-lg text-slate-500">Effective Date: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8">
        
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ScrollText className="text-blue-600" />
            1. Acceptance of Terms
          </h2>
          <p className="text-slate-600 leading-relaxed">
            By accessing and using PDF Master ("the Service"), you agree to accept and comply with these Terms of Use. 
            If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="text-blue-600" />
            2. Service Description & Privacy
          </h2>
          <p className="text-slate-600 leading-relaxed">
            PDF Master provides web-based tools for manipulating PDF documents (merging, splitting, compressing, etc.). 
            <br/><br/>
            <strong>Client-Side Processing:</strong> We distinguish ourselves by prioritizing privacy. All file processing is performed locally within your web browser using WebAssembly technology. 
            We do not upload, store, or view your files on our servers. You retain full ownership and control of your data at all times.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Scale className="text-blue-600" />
            3. Usage & Conduct
          </h2>
          <div className="text-slate-600 leading-relaxed space-y-2">
            <p>You agree to use the Service only for lawful purposes. You are strictly prohibited from using the Service to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Process illegal content or documents.</li>
              <li>Attempt to bypass security features or reverse engineer the application.</li>
              <li>Infringe upon the intellectual property rights of others.</li>
            </ul>
          </div>
        </section>

        <section className="bg-slate-50 p-6 rounded-xl border border-slate-100">
           <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
             <AlertCircle className="text-orange-600" />
             4. Disclaimer of Warranties
           </h2>
           <p className="text-slate-600 text-sm leading-relaxed">
             The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied. 
             While we strive for accuracy and reliability, we do not guarantee that the tools will meet your specific requirements, be error-free, or compatible with all file types. 
             <strong>You are responsible for backing up your original documents before using the Service.</strong>
           </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Gavel className="text-blue-600" />
            5. Limitation of Liability
          </h2>
          <p className="text-slate-600 leading-relaxed">
            To the fullest extent permitted by law, PDF Master shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from your use of or inability to use the Service, including but not limited to damages for loss of data, profits, or other intangible losses.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">
            6. Modifications
          </h2>
          <p className="text-slate-600 leading-relaxed">
            We reserve the right to modify these terms at any time. Continued use of the Service after any such changes constitutes your acceptance of the new Terms of Use.
          </p>
        </section>

      </div>
    </div>
  );
};

export default Terms;