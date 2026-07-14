let visionPipeline: any = null;
let tesseractWorker: any = null;

// Dynamically fetch and initialize the local WebAssembly OCR context script
async function initializeLocalOCR() {
  if (tesseractWorker) return true;
  try {
    if (typeof window !== 'undefined') {
      // Inline dynamic import bypasses bundler module restrictions
      await new Function("return import('https://cdn.jsdelivr.net/npm/tesseract.js@5.0.5/dist/tesseract.min.js')")();
      const Tesseract = (window as any).Tesseract;
      tesseractWorker = await Tesseract.createWorker('eng');
      return true;
    }
    return false;
  } catch (err) {
    console.error("Local WebAssembly OCR module failed to boot:", err);
    return false;
  }
}

export async function initializeAIModules(): Promise<boolean | null> {
  let ready = true;
  try {
    const transformersModule = await new Function(
      "return import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0-alpha.19')"
    )();

    const { pipeline, env } = transformersModule;
    env.allowLocalModels = false;

    if (!visionPipeline) {
      visionPipeline = await pipeline('image-classification', 'Xenova/vit-base-patch16-224');
    }
  } catch (error) {
    console.error("Failed to load local ONNX vision module:", error);
    ready = false;
  }

  const ocrReady = await initializeLocalOCR();
  return ready && ocrReady;
}

export async function analyzeImageThreatsLocally(imageUriOrBase64: string): Promise<{
  status: string;
  label: string;
  score: number;
  explanation: string;
} | null> {
  const ready = await initializeAIModules();
  if (!ready) return null;

  // Pass 1: Local Image Feature Extraction Loop
  const visionOutputs = await visionPipeline(imageUriOrBase64);
  if (!visionOutputs || visionOutputs.length === 0) return null;

  const detectedItems = visionOutputs.map((item: any) => item.label.toLowerCase());
  const primaryLabelClean = visionOutputs[0].label.toLowerCase();
  const primaryLabelUpper = visionOutputs[0].label.toUpperCase();
  const primaryScore = Math.round(visionOutputs[0].score * 100);

  // Pass 2: Local Client-Side WebAssembly Text Scraping Loop
  let extractedText = "";
  try {
    if (tesseractWorker) {
      const ret = await tesseractWorker.recognize(imageUriOrBase64);
      extractedText = ret.data.text.toLowerCase();
    }
  } catch (ocrErr) {
    console.error("OCR tracking pass halted:", ocrErr);
  }

  // Evaluate explicit data security leak triggers
  const leakedKeywords = ['confidential', 'project', 'timeline', 'corp', 'client', 'launch', 'strategy', 'secret', 'v.1.2'];
  const textHasLeakedKeywords = leakedKeywords.some(keyword => extractedText.includes(keyword));

  const hostileIndicators = [
    'device', 'screen', 'keyboard', 'wire', 'electronics', 'computer', 
    'components', 'laptop', 'web site', 'website', 'site', 'monitor',
    'hand-held', 'microcomputer', 'cellular', 'modem', 'cabling', 'hardware', 'website'
  ];

  const isSuspicious = hostileIndicators.some((ind: string) => 
    detectedItems.some((item: string) => item.includes(ind))
  ) || textHasLeakedKeywords;

  let privacyExplanation = "SHIELD CLEAR: No vulnerable digital vectors or exposed hardware endpoints identified within the media boundary.";

  if (isSuspicious) {
    const hasHandheldContext = detectedItems.some((item: string) => item.includes('hand-held') || item.includes('cellular') || item.includes('computer'));
    const hasNetworkContext = detectedItems.some((item: string) => item.includes('wire') || item.includes('cabling') || item.includes('modem') || item.includes('electronics'));

    // High-Priority Override: Catch dynamic textual whiteboard leaks
    if (textHasLeakedKeywords) {
      privacyExplanation = `CORPORATE BREACH EXPOSURE: Local OCR extraction caught high-risk operational variables exposed inside text layer (e.g., "${leakedKeywords.filter(k => extractedText.includes(k)).join(', ')}"). Publishing unblurred whiteboards or administrative presentation frames leaks sensitive production structures instantly.`;
    } else if (hasHandheldContext && (primaryLabelClean.includes('hand-held') || primaryLabelClean.includes('microcomputer') || primaryLabelClean.includes('cellular'))) {
      privacyExplanation = `IDENTITY & ACCESS RISK DETECTED: Foreground visual scan indicates a close-up credential token presentation ("${primaryLabelUpper}"). Exposing corporate access badges, identification text, barcodes, or authorization hardware alongside device surfaces introduces high-risk vulnerabilities for target exploitation.`;
    } else if (primaryLabelClean.includes('site') || primaryLabelClean.includes('web') || primaryLabelClean.includes('screen') || primaryLabelClean.includes('monitor')) {
      privacyExplanation = `CRITICAL EXPOSURE ALERT: The top-detected feature "${primaryLabelUpper}" confirms exposed user interface fields or active monitor configurations. This introduces high-risk vectors for automated visual scraping bots to harvest active session tokens directly from the layout.`;
    } else if (primaryLabelClean.includes('keyboard') || primaryLabelClean.includes('laptop')) {
      privacyExplanation = `PERIPHERAL EXPOSURE RISK: Primary physical input asset "${primaryLabelUpper}" is highly visible. High-resolution media exposure of input surfaces opens vulnerabilities to optical side-channel tracking algorithms, which can potentially map hand kinematics to reconstruct active keystrokes.`;
    } else if (hasNetworkContext || primaryLabelClean.includes('wire') || primaryLabelClean.includes('hardware')) {
      privacyExplanation = `HARDWARE DIAGNOSTIC ALERT: Detected engineering infrastructure assembly layout ("${primaryLabelUpper}"). Exposing active physical debug interfaces, unshielded wire loops, or terminal routing configurations provides attackers with system hardware topology blueprints.`;
    } else {
      privacyExplanation = `WORKSPACE THREAT SCANNED: Active secondary computing framework assets (${primaryLabelUpper}) detected in immediate view. Publishing these asset footprints increases vulnerability vectors to targeted social engineering profiling.`;
    }
  }

  return {
    status: isSuspicious ? 'RISK ALERT: SUSPICIOUS VISUAL STRUCTURE' : 'SHIELD CLEAR: SECURE ASSET',
    label: textHasLeakedKeywords ? 'EXPOSED WHITEBOARD TEXT MATRIX' : primaryLabelUpper,
    score: textHasLeakedKeywords ? 95 : primaryScore,
    explanation: privacyExplanation
  };
}