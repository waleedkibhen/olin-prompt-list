import React, { useState, useRef } from 'react';
import styles from './CreatePostModal.module.css';
import { useAuth } from '@/context/AuthContext';
import { moderateText, moderateSingleImage, generateLiveEmbedding, analyzeArtworkWithGemini } from '@/lib/ai';
import { sendNotification } from '@/lib/notifications';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { CheckCircle2, Loader2, Trash2, AlertTriangle, UploadCloud } from 'lucide-react';

interface CreatePostModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface SelectedFile {
  file: File;
  previewUrl: string;
  base64?: string;
}

export default function CreatePostModal({ onClose, onSuccess }: CreatePostModalProps) {
  const { user, profile, signInWithGoogle } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [promptText, setPromptText] = useState('');
  const [model, setModel] = useState<'Midjourney V6' | 'Flux.1' | 'DALL-E 3' | 'Stable Diffusion XL'>('Midjourney V6');
  const [isPaid, setIsPaid] = useState(false);
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
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Compression failed"));
          }, 'image/jpeg', 0.80);
        } else {
          reject(new Error("Canvas unavailable"));
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`Could not load photo: ${file.name}`));
      };
    });
  };

  const uploadWithTimeout = (imageRef: any, blob: Blob, timeoutMs = 12000): Promise<void> => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Cloud Storage upload timed out."));
      }, timeoutMs);

      uploadBytes(imageRef, blob).then(() => {
        clearTimeout(timer);
        resolve();
      }).catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incomingFiles = Array.from(e.target.files);

    if (selectedFiles.length + incomingFiles.length > 5) {
      setModerationError("You can attach up to 5 images per post.");
      return;
    }

    setModerationError(null);
    const newFileItems: SelectedFile[] = [];

    for (const file of incomingFiles) {
      if (!file.type.startsWith('image/')) {
        setModerationError(`File "${file.name}" is not a supported image.`);
        continue;
      }
      try {
        const previewUrl = URL.createObjectURL(file);
        const base64 = await getCompressedBase64(file);
        newFileItems.push({ file, previewUrl, base64 });
      } catch (err: any) {
        setModerationError(`Failed to read image: ${err.message}`);
      }
    }

    setSelectedFiles(prev => [...prev, ...newFileItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (index: number) => {
    const target = selectedFiles[index];
    URL.revokeObjectURL(target.previewUrl);
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModerationError(null);

    if (!user || !profile) {
      alert("Please sign in with Google to publish.");
      return;
    }

    if (selectedFiles.length === 0) {
      setModerationError("Please attach at least 1 image file.");
      return;
    }

    if (!title.trim() || !promptText.trim()) {
      setModerationError("Title and prompt parameters are required.");
      return;
    }

    setIsScanning(true);
    try {
      let isFlagged = false;
      let flaggedReason = "";

      setStatusText('Validating safety guidelines...');
      const textMod = await moderateText(promptText);
      if (!textMod.approved) {
        isFlagged = true;
        flaggedReason = "Automated AI text safety flag triggered";
      }

      for (let i = 0; i < selectedFiles.length; i++) {
        setStatusText(`Checking image ${i + 1} of ${selectedFiles.length}...`);
        const compressedBase64 = selectedFiles[i].base64 || '';
        const imgMod = await moderateSingleImage(compressedBase64, i + 1);
        if (!imgMod.approved) {
          isFlagged = true;
          flaggedReason = `Automated visual safety flag on image ${i + 1}`;
        }
      }

      setStatusText('Uploading artwork...');
      const uploadedImageUrls: string[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const item = selectedFiles[i];
        setStatusText(`Uploading file ${i + 1} of ${selectedFiles.length}...`);
        
        try {
          const compressedBlob = await compressImageForStorage(item.file);
          const storagePath = `prompts_images/${user.uid}/${Date.now()}_${Math.random().toString(36).substring(2, 6)}.jpg`;
          const imageRef = ref(storage, storagePath);
          await uploadWithTimeout(imageRef, compressedBlob, 12000);
          const downloadUrl = await getDownloadURL(imageRef);
          uploadedImageUrls.push(downloadUrl);
        } catch (_storageError: any) {
          if (item.base64) {
            uploadedImageUrls.push(item.base64);
          } else {
            throw new Error(`Upload failed on image ${i + 1}`);
          }
        }
      }

      setStatusText('Analyzing visual scene with Gemini...');
      const visualTags: string[] = [];
      for (const imgUrl of uploadedImageUrls) {
        const tags = await analyzeArtworkWithGemini(imgUrl);
        visualTags.push(...tags);
      }
      const uniqueVisualTags = Array.from(new Set(visualTags));

      setStatusText('Finalizing...');
      const fullTextToEmbed = `${title} ${description} ${promptText} ${model} ${uniqueVisualTags.join(" ")}`;
      const embedding = await generateLiveEmbedding(fullTextToEmbed);

      setStatusText('Publishing...');
      const newPostId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const postDocRef = doc(db, 'posts', newPostId);

      const postPayload = {
        id: newPostId,
        creatorId: user.uid,
        creatorDisplayName: profile.displayName || user.displayName || 'AI Creator',
        creatorUsername: profile.username || 'creator',
        creatorAvatarUrl: profile.avatarUrl || user.photoURL || '',
        title: title.trim(),
        description: description.trim(),
        promptText: promptText.trim(),
        negativePrompt: null,
        isPaid: Boolean(isPaid),
        price: 0,
        isFlagged,
        flaggedReason,
        imageUrls: uploadedImageUrls,
        model,
        styleTag: uniqueVisualTags[0] || 'General',
        categories: Array.from(new Set(["Verified Upload", ...uniqueVisualTags])),
        likesCount: 0,
        savesCount: 0,
        viewsCount: 1,
        copiesCount: 0,
        createdAt: serverTimestamp(),
        embedding
      };

      await setDoc(postDocRef, postPayload);
      setIsScanning(false);
      setWasFlagged(isFlagged);
      setSuccessMsg(true);

      if (isFlagged) {
        await sendNotification(
          user.uid,
          "🛡️ Post Queued for Review",
          `Your upload "${title.trim()}" triggered an automated safety check (${flaggedReason}) and has been moved to our Admin review queue before going live.`,
          "moderation"
        );
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2000);

    } catch (err: any) {
      setIsScanning(false);
      if (err?.code === 'permission-denied' || err?.message?.includes('Missing or insufficient permissions')) {
        setModerationError("Missing database permissions in Firebase Console.");
      } else {
        setModerationError(`Failed to publish: ${err.message || 'Unknown error occurred.'}`);
      }
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <div>
              <h2>Share AI creation</h2>
              <p>Upload curated artwork alongside generative AI parameters.</p>
            </div>
          </div>
          <button className="btn-outline" onClick={onClose} style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem', borderRadius: '9999px' }}>
            Esc
          </button>
        </header>

        {!user ? (
          <div className={styles.authPrompt}>
            <AlertTriangle size={36} className={styles.warnIcon} />
            <h3>Sign in to publish</h3>
            <p>Google authentication is required to verify creators and protect community authenticity.</p>
            <button className="btn-solid" onClick={signInWithGoogle} style={{ borderRadius: '9999px', padding: '0.6rem 1.4rem' }}>
              Sign in with Google
            </button>
          </div>
        ) : (
          <form className={styles.formBody} onSubmit={handleSubmit}>
            
            {moderationError && (
              <div className={styles.errorAlert}>
                <span>{moderationError}</span>
              </div>
            )}

            {successMsg && (
              <div className={styles.successAlert} style={wasFlagged ? { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: '#f59e0b', color: '#f59e0b' } : {}}>
                <CheckCircle2 size={18} />
                <span>
                  {wasFlagged
                    ? "Artwork received and queued for Admin review due to safety checks (see Notification Bell)."
                    : "Your creation has been verified and published!"}
                </span>
              </div>
            )}

            {isScanning && (
              <div className={styles.scanningBanner}>
                <Loader2 size={18} className={styles.spinner} />
                <span>{statusText || 'Processing submission...'}</span>
              </div>
            )}

            <div className={styles.uploadSection}>
              <div className={styles.uploadHeader}>
                <span className={styles.uploadTitle}>Artwork images</span>
                <span className={styles.fileCountBadge}>{selectedFiles.length} / 5</span>
              </div>

              <div 
                className={styles.dropzone}
                onClick={() => selectedFiles.length < 5 && fileInputRef.current?.click()}
                style={{ cursor: selectedFiles.length >= 5 ? 'not-allowed' : 'pointer', opacity: selectedFiles.length >= 5 ? 0.6 : 1 }}
              >
                <UploadCloud size={28} className={styles.dropIcon} />
                <div className={styles.dropText}>
                  <strong>Click to select artwork</strong>
                  <span>Supports JPG, PNG, or WEBP (up to 5 images)</span>
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

              {selectedFiles.length > 0 && (
                <div className={styles.previewGrid}>
                  {selectedFiles.map((item, idx) => (
                    <div key={idx} className={styles.thumbCard}>
                      <img src={item.previewUrl} alt={`Selected ${idx + 1}`} className={styles.thumbImg} />
                      <div className={styles.thumbMeta}>
                        <span className={styles.thumbName}>{item.file.name}</span>
                        <button type="button" className={styles.removeBtn} onClick={() => handleRemoveFile(idx)} title="Remove">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup} style={{ flex: 1.5 }}>
                <label>Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Cyberpunk rain scene"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Model</label>
                <select value={model} onChange={e => setModel(e.target.value as any)}>
                  <option value="Midjourney V6">Midjourney V6</option>
                  <option value="Flux.1">Flux.1</option>
                  <option value="DALL-E 3">DALL-E 3</option>
                  <option value="Stable Diffusion XL">SDXL</option>
                </select>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label>Prompt parameters</label>
              <textarea 
                rows={3} 
                placeholder="Generative prompt parameters, seeds, or camera flags..."
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Prompt Gating &amp; Monetization</label>
              <div className={styles.pricingToggleRow}>
                <button
                  type="button"
                  className={`${styles.pricingOptionBtn} ${!isPaid ? styles.pricingActive : ''}`}
                  onClick={() => setIsPaid(false)}
                >
                  <span className={styles.optionTitle}>🟢 Free (Ad-Supported)</span>
                  <span className={styles.optionSub}>Users watch a brief sponsor ad to unlock prompt text</span>
                </button>
                <button
                  type="button"
                  disabled={profile?.monetizationStatus !== 'approved'}
                  className={`${styles.pricingOptionBtn} ${isPaid ? styles.pricingActive : ''}`}
                  onClick={() => {
                    if (profile?.monetizationStatus === 'approved') {
                      setIsPaid(true);
                    } else {
                      alert("You must achieve 50 prompt copies in your Creator Dashboard to apply for Premium subscription monetization!");
                    }
                  }}
                  style={profile?.monetizationStatus !== 'approved' ? { opacity: 0.55, cursor: 'not-allowed', border: '1px dashed #f59e0b' } : {}}
                >
                  <span className={styles.optionTitle}>💎 Premium (Subscribers Only)</span>
                  <span className={styles.optionSub}>
                    {profile?.monetizationStatus === 'approved' ? 'Exclusively accessible to Olin Premium Subscribers' : '🔒 Requires Approved Monetization (50+ Copies)'}
                  </span>
                </button>
              </div>
              {profile?.monetizationStatus !== 'approved' && (
                <span style={{ fontSize: '0.78rem', color: '#f59e0b', marginTop: '0.2rem' }}>
                  💡 Check your Creator Dashboard to track your progress toward 50 copies and apply for monetization!
                </span>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label>Description (optional)</label>
              <input 
                type="text" 
                placeholder="Brief artistic description or styling notes..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className={styles.footerActions}>
              <button type="button" className="btn-outline" onClick={onClose} disabled={isScanning} style={{ borderRadius: '9999px', padding: '0.5rem 1.2rem' }}>
                Cancel
              </button>
              <button type="submit" className="btn-solid" disabled={isScanning || successMsg || selectedFiles.length === 0} style={{ borderRadius: '9999px', padding: '0.5rem 1.4rem' }}>
                {isScanning ? 'Publishing...' : 'Publish Creation'}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
