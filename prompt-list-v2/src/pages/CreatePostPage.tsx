import React, { useState, useRef, useEffect } from 'react';
import styles from './CreatePostPage.module.css';
import { useAuth } from '@/context/AuthContext';
import { moderateText, moderateSingleImage, generateLiveEmbedding, analyzeArtworkMultimodalWithGemini } from '@/lib/ai';
import { sendNotification } from '@/lib/notifications';
import { doc, setDoc, serverTimestamp, collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { UploadCloud, CheckCircle2, Loader2, Image as ImageIcon, Trash2, ShieldAlert, AlertTriangle, Info, PlusCircle, ChevronDown, Type, Box, AlignLeft, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { extractImagePalette } from '@/lib/colorAnalyzer';

interface SelectedFile {
  file: File;
  previewUrl: string;
  base64?: string;
}

export default function CreatePostPage() {
  const { user, profile, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [promptText, setPromptText] = useState('');
  const [model, setModel] = useState('Midjourney');
  const [customModel, setCustomModel] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [wasFlagged, setWasFlagged] = useState(false);
  
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

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
    if (description.length > 1000) {
      setModerationError("Description cannot exceed 1000 characters.");
      return;
    }
    if (promptText.length > 30000) {
      setModerationError("Prompt cannot exceed 30000 characters.");
      return;
    }

    if (selectedFiles.length === 0) {
      setModerationError('Please upload at least a cover image.');
      return;
    }

    setIsScanning(true);
    setModerationError(null);

    try {
      setStatusText('We are evaluating your creation...');
      const textAnalysis = await moderateText(`${title}\n${description}\n${promptText}\n${model === 'Other' ? customModel : ''}`);
      if (!textAnalysis.approved) {
        throw new Error(`Content blocked: ${textAnalysis.reason}. Your account has been flagged.`);
      }

      setStatusText('We are evaluating your creation...');
      const coverBase64 = await getCompressedBase64(selectedFiles[0].file);
      
      const imageAnalysis = await moderateSingleImage(coverBase64, 1);
      if (!imageAnalysis.approved) {
        throw new Error(`Image blocked: ${imageAnalysis.reason}. Account flagged.`);
      }

      setStatusText('We are processing it right now...');
      
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
      
      setStatusText('We are processing it right now...');
      let embedding: number[] = [];
      try {
        const textToEmbed = `${title}. ${description}. ${aiResult.tags.join(" ")}. ${promptText.substring(0, 1000)}`;
        embedding = await generateLiveEmbedding(textToEmbed);
      } catch (embedErr) {
        console.error("Failed to generate embeddings:", embedErr);
        embedding = []; 
      }

      setStatusText('We are processing it right now...');
      
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

      setStatusText('Placing it on the feed...');
      
      const newPostRef = doc(collection(db, 'posts'));
      
      const postPayload = {
        id: newPostRef.id,
        creatorId: user.uid,
        creatorDisplayName: profile.displayName || user.displayName || 'Anonymous Creator',
        creatorUsername: profile.username || 'unknown',
        creatorAvatarUrl: profile.avatarUrl || user.photoURL || '',
        
        title,
        description,
        promptText,
        model: model === 'Other' ? customModel.trim() || 'Unknown' : model,
        monetizationType: 'free',
        
        imageUrls: imageUrls,
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

      setSuccessMsg(true);
      setTimeout(() => {
        navigate('/?tab=newest');
      }, 2000);

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
          <button className="btn-primary" onClick={signInWithGoogle}>
            Authenticate with Google
          </button>
        </div>
      </div>
    );
  }

  if (successMsg) {
    return (
      <div className={styles.pageContainer} style={{ justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <CheckCircle2 size={64} style={{ color: '#10b981' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Creation Published Successfully!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Redirecting you to your dashboard...</p>
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
            <label>Description <span className={styles.optionalText}>(optional)</span></label>
            <textarea 
              className={styles.plainTextarea}
              placeholder="Briefly describe the intent and aesthetic of this creation..."
              value={description}
              maxLength={1000}
              onChange={e => setDescription(e.target.value)}
            />
            {getCharLimitWarning(description.length, 1000)}
          </div>

          <div className={styles.fieldGroup}>
            <label>Prompt</label>
            <textarea 
              className={`${styles.plainTextarea} ${styles.tall}`}
              placeholder="/imagine prompt: A highly detailed..."
              value={promptText}
              maxLength={15000}
              onChange={e => setPromptText(e.target.value)}
              required
            />
            {getCharLimitWarning(promptText.length, 15000)}
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
          <Sparkles size={40} style={{ color: 'var(--text-primary)', animation: 'pulse 1.5s infinite' }} />
          <p style={{ fontWeight: 600, marginTop: '1rem' }}>{statusText}</p>
        </div>
      )}
    </div>
  );
}
