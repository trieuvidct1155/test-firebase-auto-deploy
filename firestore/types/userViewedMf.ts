export interface IUserViewedMf {
    user_id: string;
    mutual_fund: string;
    created_at: number;
    updated_at: number;
}

export const IndexCollection = {
    "collectionGroup": "stories",
    "queryScope": "COLLECTION",
    "fields": [
      {
        "fieldPath": "authorName",
        "order": "ASCENDING"
      },
      { "fieldPath": "timestamp", "order": "DESCENDING" }
    ]
  }