# 🛂 Passport Expiry Validation Feature

## 📋 Feature Request
Validate that uploaded passports have at least **6 months of validity remaining** before accepting them.

## ✅ Implementation Plan

### How It Works:
1. **User uploads passport** (image or PDF)
2. **OCR extracts expiry date** from the document
3. **System validates**:
   - ✅ Passport not expired
   - ✅ At least 6 months validity remaining
4. **If invalid**: Show error, reject upload
5. **If valid**: Proceed with KYC

---

## 🔍 Technical Approach

### Date Extraction:
The system will look for common passport date formats:
- `DD MMM YYYY` (e.g., "15 JAN 2030")
- `DD/MM/YYYY` (e.g., "15/01/2030")
- `DDMMMYYYY` (e.g., "15JAN2030")

### Validation Logic:
```javascript
Today: 09 Dec 2024
6 months from now: 09 Jun 2025
Passport expires: 15 Jan 2030

✅ Valid: Expires after 09 Jun 2025
❌ Invalid: Expires before 09 Jun 2025
```

---

## 📊 Validation Scenarios

### Scenario 1: Expired Passport
```
Expiry: 15 Jan 2023
Today: 09 Dec 2024
Result: ❌ "Passport has expired on 15/01/2023. Please use a valid passport."
```

### Scenario 2: Less than 6 Months Validity
```
Expiry: 15 Mar 2025
Today: 09 Dec 2024
6 months from now: 09 Jun 2025
Result: ❌ "Passport expires in 3 month(s) on 15/03/2025. Minimum 6 months validity required."
```

### Scenario 3: Valid Passport
```
Expiry: 15 Jan 2030
Today: 09 Dec 2024
6 months from now: 09 Jun 2025
Result: ✅ "Passport has sufficient validity"
```

### Scenario 4: Cannot Read Date
```
OCR cannot extract date
Result: ❌ "Could not read passport expiry date. Please ensure the document is clear and try again."
```

---

## 🎯 User Experience

### Upload Flow:
1. User selects "Passport" as document type
2. Uploads passport image/PDF
3. **System processes**:
   - Quality check
   - OCR extraction
   - **Expiry validation** ← NEW!
4. Shows result:
   - ✅ Green checkmark if valid
   - ❌ Red error if invalid with specific reason

### Error Messages:
- **Expired**: "Passport has expired on [DATE]. Please use a valid passport."
- **Insufficient validity**: "Passport expires in [X] month(s) on [DATE]. Minimum 6 months validity required."
- **Cannot read**: "Could not read passport expiry date. Please ensure the document is clear and try again."

---

## 💡 Benefits

1. **Compliance**: Ensures passports meet validity requirements
2. **Early detection**: Catches invalid passports before submission
3. **Better UX**: Clear error messages guide users
4. **Reduced rejections**: Prevents submissions with soon-to-expire passports

---

## 🔧 Implementation Status

**Current Status**: Code written, needs to be applied

**Next Steps**:
1. Fix ScanDocument.jsx file (currently corrupted)
2. Add passport expiry validation function
3. Integrate into document validation flow
4. Test with sample passports

---

## 🧪 Testing Checklist

- [ ] Valid passport (>6 months) - Should accept
- [ ] Passport with 3 months validity - Should reject
- [ ] Expired passport - Should reject
- [ ] Passport with unclear date - Should show error
- [ ] Different date formats - Should extract correctly

---

## ⚠️ Important Note

**Before implementing this feature**, please:
1. **Refresh your browser** to fix the localStorage data persistence
2. **Test the current KYC flow** to ensure it works
3. Then we can add the passport validation

The ScanDocument.jsx file needs to be restored first before adding this feature.

---

**This feature will significantly improve the quality of passport submissions!** 🎉
