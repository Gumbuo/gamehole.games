"use client";

export default function Credits() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(to bottom, #0f0f1e, #1a1a2e)',
      padding: '40px',
      overflow: 'auto',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <h1 style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '48px',
          fontWeight: 'bold',
          background: 'linear-gradient(90deg, #00d4ff, #00ff99)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textAlign: 'center',
          marginBottom: '20px',
        }}>
          CREDITS
        </h1>

        <p style={{
          fontFamily: 'Share Tech Mono, monospace',
          color: '#00d4ff',
          fontSize: '14px',
          textAlign: 'center',
          marginBottom: '40px',
        }}>
          The amazing people behind Game Hole and FoxStead
        </p>

        {/* Credits Sections */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
        }}>
          {/* Development */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e, #0f0f1e)',
            border: '2px solid #00d4ff',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 0 40px rgba(0, 212, 255, 0.3)',
          }}>
            <h2 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#00d4ff',
              marginBottom: '20px',
              textTransform: 'uppercase',
            }}>
              Development
            </h2>
            <div style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '16px',
              color: '#00ff99',
              lineHeight: '2',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(0, 212, 255, 0.2)' }}>
                <span>Lead Developer</span>
                <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>Gumbuo Team</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px' }}>
                <span>AI Assistant</span>
                <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>Claude Code by Anthropic</span>
              </div>
            </div>
          </div>

          {/* Game Design */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e, #0f0f1e)',
            border: '2px solid #00ff99',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 0 40px rgba(0, 255, 153, 0.3)',
          }}>
            <h2 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#00ff99',
              marginBottom: '20px',
              textTransform: 'uppercase',
            }}>
              Game Design
            </h2>
            <div style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '16px',
              color: '#00ff99',
              lineHeight: '2',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(0, 255, 153, 0.2)' }}>
                <span>Alien Catacombs (Alpha)</span>
                <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>Built with Godot 3.6.2</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', paddingBottom: '10px', borderBottom: '1px solid rgba(0, 255, 153, 0.2)' }}>
                <span>Dungeon Crawler</span>
                <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>Community Driven</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px' }}>
                <span>Gumbuo Invasion</span>
                <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>Community Driven</span>
              </div>
            </div>
          </div>

          {/* Artist Credits — Coming Soon */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e, #0f0f1e)',
            border: '2px solid #8e44ad',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 0 40px rgba(142, 68, 173, 0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <h2 style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#8e44ad',
                textTransform: 'uppercase',
                margin: 0,
              }}>
                Art Credits
              </h2>
              <span style={{
                padding: '5px 14px',
                background: 'rgba(142, 68, 173, 0.2)',
                border: '1px solid #8e44ad',
                borderRadius: '20px',
                color: '#ce93d8',
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '11px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                Being Updated
              </span>
            </div>

            <p style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '15px',
              color: '#aaa',
              lineHeight: '1.8',
              marginBottom: '24px',
            }}>
              FoxStead uses art from some incredible creators. We are actively compiling
              full credits for every asset pack, tileset, sprite, and sound used across
              the game. If you made art that appears here and want credit listed —
              or want it removed — please reach out.
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '28px',
            }}>
              {[
                { label: 'Zelda Futuristic Tileset', credit: 'Deakcor (@deakcor)', link: null },
                { label: 'Character Sprites (AI-assisted)', credit: 'PixelLab', link: null },
                { label: 'Sound Effects', credit: 'Various — full list coming soon', link: null },
                { label: 'Additional Art Packs', credit: 'Credits being compiled…', link: null },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(142, 68, 173, 0.2)',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '15px', color: '#00ff99' }}>
                    {item.label}
                  </span>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '14px', color: '#ce93d8', fontWeight: 'bold' }}>
                    {item.credit}
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              background: 'rgba(142, 68, 173, 0.1)',
              border: '1px dashed rgba(142, 68, 173, 0.5)',
              borderRadius: '10px',
              padding: '20px',
              textAlign: 'center',
            }}>
              <p style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '13px',
                color: '#ce93d8',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                Are you an artist whose work appears in FoxStead?
              </p>
              <p style={{
                fontFamily: 'Share Tech Mono, monospace',
                fontSize: '13px',
                color: '#888',
                lineHeight: '1.6',
              }}>
                We want to credit you properly. Contact us and we will add your name,
                link, and a description of your work to this page.
              </p>
            </div>
          </div>

          {/* Technology Stack */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e, #0f0f1e)',
            border: '2px solid #00d4ff',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 0 40px rgba(0, 212, 255, 0.3)',
          }}>
            <h2 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#00d4ff',
              marginBottom: '20px',
              textTransform: 'uppercase',
            }}>
              Technology Stack
            </h2>
            <div style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '16px',
              color: '#00ff99',
              lineHeight: '2',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '15px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(0, 212, 255, 0.2)' }}>
                <span>Framework</span>
                <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>Next.js 13</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(0, 212, 255, 0.2)' }}>
                <span>Game Engine</span>
                <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>Godot 3.6.2</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(0, 212, 255, 0.2)' }}>
                <span>Language</span>
                <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>TypeScript</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(0, 212, 255, 0.2)' }}>
                <span>Styling</span>
                <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>Tailwind CSS</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(0, 212, 255, 0.2)' }}>
                <span>Hosting</span>
                <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>Vercel</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(0, 212, 255, 0.2)' }}>
                <span>UI/UX</span>
                <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>React</span>
              </div>
            </div>
          </div>

          {/* Special Thanks */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e, #0f0f1e)',
            border: '2px solid #00ff99',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 0 40px rgba(0, 255, 153, 0.3)',
          }}>
            <h2 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#00ff99',
              marginBottom: '20px',
              textTransform: 'uppercase',
            }}>
              Special Thanks
            </h2>
            <div style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '16px',
              color: '#00ff99',
              lineHeight: '2',
            }}>
              <div style={{ paddingBottom: '15px' }}>
                <div style={{ color: '#00d4ff', fontWeight: 'bold', marginBottom: '8px' }}>The Gumbuo Community</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  For your feedback, suggestions, and endless enthusiasm for web3 gaming
                </div>
              </div>
              <div style={{ paddingTop: '15px', borderTop: '1px solid rgba(0, 255, 153, 0.2)' }}>
                <div style={{ color: '#00d4ff', fontWeight: 'bold', marginBottom: '8px' }}>Open Source Community</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  For the incredible tools and libraries that made this possible
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            padding: '30px 0',
          }}>
            <p style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '18px',
              color: '#00d4ff',
              fontWeight: 'bold',
              marginBottom: '10px',
            }}>
              Game Hole © 2025
            </p>
            <p style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '14px',
              color: '#00ff99',
              opacity: 0.8,
            }}>
              Part of the Gumbuo Ecosystem
            </p>
            <a
              href="https://gamehole.games"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                marginTop: '20px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #8e44ad, #9b59b6)',
                border: '2px solid #00ff99',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#00ff99',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
                fontSize: '14px',
                textTransform: 'uppercase',
                boxShadow: '0 0 20px rgba(0, 255, 153, 0.4)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 255, 153, 0.8)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 153, 0.4)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Visit Game Hole
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
