let visionPipeline: any = null;

export async function initializeAIModules() {
  if (visionPipeline) return true;

  try {
    const transformersModule = await new Function(
      "return import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0-alpha.19')"
    )();

    const { pipeline, env } = transformersModule;
    env.allowLocalModels = false;

    if (!visionPipeline) {
      visionPipeline = await pipeline('image-classification', 'Xenova/vit-base-patch16-224');
    }

    return true;
  } catch (error) {
    console.error("Failed to load local ONNX vision module:", error);
    return null;
  }
}

export async function analyzeImageThreatsLocally(imageUriOrBase64: string) {
  const ready = await initializeAIModules();
  if (!ready) return null;

  const visionOutputs = await visionPipeline(imageUriOrBase64);
  if (!visionOutputs || visionOutputs.length === 0) return null;

  // Extract labels and scores cleanly
  const detectedItems = visionOutputs.map((item: any) => item.label.toLowerCase());
  const primaryLabelClean = visionOutputs[0].label.toLowerCase();
  const primaryLabelUpper = visionOutputs[0].label.toUpperCase();
  const primaryScore = Math.round(visionOutputs[0].score * 100);

  // Broaden core evaluation parameters to capture all peripheral computing components
  const hostileIndicators = [
    'device', 'screen', 'keyboard', 'wire', 'electronics', 'computer', 
    'components', 'laptop', 'web site', 'website', 'site', 'monitor', 
    'mouse', 'modem', 'cabling', 'hardware'
  ];
  
  const isSuspicious = hostileIndicators.some((ind: string) => 
    detectedItems.some((item: string) => item.includes(ind))
  );

  let privacyExplanation = "SHIELD CLEAR: No vulnerable digital vectors or exposed hardware endpoints identified within the media boundary.";

  if (isSuspicious) {
    // Dynamic Evaluation: Route based on the HIGHEST confidence item first to ensure varied responses
    if (primaryLabelClean.includes('site') || primaryLabelClean.includes('web') || primaryLabelClean.includes('screen') || primaryLabelClean.includes('monitor')) {
      privacyExplanation = `CRITICAL EXPOSURE ALERT: The top-detected feature "${primaryLabelUpper}" indicates exposed user interface fields or active monitor configurations. This introduces high-risk vectors for automated visual scraping bots to harvest active session tokens or personal account details directly from the layout.`;
      
    } else if (primaryLabelClean.includes('keyboard') || primaryLabelClean.includes('laptop') || primaryLabelClean.includes('computer') || primaryLabelClean.includes('mouse')) {
      privacyExplanation = `PERIPHERAL EXPOSURE RISK: Primary physical input asset "${primaryLabelUpper}" is highly visible. High-resolution media exposure of input surfaces opens vulnerabilities to optical side-channel tracking algorithms, which can potentially map hand kinematics to reconstruct active keystrokes.`;
      
    } else if (primaryLabelClean.includes('wire') || primaryLabelClean.includes('cabling') || primaryLabelClean.includes('electronics') || primaryLabelClean.includes('components') || primaryLabelClean.includes('hardware')) {
      privacyExplanation = `HARDWARE DIAGNOSTIC ALERT: Detected engineering assembly layout ("${primaryLabelUpper}"). Exposing active physical debug interfaces, unshielded loops, or terminal configurations provides attackers with system hardware topology blueprints, inviting side-channel exploitation planning.`;
      
    } else {
      // Fallback fallback if secondary items triggered suspicion but primary item is distinct
      privacyExplanation = `WORKSPACE THREAT SCANNED: Active secondary computing framework assets (${primaryLabelUpper}) detected in immediate view. Publishing these asset footprints increases vulnerability vectors to targeted social engineering profiling and localized hardware device fingerprint tracking.`;
    }
  }

  return {
    status: isSuspicious ? 'RISK ALERT: SUSPICIOUS VISUAL STRUCTURE' : 'SHIELD CLEAR: SECURE ASSET',
    label: primaryLabelUpper,
    score: primaryScore,
    explanation: privacyExplanation
  };
}