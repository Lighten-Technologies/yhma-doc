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

```android
import java.security.SecureRandom;
import java.security.MessageDigest;
import java.util.Arrays;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import android.util.Base64;

public class AESUtil {

    private static final String AES_ALGORITHM = "AES/GCM/NoPadding";
    private static final String CHARSET_NAME = "UTF-8";
    private static final String SECRET_KEY = "your_fixed_key";
    private static final int IV_LENGTH = 12; // 12바이트 길이의 초기 벡터
    private static final int TAG_LENGTH_BIT = 128;

    private static SecretKeySpec generateKey(String secret) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] bytes = secret.getBytes(CHARSET_NAME);
        digest.update(bytes, 0, bytes.length);
        byte[] key = digest.digest();
        return new SecretKeySpec(key, "AES");
    }

    public static String encrypt(String data) throws Exception {
        SecretKeySpec keySpec = generateKey(SECRET_KEY);
        byte[] iv = new byte[IV_LENGTH];
        new SecureRandom().nextBytes(iv);
        GCMParameterSpec gcmSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);

        Cipher cipher = Cipher.getInstance(AES_ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, gcmSpec);
        byte[] encryptedData = cipher.doFinal(data.getBytes(CHARSET_NAME));
        byte[] encryptedIVAndData = new byte[IV_LENGTH + encryptedData.length];
        System.arraycopy(iv, 0, encryptedIVAndData, 0, IV_LENGTH);
        System.arraycopy(encryptedData, 0, encryptedIVAndData, IV_LENGTH, encryptedData.length);

        return Base64.encodeToString(encryptedIVAndData, Base64.NO_WRAP);
    }

    public static String decrypt(String encryptedData) throws Exception {
        SecretKeySpec keySpec = generateKey(SECRET_KEY);
        byte[] encryptedIVAndData = Base64.decode(encryptedData, Base64.NO_WRAP);

        byte[] iv = Arrays.copyOfRange(encryptedIVAndData, 0, IV_LENGTH);
        byte[] data = Arrays.copyOfRange(encryptedIVAndData, IV_LENGTH, encryptedIVAndData.length);

        GCMParameterSpec gcmSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);

        Cipher cipher = Cipher.getInstance(AES_ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, keySpec, gcmSpec);
        byte[] decryptedData = cipher.doFinal(data);

        return new String(decryptedData, CHARSET_NAME);
    }
}
```

```swift
import Foundation
import CommonCrypto

class AESUtil {
    static let secretKey = "your_fixed_key"
    static let ivLength = 12

    static func generateKey(from password: String) -> Data {
        let passwordData = password.data(using: .utf8)!
        var key = Data(count: kCCKeySizeAES256)
        _ = key.withUnsafeMutableBytes { keyBytes in
            passwordData.withUnsafeBytes { passwordBytes in
                CCKeyDerivationPBKDF(
                    CCPBKDFAlgorithm(kCCPBKDF2),
                    password, password.count,
                    nil, 0,
                    CCPseudoRandomAlgorithm(kCCPRFHmacAlgSHA256),
                    10000,
                    keyBytes.bindMemory(to: UInt8.self).baseAddress!,
                    kCCKeySizeAES256
                )
            }
        }
        return key
    }

    static func encrypt(_ data: String) -> String? {
        let key = generateKey(from: secretKey)
        var iv = Data(count: ivLength)
        _ = iv.withUnsafeMutableBytes { SecRandomCopyBytes(kSecRandomDefault, ivLength, $0.baseAddress!) }

        let dataToEncrypt = data.data(using: .utf8)!
        var encryptedData = Data(count: dataToEncrypt.count + kCCBlockSizeAES128)
        var numBytesEncrypted: size_t = 0

        let cryptStatus = key.withUnsafeBytes { keyBytes in
            iv.withUnsafeBytes { ivBytes in
                dataToEncrypt.withUnsafeBytes { dataBytes in
                    encryptedData.withUnsafeMutableBytes { encryptedBytes in
                        CCCrypt(
                            CCOperation(kCCEncrypt),
                            CCAlgorithm(kCCAlgorithmAES),
                            CCOptions(kCCOptionPKCS7Padding),
                            keyBytes.baseAddress!, kCCKeySizeAES256,
                            ivBytes.baseAddress!,
                            dataBytes.baseAddress!, dataToEncrypt.count,
                            encryptedBytes.baseAddress!, encryptedData.count,
                            &numBytesEncrypted
                        )
                    }
                }
            }
        }

        guard cryptStatus == kCCSuccess else {
            return nil
        }

        encryptedData.removeSubrange(numBytesEncrypted..<encryptedData.count)
        let ivAndEncryptedData = iv + encryptedData
        return ivAndEncryptedData.base64EncodedString()
    }

    static func decrypt(_ encryptedData: String) -> String? {
        let key = generateKey(from: secretKey)
        let encryptedData = Data(base64Encoded: encryptedData)!
        let iv = encryptedData.prefix(ivLength)
        let dataToDecrypt = encryptedData.dropFirst(ivLength)

        var decryptedData = Data(count: dataToDecrypt.count + kCCBlockSizeAES128)
        var numBytesDecrypted: size_t = 0

        let cryptStatus = key.withUnsafeBytes { keyBytes in
            iv.withUnsafeBytes { ivBytes in
                dataToDecrypt.withUnsafeBytes { dataBytes in
                    decryptedData.withUnsafeMutableBytes { decryptedBytes in
                        CCCrypt(
                            CCOperation(kCCDecrypt),
                            CCAlgorithm(kCCAlgorithmAES),
                            CCOptions(kCCOptionPKCS7Padding),
                            keyBytes.baseAddress!, kCCKeySizeAES256,
                            ivBytes.baseAddress!,
                            dataBytes.baseAddress!, dataToDecrypt.count,
                            decryptedBytes.baseAddress!, decryptedData.count,
                            &numBytesDecrypted
                        )
                    }
                }
            }
        }

        guard cryptStatus == kCCSuccess else {
            return nil
        }

        decryptedData.removeSubrange(numBytesDecrypted..<decryptedData.count)
        return String(data: decryptedData, encoding: .utf8)
    }
}
```
