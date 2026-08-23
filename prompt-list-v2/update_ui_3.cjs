const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const target = `                              )}
                            </div>
                          </div>
                        </div>`;

const replacement = `                              )}
                            </div>
                          </div>
                        </div>
                        {effectiveMonetization === 'charge' && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary, #888)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                            <Lock size={12} /> Secure Checkout Powered by Whop
                          </div>
                        )}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('UI updated');
