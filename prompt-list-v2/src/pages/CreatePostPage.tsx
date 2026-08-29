import React, { useState, useRef } from 'react';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import styles from './CreatePostPage.module.css';
import { useAuth } from '@/context/AuthContext';
import { moderateText, moderateSingleImage, generateLiveEmbedding, analyzeArtworkMultimodalWithGemini } from '@/lib/ai';
import { sendNotification } from '@/lib/notifications';
import { doc, setDoc, serverTimestamp, collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Loader2, Image as ImageIcon, Trash2, ShieldAlert, AlertTriangle, Info, PlusCircle, ChevronDown, Box, X } from 'lucide-react';
import { extractImagePalette } from '@/lib/colorAnalyzer';
import { toast } from 'react-hot-toast';
import TipTapEditor from '@/components/TipTapEditor';
import { useNavigate } from 'react-router-dom';

interface SelectedFile {
  file: File;
  previewUrl: string;
  base64?: string;
}

const calculateFileHash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export default function CreatePostPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prompts, setPrompts] = useState<string[]>(['']);
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [model, setModel] = useState('Midjourney');
  const [customModel, setCustomModel] = useState('');
  const [monetizationType, setMonetizationType] = useState<'free'|'subscribers_only'|'charge'>('free');
  const [price, setPrice] = useState('1.99');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [wasFlagged] = useState(false);
  
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [moderationError, setModerationError] = useState<string | null>(null);


  const getCompressedBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      img.onload = () => {
        URL.revokeObjectURL(url);
        const maxDim = 1024;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } else {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`Failed to read photo: ${file.name}`));
      };
    });
  };

  const compressImageForStorage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      img.onload = () => {
        URL.revokeObjectURL(url);
        const maxDim = 1600;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            blob => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas toBlob failed'));
            },
            'image/webp',
            0.85
          );
        } else {
          resolve(file);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for storage compression'));
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setModerationError(null);
    const files = Array.from(e.target.files);
    
    const maxFiles = 5 - selectedFiles.length;
    const filesToProcess = files.slice(0, maxFiles);
    
    const newSelected: SelectedFile[] = [];
    
    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) {
        setModerationError('Only image files are allowed.');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setModerationError('One or more images exceed the 10MB limit.');
        continue;
      }
      
      const previewUrl = URL.createObjectURL(file);
      newSelected.push({ file, previewUrl });
    }
    
    if (newSelected.length > 0) {
      setSelectedFiles(prev => [...prev, ...newSelected]);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[indexToRemove].previewUrl);
      updated.splice(indexToRemove, 1);
      return updated;
    });
  };

  const getImageDimensions = (file: File): Promise<{width: number, height: number, ratio: number}> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.width,
          height: img.height,
          ratio: img.width / img.height
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ width: 1, height: 1, ratio: 1 });
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    
    if (title.length > 75) {
      setModerationError("Title cannot exceed 75 characters.");
      return;
    }
    const plainTextDescription = description.replace(/(<([^>]+)>)/gi, "");
    if (plainTextDescription.length > 1000) {
      setModerationError("Description cannot exceed 1000 characters.");
      return;
    }
    
    if (prompts.some(p => p.replace(/(<([^>]+)>)/gi, "").length > 30000)) {
      setModerationError("One of your prompt variants exceeds 30000 characters.");
      return;
    }
    
    const plainTextPrompts = prompts.map(p => p.replace(/(<([^>]+)>)/gi, "").trim());
    const emptyVariantIndex = plainTextPrompts.findIndex(p => !p);
    if (emptyVariantIndex !== -1) {
      setModerationError(prompts.length > 1 
        ? `Variant ${emptyVariantIndex + 1} cannot be empty. Please fill it out or remove it.` 
        : "You must provide a prompt.");
      return;
    }

    if (selectedFiles.length === 0) {
      setModerationError('Please upload at least a cover image.');
      return;
    }

    setIsScanning(true);
    setModerationError(null);

    try {
      setStatusText('We are evaluating your creation');
      
      const fileHash = await calculateFileHash(selectedFiles[0].file);
      const duplicateQuery = query(collection(db, 'posts'), where('imageHash', '==', fileHash), limit(1));
      const duplicateSnap = await getDocs(duplicateQuery);
      if (!duplicateSnap.empty) {
        throw new Error("This exact image has already been published on the platform.");
      }

      const textAnalysis = await moderateText(`${title}\n${description}\n${prompts.join('\n')}\n${model === 'Other' ? customModel : ''}`);
      if (!textAnalysis.approved) {
        throw new Error(`Content blocked: ${textAnalysis.reason}. Your account has been flagged.`);
      }

      setStatusText('We are evaluating your creation');
      const coverBase64 = await getCompressedBase64(selectedFiles[0].file);
      
      const imageAnalysis = await moderateSingleImage(coverBase64, 1);
      if (!imageAnalysis.approved) {
        throw new Error(`Image blocked: ${imageAnalysis.reason}. Account flagged.`);
      }

      setStatusText('We are processing it right now');
      
      let aiResult;
      try {
        aiResult = await analyzeArtworkMultimodalWithGemini(coverBase64);
      } catch (aiErr: any) {
        console.warn("AI analysis failed, using fallback categorization:", aiErr);
        
        const fallbackPalette = await extractImagePalette(coverBase64);
        
        aiResult = {
          tags: ['Digital Art', 'AI Generated', model],
          colorProfile: fallbackPalette
        };
      }
      
      setStatusText('We are processing it right now');
      let embedding: number[] = [];
      try {
        const textToEmbed = `${title}. ${description.replace(/(<([^>]+)>)/gi, "")}. ${aiResult.tags.join(" ")}. ${prompts[0].replace(/(<([^>]+)>)/gi, "").substring(0, 1000)}`;
        embedding = await generateLiveEmbedding(textToEmbed);
      } catch (embedErr) {
        console.error("Failed to generate embeddings:", embedErr);
        embedding = []; 
      }

      setStatusText('We are processing it right now');
      
      const imageUrls: string[] = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const fileObj = selectedFiles[i];
        
        const ext = fileObj.file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const isWebpOptimized = ext === 'webp' || ext === 'jpg' || ext === 'jpeg' || ext === 'png';
        
        let finalBlob: Blob;
        let finalExt = 'webp';
        
        if (isWebpOptimized) {
          finalBlob = await compressImageForStorage(fileObj.file);
        } else {
          finalBlob = fileObj.file;
          finalExt = ext;
        }

        const path = `posts/${user.uid}/${Date.now()}_${i}.${finalExt}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, finalBlob);
        const url = await getDownloadURL(storageRef);
        imageUrls.push(url);
      }

      const dimensions = await getImageDimensions(selectedFiles[0].file);
      let calculatedAspectRatio = 'Square';
      if (dimensions.ratio > 1.1) {
        calculatedAspectRatio = 'Landscape';
      } else if (dimensions.ratio < 0.9) {
        calculatedAspectRatio = 'Portrait';
      }

      setStatusText('Placing it on the feed');
      
      
      const newPostRef = doc(collection(db, 'posts'));
      
      let whopPlanId: string | null = null;
      if (monetizationType === 'charge') {
        const pVal = parseFloat(price) || 0;
        if (pVal < 1 || pVal > 50) {
          setModerationError('Price must be between $1.00 and $50.00 for pay-to-unlock posts.');
          setIsScanning(false);
          return;
        }
        try {
            const whopRes = await fetch('/api/whop/create-checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: title,
                price: pVal,
                promptId: newPostRef.id,
                userId: user.uid
              })
            });
            const whopData = await whopRes.json();
            if (whopData.success && whopData.checkoutId) {
              whopPlanId = whopData.checkoutId;
            } else {
              throw new Error(whopData.error || whopData.reason || 'Failed to create checkout configuration');
            }
          } catch (err: any) {
            setModerationError("Payment Gateway Error: " + err.message);
            setIsScanning(false);
            return;
          }
      }

      
      const isSecure = monetizationType !== 'free';
      const isCharge = monetizationType === 'charge';
      const postPayload = {
        id: newPostRef.id,
        creatorId: user.uid,
        creatorDisplayName: profile.displayName || user.displayName || 'Anonymous Creator',
        creatorUsername: profile.username || 'unknown',
        creatorAvatarUrl: profile.avatarUrl || user.photoURL || '',
        
        title,
        description,
        promptText: isSecure ? "" : prompts[0],
        prompts: isSecure ? [] : prompts,
        // Non-secret metadata so locked posts can advertise their variant count
        variantCount: plainTextPrompts.filter(Boolean).length || 1,
        model: model === 'Other' ? customModel.trim() || 'Unknown' : model,
        monetizationType,
        whopPlanId: whopPlanId || null,
          price: isCharge ? parseFloat(price) || 0 : 0,
        
        imageUrls: imageUrls,
        imageHash: fileHash,
        aspectRatio: calculatedAspectRatio,
        
        categories: aiResult.tags || [],
        styleTag: 'Digital',
        theme: 'Artwork',
        
        colorProfile: aiResult.colorProfile || null,
        
        embedding,
        
        likesCount: 0,
        savesCount: 0,
        viewsCount: 0,
        copiesCount: 0,
        
        isFlagged: wasFlagged || false,
        createdAt: serverTimestamp(),
      };

      await setDoc(newPostRef, postPayload);
      
      // Protected tiers (Paid + Subscriber Only) keep real prompts in the secure subcollection
      if (isSecure) {
        const secureRef = doc(collection(db, 'posts', newPostRef.id, 'secure_content'), 'data');
        await setDoc(secureRef, {
          promptText: prompts[0],
          prompts: prompts
        });
      }


      // Notification logic
      try {
        const followsQuery = query(collection(db, 'follows'), orderBy('timestamp', 'desc'), limit(500));
        const followsSnap = await getDocs(followsQuery);
        const followers: string[] = [];
        followsSnap.forEach(docSnap => {
          const data = docSnap.data();
          if (data.followingId === user.uid) {
            followers.push(data.followerId);
          }
        });

        const promises = followers.map(followerId => 
          sendNotification(
            followerId,
            'New Creation Alert',
            `@${profile.username} dropped a new ${model} prompt: ${title}`,
            'system'
          )
        );
        await Promise.all(promises);
      } catch (e) {
        console.error("Failed to fan-out notifications:", e);
      }

      toast.success('Post successfully uploaded!');
      navigate('/?tab=newest');

    } catch (err: any) {
      console.error(err);
      setModerationError(err.message || 'An unexpected error occurred during creation.');
    } finally {
      setIsScanning(false);
    }
  };

  const getCharLimitWarning = (current: number, max: number) => {
    const threshold = max * 0.8;
    if (current >= threshold) {
      return (
        <span className={`${styles.charLimit} ${current > max ? styles.danger : ''}`}>
          {current} / {max} characters {current > max ? '(Limit Exceeded)' : ''}
        </span>
      );
    }
    return null;
  };

  if (!user) {
    return (
      <div className={styles.pageContainer} style={{ justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className={styles.authPrompt}>
          <ShieldAlert size={48} className={styles.warnIcon} />
          <h3>Authentication Required</h3>
          <p>You must be signed in with a creator profile to access the Creation Engine and share your generative prompts.</p>
          <GoogleSignInButton text="Authenticate with Google" />
        </div>
      </div>
    );
  }



  return (
    <div className={styles.pageContainer}>

      {moderationError && (
        <div className={`${styles.alertBar} ${styles.error}`}>
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{moderationError}</span>
        </div>
      )}
      
      {wasFlagged && !moderationError && (
        <div className={`${styles.alertBar} ${styles.error}`} style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: '#f59e0b', color: '#f59e0b' }}>
          <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>Your content was flagged for review but has been published provisionally. It may be hidden from discovery feeds pending manual review.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.twoColumnLayout}>
        
        <div className={styles.leftColumn}>
          {/* Main Cover Image */}
          <div 
            className={`${styles.mainDropzone} ${selectedFiles[0] ? styles.hasImage : ''}`}
            onClick={() => !selectedFiles[0] && fileInputRef.current?.click()}
          >
            {selectedFiles[0] ? (
              <>
                <img src={selectedFiles[0].previewUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.5rem', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" className={styles.removeBtn} onClick={(e) => { e.stopPropagation(); handleRemoveFile(0); }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <ImageIcon size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>UPLOAD COVER IMAGE</span>
              </>
            )}
          </div>

          {/* Sub Images */}
          <div className={styles.thumbnailGrid}>
            {[1, 2, 3, 4].map(idx => {
              const item = selectedFiles[idx];
              return (
                <div 
                  key={idx}
                  className={`${styles.subDropzone} ${item ? styles.hasImage : ''}`}
                  onClick={() => !item && fileInputRef.current?.click()}
                >
                  {item ? (
                    <>
                      <img src={item.previewUrl} alt={`Sub ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.25rem', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="button" className={styles.removeBtn} onClick={(e) => { e.stopPropagation(); handleRemoveFile(idx); }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <PlusCircle size={20} style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
              );
            })}
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="image/*" 
            multiple 
            style={{ display: 'none' }}
            disabled={selectedFiles.length >= 5 || isScanning}
          />
        
            <div style={{ marginTop: "1.5rem" }}>
              <div className={styles.fieldGroup} style={{ margin: 0 }}>
            <label>Description <span className={styles.optionalText}>(optional)</span></label>
            <TipTapEditor 
              content={description}
              onChange={setDescription}
            />
            {getCharLimitWarning(description.replace(/(<([^>]+)>)/gi, "").length, 1000)}
          </div>
            </div>

        </div>

        <div className={styles.rightColumn}>
          
          <div className={styles.fieldGroup}>
            <label>Title</label>
            <input 
              type="text" 
              className={styles.plainInput}
              placeholder="Creation Title..."
              value={title}
              maxLength={75}
              onChange={e => setTitle(e.target.value)}
              required
            />
            {getCharLimitWarning(title.length, 75)}
          </div>

          <div className={styles.fieldGroup}>
            <label>Select Model</label>
            <div className={styles.customDropdownContainer}>
              <div 
                className={`${styles.plainInput} ${styles.dropdownHeader}`} 
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              >
                <span>{model}</span>
                <ChevronDown size={16} />
              </div>
              {isModelDropdownOpen && (
                <div className={styles.dropdownList}>
                  {['GPT Image', 'Nano Banana', 'Midjourney', 'Flux', 'Stable Diffusion XL', 'Other'].map(m => (
                    <div 
                      key={m} 
                      className={`${styles.dropdownItem} ${model === m ? styles.active : ''}`}
                      onClick={() => { setModel(m); setIsModelDropdownOpen(false); }}
                    >
                      {m}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {model === 'Other' && (
              <div style={{ marginTop: '0.75rem' }}>
                <input
                  type="text"
                  className={styles.plainInput}
                  placeholder="Enter model name..."
                  value={customModel}
                  maxLength={17}
                  onChange={e => setCustomModel(e.target.value)}
                />
                {getCharLimitWarning(customModel.length, 17)}
              </div>
            )}
          </div>

          

          <div className={styles.fieldGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ margin: 0 }}>Prompt Variants <span className={styles.optionalText}>({prompts.length}/5)</span></label>
              {prompts.length < 5 && (
                <button 
                  type="button" 
                  onClick={() => { setPrompts([...prompts, '']); setActivePromptIndex(prompts.length); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border-color)', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                >
                  <PlusCircle size={12} /> Add Variant
                </button>
              )}
            </div>
            
            {prompts.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                {prompts.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePromptIndex(idx)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: activePromptIndex === idx ? 600 : 400,
                      color: activePromptIndex === idx ? 'var(--text-primary)' : 'var(--text-secondary)',
                      border: `1px solid ${activePromptIndex === idx ? 'var(--text-primary)' : 'var(--border-color)'}`,
                      background: activePromptIndex === idx ? 'rgba(255,255,255,0.05)' : 'transparent',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    Variant {idx + 1}
                    <X 
                      size={12} 
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        const newPrompts = prompts.filter((_, i) => i !== idx);
                        setPrompts(newPrompts);
                        if (activePromptIndex === idx) {
                          setActivePromptIndex(Math.max(0, idx - 1));
                        } else if (activePromptIndex > idx) {
                          setActivePromptIndex(activePromptIndex - 1);
                        }
                      }}
                      style={{ opacity: 0.6, cursor: 'pointer' }}
                      onMouseEnter={(e: React.MouseEvent<SVGSVGElement>) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e: React.MouseEvent<SVGSVGElement>) => (e.currentTarget.style.opacity = '0.6')}
                    />
                  </button>
                ))}
              </div>
            )}

            <TipTapEditor 
              content={prompts[activePromptIndex]}
              onChange={(content) => {
                const newPrompts = [...prompts];
                newPrompts[activePromptIndex] = content;
                setPrompts(newPrompts);
              }}
              tall={true}
            />
            {getCharLimitWarning(prompts[activePromptIndex].replace(/(<([^>]+)>)/gi, "").length, 15000)}
          </div>

          
          <div className={styles.fieldGroup} style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <label style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Monetization Options</label>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div 
                style={{ flex: 1, minWidth: '140px', padding: '1rem', border: `2px solid ${monetizationType === 'free' ? '#3b82f6' : 'var(--border-color)'}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: monetizationType === 'free' ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}
                onClick={() => setMonetizationType('free')}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Free</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Anyone can view your prompt</div>
              </div>
              <div 
                style={{ flex: 1, minWidth: '140px', padding: '1rem', border: `2px solid ${monetizationType === 'subscribers_only' ? '#a855f7' : 'var(--border-color)'}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: monetizationType === 'subscribers_only' ? 'rgba(168, 85, 247, 0.1)' : 'transparent' }}
                onClick={() => setMonetizationType('subscribers_only')}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Subscriber Only</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Included in your Creator Membership</div>
              </div>
              <div 
                style={{ flex: 1, minWidth: '140px', padding: '1rem', border: `2px solid ${monetizationType === 'charge' ? '#10b981' : 'var(--border-color)'}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: monetizationType === 'charge' ? 'rgba(16, 185, 129, 0.1)' : 'transparent' }}
                onClick={() => setMonetizationType('charge')}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Paid One-Time Purchase</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Set a fixed price ($1–$50) per unlock</div>
              </div>
            </div>

            {monetizationType === 'charge' && (
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ marginTop: '0.25rem' }}>
                  <label style={{ fontSize: '0.85rem' }}>Price (USD) — between $1 and $50</label>
                  <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      min="1"
                      max="50"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className={styles.plainInput}
                      style={{ paddingLeft: '2rem' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    You keep 100% of every sale. 0% platform fee.
                  </div>
                </div>
              </div>
            )}
          </div>

          <button type="submit" className={styles.publishBtn} disabled={isScanning || selectedFiles.length === 0}>
            {isScanning ? (
              <>
                <Loader2 size={18} className="spin" />
                Processing...
              </>
            ) : (
              'Publish Creation'
            )}
          </button>
        </div>
      </form>

      {isScanning && (
        <div className={styles.loadingOverlay}>
          <Box size={40} className={styles.boxSpin} style={{ color: 'var(--text-primary)' }} />
          <p style={{ fontWeight: 600, marginTop: '1rem' }}>
            {statusText}<span className={styles.loadingDots}></span>
          </p>
        </div>
      )}
    </div>
  );
}
