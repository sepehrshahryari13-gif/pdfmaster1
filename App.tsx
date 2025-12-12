import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Merge from './pages/Merge';
import ImagesToPdf from './pages/ImagesToPdf';
import Compress from './pages/Compress';
import CompressImage from './pages/CompressImage';
import PdfToImages from './pages/PdfToImages';
import OrganizePdf from './pages/OrganizePdf';
import SplitPdf from './pages/SplitPdf';
import PdfToText from './pages/PdfToText';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { CookieBanner } from './components/CookieBanner';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/merge" element={<Merge />} />
          <Route path="/split-pdf" element={<SplitPdf />} />
          <Route path="/images-to-pdf" element={<ImagesToPdf />} />
          <Route path="/compress" element={<Compress />} />
          <Route path="/compress-image" element={<CompressImage />} />
          <Route path="/pdf-to-images" element={<PdfToImages />} />
          <Route path="/pdf-to-text" element={<PdfToText />} />
          <Route path="/organize-pdf" element={<OrganizePdf />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
        <CookieBanner />
      </Layout>
    </HashRouter>
  );
};

export default App;