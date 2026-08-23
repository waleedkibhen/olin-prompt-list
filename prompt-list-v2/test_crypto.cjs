const crypto = require('crypto');

async function test() {
  const pem = `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC6hFWYtTqbHh6a
+89i7Dflv3yrnTn28HHX/+d5A+fseAj9W9ZNRR30q2fPqkYQkR+dYf0PWCu3MVOQ
yRBRL1KU9+E3gr0MfI2ZNrgxDHHz5EPb0Xu5xTwwmOAozbsPnC5SRJI9o27kgtf4
J6t6XAjs2A01L8EdID605ecwc6DokAomBYbUM3YnLSRQZHfTAG/L7EJ7m7c2rsYZ
8mg26GPe2u+HfrXSaGShWxm5md7CzIMbCjx3Osff8CbjXpOyqjdkZ5Qoi4qGd/3A
VQhKMvizGMtDsWgMsn/mJf9+sCygxLj2Ih/Ildcpmka6IpCcVxGF6ZNtnjByKLD4
/MBXdXohAgMBAAECggEAJwoq9m88iJpJ0qvRUUXbP1oQyMT8jHzwf0MfmptgMIVB
cHKIDR1h80PrUzKzPqV5phIMC2mroMkQ0jXblfqfQPIPcHSLiHELnF2xOQb/VQra
z0huKsinXA6roK7LMC3DHlIfAArU27ytYtI+2Lop3hUs0oyf0a5dobSbau9Q50xf
PaQRgMNxOZPhcLWucgXZzYRQT9hPfLO0GzWBDdq7R0sLVXENOC9nE+3Rc9SybTj5
smAj4syKmyYx+xAYibPhJz5mOLD7xPiuQ5X2T8rcE89XWFrCguwSEpwRp3xLKQoo
rycxVeAJWzhTzqNoXowZlMiRLKHWSzDLKyPsaAgsiQKBgQDplUTp4SkZXADU4Wvw
Sx3/YEy3sspx8FFVuPPeKDvPs4uXZG13tySsnKQfcuRjmekPTr014ZPj/OSqRQa9
OZ+xue0MdQ3+ABrV7RUe2HydPABhn3I+MlPR6k5eXWX3l/weIIpPolwZVzX4vsHS
OFDwLRg2jmOfNcpV5T7+6yNTVQKBgQDMartF4jLjStvIO5nABIsJnL/gs+KqwDeF
UdHdvd7TFE15xqnEOlzq1seK6l/ai1Cz8XEff/e6SPtlwJ1v2kXvrL7AMLEh2h8G
PytioeLGpiA4Td3JQOrofvrGYQNj7445mRU0ircN8ZBRskYQ2dSKyoPb69D31zB3
wyV6zkvjnQKBgQCsIVLaYxGtXW5DcibfugtOEQIX8QpcsnLNj/EuSknhQndgxiIh
MXY2OWx8vGbvuxDTNfwbA7O/M7KygxF3SkqTZub34h7AigU8lmyVAYW7POcvCZff
m6jHLTo5Meyda4PgE6y5CHWEOw9L0g70wolqpGCOe5mQTsxfRgOJSXALzQKBgQCO
NNIDU9FC/hjXu17CjmaLUVjK4VmWoBH/1WPCdwxEm6MqTGJd+JwbYz9+DH6Scsi5
5gVkfInCNnNt3gmofpiYm/w3h6gyfKOInPl5rFUvDPLtOH5KO7cv9uZOi77oDwdK
Woy9+KJQOPTFYNgNcPzDcQ86N1swj6tQJZo1TL7OoQKBgQDAHNpBFEUntm0DCy2Y
31OxvKdwjBvMv23vLZoSFe1gvncGB3tIJss0OMToNsFYpe1hqz2B/RY2Y8oD3a79
y9KekZnUtPXLPRGY/oJbjXxEphPgUaiqyurbAa5OSVXq/UdOAkKt8cyKyy/j1wq8
4xcJT3ZLQWS6ZW8TRcVkdROpuw==
-----END PRIVATE KEY-----`;

  const keyData = pem.replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '').replace(/\s+/g, '');
  const binaryDerString = atob(keyData);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) binaryDer[i] = binaryDerString.charCodeAt(i);

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  console.log("Success importing key!");
}
test().catch(console.error);
