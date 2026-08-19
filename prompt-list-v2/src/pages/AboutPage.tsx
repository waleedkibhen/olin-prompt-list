import React, { useEffect } from 'react';
import { Compass, Image as ImageIcon, Users, Sparkles } from 'lucide-react';
import { updateSEOTags, resetSEOTags } from '@/lib/seo';

export default function AboutPage() {
  useEffect(() => {
    updateSEOTags(
      'https://getolin.xyz/about',
      'Learn more about Olin - the premier platform for discovering, sharing, and mastering AI-generated art and prompts.',
      'About Olin'
    );
    return () => resetSEOTags();
  }, []);

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '4rem 2rem',
      color: 'var(--text-primary)',
      lineHeight: '1.7'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          About Olin
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          We are building the Pinterest for AI generation—a home for creators to share, discover, and master the art of prompting.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <ImageIcon size={28} color="var(--text-primary)" />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Our Vision</h2>
          </div>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            AI art is rapidly evolving, but the exact prompts, parameters, and techniques used to create stunning visuals are often lost in chaotic Discord servers or buried in endless social media feeds. Olin was created to solve this. We envision a highly organized, visually stunning platform where every piece of generated art is paired exactly with the DNA that created it.
          </p>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Sparkles size={28} color="var(--text-primary)" />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>For the Creators</h2>
          </div>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            Whether you are using Midjourney, Stable Diffusion, DALL-E, or the newest models, Olin gives you a gorgeous portfolio to showcase your generations. Our platform allows creators to not only share their work, but optionally monetize their most complex, highly-refined prompts through our premium vault system.
          </p>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Compass size={28} color="var(--text-primary)" />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Discovery Engine</h2>
          </div>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            We've built a powerful, multi-dimensional discovery engine that lets you filter millions of generations by precise color palettes, aspect ratios, models, and semantic meaning. Finding the exact aesthetic you need for your next project has never been easier.
          </p>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Users size={28} color="var(--text-primary)" />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Join the Community</h2>
          </div>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            We are just getting started. Join thousands of prompt engineers, digital artists, and AI enthusiasts who are pushing the boundaries of what is possible. At Olin, we believe that sharing knowledge accelerates creativity for everyone.
          </p>
        </section>
      </div>

      <div style={{ marginTop: '5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Have questions, suggestions, or want to collaborate?
        </p>
        <a 
          href="mailto:wisecrafts81@gmail.com" 
          className="btn-solid" 
          style={{ display: 'inline-flex', padding: '0.75rem 2rem', textDecoration: 'none', borderRadius: 'var(--radius-lg)' }}
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}
