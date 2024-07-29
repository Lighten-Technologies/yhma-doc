---
outline: deep
---

# YHMA API

YHMA API 문서입니다.

## How to use

좌측에 있는 모듈별 매뉴에서 모듈 버전을 선택하신 후, 해당 모듈의 API 문서를 확인하실 수 있습니다.

TODO 태그가 붙은 문서는 아직 작성이 되지 않은 문서 입니다.

## TODO List

- 환자 부분
- 환자 로그인 부분
- 환자 바이탈 부분
- 환자 레포트 부분
- 환자 심전도 부분
- 환자 bsm 부분
- 정보 내보내기 부분
- 대쉬보드 부분

## 암복호화 관련

항목별 암복호화를 진행합니다.
암복호화 키는 워크로 공유 드렸습니다.

암호화 방식은 AES256-gcm 방식을 사용합니다.

### sample

```json
// http 요청의 데이터 부분이 모두 암호화 되어 전송됩니다.
{
  "responseTime": "2024-07-29 15:36:22",
  "message": "patientList",
  "data": "ysSp5wNp07RF8OMFskGHDKA1Q9mGdcDfWnPqVrq4AzSdVlAJCLxJdRwKFCA0XT57j6r0UERB0s7dh7Hp4GunQN4po0wIGrwKwUoFMXvk9Nj5zrf/5BVKhAzRAFCxy5ouVlAnYVWIDjWNk07+awkIS5ec5GvTz35eCP6i0d5jMs9sypR1tpdcr/lmPW/SJEufLddnxatFP5f3Y4Y4h7XSvSp7IlRm9+BIGTTbQ+bPl1HaeiEbgOmLnfZcXRMO0rOlIXqdYpS0NAzad2PYGxQvaIgGNiiTL0DjRwtxYuZU+z4fcbxtYOWFcfhT9D8ZKOUg9OXOatflTGpvP8C7jfQx0sE1z6Sr/+HyxM4vSpN1dq7YFme3AQKvzGIkLDmTFjVMtPymJeYScDlcKf8RyVHywPbcvJOd9EXrBkjhjBSxO2UrfiVYxyOaE8sLc2DWpqQmzRt+d1mS2tHhHoMZG27p1W5FYObGUBPAu3zafEefiTZ84aOlnWjU+S0aKtTyaeU9uITfcQmQaNbAhu0kOwwmhXGYEG8hm399sfjScAYFPt3M1GZl5e4Dw0UZo8lHsfqv3tP28sipFbolLn1SrvVTX1Z1pybQVo7HYNqpqOPH6P2ZkIDmckYclHP+NDb0BZr3YUsc5XGoUTINo9ad7jY9uocqlV3FRv0OFL6iqJ4ekVFfiBFkdfvBCe5gu7kk2BGB0FwrNjBfWUA="
}
```

### Python

```python
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
from base64 import urlsafe_b64encode, urlsafe_b64decode

# AES 키와 IV(Initial Vector)를 고정된 값으로 설정합니다.
aes_key = hashlib.sha256(b'암호화 키').digest()
# iv = b'390874623093489'

def aes_encrypt(key, data):
    iv = os.urandom(12)  # 12바이트 길이의 초기 벡터 생성
    cipher = Cipher(algorithms.AES(key), modes.GCM(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    encrypted_data = encryptor.update(data.encode('utf-8')) + encryptor.finalize()
    return urlsafe_b64encode(iv + encryptor.tag + encrypted_data).decode('utf-8')

def aes_decrypt(key, encrypted_data):
    encrypted_data = urlsafe_b64decode(encrypted_data.encode('utf-8'))
    iv, tag, ciphertext = encrypted_data[:12], encrypted_data[12:28], encrypted_data[28:]
    cipher = Cipher(algorithms.AES(key), modes.GCM(iv, tag), backend=default_backend())
    decryptor = cipher.decryptor()
    decrypted_data = decryptor.update(ciphertext) + decryptor.finalize()
    return decrypted_data.decode('utf-8')

aes_encrypt(aes_key, '암호화할 데이터')
aes_decrypt(aes_key, '복호화할 데이터')
```

### JavaScript

```javascript
const crypto = require("crypto");

const aesKey = crypto.createHash("sha256").update("yhma-lighten").digest();

function aesEncrypt(data) {
  // Generate a random IV
  const iv = crypto.randomBytes(12);

  // Create an AES-GCM cipher with the encryption key and IV
  const cipher = crypto.createCipheriv("aes-256-gcm", aesKey, iv);

  // Encrypt the data
  let encryptedData = cipher.update(data, "utf-8");
  encryptedData = Buffer.concat([encryptedData, cipher.final()]);

  // Get the authentication tag
  const tag = cipher.getAuthTag();

  // Concatenate IV, tag, and ciphertext
  const encryptedBuffer = Buffer.concat([iv, tag, encryptedData]);

  // Return the encrypted data as a Base64 URL-safe string
  return encryptedBuffer.toString("base64");
}

function aesDecrypt(encryptedData) {
  // Base64 URL-safe decoding
  const encryptedBuffer = Buffer.from(encryptedData, "base64");

  // Separate the IV, tag, and ciphertext
  const iv = encryptedBuffer.slice(0, 12);
  const tag = encryptedBuffer.slice(12, 28);
  const ciphertext = encryptedBuffer.slice(28);

  // Create an AES-GCM decipher with the encryption key and IV
  const decipher = crypto.createDecipheriv("aes-256-gcm", aesKey, iv);
  decipher.setAuthTag(tag);

  // Decrypt the data
  let decryptedData = decipher.update(ciphertext);
  decryptedData = Buffer.concat([decryptedData, decipher.final()]);

  // Return the decrypted data as a UTF-8 string
  return decryptedData.toString("utf-8");
}
```

### Kotlin

```kotlin


```

### Swift

```swift
import Foundation
import CryptoKit

struct AESUtil {

    private static let keyString = "암호화 키"
    private static let symmetricKey: SymmetricKey = generateSymmetricKey(from: keyString)

    static func decrypt(encryptedString: String) throws -> String {
        guard let combinedData = Data(base64URL: encryptedString) else {
            throw DecryptionError.invalidBase64String
        }

        guard combinedData.count >= 28 else {
            throw DecryptionError.invalidDataLength
        }

        let nonceData = combinedData.prefix(12)
        let tag = combinedData.subdata(in: 12..<28)
        let ciphertext = combinedData.suffix(from: 28)

        let nonce: AES.GCM.Nonce
        do {
            nonce = try AES.GCM.Nonce(data: nonceData)
        } catch {
            throw DecryptionError.nonceCreationError(error)
        }

        do {
            let sealedBox = try AES.GCM.SealedBox(nonce: nonce, ciphertext: ciphertext, tag: tag)
            let decryptedData = try AES.GCM.open(sealedBox, using: symmetricKey)
            return String(data: decryptedData, encoding: .utf8) ?? ""
        } catch {
            throw DecryptionError.decryptionError(error)
        }
    }

    private static func generateSymmetricKey(from input: String) -> SymmetricKey {
        let inputData = input.data(using: .utf8)!
        let hashed = SHA256.hash(data: inputData)
        return SymmetricKey(data: Data(hashed))
    }

    enum DecryptionError: Error {
        case invalidBase64String
        case invalidDataLength
        case nonceCreationError(Error)
        case decryptionError(Error)
        case invalidData
    }
}


extension Data {
    init?(base64URL: String) {
        let base64 = base64URL
            .replacingOccurrences(of: "-", with: "+")
            .replacingOccurrences(of: "_", with: "/")

        let padLength = (4 - base64.count % 4) % 4
        let paddedBase64 = base64 + String(repeating: "=", count: padLength)

        self.init(base64Encoded: paddedBase64)
    }
}

extension String {
    static func decrypt(encryptedString: String) throws -> String {
        return try AESUtil.decrypt(encryptedString: encryptedString)
    }
}

```
