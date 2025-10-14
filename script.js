// Alphabet-Mapping für Verschlüsselung (A=Z, B=Y, etc.)
const alphabetMap = {
    'A': 'Z', 'B': 'Y', 'C': 'X', 'D': 'W', 'E': 'V', 'F': 'U', 'G': 'T', 'H': 'S', 'I': 'R', 'J': 'Q',
    'K': 'P', 'L': 'O', 'M': 'N', 'N': 'M', 'O': 'L', 'P': 'K', 'Q': 'J', 'R': 'I', 'S': 'H', 'T': 'G',
    'U': 'F', 'V': 'E', 'W': 'D', 'X': 'C', 'Y': 'B', 'Z': 'A',
    'a': 'z', 'b': 'y', 'c': 'x', 'd': 'w', 'e': 'v', 'f': 'u', 'g': 't', 'h': 's', 'i': 'r', 'j': 'q',
    'k': 'p', 'l': 'o', 'm': 'n', 'n': 'm', 'o': 'l', 'p': 'k', 'q': 'j', 'r': 'i', 's': 'h', 't': 'g',
    'u': 'f', 'v': 'e', 'w': 'd', 'x': 'c', 'y': 'b', 'z': 'a',
    'Ä': 'Ü', 'Ö': 'Ä', 'Ü': 'Ö', 'ä': 'ü', 'ö': 'ä', 'ü': 'ö'
};

// Sonderzeichen-Mapping für finale Verschlüsselung
const specialCharMap = {
    'A': '§', 'B': '€', 'C': '£', 'D': '¥', 'E': '¢', 'F': '¤', 'G': '¦', 'H': '¨', 'I': '©', 'J': 'ª',
    'K': '«', 'L': '¬', 'M': '®', 'N': '¯', 'O': '°', 'P': '±', 'Q': '²', 'R': '³', 'S': '´', 'T': 'µ',
    'U': '¶', 'V': '·', 'W': '¸', 'X': '¹', 'Y': 'º', 'Z': '»',
    'a': '¼', 'b': '½', 'c': '¾', 'd': '¿', 'e': 'À', 'f': 'Á', 'g': 'Â', 'h': 'Ã', 'i': 'Ä', 'j': 'Å',
    'k': 'Æ', 'l': 'Ç', 'm': 'È', 'n': 'É', 'o': 'Ê', 'p': 'Ë', 'q': 'Ì', 'r': 'Í', 's': 'Î', 't': 'Ï',
    'u': 'Ð', 'v': 'Ñ', 'w': 'Ò', 'x': 'Ó', 'y': 'Ô', 'z': 'Õ',
    'Ä': 'Ö', 'Ö': '×', 'Ü': 'Ø', 'ä': 'Ù', 'ö': 'Ú', 'ü': 'Û',
    ' ': 'Ý'  // Leerzeichen wird zu Ý
};

// Umgekehrte Mappings für Entschlüsselung
const reverseAlphabetMap = {};
const reverseSpecialCharMap = {};

// Erstelle umgekehrte Mappings
Object.keys(alphabetMap).forEach(key => {
    reverseAlphabetMap[alphabetMap[key]] = key;
});

Object.keys(specialCharMap).forEach(key => {
    reverseSpecialCharMap[specialCharMap[key]] = key;
});

// Verschlüsselungsfunktion
function encrypt(text) {
    if (!text) return '';
    
    // Schritt 1: Text umkehren
    let reversed = text.split('').reverse().join('');
    
    // Schritt 2: Alphabet-Tausch
    let alphabetSwapped = '';
    for (let char of reversed) {
        if (alphabetMap[char]) {
            alphabetSwapped += alphabetMap[char];
        } else {
            alphabetSwapped += char; // Behalte andere Zeichen bei
        }
    }
    
    // Schritt 3: Sonderzeichen-Mapping
    let encrypted = '';
    for (let char of alphabetSwapped) {
        if (specialCharMap[char]) {
            encrypted += specialCharMap[char];
        } else {
            encrypted += char; // Behalte andere Zeichen bei
        }
    }
    
    return encrypted;
}

// Entschlüsselungsfunktion
function decrypt(encryptedText) {
    if (!encryptedText) return '';
    
    // Schritt 1: Sonderzeichen zurück zu Buchstaben
    let fromSpecialChars = '';
    for (let char of encryptedText) {
        if (reverseSpecialCharMap[char]) {
            fromSpecialChars += reverseSpecialCharMap[char];
        } else {
            fromSpecialChars += char; // Behalte andere Zeichen bei
        }
    }
    
    // Schritt 2: Alphabet-Tausch rückgängig machen
    let fromAlphabetSwap = '';
    for (let char of fromSpecialChars) {
        if (reverseAlphabetMap[char]) {
            fromAlphabetSwap += reverseAlphabetMap[char];
        } else {
            fromAlphabetSwap += char; // Behalte andere Zeichen bei
        }
    }
    
    // Schritt 3: Text wieder umkehren
    let decrypted = fromAlphabetSwap.split('').reverse().join('');
    
    return decrypted;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const encryptInput = document.getElementById('encrypt-input');
    const encryptOutput = document.getElementById('encrypt-output');
    const encryptBtn = document.getElementById('encrypt-btn');
    const copyEncryptBtn = document.getElementById('copy-encrypt');
    
    const decryptInput = document.getElementById('decrypt-input');
    const decryptOutput = document.getElementById('decrypt-output');
    const decryptBtn = document.getElementById('decrypt-btn');
    const copyDecryptBtn = document.getElementById('copy-decrypt');
    
    // Verschlüsselung
    encryptBtn.addEventListener('click', function() {
        const text = encryptInput.value;
        const encrypted = encrypt(text);
        encryptOutput.value = encrypted;
        
        // Animation für Feedback
        encryptBtn.classList.add('success-animation');
        setTimeout(() => {
            encryptBtn.classList.remove('success-animation');
        }, 300);
    });
    
    // Entschlüsselung
    decryptBtn.addEventListener('click', function() {
        const text = decryptInput.value;
        const decrypted = decrypt(text);
        decryptOutput.value = decrypted;
        
        // Animation für Feedback
        decryptBtn.classList.add('success-animation');
        setTimeout(() => {
            decryptBtn.classList.remove('success-animation');
        }, 300);
    });
    
    // Copy-Funktionen
    copyEncryptBtn.addEventListener('click', function() {
        if (encryptOutput.value) {
            navigator.clipboard.writeText(encryptOutput.value).then(() => {
                showCopyFeedback(copyEncryptBtn);
            });
        }
    });
    
    copyDecryptBtn.addEventListener('click', function() {
        if (decryptOutput.value) {
            navigator.clipboard.writeText(decryptOutput.value).then(() => {
                showCopyFeedback(copyDecryptBtn);
            });
        }
    });
    
    // Enter-Taste für Verschlüsselung/Entschlüsselung
    encryptInput.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            encryptBtn.click();
        }
    });
    
    decryptInput.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            decryptBtn.click();
        }
    });
    
    // Auto-Verschlüsselung bei Eingabe (optional)
    encryptInput.addEventListener('input', function() {
        const text = encryptInput.value;
        if (text.length > 0) {
            const encrypted = encrypt(text);
            encryptOutput.value = encrypted;
        } else {
            encryptOutput.value = '';
        }
    });
    
    // Auto-Entschlüsselung bei Eingabe (optional)
    decryptInput.addEventListener('input', function() {
        const text = decryptInput.value;
        if (text.length > 0) {
            const decrypted = decrypt(text);
            decryptOutput.value = decrypted;
        } else {
            decryptOutput.value = '';
        }
    });
});

// Copy-Feedback Funktion
function showCopyFeedback(button) {
    button.classList.add('copied');
    setTimeout(() => {
        button.classList.remove('copied');
    }, 2000);
}

// Zusätzliche Utility-Funktionen
function clearAll() {
    document.getElementById('encrypt-input').value = '';
    document.getElementById('encrypt-output').value = '';
    document.getElementById('decrypt-input').value = '';
    document.getElementById('decrypt-output').value = '';
}

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+Shift+C für alles löschen
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        clearAll();
    }
});
