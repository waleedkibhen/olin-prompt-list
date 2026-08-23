const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const target = `                              )}
                            </div>
                          </div>
                        </div>
                      ) : (`;

const replacement = `                              )}
                            </div>
                          </div>
                        </div>
                        {effectiveMonetization === 'charge' && (
                          <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.4)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem' }}>
                            <Lock size={14} /> Secure Checkout Powered by Whop
                          </div>
                        )}
                      ) : (`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('UI updated');
