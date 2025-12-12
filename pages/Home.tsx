import React from 'react';
import { Link } from 'react-router-dom';
import { Merge, FileImage, ArrowRight, Minimize2, Image as ImageIcon, Layers, FileOutput, Scissors, FileText } from 'lucide-react';

const ToolCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  colorClass: string;
}> = ({ title, description, icon, to, colorClass }) => (
  <Link to={to} className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
      {/* Fix: cast to ReactElement<any> to allow 'size' prop which is unknown on ReactNode */}
      {React.cloneElement(icon as React.ReactElement<any>, { size: 100 })}
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClass} bg-opacity-10 text-opacity-100`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed mb-4">{description}</p>
    <div className="flex items-center text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all">
      Try now <ArrowRight size={16} className="ml-1" />
    </div>
  </Link>
);

const Home: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-12">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
          All-in-One <span className="text-blue-600">PDF Tools</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
          Merge, split, compress, and convert your PDFs efficiently. 
          Secure, fast, and completely client-side.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ToolCard
          to="/merge"
          title="Merge PDFs"
          description="Combine multiple PDF files into a single document. Drag, drop, reorder."
          icon={<Merge size={24} />}
          colorClass="text-blue-600 bg-blue-600"
        />
        <ToolCard
          to="/split-pdf"
          title="Split PDF"
          description="Separate one PDF into multiple files by ranges or extract all pages."
          icon={<Scissors size={24} />}
          colorClass="text-red-600 bg-red-600"
        />
        <ToolCard
          to="/organize-pdf"
          title="Organize PDF"
          description="Rearrange, rotate, and delete pages from your PDF documents easily."
          icon={<Layers size={24} />}
          colorClass="text-indigo-600 bg-indigo-600"
        />
        <ToolCard
          to="/compress"
          title="Compress PDF"
          description="Reduce the file size of your PDF documents while maintaining quality."
          icon={<Minimize2 size={24} />}
          colorClass="text-orange-600 bg-orange-600"
        />
        <ToolCard
          to="/pdf-to-text"
          title="PDF to Text"
          description="Extract text content from your PDF documents for easy editing."
          icon={<FileText size={24} />}
          colorClass="text-violet-600 bg-violet-600"
        />
         <ToolCard
          to="/pdf-to-images"
          title="PDF to Images"
          description="Convert pages to high-quality JPGs. Download as ZIP."
          icon={<FileOutput size={24} />}
          colorClass="text-teal-600 bg-teal-600"
        />
        <ToolCard
          to="/compress-image"
          title="Compress Images"
          description="Optimize JPG, PNG, and WebP images. High compression."
          icon={<ImageIcon size={24} />}
          colorClass="text-pink-600 bg-pink-600"
        />
        <ToolCard
          to="/images-to-pdf"
          title="Images to PDF"
          description="Convert JPG and PNG images into a professional PDF document."
          icon={<FileImage size={24} />}
          colorClass="text-emerald-600 bg-emerald-600"
        />
      </div>
    </div>
  );
};

export default Home;