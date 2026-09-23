import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CameraUpload } from './components/CameraUpload';
import { ImagePreview } from './components/ImagePreview';
import { SearchInput } from './components/SearchInput';
import { QuickTags } from './components/QuickTags';
import { AnalyzeButton } from './components/AnalyzeButton';
import { SearchProgress } from './components/SearchProgress';
import { MaterialResults } from './components/MaterialResults';
import { MaterialImportModal } from './components/MaterialImportModal';
import { PrivacyNotice } from './components/PrivacyNotice';

import {
  NormalizedSearchFeatures,
  MaterialSearchResult,
  SearchStep,
} from './types/search';
import { materialRepository } from './services/materialRepository';
import { materialSearchService } from './services/materialSearchService';
import { analyzeMaterialWithAI } from './services/geminiService';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // Input states
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{
    width: number;
    height: number;
    originalSize: number;
    compressedSize: number;
  } | null>(null);
  const [naturalLanguage, setNaturalLanguage] = useState<string>('');
  const [selectedQuickTags, setSelectedQuickTags] = useState<string[]>([]);

  // Search & Progress states
  const [searchStep, setSearchStep] = useState<SearchStep>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisFeatures, setAnalysisFeatures] =
    useState<NormalizedSearchFeatures | null>(null);
  const [searchResults, setSearchResults] = useState<
    MaterialSearchResult[] | null
  >(null);

  // Material Library count & Admin Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [materialCount, setMaterialCount] = useState<number>(() =>
    materialRepository.getAllMaterials().length
  );

  useEffect(() => {
    const unsubscribe = materialRepository.subscribe(() => {
      setMaterialCount(materialRepository.getAllMaterials().length);
    });
    return unsubscribe;
  }, []);

  const handleImageSelected = (
    dataUrl: string,
    info: {
      width: number;
      height: number;
      originalSize: number;
      compressedSize: number;
    }
  ) => {
    setImageDataUrl(dataUrl);
    setImageInfo(info);
    setErrorMessage(null);
  };

  const handleImageDelete = () => {
    setImageDataUrl(null);
    setImageInfo(null);
  };

  const handleRetake = (newDataUrl: string) => {
    setImageDataUrl(newDataUrl);
    setErrorMessage(null);
  };

  const handleToggleQuickTag = (tag: string) => {
    setSelectedQuickTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearQuickTags = () => {
    setSelectedQuickTags([]);
  };

  // Sleep utility for stepped loading experience
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const handleStartSearch = async () => {
    if (!imageDataUrl && !naturalLanguage.trim() && selectedQuickTags.length === 0) {
      setErrorMessage('請至少拍照、上傳圖片，或輸入文字需求 / 選取標籤。');
      return;
    }

    setErrorMessage(null);
    setSearchResults(null);
    setSearchStep('analyzing_image');

    try {
      // 1. Stage: Analyzing image & user requirements with Gemini
      const features = await analyzeMaterialWithAI(
        imageDataUrl,
        naturalLanguage,
        selectedQuickTags
      );

      // 2. Stage: Understanding material features
      setSearchStep('extracting_features');
      await delay(400);

      // 3. Stage: Querying Paiho library
      setSearchStep('searching_library');
      await delay(400);
      const allMaterials = materialRepository.getAllMaterials();

      // 4. Stage: Calculating similarity with hybrid weighting
      setSearchStep('calculating_similarity');
      await delay(400);
      const rankedResults = materialSearchService.rankMaterials(
        allMaterials,
        features,
        naturalLanguage,
        selectedQuickTags
      );

      // 5. Stage: Compiling top results
      setSearchStep('compiling_results');
      await delay(350);

      setAnalysisFeatures(features);
      setSearchResults(rankedResults);
      setSearchStep('completed');
    } catch (err: any) {
      console.error('Search error:', err);
      setErrorMessage(
        err?.message || '搜尋時發生問題，請確認網路連線或稍後再試。'
      );
      setSearchStep('error');
    }
  };

  const handleReSearchWithModifiedFeatures = (
    modifiedFeatures: NormalizedSearchFeatures
  ) => {
    const allMaterials = materialRepository.getAllMaterials();
    const rankedResults = materialSearchService.rankMaterials(
      allMaterials,
      modifiedFeatures,
      naturalLanguage,
      selectedQuickTags
    );
    setAnalysisFeatures(modifiedFeatures);
    setSearchResults(rankedResults);
  };

  const handleResetSearch = () => {
    setSearchResults(null);
    setAnalysisFeatures(null);
    setSearchStep('idle');
    setErrorMessage(null);
  };

  const isSearchDisabled =
    !imageDataUrl &&
    !naturalLanguage.trim() &&
    selectedQuickTags.length === 0;

  const isLoading =
    searchStep !== 'idle' &&
    searchStep !== 'completed' &&
    searchStep !== 'error';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* App Header */}
      <Header
        onOpenImport={() => setIsImportModalOpen(true)}
        materialCount={materialCount}
      />

      {/* Main Container: Mobile First single column */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 space-y-5">
        {/* Error Alert Message */}
        {errorMessage && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-900 flex items-start space-x-3 shadow-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-sm text-red-900">搜尋遭遇問題</h4>
              <p className="mt-0.5 text-red-800">{errorMessage}</p>
              <button
                type="button"
                onClick={handleStartSearch}
                className="mt-2 inline-flex items-center space-x-1 font-bold text-red-700 hover:text-red-900 underline"
              >
                <RefreshCw className="w-3 h-3" />
                <span>再試一次</span>
              </button>
            </div>
          </div>
        )}

        {/* View Mode 1: Search Form Inputs (Shown when idle or searching or error) */}
        {!searchResults && (
          <div className="space-y-4">
            {/* Step 1: Camera & Image Upload */}
            {!imageDataUrl ? (
              <CameraUpload
                onImageSelected={handleImageSelected}
                onError={(err) => setErrorMessage(err)}
                isLoading={isLoading}
              />
            ) : (
              <ImagePreview
                imageUrl={imageDataUrl}
                onRetake={handleRetake}
                onDelete={handleImageDelete}
                info={imageInfo}
                disabled={isLoading}
              />
            )}

            {/* Step 2: Natural Language Input */}
            <SearchInput
              value={naturalLanguage}
              onChange={setNaturalLanguage}
              disabled={isLoading}
            />

            {/* Step 3: Quick Tags */}
            <QuickTags
              selectedTags={selectedQuickTags}
              onToggleTag={handleToggleQuickTag}
              onClearTags={handleClearQuickTags}
              disabled={isLoading}
            />

            {/* Step 4: Search Progress or Submit CTA */}
            {isLoading ? (
              <SearchProgress currentStep={searchStep} />
            ) : (
              <AnalyzeButton
                onClick={handleStartSearch}
                isLoading={isLoading}
                disabled={isSearchDisabled}
                hasImage={Boolean(imageDataUrl)}
              />
            )}
          </div>
        )}

        {/* View Mode 2: Search Results View (Top 5 matches, refinement, official link) */}
        {searchResults && analysisFeatures && (
          <MaterialResults
            results={searchResults}
            features={analysisFeatures}
            userQuery={naturalLanguage}
            quickTags={selectedQuickTags}
            onReSearchWithModifiedFeatures={handleReSearchWithModifiedFeatures}
            onResetSearch={handleResetSearch}
          />
        )}
      </main>

      {/* Privacy Notice & Footer */}
      <PrivacyNotice />

      {/* Admin / Dev Material Import Modal */}
      <MaterialImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onMaterialCountChange={() =>
          setMaterialCount(materialRepository.getAllMaterials().length)
        }
      />
    </div>
  );
}
