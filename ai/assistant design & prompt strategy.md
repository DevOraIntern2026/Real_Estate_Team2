# DEVORA Real Estate
## AI Property Assistant — Week 1 Deliverables
### AI Assistant Design & Prompt Strategy

**Project:** Real Estate — Property Buying, Selling & Renting  
**Team:** Team 2  
**Phase:** Week 1 - Foundation  
**AI Scope:** AI Property Assistant — Recommendation Only

---

## 1. Feature Overview

The AI Property Assistant helps users find relevant properties using natural language. The AI Assistant is responsible for understanding the user's request, extracting structured preferences, and preparing them for backend property matching.

### Important Business Rule (Constraint)
The AI Assistant is **recommendation-only**. It must **not**:
- Automatically publish, buy, or rent a property.
- Perform transactions on behalf of the user.
- Replace the normal manual property search.

*Fallback:* If the AI service is unavailable, users must still be able to use the normal manual search functionality.

---

## 2. AI User Flow

```text
User Input → Preference Extraction → Preference Validation → Property Matching (Backend) → Recommendation Ranking → AI Recommendations (UI) → User Review → Property Details → Inquiry
```

---

## 3. Preference Extraction Schema

The AI will convert natural language into a structured JSON preference object.

### Target Schema

```json
{
  "transactionType": "rent",
  "propertyType": "apartment",
  "location": "New Cairo",
  "minPrice": null,
  "maxPrice": 20000,
  "bedrooms": 2,
  "bathrooms": null,
  "minArea": null,
  "maxArea": null,
  "furnished": null,
  "preferences": {
    "quietArea": true,
    "nearUniversity": true,
    "parking": null,
    "balcony": null
  }
}
```

---

## 4. Extraction Rules & Clarification Strategy

### Extraction Rules:
1. **No Invention:** If the user does not provide a value, return `null`. Do not guess prices, locations, or features.
2. **Intent Preservation:** E.g., "up to 20,000" → `maxPrice = 20000`.
3. **Hard vs. Soft Preferences:** Separate strict filters (budget, location, bedrooms) from soft preferences (quiet area, balcony) used for ranking.
4. **Structured Output:** Always return JSON; never free-form conversational text unless asking a clarification question.

### Clarification Strategy:
The AI should ask a clarification question *only* when the request lacks vital information to perform a useful search.
*   **User:** "I need an apartment."
*   **Assistant:** "Are you looking to rent or buy, and which area would you prefer?"

---

## 5. System Prompt Strategy

```text
You are an AI assistant for the DEVORA real estate platform.
Your task is to understand the user's property request and extract their preferences into the required structured JSON format.

Rules:
1. Do not invent property information, prices, locations, or features.
2. If a value is not provided, return null.
3. Preserve the user's explicit requirements (min/max bounds).
4. Identify whether the user wants to rent or buy when possible.
5. Extract property type, location, budget, bedrooms, bathrooms, area, furnishing, and supported additional preferences.
6. If the request is highly ambiguous, set "needsClarification": true and provide a short "clarificationQuestion".
7. Return valid JSON data ONLY.
8. You are a recommendation assistant; refuse to perform buying, renting, or publishing actions.
```

---

## 6. AI Input / Output Contract

### API Endpoint (Proposed): `POST /api/ai/recommend`

**Input Payload:**
```json
{
  "message": "I need a 2-bedroom apartment for rent in New Cairo under 20000."
}
```

**Output Payload (Successful Extraction):**
```json
{
  "preferences": {
    "transactionType": "rent",
    "propertyType": "apartment",
    "location": "New Cairo",
    "minPrice": null,
    "maxPrice": 20000,
    "bedrooms": 2,
    "preferences": {}
  },
  "needsClarification": false,
  "clarificationQuestion": null
}
```

---

## 7. Recommendation Flow & Architecture

The backend remains the **source of truth**. The AI does not decide which properties exist.

1. **AI Service:** Extracts preferences, handles ambiguity, produces JSON.
2. **Backend (Node.js):** Validates JSON, queries the database, filters properties, ranks matches based on scores (Location + Budget + Soft Preferences), and returns real property records.

---

## 8. Error Handling & Fallback

*   **AI Service Down:** UI displays fallback message ("AI assistant is currently unavailable") and redirects to manual search.
*   **Invalid AI Output:** Backend validates the JSON. If invalid, the backend rejects it gracefully.
*   **No Matches:** Backend returns empty array. UI displays: "No properties matched all of your preferences. Try modifying your search."
*   **Unsupported Actions (e.g., "Buy this for me"):** AI refuses and directs the user to the manual inquiry button.

---

## 9. Test Cases for Validation

*Below are key test cases to validate the AI extraction logic before integration (AI 2).*

| Test Case | User Input | Expected JSON Outcome |
| :--- | :--- | :--- |
| **01 - Basic Rent** | "I need a 2-bedroom apartment for rent in New Cairo." | `transactionType: "rent"`, `propertyType: "apartment"`, `bedrooms: 2`, `location: "New Cairo"` |
| **02 - Max Budget** | "...maximum of 20000 EGP." | `maxPrice: 20000` |
| **03 - Clarification** | "I need an apartment." | `needsClarification: true`, `clarificationQuestion: "Are you looking to rent or buy...?"` |
| **04 - Soft Prefs** | "...preferably in a quiet area with parking." | `preferences: { quietArea: true, parking: true }` |
| **05 - Range** | "...between 15000 and 22000 EGP." | `minPrice: 15000`, `maxPrice: 22000` |
| **06 - Out of Scope**| "Publish my apartment on the platform." | AI refuses action, suggests manual workflow. |

---

## 10. Week 1 Definition of Done (Achieved)

- [x] AI feature scope and constraints defined.
- [x] AI user flow documented.
- [x] Preference extraction JSON schema created.
- [x] System prompt strategy finalized.
- [x] Clarification and Edge-case behavior defined.
- [x] I/O API contract drafted for Backend integration.
- [x] Test cases prepared.

**Next Steps (Week 2):** Confirm AI technology (e.g., Gemini API), finalize endpoints with Backend 3, and begin API integration and testing.